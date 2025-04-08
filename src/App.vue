<template>
  <v-app :theme="theme">
    <v-main>
      <v-app-bar>
        <v-avatar class="ml-3" image="/fav.svg" :rounded="false"/>
        <v-app-bar-title>PDF Okuyucu</v-app-bar-title>
        <v-spacer/>
        <v-btn
            class="mr-2"
            @click="theme = (theme === 'light' ? 'dark' : 'light')"
            :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        />
      </v-app-bar>
      <v-container class="mt-4">
        <pdf-reader/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {ref} from "vue";
import PdfReader from "@/components/PdfReader.vue";

const theme = ref('dark');
</script>