import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import {
  AUTH_EXPIRED_EVENT,
  AUTH_TOKEN_KEY,
  clearAuthStorage,
  isHandshakeAuthUrl,
} from "./authStorage";

declare module "axios" {
  interface AxiosRequestConfig {
    /** When true, failed requests will not show a global error toast */
    skipErrorToast?: boolean;
  }
}

export function extractApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }
  const data = error.response?.data as
    | { message?: string | string[]; error?: string }
    | undefined;
  if (data?.message !== undefined) {
    if (Array.isArray(data.message)) {
      return data.message.filter(Boolean).join(". ");
    }
    if (typeof data.message === "string" && data.message.length > 0) {
      return data.message;
    }
  }
  if (typeof data?.error === "string" && data.error.length > 0) {
    return data.error;
  }
  if (error.response?.statusText) {
    return error.response.statusText;
  }
  return error.message || "Something went wrong";
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4011",
  // headers: {
  // 	Authorization: `Bearer`,
  // },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    if (response?.data?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response?.data?.access_token);
    }
    return response?.data;
  },
  (error: AxiosError<{ message?: string | string[]; error?: string }>) => {
    const cfg = error.config as InternalAxiosRequestConfig | undefined;
    const status = error.response?.status;
    const url = cfg?.url ?? "";
    const isHandshake = isHandshakeAuthUrl(url);
    const sessionExpired401 = status === 401 && !isHandshake;

    if (sessionExpired401) {
      clearAuthStorage();
      window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
    }

    const muteToast =
      Boolean(cfg?.skipErrorToast) ||
      sessionExpired401;
    if (!muteToast) {
      toast.error(extractApiErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export const getApi = async <TResponse>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.get(url, config)) as TResponse;
};

export const postApi = async <TRequest, TResponse>(
  url: string,
  body: TRequest,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.post(url, body, config)) as TResponse;
};

/** Multipart uploads; omit manual Content-Type so axios sets multipart boundary */
export const postFormDataApi = async <TResponse>(
  url: string,
  formData: FormData,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.post(url, formData, config)) as TResponse;
};

export const putApi = async <TRequest, TResponse>(
  url: string,
  body: TRequest,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.put(url, body, config)) as TResponse;
};

export const patchApi = async <TRequest, TResponse>(
  url: string,
  body: TRequest,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.patch(url, body, config)) as TResponse;
};

export const deleteApi = async <TResponse>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<TResponse> => {
  return (await api.delete(url, config)) as TResponse;
};

export default api;
