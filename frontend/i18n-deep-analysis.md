# Deep i18n Analysis Report

Generated: 25.8.2025, 16:06:33

## Issue Categories

### 🚫 No Translation (Pure Literal Strings)

**338 issues found**
Text that has no translation at all

| File | Line | Issue Sample |
|------|------|--------------|
| src/components/IntroductoryPopup.jsx | 363 | `<Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★<...` |
| src/components/IntroductoryPopup.jsx | 371 | `<Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★<...` |
| src/components/IntroductoryPopup.jsx | 379 | `<Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★<...` |
| src/components/IntroductoryPopup.jsx | 387 | `<Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★<...` |
| src/components/PersonaSelection.js | 73 | `<Typography>Error loading personas: {error}</Typography>` |
| src/components/PersonaSelection.js | 80 | `<Typography variant="h6" gutterBottom>` |
| src/components/PersonaSelection.js | 83 | `<Typography variant="body2" color="text.secondary" sx={{ mb:...` |
| src/pages/FAQPage.jsx | 129 | `}}>` |
| src/pages/FAQPage.jsx | 138 | `}}>` |
| src/pages/FAQPage.jsx | 202 | `<Typography variant="h5" gutterBottom sx={{ fontWeight: 600,...` |

*... and 328 more issues in this category*

### ⚠️  Mixed Content (Text + Translation)

**0 issues found**
Text mixed with t() calls - partial translation


### 📝 Template Literals with Translations

**0 issues found**
Template strings containing translations


### 🏷️  Attribute Text

**0 issues found**
Hardcoded text in HTML attributes


## How to Fix Each Type

### 🚫 No Translation (Pure Literal Strings)
```jsx
// ❌ Before
<h1>Welcome to our app</h1>

// ✅ After
<h1>{t('welcome.title')}</h1>
```

### ⚠️ Mixed Content (Text + Translation)
```jsx
// ❌ Before
<p>Welcome {t('user.name')} to our site!</p>

// ✅ After
<p>{t('welcome.message', { name: t('user.name') })}</p>
```

### 📝 Template Literals
```jsx
// ❌ Before
<p>{`Hello ${t('user.name')}, welcome!`}</p>

// ✅ After
<p>{t('greeting.welcome', { name: t('user.name') })}</p>
```

### 🏷️ Attribute Text
```jsx
// ❌ Before
<img alt="User profile" />

// ✅ After
<img alt={t('image.userProfile')} />
```
