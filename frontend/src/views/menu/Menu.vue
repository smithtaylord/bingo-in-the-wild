<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar color="coral">
        <ion-title color="white">Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content color="white">
      <ion-list>
        <ion-menu-toggle :auto-hide="true">
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


          <ion-item v-if="isLoggedIn"
                    button
                    color="white" @click="logout()"
          >
            <ion-label color="dark-green">
              <ion-icon :icon="logOut" class="ion-margin-end"></ion-icon>
              <span>Log out</span>
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
  IonToolbar
} from "@ionic/vue";
import {home, informationCircle, logOut} from "ionicons/icons";
import {computed} from "vue";
import {isLoggedIn, logout} from "@/services/auth";

interface MenuItem {
  name: string;
  path?: string;
  icon: string;
  function?: () => void;
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
  }
];


const loggedIn = computed(() => isLoggedIn());

</script>

<style scoped></style>
