<template>
  <ion-header>
    <ion-toolbar color="dusty-green">
      <ion-buttons slot="start">
        <ion-button color="light" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-title> Select a Theme</ion-title>
    </ion-toolbar>
    <ion-toolbar class="ion-padding-top" color="white">
      <ion-searchbar></ion-searchbar>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding" color="white">
    <ion-list lines="inset">
      <ion-item
        v-for="theme in themes"
        :key="theme.id"
        button
        color="white"
        detail="false"
      >
        <ion-label color="dark-green" @click="select(theme.id)"
          >{{ theme.name }}
        </ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { ThemeSelectorAPI } from "@/views/bingo-theme-selector/themeSelectorAPI";
import { onMounted, Ref, ref } from "vue";
import { GameTheme } from "@/views/mock-game-themes/mockGameThemes";

const api = new ThemeSelectorAPI();
const cancel = () => modalController.dismiss(null, "cancel");
const select = (value: number) => {
  modalController.dismiss(value, "select");
};

const themes: Ref<GameTheme[]> = ref([]);

onMounted(() => {
  themes.value = api.getThemes();
});
</script>

<style scoped></style>
