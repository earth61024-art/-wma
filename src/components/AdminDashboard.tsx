import React, { useState } from 'react';
import {
  Stethoscope,
  Bandage,
  PhoneCall,
  Ambulance,
  TrendingUp,
  Sheet,
  Download,
  AlertTriangle,
  UserCheck,
  Calendar,
  CheckCircle,
  Bed,
  BarChart3,
  ExternalLink,
  Users,
  Search,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  Check,
  GraduationCap,
  Filter,
  RotateCcw,
  CalendarDays,
  ShieldAlert,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { VisitRecord, CareResult, SymptomType, ServiceAction, GradeLevel, StudentProfile } from '../types';
import { SchoolAccidentsDashboard } from './SchoolAccidentsDashboard';

const ALL_SYMPTOMS: SymptomType[] = [
  'มีไข้',
  'ปวดศีรษะ',
  'ปวดท้อง',
  'บาดแผล / เลือดออก',
  'หกล้ม / ฟกช้ำ',
  'คลื่นไส้ / อาเจียน',
  'วิงเวียนศีรษะ',
  'ตาแดง / เคืองตา',
  'แมลงสัตว์กัดต่อย',
  'ผื่นคัน / ภูมิแพ้',
  'แน่นหน้าอก / หายใจลำบาก',
  'ฟันผุ / ปวดฟัน',
  'อื่น ๆ',
];

const ALL_ACTIONS: ServiceAction[] = [
  'ปฐมพยาบาล',
  'เช็ดตัวลดไข้',
  'ให้ยาสามัญประจำบ้าน',
  'ประคบเย็น / ร้อน',
  'นอนพักผ่อน',
  'ล้างตา / ทำแผล',
  'ประสานผู้ปกครอง',
  'ส่งต่อแพทย์',
];

interface AdminDashboardProps {
  onOpenSyncModal: () => void;
  spreadsheetUrl: string | null;
  spreadsheetName?: string;
  isLoggedInGoogle: boolean;
  onGoogleSignIn: () => void;
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenSyncModal,
  spreadsheetUrl,
  spreadsheetName,
  isLoggedInGoogle,
  onGoogleSignIn,
  onNavigate,
}) => {
  const {
    schoolInfo,
    records,
    students,
    addRecord,
    updateRecord,
    deleteRecord,
    addStudent,
    updateStudent,
    updateStudentBloodType,
    deleteStudent,
    updateAcademicYear,
    promoteStudentsToNextYear,
    isFirebaseConnected,
    isFirebaseSyncing,
    firebaseProjectId,
    syncToFirebase,
  } = useInfirmary();

  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'records' | 'roster' | 'safety'>('analytics');
  const [rosterGrade, setRosterGrade] = useState<string>('all');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [rosterYearFilter, setRosterYearFilter] = useState<string>('all');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<string>('all');
  const [cloudSyncMsg, setCloudSyncMsg] = useState(false);

  // Academic Year Settings Modal
  const [isChangeYearModalOpen, setIsChangeYearModalOpen] = useState(false);
  const [targetAcademicYear, setTargetAcademicYear] = useState(schoolInfo.academicYear || '2569');
  const [targetSemester, setTargetSemester] = useState(schoolInfo.semester || 'ภาคเรียนที่ 1');

  // Annual Student Promotion Modal (Roll-over students to next year)
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [promoteTargetYear, setPromoteTargetYear] = useState(
    String(parseInt(schoolInfo.academicYear || '2569', 10) + 1)
  );
  const [promoteToast, setPromoteToast] = useState<{ promoted: number; graduated: number } | null>(null);

  // Analytics Date & Year Filter states
  const [analyticsYearFilter, setAnalyticsYearFilter] = useState<string>('all');
  const [analyticsMonthFilter, setAnalyticsMonthFilter] = useState<string>('all');
  const [analyticsDateFilter, setAnalyticsDateFilter] = useState<string>('');

  // Records Manager Sub-Tab states
  const [recordSearch, setRecordSearch] = useState('');
  const [recordGradeFilter, setRecordGradeFilter] = useState('all');
  const [recordStatusFilter, setRecordStatusFilter] = useState('all');
  const [recordYearFilter, setRecordYearFilter] = useState('all');
  const [recordMonthFilter, setRecordMonthFilter] = useState('all');
  const [recordDateFilter, setRecordDateFilter] = useState('');
  const [editingRecord, setEditingRecord] = useState<VisitRecord | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  // Confirmation Modal State (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    onConfirm: () => {},
  });

  // State for adding a new record from the Dashboard
  const now = new Date();
  const [recDate, setRecDate] = useState(now.toISOString().split('T')[0]);
  const [recTime, setRecTime] = useState(
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  );
  const [recAcademicYear, setRecAcademicYear] = useState(schoolInfo.academicYear || '2569');
  const [recName, setRecName] = useState('');
  const [recId, setRecId] = useState('');
  const [recGrade, setRecGrade] = useState<GradeLevel>('ป.1');
  const [recRoom, setRecRoom] = useState('1');
  const [recGender, setRecGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [recBlood, setRecBlood] = useState<'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'>('ไม่ระบุ');
  const [recTemp, setRecTemp] = useState('');
  const [recSymptoms, setRecSymptoms] = useState<SymptomType[]>(['บาดแผล / เลือดออก']);
  const [recDetail, setRecDetail] = useState('');
  const [recTreatment, setRecTreatment] = useState('ทำแผล ล้างน้ำเกลือ ทายาเบตาดีน');
  const [recMed, setRecMed] = useState('');
  const [recResult, setRecResult] = useState<CareResult>('ดีขึ้น กลับเข้าห้องเรียน');
  const [recParentNotified, setRecParentNotified] = useState(false);
  const [recParentPhone, setRecParentPhone] = useState('');

  const handleCloudSync = async () => {
    await syncToFirebase();
    setCloudSyncMsg(true);
    setTimeout(() => setCloudSyncMsg(false), 3000);
  };

  // Student CRUD and Blood Type states
  const [quickBloodStudent, setQuickBloodStudent] = useState<StudentProfile | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  const [newStdName, setNewStdName] = useState('');
  const [newStdId, setNewStdId] = useState('');
  const [newStdCitizenId, setNewStdCitizenId] = useState('');
  const [newStdGrade, setNewStdGrade] = useState<GradeLevel>('ป.1');
  const [newStdRoom, setNewStdRoom] = useState('1');
  const [newStdGender, setNewStdGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [newStdBlood, setNewStdBlood] = useState<'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'>('ไม่ระบุ');
  const [newStdBirth, setNewStdBirth] = useState('');
  const [newStdAllergies, setNewStdAllergies] = useState('');
  const [newStdCongenital, setNewStdCongenital] = useState('');
  const [newStdPhone, setNewStdPhone] = useState('');
  const [newStdAcademicYear, setNewStdAcademicYear] = useState(schoolInfo.academicYear || '2569');
  const [newStdStatus, setNewStdStatus] = useState<'กำลังศึกษา' | 'จบการศึกษา' | 'ย้ายสถานศึกษา'>('กำลังศึกษา');

  // Real-Time Student Blood Stats
  const bloodStats = {
    O: students.filter((s) => s.bloodType === 'O').length,
    A: students.filter((s) => s.bloodType === 'A').length,
    B: students.filter((s) => s.bloodType === 'B').length,
    AB: students.filter((s) => s.bloodType === 'AB').length,
    unspecified: students.filter((s) => !s.bloodType || s.bloodType === 'ไม่ระบุ').length,
  };

  // Filter visit records for Analytics Dashboard based on Date / Month / Academic Year
  const filteredRecordsForAnalytics = records.filter((r) => {
    if (analyticsDateFilter && r.date !== analyticsDateFilter) {
      return false;
    }
    if (analyticsMonthFilter !== 'all') {
      const parts = r.date ? r.date.split('-') : [];
      if (parts[1] !== analyticsMonthFilter) {
        return false;
      }
    }
    if (analyticsYearFilter !== 'all') {
      if (r.academicYear && r.academicYear === analyticsYearFilter) {
        return true;
      }
      const yearNum = parseInt(analyticsYearFilter, 10);
      const ceYear = yearNum > 2400 ? yearNum - 543 : yearNum;
      const rYear = r.date ? parseInt(r.date.split('-')[0], 10) : 0;
      if (rYear === ceYear || rYear === yearNum) {
        return true;
      }
      return false;
    }
    return true;
  });

  // Real-Time Dynamic Metrics (Re-calculated according to Date/Year Filter)
  const totalVisits = filteredRecordsForAnalytics.length;
  const firstAidCount = filteredRecordsForAnalytics.filter(
    (r) =>
      r.actionsTaken.includes('ปฐมพยาบาล') ||
      r.symptoms.some((s) => s.includes('บาดแผล') || s.includes('หกล้ม'))
  ).length;
  const parentNotifiedCount = filteredRecordsForAnalytics.filter((r) => r.parentNotified).length;
  const hospitalTransfers = filteredRecordsForAnalytics.filter(
    (r) => r.careResult === 'ส่งต่อสถานพยาบาล / รพ.'
  ).length;
  const restingCount = filteredRecordsForAnalytics.filter((r) => r.careResult === 'นอนพักสังเกตอาการ').length;

  // Real-time Follow-up list
  const followUpRecords = filteredRecordsForAnalytics.filter((r) => r.followUpNeeded);

  // Dynamic symptom counting
  const symptomMap: Record<string, number> = {};
  filteredRecordsForAnalytics.forEach((r) => {
    r.symptoms.forEach((s) => {
      symptomMap[s] = (symptomMap[s] || 0) + 1;
    });
  });

  const sortedSymptoms = Object.entries(symptomMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Dynamic grade breakdown
  const gradeLevels: GradeLevel[] = ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'];
  const gradeCounts = gradeLevels.map((g) => ({
    grade: g,
    count: filteredRecordsForAnalytics.filter((r) => r.grade === g).length,
  }));

  // Dynamic monthly distribution (All 12 months)
  const monthMap: Record<string, number> = {
    '01': 0, '02': 0, '03': 0, '04': 0, '05': 0, '06': 0,
    '07': 0, '08': 0, '09': 0, '10': 0, '11': 0, '12': 0,
  };
  filteredRecordsForAnalytics.forEach((r) => {
    if (r.date) {
      const parts = r.date.split('-');
      if (parts[1] && monthMap[parts[1]] !== undefined) {
        monthMap[parts[1]] += 1;
      }
    }
  });

  const monthLabels: { key: string; label: string; th: string }[] = [
    { key: '05', label: 'May', th: 'พ.ค.' },
    { key: '06', label: 'Jun', th: 'มิ.ย.' },
    { key: '07', label: 'Jul', th: 'ก.ค.' },
    { key: '08', label: 'Aug', th: 'ส.ค.' },
    { key: '09', label: 'Sep', th: 'ก.ย.' },
    { key: '10', label: 'Oct', th: 'ต.ค.' },
    { key: '11', label: 'Nov', th: 'พ.ย.' },
    { key: '12', label: 'Dec', th: 'ธ.ค.' },
    { key: '01', label: 'Jan', th: 'ม.ค.' },
    { key: '02', label: 'Feb', th: 'ก.พ.' },
    { key: '03', label: 'Mar', th: 'มี.ค.' },
    { key: '04', label: 'Apr', th: 'เม.ย.' },
  ];

  const maxMonthCount = Math.max(1, ...Object.values(monthMap));

  // Dynamic Academic Years list derived from school info, students, and records
  const availableAcademicYears = Array.from(
    new Set([
      schoolInfo.academicYear || '2569',
      ...students.map((s) => s.academicYear).filter(Boolean),
      ...records.map((r) => r.academicYear).filter(Boolean),
      '2568',
      '2569',
      '2570',
      '2571',
    ] as string[])
  ).sort((a, b) => b.localeCompare(a));

  // Filter students roster (Supports filtering by Grade, Academic Year, Status, Search)
  const filteredStudents = students.filter((s) => {
    const matchesGrade = rosterGrade === 'all' || s.grade === rosterGrade;
    const matchesYear =
      rosterYearFilter === 'all' ||
      (s.academicYear ? s.academicYear === rosterYearFilter : rosterYearFilter === (schoolInfo.academicYear || '2569'));
    const matchesStatus =
      rosterStatusFilter === 'all' || (s.status ? s.status === rosterStatusFilter : rosterStatusFilter === 'กำลังศึกษา');
    const matchesSearch =
      s.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.studentId.includes(rosterSearch.trim()) ||
      (s.citizenId && s.citizenId.includes(rosterSearch.trim()));
    return matchesGrade && matchesYear && matchesStatus && matchesSearch;
  });

  // Filter visit records for Dashboard Records tab (Supports Date, Month, Year filters)
  const filteredDashboardRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(recordSearch.toLowerCase()) ||
      r.studentId.toLowerCase().includes(recordSearch.toLowerCase()) ||
      r.symptoms.some((s) => s.toLowerCase().includes(recordSearch.toLowerCase())) ||
      r.treatmentDetail.toLowerCase().includes(recordSearch.toLowerCase());

    const matchesGrade = recordGradeFilter === 'all' || r.grade === recordGradeFilter;
    const matchesStatus =
      recordStatusFilter === 'all' ||
      (recordStatusFilter === 'resting' && r.careResult === 'นอนพักสังเกตอาการ') ||
      (recordStatusFilter === 'returned' && r.careResult === 'ดีขึ้น กลับเข้าห้องเรียน') ||
      (recordStatusFilter === 'referred' && r.careResult === 'ส่งต่อสถานพยาบาล / รพ.') ||
      (recordStatusFilter === 'followup' && r.followUpNeeded) ||
      (recordStatusFilter === 'parent' && r.parentNotified);

    const matchesYear =
      recordYearFilter === 'all' ||
      (r.academicYear === recordYearFilter ||
        (r.date && (r.date.startsWith(recordYearFilter) || r.date.startsWith(String(parseInt(recordYearFilter, 10) - 543)))));

    const matchesMonth =
      recordMonthFilter === 'all' || (r.date && r.date.split('-')[1] === recordMonthFilter);

    const matchesDate = !recordDateFilter || r.date === recordDateFilter;

    return matchesSearch && matchesGrade && matchesStatus && matchesYear && matchesMonth && matchesDate;
  });

  const handleSaveDashboardEditRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateRecord(editingRecord);
    if (editingRecord.studentId && editingRecord.bloodType !== undefined) {
      updateStudentBloodType(editingRecord.studentId, editingRecord.bloodType);
    }
    setEditingRecord(null);
  };

  const handleCreateDashboardRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recName.trim()) return;

    const newRec: VisitRecord = {
      id: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: recDate,
      time: recTime,
      academicYear: recAcademicYear || schoolInfo.academicYear || '2569',
      studentId: recId.trim() || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: recName.trim(),
      grade: recGrade,
      room: recRoom,
      gender: recGender,
      bloodType: recBlood,
      broughtBy: 'เดินมาเอง',
      temperature: recTemp ? parseFloat(recTemp) : undefined,
      symptoms: recSymptoms.length > 0 ? recSymptoms : ['อื่น ๆ'],
      symptomDetail: recDetail.trim() || recSymptoms.join(', '),
      actionsTaken: ['ปฐมพยาบาล'],
      treatmentDetail: recTreatment.trim(),
      medicationGiven: recMed.trim() || undefined,
      careResult: recResult,
      parentNotified: recParentNotified,
      parentPhone: recParentPhone.trim() || undefined,
      recordedBy: schoolInfo.nurseInCharge,
      followUpNeeded: false,
    };

    addRecord(newRec);
    setIsAddRecordOpen(false);
    setRecName('');
    setRecId('');
    setRecDetail('');
  };

  const handleDeleteRecordWithConfirm = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบเวชระเบียน',
      message: `คุณต้องการลบเวชระเบียนของ "${name}" แบบถาวรใช่หรือไม่? ข้อมูลจะถูกลบออกจากสถิติ Dashboard และคลาวด์ทันที`,
      confirmText: 'ลบเวชระเบียน',
      onConfirm: () => {
        deleteRecord(id);
        if (editingRecord && editingRecord.id === id) {
          setEditingRecord(null);
        }
      },
    });
  };

  const handleDeleteStudentWithConfirm = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบนักเรียน',
      message: `คุณต้องการลบข้อมูลของ "${name}" ออกจากระบบใช่หรือไม่?`,
      confirmText: 'ลบนักเรียน',
      onConfirm: () => {
        deleteStudent(id);
        if (editingStudent && editingStudent.id === id) {
          setEditingStudent(null);
        }
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Dashboard Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-lg ring-2 ring-emerald-500/30 shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800">
                  ADMIN CLINICAL DASHBOARD (REAL TIME)
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  อัปเดตอัตโนมัติเมื่อมีการเพิ่ม/แก้ไข/ลบ
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
                  ศูนย์วิเคราะห์และสถิติห้องพยาบาล
                </h1>
                <button
                  onClick={() => {
                    setTargetAcademicYear(schoolInfo.academicYear || '2569');
                    setTargetSemester(schoolInfo.semester || 'ภาคเรียนที่ 1');
                    setIsChangeYearModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all shadow-xs"
                  title="คลิกเพื่อเปลี่ยนปีการศึกษา หรือภาคเรียน"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>ปีการศึกษา {schoolInfo.academicYear || '2569'}</span>
                  <span className="opacity-80 font-normal">({schoolInfo.semester || 'ภาคเรียนที่ 1'})</span>
                  <span className="text-[10px] bg-emerald-400/30 text-white px-1.5 py-0.2 rounded font-semibold ml-0.5">
                    เปลี่ยนปี
                  </span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                โรงเรียนวัดใหม่อมตรส • ผู้ดูแล: <strong>{schoolInfo.nurseInCharge}</strong> • {schoolInfo.roomLocation}
              </p>
            </div>
          </div>

          {/* Sub Navigation in Dashboard */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'analytics'
                  ? 'bg-[#2A9D8F] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📈 สถิติ & KPI
            </button>
            <button
              onClick={() => setActiveSubTab('records')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                activeSubTab === 'records'
                  ? 'bg-[#2A9D8F] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📋 บันทึกการใช้บริการ Real Time</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                {records.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSubTab('roster')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeSubTab === 'roster'
                  ? 'bg-[#2A9D8F] text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🎒 บัญชีรายชื่อนักเรียน ({students.length})
            </button>
            <button
              onClick={() => setActiveSubTab('safety')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'safety'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>🦺 อุบัติเหตุ & ความปลอดภัย</span>
            </button>
            <button
              onClick={() => {
                setPromoteTargetYear(String(parseInt(schoolInfo.academicYear || '2569', 10) + 1));
                setIsPromoteModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
              title="เลื่อนชั้นเรียนนักเรียนทั้งโรงเรียนสู่ปีการศึกษาใหม่ (ป.1->ป.2 ... ป.6->จบการศึกษา)"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>เลื่อนชั้นสู่ปีใหม่</span>
            </button>
            <button
              onClick={onOpenSyncModal}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
            >
              <Sheet className="w-3.5 h-3.5" />
              <span>ซิงค์ Sheets</span>
            </button>
            <button
              onClick={handleCloudSync}
              disabled={isFirebaseSyncing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                cloudSyncMsg
                  ? 'bg-emerald-600 text-white'
                  : isFirebaseSyncing
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
              title="บันทึกข้อมูลทั้งหมดขึ้นคลาวด์ Firebase Firestore"
            >
              <span>🔥</span>
              <span>{cloudSyncMsg ? '✓ ซิงค์สำเร็จ' : isFirebaseSyncing ? 'กำลังซิงค์...' : 'ซิงค์ Firestore'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Connection Status Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border border-orange-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔥</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Firebase Firestore Cloud Database</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                {isFirebaseConnected ? 'เชื่อมต่อออนไลน์' : 'ออฟไลน์'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Project: <code className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">{firebaseProjectId}</code> • ภูมิภาค: <span className="font-medium text-slate-700">asia-southeast1 (สิงคโปร์)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCloudSync}
            disabled={isFirebaseSyncing}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>{isFirebaseSyncing ? '⏳' : '⚡'}</span>
            <span>{cloudSyncMsg ? 'ซิงค์ข้อมูลเรียบร้อยแล้ว' : isFirebaseSyncing ? 'กำลังบันทึกลงคลาวด์...' : 'ซิงค์ข้อมูลทั้งหมดสู่ Firestore'}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'analytics' && (
        <>
          {/* Date, Month & Academic Year Filter Control Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#2A9D8F]" />
                <span>ตัวกรองวันเดือนปี & ปีการศึกษา:</span>
              </span>

              {/* Year filter */}
              <select
                value={analyticsYearFilter}
                onChange={(e) => setAnalyticsYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">ทุกปีการศึกษา ({records.length} เคส)</option>
                {availableAcademicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    ปีการศึกษา {yr} {yr === (schoolInfo.academicYear || '2569') ? '(ปัจจุบัน)' : ''}
                  </option>
                ))}
              </select>

              {/* Month filter */}
              <select
                value={analyticsMonthFilter}
                onChange={(e) => setAnalyticsMonthFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="all">ทุกเดือน</option>
                <option value="05">พฤษภาคม (พ.ค.)</option>
                <option value="06">มิถุนายน (มิ.ย.)</option>
                <option value="07">กรกฎาคม (ก.ค.)</option>
                <option value="08">สิงหาคม (ส.ค.)</option>
                <option value="09">กันยายน (ก.ย.)</option>
                <option value="10">ตุลาคม (ต.ค.)</option>
                <option value="11">พฤศจิกายน (พ.ย.)</option>
                <option value="12">ธันวาคม (ธ.ค.)</option>
                <option value="01">มกราคม (ม.ค.)</option>
                <option value="02">กุมภาพันธ์ (ก.พ.)</option>
                <option value="03">มีนาคม (มี.ค.)</option>
                <option value="04">เมษายน (เม.ย.)</option>
              </select>

              {/* Specific Date filter */}
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={analyticsDateFilter}
                  onChange={(e) => setAnalyticsDateFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                  title="กรองตามวันที่เฉพาะเจาะจง (วัน/เดือน/ปี)"
                />
              </div>

              {(analyticsYearFilter !== 'all' || analyticsMonthFilter !== 'all' || analyticsDateFilter) && (
                <button
                  onClick={() => {
                    setAnalyticsYearFilter('all');
                    setAnalyticsMonthFilter('all');
                    setAnalyticsDateFilter('');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างตัวกรอง</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <span className="text-[11px] text-slate-500 font-medium">
                พบ <strong>{totalVisits}</strong> จากทั้งหมด <strong>{records.length}</strong> รายการ
              </span>
              <button
                onClick={() => {
                  setTargetAcademicYear(schoolInfo.academicYear || '2569');
                  setTargetSemester(schoolInfo.semester || 'ภาคเรียนที่ 1');
                  setIsChangeYearModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E8F6F7] hover:bg-[#d8f2f4] text-[#2A9D8F] font-bold flex items-center gap-1 transition-colors shadow-2xs"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>เปลี่ยนปีการศึกษา</span>
              </button>
            </div>
          </div>

          {/* School Accidents & Hazard Prevention Spotlight Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 rounded-3xl p-5 sm:p-6 border border-amber-300/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                🦺
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                    จุดเสี่ยง & การป้องกันความปลอดภัยในโรงเรียน
                  </span>
                  <span className="text-xs text-slate-600 font-medium">ระดับเด็กเล็กอนุบาล (อ.1 - อ.3) และเด็กประถม (ป.1 - ป.6)</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Dashboard อุบัติเหตุที่พบบ่อยในเด็กอนุบาลและประถมศึกษาระหว่างอยู่ในโรงเรียน
                </h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  มักเกิดจากการวิ่งเล่นซุกซน ขาดการระมัดระวัง หรือสภาพแวดล้อมที่ไม่ปลอดภัย: เฝ้าระวัง 7 จุดเสี่ยงสำคัญ (พลัดตกหกล้ม, สนามเด็กเล่น, กีฬาพละ, ประตูและเฟอร์นิเจอร์, สำลักกลืนสิ่งแปลกปลอม, ไฟฟ้า/ตู้น้ำดื่ม, ประตูรั้ว/เขตก่อสร้าง) พร้อมมาตรการป้องกันเชิงรุก 3 ด้านหลัก
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('safety')}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start md:self-center cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>เปิดดู Dashboard ความปลอดภัยฉบับเต็ม ➔</span>
            </button>
          </div>

          {/* 4 Key Metric Cards (Real Time Dynamic) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-[#2A9D8F]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-2xl bg-[#E8F6F7] text-[#2A9D8F]">
                  🩺
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Real Time
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {totalVisits}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                รับบริการสะสม
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">รวมการเข้าพักและขอรับยา</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-[#2A9D8F]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-2xl bg-amber-50 text-amber-600">
                  🩹
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                  {totalVisits > 0 ? Math.round((firstAidCount / totalVisits) * 100) : 0}% ของเคส
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {firstAidCount}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                ปฐมพยาบาลเบื้องต้น
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">ทำแผล หกล้ม ฟกช้ำ เลือดกำเดา</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-[#2A9D8F]/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-2xl bg-sky-50 text-sky-600">
                  📞
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                  ประสานครบ
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {parentNotifiedCount}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                แจ้งผู้ปกครอง
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">ประสานรับกลับบ้านหรือเฝ้าระวัง</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl p-2 rounded-2xl bg-rose-50 text-rose-600">
                  🏥
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  รพ.วชิรพยาบาล
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {hospitalTransfers}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                ส่งต่อสถานพยาบาล
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">นำส่งปลอดภัยถึงมือแพทย์</p>
            </div>
          </div>

          {/* Monthly Statistics & Top Symptoms (Real Time Dynamic) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend Visualizer */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#2A9D8F]" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    สถิติการใช้บริการรายเดือน (Monthly Trend)
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  ปีการศึกษา {analyticsYearFilter !== 'all' ? analyticsYearFilter : (schoolInfo.academicYear || '2569')}
                </span>
              </div>

              {/* Bar Chart Representation from real data */}
              <div className="space-y-3 pt-2">
                {monthLabels.map((item) => {
                  const count = monthMap[item.key] || 0;
                  const pct = Math.min(100, Math.round((count / maxMonthCount) * 100));
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{item.label} ({item.th})</span>
                        <span className="text-slate-900 font-bold">{count} ครั้ง</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2A9D8F] to-[#21867a] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>บันทึกทั้งหมด: <strong>{totalVisits} รายการ</strong></span>
                <span>เตียงพักขณะนี้: <strong>นอนพัก {restingCount} เตียง</strong></span>
              </div>
            </div>

            {/* Top Symptoms Breakdown */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🩺</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    อาการที่พบบ่อยที่สุด
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Top Ranking</span>
              </div>

              <div className="space-y-3.5">
                {sortedSymptoms.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">ยังไม่มีข้อมูลอาการที่บันทึก</p>
                ) : (
                  sortedSymptoms.map(([symName, count], idx) => {
                    const pct = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
                    return (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" />
                            <span>{symName}</span>
                          </div>
                          <span className="text-slate-900 text-sm">{count} เคส</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2A9D8F] rounded-full"
                            style={{ width: `${Math.min(100, pct * 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#E8F6F7] border border-[#2A9D8F]/20 text-xs text-[#1e6f5c]">
                💡 <strong>รายงานผู้ดูแล:</strong> ปรับเปลี่ยนตามเวชระเบียนที่บันทึกเข้าสู่ระบบแบบ Real Time
              </div>
            </div>
          </div>

          {/* Follow-up Watchlist & Grade Level Statistics (Real Time Dynamic) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Follow-up watchlist from real records */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👧</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    นักเรียนที่ต้องติดตามอาการ (Watchlist)
                  </h2>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ติดตาม {followUpRecords.length} ราย
                </span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {followUpRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">ไม่มีนักเรียนที่ต้องติดตามอาการเป็นพิเศษ</p>
                ) : (
                  followUpRecords.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.studentName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                            {item.grade}/{item.room}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.date}</span>
                        </div>
                        <p className="text-slate-600 mt-1">
                          อาการ: {item.symptoms.join(', ')} • {item.followUpNotes || 'ตรวจซ้ำ'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          updateRecord({
                            ...item,
                            followUpNeeded: false,
                            followUpNotes: 'ติดตามอาการเรียบร้อยแล้ว หายดี',
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 text-[11px] shrink-0"
                      >
                        ปิดเคส
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => onNavigate('records')}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-[#2A9D8F] bg-[#E8F6F7] hover:bg-[#d8f1f3] transition-colors"
              >
                เปิดดูในระบบเวชระเบียนทั้งหมด
              </button>
            </div>

            {/* Grade Breakdown */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏫</span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    สถิติตามระดับชั้นเรียน (อนุบาล 1 - ป.6)
                  </h2>
                </div>
                <span className="text-xs text-slate-400">จาก {totalVisits} เคส</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gradeCounts.map((item, idx) => {
                  const pct = totalVisits > 0 ? Math.round((item.count / totalVisits) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-center"
                    >
                      <span className="text-xs font-bold text-slate-500">ชั้น {item.grade}</span>
                      <div className="text-xl font-black text-slate-900">{item.count} ครั้ง</div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-[#2A9D8F] h-full"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Bed Status */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-400" />
                  <span>สถานะเตียงพัก (ชั้น 2):</span>
                </div>
                <span className="font-bold text-emerald-400">
                  ครองเตียง {restingCount} เตียง / ว่าง {Math.max(0, schoolInfo.bedsTotal - restingCount)} เตียง (รวม {schoolInfo.bedsTotal} เตียง)
                </span>
              </div>
            </div>

            {/* Real-Time Student Blood Group Statistics Widget */}
            <div className="lg:col-span-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🩸</span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      สถิติหมู่เลือดนักเรียนทั้งโรงเรียน (Real Time)
                    </h2>
                    <p className="text-xs text-slate-500">
                      คำนวณสดจากฐานข้อมูลนักเรียน {students.length} คน • แก้ไขหรือลบหมู่เลือดได้ Real Time
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubTab('roster')}
                  className="text-xs font-bold text-[#2A9D8F] bg-[#E8F6F7] hover:bg-[#d5f3f5] px-3.5 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
                >
                  จัดการ / แก้ไข / ลบหมู่เลือดรายบุคคล →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                  <span className="text-xs font-bold text-emerald-800">หมู่เลือด O</span>
                  <div className="text-2xl font-black text-emerald-700">{bloodStats.O} คน</div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {students.length > 0 ? Math.round((bloodStats.O / students.length) * 100) : 0}% ของทั้ง รร.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-1">
                  <span className="text-xs font-bold text-rose-800">หมู่เลือด A</span>
                  <div className="text-2xl font-black text-rose-700">{bloodStats.A} คน</div>
                  <div className="text-[11px] text-rose-600 font-medium">
                    {students.length > 0 ? Math.round((bloodStats.A / students.length) * 100) : 0}% ของทั้ง รร.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-1">
                  <span className="text-xs font-bold text-sky-800">หมู่เลือด B</span>
                  <div className="text-2xl font-black text-sky-700">{bloodStats.B} คน</div>
                  <div className="text-[11px] text-sky-600 font-medium">
                    {students.length > 0 ? Math.round((bloodStats.B / students.length) * 100) : 0}% ของทั้ง รร.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
                  <span className="text-xs font-bold text-purple-800">หมู่เลือด AB</span>
                  <div className="text-2xl font-black text-purple-700">{bloodStats.AB} คน</div>
                  <div className="text-[11px] text-purple-600 font-medium">
                    {students.length > 0 ? Math.round((bloodStats.AB / students.length) * 100) : 0}% ของทั้ง รร.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700">ยังไม่ระบุ / ลบออก</span>
                  <div className="text-2xl font-black text-slate-600">{bloodStats.unspecified} คน</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {students.length > 0 ? Math.round((bloodStats.unspecified / students.length) * 100) : 0}% ของทั้ง รร.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Records Sub-Tab: ระบบบันทึกการใช้บริการห้องพยาบาล DASHBOARD (REAL TIME) */}
      {activeSubTab === 'records' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3 py-1 rounded-full">
                  LIVE CLINIC LOG SYSTEM
                </span>
                <span className="text-xs text-slate-400">
                  {records.length} รายการ (แก้ไข/ลบได้ทุกช่อง Real Time)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                ระบบบันทึกการใช้บริการห้องพยาบาล DASHBOARD (REAL TIME)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                ข้อมูลเชื่อมโยงถึงกันทุกช่อง ปรับเปลี่ยนอัปเดตอัตโนมัติทันทีทั้งระบบสถิติและคลาวด์ Firestore
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsAddRecordOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มเวชระเบียนใหม่</span>
              </button>

              <select
                value={recordYearFilter}
                onChange={(e) => setRecordYearFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="all">ทุกปีการศึกษา</option>
                {availableAcademicYears.map((yr) => (
                  <option key={yr} value={yr}>
                    ปีการศึกษา {yr}
                  </option>
                ))}
              </select>

              <select
                value={recordMonthFilter}
                onChange={(e) => setRecordMonthFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
              >
                <option value="all">ทุกเดือน</option>
                <option value="05">พ.ค.</option>
                <option value="06">มิ.ย.</option>
                <option value="07">ก.ค.</option>
                <option value="08">ส.ค.</option>
                <option value="09">ก.ย.</option>
                <option value="10">ต.ค.</option>
                <option value="11">พ.ย.</option>
                <option value="12">ธ.ค.</option>
                <option value="01">ม.ค.</option>
                <option value="02">ก.พ.</option>
                <option value="03">มี.ค.</option>
                <option value="04">เม.ย.</option>
              </select>

              <input
                type="date"
                value={recordDateFilter}
                onChange={(e) => setRecordDateFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                title="เลือกวันที่ระบุเฉพาะ (วัน/เดือน/ปี)"
              />

              <select
                value={recordGradeFilter}
                onChange={(e) => setRecordGradeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">ทุกระดับชั้น (อ.1 - ป.6)</option>
                <optgroup label="ระดับอนุบาล">
                  <option value="อ.1">อนุบาล 1 (อ.1)</option>
                  <option value="อ.2">อนุบาล 2 (อ.2)</option>
                  <option value="อ.3">อนุบาล 3 (อ.3)</option>
                </optgroup>
                <optgroup label="ระดับประถมศึกษา">
                  <option value="ป.1">ป.1</option>
                  <option value="ป.2">ป.2</option>
                  <option value="ป.3">ป.3</option>
                  <option value="ป.4">ป.4</option>
                  <option value="ป.5">ป.5</option>
                  <option value="ป.6">ป.6</option>
                </optgroup>
              </select>

              <select
                value={recordStatusFilter}
                onChange={(e) => setRecordStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">ทุกสถานะการดูแล</option>
                <option value="returned">✅ กลับเข้าห้องเรียน</option>
                <option value="resting">🛌 นอนพักสังเกตอาการ</option>
                <option value="referred">🏥 ส่งต่อสถานพยาบาล / รพ.</option>
                <option value="followup">🔔 ต้องติดตามอาการ</option>
                <option value="parent">📞 แจ้งผู้ปกครอง</option>
              </select>

              {(recordYearFilter !== 'all' || recordMonthFilter !== 'all' || recordDateFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setRecordYearFilter('all');
                    setRecordMonthFilter('all');
                    setRecordDateFilter('');
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ล้างตัวกรองวันที่</span>
                </button>
              )}

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัส, อาการ..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">บันทึกทั้งหมด</span>
                <div className="text-xl font-black text-slate-900">{records.length} ครั้ง</div>
              </div>
              <span className="text-2xl">📋</span>
            </div>
            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-700 font-medium">ครองเตียงพัก</span>
                <div className="text-xl font-black text-amber-800">{restingCount} เตียง</div>
              </div>
              <span className="text-2xl">🛌</span>
            </div>
            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-rose-700 font-medium">ส่งต่อ รพ.</span>
                <div className="text-xl font-black text-rose-800">{hospitalTransfers} ราย</div>
              </div>
              <span className="text-2xl">🏥</span>
            </div>
            <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-orange-700 font-medium">ติดตามอาการ</span>
                <div className="text-xl font-black text-orange-800">{followUpRecords.length} ราย</div>
              </div>
              <span className="text-2xl">🔔</span>
            </div>
          </div>

          {/* Interactive Table with Edit Every Field & Delete */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3">วัน/เวลา</th>
                  <th className="py-3 px-4">นักเรียนผู้รับบริการ</th>
                  <th className="py-3 px-3">ชั้น/ห้อง</th>
                  <th className="py-3 px-3 text-center">หมู่เลือด</th>
                  <th className="py-3 px-4">อาการสำคัญ</th>
                  <th className="py-3 px-4">การรักษา / ยา / เตียง</th>
                  <th className="py-3 px-4">ผลการดูแล</th>
                  <th className="py-3 px-3">ผู้ปกครอง/ส่งต่อ</th>
                  <th className="py-3 px-3 text-center">จัดการ (แก้ไขทุกช่อง/ลบ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDashboardRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      ไม่พบรายการเวชระเบียนที่ตรงกับการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredDashboardRecords.map((rec) => {
                    const isReturned = rec.careResult === 'ดีขึ้น กลับเข้าห้องเรียน';
                    const isResting = rec.careResult === 'นอนพักสังเกตอาการ';
                    const isReferred = rec.careResult === 'ส่งต่อสถานพยาบาล / รพ.';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{rec.date}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#2A9D8F]" />
                            <span>{rec.time} น.</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{rec.studentName}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-mono text-[#2A9D8F]">{rec.studentId}</span>
                            <span>•</span>
                            <span>{rec.gender}</span>
                            {rec.temperature && (
                              <span className="font-bold text-amber-700 bg-amber-50 px-1 rounded">
                                🌡️ {rec.temperature}°C
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-[#2A9D8F]">
                          {rec.grade}/{rec.room}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              rec.bloodType === 'A'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : rec.bloodType === 'B'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : rec.bloodType === 'AB'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : rec.bloodType === 'O'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            {rec.bloodType && rec.bloodType !== 'ไม่ระบุ' ? `หมู่ ${rec.bloodType}` : 'ไม่ระบุ'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 mb-1">
                            {rec.symptoms.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4C2] text-amber-800 border border-amber-200"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                          {rec.symptomDetail && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {rec.symptomDetail}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-[220px]">
                          <p className="text-slate-800 font-medium line-clamp-2">
                            {rec.treatmentDetail}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.medicationGiven && (
                              <span className="text-[10px] text-purple-700 bg-purple-50 rounded px-1.5 py-0.5">
                                💊 {rec.medicationGiven}
                              </span>
                            )}
                            {rec.bedNumber && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5">
                                🛌 เตียง #{rec.bedNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                              isReturned
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isResting
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : isReferred
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isReturned && '✅'}
                            {isResting && '🛌'}
                            {isReferred && '🏥'}
                            <span>{rec.careResult}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                          {rec.parentNotified ? (
                            <div className="text-sky-700 font-semibold">
                              📞 แจ้งผู้ปกครองแล้ว
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                          {rec.referredTo && (
                            <div className="text-rose-600 font-bold mt-0.5">
                              🏥 {rec.referredTo}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingRecord(rec)}
                              title="แก้ไขได้ทุกช่องแบบ Real Time"
                              className="px-2.5 py-1.5 rounded-lg bg-[#E8F6F7] hover:bg-[#d4f2f4] text-[#2A9D8F] font-bold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>แก้ไขทุกช่อง</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRecordWithConfirm(rec.id, rec.studentName)}
                              title="ลบเวชระเบียนนี้"
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster Viewer Sub-Tab */}
      {activeSubTab === 'roster' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  บัญชีรายชื่อนักเรียน โรงเรียนวัดใหม่อมตรส
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                  ปีการศึกษา {rosterYearFilter !== 'all' ? rosterYearFilter : (schoolInfo.academicYear || '2569')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ข้อมูลนักเรียนตามแบบ ปพ. รวม <strong>{students.length}</strong> คน (แสดงผล <strong>{filteredStudents.length}</strong> คน) • รองรับการเปลี่ยนแปลงข้อมูลและเลื่อนชั้นเรียนทุกปีการศึกษา
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setPromoteTargetYear(String(parseInt(schoolInfo.academicYear || '2569', 10) + 1));
                  setIsPromoteModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                title="เลื่อนชั้นเรียนนักเรียนทั้งโรงเรียนอัตโนมัติสู่ปีการศึกษาใหม่"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>เลื่อนชั้นสู่ปีใหม่</span>
              </button>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มนักเรียน</span>
              </button>

              <select
                value={rosterYearFilter}
                onChange={(e) => setRosterYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700"
              >
                <option value="all">ทุกปีการศึกษา ({students.length} คน)</option>
                {availableAcademicYears.map((yr) => {
                  const cnt = students.filter((s) => (s.academicYear || '2569') === yr).length;
                  return (
                    <option key={yr} value={yr}>
                      ปีการศึกษา {yr} {yr === (schoolInfo.academicYear || '2569') ? '(ปัจจุบัน)' : ''} ({cnt} คน)
                    </option>
                  );
                })}
              </select>

              <select
                value={rosterStatusFilter}
                onChange={(e) => setRosterStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="กำลังศึกษา">กำลังศึกษา</option>
                <option value="จบการศึกษา">จบการศึกษา</option>
                <option value="ย้ายสถานศึกษา">ย้ายสถานศึกษา</option>
              </select>

              <select
                value={rosterGrade}
                onChange={(e) => setRosterGrade(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">ทุกระดับชั้น (อ.1 - ป.6)</option>
                <optgroup label="ระดับอนุบาล">
                  <option value="อ.1">อนุบาล 1 (อ.1)</option>
                  <option value="อ.2">อนุบาล 2 (อ.2)</option>
                  <option value="อ.3">อนุบาล 3 (อ.3)</option>
                </optgroup>
                <optgroup label="ระดับประถมศึกษา">
                  <option value="ป.1">ป.1</option>
                  <option value="ป.2">ป.2</option>
                  <option value="ป.3">ป.3</option>
                  <option value="ป.4">ป.4</option>
                  <option value="ป.5">ป.5</option>
                  <option value="ป.6">ป.6</option>
                </optgroup>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือเลขประจำตัว..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">เลขที่</th>
                  <th className="py-2.5 px-3">เลขประจำตัว</th>
                  <th className="py-2.5 px-3">เลขบัตรประชาชน</th>
                  <th className="py-2.5 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-2.5 px-3">ชั้น/ห้อง</th>
                  <th className="py-2.5 px-3 text-center">ปีการศึกษา</th>
                  <th className="py-2.5 px-3 text-center">สถานะ</th>
                  <th className="py-2.5 px-3">วันเกิด</th>
                  <th className="py-2.5 px-3 text-center">หมู่เลือด (คลิกเพื่อแก้ไข/ลบ)</th>
                  <th className="py-2.5 px-3">ประวัติโรค/แพ้</th>
                  <th className="py-2.5 px-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400 text-xs">
                      ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std, idx) => (
                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 text-slate-500 font-semibold">{std.no || idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#2A9D8F]">{std.studentId}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{std.citizenId || '-'}</td>
                      <td className="py-2 px-4 font-bold text-slate-900">{std.fullName}</td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{std.grade}/{std.room}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600 font-semibold">
                        {std.academicYear || schoolInfo.academicYear || '2569'}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            std.status === 'จบการศึกษา'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : std.status === 'ย้ายสถานศึกษา'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {std.status || 'กำลังศึกษา'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{std.birthDate || '-'}</td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                              std.bloodType === 'A'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : std.bloodType === 'B'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : std.bloodType === 'AB'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : std.bloodType === 'O'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {std.bloodType ? `หมู่ ${std.bloodType}` : 'ไม่ระบุ'}
                          </span>
                          <button
                            onClick={() => setQuickBloodStudent(std)}
                            title="แก้ไขหรือลบหมู่เลือด Real Time"
                            className="p-1 hover:bg-slate-200 rounded-md text-slate-500 transition-colors text-[10px]"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        {std.allergies ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700">
                            {std.allergies}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ปกติ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingStudent(std)}
                            title="แก้ไขข้อมูลนักเรียน"
                            className="p-1.5 text-slate-500 hover:text-[#2A9D8F] hover:bg-[#E8F6F7] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudentWithConfirm(std.id, std.fullName)}
                            title="ลบนักเรียน"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Safety & Accidents Sub-Tab: Dashboard อุบัติเหตุที่พบบ่อยในเด็กอนุบาลและประถมศึกษาระหว่างอยู่ในโรงเรียน */}
      {activeSubTab === 'safety' && (
        <SchoolAccidentsDashboard onNavigateToRecords={() => setActiveSubTab('records')} />
      )}

      {/* 1. Quick Blood Type Manager Modal (Real-Time Edit & Delete) */}
      {quickBloodStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🩸</span>
                  <span>แก้ไข / ลบหมู่เลือด</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {quickBloodStudent.fullName} (ชั้น {quickBloodStudent.grade}/{quickBloodStudent.room})
                </p>
              </div>
              <button
                onClick={() => setQuickBloodStudent(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 font-medium">หมู่เลือดปัจจุบัน:</span>
              <div className="text-xl font-black text-rose-600 mt-0.5">
                {quickBloodStudent.bloodType && quickBloodStudent.bloodType !== 'ไม่ระบุ'
                  ? `หมู่ ${quickBloodStudent.bloodType}`
                  : 'ยังไม่ระบุ'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                เลือกหมู่เลือดใหม่ (บันทึก Real Time ทันที):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                  <button
                    key={bt}
                    onClick={() => {
                      updateStudentBloodType(quickBloodStudent.id, bt);
                      setQuickBloodStudent(null);
                    }}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      quickBloodStudent.bloodType === bt
                        ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-sm scale-105'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    หมู่ {bt}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    updateStudentBloodType(quickBloodStudent.id, 'ไม่ระบุ');
                    setQuickBloodStudent(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>✕ ลบหมู่เลือด (ตั้งเป็นไม่ระบุ)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Student Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  แก้ไขข้อมูลนักเรียน
                </h3>
                <p className="text-xs text-slate-500">
                  รหัส {editingStudent.studentId} • ซิงค์แบบ Real Time
                </p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStudent(editingStudent);
                setEditingStudent(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัว</label>
                  <input
                    type="text"
                    value={editingStudent.studentId}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, studentId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขบัตรประชาชน</label>
                  <input
                    type="text"
                    value={editingStudent.citizenId || ''}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, citizenId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชั้น</label>
                  <select
                    value={editingStudent.grade}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        grade: e.target.value as GradeLevel,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <optgroup label="ระดับอนุบาล">
                      <option value="อ.1">อนุบาล 1 (อ.1)</option>
                      <option value="อ.2">อนุบาล 2 (อ.2)</option>
                      <option value="อ.3">อนุบาล 3 (อ.3)</option>
                    </optgroup>
                    <optgroup label="ระดับประถมศึกษา">
                      <option value="ป.1">ป.1</option>
                      <option value="ป.2">ป.2</option>
                      <option value="ป.3">ป.3</option>
                      <option value="ป.4">ป.4</option>
                      <option value="ป.5">ป.5</option>
                      <option value="ป.6">ป.6</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={editingStudent.room}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, room: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขที่</label>
                  <input
                    type="number"
                    value={editingStudent.no || ''}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        no: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Academic Year, Status & Birth Date */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    🎓 ปีการศึกษา
                  </label>
                  <input
                    type="text"
                    value={editingStudent.academicYear || schoolInfo.academicYear || '2569'}
                    placeholder="2569"
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, academicYear: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    สถานะการศึกษา
                  </label>
                  <select
                    value={editingStudent.status || 'กำลังศึกษา'}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, status: e.target.value as any })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="กำลังศึกษา">กำลังศึกษา</option>
                    <option value="จบการศึกษา">จบการศึกษา</option>
                    <option value="ย้ายสถานศึกษา">ย้ายสถานศึกษา</option>
                    <option value="พักการเรียน">พักการเรียน</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                    วันเกิด (วัน/เดือน/ปี)
                  </label>
                  <input
                    type="text"
                    value={editingStudent.birthDate || ''}
                    placeholder="เช่น 15 มิ.ย. 2562"
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, birthDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Blood Type Edit & Delete */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">🩸 หมู่เลือด</span>
                  <span className="font-extrabold text-[#2A9D8F]">
                    {editingStudent.bloodType && editingStudent.bloodType !== 'ไม่ระบุ'
                      ? `หมู่ ${editingStudent.bloodType}`
                      : 'ยังไม่ระบุ'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setEditingStudent({ ...editingStudent, bloodType: bt })}
                      className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                        editingStudent.bloodType === bt
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      หมู่ {bt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingStudent({ ...editingStudent, bloodType: 'ไม่ระบุ' })
                    }
                    className={`px-3 py-1 rounded-xl font-semibold border transition-all ${
                      !editingStudent.bloodType || editingStudent.bloodType === 'ไม่ระบุ'
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    ✕ ลบหมู่เลือด
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ประวัติแพ้ยา / แพ้อาหาร
                  </label>
                  <input
                    type="text"
                    value={editingStudent.allergies || ''}
                    placeholder="เช่น แพ้เพนิซิลิน"
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, allergies: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">โรคประจำตัว</label>
                  <input
                    type="text"
                    value={editingStudent.congenitalDisease || ''}
                    placeholder="เช่น ภูมิแพ้, หอบหืด"
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        congenitalDisease: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เบอร์ผู้ปกครอง</label>
                <input
                  type="text"
                  value={editingStudent.parentPhone || ''}
                  placeholder="เช่น 081-xxx-xxxx"
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, parentPhone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกข้อมูล Real Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Student Modal */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  เพิ่มนักเรียนใหม่เข้าระบบ
                </h3>
                <p className="text-xs text-slate-500">
                  เพิ่มข้อมูลลงในทะเบียนนักเรียน รร.วัดใหม่อมตรส
                </p>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStdName.trim()) return;

                const createdStd: StudentProfile = {
                  id: `std-${Date.now()}`,
                  studentId: newStdId.trim() || `${Math.floor(6200 + Math.random() * 800)}`,
                  citizenId: newStdCitizenId.trim() || undefined,
                  fullName: newStdName.trim(),
                  grade: newStdGrade,
                  room: newStdRoom,
                  gender: newStdGender,
                  birthDate: newStdBirth.trim() || undefined,
                  bloodType: newStdBlood,
                  allergies: newStdAllergies.trim() || undefined,
                  congenitalDisease: newStdCongenital.trim() || undefined,
                  parentPhone: newStdPhone.trim() || undefined,
                };

                addStudent(createdStd);
                setIsAddStudentOpen(false);
                setNewStdName('');
                setNewStdId('');
                setNewStdCitizenId('');
                setNewStdAllergies('');
                setNewStdCongenital('');
                setNewStdPhone('');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ด.ช. ภูวนารถ มณีแสง"
                  value={newStdName}
                  onChange={(e) => setNewStdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัว</label>
                  <input
                    type="text"
                    placeholder="เช่น 6230"
                    value={newStdId}
                    onChange={(e) => setNewStdId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขบัตรประชาชน</label>
                  <input
                    type="text"
                    placeholder="1-xxxx-xxxxx-xx-x"
                    value={newStdCitizenId}
                    onChange={(e) => setNewStdCitizenId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชั้น</label>
                  <select
                    value={newStdGrade}
                    onChange={(e) => setNewStdGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <optgroup label="ระดับอนุบาล">
                      <option value="อ.1">อนุบาล 1 (อ.1)</option>
                      <option value="อ.2">อนุบาล 2 (อ.2)</option>
                      <option value="อ.3">อนุบาล 3 (อ.3)</option>
                    </optgroup>
                    <optgroup label="ระดับประถมศึกษา">
                      <option value="ป.1">ประถมศึกษาปีที่ 1 (ป.1)</option>
                      <option value="ป.2">ประถมศึกษาปีที่ 2 (ป.2)</option>
                      <option value="ป.3">ประถมศึกษาปีที่ 3 (ป.3)</option>
                      <option value="ป.4">ประถมศึกษาปีที่ 4 (ป.4)</option>
                      <option value="ป.5">ประถมศึกษาปีที่ 5 (ป.5)</option>
                      <option value="ป.6">ประถมศึกษาปีที่ 6 (ป.6)</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={newStdRoom}
                    onChange={(e) => setNewStdRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เพศ</label>
                  <select
                    value={newStdGender}
                    onChange={(e) => setNewStdGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              {/* Blood Type in Add Student */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">🩸 หมู่เลือด</span>
                  <span className="font-extrabold text-[#2A9D8F]">
                    {newStdBlood && newStdBlood !== 'ไม่ระบุ' ? `หมู่ ${newStdBlood}` : 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setNewStdBlood(bt)}
                      className={`px-3 py-1 rounded-xl font-bold border transition-all ${
                        newStdBlood === bt
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      หมู่ {bt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewStdBlood('ไม่ระบุ')}
                    className={`px-3 py-1 rounded-xl font-semibold border transition-all ${
                      newStdBlood === 'ไม่ระบุ'
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    ✕ ลบ/ไม่ระบุ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ประวัติแพ้ยา / แพ้อาหาร
                  </label>
                  <input
                    type="text"
                    value={newStdAllergies}
                    placeholder="เช่น แพ้อาหารทะเล"
                    onChange={(e) => setNewStdAllergies(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">โรคประจำตัว</label>
                  <input
                    type="text"
                    value={newStdCongenital}
                    placeholder="เช่น ไม่มี"
                    onChange={(e) => setNewStdCongenital(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เบอร์ผู้ปกครอง</label>
                <input
                  type="text"
                  value={newStdPhone}
                  placeholder="เช่น 089-xxx-xxxx"
                  onChange={(e) => setNewStdPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  เพิ่มนักเรียนใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Record Modal (Dashboard Real Time - Every Field Editable & Deletable) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto text-left space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    DASHBOARD RECORD EDITOR • REAL TIME
                  </span>
                  <span className="text-xs text-slate-400">ID: {editingRecord.id}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  แก้ไขข้อมูลเวชระเบียน: {editingRecord.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  แก้ไขได้ทุกช่อง ข้อมูลเชื่อมโยงถึงกันทั้งระบบและอัปเดตอัตโนมัติทันที
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDashboardEditRecord} className="space-y-5 text-xs sm:text-sm">
              {/* Timing */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>วันและเวลาที่รับบริการ</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      วันที่ (พ.ศ./ค.ศ.)
                    </label>
                    <input
                      type="date"
                      required
                      value={editingRecord.date}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, date: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      เวลาที่มาห้องพยาบาล
                    </label>
                    <input
                      type="time"
                      required
                      value={editingRecord.time}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, time: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ปีการศึกษา
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น 2569"
                      value={editingRecord.academicYear || schoolInfo.academicYear || '2569'}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, academicYear: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Student Demographics & Blood Type */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span>ข้อมูลนักเรียนผู้รับบริการ (เชื่อมต่อบัญชีรายชื่อ)</span>
                  </h4>
                </div>

                {/* Quick Linker from Roster */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    สลับเปลี่ยนนักเรียนจากบัญชีรายชื่อทางการ ({students.length} คน)
                  </label>
                  <select
                    onChange={(e) => {
                      const std = students.find((s) => s.studentId === e.target.value);
                      if (std) {
                        setEditingRecord({
                          ...editingRecord,
                          studentId: std.studentId,
                          studentName: std.fullName,
                          grade: std.grade,
                          room: std.room,
                          gender: std.gender,
                          bloodType: std.bloodType || 'ไม่ระบุ',
                          parentPhone: std.parentPhone || editingRecord.parentPhone,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="">-- หรือเลือกเปลี่ยนเป็นนักเรียนคนอื่น --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.studentId}>
                        {s.grade}/{s.room} (เลขที่ {s.no || '-'}) : {s.fullName} [รหัส {s.studentId}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ชื่อ - นามสกุล นักเรียน
                    </label>
                    <input
                      type="text"
                      required
                      value={editingRecord.studentName}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, studentName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      เลขประจำตัวนักเรียน
                    </label>
                    <input
                      type="text"
                      required
                      value={editingRecord.studentId}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, studentId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ระดับชั้น
                    </label>
                    <select
                      value={editingRecord.grade}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, grade: e.target.value as GradeLevel })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      {(['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'] as const).map((g) => (
                        <option key={g} value={g}>
                          {g.startsWith('อ.') ? `อนุบาล ${g.replace('อ.', '')} (${g})` : g}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ห้อง
                    </label>
                    <input
                      type="text"
                      value={editingRecord.room}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, room: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      เพศ
                    </label>
                    <select
                      value={editingRecord.gender}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, gender: e.target.value as 'ชาย' | 'หญิง' })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                    >
                      <option value="ชาย">ชาย</option>
                      <option value="หญิง">หญิง</option>
                    </select>
                  </div>
                </div>

                {/* Edit & Delete Blood Type */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      🩸 หมู่เลือดนักเรียน (แก้ไขหรือลบ)
                    </label>
                    <span className="text-xs font-extrabold text-[#2A9D8F]">
                      {editingRecord.bloodType || 'ไม่ระบุ'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() =>
                          setEditingRecord({
                            ...editingRecord,
                            bloodType: bt,
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          editingRecord.bloodType === bt
                            ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        หมู่ {bt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          bloodType: 'ไม่ระบุ',
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        !editingRecord.bloodType || editingRecord.bloodType === 'ไม่ระบุ'
                          ? 'bg-slate-800 text-white border-slate-900'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      ✕ ลบหมู่เลือด (ไม่ระบุ)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ผู้นำส่งมาห้องพยาบาล
                    </label>
                    <select
                      value={editingRecord.broughtBy}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, broughtBy: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="เดินมาเอง">เดินมาเอง</option>
                      <option value="เพื่อนพามา">เพื่อนพามา</option>
                      <option value="ครูประจำชั้นพามา">ครูประจำชั้นพามา</option>
                      <option value="ครูเวรพามา">ครูเวรพามา</option>
                      <option value="เจ้าหน้าที่พามา">เจ้าหน้าที่พามา</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ผู้ร่วมทาง / เพื่อนที่พามา (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      placeholder="ระบุชื่อเพื่อน หรือครู"
                      value={editingRecord.companionName || ''}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, companionName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Vitals & Symptoms */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-rose-500" />
                  <span>การตรวจร่างกาย & อาการสำคัญ</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      อุณหภูมิ (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 37.2"
                      value={editingRecord.temperature !== undefined ? editingRecord.temperature : ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ความดันโลหิต
                    </label>
                    <input
                      type="text"
                      placeholder="110/70"
                      value={editingRecord.bloodPressure || ''}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, bloodPressure: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ระดับความเจ็บ (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={editingRecord.painLevel !== undefined ? editingRecord.painLevel : ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          painLevel: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                    />
                  </div>
                </div>

                {/* Symptoms multi-selection */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5 text-xs">
                    อาการสำคัญ (คลิกเลือกหรือยกเลิก)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_SYMPTOMS.map((sym) => {
                      const isSelected = editingRecord.symptoms.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (editingRecord.symptoms.length > 1) {
                                setEditingRecord({
                                  ...editingRecord,
                                  symptoms: editingRecord.symptoms.filter((s) => s !== sym),
                                });
                              }
                            } else {
                              setEditingRecord({
                                ...editingRecord,
                                symptoms: [...editingRecord.symptoms, sym],
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{sym}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    รายละเอียดอาการ / ลักษณะบาดแผล
                  </label>
                  <textarea
                    rows={2}
                    value={editingRecord.symptomDetail}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, symptomDetail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Treatment & Medication */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Bandage className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>การปฐมพยาบาล & การรักษา</span>
                </h4>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1.5 text-xs">
                    การพยาบาลที่ดำเนินการ (คลิกเลือก)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ACTIONS.map((act) => {
                      const isSelected = editingRecord.actionsTaken?.includes(act);
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => {
                            const current = editingRecord.actionsTaken || [];
                            if (isSelected) {
                              setEditingRecord({
                                ...editingRecord,
                                actionsTaken: current.filter((a) => a !== act),
                              });
                            } else {
                              setEditingRecord({
                                ...editingRecord,
                                actionsTaken: [...current, act],
                              });
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{act}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    รายละเอียดการรักษา / การช่วยเหลือเพิ่มเติม
                  </label>
                  <textarea
                    rows={2}
                    value={editingRecord.treatmentDetail}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, treatmentDetail: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      ยาที่จ่าย (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      placeholder="เช่น ยาพาราเซตามอล 1 เม็ด"
                      value={editingRecord.medicationGiven || ''}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, medicationGiven: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      เตียงพักสังเกตอาการ (เบอร์ 1-6)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      placeholder="ว่าง (ไม่นอนพัก)"
                      value={editingRecord.bedNumber !== undefined ? editingRecord.bedNumber : ''}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          bedNumber: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Care Outcome & Referral */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ผลการดูแล & การประสานงาน</span>
                </h4>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    ผลการดูแล / สถานะปัจจุบัน
                  </label>
                  <select
                    value={editingRecord.careResult}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        careResult: e.target.value as CareResult,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    <option value="ดีขึ้น กลับเข้าห้องเรียน">ดีขึ้น กลับเข้าห้องเรียน</option>
                    <option value="นอนพักสังเกตอาการ">นอนพักสังเกตอาการ</option>
                    <option value="แจ้งครูประจำชั้น">แจ้งครูประจำชั้น</option>
                    <option value="ผู้ปกครองมารับกลับบ้าน">ผู้ปกครองมารับกลับบ้าน</option>
                    <option value="ส่งต่อสถานพยาบาล / รพ.">ส่งต่อสถานพยาบาล / รพ.</option>
                    <option value="ต้องติดตามอาการต่อ">ต้องติดตามอาการต่อ</option>
                  </select>
                </div>

                {/* Parent Contact */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRecord.parentNotified}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          parentNotified: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded-sm text-[#2A9D8F]"
                    />
                    <span className="font-semibold text-slate-800 text-xs">
                      โทรแจ้งผู้ปกครองแล้ว
                    </span>
                  </label>

                  {editingRecord.parentNotified && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="ชื่อผู้ปกครองที่ประสาน"
                        value={editingRecord.parentContactName || ''}
                        onChange={(e) =>
                          setEditingRecord({ ...editingRecord, parentContactName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
                      />
                      <input
                        type="text"
                        placeholder="เบอร์โทรผู้ปกครอง"
                        value={editingRecord.parentPhone || ''}
                        onChange={(e) =>
                          setEditingRecord({ ...editingRecord, parentPhone: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Hospital Referral */}
                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    ส่งต่อสถานพยาบาล (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น รพ.วชิรพยาบาล หรือ ศูนย์บริการสาธารณสุข 9"
                    value={editingRecord.referredTo || ''}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, referredTo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                {/* Follow up */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRecord.followUpNeeded}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          followUpNeeded: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded-sm text-[#2A9D8F]"
                    />
                    <span className="font-semibold text-slate-800 text-xs">
                      ต้องติดตามอาการในวันถัดไป (Watchlist)
                    </span>
                  </label>

                  {editingRecord.followUpNeeded && (
                    <input
                      type="text"
                      placeholder="ระบุสิ่งที่ต้องติดตาม เช่น ตรวจดูแผลซ้ำ, วัดไข้ช่วงเช้า"
                      value={editingRecord.followUpNotes || ''}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, followUpNotes: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1 text-xs">
                    ผู้บันทึกเวชระเบียน
                  </label>
                  <input
                    type="text"
                    value={editingRecord.recordedBy}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, recordedBy: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Modal Footer: Delete, Cancel, Save */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteRecordWithConfirm(editingRecord.id, editingRecord.studentName);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบเวชระเบียนนี้</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#2A9D8F] text-white font-bold hover:bg-[#21867a] shadow-xs active:scale-95 transition-all text-xs sm:text-sm"
                  >
                    บันทึกการเปลี่ยนแปลง Real Time
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Record Modal (Dashboard Real Time) */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto text-left space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  เพิ่มบันทึกเวชระเบียนใหม่ (Dashboard Real Time)
                </h3>
                <p className="text-xs text-slate-400">
                  บันทึกโดย: {schoolInfo.nurseInCharge} • {schoolInfo.roomLocation}
                </p>
              </div>
              <button
                onClick={() => setIsAddRecordOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDashboardRecord} className="space-y-4 text-xs sm:text-sm">
              {/* Quick Select from students */}
              <div className="p-3.5 bg-[#E8F6F7]/60 rounded-2xl border border-[#2A9D8F]/20 space-y-1">
                <label className="block text-[11px] font-bold text-[#1e6f5c]">
                  🔍 เลือกจากรายชื่อนักเรียน รร.วัดใหม่อมตรส (ปีการศึกษา {schoolInfo.academicYear || '2569'})
                </label>
                <select
                  onChange={(e) => {
                    const std = students.find((s) => s.studentId === e.target.value);
                    if (std) {
                      setRecName(std.fullName);
                      setRecId(std.studentId);
                      setRecGrade(std.grade);
                      setRecRoom(std.room);
                      setRecGender(std.gender);
                      setRecBlood(std.bloodType || 'ไม่ระบุ');
                      if (std.parentPhone) setRecParentPhone(std.parentPhone);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                >
                  <option value="">-- หรือเลือกนักเรียนจากบัญชีรายชื่อทางการ --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.studentId}>
                      {s.grade}/{s.room} (เลขที่ {s.no || '-'}) : {s.fullName} [รหัส {s.studentId}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่</label>
                  <input
                    type="date"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลา</label>
                  <input
                    type="time"
                    value={recTime}
                    onChange={(e) => setRecTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    placeholder="เช่น 2569"
                    value={recAcademicYear}
                    onChange={(e) => setRecAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ด.ช. กิตติภพ กล้าหาญ"
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขประจำตัว</label>
                  <input
                    type="text"
                    placeholder="เช่น 12345"
                    value={recId}
                    onChange={(e) => setRecId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชั้น</label>
                  <select
                    value={recGrade}
                    onChange={(e) => setRecGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {(['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'] as const).map((g) => (
                      <option key={g} value={g}>
                        {g.startsWith('อ.') ? `อนุบาล ${g.replace('อ.', '')} (${g})` : g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={recRoom}
                    onChange={(e) => setRecRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เพศ</label>
                  <select
                    value={recGender}
                    onChange={(e) => setRecGender(e.target.value as 'ชาย' | 'หญิง')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-center"
                  >
                    <option value="ชาย">ชาย</option>
                    <option value="หญิง">หญิง</option>
                  </select>
                </div>
              </div>

              {/* Blood Type in Add Record Modal */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    🩸 หมู่เลือดนักเรียน
                  </label>
                  <span className="text-xs font-bold text-rose-600">
                    {recBlood || 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setRecBlood(bt)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                        recBlood === bt
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      หมู่ {bt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRecBlood('ไม่ระบุ')}
                    className={`px-3 py-1 rounded-lg text-xs border ${
                      recBlood === 'ไม่ระบุ'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    ไม่ระบุ
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  อาการสำคัญ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SYMPTOMS.map((sym) => {
                    const isSelected = recSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (recSymptoms.length > 1) {
                              setRecSymptoms(recSymptoms.filter((s) => s !== sym));
                            }
                          } else {
                            setRecSymptoms([...recSymptoms, sym]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดอาการ / การรักษาเบื้องต้น
                </label>
                <textarea
                  rows={2}
                  value={recTreatment}
                  onChange={(e) => setRecTreatment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ยาที่จ่าย</label>
                  <input
                    type="text"
                    placeholder="เช่น ยาพาราเซตามอล"
                    value={recMed}
                    onChange={(e) => setRecMed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผลการดูแล</label>
                  <select
                    value={recResult}
                    onChange={(e) => setRecResult(e.target.value as CareResult)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ดีขึ้น กลับเข้าห้องเรียน">ดีขึ้น กลับเข้าห้องเรียน</option>
                    <option value="นอนพักสังเกตอาการ">นอนพักสังเกตอาการ</option>
                    <option value="ผู้ปกครองมารับกลับบ้าน">ผู้ปกครองมารับกลับบ้าน</option>
                    <option value="ส่งต่อสถานพยาบาล / รพ.">ส่งต่อสถานพยาบาล / รพ.</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2A9D8F] text-white font-bold hover:bg-[#21867a]"
                >
                  บันทึกเคส Real Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Universal Confirmation Modal (Replaces window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                {confirmModal.confirmText || 'ยืนยันการลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Annual Student Promotion Modal (เลื่อนชั้นเรียนประจำปีการศึกษาใหม่) */}
      {isPromoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    เลื่อนชั้นเรียนประจำปีการศึกษาใหม่
                  </h3>
                  <p className="text-xs text-slate-500">
                    ระบบเลื่อนชั้นนักเรียนอัตโนมัติ (Promote to Next Academic Year)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Target Academic Year Input */}
            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-800 font-semibold">ปีการศึกษาปัจจุบัน:</span>
                  <span className="ml-2 font-mono font-bold text-indigo-950 text-sm">
                    {schoolInfo.academicYear || '2569'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-indigo-800 font-semibold">นักเรียนปีปัจจุบัน:</span>
                  <span className="ml-1.5 font-bold text-indigo-950 text-sm">
                    {students.filter((s) => (s.academicYear || '2569') === (schoolInfo.academicYear || '2569')).length || students.length} คน
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-900 mb-1">
                  🎓 เลื่อนสู่ปีการศึกษาใหม่:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoteTargetYear}
                    onChange={(e) => setPromoteTargetYear(e.target.value.trim())}
                    placeholder="เช่น 2570"
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-200 bg-white font-mono font-bold text-sm text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-xs text-indigo-700 font-medium">พ.ศ.</span>
                </div>
              </div>
            </div>

            {/* Transition Rules Explanation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">เกณฑ์การปรับระดับชั้นอัตโนมัติ:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                  <span className="font-semibold text-purple-700">อนุบาล 1 (อ.1)</span>
                  <span className="text-purple-700 font-bold">➔ อ.2</span>
                </div>
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                  <span className="font-semibold text-purple-700">อนุบาล 2 (อ.2)</span>
                  <span className="text-purple-700 font-bold">➔ อ.3</span>
                </div>
                <div className="p-2 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between">
                  <span className="font-semibold text-purple-700">อนุบาล 3 (อ.3)</span>
                  <span className="text-purple-700 font-bold">➔ ป.1</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ป.1</span>
                  <span className="text-indigo-600 font-bold">➔ ป.2</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ป.2</span>
                  <span className="text-indigo-600 font-bold">➔ ป.3</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ป.3</span>
                  <span className="text-indigo-600 font-bold">➔ ป.4</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ป.4</span>
                  <span className="text-indigo-600 font-bold">➔ ป.5</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-600">ป.5</span>
                  <span className="text-indigo-600 font-bold">➔ ป.6</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span className="font-semibold text-amber-800">ป.6</span>
                  <span className="text-amber-800 font-bold text-[11px]">➔ จบการศึกษา</span>
                </div>
              </div>
            </div>

            {/* Data Continuity Guarantee Notice */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>การันตีความต่อเนื่องของข้อมูล:</strong> บัญชีรายชื่อนักเรียนจะเพิ่มเข้ามาที่ปี {promoteTargetYear} ทันที โดยข้อมูลของปีก่อนหน้า (ปี {schoolInfo.academicYear || '2569'}) จะยังคงอยู่ครบถ้วนเหมือนเดิมทุกประการ สามารถเรียกดูย้อนหลัง แก้ไข และลบได้เสมอ
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPromoteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!promoteTargetYear) return;
                  const res = await promoteStudentsToNextYear(promoteTargetYear);
                  setPromoteToast(res);
                  setRosterYearFilter(promoteTargetYear);
                  setActiveSubTab('roster');
                  setIsPromoteModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>ยืนยันเลื่อนชั้นเรียนประจำปีการศึกษาใหม่</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Change Academic Year & Semester Modal */}
      {isChangeYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2A9D8F] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  ตั้งค่าปีการศึกษา & ภาคเรียน
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangeYearModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา (พ.ศ.)</label>
                <input
                  type="text"
                  value={targetAcademicYear}
                  onChange={(e) => setTargetAcademicYear(e.target.value.trim())}
                  placeholder="2569"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ภาคเรียน</label>
                <select
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
                  <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
                  <option value="ภาคฤดูร้อน">ภาคฤดูร้อน</option>
                  <option value="ตลอดปีการศึกษา">ตลอดปีการศึกษา</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsChangeYearModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateAcademicYear(targetAcademicYear, targetSemester);
                  setIsChangeYearModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold shadow-xs"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Toast */}
      {promoteToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-indigo-400/30 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="flex-1 text-xs space-y-1">
            <div className="font-bold text-sm text-indigo-200">
              เลื่อนชั้นเรียนสู่ปี {schoolInfo.academicYear} สำเร็จ!
            </div>
            <div className="text-slate-300">
              ปรับเลื่อนชั้น <strong className="text-white">{promoteToast.promoted}</strong> คน • จบการศึกษา <strong className="text-amber-300">{promoteToast.graduated}</strong> คน
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              ✓ ข้อมูลปีก่อนหน้ายังคงอยู่ครบถ้วนในระบบ สามารถเลือกดูย้อนหลัง แก้ไข และลบได้เสมอ
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPromoteToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
