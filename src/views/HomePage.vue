<template>
  <ion-page>
    <ion-header>
      <ion-buttons slot="start">
        <ion-button color="dark-green" class="ion-padding">
          <ion-icon :icon="menu" />
        </ion-button>
      </ion-buttons>
    </ion-header>
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
import {
  IonContent,
  IonPage,
  IonIcon,
  modalController,
  IonButton,
  IonText,
  IonToolbar,
  IonHeader,
  IonButtons
} from '@ionic/vue';
import {menu, trophy} from "ionicons/icons";
import ThemeSelectorModal from "@/views/ThemeSelectorModal.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const openThemeSelectorModal = async () => {
  const modal = await modalController.create({
    component: ThemeSelectorModal,
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === 'select') {
    console.log("[Data]", data)
   await  router.push({ name: "Bingo", params: { id: data } })
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
