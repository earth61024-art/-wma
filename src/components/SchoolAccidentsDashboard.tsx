import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  Activity,
  Sparkles,
  HelpCircle,
  Building,
  Gamepad2,
  Trophy,
  Zap,
  Flame,
  DoorClosed,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Printer,
  Users,
  Search,
  BookOpen,
  Eye,
  Info,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { VisitRecord } from '../types';

interface SchoolAccidentsDashboardProps {
  onNavigateToRecords?: () => void;
}

interface SafetyCheckItem {
  id: string;
  category: 'physical' | 'admin' | 'education';
  title: string;
  location: string;
  frequency: string;
  checked: boolean;
  checkedBy?: string;
  checkedDate?: string;
}

const DEFAULT_SAFETY_CHECKLIST: SafetyCheckItem[] = [
  {
    id: 'chk-1',
    category: 'physical',
    title: 'ติดตั้งและตรวจสอบแผ่นยางกันกระแทกใต้เครื่องเล่นสนาม (ปีนป่าย ชิงช้า สไลเดอร์)',
    location: 'สนามเด็กเล่นอนุบาลและประถม',
    frequency: 'ทุกสัปดาห์',
    checked: true,
    checkedBy: 'ครูศุภฤกษ์',
    checkedDate: 'เมื่อวานนี้',
  },
  {
    id: 'chk-2',
    category: 'physical',
    title: 'ตรวจเช็กข้อต่อ โซ่ และความแข็งแรงเครื่องเล่น ไม่ให้มีสนิมหรือเหล็กคมโผล่',
    location: 'สนามเด็กเล่น',
    frequency: 'ทุกสัปดาห์',
    checked: true,
    checkedBy: 'เจ้าหน้าที่อาคาร',
    checkedDate: 'ต้นสัปดาห์',
  },
  {
    id: 'chk-3',
    category: 'physical',
    title: 'ตรวจแผ่นยางกันลื่นหน้าห้องน้ำ โรงอาหาร และทางเดินที่ฝนสาด',
    location: 'จุดเปียกชื้นทุกอาคาร',
    frequency: 'ทุกวัน',
    checked: true,
    checkedBy: 'ครูเวรประจำวัน',
    checkedDate: 'วันนี้',
  },
  {
    id: 'chk-4',
    category: 'physical',
    title: 'ติดตั้งและตรวจโฟมกันกระแทกมุมโต๊ะ มุมเสา ในห้องเรียนเด็กอนุบาล',
    location: 'ห้องเรียน อ.1 - อ.3',
    frequency: 'ทุกเดือน',
    checked: true,
    checkedBy: 'ครูประจำชั้นอนุบาล',
    checkedDate: 'ต้นเดือนนี้',
  },
  {
    id: 'chk-5',
    category: 'physical',
    title: 'ตรวจลูกกรงราวบันไดและระเบียงให้มีระยะห่างแนวตั้งไม่เกิน 9 ซม.',
    location: 'บันไดและระเบียงชั้น 2-3',
    frequency: 'ทุกภาคเรียน',
    checked: true,
    checkedBy: 'คณะกรรมการความปลอดภัย',
    checkedDate: 'เปิดภาคเรียน',
  },
  {
    id: 'chk-6',
    category: 'physical',
    title: 'ตรวจอุปกรณ์ชะลอการปิดประตู (Door Closer) หรือที่กั้นประตู กันลมตีหนีบนิ้ว',
    location: 'ประตูห้องเรียนทุกห้อง',
    frequency: 'ทุกเดือน',
    checked: true,
    checkedBy: 'ครูห้องพยาบาล',
    checkedDate: 'สัปดาห์ที่แล้ว',
  },
  {
    id: 'chk-7',
    category: 'physical',
    title: 'ตรวจฝาครอบปลั๊กไฟระดับต่ำ และเช็กสายดิน-ไฟฟ้ารั่วที่ตู้น้ำดื่มสแตนเลส',
    location: 'ห้องเรียนและจุดบริการน้ำดื่ม',
    frequency: 'ทุกสัปดาห์',
    checked: true,
    checkedBy: 'ช่างเทคนิคโรงเรียน',
    checkedDate: 'สัปดาห์นี้',
  },
  {
    id: 'chk-8',
    category: 'admin',
    title: 'จัดครูเวรดูแลใกล้ชิดตามจุดเสี่ยง (สนามเด็กเล่น บันได ระเบียง) ช่วงพักกลางวันและเลิกเรียน',
    location: 'ทั่วบริเวณโรงเรียน',
    frequency: 'ทุกวันทำการ',
    checked: true,
    checkedBy: 'ครูเวรประจำวัน',
    checkedDate: 'วันนี้',
  },
  {
    id: 'chk-9',
    category: 'admin',
    title: 'มาตรการโรงอาหาร: วางของร้อน/หม้อแกงพ้นมือเด็ก แยกโซนล้างจานเปียก ฝึกเดินเข้าคิว',
    location: 'โรงอาหารกลาง',
    frequency: 'ทุกวัน',
    checked: true,
    checkedBy: 'ฝ่ายโภชนาการ',
    checkedDate: 'วันนี้',
  },
  {
    id: 'chk-10',
    category: 'admin',
    title: 'คัดกรองของเล่นอนุบาล: ตรวจไม่ให้มีชิ้นส่วนเล็ก เม็ดลูกปัด กระดุม ที่เด็กอาจกลืน/อุดตันทางเดินหายใจ',
    location: 'ห้องเรียนอนุบาล 1-3',
    frequency: 'ทุกสัปดาห์',
    checked: true,
    checkedBy: 'ครูประจำชั้นอนุบาล',
    checkedDate: 'สัปดาห์นี้',
  },
  {
    id: 'chk-11',
    category: 'education',
    title: 'สอนกฎความปลอดภัยขั้นพื้นฐาน (ไม่วิ่งบนบันได ไม่ปล่อยมือชิงช้า ไม่เอาของเข้าปาก)',
    location: 'ทุกห้องเรียนในคาบโฮมรูม',
    frequency: 'สัปดาห์ละ 1 ครั้ง',
    checked: true,
    checkedBy: 'ครูประจำชั้น',
    checkedDate: 'สัปดาห์นี้',
  },
  {
    id: 'chk-12',
    category: 'education',
    title: 'ซักซ้อมแผนเผชิญเหตุฉุกเฉิน อพยพหนีไฟ และฝึกปฐมพยาบาลเบื้องต้น (ห้ามเลือด/ช่วยคนสำลัก Heimlich)',
    location: 'ลานกิจกรรมโรงเรียน',
    frequency: 'ภาคเรียนละ 1 ครั้ง',
    checked: true,
    checkedBy: 'ครูห้องพยาบาล & วิทยากร',
    checkedDate: 'ภาคเรียนที่ 1',
  },
];

export const SchoolAccidentsDashboard: React.FC<SchoolAccidentsDashboardProps> = ({
  onNavigateToRecords,
}) => {
  const { records, schoolInfo } = useInfirmary();

  // Safety checklist state stored in localStorage
  const [checklist, setChecklist] = useState<SafetyCheckItem[]>(() => {
    try {
      const saved = localStorage.getItem('infirmary_safety_checklist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SAFETY_CHECKLIST;
  });

  const [activeHazardTab, setActiveHazardTab] = useState<'all' | 'kindergarten' | 'primary'>('all');
  const [expandedHazardIndex, setExpandedHazardIndex] = useState<number | null>(0);
  const [activePillarTab, setActivePillarTab] = useState<'all' | 'physical' | 'admin' | 'education'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist checklist
  const handleToggleCheck = (id: string) => {
    setChecklist((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              checked: !item.checked,
              checkedDate: !item.checked ? 'วันนี้' : undefined,
              checkedBy: !item.checked ? schoolInfo.nurseInCharge || 'ครูห้องพยาบาล' : undefined,
            }
          : item
      );
      try {
        localStorage.setItem('infirmary_safety_checklist', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Real data analytics from infirmary records
  const accidentRecords = records.filter((r) => {
    const s = r.symptoms.join(' ');
    const n = ((r.symptomDetail || '') + ' ' + (r.treatmentDetail || '')).toLowerCase();
    return (
      s.includes('หกล้ม') ||
      s.includes('ฟกช้ำ') ||
      s.includes('บาดแผล') ||
      s.includes('เลือดออก') ||
      n.includes('วิ่งชน') ||
      n.includes('ตก') ||
      n.includes('ลื่น') ||
      n.includes('แผล') ||
      n.includes('สนาม') ||
      n.includes('ประตู') ||
      n.includes('ข้อเท้า') ||
      n.includes('บอล')
    );
  });

  const kindergartenAccidents = accidentRecords.filter(
    (r) => r.grade === 'อ.1' || r.grade === 'อ.2' || r.grade === 'อ.3'
  );
  const primaryAccidents = accidentRecords.filter(
    (r) => r.grade.startsWith('ป.')
  );

  const completedChecksCount = checklist.filter((c) => c.checked).length;
  const safetyAuditScore = Math.round((completedChecksCount / checklist.length) * 100);

  // The 7 common accident points specified in the user request
  const hazardsList = [
    {
      id: 1,
      name: 'การพลัดตก หกล้ม และวิ่งชน',
      frequencyRank: 'เกิดบ่อยที่สุด อันดับ 1',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      tag: 'เสี่ยงทั้งอนุบาลและประถม',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'],
      description:
        'เป็นอุบัติเหตุที่เกิดขึ้นบ่อยที่สุด เช่น ลื่นล้มบนพื้นอาคาร สะดุดบันได หรือวิ่งชนกันในห้องเรียนและสนามเด็กเล่น ทำให้เกิดแผลถลอก ฟกช้ำ กระดูกหัก หรือข้อเคลื่อน',
      locations: 'พื้นทางเดินอาคาร, ขั้นบันได, ห้องเรียน, สนามเด็กเล่น, ลานอเนกประสงค์',
      causes: 'การวิ่งไล่จับ, การไม่มองทาง, พื้นลื่นเปียกน้ำ, เชือกรองเท้าหลุด, แย่งกันลงบันได',
      severity: 'สูง (แผลถลอกจนถึงข้อหลุด/กระดูกหัก)',
      icon: Activity,
      firstAid:
        'ล้างแผลด้วยน้ำสะอาด/น้ำเกลือ ประคบเย็นบริเวณที่บวมฟกช้ำ 15-20 นาที หากปวดรุนแรงผิดรูป ห้ามดัดดึง ให้ดามตรึงและส่งต่อ รพ. ทันที',
      preventionKey: 'ติดตั้งแผ่นยางกันลื่น, โฟมกันกระแทกมุมโต๊ะ/เสา, กฎห้ามวิ่งบนอาคารและบันได',
    },
    {
      id: 2,
      name: 'อุบัติเหตุจากสนามเด็กเล่น',
      frequencyRank: 'พบบ่อยช่วงพักกลางวัน',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      tag: 'เน้นเด็กเล็กและอนุบาล',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2'],
      description:
        'เช่น ตกจากชิงช้า ไหลลื่นจากสไลเดอร์ หรือปีนป่ายเครื่องเล่นที่สูงเกินไป หรือเครื่องเล่นชำรุดไม่มีวัสดุกันกระแทกด้านล่าง',
      locations: 'ชิงช้า, สไลเดอร์, บาร์โหน, เครื่องเล่นปีนป่าย, กระบะทราย',
      causes: 'การผลักกันบนเครื่องเล่น, ยืนบนชิงช้า, ลื่นไถลศีรษะลง, เครื่องเล่นมีสนิมหรือโซ่หลวม',
      severity: 'ปานกลาง - รุนแรง',
      icon: Gamepad2,
      firstAid:
        'ตรวจเช็กการตอบสนองและศีรษะ หากตกจากที่สูงและมีอาการมึนงง อาเจียน หรือปวดคอ ห้ามเคลื่อนย้ายผิดท่า ให้ประสานรถพยาบาลทันที',
      preventionKey: 'ติดตั้งแผ่นยางกันกระแทกใต้เครื่องเล่น, ตรวจเช็กโซ่-น็อตทุกสัปดาห์, ครูเวรคุมเข้ม',
    },
    {
      id: 3,
      name: 'การบาดเจ็บจากการเล่นกีฬาและวิชาพละ',
      frequencyRank: 'พบบ่อยในคาบพละ & ช่วงหลังเลิกเรียน',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tag: 'เน้นเด็กประถมศึกษา',
      gradeFocus: ['ป.3', 'ป.4', 'ป.5', 'ป.6'],
      description:
        'เช่น ถูกลูกบอลกระแทกใส่หน้าหรือลำตัว สะดุดล้มในสนามหญ้า หรือข้อเท้าแพลงจากการวิ่ง',
      locations: 'สนามฟุตบอล, สนามบาสเกตบอล, ลานกีฬา, โรงยิม',
      causes: 'ไม่ได้อบอุ่นร่างกาย (Warm-up), การปะทะขณะแย่งลูกบอล, พื้นสนามหญ้าเป็นหลุมเป็นบ่อ',
      severity: 'ปานกลาง (เลือดกำเดาไหล, ข้อเท้าแพลง, ฟกช้ำ)',
      icon: Trophy,
      firstAid:
        'หลักการ R.I.C.E. (Rest พัก, Ice ประคบเย็น, Compression พันผ้ายืด, Elevation ยกสูง) หากเลือดกำเดาไหล ให้ก้มหน้าเล็กน้อย บีบปีกจมูก 5-10 นาที ห้ามเงยหน้า',
      preventionKey: 'วอร์มอัพก่อนเล่น, ปรับหน้าดินสนามไม่ให้เป็นหลุม, ตรวจความพร้อมรองเท้ากีฬา',
    },
    {
      id: 4,
      name: 'อุบัติเหตุจากอาคารเรียนและเฟอร์นิเจอร์',
      frequencyRank: 'เกิดในห้องเรียนและทางเดิน',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      tag: 'เสี่ยงทั้งอนุบาลและประถม',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3'],
      description:
        'เช่น นิ้วถูกประตูหนีบ ตกจากระเบียงหรือบันไดที่ไม่มีลูกกรงกั้นสูงพอ หรือเดินชนมุมโต๊ะ-เก้าอี้เรียน',
      locations: 'บานประตูห้องเรียน, ลูกกรงระเบียง, ขอบมุมโต๊ะ-เก้าอี้, หน้าต่าง',
      causes: 'ลมพัดประตูกระแทก, เล่นซ่อนแอบหลังประตู, เดินก้มหน้าชนมุมโต๊ะ, ปืนระเบียง',
      severity: 'ปานกลาง - วิกฤต',
      icon: Building,
      firstAid:
        'กรณีนิ้วหนีบ: ประคบเย็นทันที เช็กกระดูก หากมีแผลฉีกขาดให้กดห้ามเลือดและส่งพบแพทย์, กรณีชนมุมโต๊ะ: ประคบเย็นและสังเกตอาการปูดโน',
      preventionKey: 'ติดตั้ง Door Closer / ที่กั้นประตู, ซี่กั้นระเบียงห่างไม่เกิน 9 ซม., ติดโฟมกันกระแทกมุมโต๊ะ',
    },
    {
      id: 5,
      name: 'สำลักหรือกลืนสิ่งแปลกปลอม',
      frequencyRank: 'เหตุฉุกเฉินวิกฤต',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      tag: 'เน้นเด็กเล็กอนุบาลอย่างยิ่ง',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3'],
      description:
        'เด็กเล็กชอบหยิบของเล่น เม็ดลูกปัด หรือสิ่งของชิ้นเล็กเข้าปาก หรือสำลักอาหารเวลารีบกินหรือวิ่งขณะเคี้ยว',
      locations: 'มุมของเล่นอนุบาล, โต๊ะอาหารกลางวัน, โต๊ะกิจกรรมศิลปะ',
      causes: 'ของเล่นมีชิ้นส่วนหลุดง่าย, รีบกินอาหารแล้ววิ่งคุยกัน, เมล็ดผลไม้, ฝาขวดน้ำ, เหรียญ',
      severity: 'วิกฤตอันตรายถึงชีวิต (ทางเดินหายใจอุดกั้น)',
      icon: Flame,
      firstAid:
        'ทำท่า Heimlich Maneuver ทันที! สำหรับเด็กโต: ยืนด้านหลังโอบเอว กดกระแทกใต้ลิ้นปี่ สำหรับเด็กเล็ก: ตบหลัง 5 ครั้ง สลับกดหน้าอก 5 ครั้ง พร้อมโทร 1669',
      preventionKey: 'คัดกรองของเล่นชิ้นเล็ก, ไม่ให้เด็กวิ่งขณะมีอาหารในปาก, แยกก้างปลา/เมล็ดผลไม้ออกจากอาหาร',
    },
    {
      id: 6,
      name: 'ไฟฟ้าดูด / อันตรายจากน้ำและตู้น้ำดื่ม',
      frequencyRank: 'จุดเสี่ยงภัยแฝง',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      tag: 'เสี่ยงทุกระดับชั้น',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'],
      description:
        'เช่น การใช้นิ้วหรือโลหะแหย่ปลั๊กไฟ, การใช้ปากดูดก๊อกตู้น้ำดื่มโดยตรง, หรือการลื่นล้มบริเวณห้องน้ำเปียกแฉะ',
      locations: 'เต้ารับปลั๊กไฟตามผนัง, ตู้น้ำดื่มสแตนเลส, อ่างล้างมือ, พื้นห้องน้ำ',
      causes: 'เต้ารับไม่มีฝาครอบ, ตู้น้ำไม่มีสายดินหรือไฟฟ้ารั่ว, ปากสัมผัสก๊อกน้ำเปียก, พื้นห้องน้ำลื่นสบู่',
      severity: 'วิกฤต',
      icon: Zap,
      firstAid:
        'กรณีถูกไฟดูด: สับเบรกเกอร์ตัดไฟทันทีก่อนเข้าช่วย ห้ามจับตัวเด็กด้วยมือเปล่า! ใช้ไม้วนหรือฉนวนดึงตัวออก ตรวจชีพจรและทำ CPR พร้อมโทร 1669',
      preventionKey: 'ติดฝาครอบปลั๊กไฟ, ติดตั้งสายดินและตรวจเช็กกระแสไฟฟ้ารั่วสม่ำเสมอ, ใช้กระบอกน้ำส่วนตัวแทนปากดูดก๊อก',
    },
    {
      id: 7,
      name: 'อุบัติเหตุจากประตูโรงเรียนและเขตก่อสร้าง',
      frequencyRank: 'จุดเสี่ยงรอบนอกอาคาร',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      tag: 'เสี่ยงตอนเช้าและตอนเลิกเรียน',
      gradeFocus: ['อ.1', 'อ.2', 'อ.3', 'ป.1', 'ป.2', 'ป.3', 'ป.4', 'ป.5', 'ป.6'],
      description:
        'เช่น ประตูรั้วเหล็กขนาดใหญ่ล้มทับ หรือเด็กเดินเข้าไปใกล้บริเวณที่มีการก่อสร้างต่อเติมในโรงเรียน',
      locations: 'ประตูรั้วใหญ่หน้าโรงเรียน, แนวกำแพง, เขตก่อสร้างซ่อมแซม, ทางรถเข้า-ออก',
      causes: 'ประตูล้อเลื่อนหลุดราง, เด็กปีนป่ายหรือเขย่ารั้ว, เศษตะปู/เหล็กแหลมจากเขตก่อสร้าง, รถยนต์ถอย',
      severity: 'รุนแรงมาก - วิกฤต',
      icon: DoorClosed,
      firstAid:
        'ยกของหนักออกอย่างระมัดระวัง ห้ามดึงกระชากตัว ตรวจการหายใจและกระดูก ห้ามเลือดและเรียกรถพยาบาลกู้ชีพ 1669 ทันที',
      preventionKey: 'ติดตั้งรางล็อกกันประตูรั้วล้ม, ปิดกั้นเขตก่อสร้างด้วยผ้าใบมิดชิดติดป้ายเตือน, รปภ./ครูเวรดูแลช่วงประตูเปิด-ปิด',
    },
  ];

  // Filtering hazards based on tab
  const filteredHazards = hazardsList.filter((h) => {
    if (activeHazardTab === 'kindergarten') {
      return h.gradeFocus.some((g) => g.startsWith('อ.'));
    }
    if (activeHazardTab === 'primary') {
      return h.gradeFocus.some((g) => g.startsWith('ป.'));
    }
    return true;
  });

  // Filtered safety pillars
  const pillars = [
    {
      id: 'physical',
      title: '1. การปรับปรุงสภาพแวดล้อมและโครงสร้างพื้นฐาน (Physical Environment)',
      subtitle: 'การปรับเปลี่ยนกายภาพและอุปกรณ์เพื่อลดอันตรายเชิงรุก',
      color: 'indigo',
      badge: 'โครงสร้างพื้นฐาน',
      points: [
        {
          title: 'สนามเด็กเล่นปลอดภัย',
          desc: 'ติดตั้ง แผ่นยางกันกระแทก บริเวณใต้เครื่องเล่นประเภทปีนป่าย ชิงช้า และสไลเดอร์ ตรวจสอบข้อต่อ โซ่ และความแข็งแรงของเครื่องเล่นทุกสัปดาห์ ไม่ปล่อยให้มีสนิมหรือเหล็กคมโผล่ออกมา',
          icon: '🛝',
        },
        {
          title: 'ลดความเสี่ยงจากการลื่นและชน',
          desc: 'ใช้ แผ่นยางกันลื่น ในจุดที่เปียกชื้นบ่อย เช่น หน้าห้องน้ำ โรงอาหาร และทางเดินที่มีฝนสาด ติดตั้ง โฟมกันกระแทกมุมโต๊ะ และมุมเสาในห้องเรียนของเด็กอนุบาลเพื่อลดความรุนแรงเวลาเด็กวิ่งชน',
          icon: '🛡️',
        },
        {
          title: 'ป้องกันการพลัดตกและประตูหนีบ',
          desc: 'ราวบันไดและระเบียงต้องมีซี่กั้นในแนวตั้งที่ห่างกันไม่เกิน 9 เซนติเมตร เพื่อป้องกันเด็กมุดหัวหรือลำตัวลอดออกไป และติดตั้ง อุปกรณ์ชะลอการปิดประตู (Door Closer) หรือที่กั้นประตู เพื่อป้องกันประตูลมตีหนีบนิ้วเด็ก',
          icon: '🚪',
        },
        {
          title: 'ระบบไฟฟ้าและความร้อน',
          desc: 'ติดตั้ง ฝาครอบปลั๊กไฟ ในจุดที่มือเด็กเอื้อมถึง แยกคอมเพรสเซอร์แอร์และตู้ควบคุมไฟไว้ในห้องที่ล็อกมิดชิด ตู้น้ำดื่มต้องมีการต่อสายดินที่ถูกต้องและตรวจเช็กกระแสไฟฟ้ารั่วอย่างสม่ำเสมอ',
          icon: '⚡',
        },
      ],
    },
    {
      id: 'admin',
      title: '2. การจัดการและการกำกับดูแล (Administration & Supervision)',
      subtitle: 'ระบบบริหารกำลังคนและกระบวนการดูแลความปลอดภัย',
      color: 'teal',
      badge: 'การกำกับดูแล',
      points: [
        {
          title: 'จัดครูเวรดูแลอย่างใกล้ชิด',
          desc: 'อุบัติเหตุมักเกิดในช่วงเวลาที่ไม่มีผู้ใหญ่เฝ้า เช่น ช่วงพักกลางวัน หลังเลิกเรียน หรือช่วงเปลี่ยนคาบเรียน ควรจัดครูเวรประจำตามจุดเสี่ยงต่างๆ เช่น สนามเด็กเล่น บันได และประตูระเบียง',
          icon: '👥',
        },
        {
          title: 'มาตรการความปลอดภัยในโรงอาหาร',
          desc: 'กำหนดให้มีพื้นที่เฉพาะสำหรับวางหม้อแกงหรือของร้อนที่เด็กเอื้อมไม่ถึง แยกโซนล้างจานที่พื้นเปียกออกจากทางเดินของเด็ก และฝึกให้เด็กเดินเรียงคิวอย่างเป็นระเบียบ ไม่วิ่งถือถาดอาหาร',
          icon: '🍲',
        },
        {
          title: 'ระบบคัดกรองสิ่งแปลกปลอม',
          desc: 'สำหรับเด็กเล็กอนุบาล ครูประจำชั้นควรตรวจเช็กของเล่นในห้องเรียน ไม่ให้มีชิ้นส่วนขนาดเล็ก (เช่น ตัวต่อเลโก้ขนาดเล็ก ลูกปัด หรือกระดุม) ที่เด็กสามารถหยิบใส่ปาก จมูก หรือหูได้',
          icon: '🔍',
        },
      ],
    },
    {
      id: 'education',
      title: '3. การให้ความรู้และสร้างความตระหนักรู้ (Education)',
      subtitle: 'การปลูกฝังวินัยความปลอดภัยและการเตรียมพร้อมเมื่อเกิดเหตุฉุกเฉิน',
      color: 'amber',
      badge: 'การศึกษาและฝึกทักษะ',
      points: [
        {
          title: 'ฝึกทักษะการเอาตัวรอด',
          desc: 'สอนกฎความปลอดภัยขั้นพื้นฐานให้เด็กเข้าใจง่าย เช่น "ไม่วิ่งบนบันได" "ไม่ปล่อยมือตอนเล่นชิงช้า" หรือ "ไม่หยิบของแปลกปลอมเข้าปาก" และสอนการสังเกตป้ายเตือนอันตราย',
          icon: '🧠',
        },
        {
          title: 'ซักซ้อมแผนเผชิญเหตุฉุกเฉิน',
          desc: 'จัดกิจกรรมซ้อมอพยพหนีไฟ การปฐมพยาบาลเบื้องต้น (เช่น การห้ามเลือด หรือการช่วยคนสำลักอาหารด้วยวิธี Heimlich Maneuver) ให้ครู บุคลากร และนักเรียนมีความพร้อมเมื่อเกิดเหตุการณ์จริง',
          icon: '🚨',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>School Safety & Hazard Prevention Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Dashboard อุบัติเหตุที่พบบ่อยในเด็กอนุบาลและประถมศึกษาระหว่างอยู่ในโรงเรียน
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              มักเกิดจากการวิ่งเล่นซุกซน ขาดการระมัดระวัง หรือสภาพแวดล้อมที่ไม่ปลอดภัย
              ระบบเฝ้าระวัง 7 จุดเสี่ยงสำคัญ พร้อมแนวทางป้องกันเชิงรุก 3 ด้านหลัก
              (โครงสร้างพื้นฐาน การกำกับดูแล และการให้ความรู้)
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex flex-row sm:flex-col lg:flex-row gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[130px]">
              <span className="text-xs text-slate-300 block font-medium">ดัชนีความปลอดภัย</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {safetyAuditScore}%
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                ผ่านเกณฑ์ {completedChecksCount}/{checklist.length} รายการ
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[130px]">
              <span className="text-xs text-slate-300 block font-medium">เคสอุบัติเหตุสะสม</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {accidentRecords.length}
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                อนุบาล {kindergartenAccidents.length} | ประถม {primaryAccidents.length}
              </span>
            </div>
          </div>
        </div>

        {/* Action quick links */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Building className="w-4 h-4 text-indigo-400" />
            <span>โรงเรียนวัดใหม่อมตรส • ศูนย์บริหารความปลอดภัยนักเรียน สังกัด กทม.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium transition-all flex items-center gap-1.5 border border-white/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์รายงานความปลอดภัย</span>
            </button>
            {onNavigateToRecords && (
              <button
                onClick={onNavigateToRecords}
                className="px-3 py-1.5 rounded-xl bg-[#2A9D8F] hover:bg-[#238276] text-white font-semibold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>ดูเคสห้องพยาบาล Real-Time</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">อันดับ 1 เกิดบ่อยที่สุด</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">การพลัดตก หกล้ม วิ่งชน</div>
            <div className="text-xs text-rose-600 font-medium mt-0.5">
              {accidentRecords.filter((r) => r.symptoms.includes('หกล้ม / ฟกช้ำ') || r.symptoms.includes('บาดแผล / เลือดออก')).length} บันทึกประวัติ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">กลุ่มเด็กเล็ก (อนุบาล 1-3)</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {kindergartenAccidents.length} เคสในระบบ
            </div>
            <div className="text-xs text-purple-600 font-medium mt-0.5">
              เสี่ยง: วิ่งชน, ชิงช้า, กลืนสิ่งแปลกปลอม
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">กลุ่มเด็กประถม (ป.1 - ป.6)</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {primaryAccidents.length} เคสในระบบ
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-0.5">
              เสี่ยง: กีฬาพละ, บันได, วิ่งไล่จับ
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">การตรวจความปลอดภัย</div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {completedChecksCount} จาก {checklist.length} รายการ
            </div>
            <div className="text-xs text-indigo-600 font-medium mt-0.5">
              ครอบคลุมทั้ง 3 ด้านเชิงรุก
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: 7 จุดและลักษณะอุบัติเหตุที่พบบ่อยในโรงเรียน */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                จุดและลักษณะอุบัติเหตุที่พบบ่อยในโรงเรียน (7 จุดเสี่ยงสำคัญ)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              การวิเคราะห์สาเหตุ อาการ และแนวทางปฐมพยาบาลเบื้องต้นสำหรับเด็กอนุบาลและเด็กประถม
            </p>
          </div>

          {/* Filter Grade */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveHazardTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeHazardTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด (7 จุด)
            </button>
            <button
              onClick={() => setActiveHazardTab('kindergarten')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeHazardTab === 'kindergarten'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-purple-700'
              }`}
            >
              ระดับอนุบาล (อ.1 - อ.3)
            </button>
            <button
              onClick={() => setActiveHazardTab('primary')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeHazardTab === 'primary'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              ระดับประถม (ป.1 - ป.6)
            </button>
          </div>
        </div>

        {/* Hazard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHazards.map((item, index) => {
            const Icon = item.icon;
            const isExpanded = expandedHazardIndex === index;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-300 ring-2 ring-indigo-100 bg-white shadow-md'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => setExpandedHazardIndex(isExpanded ? null : index)}
                  className="p-5 cursor-pointer flex items-start justify-between gap-3 select-none"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {item.id}. {item.name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${item.badgeColor}`}
                        >
                          {item.frequencyRank}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3.5 text-xs text-slate-700 bg-white">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <span>ลักษณะที่พบได้บ่อย:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                        <span className="font-bold text-rose-900 block mb-0.5">📍 จุดเกิดเหตุหลัก:</span>
                        <span className="text-rose-800">{item.locations}</span>
                      </div>
                      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                        <span className="font-bold text-amber-900 block mb-0.5">⚠️ สาเหตุที่พบบ่อย:</span>
                        <span className="text-amber-800">{item.causes}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <HeartHandshake className="w-4 h-4 text-emerald-600" />
                        <span>วิธีปฐมพยาบาลเบื้องต้น (First Aid Action):</span>
                      </div>
                      <p className="text-emerald-800 leading-relaxed">{item.firstAid}</p>
                    </div>

                    <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>แนวทางป้องกันในจุดนี้:</span>
                      </div>
                      <p className="text-indigo-800 leading-relaxed">{item.preventionKey}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: แนวทางป้องกันและปรับปรุงความปลอดภัยในโรงเรียน (3 ด้านหลัก) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                แนวทางป้องกันและปรับปรุงความปลอดภัยในโรงเรียน (3 ด้านหลัก)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              มาตรการลดโอกาสเกิดอุบัติเหตุในเด็กเล็กและเด็กประถม ทั้งโครงสร้าง การจัดการ และการให้ความรู้
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActivePillarTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activePillarTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แสดงทั้ง 3 ด้าน
            </button>
            <button
              onClick={() => setActivePillarTab('physical')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activePillarTab === 'physical'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              1. โครงสร้างพื้นฐาน
            </button>
            <button
              onClick={() => setActivePillarTab('admin')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activePillarTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-teal-700'
              }`}
            >
              2. การจัดการ & กำกับดูแล
            </button>
            <button
              onClick={() => setActivePillarTab('education')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activePillarTab === 'education'
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              3. การให้ความรู้
            </button>
          </div>
        </div>

        {/* Pillars Display */}
        <div className="space-y-6">
          {pillars
            .filter((p) => activePillarTab === 'all' || activePillarTab === p.id)
            .map((pillar) => (
              <div
                key={pillar.id}
                className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/30"
              >
                {/* Pillar Header Bar */}
                <div className="px-5 py-4 bg-gradient-to-r from-slate-100 to-white border-b border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>{pillar.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{pillar.subtitle}</p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-200/80 text-slate-700">
                    {pillar.points.length} มาตรการหลัก
                  </span>
                </div>

                {/* Points List */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pillar.points.map((pt, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all space-y-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{pt.icon}</span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {pt.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        {pt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* SECTION 3: Interactive Safety Checklist & Audit Tool */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  รายการตรวจสอบความปลอดภัยและจุดเสี่ยงรอบโรงเรียน (Safety Inspection Checklist)
                </h2>
                <p className="text-xs text-slate-500">
                  เครื่องมือสำหรับครูเวร ครูห้องพยาบาล และฝ่ายอาคารสถานที่ในการตรวจประเมินตามเกณฑ์ 3 ด้าน
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              ความพร้อม: {completedChecksCount}/{checklist.length} (
              <span className="font-bold text-emerald-600 font-mono">{safetyAuditScore}%</span>)
            </span>
          </div>
        </div>

        {/* Checklist Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${safetyAuditScore}%` }}
          />
        </div>

        {/* Check Items Table / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleCheck(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                item.checked
                  ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                  : 'bg-white border-slate-200 hover:border-slate-300 opacity-90'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 space-y-1">
                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {item.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>📍 {item.location}</span>
                  <span>• รอบตรวจ: {item.frequency}</span>
                  {item.checked && item.checkedDate && (
                    <span className="text-emerald-700 font-medium">
                      ✓ ตรวจแล้ว ({item.checkedDate})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: First Aid Quick Response Protocols (การปฐมพยาบาลด่วน) */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              แนวทางปฏิบัติการปฐมพยาบาลด่วน (Emergency First Aid Quick Protocols)
            </h3>
            <p className="text-xs text-slate-500">
              คู่มือขั้นตอนฉุกเฉินสำหรับครูประจำชั้นและเจ้าหน้าที่ห้องพยาบาลเมื่อเกิดเหตุทันที
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>1. สำลักอาหาร / วัตถุอุดกั้น (Heimlich)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              หากเด็กไม่สามารถไอหรือพูดได้ ยืนด้านหลังเด็ก โอบรอบเอว กำหมัดวางเหนือสะดือใต้ลิ้นปี่ ดันเข้าและขึ้นพร้อมกันอย่างรวดเร็ว โทร 1669 ทันที
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>2. บาดเจ็บข้อเท้าแพลง / หกล้ม (R.I.C.E.)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              <strong>Rest:</strong> พักการเคลื่อนไหว • <strong>Ice:</strong> ประคบเย็น 15-20 นาที • <strong>Compression:</strong> พันผ้ายืดพยุง • <strong>Elevation:</strong> ยกขาสูงกว่าระดับหัวใจ
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>3. นิ้วหนีบประตู / ฟกช้ำมีแผล</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              ล้างน้ำสะอาด กดห้ามเลือดด้วยผ้าก๊อซปลอดเชื้อ ประคบเย็นเพื่อลดอาการบวมปวด หากปลายนิ้วผิดรูป เล็บห้อเลือดหนา ให้ส่งพบแพทย์เพื่อเอกซเรย์
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
