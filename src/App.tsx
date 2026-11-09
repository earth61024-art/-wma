/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { InfirmaryProvider, useInfirmary } from './context/InfirmaryContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { ServicesSection } from './components/ServicesSection';
import { RequestServiceForm } from './components/RequestServiceForm';
import { VisitRecordsTable } from './components/VisitRecordsTable';
import { ParentInfoSection } from './components/ParentInfoSection';
import { HealthKnowledgeSection } from './components/HealthKnowledgeSection';
import { EmergencySection } from './components/EmergencySection';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { PrintSlipModal } from './components/PrintSlipModal';

import { VisitRecord } from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  setCachedAccessToken,
} from './services/firebaseAuth';
import {
  getStoredSpreadsheetInfo,
  SpreadsheetInfo,
} from './services/googleSheetsService';

function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState<SpreadsheetInfo | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [printingRecord, setPrintingRecord] = useState<VisitRecord | null>(null);

  const { schoolInfo, records } = useInfirmary();

  // Auth & Spreadsheet initialization
  useEffect(() => {
    const sheetInfo = getStoredSpreadsheetInfo();
    if (sheetInfo) {
      setSpreadsheetInfo(sheetInfo);
    }

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) {
          setCachedAccessToken(token);
        }
      },
      () => {
        setCurrentUser(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-['Prompt',sans-serif]">
      {/* Navbar with official branding and tabs */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        isLoggingIn={isLoggingIn}
        spreadsheetUrl={spreadsheetInfo?.url || null}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && (
          <HomeSection onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'services' && (
          <ServicesSection onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'request' && (
          <RequestServiceForm onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'records' && (
          <VisitRecordsTable
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onPrintSlip={(rec) => setPrintingRecord(rec)}
            spreadsheetUrl={spreadsheetInfo?.url || null}
            isLoggedInGoogle={!!currentUser}
          />
        )}

        {activeTab === 'parents' && <ParentInfoSection />}

        {activeTab === 'knowledge' && <HealthKnowledgeSection />}

        {activeTab === 'emergency' && <EmergencySection />}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            spreadsheetUrl={spreadsheetInfo?.url || null}
            spreadsheetName={spreadsheetInfo?.name}
            isLoggedInGoogle={!!currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Sync to Google Sheets Modal with Confirmation */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        records={records}
        currentUser={currentUser}
        onGoogleSignIn={handleGoogleSignIn}
        spreadsheetInfo={spreadsheetInfo}
        onSyncComplete={(info) => setSpreadsheetInfo(info)}
      />

      {/* Print Slip / Sick Note Slip Modal */}
      <PrintSlipModal
        record={printingRecord}
        onClose={() => setPrintingRecord(null)}
      />

      {/* Footer with updated School details */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100">
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2A9D8F] text-white flex items-center justify-center font-bold">
                  +
                </div>
                <span className="text-sm font-bold text-slate-900">
                  ห้องพยาบาล โรงเรียนวัดใหม่อมตรส
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                {schoolInfo.motto} • มุ่งเน้นการดูแลสุขภาพและสุขอนามัยของนักเรียนประถมศึกษา
                สร้างเสริมสภาพแวดล้อมที่อบอุ่นและปลอดภัยสำหรับทุกคน
              </p>
              <div className="text-[11px] font-semibold text-slate-500">
                {schoolInfo.affiliation || 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.'}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                เวลาเปิดบริการ & จุดบริการ
              </h4>
              <p className="text-xs text-slate-600">{schoolInfo.operatingHours}</p>
              <p className="text-xs text-slate-600 mt-1">{schoolInfo.roomLocation}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                ผู้ดูแล: {schoolInfo.nurseInCharge}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                เบอร์โทรติดต่อฉุกเฉิน
              </h4>
              <p className="text-xs font-bold text-rose-600">
                🚨 สายด่วนกู้ชีพ: 1669
              </p>
              <p className="text-xs text-slate-700 mt-1">
                📞 สายตรงห้องพยาบาล: {schoolInfo.phoneClinicDirect}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                🏫 สำนักงานโรงเรียน: {schoolInfo.phoneSchool}
              </p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              © {new Date().getFullYear() + 543} ห้องพยาบาล โรงเรียนวัดใหม่อมตรส. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <span>เชื่อมต่อ Google Sheets & Google Drive</span>
              <span>•</span>
              <span className="text-[#2A9D8F] font-semibold">
                ระบบงานห้องพยาบาลดิจิทัล (Real Time Connected)
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <InfirmaryProvider>
      <AppContent />
    </InfirmaryProvider>
  );
}
