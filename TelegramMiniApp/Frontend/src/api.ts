import axios from "axios";
import Cookies from "js-cookie";
import { setTokenCookies } from "./utils";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
});

// Add a request interceptor to attach the access token to each request
api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("access_token"); // Get access token from memory or storage
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; // Attach access token to headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration and refreshing
api.interceptors.response.use(
  (response) => response, // If the request is successful, just return the response
  async (error) => {
    const originalRequest = error.config;

    // Check if the error status is 401 (Unauthorized) and the request has not been retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retries

      // Call your function to refresh the token
      const refreshToken = Cookies.get("refresh_token"); // Get the refresh token from storage (usually HTTP-only cookies)
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_ENDPOINT}/users/refresh_token`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          const newAccessToken = refreshResponse.data.result.access_token;

          // Store the new access token in memory or storage
          setTokenCookies(newAccessToken);

          // Update the original request with the new token and retry
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest); // Retry the original request with new access token
        } catch (refreshError) {
          // If refresh fails, log the user out or handle it appropriately
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.reload();
          return Promise.reject(refreshError);
        }
      }
    }

    // If the request failed due to other reasons, reject the promise
    return Promise.reject(error);
  }
);

export default api;
