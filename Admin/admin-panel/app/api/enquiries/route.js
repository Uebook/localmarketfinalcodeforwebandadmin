import { NextResponse } from 'next/server';
import { supabaseRestInsert } from '@/lib/supabaseAdminFetch';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { vendor_id, name, mobile, message } = body;

    if (!vendor_id || !name || !mobile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into 'enquiries' table
    const result = await supabaseRestInsert('/rest/v1/enquiries', {
        vendor_id,
        sender_name: name,
        sender_phone: mobile,
        message: message || 'I am interested in your products.',
        status: 'new',
        created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry submitted successfully',
      enquiry: Array.isArray(result) ? result[0] : result 
    });
  } catch (error) {
    console.error('Enquiry API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
