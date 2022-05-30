import { ref } from 'vue'

type User = {
  username: string,
  room: string,
  ready: boolean,
  ws: WebSocket | null,
}

type Room = {
  id: string,
  users: User[],
  state: {
    status: string,
    turn: string,
    board: string[][],
  }
}

type Store = {
  user: User | null,
  room: Room | null,
}

const store = ref<Store>({
  user: null,
  room: null,
  // user: {
  //   username: 'test',
  //   roomId: 'asdfg',
  // },
  // room: {
  //   id: 'asdfg',
  //   users: [],
  //   state: {
  //     status: 'waiting',
  //     turn: '',
  //     board: [
  //       ['', '', ''],
  //       ['', '', ''],
  //       ['', '', '']
  //     ],
  //   },
  // },
})

export default store
