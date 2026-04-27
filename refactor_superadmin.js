const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'apps/superadmin/src/pages');
const componentsDir = path.join(__dirname, 'apps/superadmin/src/components');
const layoutsDir = path.join(__dirname, 'apps/superadmin/src/layouts');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const replacements = [
        [/text-brand-600/g, 'text-primary-container'],
        [/text-brand-500/g, 'text-primary'],
        [/text-brand-400/g, 'text-primary'],
        [/text-brand-300\/50/g, 'text-primary\/50'],
        [/text-brand-300\/40/g, 'text-primary\/40'],
        [/bg-brand-500\/10/g, 'bg-primary\/10'],
        [/bg-brand-500\/20/g, 'bg-primary\/20'],
        [/bg-brand-500\/30/g, 'bg-primary\/30'],
        [/bg-brand-500\/5/g, 'bg-primary\/5'],
        [/bg-brand-500/g, 'bg-primary'],
        [/border-brand-500\/10/g, 'border-primary\/10'],
        [/border-brand-500\/30/g, 'border-primary\/30'],
        [/border-brand-500\/5/g, 'border-primary\/5'],
        [/border-brand-500/g, 'border-primary'],
        [/ring-brand-500\/20/g, 'ring-primary\/20'],
        [/ring-brand-500/g, 'ring-primary'],
        [/text-slate-900 dark:text-white/g, 'text-on-surface dark:text-inverse-on-surface'],
        [/text-slate-800 dark:text-white/g, 'text-on-surface dark:text-inverse-on-surface'],
        [/text-slate-900/g, 'text-on-surface dark:text-inverse-on-surface'],
        [/text-slate-800/g, 'text-on-surface dark:text-inverse-on-surface'],
        [/text-slate-700/g, 'text-on-surface-variant'],
        [/text-slate-600 dark:text-slate-300/g, 'text-on-surface-variant dark:text-inverse-on-surface'],
        [/text-slate-600 dark:text-slate-400/g, 'text-on-surface-variant dark:text-outline-variant'],
        [/text-slate-600/g, 'text-on-surface-variant'],
        [/text-slate-500 dark:text-slate-400/g, 'text-on-surface-variant dark:text-outline'],
        [/text-slate-500/g, 'text-on-surface-variant'],
        [/text-slate-400/g, 'text-outline'],
        [/bg-white dark:bg-slate-900/g, 'bg-surface-container-lowest dark:bg-inverse-surface'],
        [/bg-white dark:bg-slate-800/g, 'bg-surface-container-lowest dark:bg-inverse-surface'],
        [/bg-white/g, 'bg-surface-container-lowest dark:bg-inverse-surface'],
        [/bg-slate-900 dark:bg-white/g, 'bg-inverse-surface dark:bg-surface-container-lowest'],
        [/bg-slate-900/g, 'bg-inverse-surface dark:bg-surface-container-lowest'],
        [/bg-slate-800/g, 'bg-inverse-surface'],
        [/bg-slate-100 dark:bg-slate-800\/50/g, 'bg-surface-container-low dark:bg-inverse-surface\/50'],
        [/bg-slate-100 dark:bg-slate-800/g, 'bg-surface-container-low dark:bg-inverse-surface'],
        [/bg-slate-100/g, 'bg-surface-container-low dark:bg-inverse-surface'],
        [/bg-slate-50\/50 dark:bg-slate-800\/50/g, 'bg-surface-container-lowest\/50 dark:bg-inverse-surface\/50'],
        [/bg-slate-50\/50 dark:bg-transparent/g, 'bg-surface-container-lowest\/50 dark:bg-transparent'],
        [/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-surface-container-lowest dark:bg-inverse-surface\/50'],
        [/bg-slate-50/g, 'bg-surface-container-lowest dark:bg-inverse-surface'],
        [/hover:bg-slate-50 dark:hover:bg-slate-800\/50/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface\/50'],
        [/hover:bg-slate-50 dark:hover:bg-brand-500\/5/g, 'hover:bg-surface-container-low dark:hover:bg-primary\/5'],
        [/hover:bg-slate-50/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface\/50'],
        [/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-surface-container dark:hover:bg-inverse-surface'],
        [/hover:bg-slate-100/g, 'hover:bg-surface-container dark:hover:bg-inverse-surface'],
        [/hover:bg-slate-200 dark:hover:bg-slate-800/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface'],
        [/hover:bg-slate-200 dark:hover:bg-slate-700/g, 'hover:bg-surface-container-high dark:hover:bg-outline-variant\/20'],
        [/hover:bg-slate-200/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface\/50'],
        [/hover:bg-slate-800/g, 'hover:bg-inverse-surface'],
        [/border-slate-200 dark:border-slate-800/g, 'border-outline-variant dark:border-outline'],
        [/border-slate-200 dark:border-brand-500\/10/g, 'border-outline-variant dark:border-primary\/10'],
        [/border-slate-200/g, 'border-outline-variant dark:border-outline'],
        [/border-slate-100 dark:border-slate-800/g, 'border-outline-variant dark:border-outline'],
        [/border-slate-100 dark:border-brand-500\/5/g, 'border-outline-variant dark:border-primary\/5'],
        [/border-slate-100/g, 'border-outline-variant dark:border-outline'],
        [/divide-slate-100 dark:divide-slate-800/g, 'divide-outline-variant dark:divide-outline'],
        [/divide-slate-100/g, 'divide-outline-variant dark:divide-outline'],
        [/divide-slate-200 dark:divide-slate-800/g, 'divide-outline-variant dark:divide-outline'],
        [/divide-slate-200/g, 'divide-outline-variant dark:divide-outline'],
        [/shadow-slate-200\/50/g, 'shadow-outline-variant\/50'],
        [/shadow-slate-200/g, 'shadow-outline-variant'],

        // Hover fixes
        [/hover:bg-surface-container-lowest dark:bg-inverse-surface\/50/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface/50'],
        [/hover:bg-surface-container-lowest dark:bg-inverse-surface/g, 'hover:bg-surface-container-low dark:hover:bg-inverse-surface/50'],
        [/hover:bg-inverse-surface dark:bg-surface-container-lowest/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface/50'],
        [/hover:bg-surface-container-low dark:bg-inverse-surface/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface/50'],
        [/hover:bg-outline-variant dark:border-outline/g, 'hover:bg-surface-container-high dark:hover:bg-inverse-surface'],
        [/hover:border-outline-variant dark:border-outline/g, 'hover:border-outline'],
        [/focus:ring-primary\/20/g, 'focus:ring-primary/20']
    ];

    let newContent = content;
    for (const [regex, replacement] of replacements) {
        newContent = newContent.replace(regex, replacement);
    }

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Updated', filePath);
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
walkDir(layoutsDir);
