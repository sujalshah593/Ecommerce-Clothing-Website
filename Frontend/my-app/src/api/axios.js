import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

const getUserFacingErrorMessage = (error) => {
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "The request timed out. Please check your connection and try again.";
  }

  if (!error.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  if (error.response.status >= 500) {
    return "The service is temporarily unavailable. Please try again shortly.";
  }

  switch (error.response.status) {
    case 400:
      return "We could not process that request. Please review your details and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "The requested information could not be found.";
    case 409:
      return "This request could not be completed because the information has changed. Please refresh and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return "We could not complete your request. Please try again.";
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

api.interceptors.request.use(
  (config) => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      localStorage.removeItem("user");
    }

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      config.__authRequest = true;
      // Keep the token that authorized this request so an older in-flight
      // request cannot clear a newer successful login session.
      config.__authToken = user.token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.__authRequest) {
      let currentToken = null;
      try {
        currentToken = JSON.parse(localStorage.getItem("user"))?.token;
      } catch {
        // The auth context handles malformed auth storage.
      }

      if (currentToken && currentToken === error.config.__authToken) {
        window.dispatchEvent(new Event("auth:expired"));
      }
    }

    // Preserve Axios' response, status, and payload for callers that need
    // endpoint-specific handling (for example checkout's stock-conflict UI).
    // `message` and `userMessage` provide a safe fallback for generic UI.
    error.originalMessage = error.message;
    error.userMessage = getUserFacingErrorMessage(error);
    error.message = error.userMessage;

    return Promise.reject(error);
  },
);

export default api;
