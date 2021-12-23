const room_id_el = document.getElementById('room_id');
const username_el = document.getElementById('username');
const game_board_el = document.getElementById('game-board');
let cells_el = [...document.getElementsByClassName('cell')];

function readCookie(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const room_id = readCookie('room');
const username = readCookie('username');

room_id_el.innerHTML = room_id;
username_el.innerHTML = username;

const STATE = {
  status: 'waiting',
};

ws_protocol = 'ws://';
if (window.location.protocol == 'https:') {
  ws_protocol = 'wss://';
}
const connection = new WebSocket(ws_protocol + location.host + '/stream');

connection.addEventListener('open', function () {
  connection.send(JSON.stringify({ type: 'join' }));
  cells_el.forEach((cell) => {
    cell.addEventListener('click', (e) => {
      if (STATE.turn === username) {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        connection.send(JSON.stringify({ type: 'move', x, y }));
      }
    });
  });
});


connection.addEventListener('message', function (message) {
  const data = JSON.parse(message.data);
  if (data.type == 'game') {
    STATE.status = data.state.status;
    STATE.board = data.state.board;
    STATE.turn = data.state.turn;
    render();
  }
});

function render() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = game_board_el.querySelector(
        "[data-x='" + i + "'][data-y='" + j + "']"
      );
      const value = STATE.board[i][j];
      if (value == -1) {
        cell.dataset.value = '';
      } else {
        cell.dataset.value = value;
      }
    }
  }
}
