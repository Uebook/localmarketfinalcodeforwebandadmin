import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE_URL = 'https://lokall.in';

async function testVPSImageUpload() {
    console.log(`--- Testing VPS Image Upload API: ${API_BASE_URL}/api/upload-local ---`);

    const formData = new FormData();
    const filePath = '/Users/vansh/ReactProject/LocalMarket/Admin/admin-panel/scripts/test_upload.txt'; // Using an existing file
    
    // Actually, I'll just create a dummy jpg file
    const jpgPath = path.join(__dirname, 'test_vps.jpg');
    fs.writeFileSync(jpgPath, 'dummy jpg content');

    const blob = new Blob([fs.readFileSync(jpgPath)], { type: 'image/jpeg' });
    formData.append('file', blob, 'test_vps.jpg');

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload-local`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log(`Response:`, JSON.stringify(result, null, 2));

        if (response.ok && result.success) {
            const url = result.files[0].url;
            console.log(`🔗 Checking URL: ${url}`);
            
            // Wait 2 seconds for static serving to pick it up if there's any lag
            await new Promise(r => setTimeout(r, 2000));
            
            const check = await fetch(url, { method: 'HEAD' });
            console.log(`URL Status: ${check.status}`);
            
            if (check.ok) {
                console.log('✅ Success! Image is accessible.');
            } else {
                console.error('❌ Failed! Image is NOT accessible (404).');
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);
    }
}

testVPSImageUpload();
