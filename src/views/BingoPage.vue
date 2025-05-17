<template>
  <ion-page>
    <ion-header>
      <ion-buttons slot="start">
        <ion-button color="dark-green" class="ion-padding">
          <ion-icon :icon="menu" />
        </ion-button>
      </ion-buttons>
    </ion-header>
    <ion-content>
      
      <ion-text class="ion-text-center" color="dark-green">
        <h4>Theme: {{id}}</h4>
      </ion-text>
      
      <ion-grid class="bingo-grid ion-margin-bottom">
        <ion-row class="ion-justify-content-center">
          <ion-col
              v-for="letter in 'BINGO'"
              :key="letter"
              size="2"
              class="bingo-header"
          >
            <div class="bingo-box-header">
              <h1>{{ letter }}</h1>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid class="ion-margin-vertical">
        <ion-row v-for="(row, rowIndex) in board" :key="rowIndex" class="ion-justify-content-center">
          <ion-col
              v-for="(cell, colIndex) in row"
              :key="colIndex"
              size="2"
              class="bingo-cell"
              :class="{ marked: cell.marked }"
              @click="toggleCell(rowIndex, colIndex)"
          >
            <div class="bingo-box">
              <h2>{{ cell.text }}</h2>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="justify-content-center align-items-center d-flex flex-column ">
        <ion-button color="salmon" shape="round" class="bingo-page-button ion-margin-bottom">
          <ion-icon slot="start" :icon="list"></ion-icon>
          List View
        </ion-button> 
        
        
        <ion-button color="salmon" shape="round" class="bingo-page-button ion-margin-bottom">
          <ion-icon slot="start" :icon="trashBin"></ion-icon>
          Reset Game
        </ion-button>        
        
        <ion-button color="salmon" shape="round" class="bingo-page-button ion-margin-bottom">
          <ion-icon slot="start" :icon="home"></ion-icon>
          Home
        </ion-button>
      </div>
        
      
    </ion-content>    
  </ion-page>
</template>

<script setup lang="ts">

import {IonButton, IonButtons, IonHeader, IonIcon, IonPage, IonContent, IonText, IonRow, IonCol, IonGrid} from "@ionic/vue";
import {home, list, menu, trashBin} from "ionicons/icons";
import {ref} from "vue";

const props = defineProps<{id: string}>()

const board = ref([
  [{ text: '🍕' }, { text: '🎉' }, { text: '👀' }, { text: '🎯' }, { text: '🍀' }],
  [{ text: '💃' }, { text: '🕺' }, { text: '🚀' }, { text: '🧃' }, { text: '📸' }],
  [{ text: '🎸' }, { text: '🥳' }, { text: 'Free', marked: true }, { text: '🌈' }, { text: '🦄' }],
  [{ text: '🐶' }, { text: '🏀' }, { text: '🧁' }, { text: '👟' }, { text: '🍩' }],
  [{ text: '🎮' }, { text: '🎨' }, { text: '🧠' }, { text: '🌮' }, { text: '📚' }]
]);

const toggleCell = (rowIndex: number, colIndex: number) => {
  const cell = board.value[rowIndex][colIndex];
  cell.marked = !cell.marked;
}


// TODO need to put together a list of all possible winners and if there is a winner we need to do some sort of BINGO Overlay and convetti or something fun
</script>


<style scoped>
.bingo-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bingo-box-header {
  background-color: var(--ion-color-salmon);
  color: var(--ion-color-white);
  font-size: 1.5rem;
  border-radius: 8px;
}

.bingo-box{
  background-color: var(--ion-color-white);
  color: var(--ion-color-dark-green);
}

.bingo-box, .bingo-box-header{
  aspect-ratio: 1 / 1; /* Makes it square */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
}


.marked{
  background-color: var(--ion-color-salmon);
  color: var(--ion-color-white);
}


.bingo-page-button{
  width: 65vw;
}
</style>