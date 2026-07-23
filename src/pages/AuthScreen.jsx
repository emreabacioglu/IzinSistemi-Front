import { useState } from 'react';
import api from '../api';

export default function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regSurname, setRegSurname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </svg>  
    );

    const EyeSlashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299-.822-.822a2.5 2.5 0 0 1-2.829-2.829l-.823-.823a3.5 3.5 0 0 0 4.474 4.474z"/>
            <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l-.195-.288C1.878 6.668 3.638 5.5 5.758 5.5c.713 0 1.39.133 2.02.36l-.708.708z"/>
            <path d="M1.646 1.646a.5.5 0 0 1 .708 0l12 12a.5.5 0 0 1-.708.708l-12-12a.5.5 0 0 1 0-.708z"/>
        </svg>
         //   <path d="M10.428 10.428l1.414 1.414a.5.5 0 0 0 .707-.707l-1.414-1.414a.5.5 0 1 0-.707.707M1.214 2.214a.5.5 0 1 0-.707-.707L14.786 14.786a.5.5 0 1 0 .707.707z"/>
        
    );

    const colors = {
        ziraatKirmizi: '#E10514',
        koyuGri: '#2C3238',
        acikGri: '#F8F9FA',
        bordurGri: '#dee2e6'
    };

    const handleRegister = async () => {
        if (regPassword !== regPasswordConfirm) {
            alert('Lütfen girdiğiniz şifrelerin aynı olduğundan emin olun.');
            return;
        }
        if (!regName || !regSurname || !regEmail || !regPassword) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        try {
            const newEmployee = {
                name: regName,
                surname: regSurname,
                email: regEmail,
                password: regPassword,
                department: "Belirtilmedi",
                title: "Belirtilmedi"
            };

            const response = await api.post('/Employee', newEmployee);

            if (response.status === 200 || response.status === 201) {
            alert('Kayıt başarılı! Giriş yapabilirsiniz.');
            setIsLogin(true);
            }
        } catch (error) {
            console.error('Kayıt sırasında hata oluştu:', error);
            alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
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
                        {isLogin ? 'Kurumsal İzin Sistemi' : 'Yeni Çalışan Kaydı'}
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

                {/* GİRİŞ YAP FORMU */}
                {isLogin ? (
                    <form>
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-dark">E-posta Adresi</label>
                            <input
                                type="email"
                                className="form-control py-2 border-1 shadow-none"
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                placeholder="ornek@sirket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-bold small text-dark">Şifre</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    className="form-control py-2 border-1 shadow-none"
                                    style={{ 
                                        backgroundColor: colors.acikGri, borderColor: colors.bordurGri, paddingRight: '40px' 
                                    }}

                                    placeholder="şifre"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPasswordVisible(true);
                                        setTimeout(() => {
                                            setIsPasswordVisible(false);
                                         }, 2000); // 2 saniye sonra şifreyi gizle
                                    }}

                                    style={{
                                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.koyuGri, display : 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title={'Şifreyi Göster'}
                                >
                                    {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn w-100 fw-bold py-2 shadow-sm mt-3"
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                            onClick={() => onLogin(email, password)}
                        >
                            Sisteme Giriş Yap
                        </button>
                    </form>
                ) : (
                    <form>
                        <div className="row mb-2">
                            <div className="col-6">
                                <label className="form-label fw-bold small mb-1 text-dark">Ad</label>
                                <input 
                                    type="text" 
                                    className="form-control shadow-none border-1" 
                                    style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-bold small mb-1 text-dark">Soyad</label>
                                <input 
                                    type="text" 
                                    className="form-control shadow-none border-1" 
                                    style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                    value={regSurname}
                                    onChange={(e) => setRegSurname(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small mb-1 text-dark">E-posta</label>
                            <input 
                                type="email" 
                                className="form-control shadow-none border-1" 
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                            />
                        </div>
                        <div className="row mb-3">
                            <div className="col-6">
                                <label className="form-label fw-bold small mb-1 text-dark">Şifre</label>
                                <input 
                                    type="password" 
                                    className="form-control shadow-none border-1" 
                                    style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                            <div className="col-6">
                                <label className="form-label fw-bold small mb-1 text-dark">Şifre Tekrar</label>
                                <input 
                                    type="password" 
                                    className="form-control shadow-none border-1" 
                                    style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                    value={regPasswordConfirm}
                                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="btn w-100 fw-bold py-2 shadow-sm mt-2" 
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                            onClick={handleRegister}
                        >
                            Kaydı Tamamla
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}