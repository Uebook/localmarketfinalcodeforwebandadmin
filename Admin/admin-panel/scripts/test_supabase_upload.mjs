import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`${name}="?([^"\\n]*)"?`));
    return match ? match[1] : null;
};

const SUPABASE_URL = getEnvVar('SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('SUPABASE_ANON_KEY');

async function testUpload() {
    console.log('--- Supabase Connection Test ---');
    console.log('URL:', SUPABASE_URL);
    console.log('Key length:', SUPABASE_KEY?.length);
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('❌ Error: Missing Supabase environment variables in .env.local');
        return;
    }

    const bucket = 'vendor-documents';
    const folder = 'test-uploads';
    const filename = `test-${Date.now()}.txt`;
    const filePath = `${folder}/${filename}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`;

    console.log(`Testing upload to bucket: ${bucket}`);
    console.log(`URL: ${uploadUrl}`);

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'apikey': SUPABASE_KEY,
                'Content-Type': 'text/plain',
                'x-upsert': 'true',
            },
            body: 'This is a test upload from antigravity script.',
        });

        const status = response.status;
        const text = await response.text();

        if (response.ok) {
            console.log('✅ Success! File uploaded successfully.');
            console.log('Public URL (if public):', `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`);
        } else {
            console.error(`❌ Failed with status ${status}`);
            console.error('Response:', text);
            
            if (status === 401 || status === 403) {
                console.error('💡 Suggestion: Your Supabase key might be invalid or doesn\'t have permission for this bucket.');
            } else if (status === 404) {
                console.error(`💡 Suggestion: The bucket "${bucket}" might not exist in your Supabase project.`);
            }
        }
    } catch (error) {
        console.error('❌ Fatal Error during request:', error.message);
        if (error.message.includes('fetch failed')) {
            console.error('💡 Suggestion: Cannot reach Supabase URL. Check your internet or if the URL is correct.');
        }
    }
}

testUpload();
