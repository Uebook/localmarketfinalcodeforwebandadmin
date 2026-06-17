import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestInsert, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyer_id = searchParams.get('buyer_id');
    const vendor_lat = searchParams.get('lat');
    const vendor_lng = searchParams.get('lng');
    const category = searchParams.get('category');
    const radius = searchParams.get('radius') || 5;
    const admin = searchParams.get('admin');

    if (admin === 'true') {
      const data = await supabaseRestGet(`/rest/v1/custom_requirements?select=*,users(full_name,phone)&order=created_at.desc`);
      return NextResponse.json({ success: true, requirements: data });
    }

    if (buyer_id) {
      const data = await supabaseRestGet(`/rest/v1/custom_requirements?buyer_id=eq.${buyer_id}&order=created_at.desc`);
      return NextResponse.json({ success: true, requirements: data });
    }

    if (vendor_lat && vendor_lng) {
      let query = `/rest/v1/custom_requirements?status=eq.active&select=*,users(full_name,phone)`;
      if (category && category !== 'All') {
        query += `&category=eq.${encodeURIComponent(category)}`;
      }
      const data = await supabaseRestGet(query);
      
      const vLat = parseFloat(vendor_lat);
      const vLng = parseFloat(vendor_lng);
      
      const nearbyReqs = Array.isArray(data) ? data.filter(req => {
        if (!req.lat || !req.lng) return false;
        const dist = getDistance(vLat, vLng, parseFloat(req.lat), parseFloat(req.lng));
        const maxRadius = parseFloat(req.radius_km) || parseFloat(radius as string);
        return dist <= maxRadius;
      }) : [];
      
      return NextResponse.json({ success: true, requirements: nearbyReqs });
    }

    return NextResponse.json({ error: 'Missing parameters (buyer_id or lat/lng)' }, { status: 400 });
  } catch (error: any) {
    console.error('Custom Requirements API GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyer_id, title, description, category, quantity, unit, budget_min, budget_max, lat, lng, location_text, radius_km, photos } = body;

    if (!buyer_id || !title || !description || !category || !lat || !lng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 24);

    const result = await supabaseRestInsert('/rest/v1/custom_requirements', {
      buyer_id, title, description, category, quantity: quantity || 1, unit: unit || 'pcs', budget_min, budget_max, lat, lng, location_text, radius_km: radius_km || 2, status: 'active', expires_at: expires_at.toISOString(), photos: photos || []
    });

    // Add in-app notification for vendors
    try {
      const cityMatch = location_text ? location_text.split(',')[0].trim() : 'your area';
      await supabaseRestInsert('/rest/v1/notifications', [{
        audience: 'vendors',
        title: 'New Lead Nearby! 🎯',
        message: `Someone is looking for ${category} near ${cityMatch}. Check your feed to submit a quote.`,
        topic: cityMatch,
        sent_at: new Date().toISOString()
      }]);
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    return NextResponse.json({ success: true, requirement: Array.isArray(result) ? result[0] : result });
  } catch (error: any) {
    console.error('Custom Requirements API POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const result = await supabaseRestPatch(`/rest/v1/custom_requirements?id=eq.${id}`, { status });

    return NextResponse.json({ success: true, requirement: Array.isArray(result) ? result[0] : result });
  } catch (error: any) {
    console.error('Custom Requirements API PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
