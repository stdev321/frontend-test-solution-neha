#!/usr/bin/env python3
"""
Script to update all language translations with the new mobile welcome labels.
Uses the Google Translate API from the backend to translate the new labels.
"""

import json
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_path = Path(__file__).resolve().parents[5] / 'backend'
sys.path.insert(0, str(backend_path))

from backend.external_services.google_translate_service import GoogleTranslateService

def load_json_file(file_path):
    """Load a JSON file and return its contents."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json_file(file_path, data):
    """Save data to a JSON file with proper formatting."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write('\n')  # Add newline at end of file

def update_translations():
    """Update all language translations with the new mobile labels."""
    
    # Initialize the translation service
    translator = GoogleTranslateService()
    
    # The new English labels to translate
    english_labels = {
        "chat": "Chat",
        "advisory": "Advisory", 
        "encyclopedia": "Encyclopedia",
        "myTeam": "My Team",
        "history": "History",
        "myProfile": "My Profile"
    }
    
    # Get the base directory
    locales_dir = Path(__file__).parent
    
    # List of all language codes (excluding 'en' since it's already done)
    languages = [
        'am', 'ar', 'de', 'el', 'es', 'fa', 'fil', 'fr', 'he', 'hi',
        'id', 'it', 'ja', 'ko', 'mi', 'ms', 'nl', 'pa', 'pt', 'ru',
        'sw', 'ta', 'th', 'tr', 'uk', 'xh', 'yo', 'zh', 'zu'
    ]
    
    # Track results
    successful = []
    failed = []
    
    for lang in languages:
        lang_dir = locales_dir / lang
        chat_file = lang_dir / 'chat.json'
        
        if not chat_file.exists():
            print(f"⚠️  {lang}/chat.json not found, skipping...")
            failed.append((lang, "File not found"))
            continue
        
        try:
            # Load the existing translations
            data = load_json_file(chat_file)
            
            # Check if mobileWelcome section exists
            if 'mobileWelcome' not in data:
                data['mobileWelcome'] = {}
            
            # Check if labels already exists, if not create it
            if 'labels' not in data['mobileWelcome']:
                data['mobileWelcome']['labels'] = {}
            
            # Translate each label
            translated_labels = {}
            for key, value in english_labels.items():
                # For "My Team" and "My Profile", handle specially since they might already exist
                if key == "myTeam" and 'myTeam' in data['mobileWelcome']:
                    # Use existing translation if available
                    translated_labels[key] = data['mobileWelcome']['myTeam']
                elif key == "myProfile" and 'myProfile' in data['mobileWelcome']:
                    # Use existing translation if available
                    translated_labels[key] = data['mobileWelcome']['myProfile']
                else:
                    # Translate the label
                    result = translator.translate_text(
                        value,
                        target_language=lang,
                        source_language='en'
                    )
                    translated_labels[key] = result['translated_text']
            
            # Update the labels
            data['mobileWelcome']['labels'] = translated_labels
            
            # Save the updated file
            save_json_file(chat_file, data)
            
            print(f"✅ {lang}: Updated successfully")
            successful.append(lang)
            
        except Exception as e:
            print(f"❌ {lang}: Failed - {str(e)}")
            failed.append((lang, str(e)))
    
    # Print summary
    print("\n" + "="*60)
    print(f"Translation Update Summary:")
    print(f"✅ Successful: {len(successful)} languages")
    print(f"❌ Failed: {len(failed)} languages")
    
    if failed:
        print("\nFailed languages:")
        for lang, error in failed:
            print(f"  - {lang}: {error}")
    
    print("\n✨ Mobile labels translation update complete!")

if __name__ == "__main__":
    print("Starting translation update for mobile labels...")
    print("="*60)
    update_translations()