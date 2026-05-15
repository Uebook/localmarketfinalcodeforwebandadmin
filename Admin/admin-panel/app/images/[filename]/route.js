import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { existsSync } from 'fs';

export async function GET(request, { params }) {
    const { filename } = params;
    const filePath = resolve(process.cwd(), 'public', 'images', filename);

    if (!existsSync(filePath)) {
        return new Response('Image not found on disk', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);
        
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

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Content-Length': fileBuffer.length.toString(),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error(`[Image Server] Error serving ${filename}:`, error);
        return new Response(`Error reading image: ${error.message}`, { status: 500 });
    }
}
