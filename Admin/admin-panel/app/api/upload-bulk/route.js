import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request) {
    console.log(`[API] Received bulk upload request from ${request.headers.get('user-agent')}`);
    try {
        const contentType = request.headers.get('content-type') || '';
        console.log(`[API] Content-Type: ${contentType}`);

        // 1. Validation check for environment
        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Supabase configuration');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500, headers: corsHeaders });
        }

        // Case 1: JSON Request - Generate Signed URLs
        if (contentType.includes('application/json')) {
            const body = await request.json().catch(() => ({}));
            const { files, bucket: rawBucket = 'vendor-documents', folder: rawFolder = 'general' } = body;
            const bucket = rawBucket.toString().trim();
            const folder = rawFolder.toString().trim();

            if (!files || !Array.isArray(files)) {
                return NextResponse.json({ error: 'files array is required in JSON body' }, { status: 400, headers: corsHeaders });
            }

            const results = await Promise.all(files.map(async (fileInfo) => {
                const { name, type } = fileInfo;
                if (!name) return { error: 'Filename is required for each file' };

                const filename = `${Date.now()}-${name.replace(/\s+/g, '_')}`;
                const filePath = `${folder}/${filename}`;

                try {
                    const signUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${filePath}`;
                    
                    const response = await fetch(signUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ expiresIn: 3600 }),
                    });

                    if (!response.ok) {
                        const errorMsg = await response.text();
                        return { name, error: `Storage error: ${errorMsg}` };
                    }

                    const data = await response.json();
                    const signedUrl = `${SUPABASE_URL}/storage/v1${data.url}`;
                    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

                    return {
                        name,
                        path: filePath,
                        signedUrl,
                        publicUrl,
                        method: 'PUT'
                    };
                } catch (e) {
                    return { name, error: e.message };
                }
            }));

            return NextResponse.json({ success: true, files: results }, { status: 200, headers: corsHeaders });
        }

        // Case 2: FormData Request - Direct Upload
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const files = formData.getAll('file');
            const bucket = (formData.get('bucket') || 'vendor-documents').toString().trim();
            const folder = (formData.get('folder') || 'general').toString().trim();

            if (!files || files.length === 0) {
                return NextResponse.json({ error: 'No files provided in form data' }, { status: 400, headers: corsHeaders });
            }

            const results = await Promise.all(files.map(async (file) => {
                try {
                    if (!(file instanceof Blob)) {
                        return { error: 'Invalid file object' };
                    }

                    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
                    const filePath = `${folder}/${filename}`;
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;
                    const response = await fetch(uploadUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                            'apikey': SUPABASE_SERVICE_ROLE_KEY,
                            'Content-Type': file.type || 'application/octet-stream',
                            'x-upsert': 'true',
                        },
                        body: buffer,
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        return { name: file.name, error: `Upload failed: ${errorText}` };
                    }

                    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;
                    return {
                        name: file.name,
                        success: true,
                        url: publicUrl,
                        path: filePath,
                    };
                } catch (err) {
                    return { name: file?.name || 'unknown', error: err.message };
                }
            }));

            return NextResponse.json({ success: true, files: results }, { status: 200, headers: corsHeaders });
        }

        return NextResponse.json({ error: 'Unsupported content type. Use application/json or multipart/form-data' }, { status: 400, headers: corsHeaders });

    } catch (error) {
        console.error('Bulk Upload API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}
