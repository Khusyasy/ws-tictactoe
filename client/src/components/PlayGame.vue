<template>
  <n-space vertical v-if="store.room && store.user">
    <span>{{ store.user.username }}</span>
    <span>Room {{ store.room.id }} | {{ store.room.state.status }}</span>
    <span>{{ store.room.state.turn }}' turn</span>
    <game-board :board="store.room.state.board" :move="move" />
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { NSpace, useNotification } from 'naive-ui';

import store from '../store';

import GameBoard from './GameBoard.vue';

export default defineComponent({
  name: 'PlayGame',
  components: {
    NSpace,
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
        })
      }
    }

    connection.value.onopen = function(event) {
      connection.value.send(JSON.stringify({
        type: 'join',
        data: {
          user: store.value.user,
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
            x,
            y,
          },
        }))
      },
    }
  },
});
</script>

<style>
</style>
