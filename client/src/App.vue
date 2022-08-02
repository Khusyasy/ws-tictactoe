<template>
  <n-notification-provider :max="5">
    <router-view></router-view>
  </n-notification-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import {
  NNotificationProvider,
} from 'naive-ui';

export default defineComponent({
  name: 'App',
  components: {
    NNotificationProvider,
  },
});
</script>

<style>
</style>
