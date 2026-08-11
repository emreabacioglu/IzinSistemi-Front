import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import AuthScreen from './pages/AuthScreen';
import DashboardScreen from './pages/DashboardScreen';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isGlobalLoading, setIsGlobalLoading] = useState(false);

    // 9 Saat = 9 * 60 * 60 * 1000 milisaniye (32.400.000 ms)
    const ABSOLUTE_TIMEOUT = 32400000; 

    useEffect(() => {
        // api.js'den gelen CustomEvent'leri dinle (Global Loading ve Force Logout için)
        const handleLoading = (e) => setIsGlobalLoading(e.detail);
        const handleForceLogoutEvent = () => handleForceLogout();

        window.addEventListener('global-loading', handleLoading);
        window.addEventListener('force-logout', handleForceLogoutEvent);

        // Sayfa ilk yüklendiğinde çalışacak kontroller
        const savedUserStr = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');

        if (savedUserStr && loginTime) {

            if (Date.now() - parseInt(loginTime) > ABSOLUTE_TIMEOUT) {
                handleForceLogout();
                setIsAppLoading(false);
            } else {
                
                const savedUser = JSON.parse(savedUserStr);
                setUser(savedUser);
                verifyUserSession(savedUser.id);
            }
        } else {
            setIsAppLoading(false);
        }

        return () => {
            window.removeEventListener('global-loading', handleLoading);
            window.removeEventListener('force-logout', handleForceLogoutEvent);
        };
    }, []);

    
    useEffect(() => {
        if (isLoggedIn) {
            // 1. SADECE YEREL SAAT KONTROLÜ (Sunucuyu yormaz)
            const checkSessionInterval = setInterval(() => {
                const loginTime = localStorage.getItem('loginTime');
                if (loginTime && (Date.now() - parseInt(loginTime) > ABSOLUTE_TIMEOUT)) {
                    handleForceLogout();
                }
            }, 60000);

            // 2. SEKME DEĞİŞİKLİĞİNİ DİNLEME (Uyuyan sunucuyu uyandırma)
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    
                    const loginTime = localStorage.getItem('loginTime');
                    
                    // Önce 9 saat dolmuş mu diye bak
                    if (loginTime && (Date.now() - parseInt(loginTime) > ABSOLUTE_TIMEOUT)) {
                        handleForceLogout();
                        return;
                    }

                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const parsedUser = JSON.parse(userStr);
                        
                        verifyUserSession(parsedUser.id);
                    }
                }
            };


            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                clearInterval(checkSessionInterval);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [isLoggedIn]);

    const verifyUserSession = async (userId) => {
        try {
            const response = await api.get(`/Auth/VerifySession/${userId}`);
            
            if (response.status === 200) {
                const updatedUser = { ...user, ...response.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setIsLoggedIn(true);
            }
        } catch (error) {
            // Hataları interceptor hallediyor
        } finally {
            setIsAppLoading(false);
        }
    };


    const handleLogin = (loggedInUser) => {
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('loginTime', Date.now().toString()); 
        setUser(loggedInUser);
        setIsLoggedIn(true);
    };

    const handleForceLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTime');
        setUser(null);
        setIsLoggedIn(false);
        window.location.href = "/";
    };

    if (isAppLoading) {
        return <div className="d-flex justify-content-center align-items-center vh-100 bg-light">Uygulama Başlatılıyor...</div>;
    }

    return (
        <BrowserRouter>
            {/* GLOBAL YÜKLENİYOR EKRANI */}
            {isGlobalLoading && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(3px)', zIndex: 99999 }}
                >
                    <div className="spinner-border text-danger mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Yükleniyor...</span>
                    </div>
                    <h5 className="fw-bold text-dark">İşleminiz Yapılıyor...</h5>
                    <p className="text-muted small">Sunucu uykudaysa (Cold Start) bu işlem 30-40 saniye sürebilir.</p>
                </div>
            )}
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