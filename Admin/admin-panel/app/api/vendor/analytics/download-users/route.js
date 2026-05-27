import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return new Response('Vendor ID is required', { status: 400 });
        }

        // 1. Fetch vendor details for city context
        const vendors = await supabaseRestGet(`/rest/v1/vendors?id=eq.${encodeURIComponent(vendorId)}&select=city&limit=1`).catch(() => []);
        const vendor = vendors?.[0] || {};
        const vendorCity = vendor.city || 'Amritsar';

        // 2. Fetch users in the same city
        const areaUsersQuery = `/rest/v1/users?city=ilike.${encodeURIComponent('%' + vendorCity + '%')}&select=full_name,phone,email,city,state`;
        const users = await supabaseRestGet(areaUsersQuery).catch(() => []);

        // 3. Generate CSV content (Excel compatible with UTF-8 BOM)
        const csvRows = [
            '\uFEFFName,Phone,Email,City,State', // UTF-8 BOM + CSV Headers
            ...users.map(u => {
                const name = (u.full_name || '').replace(/"/g, '""');
                const phone = u.phone || '';
                const email = u.email || '';
                const city = u.city || '';
                const state = u.state || '';
                return `"${name}","${phone}","${email}","${city}","${state}"`;
            })
        ];
        const csvContent = csvRows.join('\n');

        // 4. Return as downloadable file attachment
        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="users_nearby.csv"',
            },
        });
    } catch (error) {
        console.error('Download Users nearby error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
