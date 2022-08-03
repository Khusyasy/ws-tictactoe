<template>
  <n-space vertical>
    <n-divider title-placement="center">
      Host
    </n-divider>
    <n-button @click.prevent="createRoom">
      Create a Room
    </n-button>
    <n-divider title-placement="center">
      Join
    </n-divider>
    <n-space>
      <n-input v-model:value="roomId" @keyup="() => roomId = roomId.toUpperCase()" placeholder="Input Room ID"
        clearable />
      <n-button @click.prevent="joinRoom">
        Join Room
      </n-button>
    </n-space>
    <n-divider>
    </n-divider>
    <span>
      Logged in as {{ store?.user?.username || 'Guest' }}
    </span>
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import {
  NDivider,
  NSpace,
  NInput,
  NButton,
  useNotification,
} from 'naive-ui'

import store from '../store'

export default defineComponent({
  name: 'NewGame',
  components: {
    NDivider,
    NSpace,
    NInput,
    NButton,
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
