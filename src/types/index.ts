export type GradeLevel = 'อ.1' | 'อ.2' | 'อ.3' | 'ป.1' | 'ป.2' | 'ป.3' | 'ป.4' | 'ป.5' | 'ป.6';

export type SymptomType =
  | 'มีไข้'
  | 'ปวดศีรษะ'
  | 'ปวดท้อง'
  | 'บาดแผล / เลือดออก'
  | 'หกล้ม / ฟกช้ำ'
  | 'คลื่นไส้ / อาเจียน'
  | 'วิงเวียนศีรษะ'
  | 'ตาแดง / เคืองตา'
  | 'แมลงสัตว์กัดต่อย'
  | 'ผื่นคัน / ภูมิแพ้'
  | 'แน่นหน้าอก / หายใจลำบาก'
  | 'ฟันผุ / ปวดฟัน'
  | 'อื่น ๆ';

export type CareResult =
  | 'ดีขึ้น กลับเข้าห้องเรียน'
  | 'นอนพักสังเกตอาการ'
  | 'แจ้งครูประจำชั้น'
  | 'ผู้ปกครองมารับกลับบ้าน'
  | 'ส่งต่อสถานพยาบาล / รพ.'
  | 'ต้องติดตามอาการต่อ';

export type ServiceAction =
  | 'ปฐมพยาบาล'
  | 'เช็ดตัวลดไข้'
  | 'ให้ยาสามัญประจำบ้าน'
  | 'ประคบเย็น / ร้อน'
  | 'นอนพักผ่อน'
  | 'ล้างตา / ทำแผล'
  | 'ประสานผู้ปกครอง'
  | 'ส่งต่อแพทย์';

export interface SchoolInfoData {
  name: string;
  subdistrict: string;
  district: string;
  province: string;
  affiliation?: string; // สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.
  motto: string;
  roomLocation: string; // อาคาร 2 ชั้น 2 ใกล้ห้องอนุบาล
  bedsTotal: number;
  bedsAvailable: number;
  nurseInCharge: string; // ศุภฤกษ์ คุ้มจุ้ย (ครูแนะแนว/ครูเอิร์ธ)
  nursePosition: string;
  assistantNurse: string;
  assistantPosition: string;
  operatingHours: string;
  phoneSchool: string;
  phoneClinicDirect: string;
  emergencySpeedDial: string;
  academicYear?: string; // e.g. '2569', '2570'
  semester?: string; // e.g. 'ภาคเรียนที่ 1', 'ภาคเรียนที่ 2', 'ตลอดปีการศึกษา'
}

export interface StudentProfile {
  id: string;
  no?: number;
  studentId: string;
  citizenId?: string;
  fullName: string;
  grade: GradeLevel;
  room: string;
  gender: 'ชาย' | 'หญิง';
  birthDate?: string;
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ';
  congenitalDisease?: string;
  allergies?: string;
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  notes?: string;
  academicYear?: string; // e.g. '2569', '2570'
  status?: 'กำลังศึกษา' | 'จบการศึกษา' | 'ย้ายสถานศึกษา' | 'พักการเรียน';
}

export interface VisitRecord {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  studentId: string;
  studentName: string;
  grade: GradeLevel;
  room: string;
  gender: 'ชาย' | 'หญิง';
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ';
  broughtBy: 'เดินมาเอง' | 'เพื่อนพามา' | 'ครูประจำชั้นพามา' | 'ครูเวรพามา' | 'เจ้าหน้าที่พามา';
  companionName?: string;
  temperature?: number;
  bloodPressure?: string;
  painLevel?: number; // 0 to 5
  symptoms: SymptomType[];
  symptomDetail: string;
  actionsTaken: ServiceAction[];
  treatmentDetail: string;
  medicationGiven?: string;
  careResult: CareResult;
  bedNumber?: number;
  parentNotified: boolean;
  parentContactName?: string;
  parentPhone?: string;
  referredTo?: string;
  followUpNeeded: boolean;
  followUpNotes?: string;
  recordedBy: string;
  syncedToGoogleSheet?: boolean;
  academicYear?: string;
}

export interface HealthNotice {
  id: string;
  title: string;
  date: string;
  category: 'ข่าวสาร' | 'เตือนภัยสุขภาพ' | 'กิจกรรม' | 'มาตรการ';
  summary: string;
  detail: string;
  priority: 'normal' | 'high' | 'urgent';
  badgeColor?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  english: string;
  icon: string;
  badgeColor: string;
  tag: string;
  examples: string[];
  description: string;
  equipment: string[];
  procedure: string[];
}

export interface HealthTopic {
  id: string;
  title: string;
  emoji: string;
  category: string;
  targetAge: string;
  shortDesc: string;
  funFact: string;
  content: string[];
  tips: string[];
  doAndDont: {
    do: string[];
    dont: string[];
  };
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  number: string;
  type: string;
  highlight: boolean;
}

export interface EmergencyStepItem {
  id: string;
  step: number;
  title: string;
  icon: string;
  desc: string;
  color?: string;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  tag: string;
  severity?: 'high' | 'critical';
  color?: string;
  action: string[];
}

export interface ParentSubmission {
  id: string;
  studentName: string;
  studentId?: string;
  grade: GradeLevel;
  room: string;
  bloodType: string;
  congenital: string;
  allergies: string;
  parentName: string;
  phone: string;
  emergencyPhone?: string;
  notes?: string;
  submittedAt: string;
}
