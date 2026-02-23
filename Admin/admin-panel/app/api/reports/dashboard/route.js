import { NextResponse } from 'next/server';
import { supabaseRestGet } from '../../../../lib/supabaseAdminFetch';

// GET /api/reports/dashboard - Get operational dashboard metrics
export async function GET() {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Today's date range for daily searches
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Get total vendors - try with minimal columns first, then fallback to all columns
        let vendors = [];
        let totalVendors = 0;
        let activeVendors = 0;
        let pendingApprovals = 0;
        try {
            // Try with specific columns first
            let vendorsResult;
            try {
                vendorsResult = await supabaseRestGet('/rest/v1/vendors?select=id,status,kyc_status,created_at,last_active_at');
            } catch (e) {
                // If that fails, try with last_active instead of last_active_at
                try {
                    vendorsResult = await supabaseRestGet('/rest/v1/vendors?select=id,status,kyc_status,created_at,last_active');
                } catch (e2) {
                    // If that also fails, just get id and status
                    vendorsResult = await supabaseRestGet('/rest/v1/vendors?select=id,status,kyc_status,created_at');
                }
            }

            vendors = Array.isArray(vendorsResult) ? vendorsResult : [];
            totalVendors = vendors.length;
            activeVendors = vendors.filter(v => v.status === 'Active').length;
            pendingApprovals = vendors.filter(v =>
                v.status === 'Pending' || v.kyc_status === 'Pending'
            ).length;
            console.log(`Dashboard: Found ${totalVendors} vendors (${activeVendors} active, ${pendingApprovals} pending)`);
        } catch (e) {
            console.error('Error fetching vendors:', e.message);
            // Try one more time with just id to see if table exists
            try {
                const testResult = await supabaseRestGet('/rest/v1/vendors?select=id&limit=1');
                console.log('Vendors table exists, but query failed:', e.message);
            } catch (e2) {
                console.error('Vendors table might not exist or is not accessible:', e2.message);
            }
        }

        // Get total categories
        let totalCategories = 0;
        try {
            const categories = await supabaseRestGet('/rest/v1/categories?select=id');
            totalCategories = Array.isArray(categories) ? categories.length : 0;
            console.log(`Dashboard: Found ${totalCategories} categories`);
        } catch (e) {
            console.error('Error fetching categories:', e.message);
        }

        // Get total master products
        let totalMasterProducts = 0;
        try {
            const masterProducts = await supabaseRestGet('/rest/v1/master_products?select=id');
            totalMasterProducts = Array.isArray(masterProducts) ? masterProducts.length : 0;
            console.log(`Dashboard: Found ${totalMasterProducts} master products`);
        } catch (e) {
            console.error('Error fetching master products:', e.message);
        }

        // Get total vendor products
        let totalProducts = 0;
        try {
            const products = await supabaseRestGet('/rest/v1/vendor_products?select=id');
            totalProducts = Array.isArray(products) ? products.length : 0;
            console.log(`Dashboard: Found ${totalProducts} vendor products`);
        } catch (e) {
            console.error('Error fetching vendor products:', e.message);
        }

        // Get flagged products (pending flags)
        let flaggedProductsCount = 0;
        try {
            const flaggedProducts = await supabaseRestGet('/rest/v1/price_flags?status=eq.pending&select=id');
            flaggedProductsCount = Array.isArray(flaggedProducts) ? flaggedProducts.length : 0;
        } catch (e) {
            console.error('Error fetching flagged products:', e);
        }

        // Get daily searches (today)
        let dailySearchesCount = 0;
        let searchLogs = [];
        try {
            const dailySearches = await supabaseRestGet(
                `/rest/v1/search_logs?searched_at=gte.${todayStart.toISOString()}&searched_at=lte.${todayEnd.toISOString()}&select=id`
            );
            dailySearchesCount = Array.isArray(dailySearches) ? dailySearches.length : 0;

            // Get search volume (last 7 days) for trends
            const searchLogsResult = await supabaseRestGet(`/rest/v1/search_logs?searched_at=gte.${sevenDaysAgo.toISOString()}&select=searched_at&order=searched_at.asc`);
            searchLogs = Array.isArray(searchLogsResult) ? searchLogsResult : [];
        } catch (e) {
            console.error('Error fetching search logs:', e);
        }

        // Get total users
        let users = [];
        let totalUsers = 0;
        try {
            const usersResult = await supabaseRestGet('/rest/v1/users?select=id,created_at');
            users = Array.isArray(usersResult) ? usersResult : [];
            totalUsers = users.length;
            console.log(`Dashboard: Found ${totalUsers} users`);
        } catch (e) {
            console.error('Error fetching users:', e.message);
        }

        // Group by date
        const trendsByDate = {};
        if (Array.isArray(searchLogs)) {
            searchLogs.forEach(log => {
                if (log.searched_at) {
                    const date = new Date(log.searched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    trendsByDate[date] = (trendsByDate[date] || 0) + 1;
                }
            });
        }

        // Calculate percentage changes (compare current period with previous period)
        // For vendors: compare last 7 days vs previous 7 days
        const vendorsLastWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const created = new Date(v.created_at);
            return created >= sevenDaysAgo && created < now;
        }).length;
        const vendorsPreviousWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const created = new Date(v.created_at);
            return created >= fourteenDaysAgo && created < sevenDaysAgo;
        }).length;
        const vendorChange = vendorsPreviousWeek > 0
            ? ((vendorsLastWeek - vendorsPreviousWeek) / vendorsPreviousWeek * 100).toFixed(0)
            : vendorsLastWeek > 0 ? 100 : 0;

        // For active vendors: compare current vs previous week
        const activeVendorsLastWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const lastActive = (v.last_active_at || v.last_active) ? new Date(v.last_active_at || v.last_active) : new Date(v.created_at);
            return v.status === 'Active' && lastActive >= sevenDaysAgo && lastActive < now;
        }).length;
        const activeVendorsPreviousWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const lastActive = (v.last_active_at || v.last_active) ? new Date(v.last_active_at || v.last_active) : new Date(v.created_at);
            return v.status === 'Active' && lastActive >= fourteenDaysAgo && lastActive < sevenDaysAgo;
        }).length;
        const activeVendorChange = activeVendorsPreviousWeek > 0
            ? ((activeVendorsLastWeek - activeVendorsPreviousWeek) / activeVendorsPreviousWeek * 100).toFixed(0)
            : activeVendorsLastWeek > 0 ? 100 : 0;

        // For pending approvals: compare current vs previous week
        const pendingLastWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const created = new Date(v.created_at);
            return (v.status === 'Pending' || v.kyc_status === 'Pending') && created >= sevenDaysAgo && created < now;
        }).length;
        const pendingPreviousWeek = vendors.filter(v => {
            if (!v.created_at) return false;
            const created = new Date(v.created_at);
            return (v.status === 'Pending' || v.kyc_status === 'Pending') && created >= fourteenDaysAgo && created < sevenDaysAgo;
        }).length;
        const pendingChange = pendingPreviousWeek > 0
            ? ((pendingLastWeek - pendingPreviousWeek) / pendingPreviousWeek * 100).toFixed(0)
            : pendingLastWeek > 0 ? 100 : pendingPreviousWeek > 0 ? -100 : 0;

        // For categories: compare last 7 days vs previous 7 days
        let categoriesLastWeek = [];
        let categoriesPreviousWeek = [];
        try {
            const lastWeekResult = await supabaseRestGet(
                `/rest/v1/categories?created_at=gte.${sevenDaysAgo.toISOString()}&created_at=lt.${now.toISOString()}&select=id`
            );
            categoriesLastWeek = Array.isArray(lastWeekResult) ? lastWeekResult : [];
            const previousWeekResult = await supabaseRestGet(
                `/rest/v1/categories?created_at=gte.${fourteenDaysAgo.toISOString()}&created_at=lt.${sevenDaysAgo.toISOString()}&select=id`
            );
            categoriesPreviousWeek = Array.isArray(previousWeekResult) ? previousWeekResult : [];
        } catch (e) {
            // If created_at doesn't exist or table doesn't exist, set to empty arrays
            categoriesLastWeek = [];
            categoriesPreviousWeek = [];
        }
        const categoryChange = categoriesPreviousWeek.length > 0
            ? ((categoriesLastWeek.length - categoriesPreviousWeek.length) / categoriesPreviousWeek.length * 100).toFixed(0)
            : categoriesLastWeek.length > 0 ? 100 : 0;

        // For master products: compare last 7 days vs previous 7 days
        let masterProductsLastWeek = [];
        let masterProductsPreviousWeek = [];
        try {
            const lastWeekResult = await supabaseRestGet(
                `/rest/v1/master_products?created_at=gte.${sevenDaysAgo.toISOString()}&created_at=lt.${now.toISOString()}&select=id`
            );
            masterProductsLastWeek = Array.isArray(lastWeekResult) ? lastWeekResult : [];
            const previousWeekResult = await supabaseRestGet(
                `/rest/v1/master_products?created_at=gte.${fourteenDaysAgo.toISOString()}&created_at=lt.${sevenDaysAgo.toISOString()}&select=id`
            );
            masterProductsPreviousWeek = Array.isArray(previousWeekResult) ? previousWeekResult : [];
        } catch (e) {
            // If created_at doesn't exist or table doesn't exist, set to empty arrays
            masterProductsLastWeek = [];
            masterProductsPreviousWeek = [];
        }
        const masterProductChange = masterProductsPreviousWeek.length > 0
            ? ((masterProductsLastWeek.length - masterProductsPreviousWeek.length) / masterProductsPreviousWeek.length * 100).toFixed(0)
            : masterProductsLastWeek.length > 0 ? 100 : 0;

        // For vendor products: compare last 7 days vs previous 7 days
        let productsLastWeek = [];
        let productsPreviousWeek = [];
        try {
            const lastWeekResult = await supabaseRestGet(
                `/rest/v1/vendor_products?created_at=gte.${sevenDaysAgo.toISOString()}&created_at=lt.${now.toISOString()}&select=id`
            );
            productsLastWeek = Array.isArray(lastWeekResult) ? lastWeekResult : [];
            const previousWeekResult = await supabaseRestGet(
                `/rest/v1/vendor_products?created_at=gte.${fourteenDaysAgo.toISOString()}&created_at=lt.${sevenDaysAgo.toISOString()}&select=id`
            );
            productsPreviousWeek = Array.isArray(previousWeekResult) ? previousWeekResult : [];
        } catch (e) {
            // If created_at doesn't exist, set to empty arrays
            console.error('Error fetching vendor products for comparison:', e);
            productsLastWeek = [];
            productsPreviousWeek = [];
        }
        const productChange = productsPreviousWeek.length > 0
            ? ((productsLastWeek.length - productsPreviousWeek.length) / productsPreviousWeek.length * 100).toFixed(0)
            : productsLastWeek.length > 0 ? 100 : 0;

        // For flagged products: compare current vs previous week
        let flaggedLastWeek = [];
        let flaggedPreviousWeek = [];
        try {
            const flaggedLastWeekResult = await supabaseRestGet(
                `/rest/v1/price_flags?status=eq.pending&flagged_at=gte.${sevenDaysAgo.toISOString()}&flagged_at=lt.${now.toISOString()}&select=id`
            );
            flaggedLastWeek = Array.isArray(flaggedLastWeekResult) ? flaggedLastWeekResult : [];
            const flaggedPreviousWeekResult = await supabaseRestGet(
                `/rest/v1/price_flags?status=eq.pending&flagged_at=gte.${fourteenDaysAgo.toISOString()}&flagged_at=lt.${sevenDaysAgo.toISOString()}&select=id`
            );
            flaggedPreviousWeek = Array.isArray(flaggedPreviousWeekResult) ? flaggedPreviousWeekResult : [];
        } catch (e) {
            // If flagged_at doesn't exist, set to empty arrays
            console.error('Error fetching flagged products for comparison:', e);
            flaggedLastWeek = [];
            flaggedPreviousWeek = [];
        }
        const flaggedChange = flaggedPreviousWeek.length > 0
            ? ((flaggedLastWeek.length - flaggedPreviousWeek.length) / flaggedPreviousWeek.length * 100).toFixed(0)
            : flaggedLastWeek.length > 0 ? 100 : flaggedPreviousWeek.length > 0 ? -100 : 0;

        // For daily searches: compare today vs yesterday
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayEnd);
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        let yesterdaySearches = [];
        try {
            const yesterdaySearchesResult = await supabaseRestGet(
                `/rest/v1/search_logs?searched_at=gte.${yesterdayStart.toISOString()}&searched_at=lte.${yesterdayEnd.toISOString()}&select=id`
            );
            yesterdaySearches = Array.isArray(yesterdaySearchesResult) ? yesterdaySearchesResult : [];
        } catch (e) {
            console.error('Error fetching yesterday searches:', e);
            yesterdaySearches = [];
        }
        const searchChange = yesterdaySearches.length > 0
            ? ((dailySearchesCount - yesterdaySearches.length) / yesterdaySearches.length * 100).toFixed(0)
            : dailySearchesCount > 0 ? 100 : 0;

        // For users: compare last 7 days vs previous 7 days
        const usersLastWeek = users.filter(u => {
            if (!u.created_at) return false;
            const created = new Date(u.created_at);
            return created >= sevenDaysAgo && created < now;
        }).length;
        const usersPreviousWeek = users.filter(u => {
            if (!u.created_at) return false;
            const created = new Date(u.created_at);
            return created >= fourteenDaysAgo && created < sevenDaysAgo;
        }).length;
        const userChange = usersPreviousWeek > 0
            ? ((usersLastWeek - usersPreviousWeek) / usersPreviousWeek * 100).toFixed(0)
            : usersLastWeek > 0 ? 100 : 0;

        // Get vendors with high views but low completeness
        let viewCounts = {};
        let priceUpdateCount = 0;
        try {
            const vendorActivity = await supabaseRestGet('/rest/v1/vendor_activity_logs?activity_type=eq.profile_viewed&select=vendor_id');
            if (Array.isArray(vendorActivity)) {
                vendorActivity.forEach(log => {
                    viewCounts[log.vendor_id] = (viewCounts[log.vendor_id] || 0) + 1;
                });
            }

            // Get price updates count (last 7 days)
            const priceUpdates = await supabaseRestGet(
                `/rest/v1/vendor_activity_logs?activity_type=eq.price_update&created_at=gte.${sevenDaysAgo.toISOString()}&select=vendor_id`
            );
            priceUpdateCount = Array.isArray(priceUpdates) ? priceUpdates.length : 0;
        } catch (e) {
            console.error('Error fetching vendor activity:', e);
        }

        const response = {
            totalVendors,
            activeVendors,
            pendingApprovals,
            totalCategories,
            totalMasterProducts,
            totalProducts,
            flaggedProducts: flaggedProductsCount,
            dailySearches: dailySearchesCount,
            totalUsers,
            searchTrends: Object.entries(trendsByDate).map(([date, searches]) => ({ date, searches })),
            vendorsWithHighViews: Object.keys(viewCounts).length,
            priceUpdatesCount: priceUpdateCount,
            pendingActions: flaggedProductsCount,
            // Percentage changes
            vendorChange: vendorChange > 0 ? `+${vendorChange}%` : `${vendorChange}%`,
            activeVendorChange: activeVendorChange > 0 ? `+${activeVendorChange}%` : `${activeVendorChange}%`,
            pendingChange: pendingChange > 0 ? `+${pendingChange}%` : `${pendingChange}%`,
            categoryChange: categoryChange > 0 ? `+${categoryChange}%` : `${categoryChange}%`,
            masterProductChange: masterProductChange > 0 ? `+${masterProductChange}%` : `${masterProductChange}%`,
            productChange: productChange > 0 ? `+${productChange}%` : `${productChange}%`,
            flaggedChange: flaggedChange > 0 ? `+${flaggedChange}` : `${flaggedChange}`,
            searchChange: searchChange > 0 ? `+${searchChange}%` : `${searchChange}%`,
            userChange: userChange > 0 ? `+${userChange}%` : `${userChange}%`,
        };

        console.log('Dashboard API Response Summary:', {
            vendors: totalVendors,
            categories: totalCategories,
            masterProducts: totalMasterProducts,
            vendorProducts: totalProducts,
            users: totalUsers
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        if (error.message && (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND'))) {
            return NextResponse.json({
                totalVendors: 0,
                activeVendors: 0,
                pendingApprovals: 0,
                totalCategories: 0,
                totalMasterProducts: 0,
                totalProducts: 0,
                flaggedProducts: 0,
                dailySearches: 0,
                totalUsers: 0,
                searchTrends: [],
                warning: 'offline_mode'
            });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
