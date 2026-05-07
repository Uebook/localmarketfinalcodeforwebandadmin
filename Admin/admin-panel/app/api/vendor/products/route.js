import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestInsert } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const products = await supabaseRestGet(`/rest/v1/vendor_products?vendor_id=eq.${encodeURIComponent(vendorId)}`);
    return NextResponse.json({ products: products || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await supabaseRestInsert('/rest/v1/vendor_products', [body]);
    return NextResponse.json({ success: true, product: result[0] || result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
