import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
        }

        // 1. Fetch basic vendor stats (city, category, profile_views)
        const vendorRes = await supabaseRestGet(`/rest/v1/vendors?id=eq.${vendorId}&select=city,category,profile_views,search_appearances`);
        const vendor = Array.isArray(vendorRes) ? vendorRes[0] : null;

        // 2. Count enquiries
        const enquiriesRes = await supabaseRestGet(`/rest/v1/enquiries?vendor_id=eq.${vendorId}&select=id`);
        const enquiriesCount = Array.isArray(enquiriesRes) ? enquiriesRes.length : 0;


        // 3. Count leads (clicks on contact/navigate) - Placeholder for now
        // In a real app, you'd have an activity_logs table for these specific clicks
        const leadsCount = Math.floor(enquiriesCount * 1.5); 

        // 4. Get area-wide stats from search_logs for "Users in 1KM" simulation
        const city = vendor?.city || 'Amritsar';
        const category = vendor?.category || '';
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const areaLogs = await supabaseRestGet(`/rest/v1/search_logs?location_city=ilike.${city}&searched_at=gte.${thirtyDaysAgo.toISOString()}&select=id,search_query`);
        const totalAreaSearches = Array.isArray(areaLogs) ? areaLogs.length : 0;
        
        const categorySearches = Array.isArray(areaLogs) 
            ? areaLogs.filter((log: any) => log.search_query?.toLowerCase().includes(category.toLowerCase())).length 
            : 0;

        // 5. Aggregate top 5 trending searches in this city
        const counts: Record<string, number> = {};
        if (Array.isArray(areaLogs)) {
            areaLogs.forEach((log: any) => {
                const q = log.search_query?.toLowerCase().trim();
                if (q) {
                    counts[q] = (counts[q] || 0) + 1;
                }
            });
        }

        const trendingSearches = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }));

        return NextResponse.json({
            success: true,
            stats: {
                leads: leadsCount,
                views: vendor?.profile_views || 0,
                enquiries: enquiriesCount,
                calls: Math.floor(leadsCount * 0.4),
                whatsapp: Math.floor(leadsCount * 0.6),
                searchAppearances: vendor?.search_appearances || 0,
                areaUsers: Math.max(totalAreaSearches * 5, 450), // Simulation multiplier
                activeUsers: Math.max(totalAreaSearches, 120),
                categorySearches: Math.max(categorySearches, 45),
            },
            trendingSearches
        });

    } catch (error: any) {
        console.error('Performance analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
