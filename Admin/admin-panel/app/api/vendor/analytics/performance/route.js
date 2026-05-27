import { NextResponse } from 'next/server';
import { supabaseRestGet } from '../../../../../lib/supabaseAdminFetch';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
        }

        // 0. Fetch vendor details for location and category context
        const vendors = await supabaseRestGet(`/rest/v1/vendors?id=eq.${encodeURIComponent(vendorId)}&select=city,category&limit=1`).catch(() => []);
        const vendor = vendors?.[0] || {};
        const vendorCity = vendor.city || 'Amritsar';
        const vendorCategory = vendor.category || '';

        // 1. Fetch leads (calls, WhatsApp clicks) from vendor_leads table
        const leadsQuery = `/rest/v1/vendor_leads?vendor_id=eq.${encodeURIComponent(vendorId)}&select=*`;
        const leads = await supabaseRestGet(leadsQuery).catch(() => []);

        // 2. Fetch views (profile visits) from vendor_views table
        const viewsQuery = `/rest/v1/vendor_views?vendor_id=eq.${encodeURIComponent(vendorId)}&select=*`;
        const views = await supabaseRestGet(viewsQuery).catch(() => []);

        // 3. Fetch enquiry count from vendor_enquiries
        const enquiriesQuery = `/rest/v1/vendor_enquiries?vendor_id=eq.${encodeURIComponent(vendorId)}&select=id`;
        const enquiries = await supabaseRestGet(enquiriesQuery).catch(() => []);

        // 4. Fetch Users Nearby (users in the same city)
        const areaUsersQuery = `/rest/v1/users?city=ilike.${encodeURIComponent('%' + vendorCity + '%')}&select=id`;
        const areaUsersList = await supabaseRestGet(areaUsersQuery).catch(() => []);
        const areaUsers = areaUsersList.length;

        // 5. Fetch Active Searches (searches in this city in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeSearchesQuery = `/rest/v1/search_logs?location_city=ilike.${encodeURIComponent('%' + vendorCity + '%')}&searched_at=gte.${thirtyDaysAgo.toISOString()}&select=id`;
        const activeSearchesList = await supabaseRestGet(activeSearchesQuery).catch(() => []);
        const activeUsers = activeSearchesList.length;

        // 6. Fetch Category Interest (searches containing category name or vendor's product names)
        const productsQuery = `/rest/v1/vendor_products?vendor_id=eq.${encodeURIComponent(vendorId)}&select=name`;
        const products = await supabaseRestGet(productsQuery).catch(() => []);
        
        const cityLogsQuery = `/rest/v1/search_logs?location_city=ilike.${encodeURIComponent('%' + vendorCity + '%')}&searched_at=gte.${thirtyDaysAgo.toISOString()}&select=search_query`;
        const cityLogs = await supabaseRestGet(cityLogsQuery).catch(() => []);
        
        let categorySearches = 0;
        const lowerCategory = vendorCategory.toLowerCase().trim();
        const productNames = products.map(p => p.name?.toLowerCase().trim()).filter(Boolean);

        cityLogs.forEach(log => {
            const queryText = log.search_query?.toLowerCase().trim() || '';
            if (queryText) {
                if (lowerCategory && (queryText.includes(lowerCategory) || lowerCategory.includes(queryText))) {
                    categorySearches++;
                } else {
                    const matchesProduct = productNames.some(prodName => 
                        queryText.includes(prodName) || prodName.includes(queryText)
                    );
                    if (matchesProduct) {
                        categorySearches++;
                    }
                }
            }
        });

        // Process stats (group by type)
        const stats = {
            leads: leads.length,
            views: views.length,
            enquiries: enquiries.length,
            calls: leads.filter(l => l.type === 'call').length,
            whatsapp: leads.filter(l => l.type === 'whatsapp').length,
            recentLeads: leads.slice(0, 5),
            areaUsers,
            activeUsers,
            categorySearches
        };

        return NextResponse.json({ success: true, stats });
    } catch (error) {
        console.error('Vendor Performance API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
