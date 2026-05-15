import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE_URL = 'https://admin.lokall.in';

async function testVPSUpload() {
    console.log(`--- Testing VPS Local Upload API: ${API_BASE_URL}/api/upload-local ---`);

    const formData = new FormData();
    const filePath = path.join(__dirname, 'test_vps_image.txt');
    fs.writeFileSync(filePath, 'Test content for VPS local storage');

    const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', blob, 'vps_test.txt');

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload-local`, {
            method: 'POST',
            body: formData,
        });

        const status = response.status;
        const result = await response.json();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body:`, JSON.stringify(result, null, 2));

        if (response.ok && result.success) {
            console.log('✅ Success! The VPS Local Upload API is working.');
            if (result.files && result.files[0] && result.files[0].url) {
                console.log(`🔗 Test Image URL: ${result.files[0].url}`);
            }
        } else {
            console.error('❌ Failed! The API returned an error:', result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Fatal Error:', error.message);
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testVPSUpload();
