import { useState, useEffect } from 'react';
import api from '../api';

export default function DashboardScreen({ user, onLogout }) {
    
    const colors = { primaryRed: '#E10514', darkGray: '#2C3238', lightGray: '#F8F9FA' };

    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    const [leaves, setLeaves] = useState([]);


    const fetchLeaves = async () => {
        if (!user || !user.id) return;
        try {
            const response = await api.get(`/Leave/employee/${user.id}`);
            setLeaves(response.data);
        } catch (error) {
            console.error('İzin bilgileri alınırken hata oluştu:', error);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, [user]);

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    const months = [
        { value: 1, name: 'Ocak' }, { value: 2, name: 'Şubat' }, { value: 3, name: 'Mart' },
        { value: 4, name: 'Nisan' }, { value: 5, name: 'Mayıs' }, { value: 6, name: 'Haziran' },
        { value: 7, name: 'Temmuz' }, { value: 8, name: 'Ağustos' }, { value: 9, name: 'Eylül' },
        { value: 10, name: 'Ekim' }, { value: 11, name: 'Kasım' }, { value: 12, name: 'Aralık' }
    ];

    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    const currentMonthLeaves = leaves.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getFullYear() === selectedYear && (leaveDate.getMonth() + 1) === selectedMonth;
    })
    .map(leave => ({
        day: new Date(leave.startDate).getDate(),
        status: leave.status
    }));

    const currentUser = user ? {
        id: user.id,
        fullName: `${user.name} ${user.surname}`,
        leaves: currentMonthLeaves
    } : null;

    const staffList = currentUser ? [currentUser] : [];

    const handleCellClick = (day, isPast, isWeekend, hasExistingLeave) => {
        if (!isEditMode || isPast || isWeekend || hasExistingLeave) return;

        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setSelectedDays([]);
    };

    const handleSaveLeaves = async (status) => {
        if (selectedDays.length === 0) return;

        try {
            const leaveRequests = selectedDays.map(day => {
                const leaveDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return api.post('/Leave', {
                    employeeId: user.id,
                    startDate: leaveDate,
                    endDate: leaveDate,
                    requestDate: new Date().toISOString(),
                    status: status
                });
            });

            await Promise.all(leaveRequests);

            alert(`${status === 'Planned' ? 'Planlanan' : 'Kesinleştirilen'} izinler başarıyla kaydedildi.`);

            await fetchLeaves();
            setIsEditMode(false);
            setSelectedDays([]);
        } catch (error) {
            console.error('İzin kaydedilirken hata oluştu:', error);
            alert('İzin kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    if (!currentUser) {
        return <div className="d-flex justify-content-center align-items-center vh-100">Kullanıcı bilgileri yükleniyor...</div>;
    }

    return (
        <div className="container-fluid p-0 vh-100 d-flex flex-column" style={{ backgroundColor: '#F0F2F5' }}>

            <header className="navbar navbar-dark sticky-top p-2 shadow" style={{ backgroundColor: colors.darkGray }}>
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fw-bold fs-5" href="#">Kurumsal İzin Sistemi</a>
                <div className="navbar-nav px-3 flex-row gap-3">
                    <span className="text-white small align-self-center">Hoş geldin, {currentUser.fullName}</span>
                    <button className="btn btn-sm text-white border-white" onClick={onLogout}>Çıkış Yap</button>
                </div>
            </header>

            <main className="container-fluid flex-grow-1 p-4 overflow-auto">

                <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="h5 fw-bold text-dark mb-0 me-3">Çizelge Dönemi:</h1>
                        <select className="form-select form-select-sm fw-bold text-secondary shadow-none border-1" style={{ width: '130px', cursor: 'pointer' }} value={selectedMonth} onChange={(e) => { setSelectedMonth(parseInt(e.target.value)); setSelectedDays([]); }}>
                            {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
                        </select>
                        <select className="form-select form-select-sm fw-bold text-secondary shadow-none border-1" style={{ width: '100px', cursor: 'pointer' }} value={selectedYear} onChange={(e) => { setSelectedYear(parseInt(e.target.value)); setSelectedDays([]); }}>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>

                        <div className="vr ms-2 me-2"></div>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 fw-bold">
                            <span>Filtrele (Tüm Ekip)</span>
                            <span style={{ fontSize: '10px' }}>▼</span>
                        </button>
                    </div>

                    <div>
                        {!isEditMode ? (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn text-white fw-bold shadow-sm px-4"
                                    style={{ backgroundColor: colors.primaryRed, borderRadius: '8px', width: '153px' }}
                                    onClick={() => setIsEditMode(true)}
                                >
                                    + İzin Planla
                                </button>
                                <button
                                    className="btn text-white fw-bold shadow-sm px-4"
                                    style={{ backgroundColor: colors.primaryRed, borderRadius: '8px', width: '153px' }}
                                    onClick={() => alert('Düzenleme menüsü açılacak')}
                                >
                                    - İzin Düzenle
                                </button>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-light fw-bold shadow-sm px-3 border"
                                    style={{ borderRadius: '8px', color: colors.darkGray }}
                                    onClick={handleCancel}
                                >
                                    İptal
                                </button>

                                <button
                                    className="btn text-dark fw-bold shadow-sm px-3"
                                    style={{
                                        backgroundColor: selectedDays.length > 0 ? '#ffc107' : '#e9ecef',
                                        borderRadius: '8px',
                                        cursor: selectedDays.length > 0 ? 'pointer' : 'not-allowed',
                                        border: '1px solid #ffc107'
                                    }}
                                    disabled={selectedDays.length === 0}
                                    
                                    onClick={() => handleSaveLeaves('Planned')}
                                >
                                    Planlanan Ekle
                                </button>

                                <button
                                    className="btn text-white fw-bold shadow-sm px-4"
                                    style={{
                                        backgroundColor: selectedDays.length > 0 ? colors.primaryRed : '#6c757d',
                                        borderRadius: '8px',
                                        cursor: selectedDays.length > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                    disabled={selectedDays.length === 0}

                                    onClick={() => handleSaveLeaves('Approved')}
                                >
                                    Kesinleştir
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card shadow-sm border-0" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0" style={{ fontSize: '13px' }}>

                            <thead style={{ backgroundColor: colors.lightGray, color: colors.darkGray }}>
                                <tr>
                                    <th className="px-3 align-middle" style={{ minWidth: '150px' }}>Çalışan Ad Soyad</th>

                                    {days.map(day => {
                                        const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                        const dayOfWeek = actualDate.getDay();
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                        const dayName = dayNames[dayOfWeek];
                                        const isToday = (selectedYear === currentYear && selectedMonth === currentMonth && day === currentDay);

                                        return (
                                            <th key={day} className="text-center p-1" style={{ minWidth: '40px', backgroundColor: isWeekend ? '#e9ecef' : 'transparent', color: isWeekend ? '#dc3545' : colors.darkGray }}>
                                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: isToday ? colors.primaryRed : (isWeekend ? '#dc3545' : '#6c757d'), marginBottom: '2px' }}>
                                                    {dayName}
                                                </div>
                                                {isToday ? (
                                                    <div className="mx-auto d-flex justify-content-center align-items-center rounded-circle shadow-sm" style={{ backgroundColor: colors.primaryRed, color: 'white', width: '24px', height: '24px', fontSize: '13px' }}>
                                                        {day}
                                                    </div>
                                                ) : (
                                                    <div className="fw-bold" style={{ fontSize: '13px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {day}
                                                    </div>
                                                )}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {staffList.map(person => {
                                    const isCurrentUser = person.id === currentUser.id;

                                    return (
                                        <tr key={person.id}>
                                            <td className="fw-medium px-3 align-middle text-dark bg-white">{person.fullName}</td>

                                            {days.map(day => {
                                                const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                                const dayOfWeek = actualDate.getDay();
                                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                                const isPast = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth) || (selectedYear === currentYear && selectedMonth === currentMonth && day < currentDay);

                                                const existingLeave = person.leaves?.find(l => l.day === day);
                                                const isCurrentlySelected = isCurrentUser && selectedDays.includes(day);

                                                let bgColor = '#ffffff';
                                                let bgPattern = 'none';
                                                let textColor = 'inherit';

                                                if (isWeekend) {
                                                    bgColor = '#e9ecef';
                                                } else if (isCurrentlySelected) {
                                                    bgColor = '#0d6efd';
                                                    textColor = 'white';
                                                } else if (existingLeave) {
                                                    if (existingLeave.status === 'Approved') {
                                                        bgColor = '#59f7ad'; 
                                                        textColor = 'white';
                                                    } else if (existingLeave.status === 'Planned') {
                                                        bgColor = '#ffd659'; 
                                                        textColor = '#000';
                                                    }
                                                }

                                                if (isPast && !isWeekend) {
                                                    bgPattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)';
                                                }

                                                let cursorStyle = 'default';
                                                if (isEditMode && isCurrentUser) {
                                                    if (isPast || isWeekend || existingLeave) cursorStyle = 'not-allowed';
                                                    else cursorStyle = 'pointer';
                                                }

                                                return (
                                                    <td
                                                        key={day}
                                                        onClick={() => isCurrentUser && handleCellClick(day, isPast, isWeekend, !!existingLeave)}
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
                                                        {(isCurrentlySelected || existingLeave) && <span className="fw-bold">✓</span>}
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