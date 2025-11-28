import { useState, useEffect, type ReactNode } from "react";
import { AuthContext, type IUser } from "./AuthContext"; // removed IAuthContext

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dev_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
