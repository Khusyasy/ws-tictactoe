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
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
