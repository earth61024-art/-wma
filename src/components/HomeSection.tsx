import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  MapPin,
  PhoneCall,
  Bell,
  Sparkles,
  ArrowRight,
  Ambulance,
  Stethoscope,
  Bed,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Smile,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { HealthNotice } from '../types';

interface HomeSectionProps {
  onNavigate: (tab: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate }) => {
  const { schoolInfo, updateSchoolInfo, records, notices, addNotice, updateNotice, deleteNotice } = useInfirmary();

  const [selectedNotice, setSelectedNotice] = useState<HealthNotice | null>(null);
  const [editingNotice, setEditingNotice] = useState<HealthNotice | null>(null);
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [isEditSchoolModalOpen, setIsEditSchoolModalOpen] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState({ ...schoolInfo });

  // New notice form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'ข่าวสาร' | 'เตือนภัยสุขภาพ' | 'กิจกรรม' | 'มาตรการ'>('ข่าวสาร');
  const [newSummary, setNewSummary] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // Bed status calculated Real Time from active records
  const restingStudents = records.filter((r) => r.careResult === 'นอนพักสังเกตอาการ');
  const occupiedBeds = restingStudents.length;
  const availableBeds = Math.max(0, schoolInfo.bedsTotal - occupiedBeds);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const notice: HealthNotice = {
      id: `notice-${Date.now()}`,
      title: newTitle.trim(),
      date: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      category: newCategory,
      summary: newSummary.trim() || newTitle.trim(),
      detail: newDetail.trim() || newSummary.trim() || newTitle.trim(),
      priority: newPriority,
    };

    addNotice(notice);
    setIsAddNoticeOpen(false);
    setNewTitle('');
    setNewSummary('');
    setNewDetail('');
  };

  const handleSaveEditNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;
    updateNotice(editingNotice);
    setEditingNotice(null);
  };

  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);

  const handleDeleteNotice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNoticeToDelete(id);
  };

  const confirmDeleteNotice = () => {
    if (noticeToDelete) {
      deleteNotice(noticeToDelete);
      if (selectedNotice?.id === noticeToDelete) {
        setSelectedNotice(null);
      }
      setNoticeToDelete(null);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E8F6F7] via-white to-[#FFF4C2]/50 border border-[#2A9D8F]/15 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#2A9D8F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-[#FFB86B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFF3E4] text-[#1e6f5c] text-xs sm:text-sm font-semibold border border-emerald-200 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>พื้นที่สุขภาพที่ปลอดภัยและเป็นมิตร สำหรับเด็กทุกคน</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              ห้องพยาบาล <br />
              <span className="text-[#2A9D8F] bg-gradient-to-r from-[#2A9D8F] to-[#1e7e72] bg-clip-text text-transparent">
                โรงเรียนวัดใหม่อมตรส
              </span>
            </h1>

            <div className="text-xs sm:text-sm font-semibold text-slate-600 bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200/80 inline-flex items-center gap-2">
              <span className="text-base">🏛️</span>
              <span>{schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}</span>
            </div>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              <span className="text-[#2A9D8F] font-bold">"{schoolInfo.motto}"</span>{' '}
              เราพร้อมดูแลปฐมพยาบาล บรรเทาอาการเจ็บป่วย ประเมินเหตุฉุกเฉิน
              และส่งเสริมสุขอนามัยที่ดีแก่นักเรียนระดับประถมศึกษาด้วยความอบอุ่น
            </p>

            {/* Quick Live Status Widget (Real-Time connected) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>เวลาเปิดให้บริการ</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{schoolInfo.operatingHours}</div>
                <div className="text-[11px] text-emerald-600 font-medium">จันทร์ - ศุกร์</div>
              </div>

              <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <Bed className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>เตียงพักสังเกตอาการ</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  ว่าง {availableBeds} จาก {schoolInfo.bedsTotal} เตียง
                </div>
                <div className="text-[11px] text-[#2A9D8F] font-medium">
                  {occupiedBeds > 0 ? `กำลังนอนพัก ${occupiedBeds} คน` : 'พร้อมให้บริการ'}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <Stethoscope className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>บริการสะสม Real Time</span>
                </div>
                <div className="text-sm font-bold text-slate-800">{records.length} ครั้ง</div>
                <div className="text-[11px] text-indigo-600 font-medium">
                  ปีการศึกษา {schoolInfo.academicYear || '2569'}
                </div>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onNavigate('request')}
                className="px-6 py-3.5 rounded-2xl bg-[#2A9D8F] hover:bg-[#21867a] active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-md shadow-[#2A9D8F]/25 flex items-center gap-2 transition-all"
              >
                <span>📝 แจ้งขอรับบริการ</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('emergency')}
                className="px-5 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all animate-pulse"
              >
                <Ambulance className="w-4 h-4" />
                <span>แจ้งเหตุฉุกเฉิน</span>
              </button>

              <button
                onClick={() => onNavigate('records')}
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <span>ระบบเวชระเบียน</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Card / Updated Nurse Profile */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-100 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-[#2A9D8F] via-[#FFB86B] to-[#2A9D8F]" />

              <div className="bg-gradient-to-b from-[#E8F6F7] to-white rounded-2xl p-5 text-center mb-4 border border-[#2A9D8F]/20 flex flex-col items-center shadow-inner">
                <div className="relative mb-3 group">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-white shadow-lg ring-4 ring-[#2A9D8F]/25 overflow-hidden mx-auto transition-transform duration-300 group-hover:scale-105">
                    <img
                      src="/logo.png"
                      alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส เขตพระนคร"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="absolute bottom-1 right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                    กทม.
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  ยินดีต้อนรับนักเรียนและผู้ปกครอง
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                  เมื่อรู้สึกไม่สบาย หกล้ม มีบาดแผล หรือกังวลใจ แวะมาหาครูพยาบาลได้เสมอ
                </p>
              </div>

              {/* Nurse Card Info (ศุภฤกษ์ คุ้มจุ้ย / ครูแนะแนว/ครูเอิร์ธ) */}
              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#DFF3E4] text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                    <UserCheck className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">ครูผู้ดูแลห้องพยาบาล</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{schoolInfo.nurseInCharge}</div>
                    <div className="text-[11px] text-slate-500">{schoolInfo.nursePosition}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF4C2] text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">จุดบริการห้องพยาบาล</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">{schoolInfo.roomLocation}</div>
                    <div className="text-[11px] text-slate-500">พร้อมอุปกรณ์ปฐมพยาบาลครบครัน</div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base shrink-0">
                    <PhoneCall className="w-5 h-5 text-sky-700" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-400 font-medium">ช่องทางติดต่อด่วน</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      ห้องพยาบาล: {schoolInfo.phoneClinicDirect}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      เบอร์โรงเรียน: {schoolInfo.phoneSchool}
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit School Info Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSchoolFormData({ ...schoolInfo });
                    setIsEditSchoolModalOpen(true);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#E8F6F7] hover:text-[#2A9D8F] text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>แก้ไขข้อมูลห้องพยาบาล / ผู้รับผิดชอบ (Real Time)</span>
                </button>
              </div>

              {/* Kid-friendly guarantee pill */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ห้องสะอาด ปลอดเชื้อ
                </span>
                <span className="flex items-center gap-1 text-[#2A9D8F] font-medium">
                  <Smile className="w-3.5 h-3.5" /> อบอุ่น เป็นกันเอง
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Services Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F]">
              HEALTHCARE SERVICES
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              บริการหลักของห้องพยาบาล
            </h2>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs sm:text-sm font-semibold text-[#2A9D8F] hover:text-[#21867a] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>ดูรายละเอียดและปรับแก้บริการ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('services')}
            className="bg-white hover:bg-[#E8F6F7]/50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8F6F7] text-[#2A9D8F] flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              🩹
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2A9D8F] transition-colors">
              ปฐมพยาบาลเบื้องต้น
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ทำแผล หกล้ม ฟกช้ำ มีดบาด เลือดกำเดาไหล ปลอดภัยด้วยชุดทำแผลฆ่าเชื้อ
            </p>
          </div>

          <div
            onClick={() => onNavigate('services')}
            className="bg-white hover:bg-[#E8F6F7]/50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4C2] text-amber-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              🌡️
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2A9D8F] transition-colors">
              ดูแลอาการเจ็บป่วย
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              วัดไข้ เช็ดตัวลดไข้ ดูแลอาการปวดศีรษะ ปวดท้อง คลื่นไส้ พร้อมเตียงนอนพักผ่อน
            </p>
          </div>

          <div
            onClick={() => onNavigate('services')}
            className="bg-white hover:bg-[#E8F6F7]/50 rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
              🚑
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2A9D8F] transition-colors">
              ประเมินอุบัติเหตุ & ประสานส่งต่อ
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ดามกระดูก ประคบเย็น/ร้อน ประสานผู้ปกครองและนำส่ง รพ.วชิรพยาบาล เมื่อมีเหตุจำเป็น
            </p>
          </div>
        </div>
      </section>

      {/* School Accident Prevention & Hazard Matrix Spotlight */}
      <section className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 rounded-3xl border border-amber-300/50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <span>🦺 ความปลอดภัยในสถานศึกษา</span>
              <span>• ระดับอนุบาล 1-3 และประถม 1-6</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Dashboard อุบัติเหตุที่พบบ่อยในเด็กอนุบาลและประถมศึกษาระหว่างอยู่ในโรงเรียน
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              มักเกิดจากการวิ่งเล่นซุกซน ขาดการระมัดระวัง หรือสภาพแวดล้อมที่ไม่ปลอดภัย: เฝ้าระวัง 7 จุดเสี่ยงสำคัญ (การพลัดตกหกล้ม, สนามเด็กเล่น, กีฬาพละ, ประตูและเฟอร์นิเจอร์, สำลักกลืนสิ่งแปลกปลอม, ไฟฟ้า/ตู้น้ำดื่ม, ประตูรั้ว/เขตก่อสร้าง) พร้อมมาตรการป้องกันเชิงรุก 3 ด้านหลัก (โครงสร้างพื้นฐาน การจัดการ และการให้ความรู้)
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 self-start lg:self-center cursor-pointer"
          >
            <span>เปิดดู Dashboard ความปลอดภัย</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Health News & Announcements Bulletin with Real-Time CRUD */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF4C2] text-amber-700 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ข่าวสารและประกาศด้านสุขภาพโรงเรียน
              </h2>
              <p className="text-xs text-slate-500">
                สามารถเพิ่ม ปรับแก้ไข หรือลบประกาศได้แบบ Real Time ({notices.length} รายการ)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddNoticeOpen(true)}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มประกาศใหม่</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-[#E8F6F7]/60 border border-slate-100 hover:border-[#2A9D8F]/30 transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      notice.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {notice.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                      <Calendar className="w-3 h-3" />
                      {notice.date}
                    </span>
                    {/* Edit button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotice(notice);
                      }}
                      className="p-1 text-slate-400 hover:text-[#2A9D8F] hover:bg-slate-200/60 rounded-md transition-colors"
                      title="แก้ไขประกาศ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteNotice(notice.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="ลบประกาศนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#2A9D8F] transition-colors line-clamp-2">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {notice.summary}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center text-xs font-semibold text-[#2A9D8F] group-hover:underline">
                <span>อ่านรายละเอียดเพิ่มเติม</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F6F7] text-[#2A9D8F]">
                {selectedNotice.category}
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {selectedNotice.title}
            </h3>

            <div className="text-xs text-slate-400 mb-4 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>ประกาศเมื่อ: {selectedNotice.date}</span>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed bg-[#f8fafc] p-4 rounded-2xl border border-slate-100 mb-6">
              {selectedNotice.detail}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setEditingNotice(selectedNotice);
                  setSelectedNotice(null);
                }}
                className="text-xs font-semibold text-[#2A9D8F] hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขข้อความประกาศ</span>
              </button>

              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2A9D8F] text-white font-semibold text-xs sm:text-sm hover:bg-[#21867a] transition-colors"
              >
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Notice Modal */}
      {isAddNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มประกาศข่าวสารห้องพยาบาล
              </h3>
              <button
                onClick={() => setIsAddNoticeOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หัวข้อประกาศ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รณรงค์การล้างมือ 7 ขั้นตอน"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ข่าวสาร">ข่าวสาร</option>
                    <option value="เตือนภัยสุขภาพ">เตือนภัยสุขภาพ</option>
                    <option value="กิจกรรม">กิจกรรม</option>
                    <option value="มาตรการ">มาตรการ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ความสำคัญ
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="normal">ปกติ (สีเขียว)</option>
                    <option value="high">สำคัญ (สีส้ม)</option>
                    <option value="urgent">เร่งด่วน (สีแดง)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ข้อความสรุปสั้นๆ (แสดงหน้าการ์ด)
                </label>
                <input
                  type="text"
                  placeholder="สรุป 1-2 บรรทัด"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดฉบับเต็ม
                </label>
                <textarea
                  rows={3}
                  placeholder="พิมพ์รายละเอียดประกาศ คำแนะนำสำหรับนักเรียนและผู้ปกครอง..."
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกประกาศ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขประกาศข่าวสาร
              </h3>
              <button
                onClick={() => setEditingNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditNotice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หัวข้อประกาศ
                </label>
                <input
                  type="text"
                  required
                  value={editingNotice.title}
                  onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ข้อความสรุป
                </label>
                <input
                  type="text"
                  value={editingNotice.summary}
                  onChange={(e) => setEditingNotice({ ...editingNotice, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดฉบับเต็ม
                </label>
                <textarea
                  rows={4}
                  value={editingNotice.detail}
                  onChange={(e) => setEditingNotice({ ...editingNotice, detail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit School Info Modal (Real Time) */}
      {isEditSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  แก้ไขข้อมูลห้องพยาบาล & ผู้รับผิดชอบ
                </h3>
                <p className="text-xs text-slate-500">
                  ข้อมูลจะอัปเดตแบบ Real Time เชื่อมโยงทุกหน้าของระบบ
                </p>
              </div>
              <button
                onClick={() => setIsEditSchoolModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSchoolInfo(schoolFormData);
                setIsEditSchoolModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อครูผู้ดูแลห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={schoolFormData.nurseInCharge}
                  onChange={(e) =>
                    setSchoolFormData({ ...schoolFormData, nurseInCharge: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="เช่น ศุภฤกษ์ คุ้มจุ้ย (ครูแนะแนว/ครูเอิร์ธ)"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ตำแหน่ง / บทบาท
                </label>
                <input
                  type="text"
                  value={schoolFormData.nursePosition}
                  onChange={(e) =>
                    setSchoolFormData({ ...schoolFormData, nursePosition: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จุดบริการห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={schoolFormData.roomLocation}
                  onChange={(e) =>
                    setSchoolFormData({ ...schoolFormData, roomLocation: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="เช่น อาคาร 2 ชั้น 2 (ใกล้ห้องอนุบาล)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์สำนักงานโรงเรียน
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.phoneSchool}
                    onChange={(e) =>
                      setSchoolFormData({ ...schoolFormData, phoneSchool: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    placeholder="เช่น 02-281-7670"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์สายตรงห้องพยาบาล
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.phoneClinicDirect}
                    onChange={(e) =>
                      setSchoolFormData({
                        ...schoolFormData,
                        phoneClinicDirect: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    เวลาเปิด - ปิด ให้บริการ
                  </label>
                  <input
                    type="text"
                    value={schoolFormData.operatingHours}
                    onChange={(e) =>
                      setSchoolFormData({
                        ...schoolFormData,
                        operatingHours: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จำนวนเตียงพักสังเกตอาการ
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={schoolFormData.bedsTotal}
                    onChange={(e) =>
                      setSchoolFormData({
                        ...schoolFormData,
                        bedsTotal: parseInt(e.target.value) || 6,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หน่วยงานต้นสังกัด / เขตพื้นที่
                </label>
                <input
                  type="text"
                  value={schoolFormData.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}
                  onChange={(e) =>
                    setSchoolFormData({ ...schoolFormData, affiliation: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  placeholder="เช่น สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำขวัญ / สโลแกน
                </label>
                <input
                  type="text"
                  value={schoolFormData.motto}
                  onChange={(e) =>
                    setSchoolFormData({ ...schoolFormData, motto: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditSchoolModalOpen(false)}
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

      {/* Confirmation Modal for Delete Notice */}
      {noticeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">ยืนยันการลบประกาศ</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้? ข้อมูลจะถูกลบออกจากระบบทันที
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNoticeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteNotice}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
