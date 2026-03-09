import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        // 1. Fetch Categories for mapping
        const allCategories = await supabaseRestGet('/rest/v1/categories?select=*').catch(() => []);
        const catMap: Record<string, string> = {};
        if (Array.isArray(allCategories)) {
            allCategories.forEach(c => {
                catMap[c.id] = c.name;
            });
        }

        if (!query) {
            const vendors = await supabaseRestGet(`/rest/v1/vendors?select=*&status=eq.Active&order=created_at.desc&limit=20`);
            return NextResponse.json({
                results: (vendors || []).map((v: any) => ({
                    ...v,
                    category_name: catMap[v.category_id] || v.category || 'General'
                }))
            });
        }

        const lowerQuery = query.toLowerCase().trim();
        const words = lowerQuery.split(/\s+/).filter(w => w.length > 1);

        // If query is empty after cleanup, fallback to recent
        if (words.length === 0 && !lowerQuery) {
            const vendors = await supabaseRestGet(`/rest/v1/vendors?select=*&status=eq.Active&order=created_at.desc&limit=20`);
            return NextResponse.json({
                results: (vendors || []).map((v: any) => ({
                    ...v,
                    category_name: catMap[v.category_id] || v.category || 'General'
                }))
            });
        }

        // Build a broad search pattern
        const pattern = `%${lowerQuery.replace(/\s+/g, '%')}%`;
        const encodedPattern = encodeURIComponent(pattern);

        let vendorQuery = `/rest/v1/vendors?select=*&status=eq.Active`;

        // Special Keyword: Verified
        if (lowerQuery === 'verified') {
            vendorQuery += `&is_verified=eq.true`;
        } else {
            vendorQuery += `&or=(name.ilike.${encodedPattern},category.ilike.${encodedPattern},address.ilike.${encodedPattern},city.ilike.${encodedPattern},state.ilike.${encodedPattern})`;
        }

        const vendorResults = await supabaseRestGet(vendorQuery).catch(err => {
            console.error('Vendor search error:', err);
            return [];
        });

        // 3. Search products by Name and join vendor info
        // Correct syntax: name=ilike.%pattern%
        const productResults = await supabaseRestGet(
            `/rest/v1/vendor_products?select=*,vendors(*)&name=ilike.${encodedPattern}&is_active=eq.true`
        ).catch(err => {
            console.error('Product search error:', err);
            return [];
        });

        // Normalize and combine
        const seen = new Set();
        const results: any[] = [];

        // Helper to normalize vendor data based on verified schema
        const normalizeVendor = (v: any) => ({
            ...v,
            imageUrl: v.image_url || v.shop_front_photo_url || v.profile_image_url || '',
            category_name: catMap[v.category_id] || v.category || 'General',
            rating: v.rating || 0,
            owner_name: v.owner_name || v.owner || ''
        });

        if (Array.isArray(vendorResults)) {
            vendorResults.forEach((v: any) => {
                if (v && v.id && !seen.has(v.id)) {
                    seen.add(v.id);
                    results.push(normalizeVendor(v));
                }
            });
        }

        if (Array.isArray(productResults)) {
            productResults.forEach((p: any) => {
                const v = p.vendors;
                if (v && v.id && !seen.has(v.id)) {
                    seen.add(v.id);
                    results.push(normalizeVendor(v));
                }
            });
        }

        return NextResponse.json({
            results,
            query: lowerQuery,
            count: results.length
        });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack
        }, { status: 500 });
    }
}
