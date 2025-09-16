#!/usr/bin/env python3
"""
Interactive background removal tool for profile images.
Prompts user for image path relative to ai_chat root directory.
"""

import os
import sys
import io
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image, ImageChops
except ImportError:
    print("Error: Required libraries not installed.")
    print("Please install them using:")
    print("pip install rembg pillow")
    sys.exit(1)


def get_ai_chat_root():
    """Get the ai_chat root directory."""
    script_path = Path(__file__).resolve()
    # Go up from scripts/ to ai_chat/
    ai_chat_root = script_path.parent.parent
    return ai_chat_root


def remove_background_interactive():
    """Interactive function to remove background from user-specified image."""
    print("=== Profile Background Removal Tool ===")
    print("This tool removes backgrounds from profile images.\n")
    
    # Get ai_chat root
    ai_chat_root = get_ai_chat_root()
    print(f"Working from ai_chat root: {ai_chat_root}\n")
    
    # Prompt for file path
    while True:
        relative_path = input("Enter the relative path to the image file (from ai_chat root): ").strip()
        
        if not relative_path:
            print("No path entered. Exiting.")
            return
        
        # Construct full path
        full_path = ai_chat_root / relative_path
        
        if not full_path.exists():
            print(f"❌ File not found: {full_path}")
            print("Please check the path and try again.\n")
            continue
        
        if not full_path.is_file():
            print(f"❌ Path is not a file: {full_path}")
            print("Please provide a path to an image file.\n")
            continue
        
        # Check if it's an image
        valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.gif'}
        if full_path.suffix.lower() not in valid_extensions:
            print(f"❌ Not a supported image format: {full_path.suffix}")
            print(f"Supported formats: {', '.join(valid_extensions)}\n")
            continue
        
        break
    
    print(f"\n✓ Found image: {relative_path}")
    print("Processing... This may take a few seconds.")
    
    try:
        # Read the input image
        with open(full_path, 'rb') as input_file:
            input_data = input_file.read()
        
        # Remove background
        output_data = remove(input_data)
        
        # Convert to PIL Image for cropping
        output_img = Image.open(io.BytesIO(output_data))
        
        # Crop to content with margin
        output_img = crop_to_content_with_margin(output_img)
        
        # Create output filename with _br suffix
        output_filename = full_path.stem + "_br.png"
        output_path = full_path.parent / output_filename
        
        # Save the result
        output_img.save(output_path, 'PNG')
        
        # Get relative path for output
        output_relative = output_path.relative_to(ai_chat_root)
        
        print(f"\n✅ Success! Background removed.")
        print(f"Output saved to: {output_relative}")
        
        # Show image info
        with Image.open(output_path) as img:
            width, height = img.size
            print(f"Image dimensions: {width}x{height}")
        
    except Exception as e:
        print(f"\n❌ Error processing image: {e}")
        return
    
    # Ask if user wants to process another image
    print("\nWould you like to process another image? (y/n): ", end="")
    if input().strip().lower() == 'y':
        print()  # Add blank line
        remove_background_interactive()


def crop_to_content_with_margin(img, margin_ratio=0.05):
    """
    Crop the image to the minimal bounding box around non-transparent pixels, then add a margin.
    """
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    # Get alpha channel
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return img  # No content, return as is
    left, upper, right, lower = bbox
    width, height = img.size
    # Add margin
    margin_x = int((right - left) * margin_ratio)
    margin_y = int((lower - upper) * margin_ratio)
    left = max(0, left - margin_x)
    upper = max(0, upper - margin_y)
    right = min(width, right + margin_x)
    lower = min(height, lower + margin_y)
    return img.crop((left, upper, right, lower))


def main():
    try:
        remove_background_interactive()
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()