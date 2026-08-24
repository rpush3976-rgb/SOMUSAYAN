const jwt = require('jsonwebtoken');
const querystring = require('querystring');

// 🔥 HARDCODED KEYS
const TURNSTILE_SITE_KEY = '0x4AAAAAAEZYYn1-vYD-WxW';
const TURNSTILE_SECRET_KEY = '0x4AAAAAAEZYYLwth6wkYRnr';
const JWT_SECRET = 'Somu@2026#StrongKey';
const APP_URL = 'https://somusayan.vercel.app';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        const { t, reveal } = req.query;

        // ========== GET ==========
        if (req.method === 'GET') {
            
            // --- REVEAL (90 sec baad URL dega) ---
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

            // --- FORM (Jab token nahi) ---
            if (!t) {
                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Somusayan</title>
                        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
                        <style>
                            * { margin:0; padding:0; box-sizing:border-box; }
                            body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:sans-serif; color:#fff; }
                            .box { background:#161b22; padding:40px; border-radius:16px; text-align:center; max-width:400px; width:90%; }
                            input, button { width:100%; padding:12px; margin:8px 0; border-radius:8px; border:1px solid #30363d; background:#0d1117; color:#fff; font-size:16px; }
                            button { background:#00d4ff; color:#000; font-weight:bold; border:none; cursor:pointer; }
                            button:hover { background:#00b8d4; }
                        </style>
                    </head>
                    <body>
                        <div class="box">
                            <h2>🛡️ Somusayan</h2>
                            <form method="POST" action="/api/go">
                                <input type="url" name="url" placeholder="https://example.com" required />
                                <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}"></div>
                                <button type="submit">Generate</button>
                            </form>
                        </div>
                    </body>
                    </html>
                `);
            }

            // --- BYPASS PAGE (Jab token hai) ---
            try {
                const decoded = jwt.verify(t, JWT_SECRET);
                if (Date.now() > decoded.exp * 1000) {
                    return res.send('<h1>⏰ Expired</h1><p>Generate new one.</p>');
                }

                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Bypassing...</title>
                    <style>
                        * { margin:0; padding:0; box-sizing:border-box; }
                        body { display:flex; justify-content:center; align-items:center; height:100vh; background:#0a0f1a; font-family:monospace; color:#00ff88; }
                        .box { background:#161b22; padding:40px; border-radius:16px; text-align:center; border:1px solid #00ff8844; max-width:400px; width:90%; }
                        .spin { width:50px; height:50px; border:4px solid #00ff8844; border-top:4px solid #00ff88; border-radius:50%; animation:spin 1s infinite; margin:20px auto; }
                        @keyframes spin { 100% { transform:rotate(360deg); } }
                        .status { color:#8b949e; margin:10px 0; }
                        .pbar { width:100%; height:4px; background:#30363d; border-radius:2px; overflow:hidden; }
                        .pfill { height:100%; width:0%; background:#00ff88; transition:width 0.5s; }
                        .log { font-size:12px; color:#58a6ff; text-align:left; background:#0d1117; padding:10px; border-radius:8px; max-height:100px; overflow-y:auto; margin-top:15px; border:1px solid #30363d; }
                    </style>
                    </head>
                    <body>
                    <div class="box">
                        <div class="spin"></div>
                        <div class="status" id="statusMsg">⏳ Initializing bypass...</div>
                        <div class="pbar"><div class="pfill" id="pfill"></div></div>
                        <div class="log" id="logContainer"><div>> Kernel loaded</div></div>
                    </div>
                    <script>
                        const token = "${t}";
                        const steps = ["Decrypting payload", "Bypassing firewall", "Spoofing fingerprint", "Establishing tunnel", "✅ Access granted"];
                        let sec = 90, idx = 0;
                        const statusMsg = document.getElementById('statusMsg');
                        const pfill = document.getElementById('pfill');
                        const logContainer = document.getElementById('logContainer');

                        const interval = setInterval(() => {
                            sec--;
                            pfill.style.width = ((90 - sec) / 90) * 100 + '%';
                            
                            if (sec % 12 === 0 && idx < steps.length) {
                                statusMsg.innerText = "⏳ " + steps[idx];
                                const div = document.createElement('div');
                                div.innerText = "> " + steps[idx];
                                logContainer.appendChild(div);
                                logContainer.scrollTop = logContainer.scrollHeight;
                                idx++;
                            }

                            if (sec <= 0) {
                                clearInterval(interval);
                                statusMsg.innerText = '✅ Redirecting...';
                                pfill.style.width = '100%';
                                fetch('/api/go?reveal=true&t=' + token)
                                    .then(r => r.json())
                                    .then(data => {
                                        if (data.url) window.location.href = data.url;
                                        else statusMsg.innerText = '❌ ' + data.error;
                                    })
                                    .catch(() => statusMsg.innerText = '❌ Network error');
                            }
                        }, 1000);
                    </script>
                    </body>
                    </html>
                `);
            } catch (e) {
                return res.status(400).send('❌ Invalid Token');
            }
        }

        // ========== POST ==========
        else if (req.method === 'POST') {
            // 🔥 MANUALLY PARSE FORM DATA
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', async () => {
                const formData = querystring.parse(body);
                const url = formData.url;
                const turnstileToken = formData['cf-turnstile-response'];

                if (!turnstileToken) {
                    return res.status(400).send('❌ Turnstile required');
                }

                // Turnstile verify
                const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: TURNSTILE_SECRET_KEY,
                        response: turnstileToken
                    })
                });
                const data = await verify.json();

                if (!data.success) {
                    return res.status(400).send('❌ Turnstile failed');
                }

                // Generate JWT (120 sec expiry)
                const token = jwt.sign(
                    { url, exp: Math.floor(Date.now() / 1000) + 120 },
                    JWT_SECRET
                );
                const link = APP_URL + '/api/go?t=' + token;

                return res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Link Generated</title>
                    <style>
                        body { background:#0a0f1a; color:#fff; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; }
                        .box { background:#161b22; padding:30px; border-radius:16px; text-align:center; max-width:400px; width:90%; }
                        .link { word-break:break-all; background:#0d1117; padding:10px; border-radius:8px; border:1px solid #30363d; }
                        .btn { display:inline-block; margin-top:15px; color:#00d4ff; text-decoration:none; }
                    </style>
                    </head>
                    <body>
                    <div class="box">
                        <h2 style="color:#00d4ff;">✅ Link Generated!</h2>
                        <p class="link">${link}</p>
                        <p style="color:#ffd700;">⏳ Valid for 90 seconds</p>
                        <a href="/api/go" class="btn">Generate Another</a>
                    </div>
                    </body>
                    </html>
                `);
            });
        }

        else {
            res.status(405).send('Method not allowed');
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('❌ Server Error: ' + error.message);
    }
};
