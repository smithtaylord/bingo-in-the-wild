import {ref} from 'vue';

const LOADING_THRESHOLD_MS = 1500;
const MIN_DISPLAY_MS = 2000;
const PING_CACHE_KEY = 'lastServerPing';
const PING_CACHE_TTL_MS = 5 * 60 * 1000;

const isLoadingOverlay = ref(false);
const loadingMessage = ref('');
let activeRequests = 0;
let overlayTimer: ReturnType<typeof setTimeout> | null = null;
let overlayShownAt: number | null = null;
let minDisplayTimer: ReturnType<typeof setTimeout> | null = null;

const funnyMessages = [
    "Starting up... the server wasn't expecting visitors.",
    "Hold tight — the free tier is doing its best.",
    "Waking the server up. It'll get there.",
    "Loading... turns out servers aren't instant.",
    "Almost there — just giving the server a moment.",
    "Counting to ten... the server is on three.",
    "Takes a second to get going. Like most of us.",
    "Loading — the server appreciates your patience.",
];

export function getIsLoadingOverlay() {
    return isLoadingOverlay;
}

export function getLoadingMessage() {
    return loadingMessage;
}

export function startRequest(message?: string) {
    activeRequests++;

    if (minDisplayTimer) {
        clearTimeout(minDisplayTimer);
        minDisplayTimer = null;
    }

    if (!overlayTimer && !isLoadingOverlay.value) {
        overlayTimer = setTimeout(() => {
            if (activeRequests > 0) {
                loadingMessage.value = message || funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
                isLoadingOverlay.value = true;
                overlayShownAt = Date.now();
            }
            overlayTimer = null;
        }, LOADING_THRESHOLD_MS);
    }
}

export function endRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) {
        if (overlayTimer) {
            clearTimeout(overlayTimer);
            overlayTimer = null;
        }

        if (isLoadingOverlay.value && overlayShownAt) {
            const elapsed = Date.now() - overlayShownAt;
            const remaining = MIN_DISPLAY_MS - elapsed;
            if (remaining > 0) {
                minDisplayTimer = setTimeout(() => {
                    if (activeRequests === 0) {
                        isLoadingOverlay.value = false;
                        loadingMessage.value = '';
                        overlayShownAt = null;
                    }
                    minDisplayTimer = null;
                }, remaining);
            } else {
                isLoadingOverlay.value = false;
                loadingMessage.value = '';
                overlayShownAt = null;
            }
        } else {
            isLoadingOverlay.value = false;
            loadingMessage.value = '';
            overlayShownAt = null;
        }
    }
}

export function dismissOverlay() {
    if (overlayTimer) {
        clearTimeout(overlayTimer);
        overlayTimer = null;
    }
    if (minDisplayTimer) {
        clearTimeout(minDisplayTimer);
        minDisplayTimer = null;
    }
    activeRequests = 0;
    isLoadingOverlay.value = false;
    loadingMessage.value = '';
    overlayShownAt = null;
}

export async function pingServerIfNeeded(): Promise<void> {
    const lastPing = localStorage.getItem(PING_CACHE_KEY);
    if (lastPing) {
        const elapsed = Date.now() - parseInt(lastPing, 10);
        if (elapsed < PING_CACHE_TTL_MS) {
            return;
        }
    }

    const baseUrl = import.meta.env.VITE_API_URL || '';
    try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) {
            localStorage.setItem(PING_CACHE_KEY, String(Date.now()));
        }
    } catch {
        // intentionally swallowed — this is a best-effort warmup ping
    }
}