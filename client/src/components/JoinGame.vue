<template>
  <n-tabs type="line" animated>
    <n-tab-pane name="join" tab="Join">
      <n-space vertical>
        <n-input v-model:value="username" placeholder="Input Username" />
        <n-input v-model:value="roomId" placeholder="Input Room ID" />
        <n-button @click.prevent="joinRoom">
          Join a Room
        </n-button>
      </n-space>
    </n-tab-pane>
    <n-tab-pane name="create" tab="Create">
      <n-space vertical>
        <n-input v-model:value="username" placeholder="Input Username" />
        <n-button @click.prevent="createRoom">
          Create a Room
        </n-button>
      </n-space>
    </n-tab-pane>
  </n-tabs>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
  NSpace,
  NInput,
  NButton,
  NTabs,
  NTabPane,
} from 'naive-ui'

import store from '../store'

export default defineComponent({
  name: 'NewGame',
  components: {
    NSpace,
    NInput,
    NButton,
    NTabs,
    NTabPane,
  },
  setup() {
    const username = ref('')
    const roomId = ref('')
    return {
      store,
      username,
      roomId,
      createRoom () {
        if (username.value) {
          console.log(username.value)
          store.value = {
            user: {
              username: username.value,
            },
          }
        }
      },
      joinRoom () {
        if (username.value && roomId.value) {
          console.log(username.value, roomId.value)
        }
      },
    }
  },
})
</script>

<style>
</style>
