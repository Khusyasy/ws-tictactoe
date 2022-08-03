const jwt = require('jsonwebtoken');

const User = require('../models/User');

async function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const payload = jwt.decode(token);
  if (!payload)
    return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const user = await User.findOne({ username: payload.username }).select(
    '+personalKey'
  );
  if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  try {
    const verified = jwt.verify(token, user.personalKey);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
}

module.exports = auth;
