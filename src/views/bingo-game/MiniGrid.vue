<template>
  <div class="mini-grid-board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="mini-grid-row">
      <div
        v-for="(cell, colIndex) in row"
        :key="`${rowIndex}-${colIndex}`"
        :class="['mini-cell', { marked: cell.isMarked }]"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BingoCell } from "@/views/bingo-game/bingoGameService";

defineProps<{
  board: BingoCell[][];
}>();
</script>

<style scoped>
.mini-grid-board {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.mini-grid-row {
  display: flex;
  flex-direction: row;
  gap: 1px;
}

.mini-cell {
  width: 5vh;
  height: 5vh;
  background-color: #ccc;
  border-radius: 1px;
}

.mini-cell.marked {
  background-color: var(--ion-color-salmon);
}
</style>
