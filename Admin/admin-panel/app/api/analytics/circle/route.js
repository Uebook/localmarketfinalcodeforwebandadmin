import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

// GET /api/analytics/circle - Get circle analytics data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const circle = searchParams.get('circle');

        // Get all circles from locations table
        let locations = [];
        try {
            locations = await supabaseRestGet('/rest/v1/locations?select=circle&circle=not.is.null');
        } catch (e) {
            console.error('Error fetching locations:', e.message);
            locations = [];
        }
        const uniqueCircles = [...new Set(locations.map(l => l.circle).filter(Boolean))];

        // Get search logs with all needed fields
        // Try to get location_circle, but fallback if column doesn't exist
        let allSearchLogs = [];
        try {
            allSearchLogs = await supabaseRestGet('/rest/v1/search_logs?select=location_circle,user_id,search_query,searched_at,location_state,location_city');
        } catch (e) {
            // If location_circle doesn't exist, try without it and derive circle from location data
            console.warn('location_circle column not found, trying alternative query:', e.message);
            try {
                const logsWithoutCircle = await supabaseRestGet('/rest/v1/search_logs?select=user_id,search_query,searched_at,location_state,location_city,location_town');
                // Map logs to include location_circle by looking up in locations table
                const locationMap = {};
                locations.forEach(loc => {
                    const key = `${loc.state || ''}_${loc.city || ''}_${loc.town || ''}`;
                    if (loc.circle) {
                        locationMap[key] = loc.circle;
                    }
                });

                allSearchLogs = logsWithoutCircle.map(log => ({
                    ...log,
                    location_circle: locationMap[`${log.location_state || ''}_${log.location_city || ''}_${log.location_town || ''}`] || null
                }));
            } catch (e2) {
                console.error('Error fetching search logs:', e2.message);
                // Return empty array if search_logs table doesn't exist
                allSearchLogs = [];
            }
        }

        // Count unique users per circle from search logs
        const usersByCircle = {};
        const uniqueUsersByCircle = {};
        if (Array.isArray(allSearchLogs)) {
            allSearchLogs.forEach(log => {
                if (log.location_circle && log.user_id) {
                    const circle = log.location_circle;
                    if (!uniqueUsersByCircle[circle]) {
                        uniqueUsersByCircle[circle] = new Set();
                    }
                    uniqueUsersByCircle[circle].add(log.user_id);
                }
            });
        }

        // Convert sets to counts
        Object.keys(uniqueUsersByCircle).forEach(circle => {
            usersByCircle[circle] = uniqueUsersByCircle[circle].size;
        });

        // Group searches by circle
        const searchesByCircle = {};
        if (Array.isArray(allSearchLogs)) {
            allSearchLogs.forEach(log => {
                const logCircle = log.location_circle || 'Unknown';
                searchesByCircle[logCircle] = (searchesByCircle[logCircle] || 0) + 1;
            });
        }

        // Get vendors by circle
        let vendors = [];
        try {
            vendors = await supabaseRestGet('/rest/v1/vendors?select=id,circle,status');
        } catch (e) {
            console.error('Error fetching vendors:', e.message);
            vendors = [];
        }
        const vendorsByCircle = {};
        if (Array.isArray(vendors)) {
            vendors.forEach(vendor => {
                const vendorCircle = vendor.circle || 'Unknown';
                vendorsByCircle[vendorCircle] = (vendorsByCircle[vendorCircle] || 0) + 1;
            });
        }

        // Get category-wise demand for selected circle or all circles
        let categoryDemandData = [];
        if (circle && circle !== 'All') {
            // Filter search logs by circle
            const circleSearchLogs = allSearchLogs.filter(log => log.location_circle === circle);

            // Extract categories from search queries (simplified - you may need to map queries to categories)
            const categoryMap = {};
            circleSearchLogs.forEach(log => {
                // Simple category extraction - you might want to improve this based on your data
                const query = (log.search_query || '').toLowerCase();
                let category = 'Other';

                if (query.includes('groc') || query.includes('food') || query.includes('rice') || query.includes('dal')) {
                    category = 'Groceries';
                } else if (query.includes('electron') || query.includes('phone') || query.includes('mobile')) {
                    category = 'Electronics';
                } else if (query.includes('cloth') || query.includes('wear') || query.includes('shirt')) {
                    category = 'Clothing';
                } else if (query.includes('medic') || query.includes('pharma') || query.includes('tablet')) {
                    category = 'Medicines';
                } else if (query.includes('applian') || query.includes('fridge') || query.includes('washing')) {
                    category = 'Appliances';
                }

                if (!categoryMap[category]) {
                    categoryMap[category] = { searches: 0, purchases: 0, contacts: 0 };
                }
                categoryMap[category].searches += 1;
            });

            // Convert to array format
            categoryDemandData = Object.entries(categoryMap).map(([category, data]) => ({
                category,
                searches: data.searches,
                purchases: data.purchases || Math.floor(data.searches * 0.3), // Estimate purchases as 30% of searches
                contacts: data.contacts || Math.floor(data.searches * 0.5), // Estimate contacts as 50% of searches
            })).sort((a, b) => b.searches - a.searches);
        } else {
            // All circles - aggregate data
            const allCategoryMap = {};
            allSearchLogs.forEach(log => {
                const query = (log.search_query || '').toLowerCase();
                let category = 'Other';

                if (query.includes('groc') || query.includes('food') || query.includes('rice') || query.includes('dal')) {
                    category = 'Groceries';
                } else if (query.includes('electron') || query.includes('phone') || query.includes('mobile')) {
                    category = 'Electronics';
                } else if (query.includes('cloth') || query.includes('wear') || query.includes('shirt')) {
                    category = 'Clothing';
                } else if (query.includes('medic') || query.includes('pharma') || query.includes('tablet')) {
                    category = 'Medicines';
                } else if (query.includes('applian') || query.includes('fridge') || query.includes('washing')) {
                    category = 'Appliances';
                }

                if (!allCategoryMap[category]) {
                    allCategoryMap[category] = { searches: 0, purchases: 0, contacts: 0 };
                }
                allCategoryMap[category].searches += 1;
            });

            categoryDemandData = Object.entries(allCategoryMap).map(([category, data]) => ({
                category,
                searches: data.searches,
                purchases: data.purchases || Math.floor(data.searches * 0.3),
                contacts: data.contacts || Math.floor(data.searches * 0.5),
            })).sort((a, b) => b.searches - a.searches);
        }

        // Calculate circle user limits (assuming max users based on vendors or a default)
        const circleUserLimits = uniqueCircles.map(circleName => {
            const currentUsers = usersByCircle[circleName] || 0;
            // Default max users: 5000, or calculate based on vendors (e.g., 100 users per vendor)
            const vendorCount = vendorsByCircle[circleName] || 0;
            const maxUsers = Math.max(5000, vendorCount * 100);
            const percentage = maxUsers > 0 ? ((currentUsers / maxUsers) * 100).toFixed(1) : 0;

            return {
                circle: circleName,
                maxUsers,
                currentUsers,
                percentage: parseFloat(percentage),
            };
        });

        // Calculate user engagement (purchases/contacts)
        // Note: This is estimated based on search activity - you may need to add actual purchase/contact tracking
        const userEngagement = uniqueCircles.map(circleName => {
            const searches = searchesByCircle[circleName] || 0;
            const purchases = Math.floor(searches * 0.3); // Estimate 30% conversion
            const contacts = Math.floor(searches * 0.5); // Estimate 50% contact rate

            return {
                circle: circleName,
                purchases,
                contacts,
                total: purchases + contacts,
            };
        });

        return NextResponse.json({
            circles: uniqueCircles,
            categoryDemandData,
            circleUserLimits,
            userEngagement,
        });
    } catch (error) {
        console.error('Error fetching circle analytics:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
