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
      turn: string,
      board: string[][],
    }
  } | null,
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
