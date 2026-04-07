import React, { createContext, useContext, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('google_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('google_access_token'));
    const [isAuthorized, setIsAuthorized] = useState(true); // Default to true initially

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const accessToken = tokenResponse.access_token;
            setToken(accessToken);
            localStorage.setItem('google_access_token', accessToken);
            // Save user info will happen below

            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const userInfo = await userInfoRes.json();
                const userObj = { ...userInfo, name: userInfo.name || userInfo.email };
                setUser(userObj);
                localStorage.setItem('google_user', JSON.stringify(userObj));
            } catch (e) {
                console.error('Failed to fetch user info', e);
                setUser({ name: 'Workday User' });
            }
        },
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    });

    const logout = React.useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthorized(true);
        localStorage.removeItem('google_access_token');
        localStorage.removeItem('google_user');
        window.location.reload();
    }, []);

    const setAuthorized = React.useCallback((val) => setIsAuthorized(val), []);

    const contextValue = React.useMemo(() => ({
        user, token, login, logout, isAuthenticated: !!token, isAuthorized, setAuthorized
    }), [user, token, login, logout, isAuthorized, setAuthorized]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
