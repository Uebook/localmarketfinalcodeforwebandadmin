import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

// CORS headers helper
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

// GET /api/festive-offers - Get all active/active-only offers
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'active';
        const type = searchParams.get('type'); // 'vendor' or 'user'
        const circle = searchParams.get('circle');

        let query = `/rest/v1/festive_offers?select=*&order=created_at.desc&status=eq.${status}`;

        if (type) {
            query += `&type=eq.${type}`;
        }

        if (circle) {
            query += `&or=(circle.is.null,circle.eq.${circle})`;
        }

        const offers = await supabaseRestGet(query);

        return NextResponse.json(offers, { headers: corsHeaders() });
    } catch (error: any) {
        console.error('Error fetching festive offers:', error);
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() });
    }
}
