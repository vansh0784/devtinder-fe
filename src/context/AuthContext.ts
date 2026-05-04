import type { IUser } from "../utils/types";
import { type Dispatch, type SetStateAction, createContext } from "react";

export interface IAuthContext {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  logout: () => void;
}

// Create the context
export const AuthContext = createContext<IAuthContext | null>(null);
