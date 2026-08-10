import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import AuthScreen from './pages/AuthScreen';
import DashboardScreen from './pages/DashboardScreen';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const inactivityTimerRef = useRef(null);

    useEffect(() => {
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
            verifyUserSession(savedUser.id);
        } else {
            setIsLoading(false);
        }
    }, []);

    const verifyUserSession = async (userId) => {
        try {

            const response = await api.get(`/Auth/VerifySession/${userId}`);
            
            if (response.status === 200) {
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error("Güvenlik Uyarısı: Kullanıcı doğrulanamadı veya silinmiş!", error);
            handleForceLogout(); 
        } finally {
            setIsLoading(false);
        }
    };

    const resetInactivityTimer = () => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            console.warn("8 saat hareketsizlik nedeniyle güvenlik amaçlı çıkış yapıldı.");
            handleForceLogout();
        }, 28800000); 
    };

    useEffect(() => {
        if (isLoggedIn) {
            window.addEventListener('mousemove', resetInactivityTimer);
            window.addEventListener('keypress', resetInactivityTimer);
            window.addEventListener('click', resetInactivityTimer);
            window.addEventListener('scroll', resetInactivityTimer);

            resetInactivityTimer();

            return () => {
                window.removeEventListener('mousemove', resetInactivityTimer);
                window.removeEventListener('keypress', resetInactivityTimer);
                window.removeEventListener('click', resetInactivityTimer);
                window.removeEventListener('scroll', resetInactivityTimer);
                if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            };
        }
    }, [isLoggedIn]);

    const handleLogin = async (email, password) => {
        try {
            const response = await api.post('/Employee/Login', { email, password });
            if (response.status === 200) {
                const loggedInUser = response.data;
                localStorage.setItem('user', JSON.stringify(loggedInUser));
                setUser(loggedInUser);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Giriş yapılırken hata oluştu:', error);
            alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    };

    const handleForceLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = "/"; 
    };

    if (isLoading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Güvenlik kontrolleri yapılıyor...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? <DashboardScreen user={user} onLogout={handleForceLogout} />
                            : <AuthScreen onLogin={handleLogin} />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}