const browserOrigin =
  typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "/api");

export const PUBLIC_BASE_URL =
  process.env.REACT_APP_PUBLIC_BASE_URL || browserOrigin || "https://interntech.in";
