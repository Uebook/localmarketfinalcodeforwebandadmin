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

const headers = {
    'apikey': env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
};

// 1. Get all circles from locations
https.get(`${env.SUPABASE_URL}/rest/v1/locations?select=circle`, { headers }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const locations = JSON.parse(data);
        const uniqueMarketCircles = Array.from(new Set(locations.map(l => l.circle).filter(Boolean)));
        console.log('Unique circles in locations:', uniqueMarketCircles);
        
        // 2. Get all vendors
        https.get(`${env.SUPABASE_URL}/rest/v1/vendors?select=*`, { headers }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => {
                const vendors = JSON.parse(data2);
                console.log('Total vendors:', vendors.length);
                
                // Let's see if any vendor column matches any of the unique market circles
                uniqueMarketCircles.forEach(market => {
                    const matches = [];
                    vendors.forEach(v => {
                        const matchedCols = [];
                        for (const [col, val] of Object.entries(v)) {
                            if (val && typeof val === 'string' && val.toLowerCase().includes(market.toLowerCase())) {
                                matchedCols.push(`${col}: "${val}"`);
                            }
                        }
                        if (matchedCols.length > 0) {
                            matches.push({ vendor: v.name, matched: matchedCols });
                        }
                    });
                    if (matches.length > 0) {
                        console.log(`\nMarket "${market}" matched in vendors:`);
                        console.log(matches);
                    }
                });
            });
        });
    });
});
