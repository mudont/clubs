#!/usr/bin/env ts-node

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface MergeOptions {
  rulesDir: string;
  outputFile: string;
}

function mergeCursorRules(options: MergeOptions = {
  rulesDir: '.cursor/rules',
  outputFile: '.cursorrules'
}): void {
  try {
    // Read all .md files from the rules directory
    const files = readdirSync(options.rulesDir)
      .filter(file => file.endsWith('.md'))
      .sort(); // Sort for consistent order

    if (files.length === 0) {
      console.error(`❌ No .md files found in ${options.rulesDir}`);
      process.exit(1);
    }

    // Read and concatenate all rule files
    const rulesContent = files
      .map(file => {
        const filePath = join(options.rulesDir, file);
        const content = readFileSync(filePath, 'utf8');
        return `# ${file.replace('.md', '').toUpperCase()} RULES\n\n${content}\n\n`;
      })
      .join('---\n\n');

    // Write the merged content to .cursorrules
    writeFileSync(options.outputFile, rulesContent, 'utf8');

    console.log(`✅ Merged ${files.length} rule files into ${options.outputFile}`);
    console.log(`📁 Files merged: ${files.join(', ')}`);

  } catch (error) {
    console.error('❌ Error merging cursor rules:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the merge if this file is executed directly
if (require.main === module) {
  mergeCursorRules();
}

export { mergeCursorRules, MergeOptions };
