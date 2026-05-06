import { supabaseRestGet, supabaseRestInsert, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

function toStr(v) {
    return typeof v === 'string' ? v.trim() : '';
}

function normalizeBrand(b) {
    return {
        id: b.id,
        name: b.name ?? '',
        logoUrl: b.logoUrl ?? b.logo_url ?? null,
        category: b.category ?? null,
        description: b.description ?? null,
        websiteUrl: b.websiteUrl ?? b.website_url ?? null,
        featured: b.featured ?? false,
        status: b.status ?? 'active',
        displayOrder: b.displayOrder ?? b.display_order ?? 0,
        createdAt: b.created_at,
        updatedAt: b.updated_at,
    };
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = toStr(searchParams.get('q'));

        const query = new URLSearchParams();
        query.set('select', '*');
        query.set('order', 'display_order.asc,name.asc');
        if (q) query.set('name', `ilike.*${q}*`);

        const rows = await supabaseRestGet(`/rest/v1/brands?${query.toString()}`);
        const brands = Array.isArray(rows) ? rows.map(normalizeBrand) : [];

        return Response.json({ brands }, { status: 200 });
    } catch (e) {
        console.error('Brands GET Error:', e);
        if (e.message && (e.message.includes('fetch failed') || e.message.includes('ENOTFOUND'))) {
            return Response.json({ brands: [], warning: 'offline_mode' }, { status: 200 });
        }
        return Response.json({ error: e?.message || 'Failed to load brands' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        if (body.name) {
            const brand = {
                name: toStr(body.name),
                logo_url: body.logoUrl || body.logo_url || null,
                category: body.category || null,
                description: body.description || null,
                website_url: body.websiteUrl || body.website_url || null,
                featured: body.featured === true || body.featured === 'true',
                status: body.status || 'active',
                display_order: body.displayOrder || body.display_order || 0,
            };

            const result = await supabaseRestInsert('/rest/v1/brands', [brand]);
            return Response.json({ success: true, brand: result[0] || result }, { status: 201 });
        }

        return Response.json({ error: 'Invalid request. Provide brand name.' }, { status: 400 });
    } catch (e) {
        console.error('Brands POST Error:', e);
        return Response.json({ error: e?.message || 'Failed to create brand' }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = toStr(searchParams.get('id'));
        const body = await req.json();

        if (!id) {
            return Response.json({ error: 'Brand ID is required' }, { status: 400 });
        }

        const updateData = {};
        if (body.name !== undefined) updateData.name = toStr(body.name);
        if (body.logoUrl !== undefined || body.logo_url !== undefined) updateData.logo_url = body.logoUrl || body.logo_url;
        if (body.category !== undefined) updateData.category = body.category;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.websiteUrl !== undefined || body.website_url !== undefined) updateData.website_url = body.websiteUrl || body.website_url;
        if (body.featured !== undefined) updateData.featured = body.featured === true || body.featured === 'true';
        if (body.status !== undefined) updateData.status = body.status;
        if (body.displayOrder !== undefined || body.display_order !== undefined) updateData.display_order = Number(body.displayOrder || body.display_order);

        const result = await supabaseRestPatch(`/rest/v1/brands?id=eq.${id}`, updateData);
        return Response.json({ success: true, brand: result[0] || result }, { status: 200 });
    } catch (e) {
        console.error('Brands PATCH Error:', e);
        return Response.json({ error: e?.message || 'Failed to update brand' }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = toStr(searchParams.get('id'));

        if (!id) {
            return Response.json({ error: 'Brand ID is required' }, { status: 400 });
        }

        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        const url = `${SUPABASE_URL}/rest/v1/brands?id=eq.${id}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
            },
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(`Delete failed: ${text || res.statusText}`);
        }

        return Response.json({ success: true, message: 'Brand deleted successfully' }, { status: 200 });
    } catch (e) {
        console.error('Brands DELETE Error:', e);
        return Response.json({ error: e?.message || 'Failed to delete brand' }, { status: 500 });
    }
}
