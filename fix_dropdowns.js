const fs = require('fs');
const glob = require('glob');

// This script will just help me find which files have .map( => <option) or similar
// and I can manually fix them.

const files = glob.sync('/Users/vansh/ReactProject/LocalMarket/website/**/*.tsx');
let count = 0;
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('<select')) {
        console.log(file);
        count++;
    }
});
console.log('Total files with select:', count);
