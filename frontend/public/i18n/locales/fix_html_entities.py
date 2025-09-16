#!/usr/bin/env python3
"""
Script to fix HTML entities in JSON translation files.
Replaces HTML entities like &#39; with their actual characters.
"""

import json
import os
import html
from pathlib import Path

def fix_html_entities_in_json(file_path):
    """
    Fix HTML entities in a JSON file by replacing them with actual characters.
    Returns True if changes were made, False otherwise.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            original_content = content
        
        # Parse JSON to ensure it's valid
        data = json.loads(content)
        
        # Convert the data back to string with proper formatting
        json_str = json.dumps(data, ensure_ascii=False, indent=2)
        
        # Decode HTML entities in the JSON string
        # This will convert &#39; to ', &quot; to ", etc.
        decoded_str = html.unescape(json_str)
        
        # Check if any changes were made
        if decoded_str != json_str:
            # Write the fixed content back
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(decoded_str)
                f.write('\n')  # Add newline at end of file
            return True
        return False
        
    except json.JSONDecodeError as e:
        print(f"  ❌ Invalid JSON in {file_path}: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Error processing {file_path}: {e}")
        return False

def process_all_translations():
    """
    Process all translation JSON files in the locales directory.
    """
    locales_dir = Path(__file__).parent
    
    # Track statistics
    total_files = 0
    fixed_files = 0
    error_files = 0
    
    # Get all language directories
    lang_dirs = [d for d in locales_dir.iterdir() if d.is_dir() and not d.name.startswith('.')]
    lang_dirs.sort()
    
    print("Fixing HTML entities in translation files...")
    print("=" * 60)
    
    for lang_dir in lang_dirs:
        lang_code = lang_dir.name
        json_files = list(lang_dir.glob('*.json'))
        
        if not json_files:
            continue
            
        print(f"\n📁 Processing {lang_code}:")
        
        for json_file in json_files:
            total_files += 1
            file_name = json_file.name
            
            # Check if file contains HTML entities before processing
            with open(json_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if any(entity in content for entity in ['&#39;', '&quot;', '&amp;', '&lt;', '&gt;', '&#']):
                print(f"  🔧 {file_name}", end=" ... ")
                if fix_html_entities_in_json(json_file):
                    print("✅ Fixed")
                    fixed_files += 1
                else:
                    print("❌ Error")
                    error_files += 1
            else:
                # File doesn't contain HTML entities, skip silently
                pass
    
    # Print summary
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"📊 Total files processed: {total_files}")
    print(f"✅ Files fixed: {fixed_files}")
    if error_files > 0:
        print(f"❌ Files with errors: {error_files}")
    
    if fixed_files == 0:
        print("\n✨ No HTML entities found in any files!")
    else:
        print(f"\n✨ Successfully fixed HTML entities in {fixed_files} files!")

def main():
    """
    Main entry point for the script.
    """
    print("HTML Entity Fixer for Translation Files")
    print("This script will replace HTML entities like &#39; with actual characters")
    print()
    
    # Run the processing
    process_all_translations()
    
    print("\n🎉 Processing complete!")

if __name__ == "__main__":
    main()