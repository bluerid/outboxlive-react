import React, { createContext, useContext, useState, useEffect } from 'react';

type UserProfile = {
    id: string;
    name: string;
    role?: string; // 'admin' or 'regular'
    // Add other profile fields as needed
};

type AuthContextType = {
    token: string | null;
    user: UserProfile | null;
    login: (token: string, user: UserProfile) => void;
    logout: () => string; // returns redirect path
    loading: boolean;
    redirectAfterLogout: string | null;
    setRedirectAfterLogout: (value: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [redirectAfterLogout, setRedirectAfterLogout] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('userProfile');
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user profile from localStorage', e);
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: UserProfile) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('userProfile', JSON.stringify(newUser));
    };

    const logout = () => {
        let redirectTo = '/login';
        if (user?.role === 'admin') {
            redirectTo = '/admin/login';
        }
        setRedirectAfterLogout(redirectTo);
        setToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userProfile');
        return redirectTo;
    };

    const value = { token, user, login, logout, loading, redirectAfterLogout, setRedirectAfterLogout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};