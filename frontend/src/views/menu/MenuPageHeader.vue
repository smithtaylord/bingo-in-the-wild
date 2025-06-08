<template>
  <ion-header>
    <ion-toolbar color="minty-green">
      <ion-buttons slot="start">
        <ion-menu-button color="dark-green" />
      </ion-buttons>
      <ion-title color="dark-green">
        <h3>{{ title }}</h3>
      </ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script lang="ts" setup>
import {
  IonButtons,
  IonHeader,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";

defineProps<{ title: string }>();
</script>
