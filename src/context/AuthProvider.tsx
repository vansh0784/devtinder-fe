import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { type IUser } from "../components/ProfilePage";
import { getApi } from "../utils/api";
import { socket } from "../utils/socket";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<IUser | null>(null);

	useEffect(() => {
    if (user?._id) {
      socket.auth = { userId: user._id };
      socket.connect();

      console.log("🔌 Socket connected with user:", user._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
};
