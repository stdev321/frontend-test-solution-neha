#!/usr/bin/env python3
"""
Script to update "Your info" to "Your privacy" in all language translation files.
Updates the cards.dataPrivacy.title key in common.json for all 30 languages.
"""

import json
import os
from pathlib import Path

# Translation of "Your privacy" in all 30 languages
TRANSLATIONS = {
    'en': 'Your privacy',       # English
    'am': 'የእርስዎ ግላዊነት',        # Amharic
    'ar': 'خصوصيتك',            # Arabic
    'de': 'Ihre Privatsphäre',  # German
    'el': 'Το απόρρητό σας',    # Greek
    'es': 'Tu privacidad',       # Spanish
    'fa': 'حریم خصوصی شما',      # Persian/Farsi
    'fil': 'Ang iyong privacy', # Filipino
    'fr': 'Votre vie privée',    # French
    'he': 'הפרטיות שלך',         # Hebrew
    'hi': 'आपकी गोपनीयता',        # Hindi
    'id': 'Privasi Anda',        # Indonesian
    'it': 'La tua privacy',      # Italian
    'ja': 'あなたのプライバシー',      # Japanese
    'ko': '귀하의 개인정보',         # Korean
    'mi': 'Tō mātatapu',         # Māori
    'ms': 'Privasi anda',        # Malay
    'nl': 'Uw privacy',          # Dutch
    'pa': 'ਤੁਹਾਡੀ ਗੋਪਨੀਯਤਾ',      # Punjabi
    'pt': 'Sua privacidade',     # Portuguese
    'ru': 'Ваша конфиденциальность', # Russian
    'sw': 'Faragha yako',        # Swahili
    'ta': 'உங்கள் தனியுரிமை',     # Tamil
    'th': 'ความเป็นส่วนตัวของคุณ',  # Thai
    'tr': 'Gizliliğiniz',        # Turkish
    'uk': 'Ваша приватність',    # Ukrainian
    'xh': 'Ubumfihlo bakho',     # Xhosa
    'yo': 'Aṣiri rẹ',            # Yoruba
    'zh': '您的隐私',              # Chinese
    'zu': 'Ubumfihlo bakho',     # Zulu
}

def update_translation_file(lang_code, new_title):
    """Update the translation file for a specific language."""
    base_path = Path(__file__).parent
    file_path = base_path / lang_code / 'common.json'
    
    if not file_path.exists():
        print(f"⚠️  File not found: {file_path}")
        return False
    
    try:
        # Read the existing file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Navigate to the nested key and update it
        if 'landing' in data and 'cards' in data['landing'] and 'dataPrivacy' in data['landing']['cards']:
            old_value = data['landing']['cards']['dataPrivacy'].get('title', 'N/A')
            data['landing']['cards']['dataPrivacy']['title'] = new_title
            
            # Write the updated data back
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"✅ {lang_code}: Updated '{old_value}' → '{new_title}'")
            return True
        else:
            print(f"⚠️  {lang_code}: Missing landing.cards.dataPrivacy structure")
            return False
            
    except json.JSONDecodeError as e:
        print(f"❌ {lang_code}: JSON parsing error - {e}")
        return False
    except Exception as e:
        print(f"❌ {lang_code}: Error - {e}")
        return False

def main():
    """Main function to update all language files."""
    print("=" * 60)
    print("Updating 'Your info' → 'Your privacy' in all languages")
    print("=" * 60)
    print()
    
    successful = 0
    failed = 0
    
    # Process each language
    for lang_code, new_title in TRANSLATIONS.items():
        if update_translation_file(lang_code, new_title):
            successful += 1
        else:
            failed += 1
    
    print()
    print("=" * 60)
    print(f"Update complete!")
    print(f"✅ Successfully updated: {successful} files")
    if failed > 0:
        print(f"❌ Failed: {failed} files")
    print("=" * 60)

if __name__ == "__main__":
    main()