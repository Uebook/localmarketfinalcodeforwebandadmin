import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET() {
    try {
        const query = new URLSearchParams();
        query.set('select', '*');
        query.set('active', 'eq.true');
        query.set('order', 'sort_order.asc,created_at.desc');

        const rows = await supabaseRestGet(`/rest/v1/banners?${query.toString()}`);

        // Ensure we only show banners that are currently active chronologically
        const now = new Date();
        const banners = (Array.isArray(rows) ? rows : []).filter((b: any) => {
            if (b.start_at && new Date(b.start_at) > now) return false;
            if (b.end_at && new Date(b.end_at) < now) return false;
            return true;
        }).map((b: any) => ({
            id: b.id,
            title: b.title,
            imageUrl: b.image_url,
            linkUrl: b.link_url,
            priority: b.sort_order ?? 999,
        }));

        return Response.json({ banners }, { status: 200 });
    } catch (e: any) {
        console.error('Banners GET Error:', e);
        return Response.json({ error: e?.message || 'Failed to load banners' }, { status: 500 });
    }
}
