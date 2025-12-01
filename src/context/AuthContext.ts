import { createContext } from "react";

// Define the IUser interface
export interface IUser {
  _id: string;
  username: string;
  email: string;
}

// Define the AuthContext type
export interface IAuthContext {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

// Create the context
export const AuthContext = createContext<IAuthContext | null>(null);
