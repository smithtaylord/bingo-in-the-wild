<template>
  <ion-header>
    <ion-toolbar color="dusty-green">
      <ion-buttons slot="start">
        <ion-button @click="cancel">
            <ion-icon :icon="chevronBackOutline" />
          </ion-button>
      </ion-buttons>
      <ion-buttons slot="end">
        <ion-button
            color="dark-green"
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
            :spellcheck="true"
            autocapitalize="sentences"
            autocomplete="off"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-segment :value="isBulkMode ? 'bulk' : 'single'" @ionChange="onInputModeChange">
          <ion-segment-button value="single">
            <ion-label>Single</ion-label>
          </ion-segment-button>
          <ion-segment-button value="bulk">
            <ion-label>Bulk</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-item>

      <template v-if="!isBulkMode">
        <ion-item>
          <ion-input
              v-model="currentItem"
              label="Add Bingo Items (minimum 24)"
              label-placement="stacked"
              placeholder="Enter item"
              :spellcheck="true"
              autocapitalize="sentences"
              autocomplete="off"
              @keyup.enter="addItem"
          ></ion-input>
          <ion-button slot="end" color="coral" @click="addItem">Enter</ion-button>
        </ion-item>
      </template>

      <template v-else>
        <ion-item>
          <ion-textarea
              v-model="bulkInput"
              label="Add multiple items at once"
              label-placement="stacked"
              placeholder="Put each item on its own line:&#10;Touchdown&#10;Fumble&#10;Interception&#10;&#10;Or separate with commas:&#10;Touchdown, Fumble, Interception"
              :rows="8"
              :spellcheck="true"
              autocomplete="off"
          ></ion-textarea>
        </ion-item>
        <div class="bulk-add-row">
          <ion-button size="small" color="coral" @click="bulkAddItems">
            Add All Items
          </ion-button>
        </div>
      </template>

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
          <ion-select-option value="">-- Select a board --</ion-select-option>
          <ion-select-option v-for="board in availableBoards" :key="board._id" :value="board._id">
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

      <ion-note v-if="itemList.length > 0" class="swipe-hint" color="medium">
        <ion-icon :icon="arrowBackOutline" size="small"></ion-icon>
        Swipe left on an item for more options
      </ion-note>

      <ion-item-sliding v-if="freeSpace">
        <ion-item :detail="false" button color="white">
          <ion-label color="dark-green">
            <ion-icon :icon="star" color="warning"></ion-icon>
            Free Space: {{ freeSpace }}
          </ion-label>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="primary" @click="editFreeSpace">
            <ion-icon slot="start" :icon="createOutline"></ion-icon>
            Edit
          </ion-item-option>
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
          <ion-item-option color="primary" @click="editItem(item)">
            <ion-icon slot="start" :icon="createOutline"></ion-icon>
            Edit
          </ion-item-option>
          <ion-item-option color="danger" @click="deleteItem(item)">
            <ion-icon slot="start" :icon="trash"></ion-icon>
            Delete
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>


  </ion-content>
</template>

<script lang="ts" setup>
import {
    alertController,
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
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
    modalController,
} from "@ionic/vue";
import {arrowBackOutline, chevronBackOutline, closeOutline, createOutline, star, trash} from "ionicons/icons";
import {computed, onMounted, Ref, ref} from "vue";
import {BingoBoard, BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";
import {showError, showSuccess, showWarning} from "@/services/toast";
import {user} from "@/services/auth";

const api = new BingoBoardAPI();
const cancel = () => modalController.dismiss(null, "cancel");

const props = defineProps<{
    editBoardId?: string;
}>();

const currentItem = ref<string>("");
const itemList = ref<string[]>([]);
const freeSpace = ref<string | null>(null);
const sourceBoardId = ref<string>("");
const themeName = ref<string>("");
const isLoading = ref<boolean>(false);
const isBulkMode = ref<boolean>(false);
const bulkInput = ref<string>("");
const swipeHintDismissed = ref<boolean>(false);

const onInputModeChange = (event: CustomEvent) => {
    isBulkMode.value = event.detail.value === 'bulk';
};

const boards: Ref<BingoBoard[]> = ref([]);

const isEditing = computed(() => !!props.editBoardId);
const itemCountValid = computed(() => itemList.value.length >= 24);
const isValid = computed(() => themeName.value.trim().length > 0 && itemCountValid.value && !isLoading.value);

const availableBoards = computed(() => {
    return boards.value.filter(board => board._id !== props.editBoardId);
});

const addItem = () => {
    const trimmedItem = currentItem.value.trim();
    if (!trimmedItem) {
        return;
    }
    if (itemList.value.some(item => item.toLowerCase() === trimmedItem.toLowerCase())) {
        showError('This item already exists');
        return;
    }
    if (!itemList.value.includes(trimmedItem)) {
        itemList.value.push(trimmedItem);
        currentItem.value = "";
    }
};

const bulkAddItems = () => {
    if (!bulkInput.value.trim()) {
        return;
    }

    const newItems = bulkInput.value
        .split(/[,\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);

    if (newItems.length === 0) {
        return;
    }

    let addedCount = 0;
    let duplicateCount = 0;

    for (const item of newItems) {
        const isDuplicate = itemList.value.some(
            existing => existing.toLowerCase() === item.toLowerCase()
        );
        if (!isDuplicate) {
            itemList.value.push(item);
            addedCount++;
        } else {
            duplicateCount++;
        }
    }

    if (addedCount > 0) {
        const message = duplicateCount > 0
            ? `Added ${addedCount} item(s). ${duplicateCount} duplicate(s) skipped.`
            : `Added ${addedCount} item(s).`;
        showSuccess(message);
    } else {
        showWarning(`All ${duplicateCount} items are duplicates.`);
    }

    bulkInput.value = "";
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

const editItem = async (item: string) => {
    const alert = await alertController.create({
        header: 'Edit Item',
        inputs: [
            {
                name: 'newLabel',
                value: item,
                placeholder: 'Enter new text',
            },
        ],
        buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
                text: 'Save',
                handler: (data) => {
                    const trimmed = (data.newLabel || '').trim();
                    if (!trimmed) return false;
                    const isDuplicate = itemList.value.some(
                        existing => existing !== item && existing.toLowerCase() === trimmed.toLowerCase()
                    );
                    if (isDuplicate) {
                        showError('This item already exists');
                        return false;
                    }
                    const index = itemList.value.indexOf(item);
                    if (index !== -1) {
                        itemList.value[index] = trimmed;
                    }
                },
            },
        ],
    });
    await alert.present();
};

const editFreeSpace = async () => {
    if (!freeSpace.value) return;
    const alert = await alertController.create({
        header: 'Edit Free Space',
        inputs: [
            {
                name: 'newLabel',
                value: freeSpace.value,
                placeholder: 'Enter new text',
            },
        ],
        buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
                text: 'Save',
                handler: (data) => {
                    const trimmed = (data.newLabel || '').trim();
                    if (!trimmed) return false;
                    freeSpace.value = trimmed;
                },
            },
        ],
    });
    await alert.present();
};

const populateFromBoard = (board: BingoBoard) => {
    themeName.value = `${board.name} (Copy)`;
    itemList.value = [...board.items];
    freeSpace.value = board.freeSpace || null;
    sourceBoardId.value = "";
};

const onSourceBoardSelected = async (event: CustomEvent) => {
    const selectedId = event.detail.value;
    if (selectedId) {
        try {
            const selectedBoard = await api.getBingoBoardById(selectedId);
            if (selectedBoard) {
                populateFromBoard(selectedBoard);
            }
        } catch (error) {
            console.error('Error loading template board:', error);
            showError('Failed to load template board');
        }
    }
};

const loadBoardForEditing = async () => {
    if (!props.editBoardId) return;

    try {
        const board = await api.getBingoBoardById(props.editBoardId);
        themeName.value = board.name;
        itemList.value = [...board.items];
        freeSpace.value = board.freeSpace || null;
    } catch (error) {
        console.error('Error loading board for editing:', error);
        showError('Failed to load board for editing');
        modalController.dismiss(null, "cancel");
    }
};

const saveTheme = async () => {
    if (!themeName.value.trim()) {
        showError("Please enter a theme name");
        return;
    }

    if (itemList.value.length < 24) {
        showError(`Please add at least ${24 - itemList.value.length} more items`);
        return;
    }

    isLoading.value = true;

    try {
        if (isEditing.value) {
            await api.updateBingoBoard(props.editBoardId!, {
                items: itemList.value,
                freeSpace: freeSpace.value,
            });
            showSuccess('Board updated!');
        } else {
            await api.createBingoBoard({
                name: themeName.value.trim(),
                items: itemList.value,
                freeSpace: freeSpace.value || undefined,
            });
            showSuccess('Board created!');
        }

        modalController.dismiss(null, "saved");
    } catch (error) {
        console.error('Error saving board:', error);
        showError(error instanceof Error ? error.message : 'Failed to save board');
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    try {
        const [publicBoards, userBoards] = await Promise.all([
            api.getBingoBoards(),
            user.value?.sub ? api.getBingoBoardsByUser(user.value.sub) : Promise.resolve([])
        ]);

        const boardMap = new Map<string, BingoBoard>();
        [...publicBoards, ...userBoards].forEach(board => {
            boardMap.set(board._id, board);
        });
        boards.value = Array.from(boardMap.values());
    } catch (error) {
        console.error('Error loading boards:', error);
        showError('Failed to load boards');
    }

    if (isEditing.value) {
        await loadBoardForEditing();
    }
});
</script>

<style scoped>
.swipe-hint {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

ion-input,
ion-textarea {
    --background: #FFFFFF;
    --color: #2B3A2D;
    --placeholder-color: #888888;
}

ion-segment {
    --background: #FFFFFF;
}

ion-segment-button {
    --color: var(--ion-color-dark-green);
    --color-checked: #FFFFFF;
    --background-checked: var(--ion-color-dark-green);
    --indicator-color: var(--ion-color-dark-green);
    font-weight: 600;
}

.bulk-add-row {
    display: flex;
    justify-content: flex-end;
    padding: 8px 16px;
}

ion-toolbar ion-button {
    --color: #2B3A2D;
    --color-hover: #1a231b;
    font-weight: 700;
}
</style>
