<template>
  <n-h1>Tic Tac Toe Multiplayer</n-h1>
  <n-tabs type="line" animated>
    <n-tab-pane name="Login" tab="Login">
      <n-space vertical>
        <n-input v-model:value="username" @keyup="() => username = username.toLowerCase()" placeholder="Username"
          clearable />
        <n-input v-model:value="password" placeholder="Password" type="password" clearable />
        <n-button @click.prevent="login" :disabled="!username || !password">
          Login
        </n-button>
      </n-space>
    </n-tab-pane>
    <n-tab-pane name="Register" tab="Register">
      <n-space vertical>
        <n-input v-model:value="username" @keyup="() => username = username.toLowerCase()" placeholder="Username"
          clearable />
        <n-input v-model:value="password" placeholder="Password" type="password" clearable />
        <n-input v-model:value="c_password" placeholder="Confirm Password" type="password" clearable />
        <n-button @click.prevent="register" :disabled="!username || !password || !c_password">
          Register
        </n-button>
      </n-space>
    </n-tab-pane>
  </n-tabs>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import {
  NH1,
  NSpace,
  NInput,
  NButton,
  NTabs,
  NTabPane,
  useNotification,
} from 'naive-ui'
import { useRouter } from 'vue-router'

import store from '../store'

export default defineComponent({
  name: 'NewGame',
  components: {
    NH1,
    NSpace,
    NInput,
    NButton,
    NTabs,
    NTabPane,
  },
  setup() {
    const notification = useNotification()
    const username = ref('')
    const password = ref('')
    const c_password = ref('')

    const router = useRouter()

    return {
      store,
      username,
      password,
      c_password,
      async login() {
        const { data } = await axios.post('/api/user/login', {
          username: username.value,
          password: password.value,
        })

        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        router.push('/')
      },
      async register() {
        if (password.value !== c_password.value) {
          return notification.error({
            content: 'Passwords do not match',
          })
        }

        const { data } = await axios.post('/api/user/register', {
          username: username.value,
          password: password.value,
        })

        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
          })
        }

        router.push('/')
      },
    }
  },
})
</script>

<style>
</style>
