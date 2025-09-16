#!/usr/bin/env node

/**
 * Empty Value Removal Script
 * 
 * ALGORITHM:
 * 1. Load JSON file
 * 2. Recursively traverse all nested objects/arrays
 * 3. For each string value, check if it's empty (only whitespace)
 * 4. Remove empty string properties, preserve all other types
 * 5. Count operations and provide detailed logging
 * 6. Dry-run mode for safe testing
 * 
 * SAFETY MEASURES:
 * - Only removes string values that are empty/whitespace
 * - Preserves all numbers, booleans, null values, arrays, objects
 * - Detailed counting and logging
 * - Mandatory dry-run testing before real execution
 * - Use git for version control (no backup files needed)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const EN_DIR = path.join(LOCALES_DIR, 'en');

// Statistics tracking
let stats = {
    totalFiles: 0,
    totalKeys: 0,
    emptyStringKeys: 0,
    removedKeys: 0,
    preservedKeys: 0,
    errors: 0
};

function loadJson(filepath) {
    try {
        if (!fs.existsSync(filepath)) {
            console.error(`❌ File not found: ${filepath}`);
            return null;
        }
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error loading ${filepath}:`, error.message);
        stats.errors++;
        return null;
    }
}

function saveJson(filepath, data) {
    try {
        const content = JSON.stringify(data, null, 2) + '\n';
        fs.writeFileSync(filepath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`❌ Error saving ${filepath}:`, error.message);
        stats.errors++;
        return false;
    }
}


function isEmptyString(value) {
    // Only consider strings that are empty or contain only whitespace
    return typeof value === 'string' && value.trim() === '';
}

function countAllKeys(obj, path = '') {
    let count = 0;
    
    if (Array.isArray(obj)) {
        // Handle arrays
        obj.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            count += countAllKeys(item, itemPath);
        });
    } else if (obj && typeof obj === 'object' && obj !== null) {
        // Handle objects
        Object.keys(obj).forEach(key => {
            count++; // Count this key
            stats.totalKeys++;
            
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (isEmptyString(value)) {
                stats.emptyStringKeys++;
            }
            
            // Recursively count nested structures
            if (typeof value === 'object' && value !== null) {
                count += countAllKeys(value, currentPath);
            }
        });
    }
    
    return count;
}

function removeEmptyStrings(obj, path = '', dryRun = false) {
    const operations = [];
    
    if (Array.isArray(obj)) {
        // Handle arrays - recursively process items but don't remove them
        obj.forEach((item, index) => {
            const itemPath = path ? `${path}[${index}]` : `[${index}]`;
            if (typeof item === 'object' && item !== null) {
                const subOps = removeEmptyStrings(item, itemPath, dryRun);
                operations.push(...subOps);
            }
        });
    } else if (obj && typeof obj === 'object' && obj !== null) {
        // Handle objects
        const keysToRemove = [];
        
        Object.keys(obj).forEach(key => {
            const value = obj[key];
            const currentPath = path ? `${path}.${key}` : key;
            
            if (isEmptyString(value)) {
                // This is an empty string - mark for removal
                keysToRemove.push(key);
                operations.push({
                    action: 'remove',
                    path: currentPath,
                    value: `"${value}"`,
                    reason: 'empty string'
                });
                
                if (dryRun) {
                    console.log(`    [DRY RUN] Would remove: ${currentPath} = "${value}"`);
                } else {
                    console.log(`    🗑️  Removing: ${currentPath} = "${value}"`);
                }
                
            } else if (typeof value === 'object' && value !== null) {
                // Recursively process nested objects/arrays
                const subOps = removeEmptyStrings(value, currentPath, dryRun);
                operations.push(...subOps);
            } else {
                // Keep all other types (numbers, booleans, non-empty strings, null)
                stats.preservedKeys++;
            }
        });
        
        // Actually remove the keys (only in real mode)
        if (!dryRun) {
            keysToRemove.forEach(key => {
                delete obj[key];
                stats.removedKeys++;
            });
        } else {
            stats.removedKeys += keysToRemove.length;
        }
    }
    
    return operations;
}

function processFile(filename, dryRun = false) {
    const filepath = path.join(EN_DIR, filename);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 Processing: ${filename}`);
    console.log(`${'='.repeat(60)}`);
    
    // Load the file
    const data = loadJson(filepath);
    if (!data) {
        return { success: false, operations: [] };
    }
    
    // Reset per-file counters
    const beforeEmptyKeys = stats.emptyStringKeys;
    const beforeTotalKeys = stats.totalKeys;
    const beforePreservedKeys = stats.preservedKeys;
    
    // Count all keys before processing
    console.log(`🔍 Scanning for keys...`);
    const totalKeysInFile = countAllKeys(data);
    const emptyKeysInFile = stats.emptyStringKeys - beforeEmptyKeys;
    const totalKeysInFileActual = stats.totalKeys - beforeTotalKeys;
    
    console.log(`📊 File statistics:`);
    console.log(`   • Total keys found: ${totalKeysInFileActual}`);
    console.log(`   • Empty string keys: ${emptyKeysInFile}`);
    console.log(`   • Keys to preserve: ${totalKeysInFileActual - emptyKeysInFile}`);
    
    if (emptyKeysInFile === 0) {
        console.log(`✅ No empty strings found - file is clean!`);
        return { success: true, operations: [] };
    }
    
    
    // Process the file
    console.log(`\n${dryRun ? '🔍 DRY RUN - ' : '🔧 '}Processing empty strings:`);
    const operations = removeEmptyStrings(data, filename.replace('.json', ''), dryRun);
    
    // Save the modified file (only in real mode)
    if (!dryRun) {
        if (!saveJson(filepath, data)) {
            return { success: false, operations };
        }
        
        // Verify the save by reloading and counting
        const verifyData = loadJson(filepath);
        if (verifyData) {
            const verifyStats = { totalKeys: 0, emptyStringKeys: 0 };
            countAllKeys(verifyData);
            const newEmptyKeys = verifyStats.emptyStringKeys;
            console.log(`✅ Verification: ${newEmptyKeys} empty strings remaining`);
        }
    }
    
    const removedInFile = stats.removedKeys - (beforeEmptyKeys - emptyKeysInFile);
    console.log(`\n📊 ${dryRun ? 'DRY RUN ' : ''}Results for ${filename}:`);
    console.log(`   • ${dryRun ? 'Would remove' : 'Removed'}: ${operations.length} empty string keys`);
    console.log(`   • Preserved: ${totalKeysInFileActual - emptyKeysInFile} keys`);
    
    return { success: true, operations };
}

function getAllJsonFiles() {
    try {
        const files = fs.readdirSync(EN_DIR)
            .filter(file => file.endsWith('.json') && fs.statSync(path.join(EN_DIR, file)).isFile())
            .sort();
        return files;
    } catch (error) {
        console.error(`❌ Error reading directory ${EN_DIR}:`, error.message);
        return [];
    }
}

function parseArgs() {
    const args = process.argv.slice(2);
    return {
        dryRun: args.includes('--dry-run')
    };
}

function main() {
    const { dryRun } = parseArgs();
    
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║            Empty Value Removal - English Language              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
    if (dryRun) {
        console.log('\n🔍 DRY RUN MODE - No files will be modified');
        console.log('   Will process ALL English translation files');
    } else {
        console.log('\n⚠️  LIVE MODE - Will modify ALL English translation files');
        console.log('   Use git for version control');
    }
    
    // Check if EN directory exists
    if (!fs.existsSync(EN_DIR)) {
        console.error(`❌ English locales directory not found: ${EN_DIR}`);
        process.exit(1);
    }
    
    // Get all English files to process (language-centric approach)
    const allFiles = getAllJsonFiles();
    
    if (allFiles.length === 0) {
        console.error('❌ No English translation files found');
        process.exit(1);
    }
    
    console.log(`\n📋 Processing ALL English translation files: ${allFiles.length}`);
    allFiles.forEach(f => console.log(`   • ${f}`));
    
    if (!dryRun) {
        console.log('\n⚠️  WARNING: This will modify ALL English translation files');
        console.log('   Make sure you have committed your changes to git first!');
        console.log('   After cleaning English, run translation scripts to propagate to other languages');
    }
    
    // Reset global statistics
    stats = {
        totalFiles: allFiles.length,
        totalKeys: 0,
        emptyStringKeys: 0,
        removedKeys: 0,
        preservedKeys: 0,
        errors: 0
    };
    
    // Process each file
    const results = [];
    for (const filename of allFiles) {
        const result = processFile(filename, dryRun);
        results.push({ filename, ...result });
    }
    
    // Final summary
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`📊 FINAL SUMMARY`);
    console.log(`${'═'.repeat(80)}`);
    
    const successfulFiles = results.filter(r => r.success).length;
    const totalOperations = results.reduce((sum, r) => sum + r.operations.length, 0);
    
    console.log(`\n✅ Successfully processed: ${successfulFiles}/${stats.totalFiles} files`);
    console.log(`📊 Total keys scanned: ${stats.totalKeys}`);
    console.log(`🗑️  Empty strings ${dryRun ? 'found' : 'removed'}: ${stats.removedKeys}`);
    console.log(`✅ Keys preserved: ${stats.preservedKeys}`);
    
    if (stats.errors > 0) {
        console.log(`❌ Errors encountered: ${stats.errors}`);
    }
    
    if (dryRun) {
        console.log(`\n🎯 To execute these changes, run without --dry-run flag`);
        console.log(`   ${totalOperations} operations would be performed`);
    } else {
        console.log(`\n🎯 ${totalOperations} operations completed successfully!`);
        console.log(`   Use git to see changes: git diff`);
    }
    
    console.log('\n✨ Process complete!');
}

// Export functions for testing
export { removeEmptyStrings, countAllKeys, isEmptyString, loadJson };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}