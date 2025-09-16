#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function runLintAnalysis() {
  console.log(`${colors.cyan}${colors.bright}🔍 Running i18n Linting Analysis...${colors.reset}\n`);
  
  try {
    // Run ESLint and get JSON output
    execSync('npx eslint src/**/*.{js,jsx} --rule "i18next/no-literal-string: warn" --no-error-on-unmatched-pattern --format json --output-file i18n-lint-temp.json', {
      stdio: 'pipe'
    });
  } catch (error) {
    // ESLint exits with error code when there are warnings/errors, but we still have the output
  }

  // Read the JSON report
  const reportPath = path.join(process.cwd(), 'i18n-lint-temp.json');
  if (!fs.existsSync(reportPath)) {
    console.log(`${colors.red}Could not generate lint report${colors.reset}`);
    return;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  // Analyze the results
  const stats = {
    totalFiles: 0,
    filesWithIssues: 0,
    totalWarnings: 0,
    totalErrors: 0,
    i18nWarnings: 0,
    otherIssues: 0,
    filesByIssueCount: [],
    topOffenders: []
  };

  report.forEach(file => {
    if (file.messages.length > 0) {
      stats.filesWithIssues++;
      
      const i18nIssues = file.messages.filter(msg => msg.ruleId === 'i18next/no-literal-string');
      const otherIssues = file.messages.filter(msg => msg.ruleId !== 'i18next/no-literal-string');
      
      stats.i18nWarnings += i18nIssues.length;
      stats.otherIssues += otherIssues.length;
      stats.totalWarnings += file.warningCount;
      stats.totalErrors += file.errorCount;
      
      if (i18nIssues.length > 0) {
        const relativePath = path.relative(process.cwd(), file.filePath);
        stats.filesByIssueCount.push({
          path: relativePath,
          count: i18nIssues.length,
          samples: i18nIssues.slice(0, 3).map(issue => ({
            line: issue.line,
            message: issue.message.substring(0, 100) + (issue.message.length > 100 ? '...' : '')
          }))
        });
      }
    }
    stats.totalFiles++;
  });

  // Sort files by issue count
  stats.filesByIssueCount.sort((a, b) => b.count - a.count);
  stats.topOffenders = stats.filesByIssueCount.slice(0, 10);

  // Generate summary report
  console.log(`${colors.bright}📊 i18n Linting Summary${colors.reset}`);
  console.log('═'.repeat(50));
  console.log(`📁 Total files scanned: ${colors.cyan}${stats.totalFiles}${colors.reset}`);
  console.log(`📝 Files with issues: ${colors.yellow}${stats.filesWithIssues}${colors.reset}`);
  console.log(`⚠️  Total i18n warnings: ${colors.yellow}${stats.i18nWarnings}${colors.reset}`);
  console.log(`❌ Other errors: ${colors.red}${stats.otherIssues}${colors.reset}`);
  console.log('═'.repeat(50));

  if (stats.topOffenders.length > 0) {
    console.log(`\n${colors.bright}🔥 Top Files Needing i18n Updates:${colors.reset}`);
    console.log('─'.repeat(50));
    
    stats.topOffenders.forEach((file, index) => {
      console.log(`${colors.bright}${index + 1}. ${file.path}${colors.reset} (${colors.yellow}${file.count} issues${colors.reset})`);
      file.samples.forEach(sample => {
        console.log(`   Line ${sample.line}: ${colors.cyan}${sample.message}${colors.reset}`);
      });
      console.log('');
    });
  }

  // Generate markdown report
  const markdownReport = generateMarkdownReport(stats);
  fs.writeFileSync('i18n-lint-report.md', markdownReport);
  console.log(`\n${colors.green}✅ Detailed report saved to: i18n-lint-report.md${colors.reset}`);
  
  // Generate HTML visualization
  const htmlReport = generateHTMLReport(stats);
  fs.writeFileSync('i18n-lint-report.html', htmlReport);
  console.log(`${colors.green}✅ HTML report saved to: i18n-lint-report.html${colors.reset}`);
  
  // Clean up temp file
  fs.unlinkSync(reportPath);

  // Provide actionable summary
  if (stats.i18nWarnings > 0) {
    console.log(`\n${colors.bright}💡 Next Steps:${colors.reset}`);
    console.log('1. Review the report files for detailed issues');
    console.log('2. Use your translation tools to add missing translations');
    console.log('3. Replace literal strings with t() function calls');
    console.log(`4. Run ${colors.cyan}npm run lint:i18n${colors.reset} to verify fixes`);
  } else {
    console.log(`\n${colors.green}🎉 Great! No i18n issues found!${colors.reset}`);
  }
}

function generateMarkdownReport(stats) {
  let markdown = `# i18n Linting Report

Generated: ${new Date().toLocaleString()}

## Summary

- **Total Files Scanned**: ${stats.totalFiles}
- **Files with Issues**: ${stats.filesWithIssues}
- **i18n Warnings**: ${stats.i18nWarnings}
- **Other Issues**: ${stats.otherIssues}

## Files Requiring i18n Updates

| File | Issues | Priority |
|------|--------|----------|
`;

  stats.filesByIssueCount.forEach(file => {
    const priority = file.count > 20 ? '🔴 High' : file.count > 10 ? '🟡 Medium' : '🟢 Low';
    markdown += `| ${file.path} | ${file.count} | ${priority} |\n`;
  });

  markdown += `\n## Detailed Issues by File\n\n`;

  stats.topOffenders.forEach(file => {
    markdown += `### ${file.path}\n`;
    markdown += `**${file.count} issues found**\n\n`;
    markdown += `Sample issues:\n`;
    file.samples.forEach(sample => {
      markdown += `- Line ${sample.line}: ${sample.message}\n`;
    });
    markdown += '\n';
  });

  markdown += `\n## How to Fix

1. Import the translation hook: \`import { useTranslation } from 'react-i18next';\`
2. Get the translation function: \`const { t } = useTranslation();\`
3. Replace literal strings: \`<Text>Hello</Text>\` → \`<Text>{t('greeting.hello')}</Text>\`
4. Add the translation key to your locale files

## Commands

- View issues in terminal: \`npm run lint:i18n\`
- Generate this report: \`npm run lint:i18n:summary\`
- Open HTML report: \`open i18n-lint-report.html\`
`;

  return markdown;
}

function generateHTMLReport(stats) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>i18n Linting Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 2rem;
        }
        h1 { margin: 0; }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        .files-list {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-top: 2rem;
        }
        .file-item {
            padding: 1rem;
            border-bottom: 1px solid #eee;
        }
        .file-item:last-child {
            border-bottom: none;
        }
        .file-path {
            font-weight: bold;
            color: #444;
        }
        .issue-count {
            display: inline-block;
            background: #ffd93d;
            color: #333;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.85rem;
            margin-left: 10px;
        }
        .priority-high { background: #ff6b6b; color: white; }
        .priority-medium { background: #ffd93d; }
        .priority-low { background: #51cf66; color: white; }
        .sample {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: #f8f9fa;
            border-left: 3px solid #667eea;
            font-family: monospace;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 i18n Linting Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="stat-card">
            <div class="stat-number">${stats.totalFiles}</div>
            <div class="stat-label">Files Scanned</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.filesWithIssues}</div>
            <div class="stat-label">Files with Issues</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.i18nWarnings}</div>
            <div class="stat-label">i18n Warnings</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.otherIssues}</div>
            <div class="stat-label">Other Issues</div>
        </div>
    </div>
    
    <div class="files-list">
        <h2>Files Requiring i18n Updates</h2>
        ${stats.filesByIssueCount.map(file => {
            const priorityClass = file.count > 20 ? 'priority-high' : 
                                 file.count > 10 ? 'priority-medium' : 'priority-low';
            return `
            <div class="file-item">
                <div class="file-path">
                    ${file.path}
                    <span class="issue-count ${priorityClass}">${file.count} issues</span>
                </div>
                ${file.samples.map(sample => `
                    <div class="sample">Line ${sample.line}: ${sample.message}</div>
                `).join('')}
            </div>
            `;
        }).join('')}
    </div>
</body>
</html>`;
}

// Run the analysis
runLintAnalysis();