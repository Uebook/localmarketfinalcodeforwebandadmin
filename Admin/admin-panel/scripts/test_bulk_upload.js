const fs = require('fs');
const path = require('path');

async function testBulkUpload() {
    console.log('Starting local bulk upload test...');
    
    // Create a dummy image file
    const filePath = path.join(__dirname, 'test_image_local.jpg');
    fs.writeFileSync(filePath, 'dummy image content');
    
    try {
        const formData = new FormData();
        
        // Simulating the way React Native/Fetch handles multiple files
        // In Node 18+, FormData is built-in.
        const blob = new Blob([fs.readFileSync(filePath)], { type: 'image/jpeg' });
        formData.append('file', blob, 'test_image_local.jpg');
        
        // Add another file
        formData.append('file', blob, 'test_image_local_2.jpg');
        
        formData.append('bucket', 'vendor-documents');
        formData.append('folder', 'test-automation');

        console.log('Sending request to https://admin.lokall.in/api/upload-bulk...');
        
        const response = await fetch('https://admin.lokall.in/api/upload-bulk', {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', response.status);
        const result = await response.json();
        console.log('Response:', JSON.stringify(result, null, 2));

        if (result.success && result.files && result.files.length === 2) {
            console.log('SUCCESS: Both files uploaded successfully.');
        } else {
            console.log('FAILURE: Upload did not return expected results.');
        }
    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        // Cleanup
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}

testBulkUpload();
