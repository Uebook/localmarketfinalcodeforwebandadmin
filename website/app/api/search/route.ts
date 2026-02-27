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

        const lowerQuery = query.toLowerCase();

        // 2. Search vendors by Name or Category (using ilike)
        // We search in 'name' and 'category' (text field)
        const vendorResults = await supabaseRestGet(
            `/rest/v1/vendors?select=*&status=eq.Active&or=(name.ilike.*${lowerQuery}*,category.ilike.*${lowerQuery}*)`
        ).catch(err => {
            console.error('Vendor search error:', err);
            return [];
        });

        // 3. Search products by Name and join vendor info
        // We know vendor_products has a relationship with vendors
        const productResults = await supabaseRestGet(
            `/rest/v1/vendor_products?select=*,vendors(*)&name.ilike.*${lowerQuery}*`
        ).catch(err => {
            console.error('Product search error:', err);
            return [];
        });

        // Normalize and combine
        const seen = new Set();
        const results: any[] = [];

        // Add vendors from vendor search
        if (Array.isArray(vendorResults)) {
            vendorResults.forEach((v: any) => {
                if (v && v.id && !seen.has(v.id)) {
                    seen.add(v.id);
                    results.push({
                        ...v,
                        imageUrl: v.profile_image_url || v.image_url || v.shop_front_photo_url || '',
                        category_name: catMap[v.category_id] || v.category || 'General'
                    });
                }
            });
        }

        // Add vendors from product search
        if (Array.isArray(productResults)) {
            productResults.forEach((p: any) => {
                const v = p.vendors;
                if (v && v.id && !seen.has(v.id)) {
                    seen.add(v.id);
                    results.push({
                        ...v,
                        imageUrl: v.profile_image_url || v.image_url || v.shop_front_photo_url || '',
                        category_name: catMap[v.category_id] || v.category || 'General'
                    });
                }
            });
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Search API Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.stack
        }, { status: 500 });
    }
}
