#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CORE_DIR = path.join(ROOT, 'assets', 'js');
const CORE_FILE = path.join(CORE_DIR, 'antigravity-core.js');

// Assets folder automatically manage karna
if (!fs.existsSync(CORE_DIR)) {
    fs.mkdirSync(CORE_DIR, { recursive: true });
}

// 1. UNIVERSAL FRONTEND ENGINE FOR GROQ (Cloudflare Pages Route)
const CORE_SCRIPT = `(function (global) {
    function buildSystemPrompt(toolContext) {
        return [
            'You are operating under the ANTIGRAVITY PROTOCOL -- a zero-fluff, high-speed utility execution engine.',
            'CURRENT TOOL CONTEXT: ' + toolContext,
            'STRICT RULES:',
            '1. ZERO CONVERSATIONAL FLUFF. No greetings, no concluding remarks.',
            '2. Output must START and END strictly with the raw requested data.',
            '3. Return code inside properly syntax-highlighted blocks, and plans in clean Markdown.'
        ].join('\\n');
    }

    global.initAntigravityTool = async function (config, els) {
        const userPrompt = els.input.value.trim();
        if (!userPrompt) return;

        if (els.button) els.button.disabled = true;
        if (els.status) els.status.textContent = 'Generating...';

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemPrompt: buildSystemPrompt(config.toolContext),
                    userPrompt: userPrompt
                })
            });
            const data = await res.json();
            if (data && data.result) {
                els.output.textContent = data.result;
                if (els.status) els.status.textContent = '';
            } else {
                throw new Error(data.error || 'Execution failed');
            }
        } catch (err) {
            if (els.status) els.status.textContent = 'Error: ' + err.message;
        } finally {
            if (els.button) els.button.disabled = false;
        }
    };
})(window);`;

fs.writeFileSync(CORE_FILE, CORE_SCRIPT, 'utf8');
console.log("✔ Antigravity Core Written Successfully!");

// 2. TARGET ALL HTML FILES IN SUBFOLDERS
const folders = ['creative', 'developer', 'education', 'fitness', '.'];
folders.forEach(folder => {
    const dirPath = path.join(ROOT, folder);
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach(file => {
        if (!file.endsWith('.html')) return;
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Agar purana dev-server text mile toh use mitao aur core connect karo
        if (content.includes('dev-server.js') || content.includes('fetch(')) {
            // Pure script tags aur purane network error text ko clean kar ke naya framework inject karna
            content = content.replace(/catch\s*\(networkError\s*\)[\s\S]*?dev-server\.js[\s\S]*?\}/g, 
                'catch(err) { console.error(err); }');
            
            // Core script attach karna directly before body close
            if (!content.includes('antigravity-core.js')) {
                const injectSnippet = '\n<script src="/assets/js/antigravity-core.js"></script>\n';
                content = content.replace('</body>', injectSnippet + '</body>');
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated: ' + folder + '/' + file);
        }
    });
});
console.log("🚀 All tools successfully migrated to Antigravity Live Engine!");