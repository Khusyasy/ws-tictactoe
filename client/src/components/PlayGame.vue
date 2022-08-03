<template>
  <n-space vertical v-if="store.room && store.user">
    <n-h1>Room <code @click.prevent="copyCode">{{ store.room.id }}</code> | {{ store.room.state.status }}</n-h1>
    <span v-if="store.room.state.turn">{{ store.room.state.turn }}'s turn</span>
    <span v-else-if="store.room.state.winner">{{ store.room.state.winner }} wins</span>
    <game-board :board="store.room.state.board" :move="move" />
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  NSpace,
  NH1,
  useNotification,
} from 'naive-ui';

import store from '../store';

import GameBoard from './GameBoard.vue';

export default defineComponent({
  name: 'PlayGame',
  components: {
    NSpace,
    NH1,
    GameBoard,
  },
  setup() {
    const notification = useNotification()

    let ws_protocol = 'ws://';
    if (window.location.protocol == 'https:') {
      ws_protocol = 'wss://';
    }
    const connection = ref(new WebSocket(`${ws_protocol}${window.location.host}/api/stream`))

    connection.value.onmessage = function(event) {
      const { type, data } = JSON.parse(event.data)
      if (type === 'room') {
        store.value.room = data
      }else if (type === 'state' && store.value.room) {
        store.value.room.state = data
      }else if (type === 'info') {
        notification.info({
          content: data,
          duration: 3000,
        })
      }
    }

    connection.value.onopen = function(event) {
      connection.value.send(JSON.stringify({
        type: 'join',
        data: {
          user: store.value.user,
          room_id: store.value.room_id,
        },
      }))
    }

    return {
      connection,
      store,
      move(x: number, y: number) {
        connection.value.send(JSON.stringify({
          type: 'move',
          data: {
            user: store.value.user,
            room_id: store.value.room_id,
            x,
            y,
          },
        }))
      },
      copyCode() {
        if (store.value.room) {
          navigator.clipboard.writeText(store.value.room.id)
          notification.info({
            content: 'Copied to clipboard',
            duration: 3000,
          })
        } else {
          notification.info({
            content: 'No room to copy',
            duration: 3000,
          })
        }
      },
    }
  },
});
</script>

<style>
code {
  border: 2px solid #909090;
  border-radius: 10px;
  padding: 4px 2px;
  cursor: copy;
  user-select: none;
  font-weight: 700;
}
</style>
