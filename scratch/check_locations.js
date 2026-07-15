const https = require('https');
const fs = require('fs');
const path = require('path');

// Read the .env.local file to get SUPABASE_URL and SUPABASE_ANON_KEY
const envPath = path.join(__dirname, '../website/.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
        }
        env[match[1]] = value;
    }
});

const url = `${env.SUPABASE_URL}/rest/v1/locations?select=city,state,town,circle`;
console.log('Fetching locations from:', url);

const headers = {
    'apikey': env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
};

https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('Total locations:', parsed.length);
            console.log('Sample locations:', parsed.slice(0, 15));
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching locations:', err);
});
