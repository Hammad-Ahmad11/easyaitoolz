(function (global) {
    function buildSystemPrompt(toolContext) {
        return [
            'You are operating under the ANTIGRAVITY PROTOCOL -- a zero-fluff, high-speed utility execution engine.',
            'CURRENT TOOL CONTEXT: ' + toolContext,
            'STRICT RULES:',
            '1. ZERO CONVERSATIONAL FLUFF. No greetings, no concluding remarks.',
            '2. Output must START and END strictly with the raw requested data.',
            '3. Return code inside properly syntax-highlighted blocks, and plans in clean Markdown.'
        ].join('\n');
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
})(window);