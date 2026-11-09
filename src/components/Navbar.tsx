import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  HeartHandshake,
  Ambulance,
  FileText,
  BookOpen,
  Users,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Sheet,
  Settings,
  Edit2,
  Check,
  Building2,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  spreadsheetUrl: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isLoggingIn,
  spreadsheetUrl,
}) => {
  const {
    schoolInfo,
    updateSchoolInfo,
    isFirebaseConnected,
    isFirebaseSyncing,
    syncToFirebase,
  } = useInfirmary();
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  const handleSyncFirebase = async () => {
    await syncToFirebase();
    setSyncSuccessMsg(true);
    setTimeout(() => setSyncSuccessMsg(false), 2500);
  };

  // Edit states for quick update
  const [nurseName, setNurseName] = useState(schoolInfo.nurseInCharge);
  const [nurseRole, setNurseRole] = useState(schoolInfo.nursePosition);
  const [location, setLocation] = useState(schoolInfo.roomLocation);
  const [hours, setHours] = useState(schoolInfo.operatingHours);
  const [phoneDirect, setPhoneDirect] = useState(schoolInfo.phoneClinicDirect);
  const [academicYear, setAcademicYear] = useState(schoolInfo.academicYear || '2569');
  const [semester, setSemester] = useState(schoolInfo.semester || 'ภาคเรียนที่ 1');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo({
      nurseInCharge: nurseName,
      nursePosition: nurseRole,
      roomLocation: location,
      operatingHours: hours,
      phoneClinicDirect: phoneDirect,
      academicYear: academicYear.trim() || '2569',
      semester: semester || 'ภาคเรียนที่ 1',
    });
    setIsEditInfoOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Banner with School Name & Operating Status */}
      <div className="bg-gradient-to-r from-[#2A9D8F] via-[#21867a] to-[#1e7b70] text-white text-xs sm:text-sm px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
          <span className="bg-emerald-400/20 text-emerald-100 border border-emerald-300/40 rounded-full px-2 py-0.5 text-[11px] font-semibold">
            เปิดบริการ {schoolInfo.operatingHours}
          </span>
          <span className="hidden sm:inline opacity-90">
            {schoolInfo.motto}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          {/* Academic Year Switcher Button */}
          <button
            onClick={() => {
              setNurseName(schoolInfo.nurseInCharge);
              setNurseRole(schoolInfo.nursePosition);
              setLocation(schoolInfo.roomLocation);
              setHours(schoolInfo.operatingHours);
              setPhoneDirect(schoolInfo.phoneClinicDirect);
              setAcademicYear(schoolInfo.academicYear || '2569');
              setSemester(schoolInfo.semester || 'ภาคเรียนที่ 1');
              setIsEditInfoOpen(true);
            }}
            title="คลิกเพื่อเปลี่ยนปีการศึกษา ภาคเรียน หรือข้อมูลห้องพยาบาล"
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 px-2.5 py-0.5 rounded-full font-bold text-[11px] border border-white/20 transition-all text-white shadow-2xs"
          >
            <span>🎓 ปีการศึกษา {schoolInfo.academicYear || '2569'}</span>
            <span className="opacity-80 font-normal hidden lg:inline">({schoolInfo.semester || 'ภาคเรียนที่ 1'})</span>
            <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-md font-semibold">เปลี่ยนปี</span>
          </button>

          <span className="opacity-90 hidden md:inline">
            📍 {schoolInfo.roomLocation}
          </span>
          <a
            href={`tel:${schoolInfo.phoneClinicDirect}`}
            className="flex items-center gap-1 font-semibold hover:underline bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full transition-colors"
          >
            📞 สายตรง: {schoolInfo.phoneClinicDirect}
          </a>
          <button
            onClick={() => {
              setNurseName(schoolInfo.nurseInCharge);
              setNurseRole(schoolInfo.nursePosition);
              setLocation(schoolInfo.roomLocation);
              setHours(schoolInfo.operatingHours);
              setPhoneDirect(schoolInfo.phoneClinicDirect);
              setAcademicYear(schoolInfo.academicYear || '2569');
              setSemester(schoolInfo.semester || 'ภาคเรียนที่ 1');
              setIsEditInfoOpen(true);
            }}
            title="ปรับแก้ข้อมูลห้องพยาบาล / ผู้ดูแล / ปีการศึกษา"
            className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/90"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-3">
          {/* Logo & School Branding */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-0.5 shadow-md shadow-[#2A9D8F]/20 group-hover:scale-105 transition-transform duration-200 ring-2 ring-[#2A9D8F]/30 shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 rounded-full bg-[#FFB86B] text-[9px] font-bold text-slate-800 items-center justify-center border-2 border-white shadow-2xs">
                +
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[#2A9D8F] bg-[#E8F6F7] px-2 py-0.5 rounded-md border border-[#2A9D8F]/20">
                  {schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2A9D8F] transition-colors leading-tight mt-0.5">
                ห้องพยาบาล โรงเรียนวัดใหม่อมตรส
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                ผู้ดูแล: <span className="font-semibold text-slate-700">{schoolInfo.nurseInCharge}</span> • {schoolInfo.roomLocation}
              </p>
            </div>
          </div>

          {/* Quick Actions & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Firebase Firestore Cloud Indicator */}
            <button
              onClick={handleSyncFirebase}
              disabled={isFirebaseSyncing}
              title="Firebase Firestore: บันทึกข้อมูลบนคลาวด์แบบ Real-time (คลิกเพื่อบันทึกทันที)"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                syncSuccessMsg
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : isFirebaseSyncing
                  ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseSyncing
                    ? 'bg-amber-500 animate-ping'
                    : isFirebaseConnected
                    ? 'bg-emerald-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="font-semibold text-orange-600">Firebase</span>
              <span className="text-slate-500 hidden md:inline">
                {syncSuccessMsg
                  ? '✓ ซิงค์เรียบร้อย'
                  : isFirebaseSyncing
                  ? 'กำลังซิงค์...'
                  : 'คลาวด์พร้อมใช้'}
              </span>
            </button>

            {/* Direct Emergency Shortcut */}
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
                activeTab === 'emergency'
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
              }`}
            >
              <Ambulance className="w-4 h-4 text-rose-600" />
              <span className="hidden xs:inline">แจ้งเหตุฉุกเฉิน</span>
              <span className="xs:hidden">ฉุกเฉิน</span>
            </button>

            {/* Google Sheets / Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 sm:px-2.5 sm:py-1">
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-emerald-700 hover:bg-emerald-100/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                    title="เปิดสเปรดชีต Google Sheets บน Google Drive"
                  >
                    <Sheet className="w-4 h-4 text-emerald-600" />
                    <span className="hidden md:inline">เปิด Sheets</span>
                  </a>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-slate-800 truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    เชื่อมต่อ Google แล้ว
                  </p>
                </div>
                <button
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                disabled={isLoggingIn}
                className="gsi-material-button text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition-all flex items-center gap-2"
                title="เชื่อมต่อ Google Sheets และ Drive เพื่อบันทึกข้อมูล"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg viewBox="0 0 48 48" className="w-full h-full">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                </div>
                <span className="hidden sm:inline">
                  {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google'}
                </span>
                <span className="sm:hidden">Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <span>🏠</span>
            <span>หน้าแรก</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <span>🩺</span>
            <span>บริการห้องพยาบาล</span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'request'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>แจ้งขอรับบริการ</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'records'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <span>👩‍⚕️</span>
            <span>ระบบบันทึกการใช้บริการ</span>
          </button>

          <button
            onClick={() => setActiveTab('parents')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'parents'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>สำหรับผู้ปกครอง</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'knowledge'
                ? 'bg-[#2A9D8F] text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#E8F6F7]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ความรู้สุขภาพ</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'emergency'
                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ระบบเหตุฉุกเฉิน</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden md:block" />

          {/* Admin / Teacher Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span>Dashboard ผู้รับผิดชอบ</span>
          </button>
        </nav>
      </div>

      {/* Edit School / Nurse Info Modal */}
      {isEditInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#2A9D8F]" />
                <h3 className="text-base font-bold text-slate-900">
                  แก้ไขข้อมูลผู้ดูแลและจุดบริการห้องพยาบาล
                </h3>
              </div>
              <button
                onClick={() => setIsEditInfoOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInfo} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อครูผู้ดูแลห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={nurseName}
                  onChange={(e) => setNurseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ตำแหน่ง / บทบาทหน้าที่
                </label>
                <input
                  type="text"
                  value={nurseRole}
                  onChange={(e) => setNurseRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Academic Year & Semester Settings */}
              <div className="bg-[#E8F6F7] p-3.5 rounded-2xl border border-[#2A9D8F]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#1e6f5c] text-xs">
                    🎓 ปีการศึกษา & ภาคเรียน (เปลี่ยนแปลงข้อมูลทุกปี)
                  </label>
                  <span className="text-[11px] font-extrabold text-[#2A9D8F] bg-white px-2 py-0.5 rounded-md border border-[#2A9D8F]/20">
                    ปีการศึกษา {academicYear}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ระบุปีการศึกษา (พ.ศ.)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 2569, 2570"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      ภาคเรียน
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                    >
                      <option value="ภาคเรียนที่ 1">ภาคเรียนที่ 1</option>
                      <option value="ภาคเรียนที่ 2">ภาคเรียนที่ 2</option>
                      <option value="ตลอดปีการศึกษา">ตลอดปีการศึกษา</option>
                    </select>
                  </div>
                </div>

                {/* Quick Year Selectors */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">เลือกด่วน:</span>
                  {['2568', '2569', '2570', '2571', '2572'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setAcademicYear(yr)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                        academicYear === yr
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จุดบริการห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เวลาทำการ
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์สายตรงห้องพยาบาล
                  </label>
                  <input
                    type="text"
                    value={phoneDirect}
                    onChange={(e) => setPhoneDirect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditInfoOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a] flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึก Real Time</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
