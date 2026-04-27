const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'apps/staff/src/pages');
const componentsDir = path.join(__dirname, 'apps/staff/src/components');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix the broken hover states
    const replacements = [
        [/hover:bg-surface-container-lowest dark:bg-inverse-surface\/50/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface/50'],
        [/hover:bg-surface-container-lowest dark:bg-inverse-surface/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface/50'],
        [/hover:bg-inverse-surface dark:bg-surface-container-lowest/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface/50'],
        [/hover:bg-surface-container-low dark:bg-inverse-surface/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface/50'],
        // Check for other potential issues like dark:bg-surface-container-lowest instead of dark:hover:bg-something
        [/hover:bg-outline-variant dark:border-outline/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface'],
        
        // Let's ensure border hover states aren't broken either
        [/hover:border-outline-variant dark:border-outline/g, 'hover:border-outline'],
        
        // Also ring
        [/focus:ring-primary\/20/g, 'focus:ring-primary/20']
    ];

    let newContent = content;
    for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
    }

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    }
}

walkDir(pagesDir);
walkDir(componentsDir);
