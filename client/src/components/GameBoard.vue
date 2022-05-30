<template>
  <div>{{ board }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GameBoard',
  components: {
  },
  props: {
    board: Array,
  },
});
</script>

<style>
</style>
