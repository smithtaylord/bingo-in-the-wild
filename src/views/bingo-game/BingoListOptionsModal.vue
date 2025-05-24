<template>
  <ion-content class="modal">
    <ion-item-group v-for="(row, rowIndex) in board" :key="rowIndex">
      <ion-item-divider color="dusty-green">
        <ion-label color="white">{{ groupLabel[rowIndex] }}</ion-label>
      </ion-item-divider>

      <ion-item
        v-for="(cell, colIndex) in row"
        :key="cell.label"
        :color="cell.isMarked ? 'coral' : 'white'"
        @click="toggleCell(rowIndex, colIndex)"
      >
        <ion-label :color="cell.isMarked ? 'white' : 'dark-green'">
          <span
            ><strong>{{ groupLabel[rowIndex] }}{{ colIndex + 1 }} - </strong>
          </span>
          <span> {{ cell.label }} </span>
        </ion-label>
      </ion-item>
    </ion-item-group>
  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
} from "@ionic/vue";
import { BingoCell } from "@/views/bingo-game/bingoGameService";

defineProps<{ board: BingoCell[][] }>();

const groupLabel = ["B", "I", "N", "G", "O"];

const emit = defineEmits<{
  (e: "cell-toggled", value: [number, number]): void;
}>();

const toggleCell = (rowIndex: number, colIndex: number) => {
  emit("cell-toggled", [rowIndex, colIndex]);
};
</script>

<style scoped>
.modal {
  --height: 66vh;
}
</style>
