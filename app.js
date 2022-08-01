var express = require('express');
var path = require('path');
var logger = require('morgan');

var app = express();
var expressWs = require('express-ws')(app);

require('./database');

var { customAlphabet } = require('nanoid');
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var nanoid = customAlphabet(alphabet, 6);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'client', 'dist')));

const User = require('./models/User');

let ROOMS = [];

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
        ['', '', ''],
      ],
    };
  }
}

const is_valid = (x) => x !== '' && x !== undefined && x !== null;

app.post('/api/game/new', async (req, res) => {
  const { username } = req.body;
  if (!is_valid(username)) {
    return res.json({ ok: false, error: 'Username is required' });
  }
  const check = await User.findOne({ username });
  if (check) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const room = nanoid();
  const user = new User({
    username: username.toLowerCase(),
    room: room.toUpperCase(),
  });
  await user.save();

  const room_obj = new Room(room);
  room_obj.users.push(user);
  ROOMS.push(room_obj);

  res.json({ ok: true, user });
});

app.post('/api/game/join', async (req, res) => {
  const { user: user_input } = req.body;
  if (!is_valid(user_input)) {
    return res.json({ ok: false, error: 'User is required' });
  }

  user_input.username = user_input.username?.toLowerCase();
  user_input.room = user_input.room?.toUpperCase();

  const check = await User.findOne({ username: user_input.username });
  if (check) {
    return res.json({ ok: false, error: 'Username is already taken' });
  }

  const user = new User({
    username: user_input.username,
    room: user_input.room,
  });
  const room_obj = ROOMS.find((room) => room.id === user.room);

  if (!room_obj) {
    return res.json({ ok: false, error: 'Room not found' });
  }

  if (room_obj.users.length >= 2) {
    return res.json({ ok: false, error: 'Room is full' });
  }

  await user.save();
  room_obj.users.push(user);
  res.json({ ok: true, user: user });
});

const connections = {};

const write_ws = (type, data) => JSON.stringify({ type, data });

app.ws('/api/stream', function (ws, req) {
  ws.on('message', async function (msg) {
    if (!is_valid(msg)) {
      ws.send(write_ws('error', 'Message is not valid'));
      return;
    }

    const { type, data } = JSON.parse(msg);
    const { user: user_input } = data;
    if (!is_valid(user_input)) {
      ws.send(write_ws('error', 'User is required'));
      return ws.close();
    }

    const user = await User.findOne({ username: user_input.username });
    if (!is_valid(user)) {
      ws.send(write_ws('error', 'User not found'));
      return ws.close();
    }

    const room_obj = ROOMS.find((room) => room.id === user.room);
    if (!is_valid(room_obj)) {
      ws.send(write_ws('error', 'Room not found'));
      return ws.close();
    }

    if (type == 'join') {
      connections[user.username] = ws;

      ws.send(write_ws('room', room_obj));
      if (
        room_obj.users.length == 2 &&
        room_obj.users.every((u) => connections[u.username])
      ) {
        if (room_obj.state.status == 'waiting') {
          room_obj.state.status = 'playing';
          room_obj.state.turn = room_obj.users[0].username;
        }
        room_obj.users.forEach(function (user) {
          const userWS = connections[user.username];
          userWS.send(write_ws('state', room_obj.state));
          userWS.send(write_ws('info', `Game Started!`));
        });
      }
    } else if (type == 'move') {
      const { x, y } = data;
      const { board, turn } = room_obj.state;
      if (turn != user.username) {
        ws.send(write_ws('info', 'Not your turn'));
        return;
      }
      if (board[x][y] !== '') {
        ws.send(write_ws('info', 'Invalid move'));
        return;
      }

      const is_player_one = turn == room_obj.users[0].username;

      board[x][y] = is_player_one ? 'x' : 'o';
      room_obj.state.turn = is_player_one
        ? room_obj.users[1].username
        : room_obj.users[0].username;

      // check win
      const check = checkWin(board);
      let win = null;
      let draw = false;
      if (check == 'x') {
        win = room_obj.users[0];
      } else if (check == 'o') {
        win = room_obj.users[1];
      } else if (check == 'draw') {
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
        const userWS = connections[user.username];
        userWS.send(write_ws('state', room_obj.state));
        if (room_obj.state.status == 'win') {
          userWS.send(write_ws('info', `${room_obj.state.winner} Wins`));
        }
        if (room_obj.state.status == 'draw') {
          userWS.send(write_ws('info', `Game Draw`));
        }
      });

      // cleanup
      if (win || draw) {
        for (u of room_obj.users) {
          await User.deleteOne({ username: u.username });
          delete connections[u.username];
        }
        ROOMS = ROOMS.filter((r) => r.id !== room_obj.id);
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
