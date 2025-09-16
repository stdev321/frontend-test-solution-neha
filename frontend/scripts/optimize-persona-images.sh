#!/bin/bash

# Smart 3-tier persona image optimization
# Based on industry standards from Discord, Slack, WhatsApp, Teams

PERSONA_DIR="../public/persona_images"
BACKUP_DIR="../public/persona_images/originals"

echo "🎨 Smart Persona Image Optimization System"
echo "=========================================="
echo "Using industry-standard sizes:"
echo "  • Tiny: 96x96 (chat avatars - like Teams/Discord)"
echo "  • Medium: 256x256 (mobile/cards)"
echo "  • High: 512x512 (bios/popups - like Slack/WhatsApp)"
echo ""

# Create backup directory for originals
mkdir -p "$BACKUP_DIR"

# Track statistics
total_saved=0
files_processed=0

# Function to optimize a single persona image
optimize_persona() {
    local filename=$1
    local basename="${filename%.png}"
    
    # Skip if already processed
    if [[ "$filename" == *"_tiny.png" ]] || [[ "$filename" == *"_medium.png" ]] || [[ "$filename" == *"_high.png" ]] || [[ "$filename" == *"_optimized.png" ]] || [[ "$filename" == *"_backup.png" ]]; then
        return
    fi
    
    echo "Processing: $filename"
    
    # Move original to backup (only if not already backed up)
    if [ ! -f "$BACKUP_DIR/$filename" ]; then
        cp "$PERSONA_DIR/$filename" "$BACKUP_DIR/$filename"
    fi
    
    # Get original size for comparison
    local orig_size_bytes=$(stat -f%z "$BACKUP_DIR/$filename" 2>/dev/null || stat -c%s "$BACKUP_DIR/$filename" 2>/dev/null)
    
    # Create 3 optimized versions:
    
    # 1. TINY (96x96) - For chat message avatars
    # Higher compression since they're small
    magick "$BACKUP_DIR/$filename" \
        -resize 96x96^ \
        -gravity center \
        -extent 96x96 \
        -quality 75 \
        -strip \
        -define png:compression-level=9 \
        -define png:compression-strategy=4 \
        "$PERSONA_DIR/${basename}_tiny.png"
    
    # 2. MEDIUM (256x256) - For mobile buttons/cards
    # Balanced quality/size
    magick "$BACKUP_DIR/$filename" \
        -resize 256x256^ \
        -gravity center \
        -extent 256x256 \
        -quality 85 \
        -strip \
        -define png:compression-level=9 \
        "$PERSONA_DIR/${basename}_medium.png"
    
    # 3. HIGH (512x512) - For desktop bios/popups
    # High quality for detailed views
    magick "$BACKUP_DIR/$filename" \
        -resize 512x512^ \
        -gravity center \
        -extent 512x512 \
        -quality 92 \
        -strip \
        -define png:compression-level=7 \
        "$PERSONA_DIR/${basename}_high.png"
    
    # Get file sizes for reporting
    local orig_size=$(ls -lh "$BACKUP_DIR/$filename" | awk '{print $5}')
    local tiny_size=$(ls -lh "$PERSONA_DIR/${basename}_tiny.png" | awk '{print $5}')
    local medium_size=$(ls -lh "$PERSONA_DIR/${basename}_medium.png" | awk '{print $5}')
    local high_size=$(ls -lh "$PERSONA_DIR/${basename}_high.png" | awk '{print $5}')
    
    # Calculate total size of new files
    local tiny_bytes=$(stat -f%z "$PERSONA_DIR/${basename}_tiny.png" 2>/dev/null || stat -c%s "$PERSONA_DIR/${basename}_tiny.png" 2>/dev/null)
    local medium_bytes=$(stat -f%z "$PERSONA_DIR/${basename}_medium.png" 2>/dev/null || stat -c%s "$PERSONA_DIR/${basename}_medium.png" 2>/dev/null)
    local high_bytes=$(stat -f%z "$PERSONA_DIR/${basename}_high.png" 2>/dev/null || stat -c%s "$PERSONA_DIR/${basename}_high.png" 2>/dev/null)
    local new_total=$((tiny_bytes + medium_bytes + high_bytes))
    
    local saved=$((orig_size_bytes - new_total))
    total_saved=$((total_saved + saved))
    files_processed=$((files_processed + 1))
    
    echo "  ✓ Original: $orig_size → Tiny: $tiny_size | Medium: $medium_size | High: $high_size"
    
    # Remove the original from main directory (it's in backup now)
    rm "$PERSONA_DIR/$filename"
}

# Process all persona images
cd "$(dirname "$0")"
echo ""
echo "📦 Processing persona images..."
echo ""

for image in "$PERSONA_DIR"/*.png; do
    if [ -f "$image" ]; then
        filename=$(basename "$image")
        optimize_persona "$filename"
    fi
done

echo ""
echo "🧹 Cleaning up old optimized versions..."
# Remove old _optimized versions since we have better tier system now
rm -f "$PERSONA_DIR"/*_optimized.png

# Calculate total savings in MB
total_saved_mb=$((total_saved / 1024 / 1024))

echo ""
echo "📊 Summary:"
echo "----------"
echo "Files processed: $files_processed"
echo "Space saved: ~${total_saved_mb}MB"
echo "Originals backed up to: $BACKUP_DIR"
echo ""
echo "Created 3 versions per persona:"
echo "  • _tiny.png (96x96) - Chat avatars (2x retina ready)"
echo "  • _medium.png (256x256) - Mobile/cards"  
echo "  • _high.png (512x512) - Desktop bios/popups"
echo ""
echo "✅ Optimization complete!"