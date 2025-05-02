/**
 * This script corrects the case of UI component imports in the client code
 * Run with: node src/fix-imports.js 
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Map of component file names that need to be capitalized
const COMPONENT_MAP = {
  'button': 'Button',
  'card': 'Card',
  'tabs': 'tabs',
  'table': 'table',
  'dialog': 'dialog',
  'badge': 'Badge',
  'use-toast': 'use-toast',
  'scroll-area': 'scroll-area',
  'alert': 'Alert',
  'label': 'Label'
};

async function processFile(filePath) {
  try {
    console.log(`Processing ${filePath}...`);
    const content = await readFileAsync(filePath, 'utf8');
    
    let updatedContent = content;
    
    // Fix import paths
    for (const [oldName, newName] of Object.entries(COMPONENT_MAP)) {
      const importRegex = new RegExp(`from ["']../../components/ui/${oldName}["']`, 'g');
      updatedContent = updatedContent.replace(importRegex, `from "../../components/ui/${newName}"`);
    }
    
    if (content !== updatedContent) {
      await writeFileAsync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function walkDir(dir, fileCallback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await walkDir(fullPath, fileCallback);
    } else if (entry.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      await fileCallback(fullPath);
    }
  }
}

async function main() {
  const srcDir = path.join(__dirname, '..');
  let changedFiles = 0;
  
  await walkDir(srcDir, async (filePath) => {
    const changed = await processFile(filePath);
    if (changed) changedFiles++;
  });
  
  console.log(`Fixed imports in ${changedFiles} files`);
}

main().catch(console.error); 