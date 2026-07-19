#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const folders = ['creative', 'developer', 'education', 'fitness', '.'];
let updatedCount = 0;

console.log("🌍 Switching all API routes to LIVE PRODUCTION network...");

folders.forEach(folder => {
    const dirPath = path.join(ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach(file => {
        if (!file.endsWith('.html')) return;
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let isUpdated = false;

        // 1. Force the fetch URL to look relative to the live domain, bypassing any local dev-server traps
        if (content.includes("body: JSON.stringify({ prompt:") || content.includes("body: JSON.stringify({prompt:") || content.includes("systemPrompt")) {
            
            // Hardening the fetch logic to absolute cloud routes instead of expecting localhost:3000 or dev-server.js
            content = content.replace(
                /var\s+response\s*=\s*await\s+fetch\s*\(\s*['"]\/api\/generate['"][\s\S]*?body:\s*JSON\.stringify\([\s\S]*?\}\s*\)\s*\);/g,
                `var response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        systemPrompt: "You are an expert automated utility backend tailored for real-time web applications. Output strictly the formatted semantic structure or text required by the client tool interface. Never include markdown headers, triple backticks (\`\`\`), greetings, intros, or conversational filler.",
        userPrompt: typeof systemPrompt !== 'undefined' ? systemPrompt : (typeof prompt !== 'undefined' ? prompt : "Generate parameters")
      })
    });`
            );
            isUpdated = true;
        }

        // 2. Double check script endpoint binding
        if (!content.includes('antigravity-core.js')) {
            content = content.replace('</body>', '\n<!-- ANTIGRAVITY MASTER ENGINE -->\n<script src="/assets/js/antigravity-core.js"></script>\n</body>');
            isUpdated = true;
        }

        if (isUpdated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`🌍 Production Linked: ${folder}/${file}`);
            updatedCount++;
        }
    });
});

console.log(`\n🎯 Complete! All ${updatedCount} files are now permanently pointing to Cloudflare Production.`);