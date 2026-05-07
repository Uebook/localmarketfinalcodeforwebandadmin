import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    // Mock trending searches for the city
    const trending = [
      'Milk', 'Bread', 'Eggs', 'Rice', 'Oil', 'Smartphone', 'Charger', 'Shampoo'
    ];

    return NextResponse.json(trending);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
