import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export async function GET() {
    try {
        // Fetch categories with priority and visibility
        const categories = await supabaseRestGet('/rest/v1/categories?select=*&visible=eq.true&order=priority.asc');

        // Normalize for UI
        const normalized = categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            iconName: cat.icon_name || 'ShoppingBag',
            priority: cat.priority,
            slug: cat.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        }));

        return NextResponse.json({ categories: normalized });
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
    }
}
