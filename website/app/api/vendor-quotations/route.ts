import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestInsert, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requirement_id = searchParams.get('requirement_id');
    const vendor_id = searchParams.get('vendor_id');

    if (requirement_id) {
      const data = await supabaseRestGet(`/rest/v1/vendor_quotations?requirement_id=eq.${requirement_id}&select=*,vendors(name,rating,profile_image_url,city,contact_number)&order=created_at.desc`);
      return NextResponse.json({ success: true, quotations: data });
    }

    if (vendor_id) {
      const data = await supabaseRestGet(`/rest/v1/vendor_quotations?vendor_id=eq.${vendor_id}&select=*,custom_requirements(*)&order=created_at.desc`);
      return NextResponse.json({ success: true, quotations: data });
    }

    return NextResponse.json({ error: 'Missing parameters (requirement_id or vendor_id)' }, { status: 400 });
  } catch (error: any) {
    console.error('Vendor Quotations API GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requirement_id, vendor_id, price, delivery_time, note } = body;

    if (!requirement_id || !vendor_id || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await supabaseRestInsert('/rest/v1/vendor_quotations', {
      requirement_id, vendor_id, price, delivery_time, note, status: 'pending'
    });

    try {
      // Notify the buyer
      await supabaseRestInsert('/rest/v1/notifications', [{
        audience: 'users',
        title: 'New Bid Received! 💰',
        message: `A vendor has submitted a new quotation of ₹${price} for your requirement. Check your bids!`,
        topic: requirement_id,
        sent_at: new Date().toISOString()
      }]);
    } catch (notifErr) {
      console.error('Failed to create notification for quotation:', notifErr);
    }

    return NextResponse.json({ success: true, quotation: Array.isArray(result) ? result[0] : result });
  } catch (error: any) {
    console.error('Vendor Quotations API POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, price, delivery_time, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (price !== undefined) updates.price = price;
    if (delivery_time !== undefined) updates.delivery_time = delivery_time;
    if (note !== undefined) updates.note = note;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const result = await supabaseRestPatch(`/rest/v1/vendor_quotations?id=eq.${id}`, updates);

    return NextResponse.json({ success: true, quotation: Array.isArray(result) ? result[0] : result });
  } catch (error: any) {
    console.error('Vendor Quotations API PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
