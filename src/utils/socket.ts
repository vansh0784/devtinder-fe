import { io } from "socket.io-client";

export const socket = io("https://devtinder-be-1.onrender.com", {
	transports: ["websocket"], // include polling
});
