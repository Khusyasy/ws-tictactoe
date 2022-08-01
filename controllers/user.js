require('dotenv').config();
require('../database');
const User = require('../models/User');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { is_valid } = require('../utils');

async function register(req, res) {
  const { username, password } = req.body;
  if (is_valid(username) && is_valid(password)) {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ ok: false, error: 'Username is already taken' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();

      const token = jwt.sign({ username }, process.env.TOKEN_SECRET, {
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
    const user = await User.findOne({ username });
    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = jwt.sign({ username }, process.env.TOKEN_SECRET, {
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

module.exports = {
  register,
  login,
};
