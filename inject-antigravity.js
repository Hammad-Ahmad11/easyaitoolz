#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const folders = ['creative', 'developer', 'education', 'fitness', '.'];
let updatedCount = 0;

console.log("⚙️ Executing Bulletproof Final Synchronization...");

folders.forEach(folder => {
    const dirPath = path.join(ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach(file => {
        if (!file.endsWith('.html')) return;
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let isUpdated = false;

        // 1. Patches ANY variant of prompt payload safely down to the exact internal variable
        if (content.includes("body: JSON.stringify({ prompt:") || content.includes("body: JSON.stringify({prompt:")) {
            
            // Matches any systemPrompt or prompt layout inside the fetch body and injects the double contract
            content = content.replace(
                /body:\s*JSON\.stringify\(\s*\{\s*prompt:\s*(systemPrompt|prompt)\s*\}\s*\)/g,
                `body: JSON.stringify({ 
        systemPrompt: "You are an expert automated utility backend tailored for real-time web applications. Output strictly the formatted semantic structure or text required by the client tool interface. Never include markdown headers, triple backticks (\`\`\`), greetings, intros, or conversational filler.",
        userPrompt: $1
      })`
            );
            isUpdated = true;
        }

        // 2. Safeguard: Verifies master script injection is globally absolute
        if (!content.includes('antigravity-core.js')) {
            content = content.replace('</body>', '\n<!-- ANTIGRAVITY MASTER ENGINE -->\n<script src="/assets/js/antigravity-core.js"></script>\n</body>');
            isUpdated = true;
        }

        if (isUpdated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Permanently Locked & Synced: ${folder}/${file}`);
            updatedCount++;
        }
    });
});

console.log(`\n🎯 Production Ready! Fully hardened ${updatedCount} tools into the Antigravity Engine.`);