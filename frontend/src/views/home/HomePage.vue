<template>
  <ion-page>
    <MenuPageHeader title="Home"/>
    <ion-content class="ion-padding" fullscreen>
      <div
          class="home-container"
      >
        <div class="home-hero">
          <div class="leaf-row">
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

          <ion-text color="dark-green">
            <h1 class="home-title">Bingo in the Wild</h1>
            <p class="home-subtitle">Spot it. Mark it. Win it.</p>
          </ion-text>
        </div>

        <div class="home-actions">
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

          <ion-button
              v-if="!showJoinOptions"
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

          <div v-else class="join-code-section nature-card">
            <ion-text align="center" color="dark-green">
              <h5>Enter Code to Join Game</h5>
            </ion-text>

            <div class="otp-container">
              <ion-input-otp
                  v-model="joinCode"
                  type="text"
                  :length="6"
                  class="white-fill"
                  color="dark"
                  fill="solid"
              ></ion-input-otp>
            </div>

            <div class="join-btn-row">
              <ion-button
                  color="medium"
                  shape="round"
                  @click="toggleJoinOptions"
              >
                Cancel
              </ion-button>
              <ion-button
                  color="coral"
                  shape="round"
                  :disabled="joinCode.length !== 6 || isLoading"
                  @click="joinWithCode"
              >
                <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
                <span v-else>Join Game</span>
              </ion-button>
            </div>
          </div>

          <ion-button v-if="!loggedIn && !showJoinOptions"
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
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {IonButton, IonContent, IonIcon, IonInputOtp, IonPage, IonSpinner, IonText, modalController, useIonRouter} from "@ionic/vue";
import {addOutline, leafOutline, logInOutline, roseOutline, trophy} from "ionicons/icons";
import MenuPageHeader from "@/views/menu/MenuPageHeader.vue";
import {computed, ref} from "vue";
import {isLoggedIn, login} from "@/services/auth";
import {removeBoardFromLocalStorage} from "@/views/bingo-game/bingoGameService";
import StartGameModal from "@/views/start-game-modal/StartGameModal.vue";
import AddEditNewBoardModal from "@/views/start-game-modal/AddEditNewBoardModal.vue";
import {BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";
import {showError} from "@/services/toast";

const ionRouter = useIonRouter();
const loggedIn = computed(() => isLoggedIn());
const api = new BingoBoardAPI();

const showJoinOptions = ref<boolean>(false);
const joinCode = ref<string>("");
const isLoading = ref<boolean>(false);

const toggleJoinOptions = () => {
    showJoinOptions.value = !showJoinOptions.value;
    joinCode.value = "";
};

const startGame = async () => {
    const modal = await modalController.create({
        component: StartGameModal,
    });

    await modal.present();

    const {data, role} = await modal.onWillDismiss();

    if (role === "select") {
        removeBoardFromLocalStorage();
        const {id, shareCode} = data;
        if (shareCode) {
            ionRouter.push(`/bingo/${id}?code=${shareCode}`);
        } else {
            ionRouter.push({name: "Bingo", params: {id}});
        }
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

const joinWithCode = async () => {
    if (joinCode.value.length !== 6) {
        showError('Please enter a 6-character code');
        return;
    }

    isLoading.value = true;

    try {
        const board = await api.getBoardByShareCode(joinCode.value);
        removeBoardFromLocalStorage();
        ionRouter.push(`/bingo/${board._id}?code=${board.shareCode}`);
    } catch (error) {
        console.error('Error joining game:', error);
        showError('Invalid or expired code');
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.home-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    gap: 2.5rem;
}

.home-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.leaf-row {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.leaf-row ion-icon {
    font-size: 56px;
    filter: drop-shadow(0 2px 4px rgba(43, 58, 45, 0.15));
}

.home-title {
    font-weight: bolder;
    font-size: 32pt;
    margin: 0;
    letter-spacing: -0.01em;
}

.home-subtitle {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-size: 1rem;
    color: var(--ion-color-dark-green);
    opacity: 0.7;
    margin: 0;
    letter-spacing: 0.02em;
}

.home-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 0.625rem;
}

.home-btn {
    width: 80vw;
    max-width: 500px;
    --box-shadow: var(--shadow-md);
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

.join-code-section {
    width: 85vw;
    max-width: 500px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.join-code-section h5 {
    margin: 0;
    font-family: 'Fredoka', sans-serif;
}

.otp-container {
    width: 100%;
    margin-bottom: 0.5rem;
}

.input-otp-fill-solid.white-fill {
    --background: var(--ion-color-white);
    --border-color: var(--ion-color-dusty-green);
}

.join-btn-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
}

.join-btn-row ion-button {
    flex: 1;
}
</style>