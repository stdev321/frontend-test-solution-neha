#!/usr/bin/env python3
"""
Script to extract all data for the two new personas from all language files
and save it to a markdown file for review.
"""

import json
import os
from pathlib import Path

def extract_personas():
    # Define the persona IDs we're looking for
    target_personas = [
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
        persona_files.append(('en', en_file))
    
    # Check all subdirectories
    for lang_dir in base_dir.iterdir():
        if lang_dir.is_dir() and lang_dir.name not in ['en', '.', '..']:
            persona_file = lang_dir / f'ai_personas_{lang_dir.name}.json'
            if persona_file.exists():
                persona_files.append((lang_dir.name, persona_file))
    
    # Sort files for consistent output
    persona_files.sort(key=lambda x: x[0])
    
    # Collect all persona data
    all_data = {}
    
    for lang_code, file_path in persona_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            personas = data.get('personas', {})
            lang_data = {}
            
            for persona_id in target_personas:
                if persona_id in personas:
                    lang_data[persona_id] = personas[persona_id]
            
            if lang_data:
                all_data[lang_code] = lang_data
                
        except Exception as e:
            print(f"Error reading {lang_code}: {e}")
    
    # Generate markdown output
    md_content = "# Extracted New Personas Data\n\n"
    md_content += "This file contains the complete extracted data for the two new personas across all languages.\n\n"
    
    # Add table of contents
    md_content += "## Table of Contents\n\n"
    for lang_code in sorted(all_data.keys()):
        md_content += f"- [{lang_code.upper()}](#{lang_code})\n"
    
    md_content += "\n---\n\n"
    
    # Add data for each language
    for lang_code in sorted(all_data.keys()):
        md_content += f"## {lang_code.upper()}\n\n"
        
        for persona_id in target_personas:
            if persona_id in all_data[lang_code]:
                persona = all_data[lang_code][persona_id]
                md_content += f"### {persona_id}\n\n"
                
                # Format each field
                for key, value in persona.items():
                    if key == 'bio':
                        # Format bio with proper line breaks
                        bio_lines = value.split('\\n')
                        md_content += f"**{key}:**\n\n"
                        for line in bio_lines:
                            if line.strip():
                                md_content += f"{line}\n\n"
                    else:
                        md_content += f"**{key}:** {value}\n\n"
                
                md_content += "---\n\n"
        
        md_content += "\n"
    
    # Save to file
    output_file = base_dir / 'new_personas_data.md'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Data extracted and saved to: {output_file}")
    print(f"Total languages processed: {len(all_data)}")
    
    # Also create a JSON file for easier processing
    json_output = base_dir / 'new_personas_data.json'
    with open(json_output, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"JSON data also saved to: {json_output}")

if __name__ == "__main__":
    extract_personas()