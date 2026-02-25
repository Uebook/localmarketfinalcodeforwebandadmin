import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
    }

    try {
        // Increased zoom to 18 for more granular address details (suburbs, neighborhoods)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`,
            {
                headers: {
                    'Accept-Language': 'en',
                    'User-Agent': 'LocalMarket-Website/1.0 (contact@localmarket.com)',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.statusText}`);
        }

        const data = await response.json();

        // Manual override for known NCR regions where Nominatrim defaults to broader town/districts
        if (data.address && data.address.state_district === 'Gautam Buddha Nagar') {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            // Noida Extension / Greater Noida West boundaries (approximate)
            if (latNum > 28.55 && latNum < 28.65 && lngNum > 77.40 && lngNum < 77.50) {
                data.address.suburb = 'Greater Noida West (Noida Extension)';
            }
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Geocoding API Error:', error);
        return NextResponse.json({ error: error.message || 'Geocoding failed' }, { status: 500 });
    }
}
