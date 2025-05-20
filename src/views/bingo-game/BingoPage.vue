<template>
  <ion-page>
    <ion-header>
      <ion-buttons slot="start">
        <ion-button class="ion-padding" color="dark-green">
          <ion-icon :icon="menu" />
        </ion-button>
      </ion-buttons>
    </ion-header>
    <ion-content>
      <ion-text class="ion-text-center" color="dark-green">
        <h4>Theme: {{ themeName }}</h4>
      </ion-text>

      <ion-grid class="bingo-grid ion-margin-bottom">
        <ion-row class="ion-justify-content-center">
          <ion-col
            v-for="letter in 'BINGO'"
            :key="letter"
            class="bingo-header"
            size="2"
          >
            <div class="bingo-box-header">
              <h1>{{ letter }}</h1>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-grid class="ion-margin-vertical">
        <ion-row
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          class="ion-justify-content-center"
        >
          <ion-col
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            :class="{ marked: cell.isMarked }"
            class="bingo-cell"
            size="2"
            @click="toggleCell(rowIndex, colIndex)"
            @mouseenter="showPopoverHover($event, cell.label)"
            @mouseleave="hidePopoverHover"
            @touchcancel="cancelPress"
            @touchend="cancelPress"
            @touchstart="startPress($event, cell.label)"
          >
            <div class="bingo-box">
              <span class="bingo-cell-text">{{ cell.label }}</span>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="justify-content-center align-items-center d-flex flex-column">
        <ion-button
          class="bingo-page-button ion-margin-bottom"
          color="salmon"
          shape="round"
          @click="openListViewModal"
        >
          <ion-icon slot="start" :icon="list"></ion-icon>
          List View
        </ion-button>

        <ion-button
          class="bingo-page-button ion-margin-bottom"
          color="salmon"
          shape="round"
          @click="resetGame"
        >
          <ion-icon slot="start" :icon="trashBin"></ion-icon>
          Reset Game
        </ion-button>

        <ion-button
          class="bingo-page-button ion-margin-bottom"
          color="salmon"
          shape="round"
          @click="goHome"
        >
          <ion-icon slot="start" :icon="home"></ion-icon>
          Home
        </ion-button>
      </div>
    </ion-content>

    <ion-modal
      :breakpoints="[0, 1]"
      :initial-breakpoint="1"
      :is-open="isModalOpen"
      class="bingo-list-modal"
      @didDismiss="isModalOpen = false"
    >
      <BingoListOptionsModal :board="board" @cell-toggled="handleCellToggled" />
    </ion-modal>
    <MiniGrid v-if="isModalOpen" :board="board" class="mini-grid" />
  </ion-page>
</template>

<script lang="ts" setup>
import {
  alertController,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonRow,
  IonText,
  popoverController,
  toastController,
} from "@ionic/vue";
import { home, list, menu, trashBin, warning } from "ionicons/icons";
import { onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  BingoCell,
  checkWinner,
  clearBoard,
} from "@/views/bingo-game/bingoGameService";
import { BingoGameAPI } from "@/views/bingo-game/bingoGameAPI";
import BingoCellPopover from "@/views/bingo-game/BingoCellPopover.vue";
import BingoListOptionsModal from "@/views/bingo-game/BingoListOptionsModal.vue";
import MiniGrid from "@/views/bingo-game/MiniGrid.vue";

const props = defineProps<{ id: string }>();
const router = useRouter();
const winner = ref<boolean>(false);
const board: Ref<BingoCell[][]> = ref([]);
const themeName = ref<string>();
const api = new BingoGameAPI();

let pressTimer: number | null = null;
let currentPopover: HTMLIonPopoverElement | null = null;

const toggleCell = (rowIndex: number, colIndex: number) => {
  const cell = board.value[rowIndex][colIndex];
  cell.isMarked = !cell.isMarked;
};

const startPress = (event: Event, label: string) => {
  cancelPress(); // Clear any previous timer

  pressTimer = window.setTimeout(async () => {
    const popover = await popoverController.create({
      component: BingoCellPopover,
      componentProps: { label },
      event,
      cssClass: "bingo-cell-popover-wrapper",
      arrow: false,
    });
    currentPopover = popover;
    await popover.present();
  }, 500);
};

const cancelPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

const showPopoverHover = async (event: Event, label: string) => {
  // Only show on non-touch devices ideally — so maybe check window.matchMedia here
  if ("ontouchstart" in window) return; // skip on touch devices

  const popover = await popoverController.create({
    component: BingoCellPopover,
    componentProps: { label },
    event,
    cssClass: "bingo-cell-popover-wrapper",
    arrow: false,
  });
  currentPopover = popover;
  await popover.present();
};

const hidePopoverHover = async () => {
  if (currentPopover) {
    await currentPopover.dismiss();
    currentPopover = null;
  }
};

const resetGame = () => {
  clearBoard(board.value);
};
const goHome = () => {
  router.push({ name: "Home" });
};

const winningGameAlert = async () => {
  const alert = await alertController.create({
    header: "BINGO!",
    subHeader: "Congratulations, you won!",
    buttons: [
      {
        text: "Home",
        handler: () => goHome(),
      },
      {
        text: "Rest Game",
        handler: () => resetGame(),
      },
    ],
  });

  await alert.present();
};

const invalidThemeId = async () => {
  const toast = await toastController.create({
    message: "Invalid theme!",
    duration: 2500,
    position: "middle",
    icon: warning,
  });

  await toast.present();
  goHome();
};

watch(
  () => board.value,
  () => {
    winner.value = checkWinner(board.value);
  },
  { deep: true },
);

watch(
  () => winner.value,
  async () => {
    if (winner.value) {
      await winningGameAlert();
    }
  },
);

onMounted(async () => {
  themeName.value = api.getThemeName(parseInt(props.id));
  const gameBoard: BingoCell[][] | null = api.createGameBoard(
    parseInt(props.id),
  );
  if (!gameBoard) {
    await invalidThemeId();
  } else {
    board.value = gameBoard;
  }
});

// List View
const isModalOpen = ref(false);

const openListViewModal = async () => {
  isModalOpen.value = true;
};

const handleCellToggled = ([rowIndex, colIndex]) => {
  toggleCell(rowIndex, colIndex);
};
</script>

<style>
.bingo-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bingo-box-header {
  background-color: var(--ion-color-salmon);
  color: var(--ion-color-white);
  font-size: 1.5rem;
  border-radius: 8px;
}

.bingo-box {
  background-color: var(--ion-color-white);
  color: var(--ion-color-dark-green);
  font-size: 0.75rem;
  text-wrap: auto;
  overflow-x: hidden;
}

.bingo-box,
.bingo-box-header {
  aspect-ratio: 1 / 1; /* Makes it square */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid white;
}

.marked {
  background-color: var(--ion-color-salmon);
  color: var(--ion-color-white);
}

.bingo-page-button {
  width: 65vw;
}

.bingo-cell-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  max-height: 2.4em;
}

.bingo-cell-popover-wrapper {
  --width: 33vw;
  --height: 33vw;
  --border-radius: 0;
  --box-shadow: 2px 2px 4px #000;
  --background: white;
}

.bingo-list-modal {
  --height: 66vh;
}

.mini-grid {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
  background-color: white;
  padding: 4px;
  border-radius: 4px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
  transform-origin: top right;
  pointer-events: none;
}
</style>
