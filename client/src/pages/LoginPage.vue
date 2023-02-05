<template>
  <n-tabs type="line" animated>
    <n-tab-pane name="Login" tab="Login">
      <form @submit.prevent="login">
        <n-space vertical>
          <n-input :value="username" @input="(value) => username = value.toLowerCase()" placeholder="Username"
            clearable />
          <n-input v-model:value="password" placeholder="Password" type="password" clearable />
          <n-button attr-type="submit" :disabled="!username || !password">
            Login
          </n-button>
        </n-space>
      </form>
    </n-tab-pane>
    <n-tab-pane name="Register" tab="Register">
      <form @submit.prevent="register">
        <n-space vertical>
          <n-input :value="username" @input="(value) => username = value.toLowerCase()" placeholder="Username"
            clearable />
          <n-input v-model:value="password" placeholder="Password" type="password" clearable />
          <n-input v-model:value="c_password" placeholder="Confirm Password" type="password" clearable />
          <n-button attr-type="submit" :disabled="!username || !password || !c_password">
            Register
          </n-button>
        </n-space>
      </form>
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
import { useRouter } from 'vue-router'

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
    const password = ref('')
    const c_password = ref('')

    const router = useRouter()

    if (store.user) {
      router.replace('/')
    }

    return {
      store,
      username,
      password,
      c_password,
      async login() {
        username.value = username.value.toLowerCase()
        const { data } = await axios.post('/api/user/login', {
          username: username.value,
          password: password.value,
        })

        const { ok } = data
        if (!ok) {
          return notification.error({
            content: data.error,
            duration: 3000,
          })
        }

        router.push({ name: 'play' })
      },
      async register() {
        username.value = username.value.toLowerCase()
        if (password.value !== c_password.value) {
          return notification.error({
            content: 'Passwords do not match',
            duration: 3000,
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
            duration: 3000,
          })
        }

        router.push({ name: 'play' })
      },
    }
  },
})
</script>

<style>
</style>
