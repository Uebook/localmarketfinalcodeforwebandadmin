import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('city');

        if (!city) {
            return NextResponse.json({ error: 'City is required' }, { status: 400 });
        }

        // Fetch top searches for the city in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Supabase REST doesn't support complex aggregations directly via simple path
        // We'll fetch the logs and group them here, or use a RPC if available.
        // Assuming we fetch a reasonable amount of logs for the city
        const query = `/rest/v1/search_logs?location_city=ilike.${city}&searched_at=gte.${thirtyDaysAgo.toISOString()}&select=search_query`;

        const logs = await supabaseRestGet(query);

        // Group and count
        const counts: Record<string, number> = {};
        logs.forEach((log: any) => {
            const q = log.search_query.toLowerCase().trim();
            if (q) {
                counts[q] = (counts[q] || 0) + 1;
            }
        });

        const trending = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }));

        return NextResponse.json({ trending });
    } catch (error) {
        console.error('Trending fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch trending searches' }, { status: 500 });
    }
}
