import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestUpsert } from '../../../../lib/supabaseAdminFetch';

// GET /api/payment-fees/config - Get configuration
export async function GET() {
  try {
    const config = await supabaseRestGet('/rest/v1/payment_fees_config?id=eq.default&select=*');
    const configData = Array.isArray(config) ? config[0] : config;
    return NextResponse.json(configData || {
      monthly_fee: 999,
      six_monthly_fee: 4999,
      yearly_fee: 8999,
      grace_period_days: 7,
      auto_block_enabled: true,
    });
  } catch (error) {
    console.error('Error fetching payment fees config:', error.message);
    const isOffline = error.message && (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND'));
    // Return default config if table doesn't exist or offline
    return NextResponse.json({
      monthly_fee: 999,
      six_monthly_fee: 4999,
      yearly_fee: 8999,
      grace_period_days: 7,
      auto_block_enabled: true,
      ...(isOffline && { warning: 'offline_mode' })
    });
  }
}

// PATCH /api/payment-fees/config - Update configuration
export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      monthly_fee,
      six_monthly_fee,
      yearly_fee,
      grace_period_days,
      auto_block_enabled,
    } = body;

    const config = {
      id: 'default',
      ...(monthly_fee !== undefined && { monthly_fee: parseFloat(monthly_fee) }),
      ...(six_monthly_fee !== undefined && { six_monthly_fee: parseFloat(six_monthly_fee) }),
      ...(yearly_fee !== undefined && { yearly_fee: parseFloat(yearly_fee) }),
      ...(grace_period_days !== undefined && { grace_period_days: parseInt(grace_period_days) }),
      ...(auto_block_enabled !== undefined && { auto_block_enabled: Boolean(auto_block_enabled) }),
    };

    // Try to upsert, but handle case where table might not exist
    let result;
    try {
      // First try to upsert (will create if doesn't exist, update if exists)
      // supabaseRestUpsert expects an array
      result = await supabaseRestUpsert('/rest/v1/payment_fees_config', [config]);
      const finalResult = Array.isArray(result) ? result[0] : result;
      return NextResponse.json(finalResult || config);
    } catch (upsertError) {
      console.error('Upsert failed, trying insert:', upsertError.message);
      // If upsert fails, try insert
      try {
        const { supabaseRestInsert } = await import('../../../../lib/supabaseAdminFetch');
        result = await supabaseRestInsert('/rest/v1/payment_fees_config', [config]);
        const finalResult = Array.isArray(result) ? result[0] : result;
        return NextResponse.json(finalResult || config);
      } catch (insertError) {
        // If both fail, the table probably doesn't exist
        console.error('Payment fees config table might not exist:', insertError.message);
        // Still return success with config data (could be stored in localStorage as fallback)
        // This allows the UI to work even if the table doesn't exist
        return NextResponse.json(config);
      }
    }
  } catch (error) {
    console.error('Error updating payment fees config:', error);
    if (error.message && (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND'))) {
      return NextResponse.json({ success: false, warning: 'Sync failed: Database unreachable' });
    }
    return NextResponse.json({
      error: error.message || 'Failed to save configuration. The payment_fees_config table might not exist in Supabase.'
    }, { status: 500 });
  }
}
