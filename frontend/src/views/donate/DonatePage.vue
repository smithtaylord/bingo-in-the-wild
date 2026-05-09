<template>
  <ion-page class="page">
    <MenuPageHeader title="Donate" />
    <ion-content class="ion-padding">
      <div class="donate-container">

        <div class="donate-hero">
          <ion-icon :icon="heartOutline" class="donate-icon" color="coral" />
          <ion-text color="dark-green">
            <h1 class="donate-title">Support This App</h1>
            <p class="donate-subtitle">So the server doesn't ghost you</p>
          </ion-text>
        </div>

        <a
          :href="`https://venmo.com/${VENMO_USERNAME}`"
          target="_blank"
          rel="noopener noreferrer"
          class="donate-btn"
        >
          <ion-button color="coral" shape="round" size="large" expand="block">
            <ion-icon slot="start" :icon="cashOutline" />
            Donate via Venmo
          </ion-button>
        </a>

        <ion-card color="white">
          <ion-card-content>
            <ion-text color="dark-green">
              <p>
                You made it to this page, which means you've probably stared
                at a loading screen long enough to question your life choices.
                Fair enough — the server is running on the free tier and it
                shows.
              </p>
              <p>
                If this app has brought you any joy (or at least distracted you
                at a ball game), consider chipping in. Everything goes straight
                to hosting costs. No yacht fund here.
              </p>
            </ion-text>
          </ion-card-content>
        </ion-card>

        <ion-card color="white">
          <ion-card-header>
            <ion-card-title>
              <ion-text color="dark-green">
                <h5>Where it goes</h5>
              </ion-text>
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-text color="dark-green">
              <ul class="donation-list">
                <li>A server that doesn't need a minute to wake up</li>
                <li>A database that doesn't occasionally ghost you</li>
                <li>Keeping the whole thing free for everyone else</li>
              </ul>
            </ion-text>
          </ion-card-content>
        </ion-card>

        <ion-button
          color="dusty-green"
          fill="outline"
          shape="round"
          size="default"
          @click="goHome"
          class="back-btn"
        >
          <ion-icon slot="start" :icon="arrowBackOutline" />
          Back to Bingo
        </ion-button>

      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonPage,
    IonText,
} from '@ionic/vue';
import {arrowBackOutline, cashOutline, heartOutline} from 'ionicons/icons';
import MenuPageHeader from '@/views/menu/MenuPageHeader.vue';
import {useIonRouter} from '@ionic/vue';

const ionRouter = useIonRouter();
const VENMO_USERNAME = 'Taylor-Smith-698';

const goHome = () => {
    ionRouter.push('/home');
};
</script>

<style scoped>
.donate-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100%;
    gap: 1.25rem;
    padding-bottom: 3rem;
}

.donate-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 0 0.5rem;
}

.donate-icon {
    font-size: 64px;
}

.donate-title {
    font-weight: bolder;
    font-size: 2rem;
    margin: 0;
    text-align: center;
    letter-spacing: -0.01em;
}

.donate-subtitle {
    font-family: 'Poppins', sans-serif;
    font-size: 0.95rem;
    color: var(--ion-color-dark-green);
    opacity: 0.6;
    margin: 0;
    text-align: center;
}

.donate-btn {
    width: 100%;
    max-width: 500px;
    text-decoration: none;
    margin-top: 0.5rem;
}

.donate-container ion-card {
    width: 100%;
    max-width: 500px;
    --border-radius: var(--radius-lg);
    margin: 0;
}

.donate-container ion-card + ion-card {
    margin-top: 0.75rem;
}

ion-card-header {
    padding-bottom: 0.25rem;
}

ion-card-content {
    padding-top: 0.25rem;
}

ion-card-title h5 {
    font-family: 'Fredoka', sans-serif;
    font-size: 1.1rem;
    margin: 0;
}

ion-text p {
    line-height: 1.7;
}

ion-text p + p {
    margin-top: 0.75rem;
}

.donation-list {
    padding-left: 1.25rem;
    line-height: 2;
}

.back-btn {
    margin-top: 1rem;
    --border-width: 1.5px;
    --box-shadow: none;
}

.back-btn ion-icon {
    margin-right: 6px;
}
</style>