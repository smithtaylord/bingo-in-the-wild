<template>
  <ion-page>
    <MenuPageHeader title="Home"/>
    <ion-content class="ion-padding" fullscreen>
      <div
          class="d-flex flex-column justify-content-center align-items-center h-100"
      >
        <div class="ion-padding-bottom ion-margin-bottom">
          <ion-icon :icon="leafOutline"/>
          <ion-icon :icon="leafOutline" color="coral"/>
          <ion-icon :icon="roseOutline"/>
          <ion-icon
              :icon="leafOutline"
              color="coral"
              style="transform: scaleX(-1)"
          />
          <ion-icon :icon="leafOutline" style="transform: scaleX(-1)"/>
        </div>

        <ion-text class="ion-padding-top ion-margin-top" color="dark-green">
          <h1 class="home-title">Bingo in the Wild</h1>
        </ion-text>

        <ion-button
            class="home-btn"
            color="dusty-green"
            shape="round"
            size="large"
            @click="startGame"
        >
          <span class="align-left">
            <ion-icon slot="start" :icon="trophy" size="large"/>
            Start a New Game</span>
        </ion-button>

        <div v-if="showJoinOptions">
          <ion-text align="center" class="ion-padding-top ion-margin-top" color="dark-green">
            <h5>Enter Code to Join Game</h5>
          </ion-text>
          <ion-input-otp :length="6" class="white-fill" color="dark" fill="solid"></ion-input-otp>
          <div class="join-btn-container">
            <ion-button
                color="dark-green"
                shape="round"
                size="small"
                @click="joinGame"
            >
              <ion-icon slot="start" :icon="addOutline" size="small"/>
              Join
            </ion-button>
          </div>
        </div>

        <ion-button v-else
                    class="home-btn"
                    color="dusty-green"
                    shape="round"
                    size="large"
                    @click="toggleJoinOptions"
        >
          <span class="align-left">
            <ion-icon slot="start" :icon="addOutline" size="large"/>
            Join a Game</span>
        </ion-button>

        <ion-button v-if="!loggedIn"
                    class="home-btn"
                    color="coral"
                    shape="round"
                    size="large"
                    @click="login"
        >
          <span class="align-left">
            <ion-icon slot="start" :icon="logInOutline" size="large"/>
            Log in</span>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {IonButton, IonContent, IonIcon, IonInputOtp, IonPage, IonText, modalController, useIonRouter} from "@ionic/vue";
import {addOutline, leafOutline, logInOutline, roseOutline, trophy} from "ionicons/icons";
import MenuPageHeader from "@/views/menu/MenuPageHeader.vue";
import {computed, ref} from "vue";
import {isLoggedIn, login} from "@/services/auth";
import {removeBoardFromLocalStorage} from "@/views/bingo-game/bingoGameService";
import StartGameModal from "@/views/start-game-modal/StartGameModal.vue";
import AddEditNewBoardModal from "@/views/start-game-modal/AddEditNewBoardModal.vue";

const ionRouter = useIonRouter();
const loggedIn = computed(() => isLoggedIn());

const startGame = async () => {
    const modal = await modalController.create({
        component: StartGameModal,
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role === "select") {
        removeBoardFromLocalStorage();
        ionRouter.push({name: "Bingo", params: {id: data}});
        return;
    }

    if (role === "create-new-board") {
        const addEditModal = await modalController.create({
            component: AddEditNewBoardModal,
        });

        await addEditModal.present();

        const {role: editRole} = await addEditModal.onWillDismiss();
        if (editRole === "saved") {
            await startGame();
        }
    }
};

const showJoinOptions = ref<boolean>(false);
const toggleJoinOptions = () => {
    showJoinOptions.value = !showJoinOptions.value;
};

const joinGame = () => {
    console.log("Join game clicked");
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

.home-btn {
    width: 80vw;
    max-width: 500px;
    margin-bottom: 10px;
}

.home-btn ion-icon {
    margin-right: 16px;
    margin-left: 8px;
}

.align-left {
    text-align: left;
    width: 100%;
    display: flex;
    align-items: center;
}

.input-otp-fill-solid.white-fill {
    --background: white;
    --border-color: var(--ion-color-dark-green);
}

.join-btn-container {
    width: 100%;
    text-align: end;
}
</style>
