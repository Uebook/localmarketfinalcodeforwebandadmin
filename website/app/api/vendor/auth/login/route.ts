import { NextRequest, NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

// POST /api/vendor/auth/login
export async function POST(request: NextRequest) {
    try {
        const { phone, email } = await request.json();

        if (!phone && !email) {
            return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
        }

        let query = '/rest/v1/vendors?select=*&limit=1';
        if (phone) {
            const cleaned = phone.replace(/\D/g, '');
            query += `&contact_number=eq.${encodeURIComponent(cleaned)}`;
        } else {
            query += `&email=eq.${encodeURIComponent(email.toLowerCase().trim())}`;
        }

        const results = await supabaseRestGet(query);
        if (!Array.isArray(results) || results.length === 0) {
            return NextResponse.json({ error: 'No vendor account found with that phone/email. Please register first.' }, { status: 404 });
        }

        const v = results[0];
        const status = (v.status ?? '').trim();
        if (status !== 'Active') {
            if (status === 'Blocked') {
                return NextResponse.json({
                    error: 'Your account has been blocked. Please contact support.'
                }, { status: 403 });
            }
            // Pending, Inactive, etc.
            return NextResponse.json({
                error: 'Your account is pending admin approval. You will be notified once activated.',
                status,
            }, { status: 403 });
        }

        const vendor = {
            id: v.id,
            name: v.name ?? v.shop_name ?? '',
            ownerName: v.owner ?? v.owner_name ?? '',
            email: v.email ?? '',
            phone: v.contact_number ?? '',
            category: v.category ?? '',
            address: v.address ?? '',
            city: v.city ?? '',
            state: v.state ?? '',
            pincode: v.pincode ?? '',
            status: v.status ?? 'Pending',
            kycStatus: v.kyc_status ?? v.kycStatus ?? 'Pending',
            rating: v.rating ?? 0,
            reviewCount: v.review_count ?? v.reviewCount ?? 0,
            imageUrl: v.image_url ?? v.imageUrl ?? v.shop_front_photo_url ?? null,
        };

        return NextResponse.json({ vendor }, { status: 200 });
    } catch (error: any) {
        console.error('Vendor login error:', error);
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
    }
}
