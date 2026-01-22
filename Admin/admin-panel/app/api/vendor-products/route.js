import { supabaseRestGet, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

function toStr(v) {
    return typeof v === 'string' ? v : '';
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = toStr(searchParams.get('vendorId'));
        const id = toStr(searchParams.get('id'));

        if (id) {
            // Get single product by ID
            try {
                const query = new URLSearchParams();
                query.set('select', 'id,name,price,mrp,uom,category_id,vendor_id,updated_at');
                query.set('id', `eq.${id}`);
                const rows = await supabaseRestGet(`/rest/v1/vendor_products?${query.toString()}`);
                return Response.json({ product: Array.isArray(rows) && rows.length > 0 ? rows[0] : null }, { status: 200 });
            } catch (error) {
                console.error('Error fetching product by ID:', error);
                return Response.json({ product: null }, { status: 200 });
            }
        }

        if (!vendorId) {
            return Response.json({ error: 'vendorId is required' }, { status: 400 });
        }

        // Validate vendorId format
        if (vendorId.trim() === '') {
            return Response.json({ error: 'vendorId cannot be empty' }, { status: 400 });
        }

        try {
            const query = new URLSearchParams();
            query.set('select', 'id,name,price,mrp,uom,category_id,updated_at');
            query.set('vendor_id', `eq.${encodeURIComponent(vendorId)}`);
            query.set('order', 'name.asc');

            const rows = await supabaseRestGet(`/rest/v1/vendor_products?${query.toString()}`);
            return Response.json({ products: Array.isArray(rows) ? rows : [] }, { status: 200 });
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            console.error('VendorId:', vendorId);
            // Return empty array instead of error to prevent app crashes
            return Response.json({ products: [] }, { status: 200 });
        }
    } catch (e) {
        console.error('Unexpected error in vendor-products GET:', e);
        return Response.json({ error: e?.message || 'Failed to load vendor products', products: [] }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = toStr(searchParams.get('id'));
        const body = await req.json();

        if (!id) {
            return Response.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Prepare update data
        const updateData = {};
        if (body.name !== undefined) updateData.name = toStr(body.name);
        if (body.price !== undefined) {
            const price = Number(body.price);
            updateData.price = isNaN(price) ? null : price;
        }
        if (body.mrp !== undefined) {
            const mrp = Number(body.mrp);
            updateData.mrp = isNaN(mrp) ? null : mrp;
        }
        if (body.uom !== undefined) updateData.uom = toStr(body.uom) || null;
        if (body.category_id !== undefined) {
            updateData.category_id = body.category_id || null;
        }
        if (body.image_url !== undefined) {
            updateData.image_url = toStr(body.image_url) || null;
        }

        if (Object.keys(updateData).length === 0) {
            return Response.json({ error: 'No fields to update' }, { status: 400 });
        }

        updateData.updated_at = new Date().toISOString();

        const result = await supabaseRestPatch(`/rest/v1/vendor_products?id=eq.${id}`, updateData);
        return Response.json({ success: true, product: result[0] || result }, { status: 200 });
    } catch (e) {
        return Response.json({ error: e?.message || 'Failed to update vendor product' }, { status: 500 });
    }
}

