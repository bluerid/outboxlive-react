const API_ORIGIN = import.meta.env.VITE_API_BASE_URL.split('/api')[0];

const originalFetch = window.fetch.bind(window);

window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && import.meta.env.PROD) {
        if (
            input.startsWith('/api/') ||
            input.startsWith('/auth/') ||
            input.startsWith('/admins/')
        ) {
            input = `${API_ORIGIN}${input}`;
        }
    }

    return originalFetch(input, init);
};