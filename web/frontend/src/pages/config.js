// In production (Render), set VITE_API_URL to your backend's URL,
// e.g. https://shopify-announcement-app-backend.onrender.com
// In local dev, leave it unset — Vite's proxy in vite.config.js handles /api.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
