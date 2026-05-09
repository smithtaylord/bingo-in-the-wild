import {startRequest, endRequest} from '@/services/loading';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    startRequest();
    try {
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
        return await fetch(fullUrl, options);
    } finally {
        endRequest();
    }
}