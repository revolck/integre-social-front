import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { parseCookies } from "nookies";

/** Default key used to store the access token in cookies */
const TOKEN_KEY = "access_token";

/**
 * Axios instance pre-configured with the API base URL and timeout.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
});

// Adds the authorization header on every request when a token is available
apiClient.interceptors.request.use((config) => {
  const { [TOKEN_KEY]: token } = parseCookies();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Logs errors automatically before forwarding them to the caller
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const get = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.get<T>(url, config);

export const post = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => apiClient.post<T>(url, data, config);

export const put = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => apiClient.put<T>(url, data, config);

export const patch = <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) => apiClient.patch<T>(url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) =>
  apiClient.delete<T>(url, config);

export default apiClient;
