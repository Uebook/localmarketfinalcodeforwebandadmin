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

const url = `${env.SUPABASE_URL}/rest/v1/vendors?select=city,town,tehsil,sub_tehsil,circle,status`;
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
            console.log('Total records:', parsed.length);
            
            const towns = new Set();
            const tehsils = new Set();
            const sub_tehsils = new Set();
            const circles = new Set();
            
            parsed.forEach(v => {
                if (v.town) towns.add(v.town);
                if (v.tehsil) tehsils.add(v.tehsil);
                if (v.sub_tehsil) sub_tehsils.add(v.sub_tehsil);
                if (v.circle) circles.add(v.circle);
            });
            
            console.log('Unique Towns on vendors:', Array.from(towns));
            console.log('Unique Tehsils on vendors:', Array.from(tehsils));
            console.log('Unique Sub-Tehsils on vendors:', Array.from(sub_tehsils));
            console.log('Unique Circles on vendors:', Array.from(circles));
            
            console.log('\nMatching vendor details counts:');
            const combinations = {};
            parsed.forEach(v => {
                const key = `Town:${v.town} | Tehsil:${v.tehsil} | Sub-Tehsil:${v.sub_tehsil} | Circle:${v.circle}`;
                combinations[key] = (combinations[key] || 0) + 1;
            });
            console.log(combinations);
        } catch (e) {
            console.error('Error:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err);
});
