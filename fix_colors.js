const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');
const componentsDir = path.join(__dirname, 'components');

const replaceRules = [
    { regex: /\bbg-white(?!\/)\b/g, replacement: 'bg-surface' },
    { regex: /\bbg-white\/(10|20|30|40|50|60|70|80|90)\b/g, replacement: 'bg-surface/$1' },
    { regex: /\btext-gray-500\b/g, replacement: 'text-text-muted' },
    { regex: /\btext-gray-600\b/g, replacement: 'text-text-secondary' },
    { regex: /\btext-gray-[789]00\b/g, replacement: 'text-text-primary' },
    { regex: /\bbg-gray-50\b/g, replacement: 'bg-background' },
    { regex: /\bbg-gray-100\b/g, replacement: 'bg-border/50' }, 
    { regex: /\bbg-gray-200\b/g, replacement: 'bg-border' },
];

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            replaceRules.forEach(rule => {
                content = content.replace(rule.regex, rule.replacement);
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

processDirectory(targetDir);
processDirectory(componentsDir);

console.log('Done replacing hardcoded colors.');
