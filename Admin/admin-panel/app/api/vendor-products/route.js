import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

function toStr(v) {
    return typeof v === 'string' ? v : '';
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const vendorId = toStr(searchParams.get('vendorId'));
        if (!vendorId) return Response.json({ error: 'vendorId is required' }, { status: 400 });

        const query = new URLSearchParams();
        query.set('select', 'id,name,price,mrp,uom,category_id,updated_at');
        query.set('vendor_id', `eq.${vendorId}`);
        query.set('order', 'name.asc');

        const rows = await supabaseRestGet(`/rest/v1/vendor_products?${query.toString()}`);
        return Response.json({ products: Array.isArray(rows) ? rows : [] }, { status: 200 });
    } catch (e) {
        return Response.json({ error: e?.message || 'Failed to load vendor products' }, { status: 500 });
    }
}

