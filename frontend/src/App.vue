<template>
  <ion-app>
    <!-- Global Side Menu -->
    <Menu />
    <div>
      <ion-router-outlet id="main-content" />
    </div>
  </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import Menu from "@/views/menu/Menu.vue";
</script>
