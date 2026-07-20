import { useState } from 'react';

export default function DashboardScreen({ onLogout }) {
    const colors = { ziraatKirmizi: '#E10514', koyuGri: '#2C3238', acikGri: '#F8F9FA' };

    const mevcutTarih = new Date();
    const [seciliYil, setSeciliYil] = useState(mevcutTarih.getFullYear());
    const [seciliAy, setSeciliAy] = useState(mevcutTarih.getMonth() + 1);

    const [isEditMode, setIsEditMode] = useState(false);
    const [seciliGunler, setSeciliGunler] = useState([]);

    const gercekYil = mevcutTarih.getFullYear();
    const gercekAy = mevcutTarih.getMonth() + 1;
    const gercekGun = mevcutTarih.getDate();

    const gunSayisi = new Date(seciliYil, seciliAy, 0).getDate();
    const gunler = Array.from({ length: gunSayisi }, (_, i) => i + 1);
    const gunIsimleri = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    const aylar = [
        { deger: 1, ad: 'Ocak' }, { deger: 2, ad: 'Şubat' }, { deger: 3, ad: 'Mart' },
        { deger: 4, ad: 'Nisan' }, { deger: 5, ad: 'Mayıs' }, { deger: 6, ad: 'Haziran' },
        { deger: 7, ad: 'Temmuz' }, { deger: 8, ad: 'Ağustos' }, { deger: 9, ad: 'Eylül' },
        { deger: 10, ad: 'Ekim' }, { deger: 11, ad: 'Kasım' }, { deger: 12, ad: 'Aralık' }
    ];

    const yillar = Array.from({ length: 5 }, (_, i) => gercekYil + i);

    // YENİ: Farkı görmek için örnek izin verileri eklendi
    const aktifKullanici = {
        id: 1,
        adSoyad: 'Ahmet Yılmaz',
        departman: 'IT',
        unvan: 'Uzman',
        izinler: [
            { gun: 15, durum: 'Kesinlesen' },
            { gun: 16, durum: 'Kesinlesen' },
            { gun: 23, durum: 'Planlanan' },
            { gun: 24, durum: 'Planlanan' }
        ]
    };
    const personeller = [aktifKullanici, { id: 2, adSoyad: 'Ayşe Demir', departman: 'İK', unvan: 'Müdür', izinler: [] }];

    const handleHucreTikla = (gun, gecmisMi, haftaSonuMu, kayitliIzinVarMi) => {
        // Düzenleme modunda değilsek, geçmişse, hafta sonuysa veya O GÜN ZATEN İZİNLİYSE tıklanmasın
        if (!isEditMode || gecmisMi || haftaSonuMu || kayitliIzinVarMi) return;

        if (seciliGunler.includes(gun)) {
            setSeciliGunler(seciliGunler.filter(g => g !== gun));
        } else {
            setSeciliGunler([...seciliGunler, gun]);
        }
    };

    const handleIptal = () => {
        setIsEditMode(false);
        setSeciliGunler([]);
    };

    return (
        <div className="container-fluid p-0 vh-100 d-flex flex-column" style={{ backgroundColor: '#F0F2F5' }}>

            <header className="navbar navbar-dark sticky-top p-2 shadow" style={{ backgroundColor: colors.koyuGri }}>
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fw-bold fs-5" href="#">Kurumsal İzin Sistemi</a>
                <div className="navbar-nav px-3 flex-row gap-3">
                    <span className="text-white small align-self-center">Hoş geldin, {aktifKullanici.adSoyad}</span>
                    <button className="btn btn-sm text-white border-white" onClick={onLogout}>Çıkış Yap</button>
                </div>
            </header>

            <main className="container-fluid flex-grow-1 p-4 overflow-auto">

                {/* ÜST KONTROL PANELİ */}
                <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="h5 fw-bold text-dark mb-0 me-3">Çizelge Dönemi:</h1>
                        <select className="form-select form-select-sm fw-bold text-secondary shadow-none border-1" style={{ width: '130px', cursor: 'pointer' }} value={seciliAy} onChange={(e) => { setSeciliAy(parseInt(e.target.value)); setSeciliGunler([]); }}>
                            {aylar.map(ay => <option key={ay.deger} value={ay.deger}>{ay.ad}</option>)}
                        </select>
                        <select className="form-select form-select-sm fw-bold text-secondary shadow-none border-1" style={{ width: '100px', cursor: 'pointer' }} value={seciliYil} onChange={(e) => { setSeciliYil(parseInt(e.target.value)); setSeciliGunler([]); }}>
                            {yillar.map(yil => <option key={yil} value={yil}>{yil}</option>)}
                        </select>

                        {/* YENİ: Backend geldiğinde çalışacak filtre butonu */}
                        <div className="vr ms-2 me-2"></div>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 fw-bold">
                            <span>Filtrele (Tüm Ekip)</span>
                            <span style={{ fontSize: '10px' }}>▼</span>
                        </button>
                    </div>

                    {/* SAĞ ÜST: AKSİYON BUTONLARI */}
                    <div>
                        {!isEditMode ? (
                            <button
                                className="btn text-white fw-bold shadow-sm px-4"
                                style={{ backgroundColor: colors.ziraatKirmizi, borderRadius: '8px' }}
                                onClick={() => setIsEditMode(true)}
                            >
                                + İzin Planla / Ekle
                            </button>
                        ) : (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-light fw-bold shadow-sm px-3 border"
                                    style={{ borderRadius: '8px', color: colors.koyuGri }}
                                    onClick={handleIptal}
                                >
                                    İptal
                                </button>

                                {/* YENİ: Planlanan Olarak Ekle (Turuncu) */}
                                <button
                                    className="btn text-dark fw-bold shadow-sm px-3"
                                    style={{
                                        backgroundColor: seciliGunler.length > 0 ? '#ffc107' : '#e9ecef',
                                        borderRadius: '8px',
                                        cursor: seciliGunler.length > 0 ? 'pointer' : 'not-allowed',
                                        border: '1px solid #ffc107'
                                    }}
                                    disabled={seciliGunler.length === 0}
                                >
                                    Planlanan Ekle
                                </button>

                                {/* YENİ: Kesinleştir (Ziraat Kırmızı - Ana Aksiyon) */}
                                <button
                                    className="btn text-white fw-bold shadow-sm px-4"
                                    style={{
                                        backgroundColor: seciliGunler.length > 0 ? colors.ziraatKirmizi : '#6c757d',
                                        borderRadius: '8px',
                                        cursor: seciliGunler.length > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                    disabled={seciliGunler.length === 0}
                                >
                                    Kesinleştir
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* TABLO */}
                <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0" style={{ fontSize: '13px' }}>

                            <thead style={{ backgroundColor: colors.acikGri, color: colors.koyuGri }}>
                                <tr>
                                    <th className="px-3 align-middle" style={{ minWidth: '150px' }}>Personel Ad Soyad</th>

                                    {gunler.map(gun => {
                                        const gercekTarih = new Date(seciliYil, seciliAy - 1, gun);
                                        const haftaninGunu = gercekTarih.getDay();
                                        const haftaSonuMu = haftaninGunu === 0 || haftaninGunu === 6;
                                        const gunAdi = gunIsimleri[haftaninGunu];
                                        const bugunMu = (seciliYil === gercekYil && seciliAy === gercekAy && gun === gercekGun);

                                        return (
                                            <th key={gun} className="text-center p-1" style={{ minWidth: '40px', backgroundColor: haftaSonuMu ? '#e9ecef' : 'transparent', color: haftaSonuMu ? '#dc3545' : colors.koyuGri }}>
                                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: bugunMu ? colors.ziraatKirmizi : (haftaSonuMu ? '#dc3545' : '#6c757d'), marginBottom: '2px' }}>
                                                    {gunAdi}
                                                </div>
                                                {bugunMu ? (
                                                    <div className="mx-auto d-flex justify-content-center align-items-center rounded-circle shadow-sm" style={{ backgroundColor: colors.ziraatKirmizi, color: 'white', width: '24px', height: '24px', fontSize: '13px' }}>
                                                        {gun}
                                                    </div>
                                                ) : (
                                                    <div className="fw-bold" style={{ fontSize: '13px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {gun}
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {personeller.map(p => {
                                    const benimSatirimMi = p.id === aktifKullanici.id;

                                    return (
                                        <tr key={p.id}>
                                            <td className="fw-medium px-3 align-middle text-dark bg-white">{p.adSoyad}</td>

                                            {gunler.map(gun => {
                                                const gercekTarih = new Date(seciliYil, seciliAy - 1, gun);
                                                const haftaninGunu = gercekTarih.getDay();
                                                const haftaSonuMu = haftaninGunu === 0 || haftaninGunu === 6;
                                                const gecmisMi = seciliYil < gercekYil || (seciliYil === gercekYil && seciliAy < gercekAy) || (seciliYil === gercekYil && seciliAy === gercekAy && gun < gercekGun);

                                                // Bu gün için veritabanında kayıtlı bir izin var mı?
                                                const kayitliIzin = p.izinler?.find(i => i.gun === gun);
                                                // Kullanıcı şu an bu günü seçiyor mu?
                                                const suAnSeciliyorMu = benimSatirimMi && seciliGunler.includes(gun);

                                                let bgColor = '#ffffff';
                                                let bgPattern = 'none';
                                                let textColor = 'inherit';

                                                // RENK HİYERARŞİSİ
                                                if (haftaSonuMu) {
                                                    bgColor = '#e9ecef';
                                                } else if (suAnSeciliyorMu) {
                                                    // Kullanıcı tıklarken mavi renk olsun (Seçim aşaması)
                                                    bgColor = '#0d6efd';
                                                    textColor = 'white';
                                                } else if (kayitliIzin) {
                                                    // Veritabanından gelen renkler
                                                    if (kayitliIzin.durum === 'Kesinlesen') {
                                                        bgColor = '#198754'; // Kesin yeşil
                                                        textColor = 'white';
                                                    } else if (kayitliIzin.durum === 'Planlanan') {
                                                        bgColor = '#ffc107'; // Planlanan turuncu/sarı
                                                        textColor = '#000';
                                                    }
                                                }

                                                // GEÇMİŞ KONTROLÜ (Deseni üste bindir)
                                                if (gecmisMi && !haftaSonuMu) {
                                                    bgPattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)';
                                                }

                                                // İMLEÇ (CURSOR) MANTIĞI
                                                let cursorStyle = 'default';
                                                if (isEditMode && benimSatirimMi) {
                                                    if (gecmisMi || haftaSonuMu || kayitliIzin) cursorStyle = 'not-allowed';
                                                    else cursorStyle = 'pointer';
                                                }

                                                return (
                                                    <td
                                                        key={gun}
                                                        onClick={() => benimSatirimMi && handleHucreTikla(gun, gecmisMi, haftaSonuMu, !!kayitliIzin)}
                                                        className="text-center align-middle p-0 border-end"
                                                        style={{
                                                            height: '40px',
                                                            backgroundColor: bgColor,
                                                            backgroundImage: bgPattern,
                                                            color: textColor,
                                                            cursor: cursorStyle,
                                                            transition: 'all 0.2s ease-in-out'
                                                        }}
                                                    >
                                                        {(suAnSeciliyorMu || kayitliIzin) && <span className="fw-bold">✓</span>}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}