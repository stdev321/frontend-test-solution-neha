#!/usr/bin/env node

/**
 * i18n JSON Merge Tool
 * 
 * Merges two JSON files, preserving all keys from both sources.
 * If a key exists in both files, the current (first) file's value takes precedence.
 * This ensures we don't lose any translation work from either branch.
 * 
 * Usage:
 *   node scripts/i18n-merge-json.js <current-file> <old-file> [--output <output-file>] [--dry-run]
 * 
 * Example:
 *   node scripts/i18n-merge-json.js locales/en/pages.json locales/en/old-branch/pages-old.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Deep merge two objects, preserving all keys from both
 * If a key exists in both, current (obj1) takes precedence
 */
function deepMerge(current, old, path = '') {
    const result = {};
    const allKeys = new Set([
        ...Object.keys(current || {}),
        ...Object.keys(old || {})
    ]);

    for (const key of allKeys) {
        const fullPath = path ? `${path}.${key}` : key;
        const currentValue = current?.[key];
        const oldValue = old?.[key];

        // If key doesn't exist in current but exists in old, add it
        if (currentValue === undefined && oldValue !== undefined) {
            result[key] = oldValue;
            console.log(`${colors.green}+ Adding missing key: ${fullPath}${colors.reset}`);
        }
        // If both are objects, merge recursively
        else if (
            typeof currentValue === 'object' && 
            currentValue !== null && 
            !Array.isArray(currentValue) &&
            typeof oldValue === 'object' && 
            oldValue !== null && 
            !Array.isArray(oldValue)
        ) {
            result[key] = deepMerge(currentValue, oldValue, fullPath);
        }
        // Otherwise, use current value (it takes precedence)
        else {
            result[key] = currentValue;
            if (oldValue !== undefined && oldValue !== currentValue) {
                // Value exists in both but differs - current wins
                console.log(`${colors.yellow}~ Keeping current value for: ${fullPath}${colors.reset}`);
            }
        }
    }

    return result;
}

/**
 * Count total keys in nested object
 */
function countKeys(obj, path = '') {
    let count = 0;
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            count += countKeys(obj[key], path ? `${path}.${key}` : key);
        } else {
            count++;
        }
    }
    return count;
}

/**
 * Find keys that exist in old but not in current
 */
function findNewKeys(current, old, path = '') {
    const newKeys = [];
    
    for (const key in old) {
        const fullPath = path ? `${path}.${key}` : key;
        
        if (!(key in current)) {
            // Key doesn't exist in current
            if (typeof old[key] === 'object' && old[key] !== null && !Array.isArray(old[key])) {
                // Count all nested keys
                const nestedCount = countKeys(old[key]);
                newKeys.push({ path: fullPath, type: 'object', count: nestedCount });
            } else {
                newKeys.push({ path: fullPath, type: 'value', value: old[key] });
            }
        } else if (
            typeof current[key] === 'object' && 
            typeof old[key] === 'object' &&
            current[key] !== null && 
            old[key] !== null &&
            !Array.isArray(current[key]) && 
            !Array.isArray(old[key])
        ) {
            // Both are objects, recurse
            newKeys.push(...findNewKeys(current[key], old[key], fullPath));
        }
    }
    
    return newKeys;
}

/**
 * Main function
 */
function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2 || args.includes('--help')) {
        console.log('Usage: node i18n-merge-json.js <current-file> <old-file> [--output <output-file>] [--dry-run]');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/i18n-merge-json.js locales/en/pages.json locales/en/old-branch/pages-old.json');
        console.log('  node scripts/i18n-merge-json.js pages.json pages-old.json --dry-run');
        console.log('  node scripts/i18n-merge-json.js pages.json pages-old.json --output pages-merged.json');
        process.exit(0);
    }

    const currentFile = args[0];
    const oldFile = args[1];
    const dryRun = args.includes('--dry-run');
    const outputIndex = args.indexOf('--output');
    const outputFile = outputIndex > -1 && args[outputIndex + 1] ? args[outputIndex + 1] : currentFile;

    console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║           i18n JSON Merge Tool                              ║${colors.reset}`);
    console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log('');
    console.log(`Current file: ${colors.cyan}${currentFile}${colors.reset}`);
    console.log(`Old file:     ${colors.cyan}${oldFile}${colors.reset}`);
    console.log(`Output to:    ${colors.cyan}${outputFile}${colors.reset}`);
    
    if (dryRun) {
        console.log(`${colors.yellow}🔍 DRY RUN MODE - No files will be modified${colors.reset}`);
    }
    console.log('');

    // Read current file
    let currentData = {};
    if (fs.existsSync(currentFile)) {
        try {
            const content = fs.readFileSync(currentFile, 'utf8');
            currentData = JSON.parse(content);
            const keyCount = countKeys(currentData);
            console.log(`✓ Current file loaded: ${keyCount} keys`);
        } catch (error) {
            console.error(`${colors.red}✗ Error reading current file: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    } else {
        console.log(`${colors.yellow}⚠ Current file doesn't exist, will create new file${colors.reset}`);
    }

    // Read old file
    let oldData = {};
    if (!fs.existsSync(oldFile)) {
        console.error(`${colors.red}✗ Old file not found: ${oldFile}${colors.reset}`);
        process.exit(1);
    }
    
    try {
        const content = fs.readFileSync(oldFile, 'utf8');
        oldData = JSON.parse(content);
        const keyCount = countKeys(oldData);
        console.log(`✓ Old file loaded: ${keyCount} keys`);
    } catch (error) {
        console.error(`${colors.red}✗ Error reading old file: ${error.message}${colors.reset}`);
        process.exit(1);
    }

    console.log('');
    console.log(`${colors.cyan}Analyzing differences...${colors.reset}`);
    console.log('');

    // Find new keys that will be added
    const newKeys = findNewKeys(currentData, oldData);
    
    if (newKeys.length === 0) {
        console.log(`${colors.dim}No new keys found in old file${colors.reset}`);
    } else {
        console.log(`${colors.green}Found ${newKeys.length} new keys to add:${colors.reset}`);
        
        // Show first 10 new keys
        const showKeys = newKeys.slice(0, 10);
        showKeys.forEach(item => {
            if (item.type === 'object') {
                console.log(`  ${colors.green}+ ${item.path} (object with ${item.count} keys)${colors.reset}`);
            } else {
                const preview = JSON.stringify(item.value).substring(0, 50);
                console.log(`  ${colors.green}+ ${item.path}: ${preview}...${colors.reset}`);
            }
        });
        
        if (newKeys.length > 10) {
            console.log(`  ${colors.dim}... and ${newKeys.length - 10} more${colors.reset}`);
        }
    }

    console.log('');
    console.log(`${colors.cyan}Merging files...${colors.reset}`);
    
    // Perform the merge
    const mergedData = deepMerge(currentData, oldData);
    
    const mergedKeyCount = countKeys(mergedData);
    const currentKeyCount = countKeys(currentData);
    const addedKeys = mergedKeyCount - currentKeyCount;
    
    console.log('');
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✓ Merge complete!${colors.reset}`);
    console.log(`  Original keys: ${currentKeyCount}`);
    console.log(`  Keys added: ${colors.green}+${addedKeys}${colors.reset}`);
    console.log(`  Total keys: ${mergedKeyCount}`);
    
    if (!dryRun) {
        // Write the merged result
        try {
            const jsonContent = JSON.stringify(mergedData, null, 2);
            fs.writeFileSync(outputFile, jsonContent + '\n', 'utf8');
            console.log('');
            console.log(`${colors.green}✓ File saved to: ${outputFile}${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}✗ Error writing file: ${error.message}${colors.reset}`);
            process.exit(1);
        }
    } else {
        console.log('');
        console.log(`${colors.yellow}Dry run complete - no files were modified${colors.reset}`);
        console.log(`Run without --dry-run to save changes`);
    }
}

// Run the script
main();