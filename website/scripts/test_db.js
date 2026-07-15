const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
    const key = process.env.SUPABASE_ANON_KEY;
    try {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/vendors?city=eq.Amritsar&select=name,city,town,circle,status`, {
            headers: { apikey: key, Authorization: `Bearer ${key}` }
        });
        const vendors = await res.json();
        console.log('Amritsar Vendors in DB:', vendors);
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
