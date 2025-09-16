#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Categories of issues
const issueCategories = {
  noTranslation: {
    name: '🚫 No Translation (Pure Literal Strings)',
    color: colors.red,
    pattern: /disallow literal string:.*(?<!{t\()/,
    examples: [],
    description: 'Text that has no translation at all'
  },
  mixedContent: {
    name: '⚠️  Mixed Content (Text + Translation)',
    color: colors.yellow,
    pattern: /disallow literal string:.*{t\(/,
    examples: [],
    description: 'Text mixed with t() calls - partial translation'
  },
  templateLiterals: {
    name: '📝 Template Literals with Translations',
    color: colors.magenta,
    pattern: /disallow literal string:.*\${t\(/,
    examples: [],
    description: 'Template strings containing translations'
  },
  attributeText: {
    name: '🏷️  Attribute Text',
    color: colors.cyan,
    pattern: /disallow literal string:.*(?:alt|title|placeholder)=/,
    examples: [],
    description: 'Hardcoded text in HTML attributes'
  }
};

function categorizeIssues() {
  console.log(`${colors.cyan}${colors.bright}🔍 Running Deep i18n Analysis...${colors.reset}\n`);
  
  try {
    // Run ESLint and get JSON output
    execSync('npx eslint src/**/*.{js,jsx} --rule "i18next/no-literal-string: warn" --no-error-on-unmatched-pattern --format json --output-file i18n-analysis-temp.json', {
      stdio: 'pipe'
    });
  } catch (error) {
    // ESLint exits with error code when there are warnings/errors
  }

  const reportPath = path.join(process.cwd(), 'i18n-analysis-temp.json');
  if (!fs.existsSync(reportPath)) {
    console.log(`${colors.red}Could not generate analysis report${colors.reset}`);
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  // Analyze each file
  report.forEach(file => {
    const relativePath = path.relative(process.cwd(), file.filePath);
    
    file.messages.forEach(msg => {
      if (msg.ruleId === 'i18next/no-literal-string') {
        const issueInfo = {
          file: relativePath,
          line: msg.line,
          column: msg.column,
          message: msg.message,
          source: file.source ? getSourceLine(file.source, msg.line) : ''
        };
        
        // Categorize the issue
        if (msg.message.includes('{t(') || msg.message.includes('t(\'') || msg.message.includes('t("')) {
          issueCategories.mixedContent.examples.push(issueInfo);
        } else if (msg.message.includes('${t(')) {
          issueCategories.templateLiterals.examples.push(issueInfo);
        } else if (msg.message.match(/\b(alt|title|placeholder|aria-label)=/)) {
          issueCategories.attributeText.examples.push(issueInfo);
        } else {
          issueCategories.noTranslation.examples.push(issueInfo);
        }
      }
    });
  });

  // Display categorized results
  displayResults();
  
  // Generate detailed reports
  generateDetailedReports();
  
  // Clean up
  fs.unlinkSync(reportPath);
}

function getSourceLine(source, lineNumber) {
  const lines = source.split('\n');
  if (lineNumber > 0 && lineNumber <= lines.length) {
    return lines[lineNumber - 1].trim();
  }
  return '';
}

function displayResults() {
  console.log(`${colors.bright}📊 i18n Issue Categories${colors.reset}`);
  console.log('═'.repeat(60));
  
  Object.values(issueCategories).forEach(category => {
    console.log(`\n${category.color}${colors.bright}${category.name}${colors.reset}`);
    console.log(`${category.description}`);
    console.log(`Found: ${category.color}${category.examples.length} issues${colors.reset}`);
    
    if (category.examples.length > 0) {
      console.log('─'.repeat(60));
      // Show top 3 examples
      category.examples.slice(0, 3).forEach(example => {
        console.log(`  📍 ${colors.blue}${example.file}:${example.line}${colors.reset}`);
        if (example.source) {
          console.log(`     ${colors.cyan}${example.source.substring(0, 80)}${example.source.length > 80 ? '...' : ''}${colors.reset}`);
        }
      });
      if (category.examples.length > 3) {
        console.log(`  ... and ${category.examples.length - 3} more`);
      }
    }
  });
  
  // Summary statistics
  console.log(`\n${colors.bright}📈 Summary${colors.reset}`);
  console.log('═'.repeat(60));
  const total = Object.values(issueCategories).reduce((sum, cat) => sum + cat.examples.length, 0);
  console.log(`Total issues: ${colors.yellow}${total}${colors.reset}`);
  
  // Priority recommendations
  console.log(`\n${colors.bright}🎯 Priority Recommendations${colors.reset}`);
  console.log('─'.repeat(60));
  
  if (issueCategories.noTranslation.examples.length > 0) {
    console.log(`${colors.red}1. HIGH PRIORITY:${colors.reset} Fix ${issueCategories.noTranslation.examples.length} pure literal strings`);
    console.log(`   These have NO translation at all and should be wrapped with t()`);
  }
  
  if (issueCategories.mixedContent.examples.length > 0) {
    console.log(`${colors.yellow}2. MEDIUM PRIORITY:${colors.reset} Fix ${issueCategories.mixedContent.examples.length} mixed content issues`);
    console.log(`   These mix literal text with t() calls - use interpolation instead`);
    console.log(`   Example: "Welcome {t('user')}" → t('welcome_user', {user: t('user')})`);
  }
  
  if (issueCategories.templateLiterals.examples.length > 0) {
    console.log(`${colors.magenta}3. REFACTOR:${colors.reset} ${issueCategories.templateLiterals.examples.length} template literals need restructuring`);
    console.log(`   Use translation interpolation instead of template literals`);
  }
}

function generateDetailedReports() {
  // Generate markdown report with categories
  let markdown = `# Deep i18n Analysis Report

Generated: ${new Date().toLocaleString()}

## Issue Categories

`;

  Object.values(issueCategories).forEach(category => {
    markdown += `### ${category.name}

**${category.examples.length} issues found**
${category.description}

`;
    
    if (category.examples.length > 0) {
      markdown += `| File | Line | Issue Sample |
|------|------|--------------|
`;
      category.examples.slice(0, 10).forEach(example => {
        const shortSource = example.source.substring(0, 60).replace(/\|/g, '\\|');
        markdown += `| ${example.file} | ${example.line} | \`${shortSource}${example.source.length > 60 ? '...' : ''}\` |\n`;
      });
      
      if (category.examples.length > 10) {
        markdown += `\n*... and ${category.examples.length - 10} more issues in this category*\n`;
      }
    }
    markdown += '\n';
  });

  // Add fixing guide
  markdown += `## How to Fix Each Type

### 🚫 No Translation (Pure Literal Strings)
\`\`\`jsx
// ❌ Before
<h1>Welcome to our app</h1>

// ✅ After
<h1>{t('welcome.title')}</h1>
\`\`\`

### ⚠️ Mixed Content (Text + Translation)
\`\`\`jsx
// ❌ Before
<p>Welcome {t('user.name')} to our site!</p>

// ✅ After
<p>{t('welcome.message', { name: t('user.name') })}</p>
\`\`\`

### 📝 Template Literals
\`\`\`jsx
// ❌ Before
<p>{\`Hello \${t('user.name')}, welcome!\`}</p>

// ✅ After
<p>{t('greeting.welcome', { name: t('user.name') })}</p>
\`\`\`

### 🏷️ Attribute Text
\`\`\`jsx
// ❌ Before
<img alt="User profile" />

// ✅ After
<img alt={t('image.userProfile')} />
\`\`\`
`;

  fs.writeFileSync('i18n-deep-analysis.md', markdown);
  console.log(`\n${colors.green}✅ Detailed analysis saved to: i18n-deep-analysis.md${colors.reset}`);
  
  // Generate JSON report for programmatic use
  const jsonReport = {
    generated: new Date().toISOString(),
    summary: {
      total: Object.values(issueCategories).reduce((sum, cat) => sum + cat.examples.length, 0),
      byCategory: Object.entries(issueCategories).reduce((acc, [key, cat]) => {
        acc[key] = {
          count: cat.examples.length,
          name: cat.name,
          description: cat.description
        };
        return acc;
      }, {})
    },
    issues: issueCategories
  };
  
  fs.writeFileSync('i18n-deep-analysis.json', JSON.stringify(jsonReport, null, 2));
  console.log(`${colors.green}✅ JSON analysis saved to: i18n-deep-analysis.json${colors.reset}`);
}

// Check for missing translation keys (bonus feature)
async function checkMissingKeys() {
  console.log(`\n${colors.cyan}${colors.bright}🔎 Checking for missing translation keys...${colors.reset}\n`);
  
  const enTranslationPath = path.join(process.cwd(), 'public/i18n/locales/en');
  if (!fs.existsSync(enTranslationPath)) {
    console.log(`${colors.yellow}Could not find translation files${colors.reset}`);
    return;
  }
  
  // Get all translation keys from source code
  try {
    const output = execSync('grep -r "t(" src --include="*.jsx" --include="*.js" | grep -o "t([^)]*)" | sort | uniq', {
      encoding: 'utf8',
      shell: true
    });
    
    const usedKeys = output.split('\n')
      .filter(line => line.trim())
      .map(line => line.match(/t\(['"]([^'"]+)['"]/)?.[1])
      .filter(Boolean);
    
    console.log(`Found ${colors.cyan}${usedKeys.length}${colors.reset} unique translation keys in source code`);
    
    // Check if keys exist in translation files
    const translationFiles = fs.readdirSync(enTranslationPath)
      .filter(f => f.endsWith('.json'));
    
    const existingKeys = new Set();
    translationFiles.forEach(file => {
      const content = JSON.parse(fs.readFileSync(path.join(enTranslationPath, file), 'utf8'));
      const keys = extractKeys(content);
      keys.forEach(key => existingKeys.add(key));
    });
    
    const missingKeys = usedKeys.filter(key => !existingKeys.has(key));
    
    if (missingKeys.length > 0) {
      console.log(`\n${colors.red}⚠️  Found ${missingKeys.length} potentially missing translation keys:${colors.reset}`);
      missingKeys.slice(0, 10).forEach(key => {
        console.log(`  - ${colors.yellow}${key}${colors.reset}`);
      });
      if (missingKeys.length > 10) {
        console.log(`  ... and ${missingKeys.length - 10} more`);
      }
    } else {
      console.log(`${colors.green}✅ All translation keys appear to be defined${colors.reset}`);
    }
    
  } catch (error) {
    console.log(`${colors.yellow}Could not check for missing keys${colors.reset}`);
  }
}

function extractKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Run all analyses
categorizeIssues();
checkMissingKeys();