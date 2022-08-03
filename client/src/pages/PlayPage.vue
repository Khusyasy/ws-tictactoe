<template>
  <div v-if="store.room_id">
    <play-game />
  </div>
  <div v-else>
    <n-h1>Tic Tac Toe Multiplayer</n-h1>
    <join-game />
  </div>
  <div>
    <p>
      Logged in as {{ store?.user?.username || 'Guest' }}
    </p>
    <p>
      games: {{ store?.user?.games || 0 }}
      <n-divider vertical />
      wins: {{ store?.user?.win || 0 }}
      <n-divider vertical />
      losses: {{ store?.user?.lose || 0 }}
      <n-divider vertical />
      draws: {{ store?.user?.draw || 0 }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from '../store';

import {
  NH1,
  NDivider,
} from 'naive-ui';

import JoinGame from '../components/JoinGame.vue';
import PlayGame from '../components/PlayGame.vue';

export default defineComponent({
  name: 'PlayPage',
  components: {
    NH1,
    NDivider,
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
