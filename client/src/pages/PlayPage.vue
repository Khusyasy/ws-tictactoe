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
      <n-divider vertical />
      <a href="#" @click.prevent="logout">Logout</a>
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
import axios from 'axios';
import { useNotification } from 'naive-ui';
import { useRouter } from 'vue-router';

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
    const notification = useNotification();
    const router = useRouter();

    return {
      store,
      async logout() {
        const { data } = await axios.get('/api/user/logout');
        const { ok } = data;
        console.log(data, ok);

        if (!ok) {
          return notification.error({
            content: data.error,
            duration: 3000,
          });
        }

        store.value.user = null;
        store.value.room_id = null;
        router.push({ name: 'login' });
        return notification.success({
          content: 'Logged out',
          duration: 3000,
        });
      },
    }
  },
});
</script>

<style>
</style>
