<template>
  <n-config-provider :theme="lightTheme">
    <n-notification-provider :max="3">
      <MainPage>
        <router-view />
      </MainPage>
    </n-notification-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import MainPage from './pages/MainPage.vue';

import {
  NNotificationProvider,
  NConfigProvider,
  lightTheme,
} from 'naive-ui';

export default defineComponent({
  name: 'App',
  components: {
    NNotificationProvider,
    NConfigProvider,
    MainPage,
  },
  setup() {
    return {
      lightTheme,
    };
  },
});
</script>

<style scoped>
</style>
