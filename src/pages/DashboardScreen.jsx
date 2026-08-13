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

    const [showEditProfileModal, setShowEditProfileModal] = useState(false);

    // Admin Paneli State'leri
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [adminActiveTab, setAdminActiveTab] = useState('users');
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [newDeptValue, setNewDeptValue] = useState('');
    
    const [minOfficeRate, setMinOfficeRate] = useState(() => {
        const saved = localStorage.getItem('minOfficeRate');
        return saved !== null ? parseInt(saved, 10) : 30; 
    });
    
    const [maxNegativeLeave, setMaxNegativeLeave] = useState(() => {
        const saved = localStorage.getItem('maxNegativeLeave');
        return saved !== null ? parseInt(saved, 10) : 14;
    });
    

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
        const savedUserStr = localStorage.getItem('user');
        if (savedUserStr) {
            try {
                const savedUser = JSON.parse(savedUserStr);

                if (savedUser.totalLeaveDays) setTotalLeaveDays(savedUser.totalLeaveDays);

                if (savedUser.birthDay) {
                    const bd = new Date(savedUser.birthDay);
                    setBirthDate(bd.getDate());
                    setBirthMonth(bd.getMonth() + 1);
                }

                if (savedUser.leaveReset) {
                    const ld = new Date(savedUser.leaveReset);
                    setLeaveResetDate(ld.getDate());
                    setLeaveResetMonth(ld.getMonth() + 1);
                }
                
            } catch (error) {
                console.error("Local ayarlar yüklenemedi:", error);
            }
        }
    }, []);
    

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

            if ((leave.status === 'Planned' || leave.status === 'Planlanan') && leaveDate <= today){
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


    const checkLeaveRules = (daysToCheck) => {
        const deptStaff = processedStaff.filter(p => p.department === currentUser.department);
        const totalDeptStaff = deptStaff.length;
        
        const requiredMinInOffice = Math.ceil(totalDeptStaff * (minOfficeRate / 100)); 
        const roleStaff = deptStaff.filter(p => p.title === currentUser.title);
        const totalRoleStaff = roleStaff.length;

        for (let day of daysToCheck) {
            let othersOnLeaveInDept = 0;
            let othersOnLeaveInRole = 0;

            deptStaff.forEach(person => {
                if (person.id !== currentUser.id) {
                    const hasLeave = person.leaves?.some(l => l.day === day && l.status === 'Kesinleşen');
                    if (hasLeave) {
                        othersOnLeaveInDept++;
                        if (person.title === currentUser.title) {
                            othersOnLeaveInRole++;
                        }
                    }
                }
            });

            const remainingInOffice = totalDeptStaff - (othersOnLeaveInDept + 1);
            
            if (remainingInOffice < requiredMinInOffice) {
                const monthName = months.find(m => m.value === selectedMonth)?.name;
                return {
                    hasWarning: true,
                    message: `${day} ${monthName} tarihinde güncel ofiste kalma kuralı (%${minOfficeRate}) sınırına ulaşıldı. Lütfen izin talebinizle ilgili yöneticinize bilgi verin.`
                };
            }

            if (criticalRoleProtection && totalRoleStaff > 1 && (totalRoleStaff - (othersOnLeaveInRole + 1) < 1)) {
                const monthName = months.find(m => m.value === selectedMonth)?.name;
                return {
                    hasWarning: true,
                    message: `${day} ${monthName} tarihinde departmanda ofiste kalan başka "${currentUser.title}" unvanlı çalışan kalmıyor. Lütfen izin talebinizle ilgili yöneticinize bilgi verin.`
                };
            }
        }

        return { hasWarning: false };
    };

    const handleUpdateStatus = async (newStatus) => {
        if (selectedDays.length === 0) return;

        if (newStatus === 'Planlanan') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const hasInvalidDay = selectedDays.some(day => {
                const selectedDate = new Date(selectedYear, selectedMonth - 1, day);
                return selectedDate.getTime() <= today.getTime();
            });

            if (hasInvalidDay) {
                showCustomAlert(
                    'Geçersiz İşlem', 
                    'Bugüne veya geçmiş tarihlere Planlanan izin ekleyemezsiniz. Planlanan izin eklemek için lütfen ileri bir tarih seçiniz.', 
                    'warning'
                );
                return; 
            }
        }

        const newRemaining = remainingLeaves - selectedDays.length;

        if (newStatus === 'Kesinleşen' && newRemaining < -maxNegativeLeave) {
            showCustomAlert(
                'İzin Limiti Aşıldı',
                `Bu işlemi yaparsanız izin bakiyeniz ${newRemaining} güne düşecektir. Kurumumuzda maksimum eksi bakiye sınırı -${maxNegativeLeave} gündür. Lütfen gün sayısını azaltın.`,
                'danger'
            );
            return;
        }

        const ruleCheck = checkLeaveRules(selectedDays);
        
        let title = '';
        let message = '';
        let alertType = 'info';

        if (ruleCheck.hasWarning) {
            title = '⚠️ Kural Sınırı Uyarısı';
            const newRemaining = remainingLeaves - selectedDays.length;
            
            message = `${ruleCheck.message}\n\nBuna rağmen seçtiğiniz ${selectedDays.length} günlük izni "${newStatus}" olarak kaydetmek istediğinize emin misiniz?`;
            
            if (newStatus === 'Kesinleşen') {
                message += ` (İşlemden sonra kalan izin hakkınız ${newRemaining} güne düşecektir.)`;
            }
            alertType = 'warning';

        } else {

            if (newStatus === 'Kesinleşen') {
                title = 'İzin Kesinleştirme Onayı';
                const newRemaining = remainingLeaves - selectedDays.length;
                message = `Seçtiğiniz ${selectedDays.length} günlük izni kesinleştirmek üzeresiniz. Bu işlemden sonra kalan izin hakkınız ${newRemaining} güne düşecektir. Onaylıyor musunuz?`;
                alertType = 'info';
            } else {
                title = 'İzin Planlama Onayı';
                message = `Seçtiğiniz ${selectedDays.length} günlük izni "Planlanan" olarak kaydetmek istediğinize emin misiniz?`;
                alertType = 'warning';
            }
        }
        
        showCustomAlert(
            title,
            message,
            alertType, 
            true,
            async () => {

            try {
                    const apiStatus = newStatus === 'Kesinleşen' ? 'Approved' : 'Planned';

                    const request = selectedDays.map(day => {
                        const leaveDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const existingLeave = currentMonthLeaves.find(l => l.day === day);

                        if (existingLeave && existingLeave.id) {
                            return api.put(`/Leave/${existingLeave.id}`, {
                                id: existingLeave.id,
                                employeeId: user.id,
                                startDate: leaveDate,
                                endDate: leaveDate,
                                requestDate: new Date().toISOString(),
                                status: apiStatus
                            });
                        } else {
                            return api.post('/Leave', {
                                employeeId: user.id,
                                startDate: leaveDate,
                                endDate: leaveDate,
                                requestDate: new Date().toISOString(),
                                status: apiStatus
                            });
                        }
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

        const formattedBirthDate = (birthDate && birthMonth) 
            ? `2004-${String(birthMonth).padStart(2, '0')}-${String(birthDate).padStart(2, '0')}` 
            : null;

        const formattedLeaveReset = (leaveResetDate && leaveResetMonth) 
            ? `2004-${String(leaveResetMonth).padStart(2, '0')}-${String(leaveResetDate).padStart(2, '0')}` 
            : null;

        try {
            await api.put(`/Auth/UpdateProfile/${user.id}`, {
                department: selectedDept,
                title: selectedTitle,
                totalLeaveDays: totalLeaveDays ? parseInt(totalLeaveDays) : 14,
                birthday: formattedBirthDate,
                leaveReset: formattedLeaveReset
            });

            const updatedUser = { 
                ...user, 
                department: selectedDept, 
                title: selectedTitle,
                birthDay: formattedBirthDate,
                leaveReset: formattedLeaveReset,
                leaveResetMonth: leaveResetMonth
            };
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

    const handleUpdateSettings = async (e) => {
        if(e) e.preventDefault();
        
        const formattedBirthDate = (birthDate && birthMonth) 
            ? `2004-${String(birthMonth).padStart(2, '0')}-${String(birthDate).padStart(2, '0')}` 
            : null;

        const formattedLeaveReset = (leaveResetDate && leaveResetMonth) 
            ? `2004-${String(leaveResetMonth).padStart(2, '0')}-${String(leaveResetDate).padStart(2, '0')}` 
            : null;

        try {
            await api.put(`/Auth/UpdateProfile/${user.id}`, {
                department: selectedDept,
                title: selectedTitle,
                totalLeaveDays: totalLeaveDays ? parseInt(totalLeaveDays) : 14,
                birthday: formattedBirthDate,
                leaveReset: formattedLeaveReset
            });

            const updatedUser = { 
                ...user, 
                department: selectedDept, 
                title: selectedTitle,
                totalLeaveDays: totalLeaveDays ? parseInt(totalLeaveDays) : 14,
                birthDay: formattedBirthDate,
                leaveReset: formattedLeaveReset
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setFilterDepartment(selectedDept);
            await fetchAllStaff();
            setShowEditProfileModal(false); 

            showCustomAlert('Başarılı', 'Profil ayarlarınız başarıyla güncellendi.', 'success');

        } catch (error) {
            console.error("Ayarlar güncellenirken hata:", error);
            showCustomAlert('Hata', 'Ayarlar kaydedilirken bir hata oluştu.', 'danger');
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

        if (filterDepartment === 'Nakit Yönetimi' || filterDepartment === 'Çek Senet') {
            if (person.title === 'Yönetici' && (person.department === 'Nakit Yönetimi' || person.department === 'Çek Senet')) {
                return true;
            }
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


    // --- ADMİN PANELİ API FONKSİYONLARI ---
    const handleToggleAdmin = (person) => {
        const isCurrentlyAdmin = person.title === 'Yönetici' || person.isAdmin;
        const actionText = isCurrentlyAdmin ? "Yetkisini Almak" : "Admin Yapmak";
        
        showCustomAlert(
            'Yetki Değişimi Onayı',
            `${person.fullName} isimli çalışanın ${actionText} istediğinize emin misiniz?`,
            'warning',
            true,
            async () => {
                try {
                    await api.post(`/Auth/toggle-admin/${person.id}`, {
                        isAdmin: !isCurrentlyAdmin
                    });
                    await fetchAllStaff();
                    showCustomAlert('Başarılı', 'Yetki başarıyla güncellendi.', 'success');
                } catch (error) {
                    showCustomAlert('Hata', 'Yetki güncellenirken hata oluştu.', 'danger');
                }
            }
        );
    };

    const handleDeleteEmployee = (person) => {
        showCustomAlert(
            'İlişik Kesme Onayı',
            `${person.fullName} isimli çalışanın sistemle ilişiğini kesmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
            'danger',
            true,
            async () => {
                try {
                    await api.delete(`/Employee/${person.id}`);
                    await fetchAllStaff();
                    showCustomAlert('Başarılı', 'Çalışan başarıyla silindi.', 'success');
                } catch (error) {
                    showCustomAlert('Hata', 'Çalışan silinirken hata oluştu.', 'danger');
                }
            }
        );
    };

    const handleSaveDepartment = async (person) => {
        try {
            await api.put(`/Auth/UpdateProfile/${person.id}`, {
                department: newDeptValue,
                title: person.title
            });
            setEditingDeptId(null);
            await fetchAllStaff();
            showCustomAlert('Başarılı', 'Departman başarıyla güncellendi.', 'success');
        } catch (error) {
            showCustomAlert('Hata', 'Departman güncellenirken hata oluştu.', 'danger');
        }
    };


    const [criticalRoleProtection, setCriticalRoleProtection] = useState(() => {
        const saved = localStorage.getItem('criticalRoleProtection');
        return saved !== null ? saved === 'true' : true;
    });


    const handleExportExcel = () => {

        let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility
        
        let row2 = [" ", " ", " ", " "];
        let row1 = ["Ad Soyad", "Departman", "Unvan", " "];
        const dayNamesShort = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

        days.forEach(day => {
            row1.push(day.toString());

            const actualDate = new Date(selectedYear, selectedMonth - 1, day);
            row2.push(dayNamesShort[actualDate.getDay()]);
        });

        row1.push(" ");
        row1.push("Bu Ay Toplam");

        row2.push(" ");
        row2.push(" ");

        csvContent += row1.join(";") + "\n";
        csvContent += row2.join(";") + "\n";

        displayedStaff.forEach(person => {

            const confirmedLeavesCount = person.leaves?.filter(l => l.status === 'Kesinleşen').length || 0;

            let rowData = [
                person.fullName,
                person.department || "-",
                person.title || "-",
                " "
            ];

            days.forEach(day => {
                const actualDate = new Date(selectedYear, selectedMonth - 1, day);
                const dayOfWeek = actualDate.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const isHoliday = publicHolidays.some(h => h.month === selectedMonth && h.day === day);
                
                const existingLeave = person.leaves?.find(l => l.day === day);
                
                let cellValue = "";
                
                if (existingLeave) {
                    if (existingLeave.status === 'Kesinleşen') {
                        cellValue = "Kesinleşen";
                    } else if (existingLeave.status === 'Planlanan') {
                        cellValue = "Planlanan";
                    }
                } else if (isHoliday) {
                    cellValue = "Resmi Tatil";
                } else if (isWeekend) {
                    cellValue = "Hafta Sonu";
                }
                
                rowData.push(cellValue);
            });

            rowData.push("");
            rowData.push(confirmedLeavesCount.toString());

            csvContent += rowData.join(";") + "\n";
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const monthName = months.find(m => m.value === selectedMonth)?.name;

        link.setAttribute("href", url);
        link.setAttribute("download", `Izin_Takvimi_${filterDepartment}_${monthName}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showCustomAlert('Başarılı', 'Excel raporu başarıyla indirildi.', 'success');
    }


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
                            {(user?.title === 'Yönetici' || user?.isAdmin) && (
                                <>
                                    <li>
                                        <button className="dropdown-item custom-dropdown-item d-flex align-items-center gap-2" style={{ color: '#ffc107' }} onClick={() => { 
                                            setShowAdminPanel(true);
                                            setShowProfileMenu(false);
                                        }}>
                                            <span style={{ fontSize: '14px' }}>👑</span> Admin Paneli
                                        </button>
                                    </li>
                                    <li><hr className="dropdown-divider custom-divider" /></li>
                                </>
                            )}
                            <li>
                                <button className="dropdown-item custom-dropdown-item d-flex align-items-center gap-2" onClick={() => { 
                                    const localUser = JSON.parse(localStorage.getItem('user')) || {};
                                    setSelectedDept(user?.department && user.department !== 'Belirtilmedi' ? user.department : '');
                                    setSelectedTitle(user?.title || '');
                                    setTotalLeaveDays(localUser.totalLeaveDays || 14);
                                    
                                    if (localUser.leaveReset) {
                                        const ld = new Date(localUser.leaveReset);
                                        setLeaveResetDate(ld.getDate());
                                        setLeaveResetMonth(ld.getMonth() + 1);
                                    }
                                    if (localUser.birthDay) {
                                        const bd = new Date(localUser.birthDay);
                                        setBirthDate(bd.getDate());
                                        setBirthMonth(bd.getMonth() + 1);
                                    }
                                    setShowEditProfileModal(true); 
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

                        {(user?.title === 'Yönetici' || user?.isAdmin) && (
                                <button 
                                    className="btn btn-sm btn-outline-success fw-bold ms-3 d-flex align-items-center gap-2"
                                    onClick={handleExportExcel}
                                    title="Görüntülenen listeyi Excel olarak indir"
                                >
                                    <span style={{fontSize: '14px'}}>📥</span> Rapor İndir
                                </button>
                            )}

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

                                                let isBirthday = false;
                                                if (person.id === currentUser.id && birthDate && birthMonth) {
                                                    isBirthday = (parseInt(birthDate) === day && parseInt(birthMonth) === selectedMonth);
                                                } else {
                
                                                    if (person.birthDate) {
                                                        const bDate = new Date(person.birthDate);
                                                        isBirthday = (bDate.getDate() === day && (bDate.getMonth() + 1) === selectedMonth);
                                                    } else if (person.birthDay && person.birthMonth) {
                                                        isBirthday = (person.birthDay === day && person.birthMonth === selectedMonth);
                                                    }
                                                }

                                                return (
                                                    <td
                                                        key={day}
                                                        onClick={() => isCurrentUser && handleCellClick(day, isPast, isOffDay, existingLeave?.status)}
                                                        className="text-center align-middle p-0 border-end position-relative"
                                                        style={{
                                                            height: '40px',
                                                            backgroundColor: bgColor,
                                                            backgroundImage: bgPattern,
                                                            color: textColor,
                                                            cursor: cursorStyle,
                                                            transition: 'all 0.2s ease-in-out',
                                                            boxShadow: 'none' 
                                                        }}
                                                    >
                                                        {isEditMode && isCurrentlySelected && (
                                                            <span className="fw-bold text-dark" style={{ fontSize: '1.25rem' }}>✓</span>
                                                        )}

                                                        {isBirthday && (
                                                            <span 
                                                                title="Doğum Günü! 🎉"
                                                                style={{ 
                                                                    position: 'absolute', 
                                                                    top: '50%',          
                                                                    left: '50%',         
                                                                    transform: 'translate(-50%, -50%)', 
                                                                    fontSize: '18px',    
                                                                    lineHeight: '1',
                                                                    zIndex: 1,
                                                                    opacity: isCurrentlySelected ? 0.3 : 1
                                                                }}
                                                            >
                                                                🎂
                                                            </span>
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

            {showEditProfileModal && (
            <div
                className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center'
                style={{ backgroundColor: 'rgba(30, 33, 36, 0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
            >
                <div
                    className='card border-0 p-4 shadow-lg position-relative'
                    style={{ maxWidth: '650px', width: '95%', borderRadius: '16px', backgroundColor: '#FFFFFF', animation: 'fadeIn 0.2s ease-out' }}
                >
                    {/* Çarpı (İptal/Kapatma) Butonu */}
                    <button 
                        type="button"
                        className="btn btn-sm btn-light position-absolute d-flex align-items-center justify-content-center" 
                        style={{ top: '15px', right: '15px', width: '32px', height: '32px', borderRadius: '50%' }}
                        onClick={() => setShowEditProfileModal(false)}
                        title="Değişiklikleri İptal Et"
                    >
                        <span className="fw-bold text-dark" style={{ fontSize: '16px' }}>✕</span>
                    </button>

                    <div className="text-center mb-4 mt-2">
                        <h4 className='fw-bold mb-1' style={{color: '#2C3238'}}>⚙️ Profil ve İzin Ayarları</h4>
                        <p className='text-muted small mb-0'>
                            Bilgilerinizi ve kişisel tercihlerinizi tek ekrandan yönetin.
                        </p>
                    </div>

                    <form onSubmit={handleUpdateSettings}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-dark">Departmanınız <span className="text-danger">*</span></label>
                                <select 
                                    className="form-select shadow-none border-1 py-2"
                                    style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Temel Bankacılık">Temel Bankacılık</option>
                                    <option value="Nakit Yönetimi">Nakit Yönetimi</option>
                                    <option value="Çek Senet">Çek Senet</option> 
                                </select>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold small text-dark">Unvanınız <span className="text-danger">*</span></label>
                                <select 
                                    className="form-select shadow-none border-1 py-2"
                                    style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }}
                                    value={selectedTitle}
                                    onChange={(e) => setSelectedTitle(e.target.value)}
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="Yönetici">Yönetici</option>
                                    <option value="Analist">Analist</option>
                                    <option value="Yazılımcı">Yazılımcı</option>              
                                </select>
                            </div>
                        </div>

                        <hr className="text-muted opacity-25 my-3" />

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label fw-bold small text-dark">Yıllık İzin Hakkı</label>
                                <input type="number" min="0" max="365" className="form-control shadow-none border-1 py-2 fw-bold text-center" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={totalLeaveDays} onChange={(e) => setTotalLeaveDays(e.target.value)} />
                            </div>
                            <div className="col-md-8 mb-3">
                                <label className="form-label fw-bold small text-dark">İzin Yenilenme Tarihi</label>
                                <div className="d-flex gap-2">
                                    <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={leaveResetDate} onChange={(e) => setLeaveResetDate(e.target.value)}>
                                        <option value="">Gün</option>
                                        {dayOptions.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={leaveResetMonth} onChange={(e) => setLeaveResetMonth(e.target.value)}>
                                        <option value="">Ay</option>
                                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-dark">Doğum Günü (Tabloda 🎂 görünmesi için)</label>
                            <div className="d-flex gap-2">
                                <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6', width: '120px' }} value={birthDate} onChange={(e) => setBirthDate(e.target.value)}>
                                    <option value="">Gün</option>
                                    {Array.from({ length: getDaysForMonth(birthMonth) }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <select className="form-select shadow-none border-1 py-2" style={{ backgroundColor: '#F8F9FA', borderColor: '#dee2e6' }} value={birthMonth} onChange={(e) => {
                                        setBirthMonth(e.target.value);
                                        if (birthDate > getDaysForMonth(e.target.value)) setBirthDate('');
                                    }}>
                                    <option value="">Ay</option>
                                    {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn w-100 fw-bold py-3 shadow-sm" style={{ backgroundColor: '#E10514', color: '#FFFFFF', borderRadius: '8px' }}>
                            Tüm Değişiklikleri Kaydet
                        </button>
                    </form>
                </div>
            </div>
        )}

            {showAdminPanel && (
            <div className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center' style={{ backgroundColor: 'rgba(30, 33, 36, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
                <div className='card border-0 shadow-lg position-relative d-flex flex-column' style={{ width: '95%', maxWidth: '1100px', height: '85vh', borderRadius: '16px', backgroundColor: '#F8F9FA', animation: 'fadeIn 0.2s ease-out' }}>
                    
                    {/* Header Kısmı */}
                    <div className="p-4 border-bottom bg-white d-flex justify-content-between align-items-center" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                        <div>
                            <h4 className='fw-bold mb-1' style={{color: '#2C3238'}}>👑 Sistem ve Ekip Yönetimi</h4>
                            <p className='text-muted small mb-0'>Şirket kurallarını, departmanları ve yetkileri buradan yönetebilirsiniz.</p>
                        </div>
                        <button type="button" className="btn btn-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', borderRadius: '50%' }} onClick={() => setShowAdminPanel(false)} title="Kapat">
                            <span className="fw-bold text-dark">✕</span>
                        </button>
                    </div>

                    {/* Sekmeler (Tabs) */}
                    <div className="bg-white px-4 border-bottom">
                        <ul className="nav nav-underline gap-3">
                            <li className="nav-item">
                                <button className={`nav-link fw-bold ${adminActiveTab === 'users' ? 'active text-danger border-danger' : 'text-muted'}`} onClick={() => setAdminActiveTab('users')} style={{ paddingBottom: '12px' }}>
                                    👥 Ekip Yönetimi
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link fw-bold ${adminActiveTab === 'settings' ? 'active text-danger border-danger' : 'text-muted'}`} onClick={() => setAdminActiveTab('settings')} style={{ paddingBottom: '12px' }}>
                                    ⚙️ Sistem ve İzin Kuralları
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* İçerik Alanı */}
                    <div className="p-4 flex-grow-1 overflow-auto">
                        
                        {/* 1. SEKME: KULLANICILAR */}
                        {adminActiveTab === 'users' && (
                            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 bg-white" style={{ fontSize: '13.5px' }}>
                                        <thead className="table-light text-muted">
                                            <tr>
                                                <th className="px-4 py-3">Çalışan</th>
                                                <th className="py-3">Departman & Rol</th>
                                                <th className="py-3 text-center">Kalan İzin</th>
                                                <th className="py-3 text-center">Yetki Devri</th>
                                                <th className="px-4 py-3 text-end">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allStaff.map(person => (
                                                <tr key={person.id}>
                                                    <td className="px-4 fw-medium text-dark">
                                                        {person.fullName}
                                                        {person.id === currentUser.id && <span className="badge bg-danger ms-2" style={{ fontSize: '9px' }}>SEN</span>}
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{person.department || 'Belirtilmedi'}</div>
                                                        <div className="text-muted" style={{ fontSize: '11px' }}>{person.title || 'Belirtilmedi'}</div>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '12px' }}>
                                                            {/* Not: Backend'den kalan izin geliyorsa buraya bağlanacak, şimdilik statik 14 eksi kullanılan gösterilir */}
                                                            {14 - (person.leaves?.filter(l => l.status === 'Kesinleşen').length || 0)} Gün
                                                        </span>
                                                    </td>

                                                    <td className="text-center">
                                                        <div className="form-check form-switch d-flex justify-content-center m-0">
                                                            <input 
                                                                className="form-check-input" 
                                                                type="checkbox" 
                                                                role="switch" 
                                                                checked={person.title === 'Yönetici' || person.isAdmin} 
                                                                onChange={() => handleToggleAdmin(person)}
                                                                disabled={person.id === currentUser.id} 
                                                                title="Admin Yetkisi Ver/Al"
                                                            />
                                                        </div>
                                                    </td>

                                                    <td className="px-4 text-end">
                                                        {editingDeptId === person.id ? (
                                                            <div className="d-flex align-items-center justify-content-end gap-2">
                                                                <select 
                                                                    className="form-select form-select-sm shadow-none" 
                                                                    style={{ width: '150px' }} 
                                                                    value={newDeptValue} 
                                                                    onChange={(e) => setNewDeptValue(e.target.value)}
                                                                >
                                                                    <option value="Temel Bankacılık">Temel Bankacılık</option>
                                                                    <option value="Nakit Yönetimi">Nakit Yönetimi</option>
                                                                    <option value="Çek Senet">Çek Senet</option> 
                                                                </select>
                                                                <button className="btn btn-sm btn-success fw-bold" onClick={() => handleSaveDepartment(person)}>✓</button>
                                                                <button className="btn btn-sm btn-light fw-bold" onClick={() => setEditingDeptId(null)}>✕</button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <button className="btn btn-sm btn-outline-primary fw-bold me-2" style={{ fontSize: '12px' }} onClick={() => {
                                                                    setEditingDeptId(person.id);
                                                                    setNewDeptValue(person.department || 'Temel Bankacılık');
                                                                }}>
                                                                    Bölüm Değiştir
                                                                </button>
                                                                <button className="btn btn-sm btn-outline-danger fw-bold" style={{ fontSize: '12px' }} disabled={person.id === currentUser.id} onClick={() => handleDeleteEmployee(person)}>
                                                                    İlişiği Kes
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                    
                                                    
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 2. SEKME: SİSTEM AYARLARI */}
                        {adminActiveTab === 'settings' && (
                            <div className="row g-4"> {/* g-4: Tüm kartların arasına eşit ve şık bir boşluk atar */}
                                
                                {/* 1. KART: Ofiste Bulunma Zorunluluğu */}
                                <div className="col-lg-6">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                        <h6 className="fw-bold text-dark mb-3">Ofiste Bulunma Zorunluluğu</h6>
                                        <p className="text-muted small mb-4">Bir departmanda operasyonun durmaması için ofiste <b>kalması gereken</b> minimum personel oranını (%) belirleyin.</p>
                                        
                                        <div className="mt-auto">
                                            <label className="form-label fw-bold small text-dark">Minimum Kalma Oranı (%)</label>
                                            <select 
                                                className="form-select bg-light border-0 shadow-none fw-bold text-danger" 
                                                value={minOfficeRate} 
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    setMinOfficeRate(val);
                                                    localStorage.setItem('minOfficeRate', val);
                                                    showCustomAlert('Kural Güncellendi', `Departmanlarda ofiste kalması gereken minimum kişi oranı %${val} olarak ayarlandı.`, 'success');
                                                }}
                                            >
                                                {Array.from({ length: 21 }, (_, i) => i * 5).map(val => (
                                                    <option key={val} value={val}>%{val} ofiste kalmalı</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. KART: Maksimum Avans İzin Sınırı */}
                                <div className="col-lg-6">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                        <h6 className="fw-bold text-dark mb-3">Maksimum Avans İzin Sınırı</h6>
                                        <p className="text-muted small mb-4">Personelin bir sonraki yıldan borçlanarak kullanabileceği maksimum eksi gün (avans) sınırını belirleyin.</p>
                                        
                                        <div className="d-flex align-items-center gap-3 mt-auto">
                                            <label className="form-label fw-bold small text-dark mb-0">Eksi Sınır (Gün):</label>
                                            <input 
                                                type="number" 
                                                className="form-control bg-light border-0 shadow-none fw-bold text-danger text-center" 
                                                style={{ width: '80px' }}
                                                min="0" 
                                                max="50"
                                                value={maxNegativeLeave} 
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    if (!isNaN(val)) {
                                                        setMaxNegativeLeave(val);
                                                        localStorage.setItem('maxNegativeLeave', val);
                                                    }
                                                }} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. KART: Kritik Rol Koruması */}
                                <div className="col-lg-6">
                                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                        <h6 className="fw-bold text-dark mb-3">Kritik Rol Koruması</h6>
                                        <p className="text-muted small mb-4">Departmanda aynı role sahip birden fazla kişi varsa, en az 1 kişinin ofiste kalmasını zorunlu tutar.</p>
                                        
                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 mt-auto">
                                            <div>
                                                <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>Koruma Modu</div>
                                                <div className="text-muted" style={{ fontSize: '12px' }}>Aktif olduğunda son kişiye izin vermez.</div>
                                            </div>
                                            <div className="form-check form-switch fs-4 m-0">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    role="switch" 
                                                    checked={criticalRoleProtection} 
                                                    onChange={(e) => {
                                                        setCriticalRoleProtection(e.target.checked);
                                                        localStorage.setItem('criticalRoleProtection', e.target.checked);
                                                        showCustomAlert('Kural Güncellendi', `Kritik rol koruması ${e.target.checked ? 'aktif edildi' : 'kapatıldı'}.`, 'success');
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                    </div>
                </div>
            </div>
        )}

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