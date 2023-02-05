<template>
  <n-layout vertical size="large">
    <n-layout-header bordered>
      <n-h1 style="margin: 0;">Tic Tac Toe Multiplayer</n-h1>
      <UserInfo />
    </n-layout-header>
    <n-layout-content content-style="padding: 0.5rem; height: calc(100vh - var(--header-height) - var(--footer-height))">
      <n-space justify="center" align="center" style="height: calc(100vh - var(--header-height) - var(--footer-height) - 1rem)">
        <n-card size="huge">
          <slot></slot>
        </n-card>
      </n-space>
    </n-layout-content>
    <n-layout-footer bordered>
      <n-space justify="center">
        <n-p>Made by <n-a href="https://khusyasy.com/" target="_blank">Khusyasy</n-a></n-p>
      </n-space>
    </n-layout-footer>
  </n-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import UserInfo from '../components/UserInfo.vue';

import {
  NH1,
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NCard,
  NSpace,
  NP,
  NA,
} from 'naive-ui';

export default defineComponent({
  name: 'MainPage',
  components: {
    UserInfo,
    NH1,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutFooter,
    NCard,
    NSpace,
    NP,
    NA,
  },
});
</script>

<style scoped>
.n-layout-header {
  height: var(--header-height);
  padding: 1rem;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.n-layout-footer {
  height: var(--footer-height);
  padding: 0.5rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.n-layout-content {
  background: rgb(235, 235, 235);
}
</style>
