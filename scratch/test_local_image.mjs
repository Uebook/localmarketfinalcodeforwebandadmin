import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_API_URL = 'http://localhost:3000';

async function testLocalImageUpload() {
    console.log(`--- Testing Local Image Upload API: ${LOCAL_API_URL}/api/upload-local ---`);

    const formData = new FormData();
    const jpgPath = path.join(__dirname, 'test_local.jpg');
    fs.writeFileSync(jpgPath, 'dummy local jpg content');

    const blob = new Blob([fs.readFileSync(jpgPath)], { type: 'image/jpeg' });
    formData.append('file', blob, 'test_local.jpg');

    try {
        const response = await fetch(`${LOCAL_API_URL}/api/upload-local`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log(`Response:`, JSON.stringify(result, null, 2));

        if (response.ok && result.success) {
            // The server will still return https://admin.lokall.in/images/... because it's hardcoded in route.js
            // But we can check if it's in public/images/ on our Mac
            const filename = result.files[0].url.split('/').pop();
            const localPath = path.join(process.cwd(), 'Admin/admin-panel/public/images', filename);
            
            console.log(`Checking local file: ${localPath}`);
            if (fs.existsSync(localPath)) {
                console.log('✅ Success! Local file was saved correctly.');
                
                // Now check if it's served locally
                const servedUrl = `${LOCAL_API_URL}/images/${filename}`;
                console.log(`🔗 Checking Served URL: ${servedUrl}`);
                
                const check = await fetch(servedUrl, { method: 'HEAD' });
                console.log(`URL Status: ${check.status}`);
                
                if (check.ok) {
                    console.log('✅ Success! Image is accessible locally.');
                } else {
                    console.error('❌ Failed! Image is NOT accessible locally (404).');
                }
            } else {
                console.error('❌ Failed! Local file was NOT saved.');
            }
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);
    }
}

testLocalImageUpload();
