import { useState } from 'react';

export default function AuthScreen({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);

    const colors = {
        ziraatKirmizi: '#E10514',
        koyuGri: '#2C3238',
        acikGri: '#F8F9FA',
        bordurGri: '#dee2e6'
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center vh-100 px-3"
            style={{
                backgroundImage: "linear-gradient(rgba(30, 33, 36, 0.9), rgba(60, 10, 20, 0.8)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div
                className="card border-0 p-4 p-md-5 shadow-lg"
                style={{ maxWidth: '480px', width: '100%', borderRadius: '12px', backgroundColor: '#FFFFFF' }}
            >
                <div className="text-center mb-4">
                    <h3 className="fw-bold" style={{ color: colors.koyuGri }}>
                        {isLogin ? 'Kurumsal İzin Sistemi' : 'Yeni Personel Kaydı'}
                    </h3>
                    <p className="small text-muted">
                        {isLogin ? 'Lütfen kurum kimlik bilgilerinizle giriş yapın.' : 'Sisteme dahil olmak için bilgilerinizi eksiksiz girin.'}
                    </p>
                </div>

                {/* Sekmeler (Giriş Yap / Kayıt Ol) */}
                <div className="d-flex p-1 rounded mb-4" style={{ backgroundColor: colors.acikGri }}>
                    <button
                        className="btn w-50 fw-bold border-0"
                        style={{
                            backgroundColor: isLogin ? '#FFFFFF' : 'transparent',
                            color: isLogin ? colors.ziraatKirmizi : '#6c757d',
                            boxShadow: isLogin ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            borderRadius: '8px'
                        }}
                        onClick={() => setIsLogin(true)}
                    >
                        Giriş Yap
                    </button>
                    <button
                        className="btn w-50 fw-bold border-0"
                        style={{
                            backgroundColor: !isLogin ? '#FFFFFF' : 'transparent',
                            color: !isLogin ? colors.ziraatKirmizi : '#6c757d',
                            boxShadow: !isLogin ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            borderRadius: '8px'
                        }}
                        onClick={() => setIsLogin(false)}
                    >
                        Kayıt Ol
                    </button>
                </div>

                {/* Form Alanı */}
                {isLogin ? (
                    <form>
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-dark">E-posta Adresi</label>
                            <input
                                type="email"
                                className="form-control py-2 border-1 shadow-none"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                placeholder="ornek@sirket.com"
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-dark">Şifre</label>
                            <input
                                type="password"
                                className="form-control py-2 border-1 shadow-none"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="button"
                            className="btn w-100 fw-bold py-2 shadow-sm mt-3"
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                            onClick={onLoginSuccess}
                        >
                            Sisteme Giriş Yap
                        </button>
                    </form>
                ) : (
                    <form>
                        <div className="mb-2">
                            <label className="form-label fw-bold small mb-1 text-dark">Ad Soyad</label>
                            <input
                                type="text"
                                className="form-control shadow-none border-1"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small mb-1 text-dark">E-posta</label>
                            <input
                                type="email"
                                className="form-control shadow-none border-1"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small mb-1 text-dark">Şifre</label>
                            <input
                                type="password"
                                className="form-control shadow-none border-1"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                            />
                        </div>
                        <button
                            type="button"
                            className="btn w-100 fw-bold py-2 shadow-sm mt-2"
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                        >
                            Kaydı Tamamla
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}