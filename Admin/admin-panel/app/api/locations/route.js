import { supabaseRestGet, supabaseRestInsert } from '../../../lib/supabaseAdminFetch';

function toStr(v) {
    return typeof v === 'string' ? v.trim() : '';
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const state = toStr(searchParams.get('state'));
        const city = toStr(searchParams.get('city'));
        const town = toStr(searchParams.get('town'));
        const tehsil = toStr(searchParams.get('tehsil'));
        const subTehsil = toStr(searchParams.get('subTehsil'));
        const circle = toStr(searchParams.get('circle'));
        const limit = Math.min(Number(searchParams.get('limit') || 500), 2000);

        const query = new URLSearchParams();
        query.set('select', '*');
        query.set('order', 'state.asc,city.asc,town.asc,tehsil.asc,sub_tehsil.asc');
        query.set('limit', String(limit));

        if (state) query.set('state', `eq.${state}`);
        if (city) query.set('city', `eq.${city}`);
        if (town) query.set('town', `eq.${town}`);
        if (tehsil) query.set('tehsil', `eq.${tehsil}`);
        if (subTehsil) query.set('sub_tehsil', `eq.${subTehsil}`);
        if (circle) query.set('circle', `eq.${circle}`);

        const rows = await supabaseRestGet(`/rest/v1/locations?${query.toString()}`);
        return Response.json({ locations: Array.isArray(rows) ? rows : [] }, { status: 200 });
    } catch (e) {
        const errorMessage = e?.message || String(e) || 'Failed to load locations';

        // If table doesn't exist, return empty array instead of error
        // This allows the UI to still work and show the import option
        if (errorMessage.includes('does not exist') ||
            errorMessage.includes('relation') ||
            errorMessage.includes('PGRST205') ||
            errorMessage.includes('Could not find the table')) {
            console.warn('Locations table may not exist. Returning empty array. Run sql/create_locations_table.sql to create it.');
            return Response.json({ locations: [] }, { status: 200 });
        }

        console.error('Error loading locations:', errorMessage);
        if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND')) {
            return Response.json({ locations: [], warning: 'offline_mode' }, { status: 200 });
        }
        return Response.json({
            error: errorMessage,
            hint: 'If the locations table does not exist, run: sql/create_locations_table.sql'
        }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json().catch(() => null);
        const state = toStr(body?.state);
        const city = toStr(body?.city);
        const town = toStr(body?.town);
        const tehsil = toStr(body?.tehsil);
        const sub_tehsil = toStr(body?.subTehsil || body?.sub_tehsil);
        const circle = toStr(body?.circle) || null;

        if (!state || !city || !town || !tehsil || !sub_tehsil) {
            return Response.json(
                { error: 'state, city, town, tehsil, subTehsil are required' },
                { status: 400 }
            );
        }

        // Upsert behavior depends on your unique index; if you added locations_unique_hierarchy_idx,
        // inserting duplicates will error. For simplicity, just insert and rely on uniqueness.
        const inserted = await supabaseRestInsert('/rest/v1/locations', [
            { state, city, town, tehsil, sub_tehsil, circle },
        ]);
        return Response.json({ location: Array.isArray(inserted) ? inserted[0] : inserted }, { status: 200 });
    } catch (e) {
        let errorMessage = e?.message || 'Failed to add location';

        // Provide helpful error message if table doesn't exist
        if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('PGRST205')) {
            errorMessage = 'The locations table does not exist in Supabase. Please run the SQL script: sql/create_locations_table.sql';
        }

        if (errorMessage.includes('fetch failed') || errorMessage.includes('ENOTFOUND')) {
            return Response.json({ success: false, warning: 'Sync failed: Database unreachable' });
        }

        return Response.json({ error: errorMessage }, { status: 500 });
    }
}

