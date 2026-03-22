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
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <div class="my-games-content">
            <ion-list lines="inset">
              <ion-item-sliding v-for="board in myBoards" :key="board._id">
                <ion-item :detail="false" button color="white" @click="select(board._id)">
                  <ion-label color="dark-green">
                    {{ board.name }}
                  </ion-label>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="warning" @click="editBoard(board)">
                    <ion-icon slot="start" :icon="createOutline"></ion-icon>
                    Edit
                  </ion-item-option>
                  <ion-item-option color="danger" @click="confirmDelete(board)">
                    <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                    Delete
                  </ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
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
    alertController,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonTitle,
    IonToolbar,
    modalController,
    toastController,
} from "@ionic/vue";
import {addOutline, americanFootball, beer, compass, createOutline, personCircle, trashOutline} from "ionicons/icons";
import {onMounted, ref} from "vue";
import {
    BingoBoard,
    BingoBoardAPI,
    LOCATION_CATEGORY,
    SOCIAL_CATEGORY,
    SPORTS_CATEGORY
} from "@/views/start-game-modal/BingoBoardAPI";
import AddEditNewBoardModal from "@/views/start-game-modal/AddEditNewBoardModal.vue";

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
};

const editBoard = async (board: BingoBoard) => {
    const modal = await modalController.create({
        component: AddEditNewBoardModal,
        componentProps: {
            editBoardId: board._id,
        },
    });
    await modal.present();

    const {role} = await modal.onWillDismiss();
    if (role === "saved") {
        await refreshBoards();
    }
};

const confirmDelete = async (board: BingoBoard) => {
    const alert = await alertController.create({
        header: 'Delete Board',
        message: `Are you sure you want to delete "${board.name}"? This cannot be undone.`,
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: async () => {
                    await deleteBoard(board);
                },
            },
        ],
    });
    await alert.present();
};

const deleteBoard = async (board: BingoBoard) => {
    try {
        await api.deleteBingoBoard(board._id);
        myBoards.value = myBoards.value.filter(b => b._id !== board._id);
        const toast = await toastController.create({
            message: 'Board deleted',
            duration: 2000,
            color: 'dusty-green',
        });
        await toast.present();
    } catch (error) {
        console.error('Error deleting board:', error);
        const toast = await toastController.create({
            message: 'Failed to delete board',
            duration: 2000,
            color: 'danger',
        });
        await toast.present();
    }
};

const refreshBoards = async () => {
    const allBoards = await api.getBingoBoards();
    myBoards.value = allBoards.filter(board => board.category == null);
    sportsBoards.value = allBoards.filter(board => board.category === SPORTS_CATEGORY);
    socialBoards.value = allBoards.filter(board => board.category === SOCIAL_CATEGORY);
    locationBoards.value = allBoards.filter(board => board.category === LOCATION_CATEGORY);
};

onMounted(async () => {
    await refreshBoards();
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
