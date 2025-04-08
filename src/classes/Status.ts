interface IStatus {
    isLoading: boolean,
    error: string,
    isSpeaking: boolean,
    isReady: boolean,
    isReset: boolean,
    isPaused: boolean,
}

export class Status implements IStatus {
    isLoading = false;
    error = "";
    isSpeaking = false;
    isReady = false;
    isReset = false;
    isPaused = false;

    isErrorExist(): boolean {
        return this.error != "";
    }
}