import { supabaseRestGet, supabaseRestPatch, supabaseRestPost, supabaseRestDelete } from '@/lib/supabaseAdminFetch';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured');
    
    let query = '/rest/v1/brands?select=*&order=display_order.asc';
    if (featured === 'true') {
      query += '&featured=eq.true';
    }

    const brands = await supabaseRestGet(query);
    return Response.json({ success: true, brands });
  } catch (error) {
    console.error('[Brands API] GET Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const data = await supabaseRestPost('/rest/v1/brands', body);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('[Brands API] POST Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    const data = await supabaseRestPatch(`/rest/v1/brands?id=eq.${id}`, updates);
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('[Brands API] PATCH Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Brand ID is required' }, { status: 400 });
    }

    await supabaseRestDelete(`/rest/v1/brands?id=eq.${id}`);
    return Response.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('[Brands API] DELETE Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
