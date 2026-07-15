const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
    // We will simulate calling the Next.js API, or since we changed the file we can just query the endpoint if it is running locally.
    // Wait, the dev server is running at http://localhost:3000 (according to user metadata: "npm run dev (in /Users/vansh/ReactProject/LocalMarket/website, running for 1h30m33s)")
    try {
        const res = await fetch('http://localhost:3000/api/circles?city=Amritsar');
        const data = await res.json();
        console.log('Circles data from local API:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error fetching circles from local API:', e.message);
    }
}

test();
