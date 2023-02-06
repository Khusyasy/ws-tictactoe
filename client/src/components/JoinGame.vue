<template>
  <n-space vertical size="large">
    <n-space>
      <n-button @click.prevent="()=>createRoom('vs')">
        Play vs Friends
      </n-button>
      <n-button @click.prevent="()=>createRoom('computer')">
        Play vs Computer
      </n-button>
      </n-space>
    <n-divider />
    <n-space>
      <n-input 
        v-model:value="joinRoomId"
        @input="handleInput"
        @input-focus="selectInput"
        @click.prevent="selectInput"
        placeholder="XXXXXX"
        maxlength="6"
      />
      <n-button @click.prevent="joinRoom" :disabled="joinRoomId.length != 6">
        Join Room
      </n-button>
    </n-space>
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
  name: 'JoinGame',
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
      async createRoom(gamemode = 'vs') {
        const { data } = await axios.post('/api/game/new', {
          gamemode,
        })

        const { ok, room_id } = data
        if (!ok) {
          return notification.error({
            content: data.error,
            duration: 3000,
          })
        }

        store.room_id = room_id
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
            duration: 3000,
          })
        }

        store.room_id = joinRoomId.value
      },
      handleInput(val: string) {
        joinRoomId.value = val.toUpperCase();
      },
      selectInput(e: FocusEvent) {
        if (e.target instanceof HTMLInputElement) {
          (e.target as HTMLInputElement).select();
        }
      },
    }
  },
})
</script>

<style scoped>
.n-input {
  width: 12ch;
  text-align: center;
}
</style>
