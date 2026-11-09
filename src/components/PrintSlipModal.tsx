import React from 'react';
import { Printer, HeartHandshake, CheckCircle2, ShieldAlert } from 'lucide-react';
import { VisitRecord } from '../types';
import { useInfirmary } from '../context/InfirmaryContext';

interface PrintSlipModalProps {
  record: VisitRecord | null;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ record, onClose }) => {
  const { schoolInfo } = useInfirmary();

  if (!record) return null;

  const handlePrint = () => {
    // Add print isolation class to body so only #printable-sick-note-slip is printed
    document.body.classList.add('printing-slip');
    window.print();
    // Remove class after print dialog is closed
    setTimeout(() => {
      document.body.classList.remove('printing-slip');
    }, 1000);
  };

  const academicYearText =
    record.academicYear ||
    schoolInfo.academicYear ||
    (record.date
      ? parseInt(record.date.split('-')[0], 10) > 2400
        ? record.date.split('-')[0]
        : String(parseInt(record.date.split('-')[0], 10) + 543)
      : '2569');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 print-modal-overlay">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left relative max-h-[92vh] overflow-y-auto print-modal-box">
        {/* On-screen control bar (Hidden in print) */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2A9D8F] bg-[#E8F6F7] px-2.5 py-1 rounded-full">
              ตัวอย่างใบแจ้งผลการดูแล (Sick Note Slip)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl bg-[#2A9D8F] text-white text-xs font-bold hover:bg-[#21867a] flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ใบแจ้งผลการดูแล</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Paper Slip (Isolate in print, completely visible, never clipped) */}
        <div
          id="printable-sick-note-slip"
          className="border border-slate-300 p-6 rounded-2xl bg-white space-y-4 text-xs font-['Prompt',sans-serif] text-slate-800"
        >
          {/* School Header */}
          <div className="text-center border-b border-slate-200 pb-3 space-y-1">
            <div className="w-14 h-14 rounded-full overflow-hidden mx-auto shadow-xs border border-slate-200 p-0.5 bg-white">
              <img
                src="/logo.png"
                alt="ตราสัญลักษณ์ห้องพยาบาล โรงเรียนวัดใหม่อมตรส"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              ห้องพยาบาล โรงเรียนวัดใหม่อมตรส
            </h3>
            <p className="text-[11px] font-semibold text-[#2A9D8F]">
              {schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}
            </p>
            <p className="text-[10px] text-slate-500">
              ใบแจ้งผลการดูแลและบันทึกการเข้ารับบริการห้องพยาบาล (ส่งต่อครูประจำชั้น / ผู้ปกครอง)
            </p>
          </div>

          {/* Reference & Timing */}
          <div className="flex justify-between items-center text-[11px] text-slate-600 border-b border-slate-100 pb-2">
            <span>
              <strong>เลขที่เวชระเบียน:</strong> #{record.id.replace('rec-', '')}
            </span>
            <span>
              <strong>วันที่:</strong> {record.date} <strong>เวลา:</strong> {record.time} น.
            </span>
            <span>
              <strong>ปีการศึกษา:</strong> {academicYearText}
            </span>
          </div>

          {/* Student Profile Card */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 text-[11px]">ชื่อ - นามสกุล นักเรียน:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {record.studentName} ({record.gender || 'ไม่ระบุ'})
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">ระดับชั้น / ห้องเรียน:</span>
                <p className="font-bold text-[#2A9D8F] text-sm">
                  ชั้น {record.grade}/{record.room}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/70 text-[11px]">
              <div>
                <span className="text-slate-500">เลขประจำตัวนักเรียน:</span>
                <p className="font-semibold text-slate-900">{record.studentId || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">หมู่เลือด:</span>
                <p className="font-bold text-rose-600">
                  {record.bloodType && record.bloodType !== 'ไม่ระบุ' ? `หมู่ ${record.bloodType}` : 'ไม่ระบุ'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">อุณหภูมิร่างกาย:</span>
                <p
                  className={`font-bold ${
                    record.temperature && record.temperature >= 37.5
                      ? 'text-rose-600'
                      : 'text-slate-800'
                  }`}
                >
                  {record.temperature ? `${record.temperature} °C` : 'ปกติ'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/50 text-[11px]">
              <div>
                <span className="text-slate-500">ความดันโลหิต:</span>
                <p className="font-semibold text-slate-800">{record.bloodPressure || 'ปกติ'}</p>
              </div>
              <div>
                <span className="text-slate-500">ระดับความเจ็บ (Pain Scale):</span>
                <p className="font-semibold text-slate-800">
                  {record.painLevel !== undefined ? `${record.painLevel} / 5` : '-'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">ผู้พามาห้องพยาบาล:</span>
                <p className="font-semibold text-slate-800">
                  {record.broughtBy || 'เดินมาเอง'} {record.companionName ? `(${record.companionName})` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Findings & Treatment Details */}
          <div className="space-y-2.5">
            <div>
              <span className="text-slate-500 font-medium">อาการที่ตรวจพบเบื้องต้น:</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {record.symptoms && record.symptoms.length > 0 ? record.symptoms.join(', ') : 'อาการทั่วไป'}
                {record.symptomDetail ? ` — ${record.symptomDetail}` : ''}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium">การให้การปฐมพยาบาล / การดูแลรักษา:</span>
              <p className="text-slate-800 mt-0.5 leading-relaxed">
                {record.treatmentDetail || 'ปฐมพยาบาลเบื้องต้นตามอาการ'}
              </p>
            </div>

            {record.medicationGiven && (
              <div className="p-2 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-purple-900 font-bold">ยาที่ได้รับ:</span>
                <span className="ml-2 text-purple-900 font-semibold">💊 {record.medicationGiven}</span>
              </div>
            )}

            {/* Care Result & Follow-up */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-emerald-900 font-bold">ผลการดูแล / คำแนะนำ:</span>
                <span className="text-emerald-800 font-black">{record.careResult}</span>
              </div>
              {record.bedNumber && (
                <p className="text-[11px] text-emerald-800">
                  * นอนพักสังเกตอาการบนเตียงพยาบาลที่ {record.bedNumber}
                </p>
              )}
              {record.followUpNeeded && (
                <p className="text-[11px] text-amber-900 font-medium">
                  ⚠️ <strong>สิ่งที่ต้องติดตามต่อ:</strong> {record.followUpNotes || 'ติดตามอาการในคาบถัดไป'}
                </p>
              )}
              {record.referredTo && (
                <p className="text-[11px] text-rose-800 font-bold">
                  🏥 <strong>ส่งต่อสถานพยาบาล:</strong> {record.referredTo}
                </p>
              )}
              {record.parentNotified && (
                <p className="text-[11px] text-slate-700">
                  📞 <strong>การติดต่อผู้ปกครอง:</strong> ประสานแล้ว ({record.parentContactName || 'ผู้ปกครอง'} โทร. {record.parentPhone || '-'})
                </p>
              )}
            </div>
          </div>

          {/* Official Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-[10px] text-slate-600">
            <div>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                ({record.recordedBy || schoolInfo.nurseInCharge || 'ครูผู้ดูแลห้องพยาบาล'})
              </div>
              <span>ครูพยาบาลผู้ตรวจรักษา / ผู้บันทึก</span>
              <div className="text-[9px] text-slate-400 mt-0.5">{schoolInfo.roomLocation}</div>
            </div>
            <div>
              <div className="border-b border-dashed border-slate-400 pb-1 mb-1 text-slate-400">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </div>
              <span>ครูประจำชั้น / ผู้ปกครองรับทราบ</span>
              <div className="text-[9px] text-slate-400 mt-0.5">วันที่ _____/_____/_________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
