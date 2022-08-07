<template>
  <n-space vertical v-if="store.room && store.user">
    <n-h1>Room <code @click.prevent="copyCode">{{ store.room.id }}</code></n-h1>
    <n-p v-if="store.room.state.winner">
      <span v-if="store.room.state.winner == store.user.username">You won!</span>
      <span v-else>{{ store.room.state.winner }} won!</span>
      <n-divider vertical></n-divider>
      <n-button @click="resetLobby">
        Back to lobby
      </n-button>
    </n-p>
    <span v-if="store.room.state.turn">{{ store.room.state.turn }}'s turn</span>
    <game-board :board="store.room.state.board" :move="move" />
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  NSpace,
  NH1,
  NP,
  NButton,
  NDivider,
  useNotification,
} from 'naive-ui';

import store from '../store';

import GameBoard from './GameBoard.vue';
import axios from 'axios';

export default defineComponent({
  name: 'PlayGame',
  components: {
    NSpace,
    NH1,
    NP,
    NButton,
    NDivider,
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
        store.room = data
      } else if (type === 'state' && store.room) {
        store.room.state = data
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
          user: store.user,
          room_id: store.room_id,
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
            user: store.user,
            room_id: store.room_id,
            x,
            y,
          },
        }))
      },
      copyCode() {
        if (store.room) {
          navigator.clipboard.writeText(store.room.id)
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
      async resetLobby() {
        store.room_id = null
        store.room = null
        // get new user data
        const { data } = await axios.get('/api/user/check');
        const { ok, user } = data;
        if (!ok) {
          notification.error({
            content: 'Failed to get user data, please refresh the page',
            duration: 3000,
          })
          return;
        }

        store.user = user;
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
