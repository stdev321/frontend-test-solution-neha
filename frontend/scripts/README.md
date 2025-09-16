# Shmuel's i18n Translation Scripts

Custom translation management tools for VirtualMD.app supporting 30+ languages.

## Scripts Overview

### Core Workflow Scripts

1. **i18n-schema-sync.js** - Synchronize JSON structure across languages
   ```bash
   node scripts/i18n-schema-sync.js chat.json --dry-run
   node scripts/i18n-schema-sync.js chat.json
   ```

2. **i18n-auto-translate.py** - Auto-translate empty values using Google Translate v3
   ```bash
   # Translate one language
   python3 scripts/i18n-auto-translate.py chat.json fr --dry-run
   python3 scripts/i18n-auto-translate.py chat.json fr
   
   # Translate ALL languages at once (recommended)
   python3 scripts/i18n-auto-translate.py chat.json all
   ```

3. **i18n-key-validation.js** - Validate translation completeness
   ```bash
   node scripts/i18n-key-validation.js chat.json
   node scripts/i18n-key-validation.js chat.json --summary
   ```

### Analysis Scripts

4. **i18n-file-comparison.js** - Compare file structures across languages
   ```bash
   node scripts/i18n-file-comparison.js
   ```

5. **i18n-deep-analysis.js** - Deep analysis of translation files
6. **i18n-lint-summary.js** - Lint summary for translation issues

## Documentation

See **TRANSLATION_PROCESS.md** for the complete three-phase translation workflow.

## Quick Start

**IMPORTANT**: All scripts should be run from the `frontend/` directory, NOT from `frontend/scripts/`

1. Extract strings from code (using agents)
2. Sync schemas: `node scripts/i18n-schema-sync.js [file]`
3. Auto-translate: `python3 scripts/i18n-auto-translate.py [file] [lang|all]`
4. Validate: `node scripts/i18n-key-validation.js [file]`

## Common Issues & Solutions

### Running Scripts
- **Always run from `frontend/` directory**: `cd frontend` first
- Scripts use relative paths assuming you're in frontend folder
- Don't cd into scripts folder - run as `node scripts/scriptname.js`

### Translation Tips
- **Use "all" to translate all languages at once**: 
  ```bash
  python3 scripts/i18n-auto-translate.py chat.json all
  ```
- **Validation may show false "missing keys"**: Filipino often shows issues but translations work fine
- **Empty values in English source**: These are placeholders, not translation gaps
- **Duplicate keys across files**: Check which namespace the component uses with `useTranslation('namespace')`

### Quick Status Check
```bash
# From frontend directory
for file in chat.json pages.json header.json common.json; do
  echo "==== $file ===="
  node scripts/i18n-key-validation.js $file --summary 2>&1 | grep "SUMMARY:"
done
```