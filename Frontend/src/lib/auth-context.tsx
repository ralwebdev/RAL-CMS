import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { User, UserRole } from "./types";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

interface AuthContextValue {
  currentUser: User | null;
  loginByCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          password: "", // Password not needed in frontend
        });
      } else {
        // Token might be invalid or expired
        localStorage.removeItem("crm_token");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (token) {
      fetchUserProfile(token);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const loginByCredentials = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) return { success: false, error: "Email and password are required." };

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user: User = {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          password: "",
        };

        setCurrentUser(user);
        localStorage.setItem("crm_token", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.message || "Invalid credentials." };
      }
    } catch (error) {
      return { success: false, error: "Connection error. Please check if the backend is running." };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("crm_token");
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginByCredentials,
      logout,
      isAuthenticated: !!currentUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const roleNavConfig: Record<UserRole, { to: string; label: string }[]> = {
  admin: [
    { to: "/", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/leads", label: "Leads" },
    { to: "/telecalling", label: "Telecalling" },
    { to: "/counseling", label: "Counseling" },
    { to: "/revenue", label: "Revenue" },
    { to: "/institutional", label: "Institutional" },
    { to: "/follow-ups", label: "Follow-ups" },
    { to: "/admissions", label: "Admissions" },
    { to: "/approvals", label: "Approvals" },
  ],
  telecaller: [
    { to: "/", label: "Dashboard" },
    { to: "/telecalling", label: "Telecalling" },
    { to: "/follow-ups", label: "Follow-ups" },
  ],
  counselor: [
    { to: "/", label: "Dashboard" },
    { to: "/counseling", label: "Counseling" },
    { to: "/leads", label: "Leads" },
    { to: "/follow-ups", label: "Follow-ups" },
    { to: "/admissions", label: "Admissions" },
  ],
  marketing_manager: [
    { to: "/", label: "Dashboard" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/leads", label: "Leads" },
    { to: "/revenue", label: "Revenue" },
  ],
  telecalling_manager: [
    { to: "/", label: "Dashboard" },
    { to: "/telecalling", label: "Telecalling" },
    { to: "/leads", label: "Leads" },
    { to: "/follow-ups", label: "Follow-ups" },
  ],
  owner: [
    { to: "/", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
    { to: "/campaigns", label: "Campaigns" },
    { to: "/leads", label: "Leads" },
    { to: "/telecalling", label: "Telecalling" },
    { to: "/counseling", label: "Counseling" },
    { to: "/revenue", label: "Revenue" },
    { to: "/institutional", label: "Institutional" },
    { to: "/follow-ups", label: "Follow-ups" },
    { to: "/admissions", label: "Admissions" },
    { to: "/approvals", label: "Approvals" },
  ],
  alliance_manager: [
    { to: "/", label: "Dashboard" },
    { to: "/alliances", label: "Industry Alliances" },
  ],
  alliance_executive: [
    { to: "/", label: "Dashboard" },
    { to: "/alliances", label: "My Alliances" },
  ],
  accounts_manager: [
    { to: "/", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
  ],
  accounts_executive: [
    { to: "/", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
  ],
};

export const roleLabels: Record<UserRole, string> = {
  admin: "System Administrator",
  telecaller: "Telecaller",
  counselor: "Academic Counselor",
  marketing_manager: "Marketing Manager",
  telecalling_manager: "Telecalling Manager",
  owner: "Owner / Director",
  alliance_manager: "Alliance Manager",
  alliance_executive: "Alliance Executive",
  accounts_manager: "Accounts Manager",
  accounts_executive: "Accounts Executive",
};
