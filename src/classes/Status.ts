export interface IStatus {
    isLoading: boolean,
    error: string,
    isSpeaking: boolean,
    isReady: boolean,
    isReset: boolean,
    isPaused: boolean,
    isErrorExist(): boolean
}

export class Status implements IStatus {
    isLoading: boolean = false;
    error: string = "";
    isSpeaking: boolean = false;
    isReady: boolean = false;
    isReset: boolean = false;
    isPaused: boolean = false;

    isErrorExist(): boolean {
        return this.error != "";
    }
}