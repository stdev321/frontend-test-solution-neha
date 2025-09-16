#!/usr/bin/env node

/**
 * i18n File Comparison Script
 * 
 * This script compares the English (en) translation files with all other language folders
 * to identify missing files in other languages.
 * 
 * Usage: node i18n-file-comparison.js [--json] [--summary]
 *   --json    Output results in JSON format for AI processing
 *   --summary Show only summary statistics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const SOURCE_LANGUAGE = 'en';
const OUTPUT_FORMATS = {
    HUMAN: 'human',
    JSON: 'json',
    SUMMARY: 'summary'
};

// Files to ignore in comparison (utility scripts, etc.)
const IGNORE_FILES = [
    '.DS_Store',
    'check_personas.py',
    'extract_new_personas.py',
    'find_all_untranslated.py',
    'find_untranslated.py',
    'fix_html_entities.py',
    'translate_new_personas.py',
    'update_mobile_labels.py',
    'update_privacy_title.py',
    'untranslated_ids_report.md',
    'new_personas_data.json',
    'new_personas_data.md'
];

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    return {
        format: args.includes('--json') ? OUTPUT_FORMATS.JSON : 
                args.includes('--summary') ? OUTPUT_FORMATS.SUMMARY : 
                OUTPUT_FORMATS.HUMAN,
        verbose: args.includes('--verbose')
    };
}

// Get all language folders
function getLanguageFolders() {
    return fs.readdirSync(LOCALES_DIR)
        .filter(item => {
            const itemPath = path.join(LOCALES_DIR, item);
            return fs.statSync(itemPath).isDirectory() && 
                   !IGNORE_FILES.includes(item);
        })
        .sort();
}

// Normalize filename by removing language suffix
function normalizeFilename(filename, language) {
    // Remove .json extension
    let normalized = filename.replace('.json', '');
    
    // Remove language suffix if present (e.g., _en, _am, _fr, etc.)
    const suffixPattern = new RegExp(`_${language}$`);
    normalized = normalized.replace(suffixPattern, '');
    
    // Add .json back
    return normalized + '.json';
}

// Get all JSON files in a language folder (normalized)
function getLanguageFiles(language, normalize = true) {
    const langPath = path.join(LOCALES_DIR, language);
    
    if (!fs.existsSync(langPath)) {
        return [];
    }
    
    const files = fs.readdirSync(langPath)
        .filter(file => {
            return file.endsWith('.json') && 
                   !IGNORE_FILES.includes(file) &&
                   !file.endsWith('_fixes.json'); // Ignore fix files for now
        });
    
    if (normalize) {
        // Return normalized filenames for comparison
        return files.map(file => ({
            original: file,
            normalized: normalizeFilename(file, language)
        }));
    }
    
    return files.sort();
}

// Compare files between source and target languages using normalized names
function compareLanguageFiles(sourceFiles, targetLanguage, targetFiles) {
    // Create maps for normalized names
    const sourceNormalized = new Map();
    sourceFiles.forEach(file => {
        sourceNormalized.set(file.normalized, file.original);
    });
    
    const targetNormalized = new Map();
    targetFiles.forEach(file => {
        targetNormalized.set(file.normalized, file.original);
    });
    
    // Find missing files (normalized names in source but not in target)
    const missingFiles = [];
    sourceNormalized.forEach((original, normalized) => {
        if (!targetNormalized.has(normalized)) {
            missingFiles.push(normalized);
        }
    });
    
    // Find extra files (normalized names in target but not in source)
    const extraFiles = [];
    targetNormalized.forEach((original, normalized) => {
        if (!sourceNormalized.has(normalized)) {
            extraFiles.push(original);
        }
    });
    
    return {
        language: targetLanguage,
        totalSourceFiles: sourceFiles.length,
        totalTargetFiles: targetFiles.length,
        missingFiles,
        missingCount: missingFiles.length,
        extraFiles,
        extraCount: extraFiles.length,
        completeness: ((sourceFiles.length - missingFiles.length) / sourceFiles.length * 100).toFixed(1)
    };
}

// Main comparison function
function analyzeTranslations() {
    const options = parseArgs();
    const languages = getLanguageFolders();
    const sourceFiles = getLanguageFiles(SOURCE_LANGUAGE, true);  // Get normalized
    
    if (sourceFiles.length === 0) {
        console.error(`ERROR: No JSON files found in source language folder (${SOURCE_LANGUAGE})`);
        process.exit(1);
    }
    
    // Extract normalized names for display
    const sourceFilesNormalized = [...new Set(sourceFiles.map(f => f.normalized))].sort();
    
    const results = {
        sourceLanguage: SOURCE_LANGUAGE,
        sourceFileCount: sourceFiles.length,
        sourceFiles: sourceFilesNormalized,  // Use normalized names for display
        originalSourceFiles: sourceFiles.map(f => f.original),  // Keep originals for reference
        languages: [],
        summary: {
            totalLanguages: 0,
            fullyComplete: 0,
            partiallyComplete: 0,
            severelyIncomplete: 0,
            totalMissingFiles: 0
        }
    };
    
    // Analyze each language
    languages.forEach(lang => {
        if (lang === SOURCE_LANGUAGE) return;
        
        const targetFiles = getLanguageFiles(lang, true);  // Get normalized
        const comparison = compareLanguageFiles(sourceFiles, lang, targetFiles);
        
        results.languages.push(comparison);
        
        // Update summary
        results.summary.totalLanguages++;
        results.summary.totalMissingFiles += comparison.missingCount;
        
        if (comparison.missingCount === 0) {
            results.summary.fullyComplete++;
        } else if (comparison.completeness >= 80) {
            results.summary.partiallyComplete++;
        } else {
            results.summary.severelyIncomplete++;
        }
    });
    
    // Sort by completeness (descending, so complete languages appear first)
    results.languages.sort((a, b) => b.completeness - a.completeness);
    
    return results;
}

// Output formatters
function outputHuman(results) {
    console.log('╔════════════════════════════════════════════════════════════════════╗');
    console.log('║                    i18n File Comparison Report                     ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📁 Source Language: ${results.sourceLanguage}`);
    console.log(`📄 Total Source Files: ${results.sourceFileCount}`);
    console.log(`   Files (normalized): ${results.sourceFiles.join(', ')}`);
    console.log(`   Note: Language suffixes (_en, _am, etc.) are ignored for comparison\n`);
    
    console.log('═══════════════════════════════════════════════════════════════════════\n');
    console.log('📊 Summary Statistics:');
    console.log(`   • Total Languages: ${results.summary.totalLanguages}`);
    console.log(`   • Fully Complete: ${results.summary.fullyComplete} (${(results.summary.fullyComplete/results.summary.totalLanguages*100).toFixed(1)}%)`);
    console.log(`   • Partially Complete (≥80%): ${results.summary.partiallyComplete}`);
    console.log(`   • Severely Incomplete (<80%): ${results.summary.severelyIncomplete}`);
    console.log(`   • Total Missing Files: ${results.summary.totalMissingFiles}\n`);
    
    console.log('═══════════════════════════════════════════════════════════════════════\n');
    console.log('🌍 Language-by-Language Analysis:\n');
    
    results.languages.forEach(lang => {
        const status = lang.missingCount === 0 ? '✅' : 
                      lang.completeness >= 80 ? '⚠️' : '❌';
        
        console.log(`${status} ${lang.language.toUpperCase()} - ${lang.completeness}% complete`);
        console.log(`   Files: ${lang.totalTargetFiles}/${lang.totalSourceFiles}`);
        
        if (lang.missingCount > 0) {
            console.log(`   Missing (${lang.missingCount}): ${lang.missingFiles.join(', ')}`);
        }
        
        if (lang.extraCount > 0) {
            console.log(`   Extra files (${lang.extraCount}): ${lang.extraFiles.join(', ')}`);
        }
        
        console.log();
    });
    
    // Actionable recommendations
    console.log('═══════════════════════════════════════════════════════════════════════\n');
    console.log('🎯 Recommendations:\n');
    
    const criticalLanguages = results.languages.filter(l => l.completeness < 80);
    if (criticalLanguages.length > 0) {
        console.log('CRITICAL - Languages needing immediate attention (<80% complete):');
        criticalLanguages.forEach(lang => {
            console.log(`  • ${lang.language}: Missing ${lang.missingFiles.join(', ')}`);
        });
        console.log();
    }
    
    const nearComplete = results.languages.filter(l => l.completeness >= 80 && l.completeness < 100);
    if (nearComplete.length > 0) {
        console.log('MODERATE - Languages nearly complete (80-99%):');
        nearComplete.forEach(lang => {
            console.log(`  • ${lang.language}: Missing ${lang.missingFiles.join(', ')}`);
        });
    }
    
    if (results.summary.fullyComplete === results.summary.totalLanguages) {
        console.log('🎉 All languages have complete file structures!');
    }
}

function outputJSON(results) {
    console.log(JSON.stringify(results, null, 2));
}

function outputSummary(results) {
    console.log(`SUMMARY: ${results.summary.fullyComplete}/${results.summary.totalLanguages} languages complete | ${results.summary.totalMissingFiles} total files missing`);
    
    const incomplete = results.languages.filter(l => l.missingCount > 0);
    if (incomplete.length > 0) {
        console.log('\nINCOMPLETE LANGUAGES:');
        incomplete.forEach(lang => {
            console.log(`  ${lang.language}: Missing ${lang.missingCount} files (${lang.completeness}% complete)`);
        });
    }
    
    // Exit with error code if there are missing files
    if (results.summary.totalMissingFiles > 0) {
        process.exit(1);
    }
}

// Main execution
function main() {
    try {
        const options = parseArgs();
        const results = analyzeTranslations();
        
        switch(options.format) {
            case OUTPUT_FORMATS.JSON:
                outputJSON(results);
                break;
            case OUTPUT_FORMATS.SUMMARY:
                outputSummary(results);
                break;
            default:
                outputHuman(results);
        }
        
        // Exit with appropriate code
        process.exit(results.summary.totalMissingFiles > 0 ? 1 : 0);
        
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}

// Run the script
main();