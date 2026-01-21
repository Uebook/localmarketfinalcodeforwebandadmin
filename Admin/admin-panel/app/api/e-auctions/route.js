import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestInsert, supabaseRestPatch } from '@/lib/supabaseAdminFetch';

// GET /api/e-auctions - Get all auctions/draws
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = '/rest/v1/e_auctions?select=*&order=created_at.desc';
    if (status) {
      query += `&status=eq.${status}`;
    }
    
    const auctions = await supabaseRestGet(query);
    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching e-auctions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/e-auctions - Create a new auction/draw
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      type,
      circle,
      start_date,
      end_date,
      description,
      min_bid,
      max_participants,
    } = body;
    
    if (!title || !type || !circle || !start_date || !end_date) {
      return NextResponse.json({ error: 'Title, type, circle, start_date, and end_date are required' }, { status: 400 });
    }
    
    const auction = {
      title,
      type,
      circle,
      start_date,
      end_date,
      description: description || null,
      min_bid: min_bid ? parseFloat(min_bid) : null,
      max_participants: max_participants ? parseInt(max_participants) : null,
      status: 'upcoming',
      participants_count: 0,
      offers_count: 0,
    };
    
    const result = await supabaseRestInsert('/rest/v1/e_auctions', auction);
    return NextResponse.json(result[0] || result, { status: 201 });
  } catch (error) {
    console.error('Error creating e-auction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/e-auctions - Update auction
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Auction ID is required' }, { status: 400 });
    }
    
    const result = await supabaseRestPatch(`/rest/v1/e_auctions?id=eq.${id}`, updates);
    return NextResponse.json(result[0] || result);
  } catch (error) {
    console.error('Error updating e-auction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
