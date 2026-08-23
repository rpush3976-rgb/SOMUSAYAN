const jwt = require('jsonwebtoken');

export default function handler(req, res) {
    const { t, 'cf-turnstile-response': turnstileToken } = req.query;

    // --- AGAR TOKEN NAHI HAI TOH FORM DIKHAO (Turnstile ke saath) ---
    if (!t) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Somusayan Protect</title>
                <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
                <style>
                    body { display: flex; justify-content: center; align-items: center; height: 100vh; 
                           font-family: sans-serif; background: #0a0f1a; color: white; flex-direction: column; }
                    .brand { color: #00d4ff; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
                    .container { background: #161b22; padding: 40px; border-radius: 16px; text-align: center; 
                                 border: 1px solid #30363d; max-width: 400px; }
                    input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 8px; border: 1px solid #30363d;
                                     background: #0d1117; color: white; font-size: 16px; box-sizing: border-box; }
                    button { background: #00d4ff; color: #0a0f1a; font-weight: bold; cursor: pointer; border: none; }
                    .turnstile-wrapper { display: flex; justify-content: center; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="brand">🛡️ Somusayan Protect</div>
                <div class="container">
                    <h2>🔗 Generate Secure Link</h2>
                    <form method="POST" action="/api/go">
                        <input type="url" name="url" placeholder="https://example.com" required />
                        <div class="turnstile-wrapper">
                            <div class="cf-turnstile" data-sitekey="${process.env.TURNSTILE_SITE_KEY}"></div>
                        </div>
                        <button type="submit">Generate</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    }

    // --- AGAR TOKEN HAI TOH VERIFY KARO (Instantly page open hoga) ---
    try {
        const decoded = jwt.verify(t, process.env.JWT_SECRET);
        
        if (Date.now() > decoded.exp * 1000) {
            return res.send('<h1>⏰ Link Expired</h1><p>Generate new one.</p>');
        }

        // 🔥 YAHI SE PAGE INSTANTLY OPEN HOGA (Bypass loop wala)
        return res.send(getBypassPage(t, decoded.url)); 

    } catch (error) {
        return res.status(400).send('Invalid Token');
    }
}

// --- 🔥 BYPASS LOOP WALA HTML (Timer hidden, sirf hacker wala feel) ---
function getBypassPage(token, finalUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Somusayan - Bypassing...</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: 'Courier New', monospace;
                background: #0a0f1a;
                color: #00ff88;
                flex-direction: column;
            }
            .container {
                text-align: center;
                background: #161b22;
                padding: 50px 60px;
                border-radius: 16px;
                border: 1px solid #00ff8844;
                box-shadow: 0 0 50px #00ff8822;
                max-width: 550px;
                width: 90%;
            }
            .brand { font-size: 22px; color: #00d4ff; margin-bottom: 20px; letter-spacing: 2px; }
            .spinner {
                width: 60px; height: 60px;
                border: 4px solid #00ff8844;
                border-top: 4px solid #00ff88;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 20px auto;
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .status-text {
                font-size: 18px;
                color: #8b949e;
                margin: 20px 0 10px;
                min-height: 30px;
            }
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #30363d;
                border-radius: 2px;
                margin-top: 20px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                width: 0%;
                background: #00ff88;
                transition: width 0.3s;
                border-radius: 2px;
            }
            .fake-logs {
                font-size: 12px;
                color: #58a6ff;
                margin-top: 20px;
                text-align: left;
                background: #0d1117;
                padding: 12px;
                border-radius: 8px;
                max-height: 110px;
                overflow-y: auto;
                font-family: monospace;
                border: 1px solid #30363d;
            }
            .fake-logs div { opacity: 0.8; animation: fadeIn 0.4s; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 0.8; } }
            .footer { margin-top: 25px; font-size: 11px; color: #30363d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="brand">🛡️ Somusayan Protect</div>
            <div class="spinner"></div>
            <div class="status-text" id="statusMsg">⏳ Initializing bypass engine...</div>
            <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
            <div class="fake-logs" id="logContainer">
                <div>> Kernel module loaded</div>
                <div>> Secure channel established</div>
            </div>
            <div class="footer">🔒 Bypass loop active • Do not close</div>
        </div>

        <script>
            const token = "${token}";
            let seconds = 90;
            const statusMsg = document.getElementById('statusMsg');
            const progressFill = document.getElementById('progressFill');
            const logContainer = document.getElementById('logContainer');

            const fakeSteps = [
                "Decrypting AES-256 payload...",
                "Spoofing TLS fingerprint...",
                "Bypassing Cloudflare rules...",
                "Injecting session cookie...",
                "Establishing reverse tunnel...",
                "Cracking rate-limiter...",
                "Finalizing handshake...",
                "✅ Access granted! Redirecting..."
            ];

            let stepIndex = 0;

            setTimeout(() => {
                const div = document.createElement('div');
                div.innerText = "> " + fakeSteps[0];
                logContainer.appendChild(div);
                logContainer.scrollTop = logContainer.scrollHeight;
                statusMsg.innerText = "⏳ " + fakeSteps[0];
                stepIndex++;
            }, 1000);

            const interval = setInterval(() => {
                seconds--;
                const progress = ((90 - seconds) / 90) * 100;
                progressFill.style.width = progress + '%';

                if (seconds % 10 === 0 && stepIndex < fakeSteps.length) {
                    const msg = fakeSteps[stepIndex];
                    statusMsg.innerText = "⏳ " + msg;
                    const div = document.createElement('div');
                    div.innerText = "> " + msg;
                    logContainer.appendChild(div);
                    logContainer.scrollTop = logContainer.scrollHeight;
                    stepIndex++;
                }

                if (seconds <= 0) {
                    clearInterval(interval);
                    statusMsg.innerText = '✅ Access granted! Redirecting...';
                    progressFill.style.width = '100%';
                    
                    fetch('/api/reveal?t=' + token)
                        .then(res => res.json())
                        .then(data => {
                            if (data.url) {
                                window.location.href = data.url;
                            } else {
                                statusMsg.innerText = '❌ ' + (data.error || 'Redirect failed');
                            }
                        })
                        .catch(() => {
                            statusMsg.innerText = '❌ Network error. Refresh kar lo.';
                        });
                }
            }, 1000);
        </script>
    </body>
    </html>
    `;
}

// --- POST: LINK GENERATE KAREGA (Jab form submit ho) ---
export async function POST(req) {
    const formData = await req.formData();
    const url = formData.get('url');
    const turnstileToken = formData.get('cf-turnstile-response');

    // Turnstile verify
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken,
        }),
    });
    const data = await verify.json();
    if (!data.success) return new Response('❌ Turnstile failed', { status: 400 });

    // JWT generate (120 sec expiry - 90 sec wait + 30 sec buffer)
    const token = jwt.sign(
        { url: url, exp: Math.floor(Date.now() / 1000) + 120 },
        process.env.JWT_SECRET
    );
    const link = process.env.NEXT_PUBLIC_APP_URL + '/api/go?t=' + token;

    return new Response(`
        <html><body style="background:#0a0f1a;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;">
        <div style="background:#161b22;padding:40px;border-radius:16px;text-align:center;border:1px solid #30363d;">
        <h2 style="color:#00d4ff;">✅ Link Generated!</h2>
        <p style="word-break:break-all;background:#0d1117;padding:10px;border-radius:8px;">${link}</p>
        <p style="color:#ffd700;">⏳ Valid for 90 seconds (after bypass)</p>
        <a href="/api/go" style="color:#00d4ff;">Generate Another</a>
        </div></body></html>
    `, { headers: { 'Content-Type': 'text/html' } });
      }
