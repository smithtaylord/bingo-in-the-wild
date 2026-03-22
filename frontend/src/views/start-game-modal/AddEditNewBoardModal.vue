<template>
  <ion-header>
    <ion-toolbar color="dusty-green">
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button
            color="light"
            :disabled="!isValid"
            @click="saveTheme"
        >
          Save
        </ion-button>
      </ion-buttons>
      <ion-title>{{ isEditing ? 'Edit Theme' : 'Create New Theme' }}</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content padding>
    <ion-list>
      <ion-item>
        <ion-input
            v-model="themeName"
            label="Theme Name"
            label-placement="stacked"
            placeholder="Enter theme name"
            :disabled="isEditing"
        ></ion-input>
      </ion-item>
      <ion-item>
        <ion-input
            v-model="currentItem"
            label="Add Bingo Items (minimum 24)"
            label-placement="stacked"
            placeholder="Enter item"
            @keyup.enter="addItem"
        ></ion-input>
        <ion-button slot="end" color="coral" @click="addItem">Enter</ion-button>
      </ion-item>
      <ion-item v-if="!isEditing">
        <ion-select
            v-model="sourceBoardId"
            label-placement="stacked"
            @ionChange="onSourceBoardSelected"
        >
          <div slot="label">
            Use an existing board as template
            <ion-text color="medium">(Optional)</ion-text>
          </div>
          <ion-select-option :value="null">-- Select a board --</ion-select-option>
          <ion-select-option v-for="board of availableBoards" :key="board._id" :value="board._id">
            {{ board.name }}
          </ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>
    <ion-list>
      <div class="ion-padding-horizontal d-flex align-items-baseline justify-content-between">
        <h4>Bingo Spaces</h4>
        <span>
          Count:
          <ion-text :color="itemCountValid ? 'dark-green' : 'danger'">
            {{ itemList.length }}
          </ion-text>
          <ion-text v-if="!itemCountValid" color="danger"> (need {{ 24 - itemList.length }} more)</ion-text>
        </span>
      </div>

      <ion-item-sliding v-if="freeSpace">
        <ion-item :detail="false" button color="white">
          <ion-label color="dark-green">
            <ion-icon :icon="star" color="warning"></ion-icon>
            Free Space: {{ freeSpace }}
          </ion-label>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="medium" @click="removeFreeSpace">
            <ion-icon slot="start" :icon="closeOutline"></ion-icon>
            Remove
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>

      <ion-item-sliding v-for="item in itemList" :key="item">
        <ion-item :detail="false" button color="white">
          <ion-label color="dark-green">{{ item }}</ion-label>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="warning" @click="markFreeSpace(item)">
            <ion-icon slot="start" :icon="star"></ion-icon>
            Free Space
          </ion-item-option>
          <ion-item-option color="danger" @click="deleteItem(item)">
            <ion-icon slot="start" :icon="trash"></ion-icon>
            Delete
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>

    <div v-if="errorMessage" class="ion-padding">
      <ion-text color="danger">{{ errorMessage }}</ion-text>
    </div>
  </ion-content>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTitle,
    IonToolbar,
    modalController,
    toastController,
} from "@ionic/vue";
import {computed, onMounted, Ref, ref} from "vue";
import {closeOutline, star, trash} from "ionicons/icons";
import {BingoBoard, BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";

const api = new BingoBoardAPI();
const cancel = () => modalController.dismiss(null, "cancel");

const props = defineProps<{
    editBoardId?: string;
}>();

const currentItem = ref<string>("");
const itemList = ref<string[]>([]);
const freeSpace = ref<string | null>(null);
const sourceBoardId = ref<string | null>(null);
const themeName = ref<string>("");
const errorMessage = ref<string>("");
const isLoading = ref<boolean>(false);

const boards: Ref<BingoBoard[]> = ref([]);

const isEditing = computed(() => !!props.editBoardId);
const itemCountValid = computed(() => itemList.value.length >= 24);
const isValid = computed(() => themeName.value.trim().length > 0 && itemCountValid.value && !isLoading.value);

const availableBoards = computed(() => {
    return boards.value.filter(board => board._id !== props.editBoardId);
});

const addItem = () => {
    const trimmedItem = currentItem.value.trim();
    if (trimmedItem && !itemList.value.includes(trimmedItem)) {
        itemList.value.push(trimmedItem);
        currentItem.value = "";
        errorMessage.value = "";
    }
};

const deleteItem = (item: string) => {
    itemList.value = itemList.value.filter(i => i !== item);
};

const markFreeSpace = (item: string) => {
    if (freeSpace.value != null) {
        itemList.value.push(freeSpace.value);
    }
    freeSpace.value = item;
    itemList.value = itemList.value.filter(i => i !== item);
};

const removeFreeSpace = () => {
    if (freeSpace.value != null) {
        itemList.value.push(freeSpace.value);
        freeSpace.value = null;
    }
};

const populateFromBoard = (board: BingoBoard) => {
    themeName.value = `${board.name} (Copy)`;
    itemList.value = [...board.items];
    freeSpace.value = board.freeSpace || null;
    sourceBoardId.value = null;
};

const onSourceBoardSelected = (event: CustomEvent) => {
    const selectedId = event.detail.value;
    if (selectedId) {
        const selectedBoard = boards.value.find(board => board._id === selectedId);
        if (selectedBoard) {
            populateFromBoard(selectedBoard);
        }
    }
};

const loadBoardForEditing = async () => {
    if (!props.editBoardId) return;

    const board = await api.getBingoBoardById(props.editBoardId);
    themeName.value = board.name;
    itemList.value = [...board.items];
    freeSpace.value = board.freeSpace || null;
};

const saveTheme = async () => {
    errorMessage.value = "";

    if (!themeName.value.trim()) {
        errorMessage.value = "Please enter a theme name";
        return;
    }

    if (itemList.value.length < 24) {
        errorMessage.value = `Please add at least ${24 - itemList.value.length} more items`;
        return;
    }

    isLoading.value = true;

    try {
        if (isEditing.value) {
            await api.updateBingoBoard(props.editBoardId!, {
                items: itemList.value,
                freeSpace: freeSpace.value,
            });
            const toast = await toastController.create({
                message: 'Board updated!',
                duration: 2000,
                color: 'dusty-green',
            });
            await toast.present();
        } else {
            await api.createBingoBoard({
                name: themeName.value.trim(),
                items: itemList.value,
                freeSpace: freeSpace.value || undefined,
            });
            const toast = await toastController.create({
                message: 'Board created!',
                duration: 2000,
                color: 'dusty-green',
            });
            await toast.present();
        }

        modalController.dismiss(null, "saved");
    } catch (error) {
        console.error('Error saving board:', error);
        errorMessage.value = error instanceof Error ? error.message : 'Failed to save board';
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    boards.value = await api.getBingoBoards();
    if (isEditing.value) {
        await loadBoardForEditing();
    }
});
</script>

<style scoped></style>
