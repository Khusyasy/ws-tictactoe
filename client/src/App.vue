<template>
  <n-notification-provider :max="5">
    <n-space justify="center" align="center" style="height: 100vh;">
      <n-card>
        <router-view></router-view>
      </n-card>
    </n-space>
  </n-notification-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  NCard,
  NSpace,
  NNotificationProvider,
} from 'naive-ui';

export default defineComponent({
  name: 'App',
  components: {
    NCard,
    NSpace,
    NNotificationProvider,
  },
});
</script>

<style>
</style>
