/**
 * Script to help identify components that need theme updates
 * This script lists all components that import COLORS directly
 * Run: node scripts/update-components-theme.js
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));

console.log('Components that need theme updates:\n');
files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes("from '../constants/colors'") || content.includes("from './constants/colors'")) {
    console.log(`- ${file}`);
  }
});

console.log('\nTo update a component:');
console.log('1. Replace: import { COLORS } from \'../constants/colors\';');
console.log('2. With: import { useThemeColors } from \'../hooks/useThemeColors\';');
console.log('3. Add: const COLORS = useThemeColors(); inside the component function');
