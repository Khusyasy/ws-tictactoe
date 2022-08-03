const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  room: {
    type: String,
    default: null,
  },
  personalKey: {
    type: String,
    required: true,
    select: false,
  },
  games: {
    type: Number,
    default: 0,
  },
  win: {
    type: Number,
    default: 0,
  },
  lose: {
    type: Number,
    default: 0,
  },
  draw: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
