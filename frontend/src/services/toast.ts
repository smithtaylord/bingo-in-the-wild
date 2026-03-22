import {toastController} from "@ionic/vue";

const DEFAULT_DURATION = 2000;

export const showSuccess = (message: string, duration = DEFAULT_DURATION) => {
    toastController.create({
        message,
        duration,
        color: "dark-green",
    }).then(toast => toast.present());
};

export const showError = (message: string, duration = DEFAULT_DURATION) => {
    toastController.create({
        message,
        duration,
        color: "danger",
    }).then(toast => toast.present());
};

export const showWarning = (message: string, duration = DEFAULT_DURATION) => {
    toastController.create({
        message,
        duration,
        color: "warning",
    }).then(toast => toast.present());
};
