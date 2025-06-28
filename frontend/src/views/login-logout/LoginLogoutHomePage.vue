<template>
  <div>
    <p v-if="user">Logged in as: {{ user.name }}</p>
    <ion-button v-if="!loggedIn" @click="login">Log in</ion-button>
<!--    <ion-button v-else @click="logout">Log out</ion-button>-->
    <ion-button  @click="logout">Log out</ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { login, logout, getUser, isLoggedIn } from '@/services/auth';
import {
IonButton
} from "@ionic/vue";

const user = computed(() => getUser());
const loggedIn = computed(() => isLoggedIn());

</script>