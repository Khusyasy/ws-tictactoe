import { ref } from 'vue'

type Store = {
  user: {
    username: string,
    roomId: string,
  } | null,
  room: {
    id: string,
    users: string[],
    state: {
      status: string,
      turn: string | null,
      board: string[][] | null[][],
    }
  } | null,
}

const store = ref<Store>({
  // user: null,
  // room: null,
  user: {
    username: 'test',
    roomId: 'asdfg',
  },
  room: {
    id: 'asdfg',
    users: [],
    state: {
      status: 'waiting',
      turn: null,
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ],
    },
  },
})

export default store
