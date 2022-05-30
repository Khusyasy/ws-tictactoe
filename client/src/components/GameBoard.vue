<template>
  <div id="game-board">
    <div
      v-for="(row, i) in board"
      :key="i"
      class="row"
    >
      <div
        v-for="(cell, j) in row"
        :key="j"
        :class="{
          'cell': true,
          'x': cell === 'x',
          'o': cell === 'o',
        }"
        @click="move(i, j)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GameBoard',
  components: {
  },
  props: {
    board: {
      type: Array as () => string[][],
      required: true,
    },
    move: {
      type: Function,
      required: true,
    },
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
  border-left: solid 2px var(--black);
}

.cell {
  width: var(--cell-size);
  height: var(--cell-size);
  border-top: solid 2px var(--black);
  border-right: solid 2px var(--black);
  cursor: pointer;
}

.row:last-of-type .cell {
  border-bottom: solid 2px var(--black);
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
