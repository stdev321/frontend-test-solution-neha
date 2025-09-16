#!/usr/bin/env python3
"""
i18n Auto-Translation Script

This script automatically translates empty values in language JSON files
using Google Translate v3 API.

Usage:
    python scripts/i18n-auto-translate.py chat.json fr              # Translate chat.json to French
    python scripts/i18n-auto-translate.py chat.json fr --dry-run    # Preview without saving
    python scripts/i18n-auto-translate.py chat.json all             # Translate to all languages
    python scripts/i18n-auto-translate.py chat.json fr --force      # Retranslate even if not empty
"""

import json
import os
import sys
import argparse
import time
from pathlib import Path
from typing import Dict, List, Tuple, Any

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

# Load backend environment variables
load_backend_env()

# Import Google Translate service directly
import importlib.util

# Load the Google Translate module directly to avoid import issues
translate_module_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'external_services', 'google_translate_service_v3.py')
)

try:
    spec = importlib.util.spec_from_file_location("google_translate_service_v3", translate_module_path)
    google_translate_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(google_translate_module)
    GoogleTranslateServiceV3 = google_translate_module.GoogleTranslateServiceV3
except Exception as e:
    print(f"Error importing Google Translate service: {e}")
    print(f"Tried to import from: {translate_module_path}")
    print("Make sure the Google Translate v3 service file exists")
    sys.exit(1)

# Configuration
LOCALES_DIR = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
SOURCE_LANGUAGE = 'en'
INDENT_SPACES = 2

# Language code mapping (if needed for special cases)
LANGUAGE_CODES = {
    'en': 'en',     # English
    'es': 'es',     # Spanish
    'fr': 'fr',     # French
    'de': 'de',     # German
    'it': 'it',     # Italian
    'pt': 'pt',     # Portuguese
    'ru': 'ru',     # Russian
    'zh': 'zh',     # Chinese (Simplified)
    'ja': 'ja',     # Japanese
    'ko': 'ko',     # Korean
    'ar': 'ar',     # Arabic
    'he': 'he',     # Hebrew
    'hi': 'hi',     # Hindi
    'bn': 'bn',     # Bengali
    'ta': 'ta',     # Tamil
    'te': 'te',     # Telugu
    'tr': 'tr',     # Turkish
    'th': 'th',     # Thai
    'vi': 'vi',     # Vietnamese
    'id': 'id',     # Indonesian
    'ms': 'ms',     # Malay
    'fil': 'fil',   # Filipino
    'nl': 'nl',     # Dutch
    'pl': 'pl',     # Polish
    'uk': 'uk',     # Ukrainian
    'fa': 'fa',     # Farsi/Persian
    'am': 'am',     # Amharic
    'sw': 'sw',     # Swahili
    'xh': 'xh',     # Xhosa
    'yo': 'yo',     # Yoruba
    'zu': 'zu',     # Zulu
    'gu': 'gu',     # Gujarati
    'mi': 'mi',     # Maori
    'pa': 'pa',     # Punjabi
    'el': 'el',     # Greek
    'mr': 'mr',     # Marathi
}

# Colors for terminal output
class Colors:
    RESET = '\033[0m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    RED = '\033[31m'
    CYAN = '\033[36m'
    DIM = '\033[2m'

def load_json_file(filepath: Path) -> Dict:
    """Load and parse a JSON file."""
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(filepath: Path, data: Dict) -> None:
    """Save data to a JSON file with proper formatting."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=INDENT_SPACES)
        f.write('\n')  # Add newline at end of file

def find_empty_values(data: Any, path: str = '') -> List[Tuple[str, str]]:
    """
    Recursively find all keys with empty string values.
    Returns list of (key_path, parent_path) tuples.
    """
    empty_keys = []
    
    if isinstance(data, dict):
        for key, value in data.items():
            key_path = f"{path}.{key}" if path else key
            
            if isinstance(value, dict):
                # Recursively search nested objects
                empty_keys.extend(find_empty_values(value, key_path))
            elif isinstance(value, list):
                # Handle arrays - check each item
                for i, item in enumerate(value):
                    item_path = f"{key_path}[{i}]"
                    if isinstance(item, str) and item == '':
                        empty_keys.append((item_path, path))
                    elif isinstance(item, dict):
                        empty_keys.extend(find_empty_values(item, item_path))
            elif isinstance(value, str) and value == '':
                # Found an empty string value
                empty_keys.append((key_path, path))
    
    return empty_keys

def get_nested_value(data: Any, key_path: str) -> Any:
    """Get a value from nested dict/array using dot notation and array indices."""
    import re
    # Split path by dots and array indices
    parts = re.split(r'\.|\[|\]', key_path)
    parts = [p for p in parts if p]  # Remove empty strings
    
    value = data
    for part in parts:
        if part.isdigit():
            # Array index
            if isinstance(value, list) and int(part) < len(value):
                value = value[int(part)]
            else:
                return None
        else:
            # Object key
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
    
    return value

def set_nested_value(data: Any, key_path: str, value: Any) -> None:
    """Set a value in nested dict/array using dot notation and array indices."""
    import re
    # Split path by dots and array indices
    parts = re.split(r'\.|\[|\]', key_path)
    parts = [p for p in parts if p]  # Remove empty strings
    
    current = data
    # Navigate to the parent of the target
    for i, part in enumerate(parts[:-1]):
        if part.isdigit():
            # Array index
            idx = int(part)
            if isinstance(current, list) and idx < len(current):
                current = current[idx]
            else:
                return  # Can't set value in non-existent array position
        else:
            # Object key
            if isinstance(current, dict):
                if part not in current:
                    # Check if next part is a digit (array index)
                    if i + 1 < len(parts) and parts[i + 1].isdigit():
                        current[part] = []
                    else:
                        current[part] = {}
                current = current[part]
    
    # Set the final value
    final_part = parts[-1]
    if final_part.isdigit():
        # Array index
        idx = int(final_part)
        if isinstance(current, list) and idx < len(current):
            current[idx] = value
    else:
        # Object key
        if isinstance(current, dict):
            current[final_part] = value

def translate_file(filename: str, target_lang: str, translator: GoogleTranslateServiceV3, 
                  dry_run: bool = False, force: bool = False) -> int:
    """
    Translate empty values in a specific file for a specific language.
    Returns the number of translations made.
    """
    # Load source (English) file
    source_file = LOCALES_DIR / SOURCE_LANGUAGE / filename
    if not source_file.exists():
        print(f"{Colors.RED}✗ Source file not found: {filename}{Colors.RESET}")
        return 0
    
    source_data = load_json_file(source_file)
    
    # Load target language file
    target_file = LOCALES_DIR / target_lang / filename
    if not target_file.exists():
        print(f"{Colors.RED}✗ Target file not found: {target_lang}/{filename}{Colors.RESET}")
        return 0
    
    target_data = load_json_file(target_file)
    
    # Find empty values (or all values if force is True)
    empty_keys = find_empty_values(target_data)
    
    if force:
        # Find all keys, not just empty ones
        all_keys = []
        def find_all_keys(data: Any, path: str = '') -> None:
            if isinstance(data, dict):
                for key, value in data.items():
                    key_path = f"{path}.{key}" if path else key
                    if isinstance(value, dict):
                        find_all_keys(value, key_path)
                    elif isinstance(value, list):
                        # Handle arrays
                        for i, item in enumerate(value):
                            item_path = f"{key_path}[{i}]"
                            if isinstance(item, str):
                                all_keys.append((item_path, path))
                            elif isinstance(item, dict):
                                find_all_keys(item, item_path)
                    elif isinstance(value, str):
                        # Only include string values
                        all_keys.append((key_path, path))
        find_all_keys(target_data)
        keys_to_translate = all_keys
        print(f"  {Colors.YELLOW}Force mode: Translating all {len(keys_to_translate)} keys{Colors.RESET}")
    else:
        keys_to_translate = empty_keys
        print(f"  Found {len(keys_to_translate)} empty keys to translate")
    
    if not keys_to_translate:
        print(f"  {Colors.GREEN}✓ No empty keys found - file is complete!{Colors.RESET}")
        return 0
    
    # Translate each empty key
    translated_count = 0
    errors = []
    
    for key_path, _ in keys_to_translate:
        # Get English value
        english_value = get_nested_value(source_data, key_path)
        
        if english_value is None:
            print(f"    {Colors.YELLOW}⚠ Key not found in English: {key_path}{Colors.RESET}")
            continue
        
        if english_value == '':
            print(f"    {Colors.DIM}○ Skipping empty English value: {key_path}{Colors.RESET}")
            continue
        
        # Skip non-string values (arrays, objects, numbers, etc.)
        if not isinstance(english_value, str):
            print(f"    {Colors.DIM}○ Skipping non-string value: {key_path} (type: {type(english_value).__name__}){Colors.RESET}")
            continue
        
        try:
            # Translate the text
            print(f"    Translating: {key_path[:50]}{'...' if len(key_path) > 50 else ''}", end='')
            
            result = translator.translate_text(
                text=english_value,
                target_language=target_lang,
                source_language=SOURCE_LANGUAGE
            )
            
            translated_text = result['translated_text']
            
            if not dry_run:
                # Update the target data
                set_nested_value(target_data, key_path, translated_text)
            
            print(f" {Colors.GREEN}✓{Colors.RESET}")
            
            # Show translation preview
            if len(english_value) <= 50:
                print(f"      {Colors.DIM}'{english_value}' → '{translated_text}'{Colors.RESET}")
            
            translated_count += 1
            
            # Small delay to avoid rate limiting
            time.sleep(0.1)
            
        except Exception as e:
            print(f" {Colors.RED}✗{Colors.RESET}")
            errors.append((key_path, str(e)))
            print(f"      {Colors.RED}Error: {e}{Colors.RESET}")
    
    # Save the updated file
    if translated_count > 0 and not dry_run:
        save_json_file(target_file, target_data)
        print(f"  {Colors.GREEN}✓ Saved {translated_count} translations to {target_lang}/{filename}{Colors.RESET}")
    elif dry_run:
        print(f"  {Colors.YELLOW}Dry run: Would translate {translated_count} keys{Colors.RESET}")
    
    # Report errors if any
    if errors:
        print(f"\n  {Colors.RED}Errors occurred for {len(errors)} keys:{Colors.RESET}")
        for key_path, error in errors[:5]:  # Show first 5 errors
            print(f"    • {key_path}: {error}")
        if len(errors) > 5:
            print(f"    ... and {len(errors) - 5} more errors")
    
    return translated_count

def get_all_languages() -> List[str]:
    """Get list of all available language directories (excluding English)."""
    languages = []
    for lang_dir in LOCALES_DIR.iterdir():
        if lang_dir.is_dir() and lang_dir.name != SOURCE_LANGUAGE:
            languages.append(lang_dir.name)
    return sorted(languages)

def main():
    parser = argparse.ArgumentParser(
        description='Auto-translate empty values in i18n JSON files using Google Translate v3'
    )
    parser.add_argument('filename', help='JSON filename to translate (e.g., chat.json)')
    parser.add_argument('language', help='Target language code (e.g., fr) or "all" for all languages')
    parser.add_argument('--dry-run', action='store_true', help='Preview translations without saving')
    parser.add_argument('--force', action='store_true', help='Retranslate even if values are not empty')
    
    args = parser.parse_args()
    
    print('╔════════════════════════════════════════════════════════════════════╗')
    print('║                    i18n Auto-Translation Tool                      ║')
    print('╚════════════════════════════════════════════════════════════════════╝')
    print()
    
    if args.dry_run:
        print(f"{Colors.YELLOW}🔍 DRY RUN MODE - No files will be modified{Colors.RESET}\n")
    
    # Initialize Google Translate service
    try:
        print("Initializing Google Translate v3 service...")
        translator = GoogleTranslateServiceV3()
        print(f"{Colors.GREEN}✓ Google Translate service initialized{Colors.RESET}\n")
    except Exception as e:
        print(f"{Colors.RED}✗ Failed to initialize Google Translate service: {e}{Colors.RESET}")
        print("\nMake sure you have set up Google Cloud credentials:")
        print("  - GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print("  - Or individual GOOGLE_TRANSLATE_* environment variables")
        return 1
    
    # Determine which languages to process
    if args.language.lower() == 'all':
        languages = get_all_languages()
        print(f"Processing all {len(languages)} languages\n")
    else:
        if args.language not in LANGUAGE_CODES:
            print(f"{Colors.RED}✗ Unknown language code: {args.language}{Colors.RESET}")
            print(f"Available codes: {', '.join(sorted(LANGUAGE_CODES.keys()))}")
            return 1
        languages = [args.language]
    
    # Process each language
    total_translations = 0
    print(f"{Colors.CYAN}📄 Processing: {args.filename}{Colors.RESET}\n")
    
    for lang in languages:
        print(f"{Colors.CYAN}🌍 Language: {lang.upper()}{Colors.RESET}")
        
        try:
            count = translate_file(
                args.filename, 
                lang, 
                translator,
                dry_run=args.dry_run,
                force=args.force
            )
            total_translations += count
        except Exception as e:
            print(f"  {Colors.RED}✗ Error processing {lang}: {e}{Colors.RESET}")
        
        print()  # Blank line between languages
    
    # Summary
    print('═' * 70)
    if args.dry_run:
        print(f"{Colors.YELLOW}✨ Dry run complete. Would translate {total_translations} total values.{Colors.RESET}")
    else:
        print(f"{Colors.GREEN}✨ Translation complete! Translated {total_translations} total values.{Colors.RESET}")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())