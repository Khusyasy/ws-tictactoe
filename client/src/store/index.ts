import { ref } from 'vue'

type Store = {
  user: Record<string, unknown> | null
}

const store = ref<Store>({
  user: null,
})

export default store
