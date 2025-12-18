import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type IUser } from "../components/ProfilePage";
import { getApi } from "../utils/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);

	// useEffect(() => {
	//   const saved = localStorage.getItem("dev_user");
	//   if (saved) setUser(JSON.parse(saved));
	// }, []);
	// AuthProvider.tsx
  
	// useEffect(() => {
	// 	const token = localStorage.getItem("authToken");
	// 	if (token) {
	// 		getApi<IUser>(`/user/profile`)
	// 			.then((res) => setUser(res))
	// 			.catch((err) => {
	// 				setUser(null);
	// 				console.log(err);
	// 			});

	// 		console.log("current user", user);
	// 	}
	// }, []);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
