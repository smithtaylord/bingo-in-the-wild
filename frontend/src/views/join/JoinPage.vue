<template>
  <ion-page>
    <ion-content class="ion-padding" fullscreen>
      <div class="join-loading">
        <ion-spinner name="crescent" />
        <ion-text color="dark-green">
          <p>Joining game...</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {IonContent, IonPage, IonSpinner, IonText, useIonRouter} from "@ionic/vue";
import {onIonViewDidEnter} from "@ionic/vue";
import {useRoute} from "vue-router";
import {BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";
import {removeBoardFromLocalStorage} from "@/views/bingo-game/bingoGameService";
import {showError} from "@/services/toast";

const route = useRoute();
const ionRouter = useIonRouter();
const api = new BingoBoardAPI();

onIonViewDidEnter(async () => {
  const code = route.params.code as string;

  if (!code || code.length !== 6) {
    showError('Invalid share link');
    ionRouter.replace({name: "Home"});
    return;
  }

  try {
    const board = await api.getBoardByShareCode(code);
    removeBoardFromLocalStorage();
    ionRouter.replace(`/bingo/${board._id}?code=${board.shareCode}`);
  } catch {
    showError('Invalid or expired share link');
    ionRouter.replace({name: "Home"});
  }
});
</script>

<style scoped>
.join-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
}

.join-loading p {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

ion-spinner {
  width: 48px;
  height: 48px;
}
</style>