<template>
  <ion-tabs class="h-100">
    <ion-tab tab="my-games">
      <div id="my-games-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-buttons slot="start">
              <ion-button color="light" @click="cancel">Cancel</ion-button>
            </ion-buttons>
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
                  v-for="board in myBoards"
                  :key="board._id"
                  :detail="false"
                  button
                  color="white"
              >
                <ion-label color="dark-green" @click="select(board._id)">
                  {{ board.name }}
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-button
                class="new-board-btn"
                color="coral"
                expand="block"
                @click="createNewBoard"
            >
              <ion-icon slot="start" :icon="addOutline" size="large"/>
              Create A New Board
            </ion-button>
          </div>

        </ion-content>
      </div>
    </ion-tab>

    <ion-tab tab="sports">
      <div id="sports-page" class="example-content">
        <ion-header>
          <ion-toolbar color="dusty-green">
            <ion-title>Sports Boards</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="board in sportsBoards"
                :key="board._id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(board._id)">
                {{ board.name }}
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
            <ion-title>Social Boards</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="board in socialBoards"
                :key="board._id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(board._id)">
                {{ board.name }}
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
            <ion-title>Location Based Boards</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <ion-list lines="inset">
            <ion-item
                v-for="board in locationBoards"
                :key="board._id"
                :detail="false"
                button
                color="white"
            >
              <ion-label color="dark-green" @click="select(board._id)">
                {{ board.name }}
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
  IonButtons,
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
import {onMounted, ref} from "vue";
import {
  BingoBoard,
  BingoBoardAPI,
  LOCATION_CATEGORY,
  SOCIAL_CATEGORY,
  SPORTS_CATEGORY
} from "@/views/start-game-modal/BingoBoardAPI";


const api = new BingoBoardAPI();
const cancel = () => modalController.dismiss(null, "cancel");
const select = (id: string) => {
  modalController.dismiss(id, "select");
};

const myBoards = ref<BingoBoard[]>([]);
const sportsBoards = ref<BingoBoard[]>([]);
const socialBoards = ref<BingoBoard[]>([]);
const locationBoards = ref<BingoBoard[]>([]);

const createNewBoard = () => {
  modalController.dismiss(null, "create-new-board");
}
onMounted(async () => {
  const allBoards = await api.getBingoBoards()
  myBoards.value = allBoards.filter(board => board.category == null)
  sportsBoards.value = allBoards.filter(board => board.category == SPORTS_CATEGORY)
  socialBoards.value = allBoards.filter(board => board.category == SOCIAL_CATEGORY)
  locationBoards.value = allBoards.filter(board => board.category == LOCATION_CATEGORY)
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

.new-board-btn {
  margin-top: auto;
}


</style>
