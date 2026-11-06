import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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
    return Promise.reject(error);
  },
);

export default api;
