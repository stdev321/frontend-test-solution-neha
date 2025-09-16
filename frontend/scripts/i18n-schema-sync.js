#!/usr/bin/env node

/**
 * i18n Schema Synchronization Script
 * 
 * This script ensures all language JSON files have the exact same structure as English.
 * - Uses English (en) as the source of truth
 * - Adds missing keys to other languages with empty string values
 * - REMOVES extra keys that don't exist in English
 * - Preserves existing translations
 * - Maintains the exact nested structure
 * 
 * Usage:
 *   node scripts/i18n-schema-sync.js chat.json     # Sync specific file (recommended)
 *   node scripts/i18n-schema-sync.js --all         # Sync all files (use with caution)
 *   node scripts/i18n-schema-sync.js chat.json --dry-run # Preview changes without saving
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const SOURCE_LANGUAGE = 'en';
const INDENT_SPACES = 2;

// Get command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const allFiles = args.includes('--all');
const specificFile = args.find(arg => arg.endsWith('.json') && !arg.startsWith('--'));

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

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Promisified version of readline question with input clearing
 */
function askQuestion(question) {
    return new Promise((resolve) => {
        // Clear any pending input
        if (process.stdin.readable) {
            process.stdin.read();
        }
        
        rl.question(question, (answer) => {
            // Immediately resolve with the answer
            resolve(answer);
        });
    });
}

/**
 * Deep merge objects, preserving existing values and adding missing keys with empty strings
 * ONLY includes keys that exist in source (removes extra keys)
 * @param {Object} source - The source structure (English)
 * @param {Object} target - The target object to merge into
 * @returns {Object} Merged object with EXACT source structure
 */
function deepMergeWithSchema(source, target = {}) {
    const result = {};
    
    // Process ONLY keys from source (ignores extra keys in target)
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // Nested object - recurse
                result[key] = deepMergeWithSchema(source[key], target[key] || {});
            } else {
                // Leaf node - use target value if exists, otherwise empty string
                if (target.hasOwnProperty(key)) {
                    result[key] = target[key];
                } else {
                    result[key] = '';  // New key - set to empty string
                }
            }
        }
    }
    
    // Note: We do NOT copy keys from target that don't exist in source
    // This ensures exact schema match with English
    
    return result;
}

/**
 * Count keys in a nested object
 */
function countKeys(obj, prefix = '') {
    let count = 0;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
            } else {
                count++;
            }
        }
    }
    return count;
}

/**
 * Find new keys that were added
 */
function findNewKeys(source, target, prefix = '') {
    const newKeys = [];
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                // Nested object
                if (!target[key] || typeof target[key] !== 'object') {
                    // Entire object is new
                    newKeys.push(fullKey);
                }
                newKeys.push(...findNewKeys(source[key], target[key] || {}, fullKey));
            } else {
                // Leaf node
                if (!target.hasOwnProperty(key)) {
                    newKeys.push(fullKey);
                }
            }
        }
    }
    
    return newKeys;
}

/**
 * Find extra keys that will be removed (exist in target but not in source)
 */
function findRemovedKeys(source, target, prefix = '') {
    const removedKeys = [];
    
    for (const key in target) {
        if (target.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (!source.hasOwnProperty(key)) {
                // This key doesn't exist in source - will be removed
                removedKeys.push(fullKey);
            } else if (typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                // Nested object - check recursively
                if (typeof source[key] === 'object' && source[key] !== null) {
                    removedKeys.push(...findRemovedKeys(source[key], target[key], fullKey));
                }
            }
        }
    }
    
    return removedKeys;
}

/**
 * Check and create missing files in target languages
 */
async function checkAndCreateMissingFiles(filename) {
    const sourcePath = path.join(LOCALES_DIR, SOURCE_LANGUAGE, filename);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
        return false; // Source doesn't exist, nothing to do
    }
    
    // Get all language directories
    const languages = fs.readdirSync(LOCALES_DIR)
        .filter(dir => {
            const dirPath = path.join(LOCALES_DIR, dir);
            return fs.statSync(dirPath).isDirectory() && dir !== SOURCE_LANGUAGE;
        })
        .sort();
    
    // Check which languages are missing this file
    const missingLanguages = [];
    for (const lang of languages) {
        const targetPath = path.join(LOCALES_DIR, lang, filename);
        if (!fs.existsSync(targetPath)) {
            missingLanguages.push(lang);
        }
    }
    
    // If files are missing, handle based on dry-run mode
    if (missingLanguages.length > 0) {
        if (dryRun) {
            // In dry-run mode, just report what would be created
            console.log(`\n${colors.yellow}[DRY RUN] File "${filename}" would be created in ${missingLanguages.length} language(s):${colors.reset}`);
            console.log(`   ${colors.dim}${missingLanguages.join(', ')}${colors.reset}`);
            return false; // Nothing actually created
        } else {
            // In normal mode, ask user if they want to create them
            console.log(`\n${colors.yellow}⚠️  File "${filename}" is missing in ${missingLanguages.length} language(s):${colors.reset}`);
            console.log(`   ${colors.dim}${missingLanguages.join(', ')}${colors.reset}`);
            
            const answer = await askQuestion(`${colors.cyan}   Create "${filename}" in all missing languages? (y/n): ${colors.reset}`);
            
            // Trim whitespace and convert to lowercase
            const cleanAnswer = answer.toString().trim().toLowerCase();
            
            // Check if user wants to create the files
            // Accept: y, yes, or just pressing enter (default yes)
            const shouldCreate = cleanAnswer === 'y' || 
                                cleanAnswer === 'yes' || 
                                cleanAnswer === '';
            
            if (shouldCreate) {
                console.log(`${colors.green}   Creating "${filename}" in ${missingLanguages.length} languages...${colors.reset}`);
                
                for (const lang of missingLanguages) {
                    const targetPath = path.join(LOCALES_DIR, lang, filename);
                    try {
                        // Create empty JSON file
                        fs.writeFileSync(targetPath, '{}', 'utf8');
                        console.log(`     ${colors.green}✓ Created ${lang}/${filename}${colors.reset}`);
                    } catch (error) {
                        console.log(`     ${colors.red}✗ Failed to create ${lang}/${filename}: ${error.message}${colors.reset}`);
                    }
                }
                
                console.log(`${colors.green}   Files created successfully!${colors.reset}`);
                return true; // Files were created
            } else {
                console.log(`${colors.dim}   Skipping file creation for "${filename}"${colors.reset}`);
                return false; // User declined
            }
        }
    }
    
    return false; // No missing files
}

/**
 * Process a single file across all languages
 */
async function processSingleFile(filename) {
    const sourcePath = path.join(LOCALES_DIR, SOURCE_LANGUAGE, filename);
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
        console.log(`${colors.red}✗ Source file not found: ${filename}${colors.reset}`);
        return;
    }
    
    // Read and parse source file
    let sourceData;
    try {
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        sourceData = JSON.parse(sourceContent);
    } catch (error) {
        console.log(`${colors.red}✗ Error reading source file ${filename}: ${error.message}${colors.reset}`);
        return;
    }
    
    const sourceKeyCount = countKeys(sourceData);
    console.log(`\n${colors.cyan}📄 Processing ${filename}${colors.reset}`);
    console.log(`   Source (${SOURCE_LANGUAGE}): ${sourceKeyCount} keys`);
    
    // Get all language directories
    const languages = fs.readdirSync(LOCALES_DIR)
        .filter(dir => {
            const dirPath = path.join(LOCALES_DIR, dir);
            return fs.statSync(dirPath).isDirectory() && dir !== SOURCE_LANGUAGE;
        })
        .sort();
    
    let totalUpdated = 0;
    let totalNewKeys = 0;
    
    // Process each language
    for (const lang of languages) {
        const targetPath = path.join(LOCALES_DIR, lang, filename);
        
        // File should exist now (either originally or we just created it)
        // But double-check just in case
        if (!fs.existsSync(targetPath)) {
            // This shouldn't happen if checkAndCreateMissingFiles was called
            console.log(`   ${colors.dim}${lang.toUpperCase()}: File not found (skipping)${colors.reset}`);
            continue;
        }
        
        // Read existing target file
        let targetData;
        try {
            const targetContent = fs.readFileSync(targetPath, 'utf8');
            targetData = JSON.parse(targetContent);
        } catch (error) {
            console.log(`   ${colors.red}${lang.toUpperCase()}: Error reading file - ${error.message}${colors.reset}`);
            continue;
        }
        
        // Find new keys and removed keys before merge
        const newKeys = findNewKeys(sourceData, targetData);
        const removedKeys = findRemovedKeys(sourceData, targetData);
        
        // Merge source schema into target (this will add missing and remove extra)
        const mergedData = deepMergeWithSchema(sourceData, targetData);
        
        // Check if there were changes
        const hasChanges = newKeys.length > 0 || removedKeys.length > 0;
        
        if (hasChanges) {
            if (!dryRun) {
                // Write the merged data back
                const jsonContent = JSON.stringify(mergedData, null, INDENT_SPACES);
                fs.writeFileSync(targetPath, jsonContent + '\n', 'utf8');
            }
            
            // Display changes
            if (newKeys.length > 0) {
                console.log(`   ${colors.green}✓ ${lang.toUpperCase()}: +${newKeys.length} keys${colors.reset}`);
                // Show first few new keys
                const showKeys = newKeys.slice(0, 3);
                showKeys.forEach(key => {
                    console.log(`     ${colors.green}+ ${key}${colors.reset}`);
                });
                if (newKeys.length > 3) {
                    console.log(`     ${colors.dim}... and ${newKeys.length - 3} more${colors.reset}`);
                }
            }
            
            if (removedKeys.length > 0) {
                console.log(`   ${colors.red}✓ ${lang.toUpperCase()}: -${removedKeys.length} keys${colors.reset}`);
                // Show first few removed keys
                const showKeys = removedKeys.slice(0, 3);
                showKeys.forEach(key => {
                    console.log(`     ${colors.red}- ${key}${colors.reset}`);
                });
                if (removedKeys.length > 3) {
                    console.log(`     ${colors.dim}... and ${removedKeys.length - 3} more removed${colors.reset}`);
                }
            }
            
            totalUpdated++;
            totalNewKeys += newKeys.length;
        } else {
            console.log(`   ${colors.dim}${lang.toUpperCase()}: Already in sync${colors.reset}`);
        }
    }
    
    if (totalUpdated > 0) {
        console.log(`   ${colors.yellow}Updated ${totalUpdated} languages, added ${totalNewKeys} total keys${colors.reset}`);
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                i18n Schema Synchronization Tool                    ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝');
    
    // Check for valid arguments
    if (!specificFile && !allFiles) {
        console.log(`\n${colors.red}❌ Error: You must specify a filename or use --all flag${colors.reset}`);
        console.log(`\n${colors.cyan}Usage:${colors.reset}`);
        console.log(`  node scripts/i18n-schema-sync.js chat.json         # Sync specific file`);
        console.log(`  node scripts/i18n-schema-sync.js chat.json --dry-run # Preview changes`);
        console.log(`  node scripts/i18n-schema-sync.js --all             # Sync all files (use with caution)`);
        console.log(`  node scripts/i18n-schema-sync.js --all --dry-run   # Preview all changes`);
        console.log(`\n${colors.yellow}Tip: Always use --dry-run first to preview changes${colors.reset}`);
        process.exit(1);
    }
    
    if (dryRun) {
        console.log(`\n${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}`);
    }
    
    const sourceDir = path.join(LOCALES_DIR, SOURCE_LANGUAGE);
    
    if (specificFile) {
        // Process single file
        console.log(`\n📄 Processing single file: ${specificFile}`);
        
        // Check and create missing files if needed
        await checkAndCreateMissingFiles(specificFile);
        
        // Process the file
        await processSingleFile(specificFile);
    } else if (allFiles) {
        // Process all JSON files in source directory
        console.log(`\n${colors.yellow}⚠️  Processing ALL files - this will sync all language files${colors.reset}`);
        
        const files = fs.readdirSync(sourceDir)
            .filter(file => file.endsWith('.json'))
            .sort();
        
        console.log(`📂 Found ${files.length} source files to process`);
        
        for (const file of files) {
            // Check and create missing files if needed
            await checkAndCreateMissingFiles(file);
            
            // Process the file
            await processSingleFile(file);
        }
    }
    
    console.log('\n' + '═'.repeat(70));
    
    if (dryRun) {
        console.log(`${colors.yellow}✨ Dry run complete. Run without --dry-run to apply changes.${colors.reset}`);
    } else {
        console.log(`${colors.green}✨ Schema synchronization complete!${colors.reset}`);
        console.log(`${colors.dim}   Keys have been added/removed to match English exactly.${colors.reset}`);
        console.log(`${colors.dim}   Run the translation script next to fill empty values.${colors.reset}`);
    }
    
    // Close readline interface
    rl.close();
}

// Run the script
main();