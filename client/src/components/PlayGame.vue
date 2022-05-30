<template>
  <n-space vertical v-if="store.room && store.user">
    <span> {{ store.user.username }} | Room {{ store.room.id }}</span>
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
    return {
      store,
    }
  },
});
</script>

<style>
</style>
