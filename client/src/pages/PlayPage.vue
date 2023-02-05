<template>
  <div v-if="store.room_id">
    <play-game />
  </div>
  <div v-else>
    <join-game />
  </div>
  <n-divider />
  <n-space justify="space-evenly">
    <n-p>
      Games: {{ store?.user?.games || 0 }}
    </n-p>
    <n-p>
      Wins: {{ store?.user?.win || 0 }}
    </n-p>
    <n-p>
      Losses: {{ store?.user?.lose || 0 }}
    </n-p>
    <n-p>
      Draws: {{ store?.user?.draw || 0 }}
    </n-p>
  </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import store from '../store';

import {
  NDivider,
  NSpace,
  NP,
} from 'naive-ui';

import JoinGame from '../components/JoinGame.vue';
import PlayGame from '../components/PlayGame.vue';

export default defineComponent({
  name: 'PlayPage',
  components: {
    NDivider,
    NSpace,
    NP,
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
