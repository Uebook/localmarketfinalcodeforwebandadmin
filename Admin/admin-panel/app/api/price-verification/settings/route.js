import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestUpsert } from '@/lib/supabaseAdminFetch';

// GET /api/price-verification/settings - Get settings
export async function GET() {
  try {
    const settings = await supabaseRestGet('/rest/v1/price_verification_settings?id=eq.default&select=*');
    return NextResponse.json(settings[0] || { threshold_percent: 20, auto_alert_enabled: true });
  } catch (error) {
    console.error('Error fetching price verification settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/price-verification/settings - Update settings
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { threshold_percent, auto_alert_enabled } = body;
    
    const settings = {
      id: 'default',
      threshold_percent: threshold_percent !== undefined ? parseFloat(threshold_percent) : undefined,
      auto_alert_enabled: auto_alert_enabled !== undefined ? auto_alert_enabled : undefined,
    };
    
    const result = await supabaseRestUpsert('/rest/v1/price_verification_settings', settings);
    return NextResponse.json(result[0] || result);
  } catch (error) {
    console.error('Error updating price verification settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
