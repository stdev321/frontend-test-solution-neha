#!/usr/bin/env python3
"""
i18n Translate All Files Script
Translates all JSON files for one or all languages.

Usage:
    python scripts/i18n-translate-all.py [language] [--dry-run]
    
Arguments:
    [language]  Specific language to translate (e.g., 'es', 'fr'). If omitted, translates all languages
    --dry-run   Show what would be translated without making changes
    
Examples:
    python scripts/i18n-translate-all.py                    # Translate all languages
    python scripts/i18n-translate-all.py es                 # Translate Spanish only
    python scripts/i18n-translate-all.py --dry-run          # Preview all languages
    python scripts/i18n-translate-all.py fr --dry-run       # Preview French only
"""

import json
import sys
import os
import time
from pathlib import Path

# Load environment variables from backend/.env
def load_backend_env():
    """Load environment variables from backend/.env file."""
    env_path = Path(__file__).parent.parent.parent / 'backend' / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, _, value = line.partition('=')
                    if key and value:
                        # Remove quotes from value
                        value = value.strip('"').strip("'")
                        os.environ[key] = value

# Load environment variables FIRST
load_backend_env()

# Add backend to path for Google Translate import
backend_path = str(Path(__file__).parent.parent.parent / 'backend')
sys.path.insert(0, backend_path)
sys.path.insert(0, str(Path(__file__).parent.parent.parent))  # Add project root too

# Import Google Translate module
import importlib.util
translate_module_path = os.path.join(backend_path, 'external_services', 'google_translate_service_v3.py')
spec = importlib.util.spec_from_file_location("google_translate_service_v3", translate_module_path)
google_translate_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(google_translate_module)
GoogleTranslateServiceV3 = google_translate_module.GoogleTranslateServiceV3

def get_all_source_files():
    """Get all JSON files from the English directory."""
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    en_dir = locales_dir / 'en'
    
    if not en_dir.exists():
        print(f"Error: English directory not found: {en_dir}")
        return []
    
    # Find all JSON files in English directory
    json_files = sorted([f.name for f in en_dir.glob('*.json')])
    return json_files

def get_all_languages():
    """Get all language directories (excluding English)."""
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    
    languages = []
    for lang_dir in sorted(locales_dir.iterdir()):
        if lang_dir.is_dir() and lang_dir.name != 'en':
            languages.append(lang_dir.name)
    
    return languages

def load_json(filepath):
    """Load JSON file safely."""
    try:
        if not filepath.exists():
            return None
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def save_json(filepath, data):
    """Save JSON file with proper formatting."""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def translate_structure(target_value, source_value, translator, target_lang, path="root", dry_run=False, current_file="", progress_counter=None):
    """
    Recursively translate a structure, only translating empty strings.
    Uses source_value (English) as the text to translate.
    
    Returns: (translated_structure, count_of_translations)
    """
    count = 0
    
    if isinstance(target_value, str):
        # It's a string - check if empty and source has content
        if not target_value.strip() and isinstance(source_value, str) and source_value.strip():
            if progress_counter:
                progress_counter['current'] += 1
                progress_info = f"[{progress_counter['current']}/{progress_counter['total']}]"
            else:
                progress_info = ""
                
            if dry_run:
                print(f"    🔍 {progress_info} [DRY RUN] {current_file} → {path}")
                print(f"        EN: '{source_value}'")
                print(f"        Would translate to: {target_lang.upper()}")
                return target_value, 1
            try:
                print(f"    🔄 {progress_info} Translating {current_file} → {path}")
                print(f"        EN: '{source_value}'")
                
                translation_start = time.time()
                result = translator.translate_text(
                    text=source_value,
                    source_language='en',
                    target_language=target_lang
                )
                translation_time = time.time() - translation_start
                
                translated = result['translated_text']
                print(f"        {target_lang.upper()}: '{translated}'")
                print(f"        ✅ Completed in {translation_time:.2f}s")
                return translated, 1
            except Exception as e:
                print(f"        ❌ Translation failed: {e}")
                return target_value, 0
        elif target_value.strip():
            # String already has content - skip but log for completeness
            if path != "root":  # Don't spam with root-level logs
                print(f"    ⏭️  {current_file} → {path}: Already translated (skipping)")
        # String is not empty or source is not a string - keep as is
        return target_value, 0
        
    elif isinstance(target_value, dict) and isinstance(source_value, dict):
        # Both are dicts - recursively process matching keys
        result = {}
        for key in target_value:
            if key in source_value:
                result[key], sub_count = translate_structure(
                    target_value[key], 
                    source_value[key], 
                    translator, 
                    target_lang,
                    f"{path}.{key}",
                    dry_run,
                    current_file,
                    progress_counter
                )
                count += sub_count
            else:
                # Key not in source - keep target as is
                result[key] = target_value[key]
        return result, count
        
    elif isinstance(target_value, list) and isinstance(source_value, list):
        # Both are lists - process items at matching indices
        result = []
        for i, item in enumerate(target_value):
            if i < len(source_value):
                translated_item, sub_count = translate_structure(
                    item, 
                    source_value[i], 
                    translator, 
                    target_lang,
                    f"{path}[{i}]",
                    dry_run,
                    current_file,
                    progress_counter
                )
                result.append(translated_item)
                count += sub_count
            else:
                # No corresponding source item - keep as is
                result.append(item)
        return result, count
        
    else:
        # Type mismatch or other types (numbers, booleans, None) - keep target as is
        return target_value, 0

def translate_file(filename, language, source_data, translator, dry_run=False):
    """Translate a single file for a language."""
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    
    # Handle special filename patterns for certain languages
    if filename in ['aiAccuracyWhitepaper.json', 'ai_personas.json', 'legal.json']:
        base_name = filename.replace('.json', '')
        target_filename = f"{base_name}_{language}.json"
    else:
        target_filename = filename
    
    target_file = locales_dir / language / target_filename
    
    # Load target file
    target_data = load_json(target_file)
    if target_data is None:
        print(f"    ✗ Target file not found or invalid: {target_filename}")
        return False, 0
    
    # Count empty strings for progress tracking
    def count_empty_strings(target_obj, source_obj):
        count = 0
        if isinstance(target_obj, str) and isinstance(source_obj, str):
            if not target_obj.strip() and source_obj.strip():
                count += 1
        elif isinstance(target_obj, dict) and isinstance(source_obj, dict):
            for key in target_obj:
                if key in source_obj:
                    count += count_empty_strings(target_obj[key], source_obj[key])
        elif isinstance(target_obj, list) and isinstance(source_obj, list):
            for i in range(min(len(target_obj), len(source_obj))):
                count += count_empty_strings(target_obj[i], source_obj[i])
        return count
    
    empty_count = count_empty_strings(target_data, source_data)
    progress_counter = {'current': 0, 'total': empty_count} if empty_count > 0 else None
    
    if progress_counter:
        print(f"    📝 Found {empty_count} empty strings to translate")
    
    # Translate the structure
    translated_data, count = translate_structure(
        target_data, 
        source_data, 
        translator, 
        language,
        "root",
        dry_run,
        filename,
        progress_counter
    )
    
    if count > 0 and not dry_run:
        # Save the result
        if save_json(target_file, translated_data):
            print(f"    ✓ Saved {count} translations to {target_filename}")
            return True, count
        else:
            print(f"    ✗ Failed to save {target_filename}")
            return False, 0
    
    return True, count

def translate_language(language, dry_run=False):
    """Translate all files for a specific language."""
    print(f"\n{'='*60}")
    print(f"Translating all files for: {language.upper()}")
    print(f"{'='*60}")
    
    language_start_time = time.time()
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    
    # Get all source files
    files = get_all_source_files()
    
    if not files:
        print("No files found to translate!")
        return
    
    print(f"Found {len(files)} files to process:")
    for f in files:
        print(f"  • {f}")
    print()
    
    # Initialize translator (skip in dry run mode)
    if not dry_run:
        print("Initializing Google Translate...")
        try:
            translator = GoogleTranslateServiceV3()
            print("✓ Translator ready\n")
        except Exception as e:
            print(f"✗ Failed to initialize translator: {e}")
            return
    else:
        translator = None
        print("✓ Skipping translator initialization (dry run)\n")
    
    success_count = 0
    total_translations = 0
    fail_count = 0
    
    # Process each file
    for i, filename in enumerate(files, 1):
        print(f"\n{'─' * 80}")
        print(f"📄 [{i}/{len(files)}] Processing {filename} for {language.upper()}")
        print(f"{'─' * 80}")
        
        file_start_time = time.time()
        
        # Load source (English) data
        source_file = locales_dir / 'en' / filename
        source_data = load_json(source_file)
        
        if source_data is None:
            print(f"    ❌ Source file not found or invalid: {filename}")
            fail_count += 1
            continue
        
        # Count total keys in source for progress tracking
        def count_translatable_keys(obj):
            count = 0
            if isinstance(obj, dict):
                for value in obj.values():
                    count += count_translatable_keys(value)
            elif isinstance(obj, list):
                for item in obj:
                    count += count_translatable_keys(item)
            elif isinstance(obj, str) and obj.strip():
                count += 1
            return count
        
        total_keys = count_translatable_keys(source_data)
        print(f"📊 File contains {total_keys} translatable keys")
        
        # Translate the file
        success, count = translate_file(filename, language, source_data, translator, dry_run)
        
        file_end_time = time.time()
        file_duration = file_end_time - file_start_time
        
        if success:
            success_count += 1
            total_translations += count
            if count > 0:
                if dry_run:
                    print(f"\n    📋 [DRY RUN] Summary for {filename}:")
                    print(f"       • Would translate: {count} strings")
                    print(f"       • Processing time: {file_duration:.1f}s")
                else:
                    print(f"\n    ✅ Summary for {filename}:")
                    print(f"       • Successfully translated: {count} strings")
                    print(f"       • Already translated: {total_keys - count} strings")
                    print(f"       • Processing time: {file_duration:.1f}s")
                    if count > 0:
                        print(f"       • Average: {file_duration/count:.2f}s per translation")
            else:
                print(f"\n    ✅ {filename}: All strings already translated")
                print(f"       • Total keys: {total_keys}")
                print(f"       • Processing time: {file_duration:.1f}s")
        else:
            fail_count += 1
            print(f"\n    ❌ Failed to process {filename}")
        
        # Progress indicator
        remaining_files = len(files) - i
        if remaining_files > 0:
            print(f"\n    📈 Progress: {i}/{len(files)} files completed ({remaining_files} remaining)")
        
        # Small delay between files to avoid rate limiting
        if i < len(files) and not dry_run and count > 0:
            print(f"    ⏳ Waiting 2 seconds to avoid rate limiting...")
            time.sleep(2)
    
    # Summary
    language_end_time = time.time()
    total_duration = language_end_time - language_start_time
    
    print(f"\n{'='*60}")
    print(f"📊 FINAL SUMMARY for {language.upper()}")
    print(f"{'='*60}")
    
    if dry_run:
        print(f"🔍 DRY RUN Results:")
        print(f"   • Files that would be processed: {success_count}")
        print(f"   • Strings that would be translated: {total_translations}")
        print(f"   • Total processing time: {total_duration:.1f}s")
    else:
        print(f"✅ Translation Results:")
        print(f"   • Successfully processed files: {success_count}")
        print(f"   • Total new translations: {total_translations}")
        print(f"   • Total processing time: {total_duration:.1f}s")
        if total_translations > 0:
            print(f"   • Average time per translation: {total_duration/total_translations:.2f}s")
        print(f"   • Files per minute: {(success_count / total_duration * 60):.1f}")
    
    if fail_count > 0:
        print(f"❌ Issues:")
        print(f"   • Failed files: {fail_count}")
    
    print(f"{'='*60}")

def parse_args():
    """Parse command line arguments."""
    args = sys.argv[1:]
    
    target_language = None
    dry_run = False
    
    for arg in args:
        if arg == '--dry-run':
            dry_run = True
        elif not arg.startswith('--') and target_language is None:
            target_language = arg.lower()
    
    return target_language, dry_run

def main():
    target, dry_run = parse_args()
    
    print("\n╔════════════════════════════════════════════════════════════════╗")
    print("║              i18n Translate All Files Tool                     ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No files will be modified")
    
    # Determine what to translate
    if target is None:
        # No language specified - translate all languages
        languages = get_all_languages()
        print(f"\nWill translate {len(languages)} languages:")
        for lang in languages:
            print(f"  • {lang}")
        
        for lang in languages:
            translate_language(lang, dry_run)
            
    else:
        # Translate specific language
        # Check if language directory exists
        locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
        lang_dir = locales_dir / target
        
        if not lang_dir.exists():
            print(f"\nError: Language directory not found: {target}")
            print(f"Available languages: {', '.join(get_all_languages())}")
            sys.exit(1)
        
        translate_language(target, dry_run)
    
    print("\n✨ Translation process complete!")
    
    # Suggest next steps
    print("\nNext steps:")
    print("1. Run validation to check results:")
    if target:
        print(f"   node scripts/i18n-key-validation.js {target} --summary")
    else:
        print("   node scripts/i18n-key-validation.js --summary")
    print("2. Test in the application by switching languages")
    if not dry_run:
        print("3. Commit your changes when satisfied")

if __name__ == '__main__':
    main()