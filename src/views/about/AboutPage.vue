<template>
  <ion-page class="page">
    <MenuPageHeader title="About" />
    <ion-content class="ion-padding">
      <!-- App Overview -->
      <ion-card color="white">
        <ion-card-header>
          <ion-card-title>
            <ion-text color="dark-green">
              <h2>Bingo in the Wild</h2>
            </ion-text>
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-text color="dark-green">
            <p>
              <strong>Bingo in the Wild</strong> is a lighthearted mobile game
              that brings the joy of people-watching to a new level. Pick a
              theme, mark off what you see, and challenge your friends to join
              in the fun — no sign-up required.
            </p>
            <br />
            <p>
              This app is designed to be quick, accessible, and fun for
              everyone. Whether you're at the ball game, brewery, or just
              walking around — there's always a game to play.
            </p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <!-- How to Play Section -->
      <ion-card color="white">
        <ion-card-header>
          <ion-card-title>
            <ion-text color="dark-green">
              <h5>How to Play</h5>
            </ion-text>
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-text color="dark-green">
            <ol style="padding-left: 1.25rem">
              <li>Select a theme that matches your surroundings.</li>
              <li>
                A unique bingo board will be generated with quirky prompts.
              </li>
              <li>Spot something that matches a square? Tap to mark it!</li>
              <li>Get 5 in a row — across, down, or diagonally — to win.</li>
              <li>Use List View for easier navigation.</li>
            </ol>
            <p>
              There’s no timer, no scoring — just pure observational fun.
              Whether you're solo or playing alongside friends, the wild is your
              bingo board.
            </p>
          </ion-text>
        </ion-card-content>
      </ion-card>

      <!-- Credits -->
      <ion-card color="white">
        <ion-card-header>
          <ion-card-title>
            <ion-text color="dark-green">
              <h5>Credits</h5>
            </ion-text>
          </ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-text color="dark-green">
            <p>Created with ❤️ by <strong>Taylor</strong>.</p>
            <p>v1.0.0 — MVP release</p>
          </ion-text>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonPage,
  IonText,
} from "@ionic/vue";
import MenuPageHeader from "@/views/menu/MenuPageHeader.vue";
</script>
