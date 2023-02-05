<template>
  <n-space v-show="store?.user" vertical justify="center" align="center">
    <n-p italic>
      {{ store?.user?.username || 'Guest' }}
    </n-p>
    <n-button size="small" type="error" @click.prevent="logout">Logout</n-button>
  </n-space>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { useNotification } from 'naive-ui';
import { useRouter } from 'vue-router';

import store from '../store';

import {
  NSpace,
  NP,
  NButton,
} from 'naive-ui';

export default defineComponent({
  name: 'UserInfo',
  components: {
    NSpace,
    NP,
    NButton,
  },
  setup() {
    const notification = useNotification();
    const router = useRouter();

    return {
      store,
      async logout() {
        const { data } = await axios.get('/api/user/logout');
        const { ok } = data;

        if (!ok) {
          return notification.error({
            content: data.error,
            duration: 3000,
          });
        }

        store.user = null;
        store.room_id = null;
        store.room = null;
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

<style scoped>
</style>
