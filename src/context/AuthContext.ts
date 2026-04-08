import type { IUser } from "../utils/types";
import { type Dispatch, type SetStateAction, createContext } from "react";

// Define the AuthContext type
export interface IAuthContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
}

// Create the context
export const AuthContext = createContext<IAuthContext | null>(null);
