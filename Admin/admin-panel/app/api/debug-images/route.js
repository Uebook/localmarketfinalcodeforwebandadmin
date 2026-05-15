import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { resolve } from 'path';
import { existsSync } from 'fs';

export async function GET() {
    const IMAGES_DIR = resolve(process.cwd(), 'public', 'images');
    
    try {
        if (!existsSync(IMAGES_DIR)) {
            return NextResponse.json({ 
                error: 'Directory does not exist', 
                path: IMAGES_DIR,
                cwd: process.cwd()
            });
        }
        
        const files = await readdir(IMAGES_DIR);
        return NextResponse.json({ 
            success: true, 
            path: IMAGES_DIR,
            cwd: process.cwd(),
            files: files 
        });
    } catch (error) {
        return NextResponse.json({ error: error.message });
    }
}
