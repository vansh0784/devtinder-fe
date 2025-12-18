import { createContext } from "react";
import { type IUser } from "../components/ProfilePage";

// Define the AuthContext type
export interface IAuthContext {
	user: IUser | null;
	setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

// Create the context
export const AuthContext = createContext<IAuthContext | null>(null);
