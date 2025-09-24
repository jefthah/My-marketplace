#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ganti dengan domain asli Anda
const OLD_DOMAIN = 'https://your-domain.com';
const NEW_DOMAIN = 'https://my-marketplace-sigma.vercel.app'; // Domain Vercel

const filesToUpdate = [
  'index.html',
  'public/sitemap.xml',
  'src/components/SEOHead.tsx',
  'src/components/StructuredData.tsx',
  'src/pages/HomePage.tsx'
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(OLD_DOMAIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_DOMAIN);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

console.log('🔄 Updating URLs from', OLD_DOMAIN, 'to', NEW_DOMAIN);
console.log('');

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    updateFile(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('');
console.log('✨ URL update completed!');
console.log('');
console.log('📝 Next steps:');
console.log('1. Update your domain in Google Search Console');
console.log('2. Update sitemap.xml with your actual domain');
console.log('3. Test all URLs are working correctly');
