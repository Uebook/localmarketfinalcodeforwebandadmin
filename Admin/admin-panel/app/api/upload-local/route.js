import { NextResponse } from 'next/server';
import { writeFile, mkdir, chmod } from 'fs/promises';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

// Use absolute path resolution for VPS environments
// This ensures that even if process.cwd() shifts during build/run, we target the correct public folder
const IMAGES_DIR = resolve(process.cwd(), 'public', 'images');
const PUBLIC_BASE_URL = 'https://admin.lokall.in/images';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request) {
    console.log(`[Upload Local] Received request at ${new Date().toISOString()}`);
    try {
        console.log(`[Upload Local] Target directory: ${IMAGES_DIR}`);
        // 1. Ensure the images directory exists
        try {
            if (!existsSync(IMAGES_DIR)) {
                console.log(`[Upload Local] Creating directory: ${IMAGES_DIR}`);
                await mkdir(IMAGES_DIR, { recursive: true });
            }
        } catch (dirError) {
            console.error(`[Upload Local] Directory Error:`, dirError.message);
            return NextResponse.json(
                { error: `Server storage configuration error: ${dirError.message}` },
                { status: 500, headers: corsHeaders }
            );
        }

        const contentType = request.headers.get('content-type') || '';
        
        let results = [];

        // CASE 1: JSON BASE64 UPLOAD (For Mobile Apps with network restrictions)
        if (contentType.includes('application/json')) {
            const body = await request.json();
            const { base64, fileName, mimeType } = body;

            if (!base64) {
                return NextResponse.json({ error: 'No base64 data provided' }, { status: 400, headers: corsHeaders });
            }

            const timestamp = Date.now();
            const safeName = (fileName || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
            const filename = `${timestamp}-${safeName}`;
            const filePath = join(IMAGES_DIR, filename);

            const buffer = Buffer.from(base64, 'base64');
            await writeFile(filePath, buffer);

            try { await chmod(filePath, 0o644); } catch (e) {}

            results.push({
                name: fileName,
                success: true,
                url: `${PUBLIC_BASE_URL}/${filename}`,
                size: buffer.length
            });
        } 
        // CASE 2: MULTIPART FORM DATA (Standard Web Upload)
        else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const files = formData.getAll('file');

            if (!files || files.length === 0) {
                return NextResponse.json(
                    { error: 'No files provided in the "file" field' },
                    { status: 400, headers: corsHeaders }
                );
            }

            console.log(`[Upload Local] Processing ${files.length} file(s)`);

            results = await Promise.all(files.map(async (file) => {
                try {
                    if (!file || typeof file.arrayBuffer !== 'function') {
                        return { name: file?.name || 'unknown', error: 'Invalid file object' };
                    }

                    const timestamp = Date.now();
                    const safeName = (file.name || 'upload.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
                    const filename = `${timestamp}-${safeName}`;
                    const filePath = join(IMAGES_DIR, filename);

                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    
                    await writeFile(filePath, buffer);
                    try { await chmod(filePath, 0o644); } catch (e) {}
                    
                    return {
                        name: file.name,
                        success: true,
                        url: `${PUBLIC_BASE_URL}/${filename}`,
                        size: file.size
                    };
                } catch (err) {
                    return { name: file?.name || 'unknown', error: err.message };
                }
            }));
        } else {
            return NextResponse.json(
                { error: 'Invalid Content-Type. Use multipart/form-data or application/json' },
                { status: 400, headers: corsHeaders }
            );
        }

        const successCount = results.filter(r => r.success).length;
        
        return NextResponse.json(
            { success: true, files: results, count: successCount },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('[Upload Local] Critical System Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}
