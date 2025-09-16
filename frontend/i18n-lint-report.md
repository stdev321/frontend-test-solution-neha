# i18n Linting Report

Generated: 8/25/2025, 3:56:58 PM

## Summary

- **Total Files Scanned**: 72
- **Files with Issues**: 35
- **i18n Warnings**: 338
- **Other Issues**: 53

## Files Requiring i18n Updates

| File | Issues | Priority |
|------|--------|----------|
| src/pages/HowToPage.jsx | 154 | 🔴 High |
| src/pages/LegalPage_backup.jsx | 68 | 🔴 High |
| src/pages/LegalPage_original.jsx | 68 | 🔴 High |
| src/pages/WellnessPathwaysGuidePage.jsx | 23 | 🔴 High |
| src/pages/LandingPage.jsx | 11 | 🟡 Medium |
| src/pages/FAQPage.jsx | 7 | 🟢 Low |
| src/components/IntroductoryPopup.jsx | 4 | 🟢 Low |
| src/components/PersonaSelection.js | 3 | 🟢 Low |

## Detailed Issues by File

### src/pages/HowToPage.jsx
**154 issues found**

Sample issues:
- Line 89: disallow literal string: <Typography variant="h6" sx={{ px: 3, mb: 2, fontWeight: 600 }}>
        Co...
- Line 199: disallow literal string: <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fon...
- Line 207: disallow literal string: <Typography variant="h6" sx={{ 
            mb: 6,
            textAlign: '...

### src/pages/LegalPage_backup.jsx
**68 issues found**

Sample issues:
- Line 59: disallow literal string: <Typography variant="h1" component="h1" align="center" gutterBottom sx={{ f...
- Line 64: disallow literal string: <Typography variant="h2" component="h2" sx={h2Styles}><GavelIcon sx={{verti...
- Line 66: disallow literal string: <Typography sx={paragraphStyles}>
          Welcome to VirtualMD.app (the "...

### src/pages/LegalPage_original.jsx
**68 issues found**

Sample issues:
- Line 61: disallow literal string: <Typography variant="h1" component="h1" align="center" gutterBottom sx={{ f...
- Line 66: disallow literal string: <Typography variant="h2" component="h2" sx={h2Styles}><GavelIcon sx={{verti...
- Line 68: disallow literal string: <Typography sx={paragraphStyles}>
          Welcome to VirtualMD.app (the "...

### src/pages/WellnessPathwaysGuidePage.jsx
**23 issues found**

Sample issues:
- Line 25: disallow literal string: <Typography variant="h5" gutterBottom color="error">
            Always Con...
- Line 28: disallow literal string: <Typography variant="body1" paragraph>
            While VirtualMD's AI-pow...
- Line 32: disallow literal string: <strong>In a medical emergency:</strong>

### src/pages/LandingPage.jsx
**11 issues found**

Sample issues:
- Line 423: disallow literal string: <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
        ...
- Line 435: disallow literal string: <strong>IMPORTANT MEDICAL ADVISORY:</strong>
- Line 437: disallow literal string: <Typography variant="body2" paragraph>
            VirtualMD.app is designe...

### src/pages/FAQPage.jsx
**7 issues found**

Sample issues:
- Line 129: disallow literal string: <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontW...
- Line 138: disallow literal string: <Typography variant="h6" sx={{ 
          mb: 4,
          textAlign: 'cent...
- Line 202: disallow literal string: <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
    ...

### src/components/IntroductoryPopup.jsx
**4 issues found**

Sample issues:
- Line 363: disallow literal string: <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
- Line 371: disallow literal string: <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
- Line 379: disallow literal string: <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>

### src/components/PersonaSelection.js
**3 issues found**

Sample issues:
- Line 73: disallow literal string: <Typography>Error loading personas: {error}</Typography>
- Line 80: disallow literal string: <Typography variant="h6" gutterBottom>
        Select AI Personas for Your ...
- Line 83: disallow literal string: <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        ...


## How to Fix

1. Import the translation hook: `import { useTranslation } from 'react-i18next';`
2. Get the translation function: `const { t } = useTranslation();`
3. Replace literal strings: `<Text>Hello</Text>` → `<Text>{t('greeting.hello')}</Text>`
4. Add the translation key to your locale files

## Commands

- View issues in terminal: `npm run lint:i18n`
- Generate this report: `npm run lint:i18n:summary`
- Open HTML report: `open i18n-lint-report.html`
