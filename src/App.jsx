import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AuthScreen from './pages/AuthScreen';
import DashboardScreen from './pages/DashboardScreen';

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        isLoggedIn
                            ? <DashboardScreen onLogout={() => setIsLoggedIn(false)} />
                            : <AuthScreen onLoginSuccess={() => setIsLoggedIn(true)} />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}