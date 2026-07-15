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

const url = `${env.SUPABASE_URL}/rest/v1/vendors?select=circle,status`;
console.log('Fetching from:', url);

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
            console.log('Total vendors:', parsed.length);
            console.log('Sample vendors:', parsed.slice(0, 10));
            
            const stats = {};
            parsed.forEach(v => {
                if (v.circle) {
                    if (!stats[v.circle]) stats[v.circle] = { active: 0, inactive: 0 };
                    if (v.status === 'Active') {
                        stats[v.circle].active++;
                    } else {
                        stats[v.circle].inactive++;
                    }
                }
            });
            console.log('Circle Stats:', stats);
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw response:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching vendors:', err);
});
