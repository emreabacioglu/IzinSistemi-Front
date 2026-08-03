import { useState, useEffect, useRef} from 'react';
import api from '../api';

export default function DashboardScreen({ user, onLogout }) {
    
    const colors = { primaryRed: '#E10514', darkGray: '#2C3238', lightGray: '#F8F9FA' };

    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    const [leaves, setLeaves] = useState([]);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);

    const [selectedDept, setSelectedDept] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');

    const [totalLeaveDays, setTotalLeaveDays] = useState(14);
    //const [leaveResetDay, setLeaveResetDay] = useState('');
    const [leaveResetMonth, setLeaveResetMonth] = useState('');
    //const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');

    const [leaveResetDate, setLeaveResetDate] = useState(''); 
    const [birthDate, setBirthDate] = useState('');

    const [isProfileSetupDone, setIsProfileSetupDone] = useState(false);

    const [filterDepartment, setFilterDepartment] = useState(user?.department || 'Tümü');
    const [selectedStaffIds, setSelectedStaffIds] = useState([]);

    const [allStaff, setAllStaff] = useState([]);

    const [publicHolidays, setPublicHolidays] = useState([]);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [showPersonFilter, setShowPersonFilter] = useState(false);
    const personFilterRef = useRef(null);
    const dropdownRef = useRef(null);
    
    
    

    const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

    const getDaysForMonth = (monthValue) => {
        if (!monthValue) return 31;
        const m = parseInt(monthValue, 10);
        if (m === 2) return 29;
        if ([4, 6, 9, 11].includes(m)) return 30;
        return 31;
    };

    const fetchLeaves = async () => {
        if (!user || !user.id) return;
        try {
            const response = await api.get(`/Leave/employee/${user.id}`);
            setLeaves(response.data);
        } catch (error) {
            console.error('İzin bilgileri alınırken hata oluştu:', error);
        }
    };

    const fetchAllStaff =async () => {
        try {
            const response = await api.get('/Employee');
            setAllStaff(response.data);
        }catch (error) {
            console.error('Çalışan listesi alınırken bir hata oluştu:', error);
        }
    };


    useEffect(() => {
        fetchLeaves();
        fetchAllStaff();
    }, [user]);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (personFilterRef.current && !personFilterRef.current.contains(event.target)) {
                setShowPersonFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const [customAlert, setCustomAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', 
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

    const fetchHolidays = async (year) => {
        try{
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/TR`);
            if (response.ok) {
                const holidaysData = await response.json();

                const formattedHolidays = holidaysData.map(holiday => {
                    const dateObj = new Date(holiday.date);
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    return {
                        dateString: `${month}-${day}`,
                        month: dateObj.getMonth() + 1,
                        day: dateObj.getDate(),
                        name: holiday.localName

                    };
                });

                setPublicHolidays(formattedHolidays);
            }
        } catch (error) {
            console.error('Tatil günleri çekilirken hata:', error);
        }        
    };

    useEffect(() => {
        fetchHolidays(selectedYear);
    }, [selectedYear]);

    const processUserLeaves = (rawLeaves) => {
        if (!rawLeaves) return [];

        return rawLeaves.filter(leave => {
            const leaveDate = new Date(leave.startDate);
            const today = new Date();
            today.setHours(0,0,0,0);

            if (leave.status === 'Planned' && leaveDate <= today){
                return false;
            }
            return leaveDate.getFullYear() === selectedYear && (leaveDate.getMonth() + 1) === selectedMonth;
        })
        .map(leave => {

            let standardizedStatus = leave.status;
            if (standardizedStatus === 'Planned') standardizedStatus = 'Planlanan';
            if (standardizedStatus === 'Approved') standardizedStatus = 'Kesinleşen';
        
            return {
                id: leave.id,
                day: new Date(leave.startDate).getDate(),
                status: standardizedStatus
            };
        });
    };

    const currentMonthLeaves = processUserLeaves(leaves);

    const todayForCalc = new Date();
    todayForCalc.setHours(0,0,0,0);
    const usedLeavesThisYear = leaves.filter(l => {
        const d = new Date(l.startDate);
        return d.getFullYear() === currentYear && (l.status === 'Kesinleşen' || l.status === 'Approved');
    }).length;

    const remainingLeaves = totalLeaveDays - usedLeavesThisYear;

    const upcomingLeaves = leaves.filter(l => {
        const d = new Date(l.startDate);
        return d >= todayForCalc && (l.status === 'Kesinleşen' || l.status === 'Approved'); //palnlanan eklenebilir
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    let nextLeaveText = 'Yok';
    if (upcomingLeaves.length > 0) {
        const nextDate = new Date(upcomingLeaves[0].startDate);
        const nextMonthName = months.find(m => m.value === (nextDate.getMonth() + 1))?.name;
        nextLeaveText = `${nextDate.getDate()} ${nextMonthName}`;
    }

    const currentDept = isProfileSetupDone ? selectedDept : user?.department;
    const currentTitle = isProfileSetupDone ? selectedTitle : user?.title;

    const currentUser = user ? {
        id: user.id,
        fullName: `${user.name} ${user.surname}`,
        department: currentDept,
        title: currentTitle,
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
            showCustomAlert('Geçersiz Seçim', 'Boş günler ile kesinleşen izinler aynı anda seçilemez.', 'warning');
            return;
        }

        if (currentHasConfirmed && isClickedEmpty) {
            showCustomAlert('Geçersiz Seçim', 'Boş günler ile kesinleşen izinler aynı anda seçilemez.', 'warning');
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
            await fetchLeaves();

            setIsEditMode(false);
            setSelectedDays([]);

            showCustomAlert('Başarılı', `Seçili izinler "${status === 'Planned' ? 'Planlanan' : 'Kesinleşen'}" olarak kaydedildi.`, 'success');

        } catch (error) {
            console.error('İzin kaydedilirken hata:', error);
            showCustomAlert('Hata', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.', 'danger');
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

        let title = '';
        let message = '';

        if (newStatus === 'Kesinleşen') {
            title = 'İzin Kesinleştirme Onayı';
            const newRemaining = remainingLeaves - selectedDays.length;
            message = `Seçtiğiniz ${selectedDays.length} günlük izni kesinleştirmek üzeresiniz. Bu işlemden sonra kalan izin hakkınız ${newRemaining} güne düşecektir. Onaylıyor musunuz?`;
        } else {
            title = 'İzin Planlama Onayı';
            message = `Seçtiğiniz ${selectedDays.length} günlük izni "Planlanan" olarak kaydetmek istediğinize emin misiniz?`;
        }
        
        showCustomAlert(
            title,
            message,
            newStatus === 'Kesinleşen' ? 'info' : 'warning', 
            true,
            async () => {

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

                showCustomAlert('Başarılı', `Seçili izinler "${newStatus}" olarak güncellendi.`, 'success');

                } catch (error) {
                    console.error(`${newStatus} status update failed:`, error);
                    showCustomAlert('Hata', 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyiniz.', 'danger');
                }
            }
        );
    };

    const handleDeleteLeaves = () => {
        if (selectedDays.length === 0) return;

        showCustomAlert(
            'İptal Onayı',
            `Seçtiğiniz ${selectedDays.length} günlük izni iptal etmek istediğinize emin misiniz?`,
            'warning',
             true,
             async () => {
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
                    
                    showCustomAlert('Başarılı', 'İzinler başarıyla iptal edildi.', 'success');

                } catch (error) {
                    console.error('Leave deletion failed:', error);
                    showCustomAlert('Hata', 'İzinler iptal edilirken bir hata oluştu.', 'danger');
                }
            }
        );
    };

    useEffect(() => {
        if (user && (user.department === 'Belirtilmedi' || !user.department) && !isProfileSetupDone) {
            setShowProfileModal(true);
        }
    }, [user, isProfileSetupDone]);


    const handleCompleteProfile = async (e) => {
        if(e) e.preventDefault(); 

        try {
            await api.put(`/Auth/UpdateProfile/${user.id}`, {
                department: selectedDept,
                title: selectedTitle
            });

            const updatedUser = { ...user, department: selectedDept, title: selectedTitle};
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsProfileSetupDone(true);
            setShowProfileModal(false);
            setFilterDepartment(selectedDept);

            await fetchAllStaff();

            showCustomAlert('Tebrikler', 'Profil başarıyla güncellendi.', 'success');

        } catch (error) {
            console.error("Profil güncellenirken hata:", error);
            showCustomAlert('Hata', 'Profil bilgileri kaydedilirken bir hata oluştu.', 'danger');
        }
    };


    const processedStaff = allStaff.map(person =>{
        if (person.id === currentUser?.id){
            return {...person, leaves: currentMonthLeaves};
        }
        return {...person, leaves: processUserLeaves(person.leaves) };
    });

    let filteredStaff = processedStaff.filter(person => {
        if (!person.department || person.department === 'Belirtilmedi') return false;
        if (filterDepartment === 'Tümü') return true;

        if (filterDepartment === 'Bankacılık Hizmetleri') {
            return person.department === 'Nakit Yönetimi' || person.department === 'Çek Senet';
        }
        return person.department === filterDepartment;
    });

    filteredStaff.sort((a, b) => {
        
        if (a.title === 'Yönetici' && b.title !== 'Yönetici') return -1;
        if (b.title === 'Yönetici' && a.title !== 'Yönetici') return 1;

        if(a.id === currentUser.id) return -1;
        if(b.id === currentUser.id) return 1;

        const isASameTitle = a.title === currentUser.title;
        const isBSameTitle = b.title === currentUser.title;

        if (isASameTitle && !isBSameTitle) return -1;
        if (!isASameTitle && isBSameTitle) return 1;

        const roleOrder = { 'Analist': 1, 'Yazılımcı': 2};
        const roleA = roleOrder[a.title] || 99;
        const roleB = roleOrder[b.title] || 99;

        if (roleA !== roleB) return roleA - roleB;

        return a.fullName.localeCompare(b.fullName);
    });

    const displayedStaff = selectedStaffIds.length > 0 
        ? filteredStaff.filter(p => selectedStaffIds.includes(p.id))
        : filteredStaff;


    return (
        <div className="container-fluid p-0 vh-100 d-flex flex-column" style={{ backgroundColor: '#F0F2F5' }}>

            <header className="navbar navbar-dark sticky-top p-2 shadow" style={{ backgroundColor: colors.darkGray, zIndex: 1040 }}>
                <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fw-bold fs-5" href="#">Kurumsal İzin Sistemi</a>
                
                <div className="navbar-nav px-3 flex-row align-items-center">
                    
                    <style>
                        {`
                        .custom-profile-btn {
                            cursor: pointer;
                            border-radius: 8px;
                            transition: background-color 0.2s ease;
                        }
                        .custom-profile-btn:hover {
                            background-color: rgba(255, 255, 255, 0.06); 
                        }
                        
                        .custom-dropdown {
                            background-color: #363C42; 
                            border: 1px solid rgba(255,255,255,0.08);
                            border-radius: 8px;
                            padding: 4px 0;
                            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                        }
                        .custom-dropdown-item {
                            color: #d1d5db; 
                            font-size: 13px; 
                            padding: 8px 16px;
                            transition: all 0.2s ease;
                        }
                        .custom-dropdown-item:hover {
                            background-color: rgba(255,255,255,0.08);
                            color: #ffffff;
                        }
                        .custom-divider {
                            border-color: rgba(255,255,255,0.08);
                            margin: 4px 0;
                        }
                        
                        /* Çıkış Yap butonu için özel yumuşatılmış hover efekti */
                        .logout-btn:hover {
                            background-color: rgba(225, 5, 20, 0.15) !important;
                            color: #ff8787 !important; /* Soft bir kırmızı */
                        }
                        `}
                    </style>

                    {/* ref={dropdownRef} buraya eklendi ki dışarı tıklamayı algılayabilelim */}
                    <div className="dropdown position-relative" ref={dropdownRef}>
                        <div 
                            className="d-flex align-items-center gap-3 user-select-none py-1 px-2 custom-profile-btn" 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <div className="text-end d-none d-sm-block">
                                <div className="text-white fw-bold" style={{ fontSize: '14px' }}>
                                    Hoş geldin, {currentUser.fullName}
                                </div>
                                <div className="d-flex flex-column align-items-end mt-1">
                                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', backgroundColor: remainingLeaves > 3 ? '#62e799' : '#f3e411', borderRadius: '50%' }}></div>
                                        <span className="text-light">Kalan İzin: <span className="fw-bold" style={{ color: remainingLeaves > 3 ? '#62e799' : '#f3e411' }}>{remainingLeaves} Gün</span></span>
                                    </div>
                                    <div className="text-white-50" style={{ fontSize: '11px', marginTop: '2px' }}>
                                        En Yakın İzin: <span className="text-light fw-medium">{nextLeaveText}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="d-flex align-items-center gap-2">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" 
                                    style={{ width: '42px', height: '42px', backgroundColor: colors.primaryRed, fontSize: '15px' }}
                                >
                                    {currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                                </div>
                                <span className="text-white-50" style={{ fontSize: '10px' }}>▼</span>
                            </div>
                        </div>

                        <ul 
                            className={`dropdown-menu dropdown-menu-end mt-2 custom-dropdown ${showProfileMenu ? 'd-block' : 'd-none'}`} 
                            style={{ position: 'absolute', top: '100%', right: '0', minWidth: '160px' }}
                        >
                            <li>
                                <button className="dropdown-item custom-dropdown-item d-flex align-items-center gap-2" onClick={() => { 
                                    setModalStep(1); 
                                    setShowProfileModal(true); 
                                    setShowProfileMenu(false);
                                }}>
                                    <span style={{ fontSize: '14px' }}>⚙️</span> Profili Düzenle
                                </button>
                            </li>
                            <li><hr className="dropdown-divider custom-divider" /></li>
                            <li>
                                {/* Çıkış Yap butonu text-danger'dan kurtuldu, .logout-btn class'ı eklendi */}
                                <button className="dropdown-item custom-dropdown-item logout-btn d-flex align-items-center gap-2" onClick={onLogout}>
                                    <span style={{ fontSize: '14px' }}>🚪</span> Çıkış Yap
                                </button>
                            </li>
                        </ul>
                    </div>
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

                        <select
                         className="form-select form-select-sm fw-bold text-primary shadow-none border-1"
                         style={{ width: '180px', cursor: 'pointer', backgroundColor: '#e9ecef'}}
                         value={filterDepartment}
                         onChange={(e) => {
                            setFilterDepartment(e.target.value);
                            setSelectedStaffIds([]);
                         }}
                         >
                            <option value="Tümü">Tüm Departmanlar</option>
                            <option value="Temel Bankacılık">Temel Bankacılık</option>
                            <option value="Bankacılık Hizmetleri">Bankacılık Hizmetleri</option>
                            <option value="Nakit Yönetimi">&nbsp;&nbsp;&nbsp;Nakit Yönetimi</option>
                            <option value="Çek Senet">&nbsp;&nbsp;&nbsp;Çek Senet</option>      
                        </select>
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
                    <div className="table-responsive" style={{ minHeight: '450px'}}>
                        <table className="table table-bordered mb-0" style={{ fontSize: '13px' }}>

                            <thead style={{ backgroundColor: colors.lightGray, color: colors.darkGray }}>
                                <tr>
                                    <th className="px-3 align-middle position-relative" style={{ minWidth: '180px' }} ref = {personFilterRef}>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Çalışan Ad Soyad</span>
                                            <div className="d-flex align-items-center gap-2">
                                                {selectedStaffIds.length > 0 && (
                                                    <button
                                                        className="btn btn-sm text-danger p-1 d-flex align-items-center me-1"
                                                        title="Seçimi Temizle"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedStaffIds([]);
                                                            setShowPersonFilter(false);
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: '1' }}>×</span>
                                                    </button>
                                                )}
                                                <button
                                                    className={`btn btn-sm p-0 d-flex align-items-center ${selectedStaffIds.length > 0 ? 'text-primary' : 'text-muted'}`}
                                                    onClick={() => setShowPersonFilter(!showPersonFilter)}
                                                >
                                                    <span style={{ fontSize: '12px' }}>▼</span>
                                                </button>
                                            </div> 
                                        </div>

                                        <ul
                                            className={`dropdown-menu shadow border-0 mt-2 p-2 ${showPersonFilter ? 'd-block' : 'd-none'}`}
                                            style={{ position: 'absolute', top: '100%', left: '0', minWidth: '220px', maxHeight: '300px', overflowY: 'auto', zIndex: 1050, borderRadius: '8px' }}
                                        >
                                            {filteredStaff.length === 0 ? (
                                                <li className='text-muted small text-center p-2'>Bu departmanda kimse bulunamadı.</li>
                                            ) : (
                                                filteredStaff.map(person => (
                                                    <li key={person.id} className='form-check m-1'>
                                                        <input
                                                            className='form-check-input shadow-none'
                                                            type='checkbox'
                                                            id={`filter-check-${person.id}`}
                                                            checked={selectedStaffIds.includes(person.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedStaffIds([...selectedStaffIds, person.id]);
                                                                } else {
                                                                    setSelectedStaffIds(selectedStaffIds.filter(id => id !== person.id));
                                                                }
                                                            }}
                                                        />
                                                        <label className='form-check-label w-100 user-select-none' htmlFor={`filter-check-${person.id}`} style={{ cursor: 'pointer', fontSize: '13px' }}>
                                                            {person.fullName} <span className='text-muted' style={{ fontSize: '11px' }}>({person.title})</span>
                                                        </label>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </th>

                                    {days.map(day => {
                                        const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                        const dayOfWeek = actualDate.getDay();
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                        const dayName = dayNames[dayOfWeek];
                                        const isToday = (selectedYear === currentYear && selectedMonth === currentMonth && day === currentDay);

                                        const dateString = `${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                        const isHoliday = publicHolidays.some(h => h.month === selectedMonth && h.day === day);
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

                                    <th className='px-3 align-middle text-center' style={{ minWidth: '80px,', backgroundColor: '#e9ecef'}}>
                                        Toplam
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {displayedStaff.map(person => {
                                    const isCurrentUser = person.id === currentUser.id;

                                    let titleBadge = null;

                                    if (person.title === 'Yönetici') {
                                        titleBadge = <span className='badge bg-dark ms-2 shadow-sm' style={{ fontSize: '9px', letterSpacing: '0.5px' }}>YÖNETİCİ</span>;
                                    } else if (person.title === 'Analist') {
                                        titleBadge = <span className="badge ms-2 shadow-sm" style={{ backgroundColor: '#0d6efd', fontSize: '9px', letterSpacing: '0.5px' }}>ANALİST</span>;
                                    } else if (person.title === 'Yazılımcı') {
                                        titleBadge = <span className="badge ms-2 shadow-sm" style={{ backgroundColor: '#198754', fontSize: '9px', letterSpacing: '0.5px' }}>YAZILIMCI</span>;
                                    }

                                    return (
                                        <tr key={person.id}>
                                            <td className="fw-medium px-3 align-middle text-dark border-end" style={{ backgroundColor: isCurrentUser ? '#fdfbfb' : 'white' }}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        {person.fullName}
                                                        {isCurrentUser && <span className="badge bg-danger ms-1 rounded-pill" style={{fontSize: '8px'}}>SEN</span>}
                                                    </div>
                                                    <div>
                                                        {titleBadge}
                                                    </div>
                                                </div>
                                            </td>


                                            {days.map(day => {
                                                const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                                const dayOfWeek = actualDate.getDay();
                                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                                const isPast = selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth) || (selectedYear === currentYear && selectedMonth === currentMonth && day < currentDay);
                                                
                                                const dateString = `${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const isHoliday = publicHolidays.some(h => h.month === selectedMonth && h.day === day);
                                                const isOffDay = isWeekend || isHoliday;

                                                const existingLeave = person.leaves?.find(l => l.day === day);
                                                const isCurrentlySelected = isCurrentUser && selectedDays.includes(day);

                                                let bgColor = '#ffffff';
                                                let bgPattern = 'none';
                                                let textColor = 'inherit';

                                                if (isHoliday){
                                                    bgColor = '#ffe5e5'
                                                    textColor = '#d9534f'

                                                } else if (isWeekend) {
                                                    bgColor = '#f1f3f5'; //#e9ecef
                                                
                                                }else if (isHoliday){
                                                    bgColor = '#ffe5e5'
                                                    textColor = '#d9534f'
                                                
                                                } else if (existingLeave) {
                                                    if (existingLeave.status === 'Kesinleşen') {
                                                        bgColor = '#62e799'; 
                                                        textColor = 'white';
                                                    } else if (existingLeave.status === 'Planlanan') {
                                                        bgColor = '#f3e411'; 
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

                                                            boxShadow: 'none' //isHoliday ? `inset 0 0 0 2px ${colors.primaryRed}` : 'none' //çerçece kısmı burası 
                                                        }}
                                                    >
                                                        {isEditMode && isCurrentlySelected && (
                                                            <span className="fw-bold text-dark" style={{ fontSize: '1.25rem' }}>✓</span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            <td className='text-center align-middle fw-bold border-start bg-light'>
                                                {person.leaves?.filter(l => l.status === 'Kesinleşen').length || 0}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {displayedStaff.length < 10 && Array.from({ length: 10 - displayedStaff.length }).map((_, index) => (
                                    <tr key={`empty-row-${index}`}>
                                        <td className="px-3 align-middle border-end bg-white" style={{ height: '40px' }}></td>
                                        
                                        {days.map(day => {
                                            const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                            const isWeekend = actualDate.getDay() === 0 || actualDate.getDay() === 6;
                                            const isHoliday = publicHolidays.some(h => h.month === selectedMonth && h.day === day);
                                            
                                            let bgColor = '#ffffff';
                                            if (isWeekend) bgColor = '#f1f3f5';
                                            else if (isHoliday) bgColor = '#ffe5e5';

                                            return (
                                                <td 
                                                    key={`empty-${day}`} 
                                                    className="border-end" 
                                                    style={{ backgroundColor: bgColor }}
                                                ></td>
                                            );
                                        })}
                                        
                                        <td className="border-start bg-light"></td>
                                    </tr>
                                ))}

                                <tr style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6'}}>
                                    <td className='text-center fw-bold px-3 py-2 text-muted'>Günlük İzinli Sayısı:</td>
                                    {days.map(day => {
                                        const totalOnLeave = displayedStaff.reduce((sum, p) => {
                                            const hasLeave = p.leaves && p.leaves.some(l => l.day === day && l.status === 'Kesinleşen' );
                                            return sum + (hasLeave ? 1 : 0);
                                        }, 0);

                                        const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                                        const isWeekend = actualDate.getDay() === 0 || actualDate.getDay() === 6;
                                        return (
                                            <td key={`total-${day}`} className="text-center align-middle fw-bold" style={{ backgroundColor: isWeekend ? '#e9ecef' : 'transparent', color: totalOnLeave > 0 ? '#E10514' : '#adb5bd' }}>
                                                {totalOnLeave > 0 ? totalOnLeave : (isWeekend ? '' : '-')}
                                            </td>
                                        );
                                    })}
                                    <td className='bg-light'></td>
                                </tr>
                            </tbody>

                        </table>
                    </div>

                                    {/* Tablonun bittiği div'in hemen altına ekle */}
                    <div className="d-flex flex-wrap gap-4 p-3 bg-white border-top text-muted" style={{ fontSize: '12px' }}>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '16px', height: '16px', backgroundColor: '#62e799', borderRadius: '4px' }}></div>
                            <span>Kesinleşen İzin</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '16px', height: '16px', backgroundColor: '#f3e411', borderRadius: '4px' }}></div>
                            <span>Planlanan İzin</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '16px', height: '16px', backgroundColor: '#ffe5e5', borderRadius: '4px' }}></div>
                            <span>Resmi/Dini Tatil</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '16px', height: '16px', backgroundColor: '#f1f3f5', borderRadius: '4px' }}></div>
                            <span>Hafta Sonu</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '16px', height: '16px', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.05) 5px, rgba(0,0,0,0.05) 10px)', borderRadius: '4px', border: '1px solid #dee2e6' }}></div>
                            <span>Geçmiş Günler</span>
                        </div>
                    </div>
                    {(() => {
                        const currentMonthHolidays = publicHolidays.filter(h => h.month === selectedMonth);
                        if (currentMonthHolidays.length === 0) return null;

                        const groupedHolidays = currentMonthHolidays.reduce((acc, curr) => {
                            if (!acc[curr.name]) acc[curr.name] = [];
                            acc[curr.name].push(curr.day);
                            return acc;
                        }, {});
                        return (
                            <div className="p-3 bg-white border-top text-dark" style={{ fontSize: '13px' }}>
                                <div className="fw-bold mb-2" style={{ color: '#E10514' }}>🎉 Bu Ayki Resmi ve Dini Tatiller:</div>
                                <ul className="mb-0 ps-3" style={{ listStyleType: 'square' }}>
                                    {Object.entries(groupedHolidays).map(([name, days]) => (
                                        <li key={name}>
                                            <span className="fw-bold">{days.join(', ')} {months.find(m => m.value === selectedMonth)?.name}:</span> {name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })()}
                </div>

            </main>

        {showProfileModal && (
            <div
            className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center'
            style={{
                backgroundColor: 'rgba(30, 33, 36, 0.4)', 
                backdropFilter: 'blur(10px)',             
                zIndex: 9999 
            }}
        >
            <div
                className='card border-0 p-4 p-md-5 shadow-lg'
                style={{ maxWidth: '500px', width: '100%', borderRadius: '16px', backgroundColor: '#FFFFFF'}}
                >
                    <div className="text-center mb-4">
                        <div className='d-flex justify-content align-items-center gap-2 mb-2'>
                            <span className={`badge ${modalStep === 1 ? 'bg-danger' : 'bg-secondary'}`} style={{ borderRadius: '12px' }}>1. Adım</span>
                            <span className="text-muted small">➔</span>
                            <span className={`badge ${modalStep === 2 ? 'bg-danger' : 'bg-secondary'}`} style={{ borderRadius: '12px' }}>2. Adım</span>
                        </div>

                        <h3 className='fw-bold mb-1'
                        style={{color: '#2C3238'}}>
                            Hoş geldin, {currentUser?.fullName}! 🎉
                        </h3>
                        <p className='text-muted small mb-0'>
                            {modalStep === 1
                            ? 'Sistemi kullanmaya başlamadan önce zorunlu alamnları doldurunuz.'
                            : 'Bütün özelliklerden faydalanabilmeniz için son bir adım kaldı.'}
                        </p>
                    </div>

                    {modalStep === 1 &&(
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!selectedDept || !selectedTitle){
                                alert("Lütfen Departman ve Ünvan Seçimi Yapınız.");
                                return;
                            }
                            setModalStep(2);

                        }}>
                            
                            <h6 className="fw-bold mb-3" style={{ color: '#E10514' }}>Kurum Bilgileri (Zorunlu)</h6>
                                
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-dark">Departmanınız</label>
                                <select 
                                    className="form-select shadow-none border-1 py-2"
                                    style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Temel Bankacılık">Temel Bankacılık</option>
                                    <option value="grup" disabled>Bankacılık Hizmetleri</option>
                                    <option value="Nakit Yönetimi">&nbsp;&nbsp;&nbsp;Nakit Yönetimi</option>
                                    <option value="Çek Senet">&nbsp;&nbsp;&nbsp;Çek Senet</option> 
                                                                            
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold small text-dark">Unvanınız</label>
                                <select 
                                    className="form-select shadow-none border-1 py-2"
                                    style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                    value={selectedTitle}
                                    onChange={(e) => setSelectedTitle(e.target.value)}
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Yönetici">Yönetici</option>
                                    <option value="Analist">Analist</option>
                                    <option value="Yazılımcı">Yazılımcı</option>              
                                </select>
                            </div>

                            <button
                                type='submit'
                                className='btn w-100 fw-bold py-3 shadow-sm mt-2'
                                style={{ backgroundColor: '#E10514', color: '#FFFFFF', borderRadius: '8px'}}
                            >
                                Devam Et

                            </button>
                        </form>
                    )}

                    {modalStep === 2 && (
                        <form onSubmit={handleCompleteProfile}>
                            <h6 className="fw-bold mb-3 text-muted">İzin Hakları & Kişiselleştirme (Opsiyonel)</h6>
                            <div className="row mb-3">
                                <div className="col-12 col-md-5 mb-3 mb-md-0">
                                    <label className="form-label fw-bold small text-dark">Yıllık İzin Hakkı</label>
                                    <input type="number" min="0" max="365" className="form-control shadow-none border-1 py-2 fw-bold text-center" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={totalLeaveDays} onChange={(e) => setTotalLeaveDays(e.target.value)} />
                                </div>
                                <div className="col-12 col-md-7">
                                    <label className="form-label fw-bold small text-dark">İzin Yenilenme Tarihi</label>
                                    <div className="d-flex gap-2">
                                        <select 
                                            className="form-select shadow-none border-1 py-2"
                                            style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                            value={leaveResetDate}
                                            onChange={(e) => setLeaveResetDate(e.target.value)}
                                        >
                                            <option value="">Gün</option>
                                            {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                        <select 
                                            className="form-select shadow-none border-1 py-2"
                                            style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                            value={leaveResetMonth}
                                            onChange={(e) => setLeaveResetMonth(e.target.value)}
                                        >
                                            <option value="">Ay</option>
                                            {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-dark">Doğum Günü (Sürprizler için 🎉)</label>
                                <div className="d-flex gap-2">
                                    <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6', width: '120px' }} value={birthDate} onChange={(e) => setBirthDate(e.target.value)}>
                                        <option value="">Gün</option>
                                        {/* Dinamik Gün Sayısı: */}
                                        {Array.from({ length: getDaysForMonth(birthMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={birthMonth} onChange={(e) => {
                                            setBirthMonth(e.target.value);
                                            // Ay değiştiğinde gün limiti aşılırsa günü sıfırla
                                            if (birthDate > getDaysForMonth(e.target.value)) setBirthDate('');
                                        }}>
                                        <option value="">Ay</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn w-100 fw-bold py-3 shadow-sm mb-2" style={{ backgroundColor: '#E10514', color: '#FFFFFF', borderRadius: '8px' }}>
                                Profili Tamamla ve Başla
                            </button>
                            <button type="button" className="btn btn-link w-100 text-decoration-none text-muted small fw-bold" onClick={handleCompleteProfile}>
                                Bu Adımı Atla (Varsayılan Ayarlarla Başla)
                            </button>
                        </form>
                    )}
                </div>
            </div>
        )}
            {customAlert.isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
                    style={{ backgroundColor: 'rgba(30, 33, 36, 0.6)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
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
                        
                        <div className="d-flex justify-content-center gap-3">
                            {customAlert.isConfirm ? (
                                <>
                                    <button 
                                        className="btn btn-light fw-bold px-4" 
                                        onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
                                    >
                                        Vazgeç
                                    </button>
                                    <button 
                                        className={`btn fw-bold px-4 ${customAlert.type === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
                                        onClick={() => {
                                            if (customAlert.onConfirm) customAlert.onConfirm();
                                            setCustomAlert({ ...customAlert, isOpen: false });
                                        }}
                                    >
                                        Onayla
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="btn btn-primary fw-bold w-100" 
                                    onClick={() => setCustomAlert({ ...customAlert, isOpen: false })}
                                >
                                    Tamam
                                </button>
                            )}
                        </div>
                    </div>
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`}</style>

                </div>

            )}
        </div>

    );
}