<template>
  <ion-tabs class="h-100">
    <ion-tab tab="my-games">
      <div id="my-games-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-title>My Games</ion-title>
            <!--            TODO ONly show if logged in-->
            <!--            TODO Page Transistions-->
            <!--            TODO Make each page its own component, or a shared component-->
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="my-games-content">
            <ion-list lines="inset">
              <ion-item
                  v-for="theme in myGamesThemes"
                  :key="theme.id"
                  :detail="false"
                  button
                  color="white"
              >
                <ion-label color="dark-green" @click="select(theme.id)">
                  {{ theme.name }}
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-button
                class="new-theme-btn"
                color="coral"
                expand="block"
            >
              <ion-icon slot="start" :icon="addOutline" size="large"/>
              Create A New Theme
            </ion-button>
          </div>

        </ion-content>
      </div>
    </ion-tab>

    <ion-tab tab="sports">
      <div id="sports-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-title>Sports Themed</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="theme in sportsThemes"
                :key="theme.id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(theme.id)">
                {{ theme.name }}
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </div>
    </ion-tab>

    <ion-tab tab="social">
      <div id="social-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-title>Social Themed</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="theme in socialThemes"
                :key="theme.id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(theme.id)">
                {{ theme.name }}
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </div>
    </ion-tab>

    <ion-tab tab="location">
      <div id="location-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-title>Location Based Games</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="theme in locationThemes"
                :key="theme.id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(theme.id)">
                {{ theme.name }}
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
      </div>
    </ion-tab>
    <ion-tab-bar slot="bottom" color="dusty-green">
      <ion-tab-button tab="my-games">
        <ion-icon :icon="personCircle"/>
        My Games
      </ion-tab-button>
      <ion-tab-button tab="sports">
        <ion-icon :icon="americanFootball"/>
        Sports
      </ion-tab-button>
      <ion-tab-button tab="social">
        <ion-icon :icon="beer"/>
        Social
      </ion-tab-button>
      <ion-tab-button tab="location">
        <ion-icon :icon="compass"/>
        Location Based
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script lang="ts" setup>
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  modalController
} from "@ionic/vue";
import {addOutline, americanFootball, beer, compass, personCircle} from "ionicons/icons";
import {ThemeSelectorAPI} from "@/views/bingo-theme-selector/themeSelectorAPI";
import {onMounted, ref} from "vue";
import {GameTheme} from "@/views/mock-game-themes/mockGameThemes";


const api = new ThemeSelectorAPI();
const cancel = () => modalController.dismiss(null, "cancel");
const select = (value: number) => {
  modalController.dismiss(value, "select");
};

const themes = ref<GameTheme[]>([]);
const myGamesThemes = ref<GameTheme[]>([]);
const sportsThemes = ref<GameTheme[]>([]);
const socialThemes = ref<GameTheme[]>([]);
const locationThemes = ref<GameTheme[]>([]);

function getRandomThemes(source: GameTheme[], count: number) {
  return source.slice().sort(() => Math.random() - 0.5).slice(0, count);
}

onMounted(() => {
  themes.value = api.getThemes();
  myGamesThemes.value = getRandomThemes(themes.value, 3);
  sportsThemes.value = getRandomThemes(themes.value, 3);
  socialThemes.value = getRandomThemes(themes.value, 3);
  locationThemes.value = getRandomThemes(themes.value, 3);
});
</script>

<style>
.example-content {
  height: 100%;
}

.my-games-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-bottom: 56px;
}

.new-theme-btn {
  margin-top: auto;
}


</style>
