// API utility functions and constants

// Base API URL based on environment
export const API_BASE_URL = import.meta.env.PROD
  ? 'https://witty-cat-portfolio-backend.onrender.com'
  : 'http://localhost:3001';

// WebSocket URL based on environment
export const WS_BASE_URL = import.meta.env.PROD
  ? 'wss://witty-cat-portfolio-backend.onrender.com'
  : 'ws://localhost:3001';

// For debugging - log the URLs being used
console.log('API_BASE_URL:', API_BASE_URL);
console.log('WS_BASE_URL:', WS_BASE_URL);

// API endpoints
export const ENDPOINTS = {
  PROJECTS: `${API_BASE_URL}/api/projects`,
  CHAT: `${API_BASE_URL}/api/chat`,
};

// Fetch wrapper with error handling
export async function fetchApi(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API fetch error for ${url}:`, error);
    throw error;
  }
}
