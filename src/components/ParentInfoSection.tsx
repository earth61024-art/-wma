import React, { useState } from 'react';
import {
  Users,
  Thermometer,
  ShieldCheck,
  Pill,
  PhoneCall,
  FileCheck,
  AlertCircle,
  Clock,
  Heart,
  Printer,
  CheckCircle2,
  Send,
  Sparkles,
  Trash2,
  Edit2,
  Search,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { GradeLevel, ParentSubmission } from '../types';

export const ParentInfoSection: React.FC = () => {
  const { schoolInfo, students, parentForms, addParentForm, deleteParentForm } = useInfirmary();

  const [activeSubTab, setActiveSubTab] = useState<'guidelines' | 'stopSchool' | 'medication' | 'healthForm' | 'submittedList'>('guidelines');

  // Health form states for parent submission
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('ป.1');
  const [room, setRoom] = useState('1');
  const [bloodType, setBloodType] = useState<'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'>('O');
  const [congenital, setCongenital] = useState('');
  const [allergies, setAllergies] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Quick picker from 55 students
  const handlePickStudent = (stdId: string) => {
    const std = students.find((s) => s.studentId === stdId);
    if (std) {
      setStudentName(std.fullName);
      setStudentId(std.studentId);
      setGrade(std.grade);
      setRoom(std.room);
      if (std.bloodType) setBloodType(std.bloodType as any);
      if (std.congenitalDisease) setCongenital(std.congenitalDisease);
      if (std.allergies) setAllergies(std.allergies);
      if (std.parentPhone) setPhone(std.parentPhone);
    }
  };

  const handleSubmitHealthForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !phone.trim()) return;

    const newForm: ParentSubmission = {
      id: `form-${Date.now()}`,
      studentName: studentName.trim(),
      studentId: studentId.trim() || undefined,
      grade,
      room,
      bloodType,
      congenital: congenital.trim() || 'ไม่มี',
      allergies: allergies.trim() || 'ไม่มี',
      parentName: parentName.trim(),
      phone: phone.trim(),
      emergencyPhone: emergencyPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      submittedAt: new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    addParentForm(newForm);
    setSubmitted(true);
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteSubmission = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDeleteSubmission = () => {
    if (deleteConfirm) {
      deleteParentForm(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-md ring-2 ring-[#2A9D8F]/25 mx-auto overflow-hidden">
          <img
            src="/logo.png"
            alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3.5 py-1 rounded-full inline-block">
          FOR PARENTS & GUARDIANS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          ข้อมูลและคำแนะนำสำหรับผู้ปกครอง
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          ผู้ดูแลห้องพยาบาล: <strong>{schoolInfo.nurseInCharge}</strong> • {schoolInfo.roomLocation}
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setActiveSubTab('guidelines')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'guidelines'
              ? 'bg-[#2A9D8F] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>แนวทางเมื่อลูกมีไข้</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stopSchool')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'stopSchool'
              ? 'bg-[#2A9D8F] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>เมื่อใดควรหยุดเรียน</span>
        </button>

        <button
          onClick={() => setActiveSubTab('medication')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'medication'
              ? 'bg-[#2A9D8F] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>การเตรียมยาประจำตัว</span>
        </button>

        <button
          onClick={() => setActiveSubTab('healthForm')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeSubTab === 'healthForm'
              ? 'bg-[#2A9D8F] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>แบบฟอร์มข้อมูลสุขภาพ</span>
        </button>

        {parentForms.length > 0 && (
          <button
            onClick={() => setActiveSubTab('submittedList')}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'submittedList'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>ประวัติที่แจ้งแล้ว ({parentForms.length})</span>
          </button>
        )}
      </div>

      {/* Sub Tab 1: เมื่อลูกมีไข้ */}
      {activeSubTab === 'guidelines' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4C2] text-amber-700 flex items-center justify-center text-2xl">
              🌡️
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                แนวทางการดูแลเมื่อบุตรหลานมีไข้
              </h2>
              <p className="text-xs text-slate-500">
                คำแนะนำจากครูผู้ดูแลห้องพยาบาล ({schoolInfo.nurseInCharge})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#E8F6F7]/60 border border-[#2A9D8F]/15 space-y-2">
              <span className="text-2xl">💧</span>
              <h3 className="text-sm font-bold text-slate-900">1. การเช็ดตัวลดไข้</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ใช้น้ำอุ่นหรือน้ำอุณหภูมิห้อง (ห้ามใช้น้ำแข็งหรือน้ำเย็นจัด)
                เช็ดย้อนแนวรูขุมขนเข้าหาหัวใจ เน้นบริเวณซอกคอ รักแร้ และขาหนีบ
                เช็ดนาน 15-20 นาที
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF4C2]/50 border border-amber-200 space-y-2">
              <span className="text-2xl">💊</span>
              <h3 className="text-sm font-bold text-slate-900">2. การให้ยาลดไข้</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ใช้ยาพาราเซตามอล ขนาด 10-15 มก./กก./ครั้ง ทุก 4-6 ชั่วโมง
                เฉพาะเวลาที่มีไข้สูงเกิน 38°C <strong>ห้ามใช้ยาแอสไพรินหรือไอบูโพรเฟน</strong>{' '}
                หากยังไม่แน่ชัดว่าไม่ใช่ไข้เลือดออก
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#DFF3E4]/70 border border-emerald-200 space-y-2">
              <span className="text-2xl">🥛</span>
              <h3 className="text-sm font-bold text-slate-900">3. การพักผ่อนและดื่มน้ำ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                กระตุ้นให้เด็กจิบน้ำบ่อยๆ น้ำผลไม้ หรือน้ำซุปอุ่น
                สวมเสื้อผ้าโปร่งสบาย ไม่ห่มผ้าหนาเกินไป และนอนหลับในห้องที่ระบายอากาศดี
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>สัญญาณอันตรายที่ต้องพาไปโรงพยาบาลทันที:</span>
            </div>
            <p className="leading-relaxed">
              เด็กซึมลง ไม่ยอมดื่มน้ำหรือนม หายใจหอบเหนื่อย ชักเกร็ง ไข้สูงลอยเกิน 39°C
              จุดเลือดออกตามผิวหนัง หรืออาเจียนตลอดเวลา
            </p>
          </div>
        </div>
      )}

      {/* Sub Tab 2: เมื่อใดควรหยุดเรียน */}
      {activeSubTab === 'stopSchool' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl">
              🛑
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                เกณฑ์การหยุดเรียนเพื่อรักษาตัวและป้องกันการแพร่ระบาด
              </h2>
              <p className="text-xs text-slate-500">
                เพื่อสุขภาพของบุตรหลานและความปลอดภัยของเพื่อนร่วมห้อง
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                condition: 'มีไข้สูงตั้งแต่ 37.5°C ขึ้นไป',
                rule: 'ควรหยุดพักรักษาตัวที่บ้าน จนกว่าไข้จะลดเป็นปกติอย่างน้อย 24 ชั่วโมง โดยไม่ต้องใช้ยาลดไข้',
                badge: 'ไข้เฉียบพลัน',
              },
              {
                condition: 'โรคติดต่อ: โรคมือเท้าปาก (HFMD)',
                rule: 'หยุดเรียนอย่างน้อย 7-10 วัน หรือจนกว่าแผลในปากและตุ่มน้ำที่ฝ่ามือฝ่าเท้าจะแห้งสนิท',
                badge: 'หยุด 7-10 วัน',
              },
              {
                condition: 'โรคตาแดง (Epidemic Keratoconjunctivitis)',
                rule: 'หยุดเรียนจนกว่าอาการตาแดง ขี้ตา และเคืองตาจะหายเป็นปกติ (ประมาณ 5-7 วัน)',
                badge: 'หยุด 5-7 วัน',
              },
              {
                condition: 'โรคอีสุกอีใส (Chickenpox)',
                rule: 'หยุดเรียนจนกว่าตุ่มน้ำจะแห้งและตกสะเก็ดหมดทุกตุ่ม (ประมาณ 7 วัน)',
                badge: 'หยุดจนตกสะเก็ด',
              },
              {
                condition: 'ท้องเสียรุนแรง หรืออาเจียนบ่อยครั้ง',
                rule: 'หยุดเรียนเพื่อให้นักเรียนได้พักผ่อนและป้องกันการขาดน้ำ จนกว่าจะขับถ่ายปกติ 24 ชั่วโมง',
                badge: 'สังเกตอาการ 24 ชม.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{item.condition}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.rule}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#E8F6F7] border border-[#2A9D8F]/20 text-xs text-[#1e6f5c] flex items-center justify-between">
            <span>เมื่อหายป่วยแล้ว กรุณาแจ้งครูประจำชั้นหรือติดต่อห้องพยาบาล ชั้น 2</span>
            <span className="font-bold">โทรแจ้งโรงเรียน: {schoolInfo.phoneSchool}</span>
          </div>
        </div>
      )}

      {/* Sub Tab 3: การเตรียมยาประจำตัว */}
      {activeSubTab === 'medication' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl">
              💊
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                แนวทางการฝากยาประจำตัวให้นักเรียนรับประทานที่โรงเรียน
              </h2>
              <p className="text-xs text-slate-500">
                ส่งมอบยา ณ ห้องพยาบาล อาคาร 2 ชั้น 2 หรือผ่านครูประจำชั้น
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>สิ่งที่ผู้ปกครองต้องเตรียม</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>ยาต้องอยู่ในซองหรือขวดบรรจุเดิมที่มีฉลากยาจากแพทย์หรือเภสัชกรชัดเจน</li>
                <li>ระบุชื่อ - นามสกุล และระดับชั้นของนักเรียนอย่างชัดเจนบนซองยา</li>
                <li>ระบุขนาดยา เวลา และข้อควรระวัง (เช่น ก่อน/หลังอาหาร)</li>
                <li>เตรียมจำนวนยาให้พอดีสำหรับรับประทานที่โรงเรียนในแต่ละวัน</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>ขั้นตอนการส่งมอบยา</span>
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>นำยาส่งมอบให้ครูศุภฤกษ์ หรือครูประจำชั้นโดยตรงในช่วงเช้า</li>
                <li>ไม่ใส่ยาไว้ในกระเป๋านักเรียนโดยไม่มีผู้ใหญ่รับทราบ</li>
                <li>หากเป็นยาที่ต้องแช่เย็น ให้แจ้งครูเพื่อนำแช่ตู้เย็นห้องพยาบาล ชั้น 2</li>
                <li>นักเรียนจะมารับประทานยาที่ห้องพยาบาลตามเวลาที่กำหนด</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: แบบฟอร์มข้อมูลสุขภาพนักเรียน */}
      {activeSubTab === 'healthForm' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#DFF3E4] text-emerald-700 flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  แบบฟอร์มแจ้งข้อมูลสุขภาพและประวัติการแพ้
                </h2>
                <p className="text-xs text-slate-500">
                  บันทึกตรงถึงครูผู้ดูแลห้องพยาบาล ({schoolInfo.nurseInCharge})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์แบบฟอร์ม</span>
            </button>
          </div>

          {/* Quick Picker from official roster */}
          <div className="p-3.5 bg-[#E8F6F7]/60 rounded-2xl border border-[#2A9D8F]/20 space-y-1">
            <label className="block text-[11px] font-bold text-[#1e6f5c]">
              🔍 ดึงข้อมูลจากบัญชีรายชื่อนักเรียน รร.วัดใหม่อมตรส (ปีการศึกษา {schoolInfo.academicYear || '2569'})
            </label>
            <select
              onChange={(e) => handlePickStudent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
            >
              <option value="">-- เลือกชื่อนักเรียนเพื่อกรอกข้อมูลอัตโนมัติ --</option>
              {students.map((s) => (
                <option key={s.id} value={s.studentId}>
                  {s.grade}/{s.room} : {s.fullName} [รหัส {s.studentId}]
                </option>
              ))}
            </select>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                บันทึกข้อมูลสุขภาพของ {studentName} เรียบร้อยแล้ว (Real Time)
              </h3>
              <p className="text-xs text-slate-600">
                ระบบได้เชื่อมข้อมูลเข้าแฟ้มเวชระเบียนและโปรไฟล์นักเรียนแล้วครับ
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveSubTab('submittedList')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  ดูรายการที่แจ้งแล้ว
                </button>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setStudentName('');
                    setCongenital('');
                    setAllergies('');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#2A9D8F] text-white text-xs font-semibold"
                >
                  กรอกให้นักเรียนคนอื่นเพิ่ม
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitHealthForm} className="space-y-5 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ด.ช.ณัฏฐกานต์ มณีเมือง"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
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

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-12">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-slate-700">
                      หมู่โลหิตนักเรียน
                    </label>
                    <span className="text-xs font-bold text-rose-600">
                      {bloodType && bloodType !== 'ไม่ระบุ' ? `หมู่ ${bloodType}` : 'ยังไม่ระบุ'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(['O', 'A', 'B', 'AB'] as const).map((bt) => (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => setBloodType(bt)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          bloodType === bt
                            ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-xs scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        หมู่เลือด {bt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setBloodType('ไม่ระบุ')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        bloodType === 'ไม่ระบุ'
                          ? 'bg-slate-700 text-white border-slate-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      ✕ ลบหมู่เลือด (ไม่ระบุ / ยังไม่เคยตรวจ)
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-8">
                  <label className="block font-semibold text-slate-700 mb-1">
                    โรคประจำตัว (ถ้ามี เช่น หอบหืด, ภูมิแพ้, G6PD)
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อโรค หรือ พิมพ์ 'ไม่มี'"
                    value={congenital}
                    onChange={(e) => setCongenital(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ประวัติการแพ้ยา / แพ้อาหาร (สำคัญมาก)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น แพ้ยาเพนิซิลิน, แพ้อาหารทะเล, แพ้ถั่วลิสง"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล ผู้ปกครอง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อบิดา/มารดา หรือผู้ปกครอง"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อหลัก <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="เช่น 081-234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ข้อควรระวังหรือคำแนะนำพิเศษเพิ่มเติม
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น ระวังอย่าให้เล่นแรง, มักปวดท้องบ่อย"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>บันทึกข้อมูลสุขภาพเข้าสู่ระบบ</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sub Tab 5: รายการที่ผู้ปกครองแจ้งไว้แล้ว (Real Time Delete/View) */}
      {activeSubTab === 'submittedList' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                รายการข้อมูลสุขภาพที่ผู้ปกครองแจ้งไว้
              </h3>
              <p className="text-xs text-slate-500">
                สามารถตรวจสอบและลบข้อมูลได้แบบ Real Time ({parentForms.length} รายการ)
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('healthForm')}
              className="px-3.5 py-1.5 rounded-xl bg-[#2A9D8F] text-white text-xs font-semibold"
            >
              + แจ้งข้อมูลใหม่
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {parentForms.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.studentName}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#E8F6F7] text-[#2A9D8F]">
                      ชั้น {item.grade}/{item.room}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      แจ้งเมื่อ: {item.submittedAt}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 space-x-3">
                    <span>หมู่เลือด: <strong>{item.bloodType}</strong></span>
                    <span>โรคประจำตัว: <strong>{item.congenital}</strong></span>
                    <span>ประวัติแพ้: <strong className="text-rose-600">{item.allergies}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ผู้ปกครอง: {item.parentName} (โทร {item.phone})
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSubmission(item.id, item.studentName)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors self-end sm:self-center"
                  title="ลบรายการนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Submission */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">ยืนยันการลบข้อมูลสุขภาพ</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              ลบข้อมูลสุขภาพของ &ldquo;<strong>{deleteConfirm.name}</strong>&rdquo; ใช่หรือไม่?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSubmission}
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
