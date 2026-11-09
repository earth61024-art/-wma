import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Ambulance,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { EmergencyContactItem, EmergencyStepItem, EmergencyGuide } from '../types';

export const EmergencySection: React.FC = () => {
  const {
    schoolInfo,
    updateSchoolInfo,
    emergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    emergencySteps,
    addEmergencyStep,
    updateEmergencyStep,
    deleteEmergencyStep,
    emergencyGuides,
    addEmergencyGuide,
    updateEmergencyGuide,
    deleteEmergencyGuide,
    resetEmergencyToDefaults,
  } = useInfirmary();

  // Confirmation Modal State (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'ยืนยัน',
    isDestructive: true,
    onConfirm: () => {},
  });

  // Emergency Header Edit State
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [headerAffiliation, setHeaderAffiliation] = useState(schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.');
  const [headerNurse, setHeaderNurse] = useState(schoolInfo.nurseInCharge);
  const [headerLocation, setHeaderLocation] = useState(schoolInfo.roomLocation);
  const [headerSpeedDial, setHeaderSpeedDial] = useState(schoolInfo.emergencySpeedDial || '1669');

  // Contact modals state
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContactItem | null>(null);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newType, setNewType] = useState('ติดต่อฉุกเฉิน');
  const [newHighlight, setNewHighlight] = useState(false);

  // Flow Step modals state
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<EmergencyStepItem | null>(null);
  const [stepNumber, setStepNumber] = useState<number>(emergencySteps.length + 1);
  const [stepTitle, setStepTitle] = useState('');
  const [stepIcon, setStepIcon] = useState('🚨');
  const [stepDesc, setStepDesc] = useState('');
  const [stepColor, setStepColor] = useState('bg-rose-50 border-rose-200 text-rose-800');

  // Emergency Guide modals state
  const [isAddGuideOpen, setIsAddGuideOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<EmergencyGuide | null>(null);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideTag, setGuideTag] = useState('');
  const [guideActionsText, setGuideActionsText] = useState('');
  const [guideColor, setGuideColor] = useState('border-rose-400 bg-rose-50/50');

  // Success flash message
  const [flashMsg, setFlashMsg] = useState('');
  const showFlash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(''), 3000);
  };

  // Color options for steps
  const stepColorOptions = [
    { label: 'แดง (เร่งด่วนสุด)', value: 'bg-rose-50 border-rose-200 text-rose-800' },
    { label: 'ส้ม / เหลือง (เฝ้าระวัง)', value: 'bg-amber-50 border-amber-200 text-amber-800' },
    { label: 'ฟ้า (ปฐมพยาบาล)', value: 'bg-sky-50 border-sky-200 text-sky-800' },
    { label: 'ม่วง (รายงาน)', value: 'bg-purple-50 border-purple-200 text-purple-800' },
    { label: 'คราม (ติดต่อผู้ปกครอง)', value: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
    { label: 'เขียว (ส่งต่อ)', value: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { label: 'เขียวหัวเป็ด (ติดตามผล)', value: 'bg-teal-50 border-teal-200 text-teal-800' },
  ];

  // Color options for guides
  const guideColorOptions = [
    { label: 'แดงวิกฤติ (CPR / หมดสติ)', value: 'border-rose-400 bg-rose-50/50' },
    { label: 'ส้มเตือนภัย (ทางเดินหายใจ / สำลัก)', value: 'border-amber-400 bg-amber-50/50' },
    { label: 'ม่วงระวัง (ชักเกร็ง / ลมบ้าหมู)', value: 'border-purple-400 bg-purple-50/50' },
    { label: 'ฟ้าอุบัติเหตุ (กระดูกหัก / ข้อหลุด)', value: 'border-sky-400 bg-sky-50/50' },
    { label: 'เขียวปลอดภัย (ภูมิแพ้ / ลมพิษ)', value: 'border-emerald-400 bg-emerald-50/50' },
  ];

  // 1. Handlers for Emergency Flow Steps
  const handleCreateStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepTitle.trim() || !stepDesc.trim()) return;

    const newStepItem: EmergencyStepItem = {
      id: `step-${Date.now()}`,
      step: Number(stepNumber) || emergencySteps.length + 1,
      title: stepTitle.trim(),
      icon: stepIcon.trim() || '🚨',
      desc: stepDesc.trim(),
      color: stepColor,
    };

    addEmergencyStep(newStepItem);
    setIsAddStepOpen(false);
    setStepTitle('');
    setStepDesc('');
    setStepIcon('🚨');
    showFlash('เพิ่มขั้นตอนเผชิญเหตุเรียบร้อยแล้ว');
  };

  const handleSaveEditStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;
    updateEmergencyStep(editingStep);
    setEditingStep(null);
    showFlash('บันทึกการแก้ไขขั้นตอนเผชิญเหตุแล้ว');
  };

  const handleDeleteStep = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบขั้นตอนเผชิญเหตุ',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบขั้นตอน "${title}" ออกจากระบบเผชิญเหตุ? ข้อมูลจะถูกอัปเดตแบบ Real Time ทันที`,
      confirmText: 'ลบขั้นตอน',
      isDestructive: true,
      onConfirm: () => {
        deleteEmergencyStep(id);
        showFlash(`ลบขั้นตอน "${title}" เรียบร้อยแล้ว`);
      },
    });
  };

  // 2. Handlers for Emergency Guides
  const handleCreateGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideTitle.trim()) return;

    const actions = guideActionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newGuide: EmergencyGuide = {
      id: `guide-${Date.now()}`,
      title: guideTitle.trim(),
      tag: guideTag.trim() || 'แนวทางปฏิบัติฉุกเฉิน',
      color: guideColor,
      action: actions.length > 0 ? actions : ['ปฏิบัติตามคำสั่งของครูพยาบาลและแพทย์'],
    };

    addEmergencyGuide(newGuide);
    setIsAddGuideOpen(false);
    setGuideTitle('');
    setGuideTag('');
    setGuideActionsText('');
    showFlash('เพิ่มคู่มือปฏิบัติการปฐมพยาบาลวิกฤติแล้ว');
  };

  const handleSaveEditGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide) return;
    updateEmergencyGuide(editingGuide);
    setEditingGuide(null);
    showFlash('บันทึกการแก้ไขคู่มือปฐมพยาบาลแล้ว');
  };

  const handleDeleteGuide = (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบคู่มือปฐมพยาบาล',
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือ "${title}" ออกจากระบบ? ข้อมูลจะถูกลบและอัปเดต Real Time ทันที`,
      confirmText: 'ลบคู่มือ',
      isDestructive: true,
      onConfirm: () => {
        deleteEmergencyGuide(id);
        showFlash(`ลบคู่มือ "${title}" เรียบร้อยแล้ว`);
      },
    });
  };

  // 3. Handlers for Contacts
  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newNumber.trim()) return;

    const c: EmergencyContactItem = {
      id: `emg-${Date.now()}`,
      name: newName.trim(),
      number: newNumber.trim(),
      type: newType.trim(),
      highlight: newHighlight,
    };

    addEmergencyContact(c);
    setIsAddContactOpen(false);
    setNewName('');
    setNewNumber('');
    showFlash('เพิ่มเบอร์โทรศัพท์ฉุกเฉินแล้ว');
  };

  const handleSaveEditContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    updateEmergencyContact(editingContact);
    setEditingContact(null);
    showFlash('บันทึกการแก้ไขเบอร์โทรศัพท์แล้ว');
  };

  const handleDeleteContact = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบเบอร์โทรศัพท์ฉุกเฉิน',
      message: `คุณต้องการลบเบอร์โทรศัพท์ "${name}" ออกจากระบบฉุกเฉินใช่หรือไม่?`,
      confirmText: 'ลบเบอร์โทร',
      isDestructive: true,
      onConfirm: () => {
        deleteEmergencyContact(id);
        showFlash(`ลบเบอร์โทร "${name}" แล้ว`);
      },
    });
  };

  const handleResetDefaults = () => {
    setConfirmModal({
      isOpen: true,
      title: 'คืนค่ามาตรฐานระบบเผชิญเหตุฉุกเฉิน',
      message: 'คุณต้องการรีเซ็ต "ระบบเผชิญเหตุฉุกเฉิน" กลับเป็นค่ามาตรฐานตั้งต้นของ สพป.กทม. / รร.วัดใหม่อมตรส หรือไม่? (ผัง 7 ขั้นตอน, คู่มือวิกฤติ 6 รายการ และเบอร์กู้ชีพ 6 เบอร์)',
      confirmText: 'ยืนยันคืนค่ามาตรฐาน',
      isDestructive: false,
      onConfirm: () => {
        resetEmergencyToDefaults();
        showFlash('คืนค่ามาตรฐานระบบเผชิญเหตุฉุกเฉินเรียบร้อยแล้ว');
      },
    });
  };

  const handleSaveHeaderInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolInfo({
      affiliation: headerAffiliation.trim(),
      nurseInCharge: headerNurse.trim(),
      roomLocation: headerLocation.trim(),
      emergencySpeedDial: headerSpeedDial.trim(),
    });
    setIsEditHeaderOpen(false);
    showFlash('บันทึกข้อมูลระบบเผชิญเหตุเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Toast Notification */}
      {flashMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-emerald-400">✓</span>
          <span>{flashMsg}</span>
        </div>
      )}

      {/* Alert Banner Header with Official Logo & Controls */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-lg ring-4 ring-white/20 shrink-0 overflow-hidden">
              <img
                src="/logo.png"
                alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold border border-white/30 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>EMERGENCY RESPONSE PROTOCOL</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                ระบบเผชิญเหตุฉุกเฉิน โรงเรียนวัดใหม่อมตรส
              </h1>

              <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                {schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'} • ผู้ดูแล: <strong>{schoolInfo.nurseInCharge}</strong> • จุดบริการ: <strong>{schoolInfo.roomLocation}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={() => {
                setHeaderAffiliation(schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.');
                setHeaderNurse(schoolInfo.nurseInCharge);
                setHeaderLocation(schoolInfo.roomLocation);
                setHeaderSpeedDial(schoolInfo.emergencySpeedDial || '1669');
                setIsEditHeaderOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-xs border border-white/30 transition-all flex items-center gap-1.5 shadow-xs"
              title="แก้ไขข้อมูลระบบเผชิญเหตุและบุคลากร"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>แก้ไขข้อมูลระบบ</span>
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-xs border border-white/30 transition-all flex items-center gap-1.5 shadow-xs"
              title="กู้คืนขั้นตอนและคู่มือฉุกเฉินกลับสู่ค่ามาตรฐานโรงเรียน"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่ามาตรฐาน</span>
            </button>
          </div>
        </div>

        <div className="absolute right-4 bottom-4 text-8xl opacity-15 pointer-events-none hidden lg:block">
          🚑
        </div>
      </div>

      {/* 1. Step-by-Step Emergency Flowchart with Edit & Delete */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                ผังขั้นตอนการเผชิญเหตุฉุกเฉิน ({emergencySteps.length} ขั้นตอน)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                แก้ไข/ลบได้
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              คุณครูและเจ้าหน้าที่สามารถปรับแต่ง เพิ่ม แก้ไข หรือลบขั้นตอนการเผชิญเหตุให้สอดคล้องกับบริบทโรงเรียน
            </p>
          </div>

          <button
            onClick={() => {
              setStepNumber(emergencySteps.length + 1);
              setStepTitle('');
              setStepDesc('');
              setStepIcon('🚨');
              setIsAddStepOpen(true);
            }}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มขั้นตอนเผชิญเหตุ</span>
          </button>
        </div>

        {emergencySteps.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <p>ยังไม่มีขั้นตอนในผังการเผชิญเหตุฉุกเฉิน</p>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              โหลดขั้นตอนมาตรฐาน สพป.กทม.
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {emergencySteps.map((step) => (
              <div
                key={step.id}
                className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between ${
                  step.color || 'bg-slate-50 border-slate-200 text-slate-800'
                } shadow-2xs relative group transition-all hover:shadow-md`}
              >
                {/* Edit & Delete Action Hover Buttons */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-xs">
                  <button
                    onClick={() => setEditingStep({ ...step })}
                    className="p-1 text-slate-600 hover:text-[#2A9D8F] hover:bg-slate-100 rounded transition-colors"
                    title="แก้ไขขั้นตอนนี้"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteStep(step.id, step.title)}
                    className="p-1 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                    title="ลบขั้นตอนนี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <div className="w-7 h-7 rounded-full bg-white/90 font-black text-xs mx-auto mb-2 flex items-center justify-center shadow-xs">
                    {step.step}
                  </div>
                  <div className="text-2xl mb-1">{step.icon}</div>
                  <h3 className="text-xs sm:text-sm font-bold mb-1 line-clamp-1">{step.title}</h3>
                  <p className="text-[11px] leading-snug opacity-90 line-clamp-4">{step.desc}</p>
                </div>

                <div className="pt-2 mt-2 border-t border-black/5 flex justify-center text-[10px] opacity-75">
                  ขั้นตอนที่ {step.step}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Critical First Aid Cheat Sheets with Edit & Delete */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                คู่มือปฏิบัติการปฐมพยาบาลวิกฤติสำหรับคุณครู ({emergencyGuides.length} คู่มือ)
              </h2>
              <p className="text-xs text-slate-500">
                แนวทางรับมือภาวะฉุกเฉินเร่งด่วนในโรงเรียน สามารถปรับเปลี่ยน เพิ่ม หรือลบเนื้อหาได้ทันที
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setGuideTitle('');
              setGuideTag('');
              setGuideActionsText('');
              setIsAddGuideOpen(true);
            }}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มคู่มือปฐมพยาบาลวิกฤติ</span>
          </button>
        </div>

        {emergencyGuides.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 space-y-3">
            <p>ยังไม่มีคู่มือปฐมพยาบาลวิกฤติ</p>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              โหลดคู่มือมาตรฐานโรงเรียน
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyGuides.map((sheet) => (
              <div
                key={sheet.id}
                className={`p-5 sm:p-6 rounded-3xl border ${sheet.color || 'border-slate-200 bg-white'} shadow-xs space-y-3 relative group transition-all hover:shadow-md`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {sheet.title}
                    </h3>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700 whitespace-nowrap">
                      {sheet.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white/90 p-1 rounded-xl shadow-xs border border-slate-200/60 shrink-0">
                    <button
                      onClick={() => setEditingGuide({ ...sheet })}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="แก้ไขคู่มือนี้"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGuide(sheet.id, sheet.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="ลบคู่มือนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                  {sheet.action.map((act, i) => (
                    <p key={i} className="leading-relaxed font-medium">
                      {act}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Speed Dial Emergency Numbers with Add/Edit/Delete */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                เบอร์โทรศัพท์สำคัญฉุกเฉิน (แตะโทรออกได้ทันที)
              </h2>
              <p className="text-xs text-slate-500">
                เบอร์ต่อสายด่วนกู้ชีพ โรงพยาบาลใกล้เคียง และสายตรงห้องพยาบาล
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddContactOpen(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเบอร์ฉุกเฉิน</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {emergencyContacts.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between group relative ${
                item.highlight
                  ? 'bg-rose-50/80 hover:bg-rose-100 border-rose-200 text-rose-950 shadow-xs ring-1 ring-rose-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="space-y-0.5 flex-1 pr-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  {item.type}
                </span>
                <h3 className="text-xs sm:text-sm font-bold group-hover:text-rose-600 transition-colors">
                  {item.name}
                </h3>
                <a
                  href={`tel:${item.number.replace(/-/g, '')}`}
                  className="text-base sm:text-lg font-black tracking-wider text-rose-600 hover:underline block"
                >
                  📞 {item.number}
                </a>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <a
                  href={`tel:${item.number.replace(/-/g, '')}`}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0 shadow-2xs"
                  title="โทรออกทันที"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>

                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingContact(item)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"
                    title="แก้ไขเบอร์นี้"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(item.id, item.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                    title="ลบเบอร์นี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Flow Step */}
      {isAddStepOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มขั้นตอนในผังการเผชิญเหตุฉุกเฉิน
              </h3>
              <button
                onClick={() => setIsAddStepOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStep} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ลำดับขั้นตอน (Step)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stepNumber}
                    onChange={(e) => setStepNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ไอคอนอิโมจิ
                  </label>
                  <input
                    type="text"
                    required
                    value={stepIcon}
                    onChange={(e) => setStepIcon(e.target.value)}
                    placeholder="เช่น 🚨, 👁️, 🩺"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อขั้นตอน
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ประเมินอาการผู้ป่วย หรือ นำส่ง รพ."
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดการปฏิบัติ
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="อธิบายสิ่งที่ต้องปฏิบัติในขั้นตอนนี้ให้ชัดเจน..."
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ธีมสีการ์ด
                </label>
                <select
                  value={stepColor}
                  onChange={(e) => setStepColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {stepColorOptions.map((c, i) => (
                    <option key={i} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStepOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกขั้นตอน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Flow Step */}
      {editingStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขขั้นตอนการเผชิญเหตุ (ลำดับที่ {editingStep.step})
              </h3>
              <button
                onClick={() => setEditingStep(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditStep} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ลำดับขั้นตอน
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingStep.step}
                    onChange={(e) => setEditingStep({ ...editingStep, step: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ไอคอนอิโมจิ
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStep.icon}
                    onChange={(e) => setEditingStep({ ...editingStep, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อขั้นตอน
                </label>
                <input
                  type="text"
                  required
                  value={editingStep.title}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียดการปฏิบัติ
                </label>
                <textarea
                  required
                  rows={3}
                  value={editingStep.desc}
                  onChange={(e) => setEditingStep({ ...editingStep, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ธีมสีการ์ด
                </label>
                <select
                  value={editingStep.color || stepColorOptions[0].value}
                  onChange={(e) => setEditingStep({ ...editingStep, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {stepColorOptions.map((c, i) => (
                    <option key={i} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteStep(editingStep.id, editingStep.title);
                    setEditingStep(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบขั้นตอนนี้</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStep(null)}
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Emergency Guide */}
      {isAddGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มคู่มือปฏิบัติการปฐมพยาบาลวิกฤติ
              </h3>
              <button
                onClick={() => setIsAddGuideOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuide} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อภาวะวิกฤติ / อาการ
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ภาวะช็อกจากความร้อน (Heat Stroke) หรือ เลือดออกรุนแรง"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ป้ายเตือนสำคัญ (Tag)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ห้ามให้ดื่มน้ำ, เช็ดตัวทันที, โทร 1669"
                  value={guideTag}
                  onChange={(e) => setGuideTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ขั้นตอนปฏิบัติการ (พิมพ์ทีละบรรทัด)
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={`1. พานักเรียนเข้าที่ร่ม อากาศถ่ายเท\n2. คลายเสื้อผ้าให้หลวม\n3. ใช้ผ้าชุบน้ำเย็นประคบตามซอกคอ รักแร้\n4. รีบโทรประสาน 1669`}
                  value={guideActionsText}
                  onChange={(e) => setGuideActionsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ธีมสีการ์ด
                </label>
                <select
                  value={guideColor}
                  onChange={(e) => setGuideColor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {guideColorOptions.map((c, i) => (
                    <option key={i} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGuideOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  บันทึกคู่มือ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Emergency Guide */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขคู่มือปฏิบัติการปฐมพยาบาลวิกฤติ
              </h3>
              <button
                onClick={() => setEditingGuide(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGuide} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อภาวะวิกฤติ / อาการ
                </label>
                <input
                  type="text"
                  required
                  value={editingGuide.title}
                  onChange={(e) => setEditingGuide({ ...editingGuide, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ป้ายเตือนสำคัญ (Tag)
                </label>
                <input
                  type="text"
                  required
                  value={editingGuide.tag}
                  onChange={(e) => setEditingGuide({ ...editingGuide, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ขั้นตอนปฏิบัติการ (พิมพ์ทีละบรรทัด)
                </label>
                <textarea
                  required
                  rows={5}
                  value={editingGuide.action.join('\n')}
                  onChange={(e) =>
                    setEditingGuide({
                      ...editingGuide,
                      action: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ธีมสีการ์ด
                </label>
                <select
                  value={editingGuide.color || guideColorOptions[0].value}
                  onChange={(e) => setEditingGuide({ ...editingGuide, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  {guideColorOptions.map((c, i) => (
                    <option key={i} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteGuide(editingGuide.id, editingGuide.title);
                    setEditingGuide(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบคู่มือนี้</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingGuide(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Contact */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มเบอร์โทรศัพท์ฉุกเฉิน
              </h3>
              <button
                onClick={() => setIsAddContactOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อหน่วยงาน / บุคคล
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รพ.ศิริราช หรือ ครูเวรประจำวัน"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 02-xxx-xxxx หรือ 08x-xxx-xxxx"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หมวดหมู่ / คำอธิบาย
                </label>
                <input
                  type="text"
                  placeholder="เช่น โรงพยาบาลใกล้เคียง"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-rose-600"
                />
                <span className="font-semibold text-slate-700">
                  เน้นเป็นเบอร์โทรเร่งด่วน (กล่องสีแดง)
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
                >
                  บันทึกเบอร์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Contact */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขเบอร์โทรศัพท์ฉุกเฉิน
              </h3>
              <button
                onClick={() => setEditingContact(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditContact} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อหน่วยงาน / บุคคล
                </label>
                <input
                  type="text"
                  required
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  required
                  value={editingContact.number}
                  onChange={(e) => setEditingContact({ ...editingContact, number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หมวดหมู่
                </label>
                <input
                  type="text"
                  value={editingContact.type}
                  onChange={(e) => setEditingContact({ ...editingContact, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteContact(editingContact.id, editingContact.name);
                    setEditingContact(null);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบเบอร์นี้</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingContact(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700"
                  >
                    บันทึกการแก้ไข
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Emergency Header & Info */}
      {isEditHeaderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🚨</span>
                  <span>แก้ไขข้อมูลระบบเผชิญเหตุฉุกเฉิน</span>
                </h3>
                <p className="text-xs text-slate-500">
                  โรงเรียนวัดใหม่อมตรส • ซิงค์แบบ Real Time สู่ระบบคลาวด์
                </p>
              </div>
              <button
                onClick={() => setIsEditHeaderOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHeaderInfo} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หน่วยงาน / สังกัด
                </label>
                <input
                  type="text"
                  required
                  value={headerAffiliation}
                  onChange={(e) => setHeaderAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ผู้ดูแล / ครูผู้รับผิดชอบห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={headerNurse}
                  onChange={(e) => setHeaderNurse(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  จุดบริการ / สถานที่ตั้งห้องพยาบาล
                </label>
                <input
                  type="text"
                  required
                  value={headerLocation}
                  onChange={(e) => setHeaderLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สายด่วนกู้ชีพฉุกเฉินหลัก
                </label>
                <input
                  type="text"
                  required
                  value={headerSpeedDial}
                  onChange={(e) => setHeaderSpeedDial(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditHeaderOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-xs"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal (Replaces window.confirm) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.isDestructive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
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
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.confirmText || 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
