import type {IStatus} from "@/classes/Status.ts";
import type {ISettings} from "@/classes/Settings.ts";
import {Status} from "@/classes/Status.ts";
import {Settings} from "@/classes/Settings.ts";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface IPdfReader {
    status: IStatus,
    settings: ISettings,
    startPage: number,
    currentPage: number,
    totalPages: number,
    speech?: SpeechSynthesisUtterance,
    fullText: Array<string>,
    currentText: string,
    range:number,                       // yazı uzunluğu
    count:number,                       // okunan yerin indexi
    changedPage: null | number,
    initialize(): Promise<void>,
    toggleSpeech(): void,
    startSpeech(): void,
    stopSpeech(): void,
}

export class PdfReader implements IPdfReader {
    status = new Status();
    settings = new Settings();
    startPage = 1;
    currentPage = 1;
    totalPages = 0;
    speech?: SpeechSynthesisUtterance = undefined;
    fullText: Array<string> = [];
    currentText: string = "";
    changedPage: null | number = null;
    range = 1;
    count = 0;


    async initialize(): Promise<void> {
        await this.settings.loadVoices();
    }

    async handleFileUpload() {
        if (!this.settings.selectedFile) {
            this.status.error = "Lütfen burayı doldurun."
            return;
        }
        try {
            this.status.isLoading = true;
            this.status.error = "";
            const arrayBuffer = await this.settings.selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            this.totalPages = pdf.numPages;

            this.fullText = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                this.fullText.push(textContent.items.map((item: any) => item.str).join(' '));
            }
            this.status.isReady = true;
        } catch (err: any) {
            this.status.error = 'PDF okunurken hata oluştu: ' + err.message;
            this.status.isReady = false;
        } finally {
            this.status.isLoading = false;
        }
    };

    toggleSpeech() {
        if (this.status.isSpeaking) {
            this.status.isSpeaking = false;
            this.status.isPaused = true;
            window.speechSynthesis.pause();
        } else {
            if (this.status.isPaused && !this.status.isReset) {
                this.status.isSpeaking = true;
                this.status.isPaused = false;
                window.speechSynthesis.resume();
            } else
                this.startSpeech();
        }
    }

    startSpeech(startIndex?: number) {
        window.speechSynthesis.cancel();
        this.status.isSpeaking = true;
        this.status.isPaused = false;

        if (startIndex) {
            // Slider değişikliği için gerekli
            this.changedPage = this.currentPage;
        } else {
            this.currentPage = this.startPage;
            this.currentText = this.fullText[this.currentPage - 1];
            this.range = this.currentText.length;
            this.count = 0;
        }

        const text = startIndex ? this.currentText.substring(startIndex) : this.currentText;
        this.speech = new SpeechSynthesisUtterance();
        this.speech.text = text;
        this.speech.voice = this.settings.selectedVoice?.value || null;
        this.speech.lang = this.settings.selectedVoice?.value?.lang || 'tr-TR';
        this.speech.rate = this.settings.rate;

        this.speech.onboundary = (event) => {
            if (startIndex && (this.changedPage == this.currentPage))
                this.count = startIndex + event.charIndex
            else
                this.count = event.charIndex;
        };

        this.speech.onend = () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.currentText = this.fullText[this.currentPage - 1];
                if (this.speech) {
                    this.speech.text = this.currentText;
                    this.range = this.speech.text.length;
                    window.speechSynthesis.speak(this.speech);
                }
            } else {
                this.status.isSpeaking = false;
                this.currentPage = this.startPage;
            }
            this.count = 0;
        };

        window.speechSynthesis.speak(this.speech);
    }

    stopSpeech() {
        window.speechSynthesis.cancel();
    }
}