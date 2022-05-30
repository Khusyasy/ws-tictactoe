<template>
  <n-space justify="center" align="center" style="height: 100vh;">
    <n-card>
      <n-h1>Tic Tac Toe Multiplayer Game</n-h1>
      <play-game v-if="store.user" />
      <join-game v-else />
    </n-card>
  </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from './store';

import {
  NH1,
  NCard,
  NSpace,
} from 'naive-ui';

import JoinGame from './components/JoinGame.vue';
import PlayGame from './components/PlayGame.vue';

export default defineComponent({
  name: 'App',
  components: {
    NH1,
    NCard,
    NSpace,
    JoinGame,
    PlayGame,
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
