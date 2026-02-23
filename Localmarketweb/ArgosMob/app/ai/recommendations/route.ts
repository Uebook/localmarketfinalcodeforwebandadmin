import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { context, location } = body;

        // Simulation of DB Query and AI Matching Logic
        // In reality: Query Supabase/Postgres, filter by location, scoring algorithm.

        // Mock Data
        const mockVendors = [
            {
                id: 'v1',
                name: 'QuickFix Plumbers',
                service: 'Plumbing & Repair',
                price: '₹500 min',
                rating: 4.8,
                distance: '1.2 km',
                eta: '30 mins',
                isTopMatch: true,
                bgImage: 'https://images.unsplash.com/photo-1585675409540-1b6c7a7fe6d2?w=500&auto=format&fit=crop&q=60',
                explanation: 'Best rated for emergency repairs nearby.'
            },
            {
                id: 'v2',
                name: 'Sharma Electronics',
                service: 'Mobile & Laptop',
                price: '₹300 min',
                rating: 4.5,
                distance: '2.5 km',
                eta: '1 hour',
                isTopMatch: false,
                bgImage: 'https://images.unsplash.com/photo-1591123720164-de1348028a82?w=500&auto=format&fit=crop&q=60',
                explanation: 'Very affordable and available today.'
            },
            {
                id: 'v3',
                name: 'HomeCare Pro',
                service: 'Cleaning & Maintenance',
                price: '₹800',
                rating: 4.9,
                distance: '3.0 km',
                eta: 'Schedule',
                isTopMatch: false,
                bgImage: 'https://images.unsplash.com/photo-1581578731117-104f2a412727?w=500&auto=format&fit=crop&q=60',
                explanation: 'Premium service with verified professionals.'
            }
        ];

        // Simple textual filtering simulation based on context
        const intent = context?.intent?.toLowerCase() || '';
        let filteredVendors = mockVendors;

        if (intent.includes('repair') || intent.includes('plumber')) {
            filteredVendors = mockVendors.filter(v => v.service.includes('Plumbing') || v.service.includes('Repair'));
        } else if (intent.includes('electronic') || intent.includes('mobile')) {
            filteredVendors = mockVendors.filter(v => v.service.includes('Electronics') || v.service.includes('Laptop'));
        }

        // If filtering eliminates all, return all (fallback)
        if (filteredVendors.length === 0) filteredVendors = mockVendors;


        return NextResponse.json({
            vendors: filteredVendors,
            meta: {
                total: filteredVendors.length,
                filterUsed: intent
            }
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
}
