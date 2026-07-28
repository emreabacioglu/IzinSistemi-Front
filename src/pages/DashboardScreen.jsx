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

    const publicHolidays = [
        '01-01', // Yılbaşı
        '04-23', // Ulusal Egemenlik ve Çocuk Bayramı
        '05-01', // Emek ve Dayanışma Günü
        '05-19', // Atatürk'ü Anma, Gençlik ve Spor Bayramı
        '07-15', // Demokrasi ve Milli Birlik Günü
        '08-30', // Zafer Bayramı
        '10-29'  // Cumhuriyet Bayramı
    ];

    const currentMonthLeaves = leaves.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getFullYear() === selectedYear && (leaveDate.getMonth() + 1) === selectedMonth;
    })
    .map(leave => {

        let standardizedStatus = leave.status;
        if (standardizedStatus === 'Planned') standardizedStatus = 'Planlanan';
        if (standardizedStatus === 'Approved') standardizedStatus = 'Kesinleşen';
        //if (standardizedStatus === 'Cancelled') standardizedStatus = 'İptal Edilen';
    
        return {
            id: leave.id,
            day: new Date(leave.startDate).getDate(),
            status: standardizedStatus
        };
    });

    const currentUser = user ? {
        id: user.id,
        fullName: `${user.name} ${user.surname}`,
        leaves: currentMonthLeaves
    } : null;

    const staffList = currentUser ? [currentUser] : [];

    const handleCellClick = (day, isPast, isWeekend, clickedStatus) => {
        if (!isEditMode || isPast || isWeekend) return;

        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
            return;
        }
        
        let currentHasEmpty = false;
        let currentHasConfirmed = false;
        let currentHasPlanned = false;

        selectedDays.forEach(selectedDay => {
            const cell = currentMonthLeaves.find(l => l.day === selectedDay);

            if (!cell || (cell && (cell.status === null || cell.status === undefined))) currentHasEmpty = true;
            if (cell && cell.status === 'Kesinleşen') currentHasConfirmed = true;
            if (cell && cell.status === 'Planlanan') currentHasPlanned = true;
        });

        const isClickedEmpty = !clickedStatus;
        const isClickedConfirmed = clickedStatus === 'Kesinleşen';

        if (currentHasEmpty && isClickedConfirmed) {
            alert('Boş günler ile Kesinleşen izinler aynı anda seçilemez.');
            return;
        }

        if (currentHasConfirmed && isClickedEmpty) {
            alert('Kesinleşen izin ile boş günler aynı anda seçilemez.');
            return;
        }
        setSelectedDays([...selectedDays, day]);
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

            alert(`${status === 'Planned' ? 'Planlanan' : 'Kesinleşen'} izinler başarıyla kaydedildi.`);

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

    const getSelectionActions = () => {
        let hasEmpty = false;
        let hasPlanned = false;
        let hasConfirmed = false;

        selectedDays.forEach(day => {
            const cell = currentMonthLeaves.find(l => l.day === day);

            if (!cell || (cell && (cell.status === null || cell.status === undefined))){
                hasEmpty = true;
            }
            if (cell && cell.status === 'Planlanan') hasPlanned = true;
            if (cell && cell.status === 'Kesinleşen') hasConfirmed = true;
        });
        
        const canPlan = hasEmpty && !hasPlanned && !hasConfirmed;
        const canConfirm = !hasConfirmed && (hasPlanned || hasEmpty);
        const canCancel = !hasEmpty && (hasPlanned || hasConfirmed);

        return { canPlan, canConfirm, canCancel };
    };
    const { canPlan, canConfirm, canCancel } = getSelectionActions();

    const handleUpdateStatus = async (newStatus) => {
        if (selectedDays.length === 0) return;

        try {
            const request = selectedDays.map(day => {
                const leaveDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                return api.post('/Leave', {
                    employeeId: user.id,
                    startDate: leaveDate,
                    endDate: leaveDate,
                    requestDate: new Date().toISOString(),
                    status:newStatus
                });
            });

            await Promise.all(request);

            await fetchLeaves();

            setSelectedDays([]);
            setIsEditMode(false);

        } catch (error) {
            console.error(`${newStatus} status update failed:`, error);
            alert('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.')
        }
    };

    const handleDeleteLeaves = async () => {
        if (selectedDays.length === 0) return;

        const isUserSure = window.confirm(`Seçtiğiniz ${selectedDays.length} günlük izni iptal etmek istediğinize emin misiniz?`);
        if (!isUserSure) return;

        try {
            const deleteRequest = selectedDays.map(day => {
                const leaveToDelete = currentMonthLeaves.find(l => l.day === day);

                if (leaveToDelete && leaveToDelete.id){
                    return api.delete(`/Leave/${leaveToDelete.id}`);
                }
                return Promise.resolve();
            });

            await Promise.all(deleteRequest);

            await fetchLeaves();

            setSelectedDays([]);
            setIsEditMode(false);

        } catch (error) {
            console.error('Leave deletion failed:', error);
            alert('İzinler iptal edilirken bir hata oluştu.')
        }
    };

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
                                    style={{ backgroundColor: colors.primaryRed, borderRadius: '8px'}}
                                    onClick={() => setIsEditMode(true)}
                                >
                                    İzin Ekle / Düzenle
                                </button>
                            </div>
                        ):(
                            <div className="d-flex gap-2 align-items-center">
                                <span className="text-muted small fw-bold me-2">
                                    Seçili Günler: {selectedDays.length}
                                </span>
                                <button
                                    className="btn btn-warning fw-bold shadow-sm"
                                    disabled={!canPlan}
                                    onClick={() => handleUpdateStatus('Planlanan')}
                                >
                                    Planla 
                                </button>
                                
                                <button
                                    className="btn btn-success fw-bold shadow-sm"
                                    disabled={!canConfirm}
                                    onClick={() => handleUpdateStatus('Kesinleşen')}
                                >
                                    Kesinleştir
                                </button>

                                <button
                                    className="btn btn-danger fw-bold shadow-sm"
                                    disabled={!canCancel}
                                    onClick={() => handleDeleteLeaves()}
                                >
                                    İptal Et
                                </button>

                                <button
                                    className="btn btn-outline-secondary fw-bold shadow-sm"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setSelectedDays([]);
                                    }}
                                >
                                    Vazgeç
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

                                        const dateString = `${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const isHoliday = publicHolidays.includes(dateString);
                                        const isOffDay = isWeekend || isHoliday;

                                        return (
                                            <th key={day} className="text-center p-1" style={{ minWidth: '40px', backgroundColor: isWeekend ? '#e9ecef' : 'transparent', color: isOffDay ? '#dc3545' : colors.darkGray }}>
                                                <div style={{ fontSize: '10px', fontWeight: 'bold', color: isToday ? colors.primaryRed : (isOffDay ? '#dc3545' : '#6c757d'), marginBottom: '2px' }}>
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
                                                
                                                const dateString = `${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const isHoliday = publicHolidays.includes(dateString);
                                                const isOffDay = isWeekend || isHoliday;

                                                const existingLeave = person.leaves?.find(l => l.day === day);
                                                const isCurrentlySelected = isCurrentUser && selectedDays.includes(day);

                                                let bgColor = '#ffffff';
                                                let bgPattern = 'none';
                                                let textColor = 'inherit';

                                                if (isWeekend) {
                                                    bgColor = '#e9ecef';
                                                }
                                                else if (isHoliday){
                                                    bgColor = '#fffff'
                                                
                                                } else if (existingLeave) {
                                                    if (existingLeave.status === 'Kesinleşen') {
                                                        bgColor = '#59f7ad'; 
                                                        textColor = 'white';
                                                    } else if (existingLeave.status === 'Planlanan') {
                                                        bgColor = '#ffd659'; 
                                                        textColor = '#000';
                                                    }
                                                }

                                                if (isPast && !isOffDay) {
                                                    bgPattern = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)';
                                                }

                                                let cursorStyle = 'default';
                                                if (isEditMode && isCurrentUser) {
                                                    if (isPast || isOffDay) cursorStyle = 'not-allowed';
                                                    else cursorStyle = 'pointer';
                                                }

                                                return (
                                                    <td
                                                        key={day}
                                                        onClick={() => isCurrentUser && handleCellClick(day, isPast, isOffDay, existingLeave?.status)}
                                                        className="text-center align-middle p-0 border-end"
                                                        style={{
                                                            height: '40px',
                                                            backgroundColor: bgColor,
                                                            backgroundImage: bgPattern,
                                                            color: textColor,
                                                            cursor: cursorStyle,
                                                            transition: 'all 0.2s ease-in-out',

                                                            boxShadow: isHoliday ? `inset 0 0 0 2px ${colors.primaryRed}` : 'none' //çerçece kısmı burası 
                                                        }}
                                                    >
                                                        {isEditMode && isCurrentlySelected && (
                                                            <span className="fw-bold text-dark" style={{ fontSize: '1.25rem' }}>✓</span>
                                                        )}
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