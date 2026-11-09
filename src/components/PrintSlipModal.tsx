import React from 'react';
import { Printer, HeartHandshake } from 'lucide-react';
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
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left relative max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4 print:hidden">
          <span className="text-xs font-bold text-[#2A9D8F] bg-[#E8F6F7] px-2.5 py-1 rounded-full">
            ตัวอย่างใบแจ้งผลการดูแล (Sick Note Slip)
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#2A9D8F] text-white text-xs font-semibold hover:bg-[#21867a] flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบแจ้ง</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Paper Slip */}
        <div className="border border-slate-300 p-6 rounded-2xl bg-white space-y-4 text-xs font-['Prompt',sans-serif]">
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
            <h3 className="text-sm font-bold text-slate-900">
              ห้องพยาบาล โรงเรียนวัดใหม่อมตรส
            </h3>
            <p className="text-[11px] font-semibold text-[#2A9D8F]">
              {schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}
            </p>
            <p className="text-[10px] text-slate-500">
              บันทึกการเข้ารับบริการและการดูแลเบื้องต้น (ใบแจ้งครูประจำชั้น / ผู้ปกครอง)
            </p>
          </div>

          <div className="flex justify-between text-[11px] text-slate-600">
            <span>เลขที่เวชระเบียน: #{record.id.replace('rec-', '')}</span>
            <span>วันที่: {record.date} เวลา: {record.time} น.</span>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400">ชื่อนักเรียน:</span>
                <p className="font-bold text-slate-900">{record.studentName}</p>
              </div>
              <div>
                <span className="text-slate-400">ระดับชั้น:</span>
                <p className="font-bold text-slate-900">
                  ชั้น {record.grade}/{record.room}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/50">
              <div>
                <span className="text-slate-400">หมู่เลือด:</span>
                <p className="font-semibold text-rose-600">
                  {record.bloodType && record.bloodType !== 'ไม่ระบุ' ? `หมู่ ${record.bloodType}` : 'ไม่ระบุ'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">อุณหภูมิ:</span>
                <p className="font-semibold text-slate-800">
                  {record.temperature ? `${record.temperature} °C` : 'ปกติ'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">ผู้พามา:</span>
                <p className="font-semibold text-slate-800">
                  {record.broughtBy} {record.companionName ? `(${record.companionName})` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400">อาการที่พบ:</span>
              <p className="font-semibold text-slate-800">
                {record.symptoms.join(', ')} - {record.symptomDetail}
              </p>
            </div>

            <div>
              <span className="text-slate-400">การปฐมพยาบาล / การรักษาที่ให้:</span>
              <p className="text-slate-800">{record.treatmentDetail}</p>
            </div>

            {record.medicationGiven && (
              <div>
                <span className="text-slate-400">ยาที่ได้รับ:</span>
                <p className="font-semibold text-purple-800">💊 {record.medicationGiven}</p>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-slate-400 text-[10px]">ผลการดูแล / คำแนะนำ:</span>
              <p className="font-bold text-emerald-800">{record.careResult}</p>
              {record.followUpNeeded && (
                <p className="text-[10px] text-amber-800 mt-0.5">
                  * ต้องติดตามอาการ: {record.followUpNotes}
                </p>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
            <div>
              <div className="border-b border-dashed border-slate-300 pb-1 mb-1">
                ({record.recordedBy})
              </div>
              <span>ครูพยาบาลผู้ตรวจรักษา</span>
            </div>
            <div>
              <div className="border-b border-dashed border-slate-300 pb-1 mb-1">
                (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)
              </div>
              <span>ครูประจำชั้น / ผู้ปกครองรับทราบ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
