import axios, { type AxiosRequestConfig } from "axios";

const api = axios.create({
	baseURL: "https://devtinder-be-1.onrender.com",
	headers: {
		Authorization: `Bearer`,
	},
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	(error) => Promise.reject(error)
);

api.interceptors.response.use(
	(response) => {
		if (response?.data?.access_token) {
			localStorage.setItem("authToken", response?.data?.access_token);
		}
		return response?.data;
	},
	(error) => Promise.reject(error)
);

export const getApi = async <TResponse>(
	url: string,
	config: AxiosRequestConfig = {}
): Promise<TResponse> => {
	return await api.get<any, TResponse>(url, config);
};

export const postApi = async <TRequest, TResponse>(
	url: string,
	body: TRequest,
	config: AxiosRequestConfig = {}
): Promise<TResponse> => {
	return await api.post<any, TResponse>(url, body, config);
};

export const putApi = async <TRequest, TResponse>(
	url: string,
	body: TRequest,
	config: AxiosRequestConfig = {}
): Promise<TResponse> => {
	return await api.put<any, TResponse>(url, body, config);
};

export const patchApi = async <TRequest, TResponse>(
	url: string,
	body: TRequest,
	config: AxiosRequestConfig = {}
): Promise<TResponse> => {
	return await api.patch<any, TResponse>(url, body, config);
};

export const deleteApi = async <TResponse>(
	url: string,
	config: AxiosRequestConfig = {}
): Promise<TResponse> => {
	return await api.delete<any, TResponse>(url, config);
};

export default api;
