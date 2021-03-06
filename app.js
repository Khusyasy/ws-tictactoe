var express = require('express');
var path = require('path');
var logger = require('morgan');

var app = express();
var expressWs = require('express-ws')(app);

var { customAlphabet } = require('nanoid');
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var nanoid = customAlphabet(alphabet, 6);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

let USERS = [];
let ROOMS = [];

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
      turn: '',
      winner: '',
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
    }
  }
}

const is_valid = x => x !== '' && x !== undefined && x !== null;

app.post('/api/game/new', (req, res) => {
  const { username } = req.body;
  if (!is_valid(username)) {
    return res.json({ ok: false, error: 'Username is required' });
  }
  if (USERS.find(user => user.username === username)) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const room = nanoid();
  const user = new User(username.toLowerCase(), room.toUpperCase());
  USERS.push(user);
  const room_obj = new Room(room);
  room_obj.users.push(user);
  ROOMS.push(room_obj);

  res.json({ ok: true, user });
});

app.post('/api/game/join', (req, res) => {
  const { user } = req.body;
  if (!is_valid(user)) {
    return res.json({ ok: false, error: 'User is required' });
  }

  user.username = user.username?.toLowerCase();
  user.room = user.room?.toUpperCase();
  if (USERS.find(u => u.username === user.username)) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const user_obj = new User(user.username, user.room);
  const room_obj = ROOMS.find(room => room.id === user_obj.room);

  if (!room_obj) {
    return res.json({ ok: false, error: 'Room not found' });
  }

  if (room_obj.users.length >= 2) {
    return res.json({ ok: false, error: 'Room is full' });
  }

  USERS.push(user_obj);
  room_obj.users.push(user_obj);
  res.json({ ok: true, user: user_obj });
});

const write_ws = (type, data) => JSON.stringify({ type, data });

app.ws('/api/stream', function (ws, req) {
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
      ws.send(write_ws('room', room_obj));
      if (room_obj.users.length == 2 && room_obj.users.every(u => u.ready)) {
        if (room_obj.state.status == 'waiting') {
          room_obj.state.status = 'playing';
          room_obj.state.turn = room_obj.users[0].username;
        }
        room_obj.users.forEach(function (user) {
          user.ws.send(write_ws('state', room_obj.state));
          user.ws.send(write_ws('info', `Game Started!`));
        });
      }
    } else if (type == 'move') {
      const { x, y } = data;
      const { board, turn } = room_obj.state;
      if (turn != user_obj.username) {
        ws.send(write_ws('info', 'Not your turn'));
        return;
      }
      if (board[x][y] !== '') {
        ws.send(write_ws('info', 'Invalid move'));
        return;
      }

      const is_player_one = turn == room_obj.users[0].username;

      board[x][y] = is_player_one ? 'x' : 'o';
      room_obj.state.turn = is_player_one ? room_obj.users[1].username : room_obj.users[0].username;

      // check win
      const check = checkWin(board);
      let win = null;
      let draw = false;
      if (check == 'x') {
        win = room_obj.users[0];
      } else if (check == 'o') {
        win = room_obj.users[1];
      }else if (check == 'draw') {
        draw = true;
      }

      if (win) {
        room_obj.state.status = 'win';
        room_obj.state.winner = win.username;
        room_obj.state.turn = '';
      }
      if (draw) {
        room_obj.state.status = 'draw';
        room_obj.state.turn = '';
      }

      room_obj.users.forEach(function (user) {
        user.ws.send(write_ws('state', room_obj.state));
        if (room_obj.state.status == 'win') {
          user.ws.send(write_ws('info', `${room_obj.state.winner} Wins`));
        }
        if (room_obj.state.status == 'draw') {
          user.ws.send(write_ws('info', `Game Draw`));
        }
      });

      // cleanup
      if (win || draw) {
        room_obj.users.forEach(function (user) {
          USERS = USERS.filter(u => u.username !== user.username);
        });
        ROOMS = ROOMS.filter(r => r.id !== room_obj.id);
        ws.close();
      }
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

  const wins = [];

  for (let i = 0; i < TICTACTOE_WIN.length; i++) {
    const [a, b, c] = TICTACTOE_WIN[i];
    if (
      board[a.x][a.y] !== '' &&
      board[a.x][a.y] == board[b.x][b.y] &&
      board[a.x][a.y] == board[c.x][c.y]
    ) {
      wins.push(board[a.x][a.y]);
    }
  }

  if (wins.length == 0 && board.every(row => row.every(cell => cell !== ''))) {
    return 'draw';
  }

  if (wins.length == 0) {
    return false;
  }

  if (wins.length == 1) {
    return wins[0];
  }

  return 'draw';
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

module.exports = app;
