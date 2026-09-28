import { createContext } from 'react';

export interface AuthUser {
    id: string;       // Google sub — used as storage namespace
    name: string;
    email: string;
    picture?: string;
}

export interface AuthContextType {
    user: AuthUser | null;
    signIn: (credential: string) => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);
