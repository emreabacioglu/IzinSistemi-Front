import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import AuthScreen from './pages/AuthScreen';
import DashboardScreen from './pages/DashboardScreen';



export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const handleLogin = async (email, password) => {
        try {
            const response = await api.post('/Employee/Login', { email, password });
            if (response.status === 200) {
                setUser(response.data);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.error('Giriş yapılırken hata oluştu:', error);
            alert('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
        }
    };

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