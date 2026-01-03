import { createContext, useContext, useStore } from "@builder.io/qwik";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthState>('auth-context');

export const useAuth = () => {
  return useContext(AuthContext);
};