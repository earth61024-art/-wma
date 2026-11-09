import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SchoolInfoData,
  StudentProfile,
  GradeLevel,
  VisitRecord,
  HealthNotice,
  ServiceItem,
  HealthTopic,
  EmergencyContactItem,
  EmergencyGuide,
  EmergencyStepItem,
  ParentSubmission,
} from '../types';
import {
  INITIAL_SCHOOL_INFO,
  OFFICIAL_STUDENTS,
  INITIAL_VISIT_RECORDS,
  INITIAL_NOTICES,
  INITIAL_SERVICES,
  HEALTH_TOPICS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_EMERGENCY_GUIDES,
  INITIAL_EMERGENCY_STEPS,
} from '../data/mockData';
import {
  db,
  handleFirestoreError,
  OperationType,
} from '../services/firebaseService';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';

interface InfirmaryContextType {
  // Firebase State
  isFirebaseConnected: boolean;
  isFirebaseSyncing: boolean;
  firebaseProjectId: string;
  syncToFirebase: () => Promise<void>;

  // School Info
  schoolInfo: SchoolInfoData;
  updateSchoolInfo: (info: Partial<SchoolInfoData>) => void;
  updateAcademicYear: (year: string, semester?: string) => Promise<void>;

  // Student Roster
  students: StudentProfile[];
  addStudent: (student: StudentProfile) => void;
  updateStudent: (student: StudentProfile) => void;
  updateStudentBloodType: (studentId: string, bloodType: 'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ') => void;
  deleteStudent: (id: string) => void;
  promoteStudentsToNextYear: (newAcademicYear: string) => Promise<{ promoted: number; graduated: number }>;
  batchUpdateStudents: (updatedStudents: StudentProfile[]) => Promise<void>;

  // Visit Records
  records: VisitRecord[];
  addRecord: (record: VisitRecord) => void;
  updateRecord: (record: VisitRecord) => void;
  deleteRecord: (id: string) => void;

  // Notices
  notices: HealthNotice[];
  addNotice: (notice: HealthNotice) => void;
  updateNotice: (notice: HealthNotice) => void;
  deleteNotice: (id: string) => void;

  // Services
  services: ServiceItem[];
  addService: (service: ServiceItem) => void;
  updateService: (service: ServiceItem) => void;
  deleteService: (id: string) => void;

  // Health Knowledge Topics
  topics: HealthTopic[];
  addTopic: (topic: HealthTopic) => void;
  updateTopic: (topic: HealthTopic) => void;
  deleteTopic: (id: string) => void;

  // Emergency Incident System (Contacts, Steps, Guides)
  emergencyContacts: EmergencyContactItem[];
  addEmergencyContact: (contact: EmergencyContactItem) => void;
  updateEmergencyContact: (contact: EmergencyContactItem) => void;
  deleteEmergencyContact: (id: string) => void;

  emergencySteps: EmergencyStepItem[];
  addEmergencyStep: (step: EmergencyStepItem) => void;
  updateEmergencyStep: (step: EmergencyStepItem) => void;
  deleteEmergencyStep: (id: string) => void;

  emergencyGuides: EmergencyGuide[];
  addEmergencyGuide: (guide: EmergencyGuide) => void;
  updateEmergencyGuide: (guide: EmergencyGuide) => void;
  deleteEmergencyGuide: (id: string) => void;

  resetEmergencyToDefaults: () => void;

  // Parent Submissions
  parentForms: ParentSubmission[];
  addParentForm: (form: ParentSubmission) => void;
  deleteParentForm: (id: string) => void;

  // Global reset helper to restore defaults
  resetToDefaults: () => void;
}

const InfirmaryContext = createContext<InfirmaryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  INFO: 'watmai_school_info_v2',
  STUDENTS: 'watmai_students_roster_v2',
  RECORDS: 'watmai_visit_records_v2',
  NOTICES: 'watmai_health_notices_v2',
  SERVICES: 'watmai_services_list_v2',
  TOPICS: 'watmai_health_topics_v2',
  EMERGENCY: 'watmai_emergency_contacts_v2',
  EMERGENCY_STEPS: 'watmai_emergency_steps_v2',
  EMERGENCY_GUIDES: 'watmai_emergency_guides_v2',
  PARENT_FORMS: 'watmai_parent_forms_v2',
};

// Safe Firestore Document ID helper
const sanitizeDocId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
};

export const InfirmaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const firebaseProjectId = 'gen-lang-client-0235531774';
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);

  // 1. School Info
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfoData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INFO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phoneSchool === '02-282-3498' || !parsed.phoneSchool) {
          parsed.phoneSchool = '02-281-7670';
        }
        if (!parsed.affiliation || parsed.affiliation.includes('สพป.')) {
          parsed.affiliation = 'สํานักงานเขตพระนคร กรุงเทพมหานคร สังกัด กทม.';
        }
        if (!parsed.academicYear) {
          parsed.academicYear = '2569';
        }
        if (!parsed.semester) {
          parsed.semester = 'ภาคเรียนที่ 1';
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SCHOOL_INFO;
  });

  // 2. Student Roster (55 official students)
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed: StudentProfile[] = JSON.parse(saved);
        return parsed.map((s) => ({
          ...s,
          academicYear: s.academicYear || '2569',
          status: s.status || 'กำลังศึกษา',
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return OFFICIAL_STUDENTS.map((s) => ({
      ...s,
      academicYear: s.academicYear || '2569',
      status: s.status || 'กำลังศึกษา',
    }));
  });

  // 3. Visit Records
  const [records, setRecords] = useState<VisitRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_VISIT_RECORDS;
  });

  // 4. Notices
  const [notices, setNotices] = useState<HealthNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_NOTICES;
  });

  // 5. Services
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SERVICES;
  });

  // 6. Topics
  const [topics, setTopics] = useState<HealthTopic[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return HEALTH_TOPICS;
  });

  // 7. Emergency Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY);
      if (saved) {
        const parsed: EmergencyContactItem[] = JSON.parse(saved);
        return parsed.map((c) =>
          c.number === '02-282-3498' ? { ...c, number: '02-281-7670' } : c
        );
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMERGENCY_CONTACTS;
  });

  // 8. Emergency Flow Steps (7 Steps)
  const [emergencySteps, setEmergencySteps] = useState<EmergencyStepItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY_STEPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMERGENCY_STEPS;
  });

  // 9. Emergency Guides (First Aid Cheat Sheets)
  const [emergencyGuides, setEmergencyGuides] = useState<EmergencyGuide[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMERGENCY_GUIDES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_EMERGENCY_GUIDES;
  });

  // 10. Parent Forms
  const [parentForms, setParentForms] = useState<ParentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARENT_FORMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INFO, JSON.stringify(schoolInfo));
  }, [schoolInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY, JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_STEPS, JSON.stringify(emergencySteps));
  }, [emergencySteps]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_GUIDES, JSON.stringify(emergencyGuides));
  }, [emergencyGuides]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARENT_FORMS, JSON.stringify(parentForms));
  }, [parentForms]);

  // Real-time Firestore synchronization
  useEffect(() => {
    let unsubSchool: (() => void) | undefined;
    let unsubStudents: (() => void) | undefined;
    let unsubRecords: (() => void) | undefined;
    let unsubNotices: (() => void) | undefined;
    let unsubParent: (() => void) | undefined;
    let unsubContacts: (() => void) | undefined;
    let unsubSteps: (() => void) | undefined;
    let unsubGuides: (() => void) | undefined;

    try {
      // 1. School Info Listener
      const schoolDocRef = doc(db, 'school_info', 'main');
      unsubSchool = onSnapshot(
        schoolDocRef,
        (snap) => {
          if (snap.exists()) {
            setSchoolInfo((prev) => ({ ...prev, ...(snap.data() as SchoolInfoData) }));
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'school_info/main');
        }
      );

      // 2. Students Collection Listener
      const studentsColRef = collection(db, 'students');
      unsubStudents = onSnapshot(
        studentsColRef,
        (snap) => {
          if (!snap.empty) {
            const list: StudentProfile[] = [];
            snap.forEach((d) => list.push(d.data() as StudentProfile));
            setStudents(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'students');
        }
      );

      // 3. Visit Records Collection Listener
      const recordsColRef = collection(db, 'visit_records');
      unsubRecords = onSnapshot(
        recordsColRef,
        (snap) => {
          if (!snap.empty) {
            const list: VisitRecord[] = [];
            snap.forEach((d) => list.push(d.data() as VisitRecord));
            list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            setRecords(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'visit_records');
        }
      );

      // 4. Health Notices Collection Listener
      const noticesColRef = collection(db, 'health_notices');
      unsubNotices = onSnapshot(
        noticesColRef,
        (snap) => {
          if (!snap.empty) {
            const list: HealthNotice[] = [];
            snap.forEach((d) => list.push(d.data() as HealthNotice));
            setNotices(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'health_notices');
        }
      );

      // 5. Parent Submissions Listener
      const parentColRef = collection(db, 'parent_submissions');
      unsubParent = onSnapshot(
        parentColRef,
        (snap) => {
          if (!snap.empty) {
            const list: ParentSubmission[] = [];
            snap.forEach((d) => list.push(d.data() as ParentSubmission));
            setParentForms(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'parent_submissions');
        }
      );

      // 6. Emergency Contacts Listener
      const contactsColRef = collection(db, 'emergency_contacts');
      unsubContacts = onSnapshot(
        contactsColRef,
        (snap) => {
          if (!snap.empty) {
            const list: EmergencyContactItem[] = [];
            snap.forEach((d) => list.push(d.data() as EmergencyContactItem));
            setEmergencyContacts(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'emergency_contacts');
        }
      );

      // 7. Emergency Steps Listener
      const stepsColRef = collection(db, 'emergency_steps');
      unsubSteps = onSnapshot(
        stepsColRef,
        (snap) => {
          if (!snap.empty) {
            const list: EmergencyStepItem[] = [];
            snap.forEach((d) => list.push(d.data() as EmergencyStepItem));
            list.sort((a, b) => a.step - b.step);
            setEmergencySteps(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'emergency_steps');
        }
      );

      // 8. Emergency Guides Listener
      const guidesColRef = collection(db, 'emergency_guides');
      unsubGuides = onSnapshot(
        guidesColRef,
        (snap) => {
          if (!snap.empty) {
            const list: EmergencyGuide[] = [];
            snap.forEach((d) => list.push(d.data() as EmergencyGuide));
            setEmergencyGuides(list);
            setIsFirebaseConnected(true);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'emergency_guides');
        }
      );
    } catch (err) {
      console.warn('Firestore initial listener setup warning:', err);
    }

    return () => {
      if (unsubSchool) unsubSchool();
      if (unsubStudents) unsubStudents();
      if (unsubRecords) unsubRecords();
      if (unsubNotices) unsubNotices();
      if (unsubParent) unsubParent();
      if (unsubContacts) unsubContacts();
      if (unsubSteps) unsubSteps();
      if (unsubGuides) unsubGuides();
    };
  }, []);

  // Initial Cloud Seed Check
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'students'));
        if (snap.empty && OFFICIAL_STUDENTS.length > 0) {
          console.log('Seeding initial students and school info to Firestore...');
          setIsFirebaseSyncing(true);
          await setDoc(doc(db, 'school_info', 'main'), schoolInfo);
          for (const std of OFFICIAL_STUDENTS) {
            await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std);
          }
          for (const rec of INITIAL_VISIT_RECORDS) {
            await setDoc(doc(db, 'visit_records', sanitizeDocId(rec.id)), rec);
          }
          for (const n of INITIAL_NOTICES) {
            await setDoc(doc(db, 'health_notices', sanitizeDocId(n.id)), n);
          }
          for (const c of INITIAL_EMERGENCY_CONTACTS) {
            await setDoc(doc(db, 'emergency_contacts', sanitizeDocId(c.id)), c);
          }
          for (const s of INITIAL_EMERGENCY_STEPS) {
            await setDoc(doc(db, 'emergency_steps', sanitizeDocId(s.id)), s);
          }
          for (const g of INITIAL_EMERGENCY_GUIDES) {
            await setDoc(doc(db, 'emergency_guides', sanitizeDocId(g.id)), g);
          }
          setIsFirebaseConnected(true);
          setIsFirebaseSyncing(false);
        }
      } catch (err) {
        console.warn('Initial Firestore seed notice:', err);
        setIsFirebaseSyncing(false);
      }
    };

    checkAndSeed();
  }, []);

  // Manual Full Sync to Firebase
  const syncToFirebase = useCallback(async () => {
    setIsFirebaseSyncing(true);
    try {
      await setDoc(doc(db, 'school_info', 'main'), schoolInfo);

      for (const std of students) {
        await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std);
      }

      for (const rec of records) {
        await setDoc(doc(db, 'visit_records', sanitizeDocId(rec.id)), rec);
      }

      for (const n of notices) {
        await setDoc(doc(db, 'health_notices', sanitizeDocId(n.id)), n);
      }

      for (const form of parentForms) {
        await setDoc(doc(db, 'parent_submissions', sanitizeDocId(form.id)), form);
      }

      for (const c of emergencyContacts) {
        await setDoc(doc(db, 'emergency_contacts', sanitizeDocId(c.id)), c);
      }

      for (const s of emergencySteps) {
        await setDoc(doc(db, 'emergency_steps', sanitizeDocId(s.id)), s);
      }

      for (const g of emergencyGuides) {
        await setDoc(doc(db, 'emergency_guides', sanitizeDocId(g.id)), g);
      }

      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'syncAll');
    } finally {
      setIsFirebaseSyncing(false);
    }
  }, [schoolInfo, students, records, notices, parentForms, emergencyContacts, emergencySteps, emergencyGuides]);

  // Methods with optimistic local update + Firestore cloud persistence
  const updateSchoolInfo = async (info: Partial<SchoolInfoData>) => {
    const updated = { ...schoolInfo, ...info };
    setSchoolInfo(updated);
    try {
      await setDoc(doc(db, 'school_info', 'main'), updated, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'school_info/main');
    }
  };

  const addStudent = async (std: StudentProfile) => {
    setStudents((prev) => [std, ...prev]);
    try {
      await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `students/${std.id}`);
    }
  };

  const updateStudent = async (std: StudentProfile) => {
    setStudents((prev) => prev.map((s) => (s.id === std.id ? std : s)));
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === std.studentId || r.studentName === std.fullName
          ? {
              ...r,
              studentName: std.fullName,
              grade: std.grade,
              room: std.room,
              gender: std.gender,
              bloodType: std.bloodType,
              parentPhone: std.parentPhone || r.parentPhone,
            }
          : r
      )
    );
    try {
      await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${std.id}`);
    }
  };

  const updateStudentBloodType = async (
    studentId: string,
    bloodType: 'A' | 'B' | 'AB' | 'O' | 'ไม่ระบุ'
  ) => {
    let targetStudent: StudentProfile | undefined;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId || s.id === studentId) {
          targetStudent = { ...s, bloodType };
          return targetStudent;
        }
        return s;
      })
    );

    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, bloodType } : r))
    );

    if (targetStudent) {
      try {
        await setDoc(
          doc(db, 'students', sanitizeDocId(targetStudent.id)),
          targetStudent,
          { merge: true }
        );
        setIsFirebaseConnected(true);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `students/${targetStudent.id}`);
      }
    }
  };

  const updateAcademicYear = async (year: string, semester?: string) => {
    const updated: SchoolInfoData = {
      ...schoolInfo,
      academicYear: year,
      semester: semester || schoolInfo.semester || 'ภาคเรียนที่ 1',
    };
    setSchoolInfo(updated);
    try {
      await setDoc(doc(db, 'school_info', 'main'), updated, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'school_info/main');
    }
  };

  const promoteStudentsToNextYear = async (
    newAcademicYear: string
  ): Promise<{ promoted: number; graduated: number }> => {
    let promotedCount = 0;
    let graduatedCount = 0;

    const nextGrades: Record<string, GradeLevel | 'GRADUATED'> = {
      'อ.1': 'อ.2',
      'อ.2': 'อ.3',
      'อ.3': 'ป.1',
      'ป.1': 'ป.2',
      'ป.2': 'ป.3',
      'ป.3': 'ป.4',
      'ป.4': 'ป.5',
      'ป.5': 'ป.6',
      'ป.6': 'GRADUATED',
    };

    const currentYear = schoolInfo.academicYear || '2569';

    // Source students to promote: take students from the most recent/current academic year
    // If students don't have academicYear, they are assumed to be currentYear
    let sourceStudents = students.filter(
      (s) => (s.academicYear || '2569') === currentYear
    );

    // If sourceStudents is empty for currentYear, fallback to any active students
    if (sourceStudents.length === 0) {
      sourceStudents = students.filter((s) => s.status !== 'จบการศึกษา' && s.status !== 'ย้ายสถานศึกษา');
    }

    const newPromotedStudents: StudentProfile[] = [];

    for (const s of sourceStudents) {
      if (s.status === 'ย้ายสถานศึกษา') {
        continue;
      }
      const next = nextGrades[s.grade];
      if (s.grade === 'ป.6' || next === 'GRADUATED') {
        graduatedCount++;
        newPromotedStudents.push({
          ...s,
          id: `std-${s.studentId || s.id}-${newAcademicYear}`,
          academicYear: newAcademicYear,
          status: 'จบการศึกษา',
        });
      } else if (next) {
        promotedCount++;
        newPromotedStudents.push({
          ...s,
          id: `std-${s.studentId || s.id}-${newAcademicYear}`,
          grade: next as GradeLevel,
          academicYear: newAcademicYear,
          status: 'กำลังศึกษา',
        });
      }
    }

    // Keep all existing students from previous years so their data remains untouched!
    const existingOtherYearsStudents = students.filter(
      (s) => (s.academicYear || '2569') !== newAcademicYear
    );

    const updatedStudents = [...existingOtherYearsStudents, ...newPromotedStudents];
    setStudents(updatedStudents);

    const updatedInfo: SchoolInfoData = {
      ...schoolInfo,
      academicYear: newAcademicYear,
      semester: 'ภาคเรียนที่ 1',
    };
    setSchoolInfo(updatedInfo);

    try {
      await setDoc(doc(db, 'school_info', 'main'), updatedInfo, { merge: true });
      for (const std of newPromotedStudents) {
        await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std, { merge: true });
      }
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'students/promote');
    }

    return { promoted: promotedCount, graduated: graduatedCount };
  };

  const batchUpdateStudents = async (updatedList: StudentProfile[]) => {
    setStudents(updatedList);
    try {
      for (const std of updatedList) {
        await setDoc(doc(db, 'students', sanitizeDocId(std.id)), std, { merge: true });
      }
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'students/batch');
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'students', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const addRecord = async (rec: VisitRecord) => {
    setRecords((prev) => [rec, ...prev]);
    try {
      await setDoc(doc(db, 'visit_records', sanitizeDocId(rec.id)), rec);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `visit_records/${rec.id}`);
    }
  };

  const updateRecord = async (rec: VisitRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
    // Interconnect: sync student demographic and bloodType changes to student roster
    if (rec.studentId || rec.studentName) {
      setStudents((prev) =>
        prev.map((s) => {
          if ((rec.studentId && s.studentId === rec.studentId) || (rec.studentName && s.fullName === rec.studentName)) {
            const updatedStd: StudentProfile = {
              ...s,
              fullName: rec.studentName || s.fullName,
              grade: rec.grade || s.grade,
              room: rec.room || s.room,
              gender: rec.gender || s.gender,
              bloodType: rec.bloodType !== undefined ? rec.bloodType : s.bloodType,
              parentPhone: rec.parentPhone || s.parentPhone,
            };
            setDoc(doc(db, 'students', sanitizeDocId(s.id)), updatedStd, { merge: true }).catch((err) =>
              console.warn('Sync student from record update error:', err)
            );
            return updatedStd;
          }
          return s;
        })
      );
    }
    try {
      await setDoc(doc(db, 'visit_records', sanitizeDocId(rec.id)), rec, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `visit_records/${rec.id}`);
    }
  };

  const deleteRecord = async (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'visit_records', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `visit_records/${id}`);
    }
  };

  const addNotice = async (notice: HealthNotice) => {
    setNotices((prev) => [notice, ...prev]);
    try {
      await setDoc(doc(db, 'health_notices', sanitizeDocId(notice.id)), notice);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `health_notices/${notice.id}`);
    }
  };

  const updateNotice = async (notice: HealthNotice) => {
    setNotices((prev) => prev.map((n) => (n.id === notice.id ? notice : n)));
    try {
      await setDoc(doc(db, 'health_notices', sanitizeDocId(notice.id)), notice, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `health_notices/${notice.id}`);
    }
  };

  const deleteNotice = async (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteDoc(doc(db, 'health_notices', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `health_notices/${id}`);
    }
  };

  const addService = (srv: ServiceItem) => {
    setServices((prev) => [...prev, srv]);
  };

  const updateService = (srv: ServiceItem) => {
    setServices((prev) => prev.map((s) => (s.id === srv.id ? srv : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const addTopic = (tpc: HealthTopic) => {
    setTopics((prev) => [...prev, tpc]);
  };

  const updateTopic = (tpc: HealthTopic) => {
    setTopics((prev) => prev.map((t) => (t.id === tpc.id ? tpc : t)));
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  // Emergency Contacts
  const addEmergencyContact = async (c: EmergencyContactItem) => {
    setEmergencyContacts((prev) => [...prev, c]);
    try {
      await setDoc(doc(db, 'emergency_contacts', sanitizeDocId(c.id)), c);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `emergency_contacts/${c.id}`);
    }
  };

  const updateEmergencyContact = async (c: EmergencyContactItem) => {
    setEmergencyContacts((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    try {
      await setDoc(doc(db, 'emergency_contacts', sanitizeDocId(c.id)), c, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `emergency_contacts/${c.id}`);
    }
  };

  const deleteEmergencyContact = async (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
    try {
      await deleteDoc(doc(db, 'emergency_contacts', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `emergency_contacts/${id}`);
    }
  };

  // Emergency Flow Steps
  const addEmergencyStep = async (step: EmergencyStepItem) => {
    const updated = [...emergencySteps, step].sort((a, b) => a.step - b.step);
    setEmergencySteps(updated);
    try {
      await setDoc(doc(db, 'emergency_steps', sanitizeDocId(step.id)), step);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `emergency_steps/${step.id}`);
    }
  };

  const updateEmergencyStep = async (step: EmergencyStepItem) => {
    const updated = emergencySteps
      .map((s) => (s.id === step.id ? step : s))
      .sort((a, b) => a.step - b.step);
    setEmergencySteps(updated);
    try {
      await setDoc(doc(db, 'emergency_steps', sanitizeDocId(step.id)), step, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `emergency_steps/${step.id}`);
    }
  };

  const deleteEmergencyStep = async (id: string) => {
    const filtered = emergencySteps.filter((s) => s.id !== id);
    // Re-index remaining steps
    const reindexed = filtered.map((s, idx) => ({ ...s, step: idx + 1 }));
    setEmergencySteps(reindexed);
    try {
      await deleteDoc(doc(db, 'emergency_steps', sanitizeDocId(id)));
      // Update remaining reindexed steps
      for (const s of reindexed) {
        await setDoc(doc(db, 'emergency_steps', sanitizeDocId(s.id)), s, { merge: true });
      }
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `emergency_steps/${id}`);
    }
  };

  // Emergency Guides
  const addEmergencyGuide = async (guide: EmergencyGuide) => {
    setEmergencyGuides((prev) => [...prev, guide]);
    try {
      await setDoc(doc(db, 'emergency_guides', sanitizeDocId(guide.id)), guide);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `emergency_guides/${guide.id}`);
    }
  };

  const updateEmergencyGuide = async (guide: EmergencyGuide) => {
    setEmergencyGuides((prev) => prev.map((g) => (g.id === guide.id ? guide : g)));
    try {
      await setDoc(doc(db, 'emergency_guides', sanitizeDocId(guide.id)), guide, { merge: true });
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `emergency_guides/${guide.id}`);
    }
  };

  const deleteEmergencyGuide = async (id: string) => {
    setEmergencyGuides((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteDoc(doc(db, 'emergency_guides', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `emergency_guides/${id}`);
    }
  };

  // Reset Emergency System to Defaults
  const resetEmergencyToDefaults = async () => {
    setEmergencySteps(INITIAL_EMERGENCY_STEPS);
    setEmergencyGuides(INITIAL_EMERGENCY_GUIDES);
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
    try {
      for (const s of INITIAL_EMERGENCY_STEPS) {
        await setDoc(doc(db, 'emergency_steps', sanitizeDocId(s.id)), s);
      }
      for (const g of INITIAL_EMERGENCY_GUIDES) {
        await setDoc(doc(db, 'emergency_guides', sanitizeDocId(g.id)), g);
      }
      for (const c of INITIAL_EMERGENCY_CONTACTS) {
        await setDoc(doc(db, 'emergency_contacts', sanitizeDocId(c.id)), c);
      }
      setIsFirebaseConnected(true);
    } catch (err) {
      console.warn('Sync emergency defaults to firestore error:', err);
    }
  };

  const addParentForm = async (form: ParentSubmission) => {
    setParentForms((prev) => [form, ...prev]);
    if (form.studentName) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.fullName === form.studentName || s.studentId === form.studentId) {
            const updatedStd = {
              ...s,
              bloodType: (form.bloodType as any) || s.bloodType,
              congenitalDisease: form.congenital || s.congenitalDisease,
              allergies: form.allergies || s.allergies,
              parentName: form.parentName || s.parentName,
              parentPhone: form.phone || s.parentPhone,
            };
            setDoc(doc(db, 'students', sanitizeDocId(s.id)), updatedStd, { merge: true }).catch(
              (err) => console.warn('Sync student update from parent form err:', err)
            );
            return updatedStd;
          }
          return s;
        })
      );
    }
    try {
      await setDoc(doc(db, 'parent_submissions', sanitizeDocId(form.id)), form);
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `parent_submissions/${form.id}`);
    }
  };

  const deleteParentForm = async (id: string) => {
    setParentForms((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteDoc(doc(db, 'parent_submissions', sanitizeDocId(id)));
      setIsFirebaseConnected(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `parent_submissions/${id}`);
    }
  };

  const resetToDefaults = () => {
    setSchoolInfo(INITIAL_SCHOOL_INFO);
    setStudents(OFFICIAL_STUDENTS);
    setRecords(INITIAL_VISIT_RECORDS);
    setNotices(INITIAL_NOTICES);
    setServices(INITIAL_SERVICES);
    setTopics(HEALTH_TOPICS);
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
    setEmergencySteps(INITIAL_EMERGENCY_STEPS);
    setEmergencyGuides(INITIAL_EMERGENCY_GUIDES);
    setParentForms([]);
  };

  return (
    <InfirmaryContext.Provider
      value={{
        isFirebaseConnected,
        isFirebaseSyncing,
        firebaseProjectId,
        syncToFirebase,
        schoolInfo,
        updateSchoolInfo,
        updateAcademicYear,
        students,
        addStudent,
        updateStudent,
        updateStudentBloodType,
        deleteStudent,
        promoteStudentsToNextYear,
        batchUpdateStudents,
        records,
        addRecord,
        updateRecord,
        deleteRecord,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        services,
        addService,
        updateService,
        deleteService,
        topics,
        addTopic,
        updateTopic,
        deleteTopic,
        emergencyContacts,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        emergencySteps,
        addEmergencyStep,
        updateEmergencyStep,
        deleteEmergencyStep,
        emergencyGuides,
        addEmergencyGuide,
        updateEmergencyGuide,
        deleteEmergencyGuide,
        resetEmergencyToDefaults,
        parentForms,
        addParentForm,
        deleteParentForm,
        resetToDefaults,
      }}
    >
      {children}
    </InfirmaryContext.Provider>
  );
};

export const useInfirmary = () => {
  const context = useContext(InfirmaryContext);
  if (!context) {
    throw new Error('useInfirmary must be used within an InfirmaryProvider');
  }
  return context;
};
