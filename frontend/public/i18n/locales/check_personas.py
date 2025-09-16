#!/usr/bin/env python3
"""
Script to verify that all ai_personas_*.json files contain the two new personas:
- ai_persona_sheldon_koseff
- ai_persona_ari_friedman
"""

import json
import os
from pathlib import Path

def check_personas():
    # Define the persona IDs we're looking for
    required_personas = [
        'ai_persona_sheldon_koseff',
        'ai_persona_ari_friedman'
    ]
    
    # Base directory
    base_dir = Path(__file__).parent
    
    # Find all ai_personas_*.json files
    persona_files = []
    
    # Check main en directory
    en_file = base_dir / 'en' / 'ai_personas_en.json'
    if en_file.exists():
        persona_files.append(en_file)
    
    # Check all subdirectories
    for lang_dir in base_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name not in ['en', '.', '..']:
            persona_file = lang_dir / f'ai_personas_{lang_dir.name}.json'
            if persona_file.exists():
                persona_files.append(persona_file)
    
    # Sort files for consistent output
    persona_files.sort()
    
    print(f"Found {len(persona_files)} persona files to check\n")
    
    # Track results
    all_good = True
    missing_personas = {}
    
    # Check each file
    for file_path in persona_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            personas = data.get('personas', {})
            missing = []
            
            # Check for required personas
            for persona_id in required_personas:
                if persona_id not in personas:
                    missing.append(persona_id)
            
            # Report results
            lang_code = file_path.parent.name
            if missing:
                all_good = False
                missing_personas[lang_code] = missing
                print(f"❌ {lang_code}: Missing {', '.join(missing)}")
            else:
                print(f"✅ {lang_code}: All personas present")
                
        except json.JSONDecodeError as e:
            all_good = False
            print(f"❌ {lang_code}: JSON parsing error - {e}")
        except Exception as e:
            all_good = False
            print(f"❌ {lang_code}: Error reading file - {e}")
    
    # Summary
    print("\n" + "="*50)
    if all_good:
        print("✅ SUCCESS: All language files contain both new personas!")
    else:
        print("❌ ISSUES FOUND:")
        for lang, missing in missing_personas.items():
            print(f"  - {lang}: Missing {', '.join(missing)}")
    
    # Additional check: verify the persona details in English file
    print("\n" + "="*50)
    print("Checking persona details in English file:")
    
    try:
        with open(base_dir / 'en' / 'ai_personas_en.json', 'r', encoding='utf-8') as f:
            en_data = json.load(f)
        
        for persona_id in required_personas:
            if persona_id in en_data['personas']:
                persona = en_data['personas'][persona_id]
                print(f"\n{persona_id}:")
                print(f"  Name: {persona.get('name', 'N/A')}")
                print(f"  Specialty: {persona.get('specialty', 'N/A')}")
                print(f"  Voice: {persona.get('voice', 'N/A')}")
                print(f"  Image: {persona.get('image', 'N/A')}")
                print(f"  Gender: {persona.get('gender', 'N/A')}")
    except Exception as e:
        print(f"Error checking English file details: {e}")
    
    return all_good

if __name__ == "__main__":
    check_personas()