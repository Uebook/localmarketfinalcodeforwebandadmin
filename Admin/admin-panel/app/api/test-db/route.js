import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';
export const dynamic = 'force-dynamic';
export async function GET() {
  const data = await supabaseRestGet('/rest/v1/notifications?limit=1');
  return NextResponse.json({ success: true, data });
}
