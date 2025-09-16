#!/usr/bin/env node

/**
 * Prepare Legal Translation Files
 * This script creates the legal_[lang].json files for all 31 languages
 * copying the English content as a template for translation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 31 languages in the system
const languages = [
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'es', name: 'Spanish' },
  { code: 'fa', name: 'Persian' },
  { code: 'fil', name: 'Filipino' },
  { code: 'fr', name: 'French' },
  { code: 'ha', name: 'Hausa' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'mi', name: 'Māori' },
  { code: 'ms', name: 'Malay' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'sw', name: 'Swahili' },
  { code: 'ta', name: 'Tamil' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zh', name: 'Chinese' },
  { code: 'zu', name: 'Zulu' }
];

async function createLegalTranslationFile(lang) {
  try {
    // Read the English legal file
    const englishPath = path.join(__dirname, 'public', 'i18n', 'locales', 'en', 'legal_en.json');
    const englishContent = await fs.readFile(englishPath, 'utf-8');
    const englishData = JSON.parse(englishContent);
    
    // Create target directory if it doesn't exist
    const targetDir = path.join(__dirname, 'public', 'i18n', 'locales', lang.code);
    await fs.mkdir(targetDir, { recursive: true });
    
    // Check if file already exists
    const targetPath = path.join(targetDir, `legal_${lang.code}.json`);
    try {
      await fs.access(targetPath);
      console.log(`⚠️  ${lang.name} (${lang.code}): File already exists, skipping...`);
      return { status: 'skipped', language: lang };
    } catch (err) {
      // File doesn't exist, continue creating it
    }
    
    // Add a comment at the top of the file indicating it needs translation
    const fileContent = {
      "_comment": `This file needs to be translated to ${lang.name}. Currently contains English content as a template.`,
      ...englishData
    };
    
    // Write the file
    await fs.writeFile(targetPath, JSON.stringify(fileContent, null, 2), 'utf-8');
    console.log(`✓ ${lang.name} (${lang.code}): Created template file`);
    
    return { status: 'created', language: lang };
  } catch (error) {
    console.error(`✗ ${lang.name} (${lang.code}): Error - ${error.message}`);
    return { status: 'error', language: lang, error: error.message };
  }
}

async function main() {
  console.log('🚀 Legal Translation File Preparation');
  console.log('=====================================\n');
  
  console.log('This script creates legal_[lang].json files for all 31 languages');
  console.log('with English content as a template for translation.\n');
  
  const results = {
    created: [],
    skipped: [],
    errors: []
  };
  
  // Process all languages
  for (const lang of languages) {
    const result = await createLegalTranslationFile(lang);
    results[result.status] = results[result.status] || [];
    results[result.status].push(result.language);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`✓ Created: ${results.created.length} files`);
  console.log(`⚠️  Skipped: ${results.skipped.length} files (already exist)`);
  if (results.errors.length > 0) {
    console.log(`✗ Errors: ${results.errors.length}`);
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. The legal_[lang].json files have been created with English content');
  console.log('2. Each file contains a _comment field indicating it needs translation');
  console.log('3. You can now:');
  console.log('   - Manually translate each file');
  console.log('   - Use a translation service with API');
  console.log('   - Use the Google Translate website to translate the content');
  console.log('\n4. Important: After translation, remove the _comment field from each file');
  console.log('\n5. The i18n configuration has already been updated to load these files');
  console.log('   so they will work immediately once translated.');
  
  if (results.created.length > 0) {
    console.log(`\n📁 Files created in: public/i18n/locales/[lang]/legal_[lang].json`);
  }
}

// Run the script
main().catch(console.error);