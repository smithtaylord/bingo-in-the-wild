import {ref} from 'vue';
import {Auth0Client, createAuth0Client, User} from '@auth0/auth0-spa-js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const isAuthenticated = ref(false);
const isLoading = ref(true);
const user = ref<User | null>(null);
let auth0Client: Auth0Client;

export async function initAuth0() {
    isLoading.value = true;
    try {
        auth0Client = await createAuth0Client({
            domain: import.meta.env.VITE_AUTH0_DOMAIN,
            clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                scope: 'openid email profile',
            },
        });
        if (import.meta.env.DEV) {
            console.log('Auth0 client initialized');
        }
        if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, '/');
        }

        isAuthenticated.value = await auth0Client.isAuthenticated();
        if (import.meta.env.DEV) {
            console.log('User is authenticated:', isAuthenticated.value);
        }
        user.value = isAuthenticated.value ? await auth0Client.getUser() as User : null;
        if (isAuthenticated.value) {
            await syncUserWithBackend();
        }
    } catch (error) {
        console.error('Failed to initialize Auth0:', error);
    } finally {
        isLoading.value = false;
    }
}

export async function login() {
    await auth0Client.loginWithRedirect();
}

export async function logout() {
    await auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin,
        },
    });
}

export function getUser() {
    return user.value;
}

export function isLoggedIn() {
    return isAuthenticated.value;
}

export {isLoading, user};

export async function getAccessToken() {
    return await auth0Client.getTokenSilently();
}

async function syncUserWithBackend() {
    const token = await getAccessToken();
    const currentUser = await auth0Client.getUser();

    if (import.meta.env.DEV) {
        console.log('Syncing user with backend...');
    }
    const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: currentUser?.email,
            name: currentUser?.name,
        }),
    });
    if (import.meta.env.DEV) {
        console.log('Response from backend:', response.status);
    }
    if (!response.ok) {
        console.error('Failed to sync user with backend');
    }
}


