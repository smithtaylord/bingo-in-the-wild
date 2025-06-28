import { ref } from 'vue';
import {createAuth0Client, Auth0Client, User } from '@auth0/auth0-spa-js';
import LoginLogoutHomePage from "@/views/login-logout/LoginLogoutHomePage.vue";

const isAuthenticated = ref(false);
const user = ref<User | null>(null);
let auth0Client: Auth0Client;

export async function initAuth0() {
    auth0Client = await createAuth0Client({
        domain: import.meta.env.VITE_AUTH0_DOMAIN,
        clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
        authorizationParams: {
            redirect_uri: window.location.origin,
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            scope: 'openid email profile', // <-- Add this line
        },
    });
    console.log('Auth0 client initialized', Auth0Client);
    if (window.location.search.includes('code=') && window.location.search.includes('state=')) {
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, '/');
    }

    isAuthenticated.value = await auth0Client.isAuthenticated();
    console.log('User is authenticated:', isAuthenticated.value);
    user.value = isAuthenticated.value ? await auth0Client.getUser() as User: null;
    console.log('User data:', user.value);
    if (isAuthenticated.value) {
        await syncUserWithBackend();
        console.log('User synced with backend');
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

export async function getAccessToken() {
    return await auth0Client.getTokenSilently();
}

async function syncUserWithBackend() {
    const token = await getAccessToken();
    const currentUser = await auth0Client.getUser();
    
    console.log('Syncing user with backend using token:', token);
    const response = await fetch('http://localhost:3000/api/user/login', {
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
    console.log('Response from backend:', response);
    if (!response.ok) {
        console.error('Failed to sync user with backend');
    }
}


