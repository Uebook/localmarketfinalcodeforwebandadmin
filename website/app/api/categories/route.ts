import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET() {
    try {
        const query = new URLSearchParams();
        query.set('select', '*');
        query.set('order', 'priority.asc');
        query.set('visible', 'eq.true');

        const rows = await supabaseRestGet(`/rest/v1/categories?${query.toString()}`);
        const categories = Array.isArray(rows) ? rows.map((c: any) => ({
            id: c.id,
            name: c.name,
            priority: c.priority ?? 999,
            iconUrl: c.icon_url ?? null
        })) : [];

        return Response.json({ categories }, { status: 200 });
    } catch (e: any) {
        console.error('Categories GET Error:', e);
        return Response.json({ error: e?.message || 'Failed to load categories' }, { status: 500 });
    }
}
