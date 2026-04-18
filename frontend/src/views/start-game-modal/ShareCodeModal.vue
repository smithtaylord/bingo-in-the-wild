<template>
  <ion-header>
    <ion-toolbar color="dusty-green">
      <ion-buttons slot="end">
        <ion-button color="medium" @click="close">Close</ion-button>
      </ion-buttons>
      <ion-title>Share Game</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content padding>
    <div class="share-content">
      <p class="share-label">Share this code with friends:</p>

      <div class="code-display">
        <span class="share-code">{{ localShareCode }}</span>
      </div>

      <ion-button expand="block" color="coral" @click="copyCode">
        <ion-icon :icon="copyOutline" slot="start"></ion-icon>
        Copy Code
      </ion-button>

      <template v-if="isOwner">
        <p class="expiry-text">
          Expires in {{ timeRemaining }}
        </p>

        <div class="small-buttons">
          <ion-button size="small" color="medium" fill="outline" @click="regenerateCode">
            <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
            Regenerate
          </ion-button>

          <ion-button size="small" color="danger" fill="outline" @click="disableSharing">
            <ion-icon slot="start" :icon="closeOutline"></ion-icon>
            Disable
          </ion-button>
        </div>
      </template>
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
    IonTitle,
    IonToolbar,
    modalController,
} from "@ionic/vue";
import {closeOutline, copyOutline, refreshOutline} from "ionicons/icons";
import {onMounted, onUnmounted, ref} from "vue";
import {BingoBoardAPI} from "@/views/start-game-modal/BingoBoardAPI";
import {showError, showSuccess} from "@/services/toast";

const api = new BingoBoardAPI();

const props = defineProps<{
    boardId: string;
    shareCode: string;
    expiresAt: string;
    isOwner?: boolean;
}>();

const localShareCode = ref(props.shareCode);
const localExpiresAt = ref(props.expiresAt);

const emit = defineEmits<{
    (e: 'codeRegenerated', code: string, expiresAt: string): void;
    (e: 'codeDisabled'): void;
}>();

const close = () => modalController.dismiss(null, "cancel");

const calculateTimeRemaining = () => {
    const expires = new Date(localExpiresAt.value);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) {
        return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

const timeRemaining = ref<string>(calculateTimeRemaining());
let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    intervalId = setInterval(() => {
        timeRemaining.value = calculateTimeRemaining();
    }, 60000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});

const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(localShareCode.value);
        showSuccess('Code copied to clipboard!');
    } catch (error) {
        showError('Failed to copy code');
    }
};

const regenerateCode = async () => {
    try {
        const result = await api.generateShareCode(props.boardId);
        localShareCode.value = result.shareCode;
        localExpiresAt.value = result.expiresAt;
        timeRemaining.value = calculateTimeRemaining();
        emit('codeRegenerated', result.shareCode, result.expiresAt);
        showSuccess('New share code generated!');
        await modalController.dismiss({shareCode: result.shareCode, expiresAt: result.expiresAt}, "confirm");
    } catch (error) {
        console.error('Error regenerating code:', error);
        showError(error instanceof Error ? error.message : 'Failed to regenerate code');
    }
};

const disableSharing = async () => {
    try {
        await api.disableShareCode(props.boardId);
        emit('codeDisabled');
        await modalController.dismiss({action: 'disabled'}, "confirm");
    } catch (error) {
        console.error('Error disabling share:', error);
        showError(error instanceof Error ? error.message : 'Failed to disable sharing');
    }
};
</script>

<style scoped>
.share-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1.5rem 0;
}

.share-label {
    text-align: center;
    color: var(--ion-color-dark-green);
    font-size: 1.1rem;
    margin: 0;
    font-family: 'Fredoka', sans-serif;
}

.code-display {
    background: linear-gradient(135deg, var(--ion-color-dark-green), var(--ion-color-dark-green-shade));
    padding: 1.5rem 1rem;
    border-radius: var(--radius-lg);
    text-align: center;
    margin: 0.5rem 1rem;
    box-shadow: var(--shadow-md);
}

.share-code {
    font-size: 2rem;
    font-weight: bold;
    color: var(--ion-color-dark-green-contrast);
    letter-spacing: 0.2em;
    white-space: nowrap;
}

.expiry-text {
    text-align: center;
    color: var(--ion-color-dark-green);
    margin: 0;
    opacity: 0.7;
    font-size: 0.85rem;
}

.share-content > ion-button {
    margin-left: 1rem;
    margin-right: 1rem;
}

.small-buttons {
    display: flex;
    gap: 0.75rem;
    padding: 0 1rem;
}

.small-buttons ion-button {
    flex: 1;
}
</style>
