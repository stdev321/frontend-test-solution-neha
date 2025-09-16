# Shmuel's Translation Process

## Complete i18n Translation Workflow for VirtualMD.app

This document outlines the comprehensive translation process for managing internationalization (i18n) in the VirtualMD.app frontend application, supporting 30 languages with automated extraction, synchronization, and translation.

---

## 📋 Overview

The translation process consists of three main phases:
1. **Extraction** - Finding and extracting hardcoded strings from React components
2. **Synchronization** - Ensuring all language files have identical structure
3. **Translation** - Automatically translating empty values using Google Translate API

---

## Phase 1: String Extraction from Source Code

### 🔍 Purpose
Extract hardcoded literal strings from React/JavaScript files and move them to i18n JSON files.

### 🤖 Automated Agent Process
We use a custom i18n extraction coordinator that employs three specialized agents in a loop:

#### The Three-Agent Workflow:
1. **Scanner Agent** (`i18n-literal-scanner`)
   - Scans JavaScript/TypeScript files for hardcoded text
   - Identifies strings that should use i18n translation keys
   - Works on one file at a time

2. **Marker Agent** (`i18n-comment-marker`)
   - Adds extraction comments to specific lines/functions
   - Marks exactly where and how to extract each literal
   - Prepares the code for extraction

3. **Executor Agent** (`i18n-comment-executor`)
   - Processes the extraction comments
   - Extracts text to English i18n JSON files
   - Creates new key-value pairs
   - Updates the code with i18n function calls

### 📝 Command
```bash
# Run the i18n extraction coordinator on a specific file
# This launches the three-agent workflow automatically
claude-code --agent i18n-extraction-coordinator "Extract strings from LoginPage.jsx"
```

### Process Flow:
```
Start → Scanner → Marker → Executor → Check for more literals → (Loop back to Scanner) → Complete
```

### Example Transformation:
**Before:**
```jsx
<Button>Login</Button>
<Typography>Welcome back!</Typography>
```

**After:**
```jsx
<Button>{t('auth.loginButton')}</Button>
<Typography>{t('auth.welcomeMessage')}</Typography>
```

**Added to English JSON:**
```json
{
  "auth": {
    "loginButton": "Login",
    "welcomeMessage": "Welcome back!"
  }
}
```

---

## Phase 2: Schema Synchronization

### 🔄 Purpose
Ensure all 29 language files have the exact same structure as English source files.

### 📂 Script: `i18n-schema-sync.js` (✅ Implemented)

#### What it does:
- Uses English as the source of truth
- Adds missing keys to other languages with empty string values
- **Removes extra keys that don't exist in English** (ensures exact match)
- Preserves existing translations
- Results in exact schema match across all languages
- File-by-file operation by default (safer)
- Requires filename or --all flag

### 📝 Commands

#### Single File Sync (Recommended - Default):
```bash
# Preview changes first (always recommended)
node scripts/i18n-schema-sync.js chat.json --dry-run

# Apply changes to single file
node scripts/i18n-schema-sync.js chat.json
```

#### All Files Sync (Use with caution):
```bash
# Preview all changes
node scripts/i18n-schema-sync.js --all --dry-run

# Apply to all files (requires --all flag)
node scripts/i18n-schema-sync.js --all
```

#### Error if no file specified:
```bash
node scripts/i18n-schema-sync.js
# ❌ Error: You must specify a filename or use --all flag
```

### Output Example:
```
📄 Processing chat.json
   Source (en): 499 keys
   ✓ FR: +23 keys
     + guest.errors.sessionFailed
     + guest.registrationRequired
     ... and 21 more
   ✓ ES: -2 keys (removed extras)
     - oldFeature.obsoleteKey
     - typo.wrongKey
```

---

## Phase 3: Automatic Translation

### 🌐 Purpose
Fill empty values in language files by translating from English using Google Translate API v3.

### 📂 Script: `i18n-auto-translate.py` (✅ Implemented)

#### What it does:
1. **Loads credentials** from backend/.env file automatically
2. **Scans target language file** for empty string values
3. **Finds the English value** for each empty key
4. **Calls Google Translate v3 API** to translate the text
5. **Updates the language file** with translated value
6. **Processes one key at a time** with progress display

### Implemented Features:
- ✅ Process file-by-file (one language at a time)
- ✅ Support for all 30 languages or specific language
- ✅ Automatic rate limiting (0.1s delay between translations)
- ✅ Skips already translated values (unless --force flag)
- ✅ Color-coded progress output
- ✅ Dry-run mode for preview
- ✅ Uses existing Google Translate v3 service from backend
- ✅ Preserves JSON structure and formatting

### Commands:
```bash
# Translate empty values in a specific file for one language
python3 scripts/i18n-auto-translate.py chat.json fr

# Translate for all languages
python3 scripts/i18n-auto-translate.py chat.json all

# Preview what would be translated (dry-run)
python3 scripts/i18n-auto-translate.py chat.json fr --dry-run

# Force retranslate even if values are not empty
python3 scripts/i18n-auto-translate.py chat.json fr --force
```

### Example Output:
```
📄 Processing: chat.json

🌍 Language: FR
  Found 23 empty keys to translate
    Translating: guest.errors.sessionFailed ✓
      'Failed to start guest session' → 'Échec du démarrage de la session invité'
    Translating: guest.registrationRequired ✓
      'Registration required' → 'Inscription requise'
    ... (more translations)
  ✓ Saved 23 translations to fr/chat.json
```

### Translation Quality:
- ~90% accuracy for common UI terms
- Medical/technical terms may need review
- Preserves proper nouns correctly
- Handles punctuation and special characters

---

## 🔄 Complete Workflow

### For New Features:
1. **Write code** with hardcoded strings (quick development)
2. **Run extraction** coordinator to move strings to i18n
3. **Run schema sync** to update all language files
4. **Run auto-translate** to fill in translations

### For Maintenance:
1. **Run validation scripts** to check completeness
2. **Run schema sync** if structure has diverged
3. **Run auto-translate** for any missing translations

---

## 📊 Validation Scripts

### File Comparison
```bash
# Check file structure across languages
node scripts/i18n-file-comparison.js
```

### Key Validation
```bash
# Validate keys and values for specific file
node scripts/i18n-key-validation.js chat.json

# Generate JSON report
node scripts/i18n-key-validation.js chat.json --json
```

---

## 🎯 Best Practices

1. **Always preview changes** with `--dry-run` before applying
2. **Process file-by-file** rather than bulk operations
3. **Commit after each phase** for easy rollback
4. **Review translations** - automated translations may need refinement
5. **Test in context** - some translations may need adjustment based on UI space

---

## 📁 File Structure

```
frontend/
├── src/
│   └── components/        # React components with i18n hooks
├── public/
│   └── i18n/
│       └── locales/
│           ├── en/        # English source files
│           │   ├── chat.json
│           │   ├── common.json
│           │   ├── header.json
│           │   └── pages.json
│           ├── fr/        # French translations
│           ├── es/        # Spanish translations
│           └── ... (27 more languages)
└── scripts/
    ├── i18n-schema-sync.js
    ├── i18n-key-validation.js
    ├── i18n-file-comparison.js
    └── i18n-auto-translate.js (coming soon)
```

---

## 🌍 Supported Languages

The system supports 30 languages including:
- English (en) - Source language
- Spanish (es), French (fr), German (de), Italian (it)
- Chinese (zh), Japanese (ja), Korean (ko)
- Arabic (ar), Hebrew (he), Farsi (fa)
- Hindi (hi), Bengali (bn), Tamil (ta), Telugu (te)
- Portuguese (pt), Russian (ru), Turkish (tr)
- And 13 more...

---

## 🔧 Configuration

### Environment Variables
The auto-translation script automatically loads credentials from `backend/.env`. Required variables:
```bash
# Google Translate v3 API credentials (in backend/.env)
GOOGLE_TRANSLATE_PROJECT_ID=mindscriptaivideoandchat
GOOGLE_TRANSLATE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_TRANSLATE_CLIENT_EMAIL=aichat-translation-service@...
GOOGLE_TRANSLATE_CLIENT_ID=...
# ... and other Google Translate environment variables
```

### Source Language
The source language is hardcoded as English (`en`) in all scripts.

### Script Requirements
```bash
# Node.js for validation and sync scripts
node --version  # v14+ required

# Python 3 for translation script
python3 --version  # v3.7+ required

# Required Python packages (already in backend)
# - google-cloud-translate
# - google-auth
```

---

## 📈 Progress Tracking

Use the markdown reports generated by validation scripts:
- `i18n-validation-report-chat.md` - Detailed analysis per file
- `i18n-reports/` folder - JSON data for processing

---

## 🚀 Future Enhancements

1. **Contextual translations** - Use glossaries for consistent terminology
2. **Plural support** - Handle singular/plural forms correctly
3. **Variable preservation** - Ensure {{variables}} are maintained
4. **Translation memory** - Reuse previous translations
5. **Quality checks** - Detect potential translation issues
6. **Batch processing** - Optimize API calls for cost efficiency

---

*This process ensures consistent, maintainable, and scalable internationalization across the entire VirtualMD.app application.*