<template>
  <ion-page>
    <MenuPageHeader title="Bingo in the Wild" />
    <ion-content>
      <div class="bingo-card-container">
        <ion-text class="ion-text-center" color="dark-green">
          <h4>Theme: {{ themeName }}</h4>
        </ion-text>

        <div class="bingo-grid ion-margin-bottom">
          <div v-for="letter in 'BINGO'" :key="letter" class="bingo-header">
            <div class="bingo-box-header">
              <h1>{{ letter }}</h1>
            </div>
          </div>
        </div>

        <div class="bingo-grid ion-margin-bottom">
          <div
            v-for="(cell, index) in flatBoard"
            :key="index"
            @click="toggleCell(cell.row, cell.col)"
            @touchcancel="cancelPress"
            @touchend="cancelPress"
            @touchstart="startPress($event, cell.label)"
          >
            <div :class="['bingo-box', { marked: cell.isMarked }]">
              <span class="bingo-cell-text">{{ cell.label }}</span>
            </div>
          </div>
        </div>

        <div
          class="justify-content-center align-items-center d-flex flex-column"
        >
          <ion-button
            class="bingo-page-button ion-margin-bottom"
            color="dusty-green"
            shape="round"
            @click="openListViewModal"
          >
            <ion-icon slot="start" :icon="list" />
            List View
          </ion-button>

          <ion-button
            class="bingo-page-button ion-margin-bottom"
            color="dusty-green"
            shape="round"
            @click="resetGame"
          >
            <ion-icon slot="start" :icon="trashBin" />
            Reset Game
          </ion-button>

          <ion-button
            class="bingo-page-button ion-margin-bottom"
            color="dusty-green"
            shape="round"
            @click="goHome"
          >
            <ion-icon slot="start" :icon="home" />
            Home
          </ion-button>
        </div>
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
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  IonText,
  onIonViewWillEnter,
  popoverController,
  toastController,
  useIonRouter,
} from "@ionic/vue";
import { home, list, trashBin, warning } from "ionicons/icons";
import { computed, Ref, ref, watch } from "vue";
import {
  addBoardToLocalStorage,
  BingoCell,
  checkWinner,
  clearBoard,
  removeBoardFromLocalStorage,
  retrieveBoardFromLocalStorage,
} from "@/views/bingo-game/bingoGameService";
import { BingoGameAPI } from "@/views/bingo-game/bingoGameAPI";
import BingoCellPopover from "@/views/bingo-game/BingoCellPopover.vue";
import BingoListOptionsModal from "@/views/bingo-game/BingoListOptionsModal.vue";
import MiniGrid from "@/views/bingo-game/MiniGrid.vue";
import JSConfetti from "js-confetti";
import MenuPageHeader from "@/views/menu/MenuPageHeader.vue";

const props = defineProps<{ id: string }>();
const ionRouter = useIonRouter();
const winner = ref<boolean>(false);
const board: Ref<BingoCell[][]> = ref([]);

const flatBoard = computed(() =>
  board.value.flatMap((row, rowIndex) =>
    row.map((cell, colIndex) => ({
      ...cell,
      row: rowIndex,
      col: colIndex,
    })),
  ),
);

const themeName = ref<string>();
const api = new BingoGameAPI();
const jsConfetti = new JSConfetti();

let pressTimer: number | null = null;
let currentPopover: HTMLIonPopoverElement | null = null;

const toggleCell = (rowIndex: number, colIndex: number) => {
  const cell = board.value[rowIndex][colIndex];
  cell.isMarked = !cell.isMarked;

  addBoardToLocalStorage(board.value);
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
      side: "top",
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

const resetGame = () => {
  removeBoardFromLocalStorage();
  clearBoard(board.value);
};
const goHome = () => {
  removeBoardFromLocalStorage();
  ionRouter.push({ name: "Home" });
};

const createBoard = async () => {
  const gameBoard: BingoCell[][] | null = api.createGameBoard(
    parseInt(props.id),
  );

  if (!gameBoard) {
    await invalidThemeId();
    return;
  }

  board.value = gameBoard;
};

const shuffleAndResetGame = async () => {
  resetGame();
  await createBoard();
};

const winningGameAlert = async () => {
  jsConfetti.addConfetti({
    confettiNumber: 500,
    confettiColors: [
      "#FF9F80", // true coral
      "#FFB38A", // light coral peach
      "#FF8C66", // vibrant coral-orange
      "#FFA07A", // salmony coral
      "#FFD0B3", // soft coral blush
      "#FFE3D5", // very pale coral/peach
    ],
  });
  const alert = await alertController.create({
    header: "BINGO!",
    subHeader: "Congratulations, you won!",
    buttons: [
      {
        text: "Home",
        cssClass: "bingo-alert-button",
        handler: () => goHome(),
      },
      {
        text: "Play again",
        cssClass: "bingo-alert-button",
        handler: () => shuffleAndResetGame(),
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

onIonViewWillEnter(async () => {
  themeName.value = api.getThemeName(parseInt(props.id));

  const savedGameBoard = retrieveBoardFromLocalStorage();
  if (savedGameBoard) {
    board.value = savedGameBoard;
    return;
  }

  await createBoard();
});

// List View
const isModalOpen = ref(false);

const openListViewModal = async () => {
  isModalOpen.value = true;
};

const handleCellToggled = ([rowIndex, colIndex]: number[]) => {
  toggleCell(rowIndex, colIndex);
};
</script>

<style>
.bingo-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  padding: 5px 10px;
  box-sizing: border-box;
}

.bingo-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bingo-box-header {
  background-color: var(--ion-color-dusty-green);
  color: var(--ion-color-white);
  font-size: 1.5rem;
  border-radius: 8px;
  text-shadow: 1px 1px 5px var(--ion-color-dark-green);
  box-shadow: 1px 1px 2px var(--ion-color-dark-green);
}

.bingo-box {
  background-color: var(--ion-color-white);
  color: var(--ion-color-dark-green);
  font-size: 0.75rem;
  text-wrap: auto;
  overflow-x: hidden;
  box-shadow: 1px 1px 2px var(--ion-color-dark-green);
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
  background-color: var(--ion-color-coral);
  color: var(--ion-color-white);
}

.bingo-page-button {
  width: 65vw;
}

.bingo-cell-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;

  white-space: normal;
  word-break: break-word;
  text-align: center;

  font-size: clamp(0.6rem, 1.5vw, 1rem); /* Slightly raised floor and ceiling */
  line-height: 1.25; /* Enough breathing room */
  max-height: calc(1.25em * 2); /* 2 lines max */
  padding: 0.1em; /* Prevent text from touching edges */
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

.bingo-alert-button {
  color: var(--ion-color-dark-green) !important;
}

.bingo-card-container {
  max-width: 600px;
  margin: auto;
}
</style>
