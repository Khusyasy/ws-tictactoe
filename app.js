var express = require('express');
var path = require('path');
var logger = require('morgan');
var CookieParser = require('cookie-parser');

var app = express();
var expressWs = require('express-ws')(app);

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
app.use('/api/stream', auth, streamRouter);
app.use('/api/user', userRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

module.exports = app;
