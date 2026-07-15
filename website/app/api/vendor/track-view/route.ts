import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { vendorId } = body;

        if (!vendorId) {
            return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
        }

        // 1. Fetch current profile views
        const currentData = await supabaseRestGet(`/rest/v1/vendors?id=eq.${vendorId}&select=profile_views`);
        
        if (!currentData || currentData.length === 0) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }
        
        const currentViews = currentData[0].profile_views || 0;
        
        // 2. Increment by 1
        await supabaseRestPatch(`/rest/v1/vendors?id=eq.${vendorId}`, {
            profile_views: currentViews + 1
        });

        return NextResponse.json({ success: true, newCount: currentViews + 1 });
    } catch (error) {
        console.error('Profile view track error:', error);
        return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
    }
}
