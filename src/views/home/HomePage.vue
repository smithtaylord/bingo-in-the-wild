<template>
  <ion-page>
    <MenuPageHeader title="Home" />
    <ion-content class="ion-padding" fullscreen>
      <div
        class="d-flex flex-column justify-content-center align-items-center h-100"
      >
        <ion-text color="dark-green">
          <h1 class="home-title">Bingo in the Wild</h1>
        </ion-text>
        <ion-button
          color="salmon"
          shape="round"
          size="large"
          @click="openThemeSelectorModal"
        >
          <ion-icon slot="start" :icon="trophy" />
          <span>Choose a Theme</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonText,
  modalController,
  useIonRouter,
} from "@ionic/vue";
import { trophy } from "ionicons/icons";
import ThemeSelectorModal from "@/views/bingo-theme-selector/ThemeSelectorModal.vue";
import MenuPageHeader from "@/views/menu/MenuPageHeader.vue";

const ionRouter = useIonRouter();
const openThemeSelectorModal = async () => {
  const modal = await modalController.create({
    component: ThemeSelectorModal,
  });

  await modal.present();

  const { data, role } = await modal.onWillDismiss();

  if (role === "select") {
    await ionRouter.push({ name: "Bingo", params: { id: data } });
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
