<template>
  <div v-if="store.room_id">
    <play-game />
  </div>
  <div v-else>
    <join-game />
  </div>
  <n-divider />
  <p>
    games: {{ store?.user?.games || 0 }}
    <n-divider vertical />
    wins: {{ store?.user?.win || 0 }}
    <n-divider vertical />
    losses: {{ store?.user?.lose || 0 }}
    <n-divider vertical />
    draws: {{ store?.user?.draw || 0 }}
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from '../store';

import {
  NDivider,
} from 'naive-ui';

import JoinGame from '../components/JoinGame.vue';
import PlayGame from '../components/PlayGame.vue';

export default defineComponent({
  name: 'PlayPage',
  components: {
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
