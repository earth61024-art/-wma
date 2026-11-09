import React, { useState } from 'react';
import {
  FileCheck2,
  AlertCircle,
  Thermometer,
  Smile,
  CheckCircle,
  ArrowRight,
  Send,
  User,
  Clock,
  Sparkles,
  RotateCcw,
  Search,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { GradeLevel, SymptomType, ServiceAction, VisitRecord, StudentProfile } from '../types';

interface RequestServiceFormProps {
  onNavigate: (tab: string) => void;
}

const COMMON_SYMPTOMS: SymptomType[] = [
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
  'ฟันผุ / ปวดฟัน',
  'อื่น ๆ',
];

const DESIRED_ACTIONS: { id: ServiceAction; label: string; desc: string }[] = [
  { id: 'ปฐมพยาบาล', label: 'ปฐมพยาบาล', desc: 'ทำแผล ห้ามเลือด ประคบเย็น/ร้อน' },
  { id: 'นอนพักผ่อน', label: 'พักสังเกตอาการ', desc: 'ขอนอนพักบนเตียงพยาบาล ชั้น 2' },
  { id: 'เช็ดตัวลดไข้', label: 'เช็ดตัว / ขอยาลดไข้', desc: 'มีไข้ ตัวร้อน ต้องการเช็ดตัวหรือยาสามัญ' },
  { id: 'ให้ยาสามัญประจำบ้าน', label: 'ขอรับยาสามัญ', desc: 'ยาแก้ปวดท้อง ขับลม เกลือแร่ คาลาไมน์' },
  { id: 'ประสานผู้ปกครอง', label: 'แจ้งผู้ปกครอง', desc: 'ต้องการให้ครูโทรแจ้งคุณพ่อคุณแม่' },
  { id: 'ส่งต่อแพทย์', label: 'ส่งต่อสถานพยาบาล', desc: 'อาการรุนแรง ต้องการไปพบแพทย์' },
];

export const RequestServiceForm: React.FC<RequestServiceFormProps> = ({ onNavigate }) => {
  const { schoolInfo, students, addRecord, updateStudentBloodType } = useInfirmary();

  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('ป.1');
  const [room, setRoom] = useState('1');
  const [gender, setGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [studentBloodType, setStudentBloodType] = useState<'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'>('ไม่ระบุ');
  const [bloodTypeMessage, setBloodTypeMessage] = useState('');
  const [date, setDate] = useState(currentDateStr);
  const [time, setTime] = useState(currentTimeStr);
  const [broughtBy, setBroughtBy] = useState<
    'เดินมาเอง' | 'เพื่อนพามา' | 'ครูประจำชั้นพามา' | 'ครูเวรพามา' | 'เจ้าหน้าที่พามา'
  >('เดินมาเอง');
  const [companionName, setCompanionName] = useState('');

  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [symptomDetail, setSymptomDetail] = useState('');
  const [temperature, setTemperature] = useState<string>('');
  const [painLevel, setPainLevel] = useState<number>(2);

  const [selectedActions, setSelectedActions] = useState<ServiceAction[]>(['ปฐมพยาบาล']);
  const [notifyParent, setNotifyParent] = useState(false);
  const [parentPhone, setParentPhone] = useState('');

  const [submittedRecord, setSubmittedRecord] = useState<VisitRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Autocomplete / Search for students in official roster
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const matchingStudents = students.filter(
    (s) =>
      studentName.trim() &&
      (s.fullName.toLowerCase().includes(studentName.toLowerCase()) ||
        s.studentId.includes(studentName.trim()))
  );

  const handleSelectStudent = (std: StudentProfile) => {
    setStudentName(std.fullName);
    setStudentId(std.studentId);
    setGrade(std.grade);
    setRoom(std.room);
    setGender(std.gender);
    setStudentBloodType(std.bloodType || 'ไม่ระบุ');
    if (std.parentPhone) {
      setParentPhone(std.parentPhone);
    }
    setIsDropdownOpen(false);
  };

  const handleUpdateBloodType = (bt: 'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ') => {
    setStudentBloodType(bt);
    if (studentId.trim()) {
      updateStudentBloodType(studentId.trim(), bt);
      setBloodTypeMessage(bt === 'ไม่ระบุ' ? 'ลบข้อมูลหมู่เลือดเรียบร้อย (Real Time)' : `บันทึกหมู่เลือด ${bt} เรียบร้อย (Real Time)`);
      setTimeout(() => setBloodTypeMessage(''), 3000);
    }
  };

  const toggleSymptom = (symptom: SymptomType) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const toggleAction = (action: ServiceAction) => {
    if (selectedActions.includes(action)) {
      setSelectedActions(selectedActions.filter((a) => a !== action));
    } else {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMsg('กรุณากรอกหรือเลือกชื่อ-นามสกุลนักเรียน');
      return;
    }
    if (selectedSymptoms.length === 0) {
      setErrorMsg('กรุณาเลือกอาการเบื้องต้นอย่างน้อย 1 อาการ');
      return;
    }

    setErrorMsg('');

    const newRecord: VisitRecord = {
      id: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date,
      time,
      studentId: studentId.trim() || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: studentName.trim(),
      grade,
      room,
      gender,
      bloodType: studentBloodType,
      broughtBy,
      companionName: companionName.trim() || undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      painLevel,
      symptoms: selectedSymptoms,
      symptomDetail: symptomDetail.trim() || 'แจ้งขอรับบริการผ่านระบบห้องพยาบาล',
      actionsTaken: selectedActions.length > 0 ? selectedActions : ['ปฐมพยาบาล'],
      treatmentDetail: selectedActions.includes('นอนพักผ่อน')
        ? 'รับตัวเข้าห้องพยาบาล ชั้น 2 จัดให้นอนพักผ่อนและสังเกตอาการ'
        : 'รับตัวเข้าห้องพยาบาล ชั้น 2 ดำเนินการปฐมพยาบาลเบื้องต้นตามอาการ',
      careResult: selectedActions.includes('นอนพักผ่อน')
        ? 'นอนพักสังเกตอาการ'
        : 'ดีขึ้น กลับเข้าห้องเรียน',
      parentNotified: notifyParent,
      parentPhone: parentPhone.trim() || undefined,
      followUpNeeded: painLevel >= 3 || selectedSymptoms.includes('มีไข้'),
      followUpNotes: painLevel >= 3 ? 'ระดับความปวดปานกลางถึงมาก นัดตรวจซ้ำ' : undefined,
      recordedBy: schoolInfo.nurseInCharge,
    };

    addRecord(newRecord);
    setSubmittedRecord(newRecord);
  };

  const handleReset = () => {
    setSubmittedRecord(null);
    setStudentName('');
    setStudentId('');
    setSelectedSymptoms([]);
    setSymptomDetail('');
    setTemperature('');
    setPainLevel(2);
    setNotifyParent(false);
  };

  const painLabels = [
    { level: 0, label: 'ไม่เจ็บเลย', emoji: '😄', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { level: 1, label: 'เจ็บนิดหน่อย', emoji: '🙂', color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { level: 2, label: 'เจ็บพอทนได้', emoji: '😐', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { level: 3, label: 'เจ็บปานกลาง', emoji: '🙁', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { level: 4, label: 'เจ็บมาก', emoji: '😣', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { level: 5, label: 'เจ็บมากที่สุด', emoji: '😭', color: 'text-red-700 bg-red-100 border-red-300' },
  ];

  if (submittedRecord) {
    return (
      <div className="max-w-2xl mx-auto pb-12 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ส่งคำขอรับบริการสำเร็จ
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              บันทึกข้อมูลเข้าระบบห้องพยาบาลแล้ว (Real Time)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ผู้ดูแลห้องพยาบาล: <strong>{schoolInfo.nurseInCharge}</strong> ณ {schoolInfo.roomLocation}
            </p>
          </div>

          {/* Ticket / Confirmation Card */}
          <div className="bg-[#E8F6F7]/60 rounded-2xl p-5 border border-[#2A9D8F]/20 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#2A9D8F]/15">
              <div>
                <span className="text-[11px] text-slate-400">รหัสการรับบริการ</span>
                <p className="text-sm font-bold text-[#2A9D8F]">
                  #{submittedRecord.id.replace('rec-', '')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400">วันเวลาที่แจ้ง</span>
                <p className="text-xs font-semibold text-slate-700">
                  {submittedRecord.date} {submittedRecord.time} น.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">ชื่อนักเรียน:</span>
                <p className="font-bold text-slate-800">{submittedRecord.studentName}</p>
                <span className="text-[10px] text-slate-400">รหัส {submittedRecord.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400">ระดับชั้น:</span>
                <p className="font-bold text-slate-800">
                  {submittedRecord.grade}/{submittedRecord.room}
                </p>
              </div>
              <div>
                <span className="text-slate-400">หมู่เลือด:</span>
                <p className="font-bold text-rose-600">
                  {submittedRecord.bloodType || 'ไม่ระบุ'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">อาการเบื้องต้น:</span>
                <p className="font-semibold text-slate-800">
                  {submittedRecord.symptoms.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-slate-400">การดำเนินการ:</span>
                <p className="font-semibold text-slate-800">
                  {submittedRecord.actionsTaken.join(', ')}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A9D8F]/15 text-xs text-slate-600 flex items-center justify-between">
              <span>สถานะ: <strong className="text-amber-600">{submittedRecord.careResult}</strong></span>
              <span>จุดบริการ: {schoolInfo.roomLocation}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('records')}
              className="px-6 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
            >
              <span>ดูในระบบบันทึกเวชระเบียน</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              ดูสถิติใน Dashboard
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>แจ้งขอรับบริการเพิ่ม</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-md ring-2 ring-[#2A9D8F]/25 mx-auto overflow-hidden">
          <img
            src="/logo.png"
            alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3.5 py-1 rounded-full inline-block">
          SERVICE REQUEST FORM
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          แบบฟอร์มแจ้งขอใช้บริการห้องพยาบาล
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          เชื่อมโยงรายชื่อนักเรียนโรงเรียนวัดใหม่อมตรส ปีการศึกษา {schoolInfo.academicYear || '2569'} บันทึกและคำนวณ Real Time
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8 text-left"
      >
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: ข้อมูลนักเรียน */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#E8F6F7] text-[#2A9D8F] flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-base font-bold text-slate-800">
              ข้อมูลนักเรียนผู้ขอรับบริการ
            </h2>
            <span className="text-[11px] text-slate-400 font-normal ml-auto">
              พิมพ์ชื่อหรือเลขประจำตัวเพื่อค้นหาอัตโนมัติ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8 relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="พิมพ์ชื่อหรือเลขประจำตัว (มีข้อมูล 55 คน)"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 text-sm transition-all"
                />
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>

              {/* Autocomplete suggestions from official roster */}
              {isDropdownOpen && matchingStudents.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {matchingStudents.slice(0, 6).map((std) => (
                    <div
                      key={std.id}
                      onClick={() => handleSelectStudent(std)}
                      className="p-3 hover:bg-[#E8F6F7] cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{std.fullName}</div>
                        <div className="text-[10px] text-slate-400">
                          รหัส: {std.studentId} • วันเกิด: {std.birthDate || '-'}
                        </div>
                      </div>
                      <span className="font-bold text-[#2A9D8F] bg-[#E8F6F7] px-2 py-0.5 rounded-md">
                        {std.grade}/{std.room}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขประจำตัวนักเรียน
              </label>
              <input
                type="text"
                placeholder="เช่น 6169"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชั้นเรียน <span className="text-rose-500">*</span>
              </label>
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
                  <option value="ป.1">ประถมศึกษาปีที่ 1 (ป.1)</option>
                  <option value="ป.2">ประถมศึกษาปีที่ 2 (ป.2)</option>
                  <option value="ป.3">ประถมศึกษาปีที่ 3 (ป.3)</option>
                  <option value="ป.4">ประถมศึกษาปีที่ 4 (ป.4)</option>
                  <option value="ป.5">ประถมศึกษาปีที่ 5 (ป.5)</option>
                  <option value="ป.6">ประถมศึกษาปีที่ 6 (ป.6)</option>
                </optgroup>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ห้อง
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="1">ห้อง 1</option>
                <option value="2">ห้อง 2</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เพศ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('ชาย')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    gender === 'ชาย'
                      ? 'bg-sky-50 border-sky-400 text-sky-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  👦 ชาย
                </button>
                <button
                  type="button"
                  onClick={() => setGender('หญิง')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    gender === 'หญิง'
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  👧 หญิง
                </button>
              </div>
            </div>

            {/* Blood Type Real-Time Edit & Delete */}
            <div className="sm:col-span-12 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      🩸 ข้อมูลหมู่เลือด:
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-md border ${
                        studentBloodType === 'ไม่ระบุ' || !studentBloodType
                          ? 'bg-slate-100 text-slate-500 border-slate-300'
                          : studentBloodType === 'A'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : studentBloodType === 'B'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : studentBloodType === 'AB'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      หมู่ {studentBloodType || 'ไม่ระบุ'}
                    </span>
                    {bloodTypeMessage && (
                      <span className="text-[11px] font-semibold text-emerald-600 animate-pulse">
                        ✓ {bloodTypeMessage}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    คุณครูสามารถปรับแก้ไขหรือกดลบหมู่เลือดได้ Real Time ข้อมูลจะซิงค์ไปยังบัญชีนักเรียนทันที
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => handleUpdateBloodType(bt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        studentBloodType === bt
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F] shadow-2xs scale-105'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      หมู่ {bt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleUpdateBloodType('ไม่ระบุ')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      studentBloodType === 'ไม่ระบุ' || !studentBloodType
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="ลบข้อมูลหมู่เลือด (ตั้งเป็นไม่ระบุ)"
                  >
                    ✕ ลบหมู่เลือด (ไม่ระบุ)
                  </button>
                </div>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันที่
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลา
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผู้พามาห้องพยาบาล
              </label>
              <select
                value={broughtBy}
                onChange={(e) => setBroughtBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="เดินมาเอง">เดินมาเอง</option>
                <option value="เพื่อนพามา">เพื่อนพามา</option>
                <option value="ครูประจำชั้นพามา">ครูประจำชั้นพามา</option>
                <option value="ครูเวรพามา">ครูเวรประจำวันพามา</option>
                <option value="เจ้าหน้าที่พามา">เจ้าหน้าที่โรงเรียนพามา</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อผู้พามา (กรณีเพื่อนหรือครู)
              </label>
              <input
                type="text"
                placeholder="เช่น ด.ช.โรฮาน / ครูประจำชั้น"
                value={companionName}
                onChange={(e) => setCompanionName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: อาการเบื้องต้น & Pain Scale */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#FFF4C2] text-amber-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h2 className="text-base font-bold text-slate-800">
              อาการเบื้องต้น <span className="text-rose-500">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {COMMON_SYMPTOMS.map((symptom) => {
              const isChecked = selectedSymptoms.includes(symptom);
              return (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition-all flex items-center justify-between gap-1.5 ${
                    isChecked
                      ? 'bg-[#E8F6F7] border-[#2A9D8F] text-[#1e6f5c] shadow-2xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <span>{symptom}</span>
                  {isChecked && <CheckCircle className="w-4 h-4 text-[#2A9D8F] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Kid-friendly Pain Scale */}
          <div className="p-4 rounded-2xl bg-[#E8F6F7]/50 border border-[#2A9D8F]/15 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>ระดับความเจ็บ / ปวด (Wong-Baker Pain Scale สำหรับเด็ก)</span>
              </label>
              <span className="text-xs font-extrabold text-[#2A9D8F]">
                ระดับ {painLevel} / 5
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {painLabels.map((item) => (
                <button
                  type="button"
                  key={item.level}
                  onClick={() => setPainLevel(item.level)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    painLevel === item.level
                      ? `${item.color} shadow-xs font-bold ring-2 ring-current`
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-[10px] sm:text-xs">{item.level}</span>
                  <span className="text-[9px] line-clamp-1 hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อุณหภูมิร่างกาย (°C)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  placeholder="เช่น 37.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">°C</span>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดเพิ่มเติมของอาการหรือจุดเกิดเหตุ
              </label>
              <input
                type="text"
                placeholder="เช่น หกล้ม มีแผลถลอกที่หัวเข่า"
                value={symptomDetail}
                onChange={(e) => setSymptomDetail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: การดำเนินการที่ต้องการ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h2 className="text-base font-bold text-slate-800">
              การดำเนินการที่ประสงค์ / ร้องขอ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DESIRED_ACTIONS.map((item) => {
              const isChecked = selectedActions.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleAction(item.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'bg-[#E8F6F7] border-[#2A9D8F] shadow-2xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded-sm border-slate-300 text-[#2A9D8F]"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Parent Notification Check */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyParent}
                onChange={(e) => setNotifyParent(e.target.checked)}
                className="h-4 w-4 rounded-sm text-[#2A9D8F]"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                ต้องการให้ครูผู้ดูแลห้องพยาบาล ({schoolInfo.nurseInCharge}) โทรแจ้งผู้ปกครองทันที
              </span>
            </label>

            {notifyParent && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เบอร์โทรศัพท์ผู้ปกครอง (สำหรับติดต่อด่วน)
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            * ข้อมูลจะถูกบันทึกส่งเข้าเวชระเบียนและคำนวณสถิติห้องพยาบาลทันที
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors"
            >
              ล้างแบบฟอร์ม
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#2A9D8F]/25 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>ส่งข้อมูลแจ้งขอรับบริการ</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
