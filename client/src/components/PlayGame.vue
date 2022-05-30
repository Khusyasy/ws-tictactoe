<template>
  <n-space vertical v-if="store.room && store.user">
    <span>{{ store.user.username }}</span>
    <span>Room {{ store.room.id }} | {{ store.room.state.status }}</span>
    <span>{{ store.room.state.turn }}</span>
    <game-board :board="store.room.state.board" />
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { NSpace } from 'naive-ui';

import store from '../store';

import GameBoard from './GameBoard.vue';

export default defineComponent({
  name: 'PlayGame',
  components: {
    NSpace,
    GameBoard,
  },
  setup() {
    const connection = ref(new WebSocket(`ws://${window.location.host}/api/stream`))

    connection.value.onmessage = function(event) {
      const { type, data } = JSON.parse(event.data)
      if (type === 'room') {
        store.value.room = data
      }else if (type === 'state' && store.value.room) {
        store.value.room.state = data
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
    }
  },
});
</script>

<style>
</style>
