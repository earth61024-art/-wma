import React, { useState } from 'react';
import {
  Sheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HardDrive,
  FileSpreadsheet,
} from 'lucide-react';
import { VisitRecord } from '../types';
import {
  createInfirmarySpreadsheet,
  syncRecordsToSpreadsheet,
  SpreadsheetInfo,
} from '../services/googleSheetsService';
import { User } from 'firebase/auth';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: VisitRecord[];
  currentUser: User | null;
  onGoogleSignIn: () => void;
  spreadsheetInfo: SpreadsheetInfo | null;
  onSyncComplete: (info: SpreadsheetInfo) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  records,
  currentUser,
  onGoogleSignIn,
  spreadsheetInfo,
  onSyncComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ count: number; url: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleConfirmSync = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      let targetSheet = spreadsheetInfo;
      // If no spreadsheet yet created, create one first
      if (!targetSheet) {
        targetSheet = await createInfirmarySpreadsheet();
      }

      // Sync all current records
      const count = await syncRecordsToSpreadsheet(targetSheet.id, records);
      onSyncComplete(targetSheet);
      setSuccessInfo({
        count,
        url: targetSheet.url,
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              ซิงค์ข้อมูลสู่ Google Sheets & Drive
            </h3>
            <p className="text-xs text-slate-500">
              ระบบส่งออกเวชระเบียนนักเรียนและสถิติห้องพยาบาล
            </p>
          </div>
        </div>

        {/* If user not logged in with Google */}
        {!currentUser ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>ต้องลงชื่อเข้าใช้ด้วยบัญชี Google ของโรงเรียน</span>
              </p>
              <p className="text-slate-600">
                เพื่ออนุญาตให้ระบบสร้างหรืออัปเดตไฟล์ Spreadsheet
                บน Google Drive ของคุณครูอย่างปลอดภัย
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="px-5 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            </div>
          </div>
        ) : successInfo ? (
          /* Success Screen */
          <div className="space-y-4 py-2 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                ซิงค์ข้อมูลเข้า Google Sheets สำเร็จ!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                บันทึกเวชระเบียนจำนวน <strong>{successInfo.count} รายการ</strong>{' '}
                ลงในไฟล์เรียบร้อยแล้ว
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <span className="font-medium truncate max-w-[240px]">
                ห้องพยาบาล โรงเรียนวัดใหม่อมตรส.xlsx
              </span>
              <a
                href={successInfo.url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>เปิดดูบน Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Dialog per Workspace Skill Mandate */
          <div className="space-y-4 py-1">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              คุณกำลังจะส่งออกและอัปเดตข้อมูลเวชระเบียนการใช้บริการจำนวน{' '}
              <strong className="text-slate-900">{records.length} รายการ</strong>{' '}
              ไปยัง Google Sheets ของบัญชี:
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                บัญชี Google: {currentUser.email}
              </div>
              <div className="text-slate-500 text-[11px]">
                ตำแหน่ง: บันทึกลง Google Drive หมวดโฟลเดอร์งานอนามัยโรงเรียน
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="text-[11px] text-slate-400 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
              ⚠️ การดำเนินการนี้จะเพิ่มแถวข้อมูลเวชระเบียนใหม่เข้าสู่ Google Sheet ของท่าน
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleConfirmSync}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังซิงค์...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ยืนยันและซิงค์ข้อมูล</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
