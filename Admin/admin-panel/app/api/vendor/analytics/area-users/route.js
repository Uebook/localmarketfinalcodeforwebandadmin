import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendorId');

        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
        }

        // 1. Fetch vendor details for city context
        const vendors = await supabaseRestGet(`/rest/v1/vendors?id=eq.${encodeURIComponent(vendorId)}&select=city&limit=1`).catch(() => []);
        const vendor = vendors?.[0] || {};
        const vendorCity = vendor.city || 'Amritsar';

        // 2. Fetch users in the same city
        const areaUsersQuery = `/rest/v1/users?city=ilike.${encodeURIComponent('%' + vendorCity + '%')}&select=full_name,phone,email,city,state`;
        const users = await supabaseRestGet(areaUsersQuery).catch(() => []);

        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Fetch area users error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
