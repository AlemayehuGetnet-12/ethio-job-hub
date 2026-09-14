export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export const getApiUrl = (path) => `${API_BASE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
