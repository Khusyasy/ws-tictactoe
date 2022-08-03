<template>
  <div v-if="store.room_id">
    <play-game />
  </div>
  <div v-else>
    <n-h1>Tic Tac Toe Multiplayer</n-h1>
    <join-game />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from '../store';

import {
  NH1,
} from 'naive-ui';

import JoinGame from '../components/JoinGame.vue';
import PlayGame from '../components/PlayGame.vue';

export default defineComponent({
  name: 'PlayPage',
  components: {
    NH1,
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
