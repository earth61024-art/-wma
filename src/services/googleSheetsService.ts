import { VisitRecord } from '../types';
import { getAccessToken } from './firebaseAuth';

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  lastSyncedAt?: string;
}

const STORAGE_KEY_SPREADSHEET = 'watmai_infirmary_spreadsheet';

export const getStoredSpreadsheetInfo = (): SpreadsheetInfo | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SPREADSHEET);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveSpreadsheetInfo = (info: SpreadsheetInfo) => {
  localStorage.setItem(STORAGE_KEY_SPREADSHEET, JSON.stringify(info));
};

export const createInfirmarySpreadsheet = async (): Promise<SpreadsheetInfo> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google ก่อนดำเนินการ');
  }

  const title = `ห้องพยาบาล โรงเรียนวัดใหม่อมตรส - บันทึกการใช้บริการ (${new Date().getFullYear() + 543})`;

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
        defaultFormat: {
          textFormat: {
            fontFamily: 'Prompt',
          },
        },
      },
      sheets: [
        {
          properties: {
            title: 'บันทึกการใช้บริการ',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถสร้าง Google Sheet ได้');
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Header row setup
  const headers = [
    'วันที่',
    'เวลา',
    'รหัสนักเรียน',
    'ชื่อ - นามสกุล',
    'ชั้น/ห้อง',
    'เพศ',
    'หมู่เลือด',
    'อุณหภูมิ (°C)',
    'อาการเบื้องต้น',
    'รายละเอียดอาการ',
    'การให้ความช่วยเหลือ/ปฐมพยาบาล',
    'ยาที่จ่าย',
    'ผลการดูแล',
    'แจ้งผู้ปกครอง',
    'เบอร์ผู้ปกครอง',
    'การส่งต่อ',
    'การติดตามผล',
    'ผู้บันทึกข้อมูล',
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกการใช้บริการ'!A1:R1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'บันทึกการใช้บริการ'!A1:R1`,
        majorDimension: 'ROWS',
        values: [headers],
      }),
    }
  );

  const info: SpreadsheetInfo = {
    id: spreadsheetId,
    name: title,
    url,
    lastSyncedAt: new Date().toISOString(),
  };

  saveSpreadsheetInfo(info);
  return info;
};

export const syncRecordsToSpreadsheet = async (
  spreadsheetId: string,
  records: VisitRecord[]
): Promise<number> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('กรุณาลงชื่อเข้าใช้ด้วยบัญชี Google ก่อนดำเนินการ');
  }

  if (records.length === 0) return 0;

  const rows = records.map((r) => [
    r.date,
    r.time,
    r.studentId,
    r.studentName,
    `${r.grade}/${r.room}`,
    r.gender,
    r.bloodType || 'ไม่ระบุ',
    r.temperature ? r.temperature.toString() : '-',
    r.symptoms.join(', '),
    r.symptomDetail || '-',
    r.actionsTaken.join(', '),
    r.medicationGiven || '-',
    r.careResult,
    r.parentNotified ? 'แจ้งแล้ว' : 'ไม่ได้แจ้ง',
    r.parentPhone || '-',
    r.referredTo || '-',
    r.followUpNeeded ? `ต้องติดตาม (${r.followUpNotes || ''})` : 'ปกติ',
    r.recordedBy,
  ]);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'บันทึกการใช้บริการ'!A2:R:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'บันทึกการใช้บริการ'!A2:R`,
        majorDimension: 'ROWS',
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกข้อมูลลง Google Sheet ได้');
  }

  const existing = getStoredSpreadsheetInfo();
  if (existing && existing.id === spreadsheetId) {
    saveSpreadsheetInfo({
      ...existing,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  return rows.length;
};
