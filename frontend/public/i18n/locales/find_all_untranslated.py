#!/usr/bin/env python3
"""
Script to find all untranslated IDs across all locale files
"""

import json
from pathlib import Path
from collections import defaultdict

def get_all_keys_from_json(data, prefix=""):
    """Recursively extract all keys from nested JSON structure"""
    keys = set()
    if isinstance(data, dict):
        for key, value in data.items():
            full_key = f"{prefix}.{key}" if prefix else key
            keys.add(full_key)
            if isinstance(value, dict):
                keys.update(get_all_keys_from_json(value, full_key))
    return keys

def find_untranslated_ids():
    base_dir = Path(__file__).parent
    
    # Get all English translation files
    en_dir = base_dir / "en"
    en_files = {}
    en_all_keys = defaultdict(set)
    
    # Read all English JSON files
    for json_file in en_dir.glob("*.json"):
        if json_file.name not in ["translation.json"]:  # Skip meta files
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    en_files[json_file.name] = data
                    en_all_keys[json_file.name] = get_all_keys_from_json(data)
            except Exception as e:
                print(f"Error reading {json_file}: {e}")
    
    # Check each language
    untranslated_by_lang = defaultdict(lambda: defaultdict(list))
    
    for lang_dir in base_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name not in ['.', '..', 'en']:
            # Check each file type
            for file_name, en_keys in en_all_keys.items():
                target_file = lang_dir / file_name
                if target_file.exists():
                    try:
                        with open(target_file, 'r', encoding='utf-8') as f:
                            lang_data = json.load(f)
                            lang_keys = get_all_keys_from_json(lang_data)
                            
                            # Find missing keys
                            missing_keys = en_keys - lang_keys
                            if missing_keys:
                                untranslated_by_lang[lang_dir.name][file_name].extend(sorted(missing_keys))
                    except Exception as e:
                        print(f"Error reading {target_file}: {e}")
                else:
                    # Entire file is missing
                    untranslated_by_lang[lang_dir.name][file_name] = ["FILE_MISSING"]
    
    return untranslated_by_lang, en_all_keys

def generate_markdown_report(untranslated_by_lang, en_all_keys):
    """Generate a markdown report of untranslated IDs"""
    report = []
    report.append("# Untranslated i18n IDs Report\n")
    report.append(f"Generated on: {Path(__file__).parent}\n")
    
    # Summary
    report.append("## Summary\n")
    total_langs = len(untranslated_by_lang)
    report.append(f"- Total languages checked: {total_langs}")
    report.append(f"- Languages with missing translations: {len([l for l in untranslated_by_lang if untranslated_by_lang[l]])}\n")
    
    # English key counts
    report.append("## English Translation Files\n")
    for file_name, keys in sorted(en_all_keys.items()):
        report.append(f"- **{file_name}**: {len(keys)} keys")
    report.append("")
    
    # Detailed report by language
    report.append("## Missing Translations by Language\n")
    
    for lang in sorted(untranslated_by_lang.keys()):
        files_data = untranslated_by_lang[lang]
        if files_data:
            report.append(f"### {lang.upper()}\n")
            
            for file_name in sorted(files_data.keys()):
                missing_keys = files_data[file_name]
                if missing_keys:
                    report.append(f"#### {file_name}")
                    
                    if missing_keys == ["FILE_MISSING"]:
                        report.append("- **FILE MISSING** - This entire file needs to be created\n")
                    else:
                        report.append(f"Missing {len(missing_keys)} keys:")
                        for key in missing_keys[:10]:  # Show first 10
                            report.append(f"- `{key}`")
                        if len(missing_keys) > 10:
                            report.append(f"- ... and {len(missing_keys) - 10} more keys\n")
                        else:
                            report.append("")
    
    # Languages with complete translations
    complete_langs = []
    all_langs = set()
    for lang_dir in Path(__file__).parent.iterdir():
        if lang_dir.is_dir() and lang_dir.name not in ['.', '..', 'en']:
            all_langs.add(lang_dir.name)
            if lang_dir.name not in untranslated_by_lang or not untranslated_by_lang[lang_dir.name]:
                complete_langs.append(lang_dir.name)
    
    if complete_langs:
        report.append("## Fully Translated Languages\n")
        report.append("The following languages have all translation keys:")
        for lang in sorted(complete_langs):
            report.append(f"- {lang}")
    
    return "\n".join(report)

if __name__ == "__main__":
    print("Finding untranslated IDs...")
    untranslated_by_lang, en_all_keys = find_untranslated_ids()
    
    # Generate markdown report
    report = generate_markdown_report(untranslated_by_lang, en_all_keys)
    
    # Save to file
    output_file = Path(__file__).parent / "untranslated_ids_report.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {output_file}")
    print(f"Total languages with missing translations: {len([l for l in untranslated_by_lang if untranslated_by_lang[l]])}")