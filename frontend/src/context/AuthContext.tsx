"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

export interface User {
    id: string;
    email: string;
    companyName?: string;
    name?: string;
    phone?: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: {
        email: string;
        password: string;
        companyName: string;
        phone?: string;
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    loginWithGoogle: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
                // First, set the stored user for immediate UI
                setUser(JSON.parse(storedUser));

                // Then verify with the server
                try {
                    const response = await authAPI.me();
                    const freshUser = response.data;
                    setUser(freshUser);
                    localStorage.setItem("user", JSON.stringify(freshUser));
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error loading user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (email: string, password: string) => {
        const response = await authAPI.login(email, password);
        const { token, user: userData } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const register = async (data: {
        email: string;
        password: string;
        companyName: string;
        phone?: string;
    }) => {
        const response = await authAPI.register(data);
        const { token, user: userData } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    const refreshUser = async () => {
        try {
            const response = await authAPI.me();
            const freshUser = response.data;
            setUser(freshUser);
            localStorage.setItem("user", JSON.stringify(freshUser));
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    };

    const loginWithGoogle = async (token: string) => {
        try {
            const response = await authAPI.googleLogin(token);
            const { token: sessionToken, user: userData } = response.data;

            localStorage.setItem("token", sessionToken);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Google login error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, refreshUser, loginWithGoogle }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthContext;
