<template>
  <n-space vertical>
    <n-input v-model:value="formValue.username" placeholder="Input Username" />
    <n-button @click.prevent="createRoom">
      Create a Room
    </n-button>
  </n-space>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import {
  NSpace,
  NInput,
  NButton,
} from 'naive-ui'

export default defineComponent({
  name: 'NewGame',
  components: {
    NSpace,
    NInput,
    NButton,
  },
  setup() {
    const formValue = ref({
      username: '',
    })
    return {
      formValue,
      createRoom () {
        if (formValue.value && formValue.value.username) {
          console.log(formValue.value.username)
        }
      },
    }
  },
})
</script>

<style>
</style>
