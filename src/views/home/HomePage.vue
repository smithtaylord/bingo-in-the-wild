<template>
  <ion-page>
    <MenuPageHeader title="Home" />
    <ion-content class="ion-padding" fullscreen>
      <div
        class="d-flex flex-column justify-content-center align-items-center h-100"
      >
        <div class="ion-padding-bottom ion-margin-bottom">
          <ion-icon :icon="leafOutline" />
          <ion-icon :icon="leafOutline" color="white" />
          <ion-icon :icon="roseOutline" />
          <ion-icon
            :icon="leafOutline"
            color="white"
            style="transform: scaleX(-1)"
          />
          <ion-icon :icon="leafOutline" style="transform: scaleX(-1)" />
        </div>

        <ion-text class="ion-padding-top ion-margin-top" color="dark-green">
          <h1 class="home-title">Bingo in the Wild</h1>
        </ion-text>
        <ion-button
          color="salmon"
          shape="round"
          size="large"
          @click="openThemeSelectorModal"
        >
          <ion-icon slot="start" :icon="trophy" size="large" />
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
import { leafOutline, roseOutline, trophy } from "ionicons/icons";
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

ion-icon {
  font-size: 64px;
}
</style>
