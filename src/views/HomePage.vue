<template>
  <ion-page>
    <ion-content class="ion-padding" fullscreen>
      <div class="d-flex flex-column justify-content-center align-items-center h-100">
        <ion-text color="dark-green">
          <h1 class="home-title">Bingo in the Wild</h1>
        </ion-text>
        <ion-button shape="round" size="large" color="salmon">
          <ion-icon slot="start" :icon="trophy" />
          <span>Choose a Theme</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonContent, IonHeader, IonPage, IonTitle, IonIcon} from '@ionic/vue';
import {trophy} from "ionicons/icons";
</script>

<style scoped>
.home-title {
  font-weight: bolder;
  font-size: 30pt;
  margin-bottom: 50px;
}
</style>
