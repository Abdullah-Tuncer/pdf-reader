<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-file-input
            v-model="settings.selectedFile"
            @change="handleFileUpload"
            @click:clear="status.isReady = false"
            :loading="status.isLoading"
            :error-messages="status.error"
            :error="status.isErrorExist()"
            prepend-inner-icon="mdi-file-pdf-box"
            accept="application/pdf"
            label="Dosya Seç"
            prepend-icon=""
            clearable
            outlined
        />
        <v-alert
            v-if="status.isLoading"
            type="info"
            class="my-4"
            icon="mdi-progress-upload"
        >
          PDF yükleniyor, lütfen bekleyin...
        </v-alert>
        <v-card v-if="status.isReady" class="mt-4" elevation="1">
          <v-card-actions class="controls">
            <v-row align="center">
              <v-col cols="12">
                <v-btn
                    :color="status.isSpeaking ? 'error' : 'primary'"
                    @click="toggleSpeech"
                    :prepend-icon="status.isSpeaking ? 'mdi-pause' : 'mdi-play'"
                    :loading="status.isLoading"
                    variant="outlined"
                    block
                >
                  {{ status.isSpeaking ? 'Durdur' : 'Oku' }}
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-select
                    v-model="settings.selectedVoice"
                    :items="settings.voices"
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
                    v-model="startPage"
                    label="Başlangıç Sayfası"
                    controlVariant="split"
                    :disabled="status.isSpeaking"
                    :max="totalPages"
                    :min="1"
                    hide-details
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-number-input
                    v-model="settings.rate"
                    label="Okuma Hızı"
                    controlVariant="split"
                    :precision="1"
                    :step="settings.STEP_RATE"
                    :min="settings.MIN_RATE"
                    :max="settings.MAX_RATE"
                    hide-details
                />
              </v-col>
            </v-row>
          </v-card-actions>
          <v-card-text v-if="showSlider">
            <v-progress-linear
                :model-value="currentPage"
                :max="totalPages"
                height="25"
                color="light-blue"
                striped
            >
              <template v-slot:default>
                <strong>İlerleme: {{ currentPage }}/{{ totalPages }}. sayfa</strong>
              </template>
            </v-progress-linear>
            <v-slider
                v-model="count"
                @mousedown="stopSpeech"
                @end="handleSliderChange"
                :max="range"
                :step="1"
            >
              <template #details>
                <v-spacer/>
                <span class="text-caption text-grey">{{ count }} / {{ range }}</span>
              </template>
            </v-slider>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {ref, onMounted, watch, computed, reactive} from 'vue';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import {Status} from "@/classes/Status.ts";
import {Settings} from "@/classes/Settings.ts";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const status: Status = reactive(new Status());
const settings: Settings = reactive(new Settings());

// sayfalar duruma göre startpage kaldırılabilir
const startPage = ref(1);
const currentPage = ref(1);
const totalPages = ref(0);
// slider üzerinde değişiklik yapılan sayfa
const changedPage = ref<number | null>(null);

// silder için
const range = ref(1);
const count = ref(0);

let speech: SpeechSynthesisUtterance | null = null;
let fullText: string[] = [];
const currentText = ref('');

onMounted(async () => {
  await settings.loadVoices();
});

const handleFileUpload = async (file: File | null) => {
  if (!file) {
    status.error = "Lütfen burayı doldurun."
    return;
  }
  try {
    status.isLoading = true;
    status.error = "";
    const arrayBuffer = await (settings.selectedFile as File).arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    totalPages.value = pdf.numPages;

    fullText = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText.push(textContent.items.map((item: any) => item.str).join(' '));
    }
    status.isReady = true;
  } catch (err: any) {
    status.error = 'PDF okunurken hata oluştu: ' + err.message;
    status.isReady = false;
  } finally {
    status.isLoading = false;
  }
};

const stopSpeech = () => {
  window.speechSynthesis.cancel();
  status.isSpeaking = false;
  status.isPaused = true;
}

const showSlider = computed(() => {
  return status.isSpeaking || status.isPaused;
})

watch(startPage, (newVal) => {
  status.isReset = newVal != currentPage.value;
});

const handleSliderChange = (newVal: number) => {
  speech = new SpeechSynthesisUtterance();

  speech.text = currentText.value.substring(newVal);
  speech.voice = settings.selectedVoice?.value || null;
  speech.lang = settings.selectedVoice?.value?.lang || 'tr-TR';
  speech.rate = settings.rate;
  status.isSpeaking = true;
  status.isPaused = false;
  changedPage.value = currentPage.value as any;

  speech.onboundary = (event) => {
    if (changedPage.value === currentPage.value)
      count.value = newVal + event.charIndex;
    else
      count.value = event.charIndex;
  };

  speech.onend = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      currentText.value = fullText[currentPage.value - 1];
      if (speech) {
        speech.text = currentText.value;
        range.value = speech.text.length;
        window.speechSynthesis.speak(speech);
      }
    } else {
      status.isSpeaking = false;
      currentPage.value = startPage.value;
    }
    count.value = 0;
  };
  window.speechSynthesis.speak(speech);
}

const startSpeech = () => {
  window.speechSynthesis.cancel();
  status.isSpeaking = false;
  currentPage.value = startPage.value;
  currentText.value = fullText[currentPage.value - 1];
  range.value = currentText.value.length;
  count.value = 0;

  speech = new SpeechSynthesisUtterance();
  speech.text = currentText.value;
  speech.voice = settings.selectedVoice?.value || null;
  speech.lang = settings.selectedVoice?.value?.lang || 'tr-TR';
  speech.rate = settings.rate;


  speech.onstart = () => {
    count.value = 0;
  };

  speech.onboundary = (event) => {
    count.value = event.charIndex;
  };

  speech.onend = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      currentText.value = fullText[currentPage.value - 1];
      if (speech) {
        speech.text = currentText.value;
        range.value = speech.text.length;
        window.speechSynthesis.speak(speech);
      }
    } else {
      status.isSpeaking = false;
      currentPage.value = startPage.value;
    }
    count.value = 0;
  };
  window.speechSynthesis.speak(speech);
};


const toggleSpeech = () => {
  if (status.isSpeaking) {
    status.isPaused = true;
    window.speechSynthesis.pause();
  } else {
    if (status.isPaused && !status.isReset) {
      status.isPaused = false;
      window.speechSynthesis.resume();
    } else
      startSpeech();

  }
  status.isSpeaking = !status.isSpeaking;
};

</script>

<style scoped lang="scss">
.controls {
  padding: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

:deep(.v-progress-linear__content) {
  color: white;
  font-size: 0.85rem;
}
</style>