#!/usr/bin/env node

/**
 * i18n Reset Language Script
 * 
 * This script resets a language's translation files to empty values while preserving
 * the exact schema from English. This is useful when you want to retranslate everything
 * from scratch after major text changes.
 * 
 * Usage:
 *   node scripts/i18n-reset-language.js <language-code> [--file <specific-file>] [--dry-run]
 * 
 * Examples:
 *   node scripts/i18n-reset-language.js tr                    # Reset all Turkish files
 *   node scripts/i18n-reset-language.js tr --file pages.json  # Reset only Turkish pages.json
 *   node scripts/i18n-reset-language.js all --dry-run         # Preview resetting all languages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const SOURCE_LANGUAGE = 'en';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    dim: '\x1b[2m'
};

/**
 * Create empty schema from source, setting all leaf values to empty strings
 */
function createEmptySchema(source) {
    const result = {};
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // Nested object - recurse
                result[key] = createEmptySchema(source[key]);
            } else {
                // Leaf node - set to empty string
                result[key] = '';
            }
        }
    }
    
    return result;
}

/**
 * Count keys in nested object
 */
function countKeys(obj) {
    let count = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                count += countKeys(obj[key]);
            } else {
                count++;
            }
        }
    }
    return count;
}

/**
 * Reset a specific file for a language
 */
function resetFile(language, filename, dryRun) {
    const sourcePath = path.join(LOCALES_DIR, SOURCE_LANGUAGE, filename);
    const targetPath = path.join(LOCALES_DIR, language, filename);
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
        console.log(`${colors.yellow}⚠ Source file not found: ${filename}${colors.reset}`);
        return false;
    }
    
    // Read source file
    let sourceData;
    try {
        const content = fs.readFileSync(sourcePath, 'utf8');
        sourceData = JSON.parse(content);
    } catch (error) {
        console.log(`${colors.red}✗ Error reading source: ${error.message}${colors.reset}`);
        return false;
    }
    
    // Create empty schema
    const emptyData = createEmptySchema(sourceData);
    const keyCount = countKeys(emptyData);
    
    if (!dryRun) {
        // Ensure target directory exists
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Write the empty schema
        const jsonContent = JSON.stringify(emptyData, null, 2);
        fs.writeFileSync(targetPath, jsonContent + '\n', 'utf8');
        console.log(`  ${colors.green}✓ Reset ${filename}: ${keyCount} keys emptied${colors.reset}`);
    } else {
        console.log(`  ${colors.cyan}Would reset ${filename}: ${keyCount} keys${colors.reset}`);
    }
    
    return true;
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`${colors.cyan}i18n Reset Language Script${colors.reset}`);
        console.log('');
        console.log('Usage: node scripts/i18n-reset-language.js <language-code> [options]');
        console.log('');
        console.log('Options:');
        console.log('  --file <filename>  Reset only specific file');
        console.log('  --dry-run         Preview without making changes');
        console.log('  all               Reset all languages (use with caution!)');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/i18n-reset-language.js tr');
        console.log('  node scripts/i18n-reset-language.js tr --file pages.json');
        console.log('  node scripts/i18n-reset-language.js all --dry-run');
        process.exit(0);
    }
    
    const language = args[0];
    const dryRun = args.includes('--dry-run');
    const fileIndex = args.indexOf('--file');
    const specificFile = fileIndex > -1 ? args[fileIndex + 1] : null;
    
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}          i18n Reset Language Tool                     ${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
    
    if (dryRun) {
        console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}`);
    }
    
    // Get languages to process
    let languages = [];
    if (language === 'all') {
        languages = fs.readdirSync(LOCALES_DIR)
            .filter(dir => {
                const dirPath = path.join(LOCALES_DIR, dir);
                return fs.statSync(dirPath).isDirectory() && dir !== SOURCE_LANGUAGE;
            })
            .sort();
        console.log(`\n${colors.yellow}⚠️  Resetting ALL ${languages.length} languages${colors.reset}`);
    } else {
        languages = [language];
        console.log(`\nResetting language: ${colors.cyan}${language}${colors.reset}`);
    }
    
    // Get files to process
    const sourceDir = path.join(LOCALES_DIR, SOURCE_LANGUAGE);
    let files = [];
    
    if (specificFile) {
        files = [specificFile];
        console.log(`File: ${colors.cyan}${specificFile}${colors.reset}`);
    } else {
        files = fs.readdirSync(sourceDir)
            .filter(file => file.endsWith('.json'))
            .sort();
        console.log(`Files to reset: ${files.length} JSON files`);
    }
    
    console.log('');
    
    // Process each language
    for (const lang of languages) {
        console.log(`${colors.magenta}Processing ${lang.toUpperCase()}:${colors.reset}`);
        
        let successCount = 0;
        for (const file of files) {
            if (resetFile(lang, file, dryRun)) {
                successCount++;
            }
        }
        
        console.log(`  ${colors.dim}Completed: ${successCount}/${files.length} files${colors.reset}`);
        console.log('');
    }
    
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
    
    if (dryRun) {
        console.log(`${colors.yellow}✨ Dry run complete. Run without --dry-run to apply changes.${colors.reset}`);
    } else {
        console.log(`${colors.green}✨ Reset complete!${colors.reset}`);
        console.log(`${colors.dim}All values have been set to empty strings.${colors.reset}`);
        console.log(`${colors.dim}Run the translation script to fill in new translations.${colors.reset}`);
    }
}

// Run the script
main();