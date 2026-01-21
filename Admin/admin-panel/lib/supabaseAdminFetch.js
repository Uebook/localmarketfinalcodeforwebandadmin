/**
 * Minimal Supabase PostgREST helper for server-side route handlers.
 * Uses native fetch so we don't need extra dependencies in this repo.
 *
 * Required env vars (server-only):
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY (preferred) OR SUPABASE_ANON_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

function getKey() {
  // Service role is recommended for admin routes (keep server-side only).
  return SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
}

export function assertSupabaseEnv() {
  const key = getKey();
  if (!SUPABASE_URL || !key) {
    throw new Error(
      'Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables.'
    );
  }
}

export async function supabaseRestGet(pathWithQuery) {
  assertSupabaseEnv();
  const key = getKey();
  const url = `${SUPABASE_URL}${pathWithQuery}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    // Avoid caching admin data at the edge during dev
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase REST error (${res.status}): ${text || res.statusText}`);
  }

  return await res.json();
}

async function supabaseRestWrite(method, pathWithQuery, body, extraHeaders = {}) {
  assertSupabaseEnv();
  const key = getKey();
  const url = `${SUPABASE_URL}${pathWithQuery}`;

  const res = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Supabase REST error (${res.status}): ${text || res.statusText}`);
  }

  // Some write endpoints return empty body unless Prefer return=representation
  const text = await res.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function supabaseRestInsert(pathWithQuery, rows) {
  return await supabaseRestWrite('POST', pathWithQuery, rows, { Prefer: 'return=representation' });
}

export async function supabaseRestUpsert(pathWithQuery, rows) {
  // Use Prefer resolution=merge-duplicates for upsert behavior
  return await supabaseRestWrite('POST', pathWithQuery, rows, {
    Prefer: 'resolution=merge-duplicates,return=representation',
  });
}

export async function supabaseRestPatch(pathWithQuery, patchBody) {
  return await supabaseRestWrite('PATCH', pathWithQuery, patchBody, { Prefer: 'return=representation' });
}

