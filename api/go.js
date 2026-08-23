const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    const { t } = req.query;

    // FORM (Jab token nahi hai)
    if (!t) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Somusayan</title>
            <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
            <style>
                body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:sans-serif; color:#fff; }
                .box { background:#161b22; padding:40px; border-radius:16px; text-align:center; max-width:400px; width:100%; }
                input, button { width:100%; padding:12px; margin:8px 0; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:#fff; }
                button { background:#00d4ff; color:#000; font-weight:bold; border:none; }
            </style>
            </head>
            <body>
            <div class="box">
                <h2>🛡️ Somusayan</h2>
                <form method="POST" action="/api/go">
                    <input type="url" name="url" placeholder="https://example.com" required />
                    <div class="cf-turnstile" data-sitekey="${process.env.TURNSTILE_SITE_KEY}"></div>
                    <button type="submit">Generate</button>
                </form>
            </div>
            </body>
            </html>
        `);
    }

    // TOKEN VERIFY + BYPASS PAGE
    try {
        const decoded = jwt.verify(t, process.env.JWT_SECRET);
        if (Date.now() > decoded.exp * 1000) return res.send('<h1>Expired</h1>');

        return res.send(`
            <html><head><title>Bypass</title>
            <style>
                body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:monospace; color:#00ff88; }
                .box { background:#161b22; padding:30px; border-radius:16px; text-align:center; max-width:400px; }
                .spin { width:40px; height:40px; border:4px solid #00ff8844; border-top:4px solid #00ff88; border-radius:50%; animation:spin 1s infinite; margin:auto; }
                @keyframes spin { 100% { transform:rotate(360deg); } }
                .pbar { width:100%; height:4px; background:#333; margin:15px 0; border-radius:2px; }
                .pfill { height:100%; width:0%; background:#00ff88; transition:width 0.5s; }
                .log { text-align:left; background:#000; padding:10px; border-radius:8px; font-size:12px; max-height:80px; overflow-y:auto; }
            </style>
            </head>
            <body>
            <div class="box">
                <div class="spin"></div>
                <p id="status">⏳ Bypassing...</p>
                <div class="pbar"><div class="pfill" id="pfill"></div></div>
                <div class="log" id="log"><div>> Engine started</div></div>
            </div>
            <script>
                const token = "${t}";
                const steps = ["Decrypting", "Firewall bypass", "Spoofing", "Tunnel up", "✅ Done"];
                let sec = 90, idx = 0;
                const status = document.getElementById('status');
                const pfill = document.getElementById('pfill');
                const log = document.getElementById('log');

                setInterval(() => {
                    sec--;
                    pfill.style.width = ((90 - sec) / 90) * 100 + '%';
                    if (sec % 15 === 0 && idx < steps.length) {
                        status.innerText = "⏳ " + steps[idx];
                        log.innerHTML += "<div>> " + steps[idx] + "</div>";
                        idx++;
                    }
                    if (sec <= 0) {
                        clearInterval(this);
                        status.innerText = "✅ Redirecting...";
                        fetch('/api/go?reveal=true&t=' + token)
                            .then(r => r.json())
                            .then(d => { if(d.url) window.location.href = d.url; });
                    }
                }, 1000);
            </script>
            </body></html>
        `);
    } catch(e) { res.status(400).send('Invalid Token'); }
};

// POST HANDLER
module.exports.POST = async (req, res) => {
    const form = await req.formData();
    const url = form.get('url');
    const token = form.get('cf-turnstile-response');

    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token })
    });
    const data = await verify.json();
    if (!data.success) return res.status(400).send('Turnstile fail');

    const jwtToken = jwt.sign({ url, exp: Math.floor(Date.now()/1000) + 120 }, process.env.JWT_SECRET);
    const link = process.env.NEXT_PUBLIC_APP_URL + '/api/go?t=' + jwtToken;
    res.send(\`
        <html><body style="background:#0a0f1a;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;">
        <div style="background:#161b22;padding:30px;border-radius:16px;text-align:center;">
        <h2 style="color:#00d4ff;">✅ Link Ready</h2>
        <p style="word-break:break-all;">\${link}</p>
        <a href="/api/go" style="color:#00d4ff;">New</a>
        </div></body></html>
    \`);
};

// REVEAL HANDLER
module.exports.GET = async (req, res) => {
    const { reveal, t } = req.query;
    if (reveal && t) {
        try {
            const d = jwt.verify(t, process.env.JWT_SECRET);
            if (Math.floor(Date.now()/1000) < d.exp - 30) return res.status(403).json({ error: 'Wait' });
            res.json({ url: d.url });
        } catch(e) { res.status(400).json({ error: 'Invalid' }); }
    }
};rder-radius:16px;text-align:center;border:1px solid #30363d;">
        <h2 style="color:#00d4ff;">✅ Link Generated!</h2>
        <p style="word-break:break-all;background:#0d1117;padding:10px;border-radius:8px;">${link}</p>
        <p style="color:#ffd700;">⏳ Valid for 90 seconds (after bypass)</p>
        <a href="/api/go" style="color:#00d4ff;">Generate Another</a>
        </div></body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
      }
