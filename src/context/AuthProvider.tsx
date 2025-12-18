import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type IUser } from "../components/ProfilePage";
import { getApi } from "../utils/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
