import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const city = searchParams.get('city');
    const circle = searchParams.get('circle');
    const category = searchParams.get('category');
    const format = searchParams.get('format') || 'vendors'; // 'vendors', 'products', 'suggestions'
    const limit = parseInt(searchParams.get('limit') || '20');
    const verified = searchParams.get('verified') === 'true';

    // Handle "Mega Savings" (q=megasavings)
    if (query === 'megasavings') {
      const data = await supabaseRestGet(
        `/rest/v1/vendor_products?select=*,vendors(id,name,city,circle)&order=price.asc&limit=${limit}`
      );
      let filtered = data || [];
      if (city) filtered = filtered.filter(p => p.vendors?.city === city);
      if (circle) filtered = filtered.filter(p => p.vendors?.circle === circle);
      return NextResponse.json({ results: filtered });
    }

    // Handle "Price Drops" (q=pricedrops)
    if (query === 'pricedrops') {
      const data = await supabaseRestGet(
        `/rest/v1/vendor_products?select=*,vendors(id,name,city,circle)&limit=${limit}`
      );
      const withDrops = (data || []).filter(p => p.mrp > p.price);
      return NextResponse.json({ results: withDrops });
    }

    // Handle "Offers" (q=offers)
    if (query === 'offers') {
      const data = await supabaseRestGet(
        `/rest/v1/vendor_products?select=*,vendors(id,name,city,circle)&limit=${limit}`
      );
      // For now just return some products as "offers"
      return NextResponse.json({ results: data || [] });
    }

    // General Search
    if (format === 'products') {
      let productQuery = `/rest/v1/vendor_products?select=*,vendors(id,name,city,circle)&limit=${limit}`;
      if (query) productQuery += `&name=ilike.*${encodeURIComponent(query)}*`;
      const products = await supabaseRestGet(productQuery);
      return NextResponse.json({ results: products || [] });
    } else {
      // Vendors
      let vendorQuery = `/rest/v1/vendors?select=*&limit=${limit}`;
      
      const filters = [];
      if (query && query !== 'all') {
        filters.push(`or=(name.ilike.*${encodeURIComponent(query)}*,category.ilike.*${encodeURIComponent(query)}*)`);
      }
      if (category && category !== 'All') {
        filters.push(`category=eq.${encodeURIComponent(category)}`);
      }
      if (city && city !== 'All') {
        filters.push(`city=eq.${encodeURIComponent(city)}`);
      }
      if (circle && circle !== 'All') {
        filters.push(`circle=eq.${encodeURIComponent(circle)}`);
      }
      if (verified) {
        filters.push('is_verified=eq.true');
      }

      if (filters.length > 0) {
        vendorQuery += `&${filters.join('&')}`;
      }
      
      const vendors = await supabaseRestGet(vendorQuery);
      return NextResponse.json({ 
        results: vendors || [],
        vendors: vendors || [], // Compatibility with mobile HomeScreen
        pagination: { total: vendors?.length || 0 }
      });
    }

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
