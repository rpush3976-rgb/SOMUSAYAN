const jwt = require('jsonwebtoken');

// ---------- NEW KEYS (Updated) ----------
const SITE_KEY = '0x4AAAAAAEZyPDXp4YBdTb_W';
const SECRET_KEY = '0x4AAAAAAEZyPFrVDaHt4I11';
const JWT_SECRET = 'Somu@2026#StrongKey';
const APP_URL = 'https://somusayan.vercel.app';

// ---------- HELPER: POST body parse ----------
function parseBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const obj = {};
            for (const [key, val] of params) obj[key] = val;
            resolve(obj);
        });
    });
}

// ---------- MAIN HANDLER ----------
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const { t, reveal } = req.query;

        // ========== GET ==========
        if (req.method === 'GET') {
            if (reveal && t) {
                try {
                    const decoded = jwt.verify(t, JWT_SECRET);
                    const now = Math.floor(Date.now() / 1000);
                    if (now < decoded.exp - 30) {
                        return res.status(403).json({ error: '⏳ Wait...' });
                    }
                    return res.status(200).json({ url: decoded.url });
                } catch (e) {
                    return res.status(400).json({ error: 'Invalid' });
                }
            }

            if (!t) {
                return res.send(`<!DOCTYPE html>
                <html>
                <head><title>Somusayan</title>
                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
                <style>
                    body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:sans-serif; color:#fff; }
                    .box { background:#161b22; padding:40px; border-radius:16px; text-align:center; max-width:400px; width:90%; }
                    input, button { width:100%; padding:12px; margin:8px 0; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:#fff; }
                    button { background:#00d4ff; color:#000; font-weight:bold; border:none; }
                </style>
                </head>
                <body>
                <div class="box">
                    <h2>🛡️ Somusayan</h2>
                    <form method="POST" action="/api/go">
                        <input type="url" name="url" placeholder="https://example.com" required />
                        <div class="cf-turnstile" data-sitekey="${SITE_KEY}"></div>
                        <button type="submit">Generate</button>
                    </form>
                </div>
                </body>
                </html>`);
            }

            try {
                const decoded = jwt.verify(t, JWT_SECRET);
                if (Date.now() > decoded.exp * 1000) return res.send('<h1>Expired</h1>');
                return res.send(`<!DOCTYPE html>
                <html>
                <head><title>Bypass</title>
                <style>
                    body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:monospace; color:#00ff88; }
                    .box { background:#161b22; padding:30px; border-radius:16px; text-align:center; max-width:400px; }
                    .spin { width:40px; height:40px; border:4px solid #00ff8844; border-top:4px solid #00ff88; border-radius:50%; animation:spin 1s infinite; margin:auto; }
                    @keyframes spin { 100% { transform:rotate(360deg); } }
                    .pbar { width:100%; height:4px; background:#333; margin:15px 0; }
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
                    const steps = ["Decrypting", "Bypass FW", "Spoofing", "Tunnel up", "✅ Done"];
                    let sec = 90, idx = 0;
                    const status = document.getElementById('status');
                    const pfill = document.getElementById('pfill');
                    const log = document.getElementById('log');
                    const interval = setInterval(() => {
                        sec--;
                        pfill.style.width = ((90 - sec) / 90) * 100 + '%';
                        if (sec % 15 === 0 && idx < steps.length) {
                            status.innerText = "⏳ " + steps[idx];
                            log.innerHTML += "<div>> " + steps[idx] + "</div>";
                            idx++;
                        }
                        if (sec <= 0) {
                            clearInterval(interval);
                            status.innerText = "✅ Redirecting...";
                            fetch('/api/go?reveal=true&t=' + token)
                                .then(r => r.json())
                                .then(d => { if(d.url) location.href = d.url; });
                        }
                    }, 1000);
                </script>
                </body></html>`);
            } catch (e) { return res.status(400).send('Invalid'); }
        }

        // ========== POST ==========
        else if (req.method === 'POST') {
            const form = await parseBody(req);
            const url = form.url;
            const turnstileToken = form['cf-turnstile-response'];

            if (!turnstileToken) return res.status(400).send('Turnstile missing');

            const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret: SECRET_KEY, response: turnstileToken })
            });
            const data = await verify.json();
            if (!data.success) return res.status(400).send('Turnstile fail');

            const token = jwt.sign({ url, exp: Math.floor(Date.now()/1000) + 120 }, JWT_SECRET);
            const link = APP_URL + '/api/go?t=' + token;

            return res.send(`<!DOCTYPE html>
            <html>
            <head><title>Link</title>
            <style>
                body { background:#0a0f1a; color:#fff; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; }
                .box { background:#161b22; padding:30px; border-radius:16px; text-align:center; max-width:400px; }
            </style>
            </head>
            <body>
            <div class="box">
                <h2 style="color:#00d4ff;">✅ Link Ready</h2>
                <p style="word-break:break-all;">${link}</p>
                <a href="/api/go" style="color:#00d4ff;">New</a>
            </div>
            </body></html>`);
        }

        else res.status(405).send('Method not allowed');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error: ' + err.message);
    }
};
