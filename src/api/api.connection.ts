import axios from "axios";

const API = axios.create({
	baseURL: "https://devtinder-be-1.onrender.com",
});

// 🔥 ADD REQUEST INTERCEPTOR
API.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export const swipeRight = (receiverId: string) =>
	API.post(`/connection/right/${receiverId}`);

export const swipeLeft = (receiverId: string) =>
	API.post(`/connection/left/${receiverId}`);

export default API;
