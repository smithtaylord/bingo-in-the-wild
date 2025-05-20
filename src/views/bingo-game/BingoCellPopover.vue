<template>
  <ion-content>
    <div class="bingo-cell-popover">
      {{ label }}
    </div>
  </ion-content>
</template>

<script lang="ts" setup>
import { IonContent } from "@ionic/vue";

defineProps<{ label: string }>();
</script>

<style>
.bingo-cell-popover {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 33vw;
  height: 33vw;
  color: var(--ion-color-dark-green);
  background-color: var(--ion-color-white);
  padding: 5px;
  font-size: 1rem;
  font-weight: bold;
}
</style>
