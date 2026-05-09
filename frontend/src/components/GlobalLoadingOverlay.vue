<template>
  <teleport to="body">
    <div v-if="isLoadingOverlay" class="loading-overlay">
      <div class="loading-card nature-card">
        <ion-spinner name="crescent" color="dark-green" />
        <p class="loading-message">{{ loadingMessage }}</p>
        <a class="donate-btn" @click="goToDonate">
          <ion-icon :icon="heartOutline" size="small" />
          Help speed this up
        </a>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import {IonIcon, IonSpinner, modalController, useIonRouter} from '@ionic/vue';
import {heartOutline} from 'ionicons/icons';
import {getIsLoadingOverlay, getLoadingMessage} from '@/services/loading';

const isLoadingOverlay = getIsLoadingOverlay();
const loadingMessage = getLoadingMessage();
const ionRouter = useIonRouter();

const goToDonate = async () => {
    try {
        await modalController.dismiss();
    } catch {
        // no modal open, that's fine
    }
    ionRouter.push('/donate');
};
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(43, 58, 45, 0.5);
    backdrop-filter: blur(2px);
}

.loading-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1.5rem;
    max-width: 320px;
    text-align: center;
}

.loading-card ion-spinner {
    width: 48px;
    height: 48px;
}

.loading-message {
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    color: var(--ion-color-dark-green);
    line-height: 1.5;
    margin: 0;
}

.donate-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.55rem 1.25rem;
    font-family: 'Poppins', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #000;
    background: var(--ion-color-coral);
    border: none;
    border-radius: var(--radius-xl);
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.1s ease;
    box-shadow: var(--shadow-sm);
}

.donate-btn:hover {
    opacity: 0.9;
}

.donate-btn:active {
    transform: scale(0.97);
}
</style>