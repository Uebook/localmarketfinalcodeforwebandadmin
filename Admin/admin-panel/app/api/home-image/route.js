import { NextResponse } from 'next/server';
import { supabaseRestGet, supabaseRestPatch, supabaseRestInsert } from '../../../lib/supabaseAdminFetch';

export async function GET() {
    try {
        const result = await supabaseRestGet('/rest/v1/home_images?id=eq.default&select=*');
        const homeImage = result && result.length > 0 ? result[0] : null;
        return NextResponse.json({ homeImage });
    } catch (error) {
        console.error('Home Image GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { imageUrl, headline, headline_color, highlight_text, highlight_color, subheadline, subheadline_color, description, description_color } = body;

        // Check if the default row exists
        const existing = await supabaseRestGet('/rest/v1/home_images?id=eq.default');
        
        const payload = {
            updated_at: new Date().toISOString()
        };

        if (imageUrl !== undefined) payload.image_url = imageUrl;
        if (headline !== undefined) payload.headline = headline;
        if (headline_color !== undefined) payload.headline_color = headline_color;
        if (highlight_text !== undefined) payload.highlight_text = highlight_text;
        if (highlight_color !== undefined) payload.highlight_color = highlight_color;
        if (subheadline !== undefined) payload.subheadline = subheadline;
        if (subheadline_color !== undefined) payload.subheadline_color = subheadline_color;
        if (description !== undefined) payload.description = description;
        if (description_color !== undefined) payload.description_color = description_color;

        if (existing && existing.length > 0) {
             // Update it
             await supabaseRestPatch('/rest/v1/home_images?id=eq.default', payload);
        } else {
             // Create it
             payload.id = 'default';
             await supabaseRestInsert('/rest/v1/home_images', [payload]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Home Image POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        // Just set the image_url to null to delete it
        await supabaseRestPatch('/rest/v1/home_images?id=eq.default', {
            image_url: null,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Home Image DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
