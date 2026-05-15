import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
    try {
        const { filename } = params;
        const filePath = path.join(process.cwd(), 'public', 'images', filename);

        if (!fs.existsSync(filePath)) {
            return new Response(`File not found: ${filename}`, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        
        const ext = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';

        return new Response(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new Response(`Fatal Error: ${error.message}`, { status: 500 });
    }
}
