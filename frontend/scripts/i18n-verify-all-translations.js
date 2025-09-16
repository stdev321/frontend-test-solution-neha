#!/usr/bin/env node

/**
 * Comprehensive Translation Verification Script
 * Cross-references all empty values in common.json with their actual locations
 * across all translation files to determine if they're truly missing or duplicates.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const EN_DIR = path.join(LOCALES_DIR, 'en');

function loadJson(filepath) {
    try {
        if (!fs.existsSync(filepath)) return null;
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (error) {
        console.error(`Error loading ${filepath}:`, error.message);
        return null;
    }
}

function getAllJsonFiles() {
    const files = [];
    const entries = fs.readdirSync(EN_DIR);
    
    for (const entry of entries) {
        const fullPath = path.join(EN_DIR, entry);
        if (fs.statSync(fullPath).isFile() && entry.endsWith('.json')) {
            files.push(entry);
        }
    }
    
    return files.sort();
}

function findEmptyValues(obj, path = '') {
    const emptyValues = [];
    
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'string') {
            if (!value.trim()) {
                emptyValues.push(currentPath);
            }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            emptyValues.push(...findEmptyValues(value, currentPath));
        }
    }
    
    return emptyValues;
}

function getValueAtPath(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
    }, obj);
}

function searchForKeyInAllFiles(keyPath) {
    const results = [];
    const files = getAllJsonFiles();
    
    for (const filename of files) {
        const data = loadJson(path.join(EN_DIR, filename));
        if (!data) continue;
        
        const value = getValueAtPath(data, keyPath);
        if (value && typeof value === 'string' && value.trim()) {
            results.push({
                file: filename,
                value: value.trim()
            });
        }
    }
    
    return results;
}

function searchForPartialKeyInAllFiles(keyPath) {
    const results = [];
    const files = getAllJsonFiles();
    const keyParts = keyPath.split('.');
    
    for (const filename of files) {
        const data = loadJson(path.join(EN_DIR, filename));
        if (!data) continue;
        
        // Try different combinations of the key path
        for (let i = keyParts.length - 1; i >= 0; i--) {
            const partialKey = keyParts.slice(i).join('.');
            const value = getValueAtPath(data, partialKey);
            
            if (value && typeof value === 'string' && value.trim()) {
                results.push({
                    file: filename,
                    key: partialKey,
                    value: value.trim()
                });
            }
        }
    }
    
    return results;
}

function main() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║               Comprehensive Translation Verification            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    // Load common.json
    const commonPath = path.join(EN_DIR, 'common.json');
    const commonData = loadJson(commonPath);
    
    if (!commonData) {
        console.error('❌ Could not load common.json');
        process.exit(1);
    }
    
    // Find all empty values in common.json
    console.log('🔍 Scanning common.json for empty values...\n');
    const emptyKeys = findEmptyValues(commonData);
    
    console.log(`Found ${emptyKeys.length} empty values in common.json\n`);
    console.log('═'.repeat(80));
    
    const categories = {
        foundExact: [],
        foundPartial: [],
        truelyMissing: []
    };
    
    // Check each empty key
    for (const keyPath of emptyKeys) {
        console.log(`\n🔍 Checking: ${keyPath}`);
        
        // First, try exact match in all files
        const exactMatches = searchForKeyInAllFiles(keyPath);
        
        if (exactMatches.length > 0) {
            console.log(`  ✅ FOUND EXACT MATCHES:`);
            exactMatches.forEach(match => {
                console.log(`     📁 ${match.file}: "${match.value.substring(0, 60)}${match.value.length > 60 ? '...' : ''}"`);
            });
            categories.foundExact.push({
                key: keyPath,
                matches: exactMatches
            });
        } else {
            // Try partial/similar matches
            const partialMatches = searchForPartialKeyInAllFiles(keyPath);
            
            if (partialMatches.length > 0) {
                console.log(`  🔶 FOUND PARTIAL MATCHES:`);
                partialMatches.forEach(match => {
                    console.log(`     📁 ${match.file} (${match.key}): "${match.value.substring(0, 50)}${match.value.length > 50 ? '...' : ''}"`);
                });
                categories.foundPartial.push({
                    key: keyPath,
                    matches: partialMatches
                });
            } else {
                console.log(`  ❌ NO MATCHES FOUND`);
                categories.truelyMissing.push(keyPath);
            }
        }
    }
    
    // Summary Report
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('═'.repeat(80));
    
    console.log(`\n✅ Keys with EXACT matches in other files: ${categories.foundExact.length}`);
    if (categories.foundExact.length > 0) {
        console.log('   (These are likely duplicate entries that can be removed from common.json)');
    }
    
    console.log(`\n🔶 Keys with PARTIAL matches: ${categories.foundPartial.length}`);
    if (categories.foundPartial.length > 0) {
        console.log('   (These might need investigation - could be moved/renamed keys)');
    }
    
    console.log(`\n❌ Keys that are TRULY MISSING: ${categories.truelyMissing.length}`);
    if (categories.truelyMissing.length > 0) {
        console.log('   (These need actual English translations)');
        console.log('\n   Truly missing keys:');
        categories.truelyMissing.slice(0, 20).forEach(key => {
            console.log(`   • ${key}`);
        });
        if (categories.truelyMissing.length > 20) {
            console.log(`   ... and ${categories.truelyMissing.length - 20} more`);
        }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('🎯 RECOMMENDATIONS:');
    console.log('═'.repeat(80));
    
    if (categories.foundExact.length > 0) {
        console.log(`\n1. 🗑️  SAFE TO REMOVE: ${categories.foundExact.length} duplicate keys in common.json`);
        console.log('   These have exact matches in other files and can be removed.');
    }
    
    if (categories.foundPartial.length > 0) {
        console.log(`\n2. 🔍 INVESTIGATE: ${categories.foundPartial.length} keys with partial matches`);
        console.log('   These might be moved/renamed keys that need manual review.');
    }
    
    if (categories.truelyMissing.length > 0) {
        console.log(`\n3. ✍️  NEED TRANSLATIONS: ${categories.truelyMissing.length} truly missing keys`);
        console.log('   These need actual English text to be added.');
    }
    
    console.log('\n✨ Verification complete!');
}

main();