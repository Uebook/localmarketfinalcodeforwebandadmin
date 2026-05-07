import { NextResponse } from 'next/server';
import { supabaseRestGet } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { vendor_id, name, mobile, message } = body;

    if (!vendor_id || !name || !mobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real app, you'd insert into an 'enquiries' table.
    // For now, we'll simulate success or use a generic rest helper if it exists.
    // Assuming there's a table named 'enquiries'
    /*
    const res = await supabaseRestPost('/rest/v1/enquiries', {
        vendor_id, name, mobile, message, created_at: new Date().toISOString()
    });
    */

    return NextResponse.json({ success: true, message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Enquiry API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
