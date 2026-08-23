const jwt = require('jsonwebtoken');

export default function handler(req, res) {
    const { t } = req.query;
    if (!t) return res.status(400).json({ error: 'Token missing' });

    try {
        const decoded = jwt.verify(t, process.env.JWT_SECRET);
        const now = Math.floor(Date.now() / 1000);

        // 🔥 Check: Agar 90 sec complete nahi hue toh "Too Early" error do
        // (Kyunki humne 120 sec diya hai, isliye -30 karke 90 sec check kar rahe)
        if (now < decoded.exp - 30) {
            return res.status(403).json({ 
                error: '⏳ Bypass loop still running... Wait!',
                remaining: (decoded.exp - 30) - now 
            });
        }

        // ✅ 90 sec ho gaye, final URL bhejo
        return res.status(200).json({ url: decoded.url });

    } catch (e) {
        return res.status(400).json({ error: 'Invalid token' });
    }
}
