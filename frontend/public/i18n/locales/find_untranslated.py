#!/usr/bin/env python3
"""
Script to find all languages where the new personas still have English text
"""

import json
from pathlib import Path

def check_for_english_text():
    # Base directory
    base_dir = Path(__file__).parent
    
    # Target personas
    target_personas = ['ai_persona_sheldon_koseff', 'ai_persona_ari_friedman']
    
    # English keywords to check for
    english_indicators = [
        "I'm AI Sheldon Koseff",
        "I'm AI Ari Friedman", 
        "Health Imaging Analysis",
        "Healthcare System Navigator",
        "your VirtualMD.app Clinical Advisor specializing in health imaging",
        "your VirtualMD.app Health Advisor specializing in healthcare system navigation"
    ]
    
    # Find all ai_personas_*.json files
    untranslated_languages = []
    
    # Check all language directories
    for lang_dir in base_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name not in ['.', '..', 'en']:
            persona_file = lang_dir / f'ai_personas_{lang_dir.name}.json'
            if persona_file.exists():
                try:
                    with open(persona_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        data = json.loads(content)
                    
                    # Check if file contains English text for new personas
                    has_english = False
                    for persona_id in target_personas:
                        if persona_id in data.get('personas', {}):
                            persona_text = json.dumps(data['personas'][persona_id])
                            for indicator in english_indicators:
                                if indicator in persona_text:
                                    has_english = True
                                    break
                        if has_english:
                            break
                    
                    if has_english:
                        untranslated_languages.append(lang_dir.name)
                        
                except Exception as e:
                    print(f"Error reading {lang_dir.name}: {e}")
    
    # Sort the list
    untranslated_languages.sort()
    
    # Output results
    print(f"Languages with untranslated English text: {len(untranslated_languages)}")
    print("\nLanguages that need translation:")
    for lang in untranslated_languages:
        print(f"  - {lang}")
    
    return untranslated_languages

if __name__ == "__main__":
    check_for_english_text()