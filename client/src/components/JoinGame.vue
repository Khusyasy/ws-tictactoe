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
      <n-input v-model:value="joinRoomId" @keyup="() => joinRoomId = joinRoomId.toUpperCase()"
        placeholder="Input Room ID" clearable />
      <n-button @click.prevent="joinRoom">
        Join Room
      </n-button>
    </n-space>
    <n-divider>
    </n-divider>
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
    const joinRoomId = ref('')

    return {
      store,
      username,
      joinRoomId,
      async createRoom() {
        const { data } = await axios.post('/api/game/new', null)

        const { ok, room_id } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        store.value.room_id = room_id
      },
      async joinRoom() {
        if (!joinRoomId.value) {
          return notification.error({
            content: 'Please input room id',
            duration: 3000,
          })
        }

        joinRoomId.value = joinRoomId.value.toUpperCase()

        const { data } = await axios.post('/api/game/join', {
          room_id: joinRoomId.value,
        })

        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        store.value.room_id = joinRoomId.value
      },
    }
  },
})
</script>

<style>
</style>
