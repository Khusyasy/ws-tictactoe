import { reactive, watch } from 'vue';

type User = {
  username: string;
  games: number;
  win: number;
  lose: number;
  draw: number;
};

type Room = {
  id: string;
  users: User[];
  state: {
    status: string;
    turn: string;
    winner: string;
    board: string[][];
  };
};

type Store = {
  user: User | null;
  room: Room | null;
  room_id: string | null;
};

const storage = localStorage.getItem('store');
let data = {
  user: null,
  room: null,
  room_id: null,
};

if (storage) {
  data = JSON.parse(storage);
}

const store = reactive<Store>(data);

watch(store, (newVal) => {
  localStorage.setItem('store', JSON.stringify(newVal));
});

export default store;
