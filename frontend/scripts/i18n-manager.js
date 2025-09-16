#!/usr/bin/env node

/**
 * i18n Manager CLI
 * Interactive command-line interface for managing i18n translation scripts.
 * 
 * Usage: node i18n-manager.js
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'public', 'i18n', 'locales');

// Create readline interface
const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

// Get available languages
function getLanguages() {
    try {
        return fs.readdirSync(LOCALES_DIR)
            .filter(item => {
                const itemPath = path.join(LOCALES_DIR, item);
                return fs.statSync(itemPath).isDirectory() && item !== 'en';
            })
            .sort();
    } catch (error) {
        return [];
    }
}

// Display menu
function showMenu() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    i18n Management CLI                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log('Available Scripts:\n');
    console.log('1. 🔍 Key Validation      - Check translation completeness');
    console.log('2. 🌍 Translate All       - Auto-translate empty strings');
    console.log('3. 🔄 Clear Changed       - Clear translations for changed English');
    console.log('4. 🔧 Schema Sync         - Sync structure across languages');
    console.log('5. ❓ Help                - Show detailed help');
    console.log('6. 🚪 Exit\n');
}

// Show detailed help
function showHelp() {
    console.clear();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        Script Help                             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Script Descriptions:\n');
    
    console.log('🔍 Key Validation:');
    console.log('   • Checks all translation files for missing keys and empty values');
    console.log('   • Shows completion percentages for each language');
    console.log('   • Identifies files with issues\n');
    
    console.log('🌍 Translate All:');
    console.log('   • Uses Google Translate to fill empty translation strings');
    console.log('   • Processes all JSON files for selected language(s)');
    console.log('   • Includes rate limiting to avoid API issues\n');
    
    console.log('🔄 Clear Changed:');
    console.log('   • Compares current English with backup in en/old/');
    console.log('   • Clears translations for changed English text');
    console.log('   • Prepares files for retranslation\n');
    
    console.log('🔧 Schema Sync:');
    console.log('   • Ensures all languages have identical structure to English');
    console.log('   • Adds missing keys (as empty strings) from English');
    console.log('   • Removes extra keys that don\'t exist in English');
    console.log('   • Preserves existing translations while enforcing schema\n');
    
    console.log('🔧 Workflow Example:');
    console.log('   1. Edit English text in en/ files');
    console.log('   2. Use "Schema Sync" to propagate structure to other languages');
    console.log('   3. Use "Clear Changed" to mark changed text (optional)');
    console.log('   4. Use "Translate All" to retranslate cleared/empty text');
    console.log('   5. Use "Key Validation" to verify results\n');
}

// Get language selection
async function selectLanguage(allowAll = true) {
    const languages = getLanguages();
    
    console.log('\n📍 Language Selection:\n');
    
    if (allowAll) {
        console.log('0. 🌍 All languages');
    }
    
    languages.forEach((lang, index) => {
        console.log(`${index + 1}. ${lang.toUpperCase()}`);
    });
    
    const maxChoice = allowAll ? languages.length : languages.length - 1;
    const prompt = allowAll 
        ? `\nSelect language (0-${maxChoice + 1}, or 'back'): `
        : `\nSelect language (1-${maxChoice + 1}, or 'back'): `;
    
    const choice = await question(prompt);
    
    if (choice.toLowerCase() === 'back') {
        return null;
    }
    
    const num = parseInt(choice);
    
    if (allowAll && num === 0) {
        return 'all';
    }
    
    if (num >= 1 && num <= languages.length) {
        return languages[num - 1];
    }
    
    console.log('❌ Invalid selection!');
    await question('Press Enter to try again...');
    return await selectLanguage(allowAll);
}

// Get dry run confirmation
async function askDryRun() {
    console.log('\n🔍 Execution Mode:\n');
    console.log('1. 💻 Execute (make changes)');
    console.log('2. 👁️  Dry run (preview only)');
    
    const choice = await question('\nSelect mode (1-2, or \'back\'): ');
    
    if (choice.toLowerCase() === 'back') {
        return null;
    }
    
    switch (choice) {
        case '1': return false;
        case '2': return true;
        default:
            console.log('❌ Invalid selection!');
            await question('Press Enter to try again...');
            return await askDryRun();
    }
}

// Run external script
function runScript(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Running: ${command} ${args.join(' ')}\n`);
        console.log('─'.repeat(60));
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..')
        });
        
        child.on('close', (code) => {
            console.log('─'.repeat(60));
            if (code === 0) {
                console.log('✅ Script completed successfully!');
                resolve(code);
            } else {
                console.log(`❌ Script exited with code ${code}`);
                resolve(code);
            }
        });
        
        child.on('error', (error) => {
            console.error(`❌ Failed to run script: ${error.message}`);
            reject(error);
        });
    });
}

// Handle Key Validation
async function handleKeyValidation() {
    console.clear();
    console.log('🔍 Key Validation Setup\n');
    console.log('This will validate English + all target languages\n');
    
    const dryRun = await askDryRun();
    if (dryRun === null) return;
    
    // Build command
    const args = ['scripts/i18n-key-validation.js'];
    
    if (dryRun) {
        args.push('--dry-run');
    }
    
    try {
        await runScript('node', args);
    } catch (error) {
        console.error('Script execution failed:', error.message);
    }
    
    await question('\nPress Enter to continue...');
}

// Handle Translate All
async function handleTranslateAll() {
    console.clear();
    console.log('🌍 Translate All Setup\n');
    
    const language = await selectLanguage(true);
    if (language === null) return;
    
    const dryRun = await askDryRun();
    if (dryRun === null) return;
    
    // Build command
    const args = ['scripts/i18n-translate-all.py'];
    
    if (language !== 'all') {
        args.push(language);
    }
    
    if (dryRun) {
        args.push('--dry-run');
    }
    
    try {
        await runScript('python', args);
    } catch (error) {
        console.error('Script execution failed:', error.message);
    }
    
    await question('\nPress Enter to continue...');
}

// Handle Clear Changed
async function handleClearChanged() {
    console.clear();
    console.log('🔄 Clear Changed Setup\n');
    
    // Check if backup exists
    const backupDir = path.join(LOCALES_DIR, 'en', 'old');
    if (!fs.existsSync(backupDir)) {
        console.log('⚠️  Warning: No backup found at en/old/');
        console.log('\nTo use this script, you need to:');
        console.log('1. Create backup: mkdir -p public/i18n/locales/en/old');
        console.log('2. Copy files: cp public/i18n/locales/en/*.json public/i18n/locales/en/old/');
        console.log('3. Edit English files, then run this script');
        
        const cont = await question('\nContinue anyway? (y/N): ');
        if (!cont.toLowerCase().startsWith('y')) {
            return;
        }
    }
    
    const language = await selectLanguage(true);
    if (language === null) return;
    
    const dryRun = await askDryRun();
    if (dryRun === null) return;
    
    // Build command
    const args = ['scripts/i18n-clear-changed.py'];
    
    if (language !== 'all') {
        args.push(language);
    }
    
    if (dryRun) {
        args.push('--dry-run');
    }
    
    try {
        await runScript('python', args);
    } catch (error) {
        console.error('Script execution failed:', error.message);
    }
    
    await question('\nPress Enter to continue...');
}

// Handle Schema Sync
async function handleSchemaSync() {
    console.clear();
    console.log('🔧 Schema Sync Setup\n');
    
    // Get available JSON files
    const enDir = path.join(LOCALES_DIR, 'en');
    const jsonFiles = fs.readdirSync(enDir)
        .filter(file => file.endsWith('.json'))
        .sort();
    
    console.log('📄 File Selection:\n');
    console.log('0. 🌍 All files (use with caution)');
    jsonFiles.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
    });
    
    const fileChoice = await question(`\nSelect file (0-${jsonFiles.length}, or 'back'): `);
    
    if (fileChoice.toLowerCase() === 'back') return;
    
    const fileNum = parseInt(fileChoice);
    let selectedFile = null;
    let allFiles = false;
    
    if (fileNum === 0) {
        allFiles = true;
        console.log('\n⚠️  WARNING: This will sync ALL files across ALL languages!');
        const confirm = await question('Are you sure? (type "yes" to confirm): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ Operation cancelled');
            await question('Press Enter to continue...');
            return;
        }
    } else if (fileNum >= 1 && fileNum <= jsonFiles.length) {
        selectedFile = jsonFiles[fileNum - 1];
    } else {
        console.log('❌ Invalid selection!');
        await question('Press Enter to try again...');
        return await handleSchemaSync();
    }
    
    const dryRun = await askDryRun();
    if (dryRun === null) return;
    
    // Build command
    const args = ['scripts/i18n-schema-sync.js'];
    
    if (allFiles) {
        args.push('--all');
    } else {
        args.push(selectedFile);
    }
    
    if (dryRun) {
        args.push('--dry-run');
    }
    
    try {
        await runScript('node', args);
    } catch (error) {
        console.error('Script execution failed:', error.message);
    }
    
    await question('\nPress Enter to continue...');
}


// Main menu loop
async function mainLoop() {
    let running = true;
    
    while (running) {
        showMenu();
        
        const choice = await question('Select option (1-6): ');
        
        switch (choice) {
            case '1':
                await handleKeyValidation();
                break;
            case '2':
                await handleTranslateAll();
                break;
            case '3':
                await handleClearChanged();
                break;
            case '4':
                await handleSchemaSync();
                break;
            case '5':
                showHelp();
                await question('\nPress Enter to continue...');
                break;
            case '6':
                console.log('\n👋 Goodbye!');
                running = false;
                break;
            default:
                console.log('❌ Invalid option! Please select 1-6.');
                await question('Press Enter to try again...');
        }
    }
}

// Main execution
async function main() {
    try {
        // Check if required directories exist
        if (!fs.existsSync(LOCALES_DIR)) {
            console.error(`❌ Locales directory not found: ${LOCALES_DIR}`);
            console.error('Make sure you\'re running this from the frontend directory.');
            process.exit(1);
        }
        
        const languages = getLanguages();
        if (languages.length === 0) {
            console.error('❌ No language directories found in locales.');
            process.exit(1);
        }
        
        await mainLoop();
    } catch (error) {
        console.error('❌ An error occurred:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Interrupted. Goodbye!');
    rl.close();
    process.exit(0);
});

// Run the CLI
main();