import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { NextResponse } from 'next/server';
import { existsSync } from 'fs';

export async function GET(request, { params }) {
    const { filename } = params;
    const filePath = resolve(process.cwd(), 'public', 'images', filename);

    if (!existsSync(filePath)) {
        return new NextResponse('Image not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);
        
        // Determine content type based on extension
        const ext = filename.split('.').pop().toLowerCase();
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error(`[Image Server] Error serving ${filename}:`, error);
        return new NextResponse(`Error reading image: ${error.message}`, { status: 500 });
    }
}
