const jwt = require('jsonwebtoken');

async function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ ok: false, error: 'Invalid token' });
  }
}

module.exports = auth;
