import { useEffect, useState } from 'react';
import api from '../api';

export default function AuthScreen({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);

    const [regStep, setRegStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [regName, setRegName] = useState('');
    const [regSurname, setRegSurname] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); 
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [forgotNewPassword, setForgotNewPassword] = useState('');

    // --- ÖZEL UYARI (CUSTOM ALERT) STATE'İ ---
    const [customAlert, setCustomAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // success, warning, danger, info
        isConfirm: false,
        onConfirm: null
    });

    const showCustomAlert = (title, message, type = 'info', isConfirm = false, onConfirm = null) => {
        setCustomAlert({
            isOpen: true,
            title,
            message,
            type,
            isConfirm,
            onConfirm
        });
    };

    const closeCustomAlert = () => {
        setCustomAlert((prev) => ({ ...prev, isOpen: false }));
    };

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
    );

    const colors = {
        ziraatKirmizi: '#E10514',
        koyuGri: '#2C3238',
        acikGri: '#F8F9FA',
        bordurGri: '#dee2e6'
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (regPassword !== regPasswordConfirm) {
            showCustomAlert('Hatalı İşlem', 'Lütfen girdiğiniz şifrelerin aynı olduğundan emin olun.', 'warning');
            return;
        }
        if (!regName || !regSurname || !regEmail || !regPassword) {
            showCustomAlert('Eksik Alan', 'Lütfen tüm alanları doldurun.', 'warning');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(regPassword)) {
            showCustomAlert('Zayıf Şifre', 'Şifreniz en az 8 karakter uzunluğunda olmalı; en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.', 'danger');
            return;
        }

        try {
            setRegStep(2);
            setTimeLeft(300);
            setResendTimer(30);

            await api.post('/Auth/Register', {
                name: regName,
                surname: regSurname,
                email: regEmail,
                password: regPassword
            });
        } catch (error) {
            console.error('Kayıt sırasında hata oluştu:', error);
            const msg = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.';
            showCustomAlert('Kayıt Hatası', msg, 'danger');
            setRegStep(1);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && e.target.nextElementSibling) {
            e.target.nextElementSibling.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            setOtp(pastedData.split(''));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousElementSibling) {
            e.target.previousElementSibling.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();

        const code = otp.join('');
        if (code.length < 6) {
            showCustomAlert('Eksik Kod', 'Lütfen 6 haneli kodu eksiksiz giriniz.', 'warning');
            return;
        }
        
        try {
            const response = await api.post('/Auth/VerifyOtp', {
                email: regEmail,
                otpCode: code
            });

            if (response.status === 200) {
                onLogin(regEmail, regPassword);
            }
        } catch (error) {
            console.error('OTP Doğrulama Hatası:', error);
            showCustomAlert('Doğrulama Başarısız', 'Hatalı veya süresi dolmuş bir kod girdiniz.', 'danger');
            setOtp(['', '', '', '', '', '']);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            showCustomAlert('Eksik Bilgi', 'Lütfen e-posta ve şifre alanlarını doldurun.', 'warning');
            return;
        }    
        onLogin(email, password);
    };

    const isOtpValid = otp.every(val => val !== '');

    const [timeLeft, setTimeLeft] = useState(300);
    const [resendTimer, setResendTimer] = useState(30);

    useEffect(() => {
        if (regStep === 2 && timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [timeLeft, regStep]);

    useEffect(() => {
        if (regStep === 2 && resendTimer > 0) {
            const timerId = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
            return () => clearInterval(timerId);
        }
    }, [resendTimer, regStep]);

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleResendCode = async () => {
        try {
            await api.post('/Auth/Register', {
                name: regName,
                surname: regSurname,
                email: regEmail,
                password: regPassword
            });

            setTimeLeft(300);
            setResendTimer(30);
            showCustomAlert('Kod Gönderildi', 'Yeni doğrulama kodu e-postanıza gönderildi!', 'success');
        } catch (error) {
            console.error("Kod Gönderim Hatası:", error);
            showCustomAlert('Hata', 'Kod gönderilirken bir hata oluştu.', 'danger');
        }
    };

    const handleSendForgotCode = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            showCustomAlert('Eksik Bilgi', 'Lütfen e-posta adresinizi giriniz.', 'warning');
            return;
        }
        try {
            await api.post('/Auth/ForgotPassword', { email: forgotEmail });
            showCustomAlert('İşlem Başarılı', 'Eğer sistemde kayıtlıysa, şifre sıfırlama kodu gönderilmiştir.', 'success');
            setForgotStep(2);
        } catch (error) {
            console.error('Şifremi unuttum hatası:', error);
            showCustomAlert('Hata', 'İşlem sırasında bir hata oluştu.', 'danger');
        }
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (!forgotOtp || !forgotNewPassword) {
            showCustomAlert('Eksik Alan', 'Lütfen tüm alanları doldurun.', 'warning');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        if (!passwordRegex.test(forgotNewPassword)) {
            showCustomAlert('Zayıf Şifre', 'Şifreniz en az 8 karakter uzunluğunda olmalı; en az 1 büyük harf, 1 küçük harf, 1 sayı ve 1 özel karakter içermelidir.', 'danger');
            return;
        }

        try {
            await api.post('/Auth/ResetPassword', {
                email: forgotEmail,
                otpCode: forgotOtp,
                newPassword: forgotNewPassword
            });
            showCustomAlert('Başarılı', 'Şifreniz başarıyla değiştirildi! Yeni şifrenizle giriş yapabilirsiniz.', 'success');
            setShowForgotModal(false);
            setForgotStep(1);
            setForgotEmail('');
            setForgotOtp('');
            setForgotNewPassword('');
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            showCustomAlert('Hata', error.response?.data?.message || 'Hatalı kod veya işlem başarısız.', 'danger');
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
                        {isLogin ? 'Lütfen kurum kimlik bilgilerinizle giriş yapın.' 
                        : (regStep === 1 ? 'Sisteme dahil olmak için bilgilerinizi eksiksiz girin.' : `${regEmail} adresine gönderilen 6 haneli kodu giriniz.`)}
                    </p>
                </div>

                {/* Sekmeler (Giriş Yap / Kayıt Ol) */}
                {(isLogin || regStep === 1) && (
                    <div className="d-flex p-1 rounded mb-4" style={{ backgroundColor: colors.acikGri }}>
                        <button
                            type="button"
                            className="btn w-50 fw-bold border-0"
                            style={{
                                backgroundColor: isLogin ? '#FFFFFF' : 'transparent',
                                color: isLogin ? colors.ziraatKirmizi : '#6c757d',
                                boxShadow: isLogin ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                borderRadius: '8px'
                            }}
                            onClick={() => { setIsLogin(true); setRegStep(1); }}
                        >
                            Giriş Yap
                        </button>
                        <button
                            type="button"
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
                )}

                {/* GİRİŞ YAP FORMU */}
                {isLogin ? (
                    <form onSubmit={handleLogin}>
                        <div className="mb-2">
                            <label className="form-label fw-bold small mb-1 text-dark">E-posta</label>
                            <input 
                                type="email" 
                                className="form-control shadow-none border-1" 
                                style={{ backgroundColor: colors.acikGri, borderColor: colors.bordurGri }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-2">
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
                                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: colors.koyuGri, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    title={isPasswordVisible ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                                >
                                    {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        {/* Şifremi Unuttum Linki */}
                        <div className="text-end mb-3">
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none p-0 small fw-bold"
                                style={{ color: colors.ziraatKirmizi }}
                                onClick={() => setShowForgotModal(true)}
                            >
                                Şifremi Unuttum?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn w-100 fw-bold py-2 shadow-sm mt-2"
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                        >
                            Sisteme Giriş Yap
                        </button>
                    </form>
                ) : (
                    regStep === 1 ? (
                    <form onSubmit={handleRegister}>
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
                        
                        <div className="alert alert-light p-2 mb-3 text-muted" style={{ fontSize: '11px', border: '1px dashed #dee2e6' }}>
                            💡 Şifreniz en az 8 karakter olmalı; büyük harf, küçük harf, sayı ve özel karakter içermelidir.
                        </div>

                        <button 
                            type="submit" 
                            className="btn w-100 fw-bold py-2 shadow-sm mt-1" 
                            style={{ backgroundColor: colors.ziraatKirmizi, color: '#FFFFFF', borderRadius: '8px' }}
                        >
                            Kaydı Tamamla
                        </button>
                    </form>
                ) : (
                    <form className="text-center" onSubmit={handleVerifyOtp}>
                        <div className="d-flex justify-content-between mb-4 mt-3" onPaste={handleOtpPaste}>
                            {otp.map((data, index) => (
                                <input
                                    autoFocus={index === 0}
                                    className="form-control text-center fw-bold fs-4 mx-1"
                                    style={{ width: '50px', height: '60px', backgroundColor: colors.acikGri, borderColor: colors.bordurGri, borderRadius: '8px' }}
                                    type="text"
                                    name="otp"
                                    maxLength="1"
                                    key={index}
                                    value={data}
                                    onChange={e => handleOtpChange(e, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onFocus={e => e.target.select()}
                                />
                            ))}
                        </div>
                        <button
                            type="submit"
                            className="btn w-100 fw-bold py-2 shadow-sm mb-3"
                            disabled={!isOtpValid}
                            style={{ backgroundColor: colors.koyuGri, color: '#FFFFFF', borderRadius: '8px', opacity: isOtpValid ? 1 : 0.6, cursor: isOtpValid ? 'pointer' : 'not-allowed' }}
                        >
                            Doğrula ve Devam Et
                        </button>
                        <div className="text-center mt-4">
                            {timeLeft > 0 ? (
                                <p className="text-muted small fw-bold mb-2">
                                    Kodun Geçerlilik Süresi: <span style={{ color: '#E10514' }}>{formatTime()}</span>
                                </p>
                            ) : (
                                <p className="text-danger small fw-bold mb-2">
                                    Kodun süresi doldu. Lütfen yeni bir kod isteyin.
                                </p>
                            )}

                            <button 
                                type="button" 
                                className="btn btn-link text-decoration-none fw-bold"
                                style={{ color: resendTimer > 0 ? '#6c757d' : '#2C3238' }}
                                disabled={resendTimer > 0} 
                                onClick={handleResendCode}
                            >
                                {resendTimer > 0 
                                    ? `Kodu Tekrar Gönder (${resendTimer}s)` 
                                    : 'Kodu Tekrar Gönder'
                                }
                            </button>
                        </div>
                    </form>
                )
            )}

            {/* ŞİFREMİ UNUTTUM MODALI (POP-UP) */}
            {showForgotModal && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ backgroundColor: 'rgba(30, 33, 36, 0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
                >
                    <div className="card border-0 p-4 shadow-lg position-relative" style={{ width: '90%', maxWidth: '400px', borderRadius: '16px' }}>
                        <button 
                            type="button" 
                            className="btn btn-light btn-sm position-absolute rounded-circle"
                            style={{ top: '15px', right: '15px', width: '30px', height: '30px' }}
                            onClick={() => { setShowForgotModal(false); setForgotStep(1); }}
                        >
                            ✕
                        </button>

                        <h5 className="fw-bold mb-2 text-dark">🔑 Şifre Sıfırlama</h5>
                        <p className="text-muted small mb-3">
                            {forgotStep === 1 ? 'Sisteme kayıtlı e-posta adresinizi girin.' : 'E-postanıza gelen kodu ve yeni şifrenizi girin.'}
                        </p>

                        {forgotStep === 1 ? (
                            <form onSubmit={handleSendForgotCode}>
                                <div className="mb-3">
                                    <input 
                                        type="email" 
                                        className="form-control py-2 shadow-none" 
                                        placeholder="ornek@sirket.com"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: colors.ziraatKirmizi, borderRadius: '8px' }}>
                                    Kod Gönder
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPasswordSubmit}>
                                <div className="mb-2">
                                    <label className="form-label small fw-bold">6 Haneli Kod</label>
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        className="form-control py-2 text-center fw-bold fs-5 shadow-none" 
                                        value={forgotOtp}
                                        onChange={(e) => setForgotOtp(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Yeni Şifre</label>
                                    <input 
                                        type="password" 
                                        className="form-control py-2 shadow-none" 
                                        placeholder="Yeni şifreniz"
                                        value={forgotNewPassword}
                                        onChange={(e) => setForgotNewPassword(e.target.value)}
                                        required
                                    />
                                    <small className="text-muted" style={{ fontSize: '10px' }}>En az 8 karakter; büyük harf, küçük harf, sayı ve özel karakter içermelidir.</small>
                                </div>
                                <button type="submit" className="btn w-100 fw-bold py-2 text-white" style={{ backgroundColor: colors.koyuGri, borderRadius: '8px' }}>
                                    Şifreyi Değiştir
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            </div>

            {/* --- ÖZEL UYARI MODALI (CUSTOM ALERT COMPONENT) --- */}
            {customAlert.isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                    style={{ backgroundColor: 'rgba(30, 33, 36, 0.6)', backdropFilter: 'blur(5px)', zIndex: 10005 }}
                >
                    <div 
                        className="card border-0 shadow-lg text-center p-4" 
                        style={{ width: '90%', maxWidth: '400px', borderRadius: '16px', animation: 'fadeIn 0.2s ease-out' }}
                    >
                        <div className="mb-3">
                            {customAlert.type === 'success' && <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#e6f8ed', color: '#198754', fontSize: '28px' }}>✓</div>}
                            {customAlert.type === 'warning' && <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#fff8e6', color: '#ffc107', fontSize: '28px' }}>!</div>}
                            {customAlert.type === 'danger' && <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#ffe6e6', color: '#dc3545', fontSize: '28px' }}>✖</div>}
                            {customAlert.type === 'info' && <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', backgroundColor: '#e6f0ff', color: '#0d6efd', fontSize: '28px' }}>i</div>}
                        </div>
                        
                        <h5 className="fw-bold text-dark mb-2">{customAlert.title}</h5>
                        <p className="text-muted small mb-4">{customAlert.message}</p>
                        
                        <div className="d-flex justify-content-center gap-2">
                            {customAlert.isConfirm ? (
                                <>
                                    <button 
                                        type="button"
                                        className="btn btn-outline-secondary px-4 fw-bold"
                                        style={{ borderRadius: '8px' }}
                                        onClick={closeCustomAlert}
                                    >
                                        İptal
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-danger px-4 fw-bold"
                                        style={{ borderRadius: '8px' }}
                                        onClick={() => {
                                            if (customAlert.onConfirm) customAlert.onConfirm();
                                            closeCustomAlert();
                                        }}
                                    >
                                        Onayla
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button"
                                    className="btn px-4 fw-bold text-white"
                                    style={{ backgroundColor: colors.koyuGri, borderRadius: '8px' }}
                                    onClick={closeCustomAlert}
                                >
                                    Tamam
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}