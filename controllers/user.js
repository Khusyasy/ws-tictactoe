require('dotenv').config();
require('../database');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { is_valid } = require('../utils');

const SALT_ROUNDS = 10;

function generatePersonalKey() {
  return bcrypt.genSaltSync(SALT_ROUNDS);
}

async function register(req, res) {
  const { username, password } = req.body;
  if (is_valid(username) && is_valid(password)) {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ ok: false, error: 'Username is already taken' });
    } else {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const newUser = new User({
        username,
        password: hashedPassword,
        personalKey: generatePersonalKey(),
      });
      await newUser.save();

      const token = jwt.sign({ username }, newUser.personalKey, {
        expiresIn: '1h',
      });

      res.cookie('token', token, { httpOnly: true });
      return res.status(201).json({ ok: true });
    }
  }

  return res.json({ ok: false, error: 'Username and password are required' });
}

async function login(req, res) {
  const { username, password } = req.body;
  if (is_valid(username) && is_valid(password)) {
    const user = await User.findOne({ username })
      .select('+password')
      .select('+personalKey');
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign({ username }, user.personalKey, {
          expiresIn: '1h',
        });

        res.cookie('token', token, { httpOnly: true });
        return res.json({ ok: true });
      }
    }

    return res.json({ ok: false, error: 'Username or password is incorrect' });
  }

  return res.json({ ok: false, error: 'Invalid username or password' });
}

async function logout(req, res) {
  const user = await User.findOne({ username: req.user.username });

  user.personalKey = generatePersonalKey();
  await user.save();

  res.clearCookie('token');
  return res.json({ ok: true });
}

async function check(req, res) {
  const user = await User.findOne({ username: req.user.username });

  if (user) {
    return res.json({ ok: true, user });
  } else {
    return res.json({ ok: false });
  }
}

module.exports = {
  register,
  login,
  logout,
  check,
};
