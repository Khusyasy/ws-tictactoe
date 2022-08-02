<template>
  <n-space justify="center" align="center" style="height: 100vh;">
    <n-card>
      <div v-if="store.user">
        <play-game />
      </div>
      <div v-else>
        <n-h1>Tic Tac Toe Multiplayer</n-h1>
        <join-game />
      </div>
    </n-card>
  </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from '../store';

import {
  NH1,
  NCard,
  NSpace,
} from 'naive-ui';

import JoinGame from '../components/JoinGame.vue';
import PlayGame from '../components/PlayGame.vue';

export default defineComponent({
  name: 'PlayPage',
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
