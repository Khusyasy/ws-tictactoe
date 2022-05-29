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

const USERS = [];
const ROOMS = [];

class User {
  constructor(username, room = null) {
    this.username = username;
    this.room = room;
    this.ready = false;
    this.ws = null;
  }
}

class Room {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.state = {
      status: 'waiting',
      turn: null,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ],
    }
  }
}

const is_valid = x => x !== '' && x !== undefined && x !== null;

app.post('/game/new', (req, res) => {
  const { username } = req.body;
  if (!is_valid(username)) {
    return res.json({ ok: false, error: 'Username is required' });
  }
  if (USERS.find(user => user.username === username)) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const room = nanoid();
  const user = new User(username, room);
  USERS.push(user);
  const room_obj = new Room(room);
  room_obj.users.push(user);
  ROOMS.push(room_obj);

  res.json({ ok: true, user });
});

app.post('/game/join', (req, res) => {
  const { user } = req.body;
  if (!is_valid(user)) {
    return res.json({ ok: false, error: 'User is required' });
  }
  if (USERS.find(u => u.username === user.username)) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const user_obj = new User(user.username, user.room);
  const room_obj = ROOMS.find(room => user_obj.room === room.id); 

  if (!room_obj) {
    return res.json({ ok: false, error: 'Room not found' });
  }

  if (room_obj.users.length >= 2) {
    return res.json({ ok: false, error: 'Room is full' });
  } else {
    USERS.push(user_obj);
    room_obj.users.push(user_obj);
    res.json({ ok: true, user: user_obj });
  }
});

const write_ws = (type, data) => JSON.stringify({ type, data });

app.ws('/stream', function (ws, req) {
  ws.on('message', function (msg) {
    if (!is_valid(msg)) {
      ws.send(write_ws('error', 'Message is not valid'));
      return;
    }

    const { type, data } = JSON.parse(msg);
    const { user } = data;
    if (!is_valid(user)) {
      ws.send(write_ws('error', 'User is required'));
      return ws.close();
    }

    const user_obj = USERS.find(u => u.username === user.username);
    if (!is_valid(user_obj)) {
      ws.send(write_ws('error', 'User not found'));
      return ws.close();
    }

    const room_obj = ROOMS.find(room => room.id === user_obj.room);
    if (!is_valid(room_obj)) {
      ws.send(write_ws('error', 'Room not found'));
      return ws.close();
    }

    if (type == 'join') {
      user_obj.ready = true;
      user_obj.ws = ws;
      if (room_obj.users.length == 2 && room_obj.users.every(u => u.ready)) {
        if (room_obj.state.status == 'waiting') {
          room_obj.state.status = 'playing';
          room_obj.state.turn = room_obj.users[0].username;
        }
        room_obj.users.forEach(function (user) {
          user.ws.send(write_ws('state', room_obj.state));
        });
      }
    } else if (type == 'move') {
      const { x, y } = data;
      const { board, turn } = room_obj.state;
      if (turn != user_obj.username) {
        ws.send(write_ws('info', 'Not your turn'));
        return;
      }
      if (board[x][y] !== null) {
        ws.send(write_ws('info', 'Invalid move'));
        return;
      }

      const is_player_one = turn == room_obj.users[0].username;

      board[x][y] = is_player_one ? 'x' : 'o';
      room_obj.state.turn = is_player_one ? room_obj.users[1].username : room_obj.users[0].username;

      // check win
      let win = checkWin(board);
      if (win == 'x') {
        win = room_obj.users[0];
      } else if (win == 'o') {
        win = room_obj.users[1];
      }

      if (win) {
        room_obj.state.status = 'win';
        room_obj.state.winner = win;
        room_obj.state.turn = null;
      }

      room_obj.users.forEach(function (user) {
        user.ws.send(write_ws('state', room_obj.state));
      });
    }
  });
});

function checkWin(board) {
  const TICTACTOE_WIN = [
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ],
  ];

  for (let i = 0; i < TICTACTOE_WIN.length; i++) {
    const [a, b, c] = TICTACTOE_WIN[i];
    if (
      board[a.x][a.y] !== null &&
      board[a.x][a.y] == board[b.x][b.y] &&
      board[a.x][a.y] == board[c.x][c.y]
    ) {
      return board[a.x][a.y];
    }
  }
}

module.exports = app;
