const MIN_RATE = 0.5;
const MAX_RATE = 2.0;
const STEP_RATE = 0.1;

interface ISettings {
    voices: Array<Voice>,
    selectedVoice?: Voice,
    selectedFile?: File,
    rate: number,
    readonly MIN_RATE: typeof MIN_RATE,
    readonly MAX_RATE: typeof MAX_RATE,
    readonly STEP_RATE: typeof STEP_RATE
}

interface Voice {
    id: number,
    name: string,
    lang: string,
    value: SpeechSynthesisVoice
}

export class Settings implements ISettings {
    voices: Array<Voice> = [];
    selectedVoice?: Voice = undefined;
    selectedFile?: File = undefined;
    rate: number = 0.7;
    readonly MIN_RATE = MIN_RATE;
    readonly MAX_RATE = MAX_RATE;
    readonly STEP_RATE = STEP_RATE;

    loadVoices(): Promise<void> {
        return new Promise(resolve => {
            speechSynthesis.onvoiceschanged = () => {
                this.voices = speechSynthesis.getVoices().map((voice, index) => ({
                    id: index,
                    name: voice.name,
                    lang: voice.lang,
                    value: voice
                }));
                this.selectedVoice = this.voices.find(v => (v.lang === 'tr-TR' || v.lang === 'tr_TR')) || this.voices[0];
                resolve();
            };
        })
    }
}