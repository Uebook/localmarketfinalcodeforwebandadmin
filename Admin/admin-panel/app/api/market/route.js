import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Market name is required' }, { status: 400 });
    }

    // Get vendors in this circle
    const vendors = await supabaseRestGet(`/rest/v1/vendors?circle=eq.${encodeURIComponent(name)}`);
    
    // Get products in this circle (via vendors)
    const vendorIds = (vendors || []).map(v => v.id);
    let products = [];
    if (vendorIds.length > 0) {
      products = await supabaseRestGet(`/rest/v1/vendor_products?vendor_id=in.(${vendorIds.join(',')})`);
    }

    return NextResponse.json({
      success: true,
      vendors: vendors || [],
      products: products || []
    });
  } catch (error) {
    console.error('Market API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
