#!/usr/bin/env node

/**
 * i18n Key-Value Validation Script
 * 
 * This script validates translation keys and values across ALL languages and files.
 * It performs comprehensive validation checks:
 * 1. English files: All keys have non-empty values
 * 2. All target languages: Have all keys that exist in English  
 * 3. All target languages: All keys have non-empty values
 * 4. Reports completion statistics and identifies issues
 * 
 * Usage: node i18n-key-validation.js [--dry-run] [--json] [--summary]
 *   --dry-run   Show what would be validated without running checks
 *   --json      Output results in JSON format for automation
 *   --summary   Show only summary statistics (for CI/CD)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const SOURCE_LANGUAGE = 'en';

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    
    return {
        dryRun: args.includes('--dry-run'),
        format: args.includes('--json') ? 'json' : 
                args.includes('--summary') ? 'summary' : 
                'human'
    };
}

// Get all language folders
function getLanguageFolders() {
    return fs.readdirSync(LOCALES_DIR)
        .filter(item => {
            const itemPath = path.join(LOCALES_DIR, item);
            return fs.statSync(itemPath).isDirectory() && item !== 'en'; // Exclude source
        })
        .sort();
}

// Get all JSON files from English directory (our source files)
function getSourceFiles() {
    const enDir = path.join(LOCALES_DIR, SOURCE_LANGUAGE);
    return fs.readdirSync(enDir)
        .filter(file => file.endsWith('.json') && !file.startsWith('.'))
        .sort();
}

// Normalize filename to handle language suffixes
function normalizeFilename(filename, language) {
    // Remove .json extension
    let normalized = filename.replace('.json', '');
    
    // For files that need suffixes in certain languages
    const suffixedFiles = ['aiAccuracyWhitepaper', 'ai_personas', 'legal'];
    if (suffixedFiles.includes(normalized)) {
        return `${normalized}_${language}.json`;
    }
    
    return filename; // Keep original filename for most files
}

// Load and parse JSON file
function loadJsonFile(language, filename) {
    const normalizedFilename = normalizeFilename(filename, language);
    const filePath = path.join(LOCALES_DIR, language, normalizedFilename);
    
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return { error: `Failed to parse JSON: ${error.message}` };
    }
}

// Extract all keys from an object (handles nested objects and arrays)
function extractKeys(obj, prefix = '') {
    let keys = [];
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (Array.isArray(obj[key])) {
                // Handle arrays
                obj[key].forEach((item, index) => {
                    if (item && typeof item === 'object') {
                        keys = keys.concat(extractKeys(item, `${fullKey}[${index}]`));
                    } else {
                        keys.push(`${fullKey}[${index}]`);
                    }
                });
            } else if (obj[key] && typeof obj[key] === 'object') {
                // Nested object - recurse
                keys = keys.concat(extractKeys(obj[key], fullKey));
            } else {
                // Leaf node - add the key
                keys.push(fullKey);
            }
        }
    }
    
    return keys.sort();
}

// Check if a value is empty
function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    return false;
}

// Get value by key path (handles nested keys and arrays)
function getValueByPath(obj, keyPath) {
    const parts = keyPath.split(/[\.\[\]]+/).filter(part => part !== '');
    let current = obj;
    
    for (const part of parts) {
        if (current && typeof current === 'object') {
            const index = parseInt(part);
            if (!isNaN(index) && Array.isArray(current)) {
                current = current[index];
            } else if (part in current) {
                current = current[part];
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }
    
    return current;
}

// Validate a single file for a language
function validateFileForLanguage(language, filename, sourceData) {
    const data = loadJsonFile(language, filename);
    
    if (data === null) {
        return {
            filename,
            status: 'FILE_NOT_FOUND',
            normalizedFilename: normalizeFilename(filename, language)
        };
    }
    
    if (data.error) {
        return {
            filename,
            status: 'PARSE_ERROR',
            error: data.error
        };
    }
    
    const sourceKeys = extractKeys(sourceData);
    const languageKeys = extractKeys(data);
    const missingKeys = [];
    const emptyValues = [];
    const extraKeys = [];
    
    // Check for missing keys and empty values
    sourceKeys.forEach(key => {
        if (!languageKeys.includes(key)) {
            missingKeys.push(key);
        } else {
            const value = getValueByPath(data, key);
            if (isEmptyValue(value)) {
                emptyValues.push(key);
            }
        }
    });
    
    // Check for extra keys (not in source)
    languageKeys.forEach(key => {
        if (!sourceKeys.includes(key)) {
            extraKeys.push(key);
        }
    });
    
    const totalKeys = sourceKeys.length;
    const foundKeys = totalKeys - missingKeys.length;
    const filledKeys = foundKeys - emptyValues.length;
    
    return {
        filename,
        status: 'OK',
        totalKeys,
        foundKeys,
        filledKeys,
        missingKeys,
        emptyValues,
        extraKeys,
        completeness: totalKeys > 0 ? ((foundKeys / totalKeys) * 100).toFixed(1) : '100.0',
        fillRate: totalKeys > 0 ? ((filledKeys / totalKeys) * 100).toFixed(1) : '100.0'
    };
}

// Validate all files for a language
function validateLanguage(language, sourceFiles) {
    const fileResults = [];
    let totalSourceKeys = 0;
    let totalFoundKeys = 0;
    let totalFilledKeys = 0;
    let totalMissingKeys = 0;
    let totalEmptyValues = 0;
    let totalExtraKeys = 0;
    
    sourceFiles.forEach(filename => {
        const sourceData = loadJsonFile(SOURCE_LANGUAGE, filename);
        
        if (sourceData === null || sourceData.error) {
            // Skip files that don't exist or have errors in source
            return;
        }
        
        const fileResult = validateFileForLanguage(language, filename, sourceData);
        fileResults.push(fileResult);
        
        if (fileResult.status === 'OK') {
            totalSourceKeys += fileResult.totalKeys;
            totalFoundKeys += fileResult.foundKeys;
            totalFilledKeys += fileResult.filledKeys;
            totalMissingKeys += fileResult.missingKeys.length;
            totalEmptyValues += fileResult.emptyValues.length;
            totalExtraKeys += fileResult.extraKeys.length;
        }
    });
    
    const filesWithIssues = fileResults.filter(f => 
        f.status !== 'OK' || f.missingKeys.length > 0 || f.emptyValues.length > 0
    ).length;
    
    return {
        language,
        totalFiles: fileResults.length,
        filesWithIssues,
        totalSourceKeys,
        totalFoundKeys,
        totalFilledKeys,
        totalMissingKeys,
        totalEmptyValues,
        totalExtraKeys,
        overallCompleteness: totalSourceKeys > 0 ? ((totalFoundKeys / totalSourceKeys) * 100).toFixed(1) : '100.0',
        overallFillRate: totalSourceKeys > 0 ? ((totalFilledKeys / totalSourceKeys) * 100).toFixed(1) : '100.0',
        files: fileResults
    };
}

// Validate source (English) files
function validateSourceFiles(sourceFiles) {
    const fileResults = [];
    let totalEmptyValues = 0;
    
    sourceFiles.forEach(filename => {
        const data = loadJsonFile(SOURCE_LANGUAGE, filename);
        
        if (data === null) {
            fileResults.push({
                filename,
                status: 'FILE_NOT_FOUND'
            });
            return;
        }
        
        if (data.error) {
            fileResults.push({
                filename,
                status: 'PARSE_ERROR',
                error: data.error
            });
            return;
        }
        
        const keys = extractKeys(data);
        const emptyValues = [];
        
        keys.forEach(key => {
            const value = getValueByPath(data, key);
            if (isEmptyValue(value)) {
                emptyValues.push(key);
            }
        });
        
        totalEmptyValues += emptyValues.length;
        
        fileResults.push({
            filename,
            status: 'OK',
            totalKeys: keys.length,
            emptyValues: emptyValues.length,
            emptyKeys: emptyValues
        });
    });
    
    return {
        totalFiles: fileResults.length,
        totalEmptyValues,
        files: fileResults
    };
}

// Main validation function
function validateTranslations() {
    const options = parseArgs();
    
    if (options.dryRun) {
        return showDryRun(options);
    }
    
    const sourceFiles = getSourceFiles();
    const languages = getLanguageFolders(); // Always validate all languages
    
    // Validate source files
    const sourceValidation = validateSourceFiles(sourceFiles);
    
    // Validate target languages
    const languageResults = [];
    languages.forEach(lang => {
        const result = validateLanguage(lang, sourceFiles);
        languageResults.push(result);
    });
    
    return {
        sourceLanguage: SOURCE_LANGUAGE,
        sourceValidation,
        targetLanguages: 'all',
        totalLanguages: languageResults.length,
        languages: languageResults,
        summary: {
            fullyComplete: languageResults.filter(l => l.totalMissingKeys === 0 && l.totalEmptyValues === 0).length,
            partiallyComplete: languageResults.filter(l => l.overallCompleteness >= 80 && l.overallFillRate >= 80 && (l.totalMissingKeys > 0 || l.totalEmptyValues > 0)).length,
            hasIssues: languageResults.filter(l => l.overallCompleteness < 80 || l.overallFillRate < 80).length,
            totalMissingKeys: languageResults.reduce((sum, l) => sum + l.totalMissingKeys, 0),
            totalEmptyValues: languageResults.reduce((sum, l) => sum + l.totalEmptyValues, 0)
        }
    };
}

// Show what would be validated (dry run)
function showDryRun(options) {
    const sourceFiles = getSourceFiles();
    const languages = getLanguageFolders();
    
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                     i18n Validation Dry Run                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📁 Source Directory: ${path.relative(process.cwd(), LOCALES_DIR)}`);
    console.log(`🔤 Source Language: ${SOURCE_LANGUAGE}`);
    console.log(`📄 Source Files (${sourceFiles.length}): ${sourceFiles.join(', ')}\n`);
    
    console.log(`🌍 Target Languages (${languages.length}): ${languages.join(', ')}`);
    
    console.log('\n📋 Comprehensive Validation Plan:');
    console.log('   1. Check English source files for empty values');
    console.log('   2. For each target language:');
    console.log('      • Verify all source files exist');
    console.log('      • Check for missing keys');
    console.log('      • Check for empty values');
    console.log('      • Report extra keys');
    console.log('      • Calculate completion statistics');
    console.log('   3. Generate overall summary and completion report');
    
    console.log('\n✨ Use without --dry-run to execute full validation');
    
    return null;
}

// Output formatters
function outputHuman(results) {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                  i18n Language Validation Report                   ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    
    // Enhanced Source validation with comprehensive statistics
    console.log(`🔤 Source Language: ${results.sourceLanguage.toUpperCase()}`);
    console.log(`📄 Source Files: ${results.sourceValidation.totalFiles}`);
    
    // Calculate comprehensive statistics
    let totalKeys = 0;
    let totalValidKeys = 0;
    let totalEmptyKeys = 0;
    
    results.sourceValidation.files.forEach(file => {
        const fileKeys = file.totalKeys || 0;
        const fileEmpty = file.emptyValues || 0;
        totalKeys += fileKeys;
        totalValidKeys += (fileKeys - fileEmpty);
        totalEmptyKeys += fileEmpty;
    });
    
    console.log(`📊 English Language Statistics:`);
    console.log(`   • Total key-value pairs: ${totalKeys.toLocaleString()}`);
    console.log(`   • Valid translations: ${totalValidKeys.toLocaleString()} (${((totalValidKeys / totalKeys) * 100).toFixed(1)}%)`);
    console.log(`   • Empty values: ${totalEmptyKeys} (${((totalEmptyKeys / totalKeys) * 100).toFixed(1)}%)`);
    
    if (results.sourceValidation.totalEmptyValues > 0) {
        console.log(`\n⚠️  Empty values breakdown by file:`);
        results.sourceValidation.files.forEach(file => {
            if (file.emptyValues > 0) {
                const percentage = ((file.emptyValues / file.totalKeys) * 100).toFixed(1);
                console.log(`   • ${file.filename}: ${file.emptyValues}/${file.totalKeys} (${percentage}%)`);
            }
        });
        console.log(`\n🎯 English Quality Score: ${((totalValidKeys / totalKeys) * 100).toFixed(1)}% complete`);
    } else {
        console.log(`\n✅ Perfect! All ${totalKeys.toLocaleString()} English keys have values`);
        console.log(`🎯 English Quality Score: 100% complete`);
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════════\n');
    console.log('📊 Summary:');
    console.log(`   • Total Languages: ${results.totalLanguages}`);
    console.log(`   • Fully Complete: ${results.summary.fullyComplete}`);
    console.log(`   • Partially Complete: ${results.summary.partiallyComplete}`);
    console.log(`   • Has Issues: ${results.summary.hasIssues}`);
    console.log(`   • Total Missing Keys: ${results.summary.totalMissingKeys}`);
    console.log(`   • Total Empty Values: ${results.summary.totalEmptyValues}\n`);
    
    console.log('═══════════════════════════════════════════════════════════════════════\n');
    console.log('🌍 Language Details:\n');
    
    // Sort by overall completion
    const sortedLanguages = [...results.languages].sort((a, b) => {
        const aScore = parseFloat(a.overallCompleteness) + parseFloat(a.overallFillRate);
        const bScore = parseFloat(b.overallCompleteness) + parseFloat(b.overallFillRate);
        return bScore - aScore; // Higher scores first
    });
    
    sortedLanguages.forEach(lang => {
        const icon = lang.totalMissingKeys === 0 && lang.totalEmptyValues === 0 ? '✅' :
                    lang.overallCompleteness >= 80 && lang.overallFillRate >= 80 ? '⚠️' : '❌';
        
        console.log(`${icon} ${lang.language.toUpperCase()}`);
        console.log(`   Files: ${lang.totalFiles} (${lang.filesWithIssues} with issues)`);
        console.log(`   Keys: ${lang.totalFoundKeys}/${lang.totalSourceKeys} (${lang.overallCompleteness}% complete)`);
        console.log(`   Filled: ${lang.totalFilledKeys}/${lang.totalSourceKeys} (${lang.overallFillRate}% filled)`);
        console.log(`   Missing: ${lang.totalMissingKeys}, Empty: ${lang.totalEmptyValues}, Extra: ${lang.totalExtraKeys}`);
        
        // Show problematic files
        const problemFiles = lang.files.filter(f => 
            f.status !== 'OK' || f.missingKeys.length > 0 || f.emptyValues.length > 0
        );
        
        if (problemFiles.length > 0) {
            console.log(`   Problem Files: ${problemFiles.map(f => f.filename).join(', ')}`);
        }
        
        console.log();
    });
}

function outputJSON(results) {
    console.log(JSON.stringify(results, null, 2));
}

function outputSummary(results) {
    const issueCount = results.summary.totalMissingKeys + results.summary.totalEmptyValues;
    console.log(`SUMMARY: ${results.totalLanguages} languages - ${results.summary.fullyComplete} complete | ${issueCount} total issues`);
    
    if (results.sourceValidation.totalEmptyValues > 0) {
        console.log(`WARNING: Source (${results.sourceLanguage}) has ${results.sourceValidation.totalEmptyValues} empty values`);
    }
    
    const problematic = results.languages.filter(l => 
        l.totalMissingKeys > 0 || l.totalEmptyValues > 0
    );
    
    if (problematic.length > 0) {
        console.log('\nLANGUAGES WITH ISSUES:');
        problematic.forEach(lang => {
            console.log(`  ${lang.language}: ${lang.totalMissingKeys} missing, ${lang.totalEmptyValues} empty`);
        });
    }
    
    // Exit with error code if there are issues
    if (issueCount > 0 || results.sourceValidation.totalEmptyValues > 0) {
        process.exit(1);
    }
}

// Main execution
function main() {
    try {
        const options = parseArgs();
        const results = validateTranslations();
        
        if (results === null) return; // Dry run
        
        switch(options.format) {
            case 'json':
                outputJSON(results);
                break;
            case 'summary':
                outputSummary(results);
                break;
            default:
                outputHuman(results);
        }
        
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}

// Run the script
main();