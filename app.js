const express = require('express');
const path = require('path');
const logger = require('morgan');
const CookieParser = require('cookie-parser');

const app = express();
require('express-ws')(app);

require('./database');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(CookieParser());

const gameRouter = require('./routes/game');
const streamRouter = require('./routes/stream');
const userRouter = require('./routes/user');

const auth = require('./middlewares/auth');

app.use('/api/game', auth, gameRouter);
app.use('/api/stream', streamRouter);
app.use('/api/user', userRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

module.exports = app;
