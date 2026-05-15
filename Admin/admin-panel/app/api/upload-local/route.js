import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const IMAGES_DIR = join(process.cwd(), 'public', 'Images');
const PUBLIC_BASE_URL = 'https://admin.lokall.in/Images';


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request) {
    console.log(`[Upload Local] Received request from ${request.headers.get('user-agent')}`);
    try {
        // Ensure the Images directory exists
        await mkdir(IMAGES_DIR, { recursive: true });

        const contentType = request.headers.get('content-type') || '';

        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json(
                { error: 'Use multipart/form-data' },
                { status: 400, headers: corsHeaders }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('file');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400, headers: corsHeaders }
            );
        }

        const results = await Promise.all(files.map(async (file) => {
            try {
                if (!(file instanceof Blob)) {
                    return { error: 'Invalid file object' };
                }

                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filename = `${timestamp}-${safeName}`;
                const filePath = join(IMAGES_DIR, filename);

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                await writeFile(filePath, buffer);

                const publicUrl = `${PUBLIC_BASE_URL}/${filename}`;
                console.log(`[Upload Local] Saved: ${filePath} -> ${publicUrl}`);

                return {
                    name: file.name,
                    success: true,
                    url: publicUrl,
                };
            } catch (err) {
                console.error(`[Upload Local] Error saving file:`, err.message);
                return { name: file?.name || 'unknown', error: err.message };
            }
        }));

        const successCount = results.filter(r => r.success).length;
        return NextResponse.json(
            { success: true, files: results, count: successCount },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('[Upload Local] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}
