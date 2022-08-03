import { ref } from 'vue'

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

const store = ref<Store>({
  user: null,
  room: null,
  room_id: null,
});

export default store
