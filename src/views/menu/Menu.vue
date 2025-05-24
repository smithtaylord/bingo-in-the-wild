<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar color="coral">
        <ion-title color="white">Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content color="white">
      <ion-list>
        <ion-menu-toggle auto-hide="true">
          <ion-item
            v-for="item in menuItems"
            :router-link="item.path"
            button
            color="white"
          >
            <ion-label color="dark-green">
              <ion-icon :icon="item.icon" class="ion-margin-end"></ion-icon>
              <span>{{ item.name }}</span>
            </ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script lang="ts" setup>
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { home, informationCircle } from "ionicons/icons";

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {
    name: "Home",
    path: "/home",
    icon: home,
  },
  {
    name: "About",
    path: "/about",
    icon: informationCircle,
  },
];
</script>

<style scoped></style>
