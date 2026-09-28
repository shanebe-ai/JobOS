import React, { useState } from 'react';
import { AuthContext, type AuthUser } from './auth';
import type { GoogleIdentityServices } from '../types/google';

const AUTH_KEY = 'job_os_auth';

function decodeGoogleJWT(token: string): AuthUser {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
    };
}

function getGoogleIdentity(): GoogleIdentityServices | undefined {
    return (window as unknown as { google?: GoogleIdentityServices }).google;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const saved = localStorage.getItem(AUTH_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const signIn = (credential: string) => {
        const decoded = decodeGoogleJWT(credential);
        localStorage.setItem(AUTH_KEY, JSON.stringify(decoded));
        setUser(decoded);
    };

    const signOut = () => {
        localStorage.removeItem(AUTH_KEY);
        setUser(null);
        // Tell Google to disable auto-select so it doesn't immediately re-sign in
        const g = getGoogleIdentity();
        if (g?.accounts?.id) {
            g.accounts.id.disableAutoSelect();
        }
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
