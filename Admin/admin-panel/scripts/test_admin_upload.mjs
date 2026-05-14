import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE_URL = 'https://admin.lokall.in';

async function testAdminUpload() {
    console.log(`--- Testing Admin Upload API: ${API_BASE_URL}/api/upload ---`);
    
    const formData = new FormData();
    const filePath = path.join(__dirname, 'test_upload.txt');
    fs.writeFileSync(filePath, 'Test content from Mac simulation');
    
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', blob, 'mac_test.txt');
    formData.append('bucket', 'vendor-documents');
    formData.append('folder', 'mac-tests');

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body: ${text}`);

        if (response.ok) {
            console.log('✅ Success! The Admin API is working and can upload to Supabase.');
        } else {
            console.error('❌ Failed! The Admin API returned an error.');
        }
    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testAdminUpload();
