<template>
  <ion-app :class="`theme-${currentTheme}`">
    <div v-if="isLoading" class="auth-loading">
      <ion-spinner name="crescent" />
    </div>
    <template v-else>
      <Menu />
      <div>
        <ion-router-outlet id="main-content" />
      </div>
    </template>
  </ion-app>
</template>

<script lang="ts" setup>
import {IonApp, IonRouterOutlet, IonSpinner} from "@ionic/vue";
import {isLoading} from "@/services/auth";
import Menu from "@/views/menu/Menu.vue";
import {useTheme} from "@/services/theme";

const {currentTheme} = useTheme();
</script>

<style scoped>
.auth-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>