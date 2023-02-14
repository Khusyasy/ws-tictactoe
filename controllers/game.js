require('../database');
const User = require('../models/User');

var { customAlphabet } = require('nanoid');
var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var nanoid = customAlphabet(alphabet, 6);

const { is_valid, write_ws, checkWin } = require('../utils');

// const for cell value
const CV = {
  empty: '',
  x: 'x',
  o: 'o',
};

// const for gamemode
const GM = {
  vs: 'vs',
  computer: 'computer',
};
const COMPUTER_NAME = 'Computer';

class Room {
  constructor(id, gamemode) {
    this.id = id;
    this.gamemode = gamemode;
    this.users = [];
    this.state = {
      status: 'waiting',
      turn: '',
      winner: '',
      board: [
        [CV.empty, CV.empty, CV.empty],
        [CV.empty, CV.empty, CV.empty],
        [CV.empty, CV.empty, CV.empty],
      ],
    };
  }
}

let ROOMS = {};

async function newGame(req, res) {
  const user = req.user;
  const { gamemode } = req.body;

  let room_id = nanoid();
  while (ROOMS[room_id]) {
    room_id = nanoid();
  }

  const room_obj = new Room(room_id, gamemode);
  room_obj.users.push(user);
  ROOMS[room_id] = room_obj;

  if (gamemode == GM.computer) {
    room_obj.users.push({
      username: COMPUTER_NAME,
    });
    room_obj.state.status = 'playing';
    room_obj.state.turn = room_obj.users[0].username;
  }

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
      return ws.close();
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
      if (board[x][y] !== CV.empty) {
        ws.send(write_ws('info', 'Invalid move'));
        return;
      }

      const is_player_one = turn == room_obj.users[0].username;

      board[x][y] = is_player_one ? CV.x : CV.o;
      room_obj.state.turn = is_player_one
        ? room_obj.users[1].username
        : room_obj.users[0].username;

      // check win
      const check = checkWin(board);
      let win = null;
      let draw = false;
      if (check == CV.x) {
        win = room_obj.users[0];
      } else if (check == CV.o) {
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

      if (room_obj.gamemode == GM.vs) {
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
            connections[u.username].close();
            delete connections[u.username];
          }
          delete ROOMS[room_obj.id];
        }
      } else if (room_obj.gamemode === GM.computer) {
        const userWS = connections[room_obj.users[0].username];
        userWS.send(write_ws('state', room_obj.state));
        if (room_obj.state.status == 'win') {
          userWS.send(write_ws('info', `${room_obj.state.winner} Wins`));
        }
        if (room_obj.state.status == 'draw') {
          userWS.send(write_ws('info', `Game Draw`));
        }

        if (!win && !draw) 
        {
          computerHandle(room_obj);
        }
      }
    }
  });
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWin(board);
  if (winner) {
    if (winner == CV.x) {
      return 10 - depth;
    } else if (winner == CV.o) {
      return -10 + depth;
    } else {
      return 0;
    }
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == CV.empty) {
          board[i][j] = CV.x;
          const score = minimax(board, depth + 1, false);
          board[i][j] = CV.empty;
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] == CV.empty) {
          board[i][j] = CV.o;
          const score = minimax(board, depth + 1, true);
          board[i][j] = CV.empty;
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
}

function computerMove(board, curr) {
  const scoredMoves = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (board[x][y] == CV.empty) {
        board[x][y] = curr;
        const score = minimax(board, 0, curr === CV.o) * (curr === CV.x ? 1 : -1);
        board[x][y] = CV.empty;
        scoredMoves.push({ x, y, score });
      }
    }
  }
  
  const bestScore = Math.max(...scoredMoves.map((m) => m.score));

  const bestMoves = scoredMoves.filter((m) => m.score == bestScore);

  const randomBestMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

  return randomBestMove;
}

async function computerHandle(room_obj) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const { board, turn } = room_obj.state;
  const { x, y } = computerMove(board, CV.o);
  board[x][y] = CV.o;
  const username = room_obj.users[0].username;
  room_obj.state.turn = username;

  // check win
  const check = checkWin(board);
  let win = null;
  let draw = false;
  if (check == CV.x) {
    win = room_obj.users[0];
  } else if (check == CV.o) {
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

  const userWS = connections[username];
  userWS.send(write_ws('state', room_obj.state));
  if (room_obj.state.status == 'win') {
    userWS.send(write_ws('info', `${room_obj.state.winner} Wins`));
  }
  if (room_obj.state.status == 'draw') {
    userWS.send(write_ws('info', `Game Draw`));
  }

  // cleanup
  if (win || draw) {
    connections[username].close();
    delete connections[username];
    delete ROOMS[room_obj.id];
  }
}

module.exports = {
  newGame,
  joinGame,
  stream,
};
