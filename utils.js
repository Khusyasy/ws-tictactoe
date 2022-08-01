const is_valid = (x) => x !== '' && x !== undefined && x !== null;

const write_ws = (type, data) => JSON.stringify({ type, data });

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

  if (
    wins.length == 0 &&
    board.every((row) => row.every((cell) => cell !== ''))
  ) {
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

module.exports = {
  is_valid,
  write_ws,
  checkWin,
};
