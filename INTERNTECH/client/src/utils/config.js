export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:5000/api");

export const PUBLIC_BASE_URL =
  process.env.REACT_APP_PUBLIC_BASE_URL?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
