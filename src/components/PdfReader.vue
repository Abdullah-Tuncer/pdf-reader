<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-file-input
            v-model="pdfReader.settings.selectedFile"
            @change="onFileChange"
            @click:clear="pdfReader.status.isReady = false"
            :loading="pdfReader.status.isLoading"
            :error-messages="pdfReader.status.error"
            :error="pdfReader.status.isErrorExist()"
            prepend-inner-icon="mdi-file-pdf-box"
            accept="application/pdf"
            label="Dosya Seç"
            prepend-icon=""
            clearable
            outlined
        />
        <v-alert
            v-if="pdfReader.status.isLoading"
            type="info"
            class="my-4"
            icon="mdi-progress-upload"
        >
          PDF yükleniyor, lütfen bekleyin...
        </v-alert>
        <v-card v-if="pdfReader.status.isReady" class="mt-4" elevation="1">
          <v-card-actions class="controls">
            <v-row align="center">
              <v-col cols="12">
                <v-btn
                    :color="pdfReader.status.isSpeaking ? 'error' : 'primary'"
                    @click="playPause"
                    :prepend-icon="pdfReader.status.isSpeaking ? 'mdi-pause' : 'mdi-play'"
                    :loading="pdfReader.status.isLoading"
                    variant="outlined"
                    block
                >
                  {{ pdfReader.status.isSpeaking ? 'Durdur' : 'Oku' }}
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-select
                    v-model="pdfReader.settings.selectedVoice"
                    :items="pdfReader.settings.voices"
                    :disabled="pdfReader.status.isSpeaking"
                    item-title="name"
                    item-value="id"
                    label="Ses Seçimi"
                    prepend-inner-icon="mdi-account-voice"
                    return-object
                    hide-details
                    outlined
                    dense
                >
                  <template v-slot:selection="{ props, item }: any">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        <v-chip class="mr-2" style="width: 65px; justify-content: center">
                          {{ item.raw.lang }}
                        </v-chip>
                        {{ item.raw.name }}
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:item="{ props, item }: any">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        <v-chip class="mr-2" style="width: 65px; justify-content: center">
                          {{ item.raw.lang }}
                        </v-chip>
                        {{ item.raw.name }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-number-input
                    v-model="pdfReader.startPage"
                    label="Başlangıç Sayfası"
                    controlVariant="split"
                    :disabled="pdfReader.status.isSpeaking"
                    :max="pdfReader.totalPages"
                    :min="1"
                    hide-details
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-number-input
                    v-model="pdfReader.settings.rate"
                    label="Okuma Hızı"
                    controlVariant="split"
                    :precision="1"
                    :disabled="pdfReader.status.isSpeaking"
                    :step="pdfReader.settings.STEP_RATE"
                    :min="pdfReader.settings.MIN_RATE"
                    :max="pdfReader.settings.MAX_RATE"
                    hide-details
                />
              </v-col>
            </v-row>
          </v-card-actions>
          <v-card-text v-if="showSlider">
            <v-progress-linear
                :model-value="pdfReader.currentPage"
                :max="pdfReader.totalPages"
                height="25"
                color="light-blue"
                striped
            >
              <template v-slot:default>
                <strong>İlerleme: {{ pdfReader.currentPage }}/{{ pdfReader.totalPages }}. sayfa</strong>
              </template>
            </v-progress-linear>
            <v-slider
                v-model="pdfReader.count"
                @mousedown="stopSpeech"
                @end="handleSliderChange"
                :max="pdfReader.range"
                :step="1"
            >
              <template #details>
                <v-spacer/>
                <span class="text-caption text-grey">{{ pdfReader.count }} / {{ pdfReader.range }}</span>
              </template>
            </v-slider>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {onMounted, watch, computed, reactive, onUnmounted} from 'vue';
import {PdfReader} from "@/classes/PdfReader.ts";

const pdfReader: PdfReader = reactive(new PdfReader());

onMounted(async () => {
  await pdfReader.initialize();
});

onUnmounted(() => {
  pdfReader.stopSpeech();
});

const onFileChange = async () => {
  await pdfReader.handleFileUpload();
}

const playPause = () => {
  pdfReader.toggleSpeech();
}

watch(() => pdfReader.startPage, (newVal) => {
  pdfReader.status.isReset = newVal != pdfReader.currentPage;
});

const showSlider = computed(() => {
  return pdfReader.status.isSpeaking || pdfReader.status.isPaused;
})

const handleSliderChange = (v: any) => {
  pdfReader.startSpeech(v);
}

const stopSpeech = () => {
  pdfReader.stopSpeech();
}
</script>