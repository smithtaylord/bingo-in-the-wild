<template>
  <ion-header>
    <ion-toolbar color="dusty-green">
      <ion-buttons slot="start">
        <ion-button color="medium" @click="cancel">Cancel</ion-button>
      </ion-buttons>
      <ion-buttons slot="end">
        <!--        TODO disable until valid-->
        <ion-button color="light" @click="saveTheme">Save</ion-button>
      </ion-buttons>
      <ion-title> Create New Theme</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content padding>
    <ion-list>
      <ion-item>
        <ion-input label="Theme Name" label-placement="stacked" placeholder="Enter theme name"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input v-model="currentItem" label="Add Bingo Items (minimum 24)" label-placement="stacked"
                   placeholder="Enter item"></ion-input>
        <ion-button slot="end" color="coral" @click="addItem">Enter</ion-button>
      </ion-item>
      <ion-item>
        <ion-select v-model="preSelectedBoardId" label-placement="stacked">
          <!--          TODO Can we change the colors of this?-->
          <div slot="label">Use an existing board
            <ion-text color="medium">(Optional)</ion-text>
          </div>
          <!--          TODO once this is live, this should group into categories-->
          <ion-select-option v-for="board of boards" :value="board._id">{{ board.name }}</ion-select-option>
        </ion-select>
      </ion-item>
    </ion-list>
    <ion-list>
      <div class="ion-padding-horizontal d-flex align-items-baseline justify-content-between">
        <h4>Bingo Spaces</h4>
        <span>Count: 
          <ion-text :color="itemList.length < 24 ? 'danger' :'dark-green'">{{ itemList.length }}</ion-text>
        </span>
      </div>

      <ion-item-sliding v-if="freeSpace">
        <ion-item
            :detail="false"
            button
            color="white">
          <ion-label color="dark-green">
            <ion-icon :icon="star" color="warning"></ion-icon>
            {{ freeSpace }}
          </ion-label>
        </ion-item>

        <ion-item-options side="end">
          <ion-item-option color="medium" @click="removeFreeSpace">
            <ion-icon slot="start" :icon="closeOutline"></ion-icon>
            Remove
          </ion-item-option>
        </ion-item-options>
      </ion-item-sliding>


      <ion-item-sliding v-for="item in itemList"
                        :key="item">
        <ion-item
            :detail="false"
            button
            color="white">
          <ion-label color="dark-green">
            <ion-icon v-if="freeSpace == item" :icon="star"></ion-icon>
            {{ item }}
          </ion-label>
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
  modalController
} from "@ionic/vue";
import {onMounted, Ref, ref, watch} from "vue";
import {closeOutline, star, trash} from "ionicons/icons";
import {BingoBoard, BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";
// TODO Hande adds and edits
// TODO Handle Validation - Must have a name, must have at least 24 items (if one is selected as the free space then you must have 25)
const api = new BingoBoardAPI();
const cancel = () => modalController.dismiss(null, "cancel");
// TODO make one ref Object
const select = (value: number) => {
  modalController.dismiss(value, "select");
};
const currentItem = ref<string>("");
const itemList = ref<string[]>([]);
const freeSpace = ref<string | null>(null);
const preSelectedBoardId = ref<string | null>(null);
const addItem = () => {
  itemList.value.push(currentItem.value);
  currentItem.value = "";
};

const deleteItem = (item: string) => {
  itemList.value = itemList.value.filter(i => i !== item);
};

const markFreeSpace = (item: string) => {
  // If the item is already the free space, move it back to the item list
  if (freeSpace.value != null) {
    itemList.value.push(freeSpace.value);
  }
  // Set selected item as free space and remove it from the item list
  freeSpace.value = item;
  itemList.value = itemList.value.filter(i => i !== item);

};
const removeFreeSpace = () => {
  if (freeSpace.value != null) {
    itemList.value.push(freeSpace.value);
    freeSpace.value = null;
  }
}
const boards: Ref<BingoBoard[]> = ref([]);
const saveTheme = () => {
  // TODO Implement save logic
  console.log('[SAVE THEME]')
  // // This should save the theme to the API and close the modal
  // const newTheme: GameTheme = {
  //   id: Date.now(), // Temporary ID, should be replaced with actual ID from API
  //   name: "New Theme", // This should be taken from the input field
  //   items: itemList.value,
  //   freeSpace: freeSpace.value,
  // };
  // api.saveTheme(newTheme);
  // modalController.dismiss(newTheme, "save");
};


watch(() => preSelectedBoardId.value, () => {
  if (preSelectedBoardId.value) {
    const selectedBoard: BingoBoard | undefined = boards.value.find(board => board._id === preSelectedBoardId.value);
    if (selectedBoard) {
      itemList.value = [...selectedBoard.items];
      freeSpace.value = selectedBoard.freeSpace || null;
    }
  }
})

onMounted(async () => {
  boards.value = await api.getBingoBoards();
});

</script>

<style scoped></style>