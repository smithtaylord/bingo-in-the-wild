<template>
  <ion-header>
    <ion-toolbar color="salmon">
      <ion-buttons slot="start">
        <ion-button color="light" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title>
        Select a Theme
      </ion-title>
    </ion-toolbar>
    <ion-toolbar color="white" class="ion-padding-top">
      <ion-searchbar></ion-searchbar>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding" color="white">
    <ion-list lines="inset">
      <ion-item color="white" button detail="false" v-for="theme in mockThemes" :key="theme">
        <ion-label color="dark-green" @click="select(theme)">{{ theme }}</ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonItem,
  modalController,
  IonSearchbar,
  IonList,
  IonLabel
} from '@ionic/vue';

const cancel = () => modalController.dismiss(null, 'cancel');
const select = (value: string) => {
  console.log(value)
  modalController.dismiss(value, 'select')
};

const mockThemes = ['Hockey', 'Baseball', 'Boise Green Belt', 'General People Watching', 'Brewery People Watching'];
</script>

<style scoped>

</style>