var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var expressWs = require('express-ws')(app);

var { customAlphabet } = require('nanoid');
var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
var nanoid = customAlphabet(alphabet, 5);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use('/', indexRouter);
app.use('/users', usersRouter);

const USERS = {};
const ROOMS = {};

app.post('/game', function (req, res) {
  const { username, room, type } = req.body;
  if (type == 'new') {
    const room = nanoid();
    USERS[username] = { room };
    ROOMS[room] = {
      users: [username],
      state: {},
    };
    res.cookie('username', username);
    res.cookie('room', room);
    res.redirect('/play');
  } else if (type == 'join') {
    if (!ROOMS[room]) {
      return res.redirect('/');
    }

    if (ROOMS[room].users.includes(username)) {
      return res.redirect('/play');
    } else {
      ROOMS[room].users.push(username);
      USERS[username] = { room };
      res.cookie('username', username);
      res.cookie('room', room);
      return res.redirect('/play');
    }
  }
  console.log(USERS, ROOMS);
});

app.get('/play', function (req, res) {
  res.render('play');
});

app.ws('/play/stream', function (ws, req) {
  console.log(ws, req);
});

module.exports = app;
