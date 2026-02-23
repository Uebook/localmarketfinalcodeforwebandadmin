import { supabaseRestGet } from '../../../../lib/supabaseAdminFetch';

// GET /api/vendors/[id]  — full vendor detail + products + enquiries + reviews
export async function GET(req, { params }) {
    const { id } = await params;
    if (!id) return Response.json({ error: 'Vendor ID required' }, { status: 400 });

    try {
        const [vendors, products, enquiries, reviews] = await Promise.all([
            supabaseRestGet(`/rest/v1/vendors?id=eq.${id}&select=*&limit=1`),
            supabaseRestGet(`/rest/v1/products?vendor_id=eq.${id}&select=*&order=created_at.desc`).catch(() => []),
            supabaseRestGet(`/rest/v1/enquiries?vendor_id=eq.${id}&select=*&order=created_at.desc`).catch(() => []),
            supabaseRestGet(`/rest/v1/reviews?vendor_id=eq.${id}&select=*&order=created_at.desc`).catch(() => []),
        ]);

        if (!Array.isArray(vendors) || vendors.length === 0) {
            return Response.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const v = vendors[0];
        return Response.json({
            vendor: {
                id: v.id,
                name: v.name ?? '',
                ownerName: v.owner_name ?? v.owner ?? '',
                owner: v.owner ?? v.owner_name ?? '',
                email: v.email ?? '',
                phone: v.contact_number ?? '',
                contactNumber: v.contact_number ?? '',
                category: v.category ?? '',
                address: v.address ?? '',
                city: v.city ?? '',
                state: v.state ?? '',
                pincode: v.pincode ?? '',
                status: v.status ?? 'Pending',
                kycStatus: v.kyc_status ?? 'Pending',
                rating: v.rating ?? 0,
                reviewCount: v.review_count ?? 0,
                productCount: v.product_count ?? (Array.isArray(products) ? products.length : 0),
                imageUrl: v.image_url ?? v.shop_front_photo_url ?? null,
                createdAt: v.created_at ?? '',
            },
            products: Array.isArray(products) ? products : [],
            enquiries: Array.isArray(enquiries) ? enquiries : [],
            reviews: Array.isArray(reviews) ? reviews : [],
        }, { status: 200 });
    } catch (e) {
        console.error('Vendor detail error:', e);
        return Response.json({ error: e?.message || 'Failed to load vendor' }, { status: 500 });
    }
}
