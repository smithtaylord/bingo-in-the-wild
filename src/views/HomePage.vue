<template>
  <ion-page>
    <ion-content class="ion-padding" fullscreen>
      <div class="d-flex flex-column justify-content-center align-items-center h-100">
        <ion-text color="dark-green">
          <h1 class="home-title">Bingo in the Wild</h1>
        </ion-text>
        <ion-button shape="round" size="large" color="salmon" @click="openThemeSelectorModal">
          <ion-icon slot="start" :icon="trophy" />
          <span>Choose a Theme</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {IonContent, IonPage, IonIcon, modalController, IonButton, IonText} from '@ionic/vue';
import {trophy} from "ionicons/icons";
import ThemeSelectorModal from "@/views/ThemeSelectorModal.vue";

const openThemeSelectorModal = async () => {
  const modal = await modalController.create({
    component: ThemeSelectorModal,
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  console.log('[data - This is the value]', data)
  console.log('[role - this is going to either be cancel, or select]', role)

  if (role === 'confirm') {
    console.log("Confirmed")
    // TODO This needs to then route to the Bingo Page with that theme selected
    // So role + some sort of ID needs to be passed back
  }
};


</script>

<style scoped>
.home-title {
  font-weight: bolder;
  font-size: 30pt;
  margin-bottom: 50px;
}
</style>
