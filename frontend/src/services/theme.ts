import {ref, watch} from 'vue';

export type ThemeName = 'wild' | 'light' | 'dark';

const STORAGE_KEY = 'bitw-theme';

const currentTheme = ref<ThemeName>(loadTheme());

function loadTheme(): ThemeName {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'wild' || stored === 'light' || stored === 'dark') {
        return stored;
    }
    return 'wild';
}

function applyTheme(theme: ThemeName) {
    const className = `theme-${theme}`;
    document.documentElement.classList.remove('theme-wild', 'theme-light', 'theme-dark');
    document.documentElement.classList.add(className);
    document.body.classList.remove('theme-wild', 'theme-light', 'theme-dark');
    document.body.classList.add(className);
}

function setTheme(theme: ThemeName) {
    currentTheme.value = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
}

watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
}, {immediate: true});

export function useTheme() {
    return {
        currentTheme,
        setTheme,
    };
}