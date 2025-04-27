// API utility functions and constants

// Base API URL based on environment
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? 'https://witty-catty-protfolio-backend.onrender.com'
  : 'http://localhost:3001');

// WebSocket URL based on environment
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD
  ? 'wss://witty-catty-protfolio-backend.onrender.com'
  : 'ws://localhost:3001');

// For debugging - log the URLs being used
console.log('API_BASE_URL:', API_BASE_URL);
console.log('WS_BASE_URL:', WS_BASE_URL);

// API endpoints
export const ENDPOINTS = {
  PROJECTS: `${API_BASE_URL}/api/projects`,
  CHAT: `${API_BASE_URL}/api/chat`,
};

// Fetch wrapper with error handling and retry logic
export async function fetchApi(url: string, options: RequestInit = {}, retries = 3) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error(`API fetch error for ${url}:`, error);

    // Retry logic for network errors or timeouts
    if (retries > 0 && (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError'))) {
      console.log(`Retrying fetch to ${url}, ${retries} retries left`);
      return fetchApi(url, options, retries - 1);
    }

    throw error;
  }
}

// Check if the backend is available
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error: unknown) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
