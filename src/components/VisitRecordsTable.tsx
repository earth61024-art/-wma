import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Printer,
  Sheet,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  HeartPulse,
  Edit3,
  ExternalLink,
  ChevronDown,
  Bed,
  Check,
  Calendar,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { VisitRecord, CareResult, GradeLevel, SymptomType, ServiceAction, StudentProfile } from '../types';

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

interface VisitRecordsTableProps {
  onOpenSyncModal: () => void;
  onPrintSlip: (record: VisitRecord) => void;
  spreadsheetUrl: string | null;
  isLoggedInGoogle: boolean;
}

export const VisitRecordsTable: React.FC<VisitRecordsTableProps> = ({
  onOpenSyncModal,
  onPrintSlip,
  spreadsheetUrl,
  isLoggedInGoogle,
}) => {
  const { records, students, schoolInfo, addRecord, updateRecord, deleteRecord, updateStudentBloodType } = useInfirmary();

  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [editingRecord, setEditingRecord] = useState<VisitRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record State for manual entry
  const now = new Date();
  const [newDate, setNewDate] = useState(now.toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  );
  const [newAcademicYear, setNewAcademicYear] = useState(schoolInfo.academicYear || '2569');
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('ป.1');
  const [newRoom, setNewRoom] = useState('1');
  const [newGender, setNewGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [newBloodType, setNewBloodType] = useState<'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'>('ไม่ระบุ');
  const [newTemp, setNewTemp] = useState('');
  const [newSymptoms, setNewSymptoms] = useState<string>('บาดแผล / เลือดออก');
  const [newDetail, setNewDetail] = useState('');
  const [newTreatment, setNewTreatment] = useState('ทำแผล ล้างน้ำเกลือ ทายาเบตาดีน');
  const [newMed, setNewMed] = useState('');
  const [newResult, setNewResult] = useState<CareResult>('ดีขึ้น กลับเข้าห้องเรียน');
  const [newParentNotified, setNewParentNotified] = useState(false);
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newReferred, setNewReferred] = useState('');
  const [newFollowUp, setNewFollowUp] = useState(false);
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('');

  // Quick student select in Add Modal
  const availableAcademicYears = Array.from(
    new Set([
      schoolInfo.academicYear || '2569',
      ...students.map((s) => s.academicYear).filter(Boolean),
      ...records.map((r) => r.academicYear).filter(Boolean),
      '2568',
      '2569',
      '2570',
      '2571',
      '2572',
    ] as string[])
  ).sort((a, b) => b.localeCompare(a));

  const handlePickStudent = (stdId: string) => {
    const std = students.find((s) => s.studentId === stdId);
    if (std) {
      setNewName(std.fullName);
      setNewId(std.studentId);
      setNewGrade(std.grade);
      setNewRoom(std.room);
      setNewGender(std.gender);
      setNewBloodType(std.bloodType || 'ไม่ระบุ');
      if (std.parentPhone) setNewParentPhone(std.parentPhone);
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const sTerm = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !sTerm ||
      (r.studentName || '').toLowerCase().includes(sTerm) ||
      (r.studentId || '').toLowerCase().includes(sTerm) ||
      (r.grade || '').toLowerCase().includes(sTerm) ||
      (r.room || '').toLowerCase().includes(sTerm) ||
      `${r.grade}/${r.room}`.toLowerCase().includes(sTerm) ||
      (r.gender || '').toLowerCase().includes(sTerm) ||
      (r.bloodType || '').toLowerCase().includes(sTerm) ||
      (r.broughtBy || '').toLowerCase().includes(sTerm) ||
      (r.companionName || '').toLowerCase().includes(sTerm) ||
      (r.symptomDetail || '').toLowerCase().includes(sTerm) ||
      (r.treatmentDetail || '').toLowerCase().includes(sTerm) ||
      (r.medicationGiven || '').toLowerCase().includes(sTerm) ||
      (r.careResult || '').toLowerCase().includes(sTerm) ||
      (r.followUpNotes || '').toLowerCase().includes(sTerm) ||
      (r.recordedBy || '').toLowerCase().includes(sTerm) ||
      (r.parentContactName || '').toLowerCase().includes(sTerm) ||
      (r.parentPhone || '').toLowerCase().includes(sTerm) ||
      (r.id || '').toLowerCase().includes(sTerm) ||
      (r.date || '').toLowerCase().includes(sTerm) ||
      (r.academicYear || '').toLowerCase().includes(sTerm) ||
      (Array.isArray(r.symptoms) && r.symptoms.some((s) => (s || '').toLowerCase().includes(sTerm))) ||
      (Array.isArray(r.actionsTaken) && r.actionsTaken.some((a) => (a || '').toLowerCase().includes(sTerm)));

    const matchesGrade = gradeFilter === 'all' || r.grade === gradeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'resting' && r.careResult === 'นอนพักสังเกตอาการ') ||
      (statusFilter === 'returned' && r.careResult === 'ดีขึ้น กลับเข้าห้องเรียน') ||
      (statusFilter === 'referred' && r.careResult === 'ส่งต่อสถานพยาบาล / รพ.') ||
      (statusFilter === 'followup' && r.followUpNeeded) ||
      (statusFilter === 'parent' && r.parentNotified);

    const matchesDate = !dateFilter || r.date === dateFilter;

    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const parts = r.date ? r.date.split('-') : [];
      matchesMonth = parts[1] === monthFilter;
    }

    let matchesYear = true;
    if (yearFilter !== 'all') {
      if (r.academicYear && r.academicYear === yearFilter) {
        matchesYear = true;
      } else {
        const yearNum = parseInt(yearFilter, 10);
        const ceYear = yearNum > 2400 ? yearNum - 543 : yearNum;
        const rYear = r.date ? parseInt(r.date.split('-')[0], 10) : 0;
        matchesYear = rYear === ceYear || rYear === yearNum;
      }
    }

    return matchesSearch && matchesGrade && matchesStatus && matchesDate && matchesMonth && matchesYear;
  });

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: VisitRecord = {
      id: `rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: newDate,
      time: newTime,
      academicYear: newAcademicYear || schoolInfo.academicYear || '2569',
      studentId: newId.trim() || `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: newName.trim(),
      grade: newGrade,
      room: newRoom,
      gender: newGender,
      bloodType: newBloodType,
      broughtBy: 'เดินมาเอง',
      temperature: newTemp ? parseFloat(newTemp) : undefined,
      symptoms: [newSymptoms as SymptomType],
      symptomDetail: newDetail.trim() || newSymptoms,
      actionsTaken: ['ปฐมพยาบาล'],
      treatmentDetail: newTreatment.trim(),
      medicationGiven: newMed.trim() || undefined,
      careResult: newResult,
      parentNotified: newParentNotified,
      parentPhone: newParentPhone.trim() || undefined,
      referredTo: newReferred.trim() || undefined,
      followUpNeeded: newFollowUp,
      followUpNotes: newFollowUpNotes.trim() || undefined,
      recordedBy: schoolInfo.nurseInCharge,
    };

    addRecord(created);
    setIsAddModalOpen(false);
    // Reset inputs
    setNewName('');
    setNewId('');
    setNewDetail('');
  };

  // Custom confirmation modal for deleting records
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    studentName: string;
  } | null>(null);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateRecord(editingRecord);
    if (editingRecord.bloodType && editingRecord.studentId) {
      updateStudentBloodType(editingRecord.studentId, editingRecord.bloodType);
    }
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string, name: string) => {
    setConfirmDelete({ id, studentName: name });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteRecord(confirmDelete.id);
      if (editingRecord && editingRecord.id === confirmDelete.id) {
        setEditingRecord(null);
      }
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3 py-1 rounded-full">
                CLINIC LOG SYSTEM
              </span>
              <span className="text-xs text-slate-400">
                ข้อมูลทั้งหมด {records.length} รายการ (ปรับแก้ไข/ลบ Real Time)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              ระบบบันทึกการใช้บริการห้องพยาบาล
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              ผู้ดูแลระบบ: <strong>{schoolInfo.nurseInCharge}</strong> • {schoolInfo.roomLocation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกเคสใหม่</span>
            </button>

            <button
              onClick={onOpenSyncModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
              title="ซิงค์และบันทึกข้อมูลเข้า Google Sheets"
            >
              <Sheet className="w-4 h-4 text-emerald-600" />
              <span>ซิงค์สู่ Google Sheets</span>
            </button>

            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                title="เปิดสเปรดชีต Google Sheets ที่บันทึกไว้"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อนักเรียน, รหัส, อาการ หรือการรักษา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#2A9D8F] text-xs sm:text-sm transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden text-xs sm:text-sm bg-white"
            >
              <option value="all">ทุกระดับชั้น (อ.1 - ป.6)</option>
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden text-xs sm:text-sm bg-white"
            >
              <option value="all">ผลการดูแลทั้งหมด</option>
              <option value="resting">🛌 กำลังนอนพักสังเกตอาการ</option>
              <option value="returned">✅ ดีขึ้น กลับเข้าห้องเรียน</option>
              <option value="parent">📞 มีการแจ้งผู้ปกครอง</option>
              <option value="referred">🏥 มีการส่งต่อสถานพยาบาล</option>
              <option value="followup">🔔 ต้องติดตามอาการต่อ</option>
            </select>
          </div>
        </div>

        {/* Date, Month & Academic Year Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2A9D8F]" />
              <span>กรองวันเดือนปี & ปีการศึกษา:</span>
            </span>

            {/* Academic Year */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">ทุกปีการศึกษา</option>
              {availableAcademicYears.map((yr) => (
                <option key={yr} value={yr}>
                  ปีการศึกษา {yr} {yr === (schoolInfo.academicYear || '2569') ? '(ปัจจุบัน)' : ''}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
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

            {/* Specific Date */}
            <div className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                title="เลือกวันที่ต้องการกรอง"
              />
            </div>

            {(yearFilter !== 'all' || monthFilter !== 'all' || dateFilter || gradeFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setYearFilter('all');
                  setMonthFilter('all');
                  setDateFilter('');
                  setGradeFilter('all');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold flex items-center gap-1 transition-colors"
                title="ล้างเงื่อนไขการค้นหาและการกรองทั้งหมด"
              >
                <RotateCcw className="w-3 h-3" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            แสดง <strong className="text-slate-800">{filteredRecords.length}</strong> จากทั้งหมด <strong className="text-slate-800">{records.length}</strong> รายการ
          </div>
        </div>
      </div>

      {/* Main Table with Real-Time Edit & Delete */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3.5 px-4">วันที่ / เวลา</th>
                <th className="py-3.5 px-4">นักเรียน</th>
                <th className="py-3.5 px-3">ชั้น/ห้อง</th>
                <th className="py-3.5 px-3">หมู่เลือด</th>
                <th className="py-3.5 px-4">อาการเบื้องต้น</th>
                <th className="py-3.5 px-4">การช่วยเหลือ / ยา</th>
                <th className="py-3.5 px-4">ผลการดูแล</th>
                <th className="py-3.5 px-4">การส่งต่อ / แจ้ง</th>
                <th className="py-3.5 px-4">การติดตาม</th>
                <th className="py-3.5 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="font-medium text-slate-600">ไม่พบรายการบันทึกตามเงื่อนไขที่เลือก</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือระดับชั้นการกรอง</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const isResting = rec.careResult === 'นอนพักสังเกตอาการ';
                  const isReferred = rec.careResult === 'ส่งต่อสถานพยาบาล / รพ.';
                  const isReturned = rec.careResult === 'ดีขึ้น กลับเข้าห้องเรียน';

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="font-semibold text-slate-800">{rec.date}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {rec.time} น.
                          </span>
                          <span className="text-[10px] font-semibold text-[#1e6f5c] bg-[#E8F6F7] px-1.5 py-0.5 rounded-md">
                            ปี {rec.academicYear || (rec.date ? (parseInt(rec.date.split('-')[0], 10) > 2400 ? rec.date.split('-')[0] : String(parseInt(rec.date.split('-')[0], 10) + 543)) : '2569')}
                          </span>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{rec.studentName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-500">
                            {rec.gender}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>รหัส: {rec.studentId}</span>
                          {rec.temperature && (
                            <span
                              className={`font-semibold ${
                                rec.temperature >= 37.5 ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              🌡️ {rec.temperature}°C
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Grade & Room */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-[#2A9D8F]">
                        {rec.grade}/{rec.room}
                      </td>

                      {/* Blood Type with badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {rec.bloodType && rec.bloodType !== 'ไม่ระบุ' ? (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              rec.bloodType === 'A'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : rec.bloodType === 'B'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : rec.bloodType === 'AB'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            หมู่ {rec.bloodType}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">ไม่ระบุ</span>
                        )}
                      </td>

                      {/* Symptoms */}
                      <td className="py-3.5 px-4">
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

                      {/* Treatment & Medication */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="text-slate-800 font-medium line-clamp-2">
                          {rec.treatmentDetail}
                        </p>
                        {rec.medicationGiven && (
                          <div className="text-[11px] text-purple-700 bg-purple-50 rounded-sm px-1.5 py-0.5 mt-1 inline-block">
                            💊 {rec.medicationGiven}
                          </div>
                        )}
                      </td>

                      {/* Care Result */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                        {rec.bedNumber && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            เตียงพัก #{rec.bedNumber}
                          </div>
                        )}
                      </td>

                      {/* Referral & Parent */}
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        {rec.parentNotified ? (
                          <div className="text-sky-700 font-semibold flex items-center gap-1">
                            <span>📞 แจ้งผู้ปกครองแล้ว</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                        {rec.referredTo && (
                          <div className="text-rose-600 font-bold text-[11px] mt-0.5">
                            🏥 {rec.referredTo}
                          </div>
                        )}
                      </td>

                      {/* Follow up */}
                      <td className="py-3.5 px-4 text-xs">
                        {rec.followUpNeeded ? (
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                              🔔 ติดตามอาการ
                            </span>
                            {rec.followUpNotes && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {rec.followUpNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-emerald-600 text-[11px]">ปกติ</span>
                        )}
                      </td>

                      {/* Actions: Print, Edit, Delete */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onPrintSlip(rec)}
                            title="พิมพ์ใบแจ้งครูประจำชั้น / บันทึกการรับบริการ"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => setEditingRecord(rec)}
                            title="แก้ไข / อัปเดตสถานะ"
                            className="p-1.5 text-slate-500 hover:text-[#2A9D8F] hover:bg-[#E8F6F7] rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-[#2A9D8F]" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(rec.id, rec.studentName)}
                            title="ลบเวชระเบียนนี้"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Edit Record Modal (Supports Editing & Deleting EVERY Single Field) */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto text-left space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-2.5 py-0.5 rounded-full">
                    EDIT RECORD • REAL TIME
                  </span>
                  <span className="text-xs text-slate-400">ID: {editingRecord.id}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  แก้ไขข้อมูลเวชระเบียน: {editingRecord.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  แก้ไขได้ทุกช่อง ข้อมูลเชื่อมโยงถึงกันทั้งระบบและอัปเดตอัตโนมัติ Real Time
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-5 text-xs sm:text-sm">
              {/* 1. Timing & Date */}
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

              {/* 2. Student Identity & Blood Type */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#2A9D8F]" />
                    <span>ข้อมูลนักเรียนผู้รับบริการ</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    เชื่อมต่อฐานข้อมูล 55 คน
                  </span>
                </div>

                {/* Quick Linker from Roster */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    เลือกเปลี่ยนจากบัญชีรายชื่อนักเรียน (อัปเดตอัตโนมัติ)
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

              {/* 3. Vitals & Symptoms */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>การตรวจวัด & กลุ่มอาการสำคัญ</span>
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1 text-xs">
                      อุณหภูมิ (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="เช่น 37.5"
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
                      placeholder="เช่น 110/70"
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
                      placeholder="0"
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
                    อาการสำคัญ (คลิกเพื่อเลือกหรือยกเลิก)
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
                              // If only 1 symptom, don't leave empty
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

              {/* 4. Treatment & Medication */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-[#2A9D8F]" />
                  <span>การปฐมพยาบาล & การรักษา</span>
                </h4>

                {/* Actions multi-selection */}
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

              {/* 5. Care Outcome & Referral */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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

              {/* Modal Footer: Delete Record, Cancel, Save */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteRecord(editingRecord.id, editingRecord.studentName);
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

      {/* Manual Add Case Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  เพิ่มบันทึกเวชระเบียนเคสใหม่
                </h3>
                <p className="text-xs text-slate-400">
                  บันทึกโดย: {schoolInfo.nurseInCharge} • {schoolInfo.roomLocation}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs sm:text-sm">
              {/* Quick Select from students */}
              <div className="p-3.5 bg-[#E8F6F7]/60 rounded-2xl border border-[#2A9D8F]/20 space-y-1">
                <label className="block text-[11px] font-bold text-[#1e6f5c]">
                  🔍 เลือกจากรายชื่อนักเรียน รร.วัดใหม่อมตรส (ปีการศึกษา {schoolInfo.academicYear || '2569'})
                </label>
                <select
                  onChange={(e) => handlePickStudent(e.target.value)}
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
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เวลา</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    placeholder="เช่น 2569"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล นักเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ด.ช. กิตติภพ กล้าหาญ"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">ชั้น</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
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
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">ห้อง</label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Blood Type in Add Record Modal */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    🩸 หมู่เลือดนักเรียน
                  </label>
                  <span className="text-xs font-bold text-rose-600">
                    {newBloodType || 'ไม่ระบุ'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['A', 'B', 'AB', 'O'] as const).map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setNewBloodType(bt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        newBloodType === bt
                          ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewBloodType('ไม่ระบุ')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      newBloodType === 'ไม่ระบุ' || !newBloodType
                        ? 'bg-slate-700 text-white border-slate-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    ✕ ลบหมู่เลือด (ไม่ระบุ)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">อาการหลัก</label>
                  <select
                    value={newSymptoms}
                    onChange={(e) => setNewSymptoms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="มีไข้">มีไข้</option>
                    <option value="ปวดศีรษะ">ปวดศีรษะ</option>
                    <option value="ปวดท้อง">ปวดท้อง</option>
                    <option value="บาดแผล / เลือดออก">บาดแผล / เลือดออก</option>
                    <option value="หกล้ม / ฟกช้ำ">หกล้ม / ฟกช้ำ</option>
                    <option value="คลื่นไส้ / อาเจียน">คลื่นไส้ / อาเจียน</option>
                    <option value="วิงเวียนศีรษะ">วิงเวียนศีรษะ</option>
                    <option value="แมลงสัตว์กัดต่อย">แมลงสัตว์กัดต่อย</option>
                    <option value="ผื่นคัน / ภูมิแพ้">ผื่นคัน / ภูมิแพ้</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อุณหภูมิร่างกาย (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="เช่น 37.2"
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  การให้การรักษา / การปฐมพยาบาล
                </label>
                <input
                  type="text"
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ยาที่จ่าย (ถ้ามี)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ยาน้ำลดกรด 1 ช้อนชา"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ผลการดูแล</label>
                  <select
                    value={newResult}
                    onChange={(e) => setNewResult(e.target.value as CareResult)}
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#2A9D8F] text-white font-bold hover:bg-[#21867a]"
                >
                  บันทึกเคส Real Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deleting Visit Record */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ยืนยันการลบเวชระเบียน
                </h3>
                <p className="text-xs text-slate-500">
                  รหัส: {confirmDelete.id}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบเวชระเบียนของ <strong>"{confirmDelete.studentName}"</strong> แบบถาวร? ข้อมูลจะถูกลบออกจากสถิติและคลาวด์ Real Time ทันที
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                ลบเวชระเบียนทันที
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
