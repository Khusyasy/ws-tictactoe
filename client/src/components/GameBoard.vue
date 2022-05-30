<template>
  <n-card id="game-board">
    <div v-for="row in board" :key="row[0]" class="row">
      <div v-for="cell in row" :key="cell" :class="{
        'cell': true,
        'x': cell === 'x',
        'o': cell === 'o',
      }"></div>
    </div>
  </n-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NCard } from 'naive-ui';

export default defineComponent({
  name: 'GameBoard',
  components: {
    NCard,
  },
  props: {
    board: {
      type: Array as () => string[][],
    },
  },
  data() {
    return {
      keys: 0,
    }
  },
});
</script>

<style scoped>
#game-board {
  --cell-size: 10rem;
  --black: #181818;
  --gray: #909090;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, var(--cell-size));
}

.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border: solid 2px var(--black);
  cursor: pointer;
}

.cell.x::before {
  content: '';
  position: relative;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 10px;
  height: var(--cell-size);
  border-radius: 50px;
  background: var(--black);
}

.cell.x::after {
  content: '';
  position: relative;
  display: block;
  top: -50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 10px;
  height: var(--cell-size);
  border-radius: 50px;
  background: var(--black);
}

.cell.o::before {
  content: '';
  position: relative;
  display: block;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 100%;
  border: solid 10px var(--black);
  background: #fff;
}
</style>
