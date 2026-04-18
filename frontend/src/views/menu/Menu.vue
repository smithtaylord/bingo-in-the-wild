<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar color="coral">
        <ion-title color="dark-green">Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content color="white">
      <ion-list>
        <ion-menu-toggle :auto-hide="true">
          <ion-item
              v-for="item in menuItems"
              :key="item.name"
              :router-link="item.path"
              button
              color="white"
          >
            <ion-label color="dark-green">
              <ion-icon :icon="item.icon" class="ion-margin-end"></ion-icon>
              <span>{{ item.name }}</span>
            </ion-label>
          </ion-item>

          <ion-item v-if="loggedIn"
                    button
                    color="white"
                    @click="logout()"
          >
            <ion-label color="dark-green">
              <ion-icon :icon="logOut" class="ion-margin-end"></ion-icon>
              <span>Log out</span>
            </ion-label>
          </ion-item>
        </ion-menu-toggle>
      </ion-list>

      <ion-list>
        <ion-list-header color="white">
          <ion-label color="dark-green">Theme</ion-label>
        </ion-list-header>
        <div class="theme-segment-container">
          <ion-segment :value="currentTheme" @ionChange="onThemeChange">
            <ion-segment-button value="wild">
              <ion-label>Wild</ion-label>
            </ion-segment-button>
            <ion-segment-button value="light">
              <ion-label>Light</ion-label>
            </ion-segment-button>
            <ion-segment-button value="dark">
              <ion-label>Dark</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>
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
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar
} from "@ionic/vue";
import {home, informationCircle, logOut} from "ionicons/icons";
import {computed} from "vue";
import {isLoggedIn, logout} from "@/services/auth";
import {useTheme, ThemeName} from "@/services/theme";

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
const {currentTheme, setTheme} = useTheme();

const onThemeChange = (event: CustomEvent) => {
  const value = event.detail.value as ThemeName;
  if (value) {
    setTheme(value);
  }
};
</script>

<style scoped>
ion-toolbar {
    --background: linear-gradient(135deg, var(--ion-color-coral), var(--ion-color-coral-tint));
}

ion-title {
    color: var(--ion-color-dark-green);
    font-family: 'Fredoka', sans-serif;
    font-weight: 700;
}

ion-item {
    --border-radius: var(--radius-sm);
    margin: 2px 0;
}

ion-item ion-icon {
    margin-right: 12px;
    font-size: 1.3rem;
}

.theme-segment-container {
    padding: 0 8px;
}

ion-segment {
    --border-radius: var(--radius-lg);
}

ion-segment-button {
    --border-radius: var(--radius-md);
    font-size: 0.8rem;
    font-weight: 600;
}
</style>