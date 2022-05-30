<template>
  <n-tabs type="line" animated>
    <n-tab-pane name="join" tab="Join">
      <n-space vertical>
        <n-input
          v-model:value="username"
          @keyup="() => username = username.toLowerCase()"
          placeholder="Input Username"
        />
        <n-input
          v-model:value="roomId"
          @keyup="() => roomId = roomId.toUpperCase()"
          placeholder="Input Room ID"
          clearable
        />
        <n-button @click.prevent="joinRoom">
          Join Room
        </n-button>
      </n-space>
    </n-tab-pane>
    <n-tab-pane name="create" tab="Create">
      <n-space vertical>
        <n-input
          v-model:value="username"
          @keyup="() => username = username.toLowerCase()"
          placeholder="Input Username"
        />
        <n-button @click.prevent="createRoom">
          Create a Room
        </n-button>
      </n-space>
    </n-tab-pane>
  </n-tabs>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import {
  NSpace,
  NInput,
  NButton,
  NTabs,
  NTabPane,
  useNotification,
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
    const notification = useNotification()
    const username = ref('')
    const roomId = ref('')
    return {
      store,
      username,
      roomId,
      async createRoom () {
        if (!username.value) {
          return notification.error({
            content: 'Please input username',
            duration: 3000,
          })
        }

        const { data } = await axios.post('/api/game/new', {
          username: username.value.toLowerCase(),
        })
        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        store.value.user = data.user
      },
      async joinRoom () {
        if (!username.value) {
          return notification.error({
            content: 'Please input username',
            duration: 3000,
          })
        }

        if(!roomId.value) {
          return notification.error({
            content: 'Please input room id',
            duration: 3000,
          })
        }

        const { data } = await axios.post('/api/game/join', {
          user: {
            username: username.value.toLowerCase(),
            room: roomId.value.toUpperCase(),
          },
        })

        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        store.value.user = data.user
      },
    }
  },
})
</script>

<style>
</style>
