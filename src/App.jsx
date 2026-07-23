import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import AuthScreen from './pages/AuthScreen';
import DashboardScreen from './pages/DashboardScreen';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = async (email, password) => {
        try {
            const response = await api.post('/Employee/Login', { email, password });
            if (response.status === 200) {

                const loggedInUser = response.data;
                localStorage.setItem('user', JSON.stringify(loggedInUser));

                setUser(response.data);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Giriş yapılırken hata oluştu:', error);
            alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
    }

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Son oturumunuz açılıyor...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? <DashboardScreen user={user} onLogout={() => { setIsLoggedIn(false); setUser(null); }} />
                            : <AuthScreen onLogin={handleLogin} />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}