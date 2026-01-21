import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

// GET /api/reports/search - Get search reports
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const state = searchParams.get('state');
        const city = searchParams.get('city');

        let query = '/rest/v1/search_logs?select=search_query,location_state,location_city,location_town,searched_at';

        // Build query with filters
        const filters = [];
        if (state) {
            filters.push(`location_state=eq.${encodeURIComponent(state)}`);
        }
        if (city) {
            filters.push(`location_city=eq.${encodeURIComponent(city)}`);
        }

        if (filters.length > 0) {
            query += '&' + filters.join('&');
        }

        let logs = [];
        try {
            logs = await supabaseRestGet(query);
            logs = Array.isArray(logs) ? logs : [];
        } catch (e) {
            console.warn('search_logs table may not exist or is empty:', e.message);
            logs = [];
        }

        // Aggregate by search query
        const searchCounts = {};
        logs.forEach(log => {
            const key = log.search_query.toLowerCase().trim();
            if (!searchCounts[key]) {
                searchCounts[key] = {
                    product: log.search_query,
                    count: 0,
                    locations: new Set(),
                };
            }
            searchCounts[key].count++;
            if (log.location_state) searchCounts[key].locations.add(log.location_state);
            if (log.location_city) searchCounts[key].locations.add(log.location_city);
        });

        // Convert to array and sort
        const topSearches = Object.values(searchCounts)
            .map(item => ({
                product: item.product,
                count: item.count,
                location: Array.from(item.locations)[0] || 'N/A',
                trend: '+0%', // Calculate trend if you have historical data
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return NextResponse.json(topSearches);
    } catch (error) {
        console.error('Error fetching search reports:', error);
        // Return empty array instead of error to allow UI to load
        return NextResponse.json([]);
    }
}
