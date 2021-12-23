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
      users: { [username]: false },
      state: {
        status: 'waiting',
      },
    };
    res.cookie('username', username);
    res.cookie('room', room);
    res.redirect('/play');
  } else if (type == 'join') {
    const find_room = ROOMS[room];
    if (!find_room) {
      return res.redirect('/');
    }

    if (Object.keys(find_room.users).length >= 2) {
      return res.redirect('/');
    } else if (Object.keys(find_room.users).includes(username)) {
      return res.redirect('/play');
    } else {
      find_room.users[username] = false;
      USERS[username] = { room };
      res.cookie('username', username);
      res.cookie('room', room);
      return res.redirect('/play');
    }
  }
});

app.get('/play', function (req, res) {
  res.render('play');
});

app.ws('/stream', function (ws, req) {
  const { username, room } = req.cookies;
  if (!username || !room) {
    ws.close();
    return;
  }
  const find_room = ROOMS[room];
  if (!find_room) {
    return ws.close();
  }

  ws.on('message', function (data) {
    data = JSON.parse(data);

    if (data.type == 'join') {
      find_room.users[username] = ws;
      if (
        Object.values(find_room.users).length == 2 &&
        Object.values(find_room.users).every(Boolean)
      ) {
        if (find_room.state.status == 'waiting') {
          find_room.state = {
            status: 'playing',
            board: [
              [-1, -1, -1],
              [-1, -1, -1],
              [-1, -1, -1],
            ],
            turn: Object.keys(find_room.users)[0],
          };
        }
        Object.values(find_room.users).forEach(function (ws) {
          ws.send(
            JSON.stringify({
              type: 'game',
              state: find_room.state,
            })
          );
        });
      }
    } else if (data.type == 'move') {
      const { x, y } = data;
      const { board, turn } = find_room.state;
      if (board[x][y] != -1) {
        return;
      }

      board[x][y] = turn == Object.keys(find_room.users)[0] ? 'x' : 'o';
      find_room.state.turn =
        turn == Object.keys(find_room.users)[0]
          ? Object.keys(find_room.users)[1]
          : Object.keys(find_room.users)[0];

      // check win
      let win = checkWin(board);
      if (win == 'x') {
        win = Object.keys(find_room.users)[0];
      } else if (win == 'o') {
        win = Object.keys(find_room.users)[1];
      }

      if (win) {
        find_room.state.status = 'win';
        find_room.state.winner = win;
        find_room.state.turn = -1;
      }

      Object.values(find_room.users).forEach(function (ws) {
        ws.send(
          JSON.stringify({
            type: 'game',
            state: find_room.state,
          })
        );
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
      board[a.x][a.y] !== -1 &&
      board[a.x][a.y] == board[b.x][b.y] &&
      board[a.x][a.y] == board[c.x][c.y]
    ) {
      return board[a.x][a.y];
    }
  }
}

module.exports = app;
