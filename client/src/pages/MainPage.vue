<template>
  <n-layout vertical size="large">
    <n-layout-header bordered>
      <n-h1>Tic Tac Toe Multiplayer</n-h1>
    </n-layout-header>
    <n-layout-content content-style="height: calc(100vh - 2 * var(--header-height))">
      <n-space justify="center" align="center" style="height: calc(100vh - 2 * var(--header-height))">
        <n-card>
          <slot></slot>
        </n-card>
      </n-space>
    </n-layout-content>
    <n-layout-footer bordered>
      <n-space justify="end">
        <n-p>Made by <n-a href="https://khusyasy.com/" target="_blank">Khusyasy</n-a></n-p>
      </n-space>
    </n-layout-footer>
  </n-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
.n-layout-header,
.n-layout-footer {
  height: var(--header-height);
  padding: 1rem;
  overflow: hidden;
}

.n-layout-content {
  background: rgb(235, 235, 235);
}
</style>
