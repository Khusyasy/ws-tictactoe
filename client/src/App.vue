<template>
  <n-space justify="center" align="center" style="height: 100vh;">
    <n-card>
      <n-h1>Tic Tac Toe Multiplayer Game</n-h1>
      <join-game />
    </n-card>
  </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  NH1,
  NCard,
  NSpace,
} from 'naive-ui';

import JoinGame from './components/JoinGame.vue';

export default defineComponent({
  name: 'App',
  components: {
    NH1,
    NCard,
    NSpace,
    JoinGame,
  },
});
</script>

<style>
</style>
