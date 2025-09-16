#!/usr/bin/env python3
"""
i18n Clear Changed Translations Script
Compares current English with old English backup and clears translations for changed values.

Usage:
    python scripts/i18n-clear-changed.py [language] [--dry-run]
    
Arguments:
    [language]  Specific language to clear changes for (e.g., 'es', 'fr'). If omitted, clears for all languages
    --dry-run   Show what would be cleared without making changes
    
Workflow:
    1. Copy current English files to backup subfolder: 
       mkdir -p public/i18n/locales/en/old
       cp public/i18n/locales/en/*.json public/i18n/locales/en/old/
    2. Edit English files directly in public/i18n/locales/en/
    3. Run this script to clear changed values in translation files
    4. Run translation script to fill cleared values
    
Examples:
    python scripts/i18n-clear-changed.py                    # Clear changes in all languages
    python scripts/i18n-clear-changed.py es                 # Clear changes in Spanish only  
    python scripts/i18n-clear-changed.py --dry-run          # Preview all changes
    python scripts/i18n-clear-changed.py fr --dry-run       # Preview French changes only
"""

import json
import sys
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

def load_json(filepath: Path) -> Dict:
    """Load JSON file."""
    if not filepath.exists():
        return {}
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath: Path, data: Dict) -> None:
    """Save JSON file with proper formatting."""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')

def find_changed_keys(old: Any, current: Any, path: str = '') -> List[str]:
    """
    Recursively find keys where values have changed between old and current.
    Returns list of key paths that have different values.
    """
    changed = []
    
    if type(old) != type(current):
        # Type changed - consider it changed
        return [path] if path else []
    
    if isinstance(old, dict) and isinstance(current, dict):
        # Compare dictionaries
        all_keys = set(old.keys()) | set(current.keys())
        for key in all_keys:
            key_path = f"{path}.{key}" if path else key
            
            if key not in old:
                # New key in current - skip (don't clear translations for new keys)
                continue
            elif key not in current:
                # Key removed in current - mark as changed
                changed.append(key_path)
            else:
                # Key exists in both - recurse
                changed.extend(find_changed_keys(old[key], current[key], key_path))
                
    elif isinstance(old, list) and isinstance(current, list):
        # Compare lists
        if len(old) != len(current):
            # List length changed - mark whole list as changed
            return [path] if path else []
        
        # Compare each item
        for i, (old_item, curr_item) in enumerate(zip(old, current)):
            item_path = f"{path}[{i}]"
            changed.extend(find_changed_keys(old_item, curr_item, item_path))
            
    else:
        # Leaf values - compare directly
        if old != current:
            changed.append(path)
    
    return changed

def clear_value_at_path(data: Any, path: str) -> Any:
    """
    Clear the value at the specified path in the data structure.
    Returns modified data.
    """
    if not path:
        return data
    
    # Parse the path into parts
    import re
    parts = re.split(r'\.|\[|\]', path)
    parts = [p for p in parts if p]  # Remove empty strings
    
    # Navigate to the parent
    current = data
    parent_stack = [(data, None, None)]  # (container, key/index, parent)
    
    for i, part in enumerate(parts[:-1]):
        if part.isdigit():
            # Array index
            idx = int(part)
            if isinstance(current, list) and idx < len(current):
                parent_stack.append((current[idx], idx, current))
                current = current[idx]
            else:
                return data  # Path doesn't exist
        else:
            # Object key
            if isinstance(current, dict) and part in current:
                parent_stack.append((current[part], part, current))
                current = current[part]
            else:
                return data  # Path doesn't exist
    
    # Clear the final value
    final_part = parts[-1]
    if final_part.isdigit():
        # Array index
        idx = int(final_part)
        if isinstance(current, list) and idx < len(current):
            if isinstance(current[idx], str):
                current[idx] = ""  # Clear string
            elif isinstance(current[idx], dict):
                current[idx] = clear_all_strings(current[idx])
            elif isinstance(current[idx], list):
                current[idx] = clear_all_strings(current[idx])
    else:
        # Object key
        if isinstance(current, dict) and final_part in current:
            if isinstance(current[final_part], str):
                current[final_part] = ""  # Clear string
            elif isinstance(current[final_part], (dict, list)):
                current[final_part] = clear_all_strings(current[final_part])
    
    return data

def clear_all_strings(data: Any) -> Any:
    """Recursively clear all strings in a data structure."""
    if isinstance(data, str):
        return ""
    elif isinstance(data, dict):
        return {k: clear_all_strings(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clear_all_strings(item) for item in data]
    else:
        return data  # Keep numbers, booleans, None as is

def process_file(filename: str, target_language: str = None, dry_run: bool = False, verbose: bool = True) -> Tuple[int, int]:
    """
    Process a single file: compare old vs current, clear changed in all languages.
    Returns (number_of_changed_keys, number_of_languages_updated).
    """
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    
    # Paths
    old_file = locales_dir / 'en' / 'old' / filename
    current_file = locales_dir / 'en' / filename
    
    # Load files
    old_data = load_json(old_file)
    current_data = load_json(current_file)
    
    if not old_data:
        if verbose:
            print(f"  ⚠ No old backup found: {old_file.name}")
        return 0, 0
    
    # Find changed keys
    changed_keys = find_changed_keys(old_data, current_data)
    
    if not changed_keys:
        if verbose:
            print(f"  ✓ No changes detected")
        return 0, 0
    
    if verbose:
        print(f"  Found {len(changed_keys)} changed values:")
        for key in changed_keys[:5]:  # Show first 5
            # Get old and new values for display
            old_val = get_value_at_path(old_data, key)
            new_val = get_value_at_path(current_data, key)
            if isinstance(old_val, str) and isinstance(new_val, str):
                old_preview = old_val[:30] + "..." if len(old_val) > 30 else old_val
                new_preview = new_val[:30] + "..." if len(new_val) > 30 else new_val
                print(f"    • {key}")
                print(f"      Old: \"{old_preview}\"")
                print(f"      New: \"{new_preview}\"")
            else:
                print(f"    • {key}")
        if len(changed_keys) > 5:
            print(f"    ... and {len(changed_keys) - 5} more")
    
    # Get target languages
    if target_language:
        languages = [target_language]
    else:
        # Get all language directories (excluding English)
        languages = [d.name for d in locales_dir.iterdir() 
                     if d.is_dir() and d.name != 'en']
    
    languages_updated = 0
    
    # Clear changed values in each language
    for lang in sorted(languages):
        lang_file = locales_dir / lang / filename
        if not lang_file.exists():
            continue
            
        lang_data = load_json(lang_file)
        
        # Clear each changed key
        for key_path in changed_keys:
            lang_data = clear_value_at_path(lang_data, key_path)
        
        if not dry_run:
            save_json(lang_file, lang_data)
            
        languages_updated += 1
    
    if verbose:
        if dry_run:
            print(f"  [DRY RUN] Would clear {len(changed_keys)} values in {languages_updated} languages")
        else:
            print(f"  ✓ Cleared {len(changed_keys)} values in {languages_updated} languages")
    
    return len(changed_keys), languages_updated

def get_value_at_path(data: Any, path: str) -> Any:
    """Get value at specified path for comparison display."""
    import re
    parts = re.split(r'\.|\[|\]', path)
    parts = [p for p in parts if p]
    
    current = data
    for part in parts:
        if part.isdigit():
            idx = int(part)
            if isinstance(current, list) and idx < len(current):
                current = current[idx]
            else:
                return None
        else:
            if isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
    return current

def parse_args():
    """Parse command line arguments."""
    args = sys.argv[1:]
    
    target_language = None
    dry_run = False
    
    for arg in args:
        if arg == '--dry-run':
            dry_run = True
        elif not arg.startswith('--') and target_language is None:
            target_language = arg
    
    return target_language, dry_run

def main():
    target_language, dry_run = parse_args()
    
    print("\n╔════════════════════════════════════════════════════════════════╗")
    print("║           i18n Clear Changed Translations Tool                 ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No files will be modified")
    
    if target_language:
        print(f"\n🎯 Target Language: {target_language}")
    else:
        print("\n🌍 Target: All languages")
    
    # Check if en/old directory exists
    locales_dir = Path(__file__).parent.parent / 'public' / 'i18n' / 'locales'
    en_dir = locales_dir / 'en'
    en_old_dir = en_dir / 'old'
    
    if not en_old_dir.exists():
        print(f"\n⚠ Old backup directory not found: {en_old_dir}")
        print("\nTo use this script:")
        print("1. Create backup of current English files:")
        print(f"   mkdir -p {en_old_dir}")
        print(f"   cp {en_dir}/*.json {en_old_dir}/")
        print("2. Edit the English files directly in en/")
        print("3. Run this script to clear changed translations")
        print("4. Run translation script to fill cleared values")
        sys.exit(1)
    
    # Get files to process - always process all files
    # Process all files that exist in both en and en/old
    old_files = set(f.name for f in en_old_dir.glob('*.json'))
    # Get current files but exclude the 'old' subdirectory
    current_files = set(f.name for f in en_dir.glob('*.json'))
    files = sorted(old_files & current_files)  # Intersection
    print(f"\nComparing {len(files)} files between en/ and en/old/")
    
    if not files:
        print("No files to process!")
        sys.exit(0)
    
    # Process each file
    total_changed = 0
    total_languages = 0
    
    for filename in files:
        print(f"\nProcessing: {filename}")
        changed, langs = process_file(filename, target_language, dry_run)
        total_changed += changed
        total_languages = max(total_languages, langs)
    
    # Summary
    print("\n" + "="*60)
    if dry_run:
        print(f"DRY RUN Summary:")
        print(f"  Would clear {total_changed} total values")
        print(f"  Across {total_languages} languages")
        print(f"\nTo apply changes, run without --dry-run")
    else:
        print(f"Summary:")
        print(f"  ✓ Cleared {total_changed} total values")
        print(f"  ✓ Updated {total_languages} languages")
        
        if total_changed > 0:
            print(f"\nNext steps:")
            print(f"1. Run translation to fill the cleared values:")
            if target_language:
                print(f"   python scripts/i18n-translate-all.py {target_language}")
            else:
                print(f"   python scripts/i18n-translate-all.py")
            print(f"2. After successful translation, you can remove the old backup:")
            print(f"   rm -rf {en_old_dir}")
    
    print("\n✨ Done!")

if __name__ == '__main__':
    main()