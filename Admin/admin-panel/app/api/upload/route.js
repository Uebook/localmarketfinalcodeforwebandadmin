import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const bucket = formData.get('bucket') || 'vendor-documents';
        const folder = formData.get('folder') || 'general';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
        }

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `${folder}/${filename}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                'apikey': SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': file.type,
                'x-upsert': 'true',
            },
            body: buffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase Storage Error:', errorText);
            return NextResponse.json({ error: `Upload failed: ${errorText}` }, { status: response.status });
        }

        // Construct public URL
        // Note: This assumes the bucket is public. If not, a signed URL would be needed.
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            path: filePath,
        }, { status: 200 });
    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
