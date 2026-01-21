import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

// GET /api/reports/search - Get search reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location'); // state, city, or town
    
    let query = '/rest/v1/search_logs?select=search_query,location_state,location_city,location_town,searched_at';
    
    if (location) {
      // Filter by location (simplified - you may want to enhance this)
      query += `&location_state=eq.${location}`;
    }
    
    const logs = await supabaseRestGet(query);
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
