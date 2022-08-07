require('../database');
const User = require('../models/User');

var { customAlphabet } = require('nanoid');
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var nanoid = customAlphabet(alphabet, 6);

const { is_valid, write_ws, checkWin } = require('../utils');

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

let ROOMS = {};

async function newGame(req, res) {
  const user = req.user;

  let room_id = nanoid();
  while (ROOMS[room_id]) {
    room_id = nanoid();
  }

  const room_obj = new Room(room_id);
  room_obj.users.push(user);
  ROOMS[room_id] = room_obj;

  res.json({ ok: true, room_id });
}

async function joinGame(req, res) {
  const user = req.user;
  const { room_id } = req.body;

  const room_obj = ROOMS[room_id];
  if (!room_obj) {
    return res.json({ ok: false, error: 'Room not found' });
  }

  const already_joined = room_obj.users.some(
    (u) => u.username == user.username
  );
  if (already_joined) {
    return res.json({ ok: true });
  }

  if (room_obj.users.length >= 2) {
    return res.json({ ok: false, error: 'Room is full' });
  }

  room_obj.users.push(user);
  res.json({ ok: true });
}

const connections = {};

function stream(ws, req) {
  ws.on('message', async function (msg) {
    if (!is_valid(msg)) {
      ws.send(write_ws('error', 'Message is not valid'));
      return;
    }

    const { type, data } = JSON.parse(msg);
    const { user, room_id } = data;

    const room_obj = ROOMS[room_id];
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
          if (win) {
            if (u.username === win.username) {
              await User.updateOne(
                { username: u.username },
                { $inc: { games: 1, win: 1 } }
              );
            } else {
              await User.updateOne(
                { username: u.username },
                { $inc: { games: 1, lose: 1 } }
              );
            }
          } else {
            await User.updateOne(
              { username: u.username },
              { $inc: { games: 1, draw: 1 } }
            );
          }
          delete connections[u.username];
        }
        delete ROOMS[room_obj.id];
        ws.close();
      }
    }
  });
}

module.exports = {
  newGame,
  joinGame,
  stream,
};
