import React, { useState } from 'react';
import {
  Bandage,
  Thermometer,
  ShieldAlert,
  Apple,
  PhoneForwarded,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  HeartPulse,
  Info,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useInfirmary } from '../context/InfirmaryContext';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onNavigate: (tab: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onNavigate }) => {
  const { services, addService, updateService, deleteService } = useInfirmary();
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<number>(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // New service form state
  const [newName, setNewName] = useState('');
  const [newEng, setNewEng] = useState('');
  const [newIcon, setNewIcon] = useState('🩺');
  const [newTag, setNewTag] = useState('บริการใหม่');
  const [newDesc, setNewDesc] = useState('');
  const [newExamples, setNewExamples] = useState('');
  const [newEquipment, setNewEquipment] = useState('');
  const [newProcedure, setNewProcedure] = useState('');

  const current = services[selectedServiceIndex] || services[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const srv: ServiceItem = {
      id: `srv-${Date.now()}`,
      name: newName.trim(),
      english: newEng.trim() || 'School Service',
      icon: newIcon.trim() || '🩺',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tag: newTag.trim() || 'พร้อมให้บริการ',
      examples: newExamples.split(',').map((s) => s.trim()).filter(Boolean),
      description: newDesc.trim() || newName.trim(),
      equipment: newEquipment.split(',').map((s) => s.trim()).filter(Boolean),
      procedure: newProcedure.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    addService(srv);
    setIsAddOpen(false);
    setNewName('');
    setNewDesc('');
    setNewExamples('');
    setNewEquipment('');
    setNewProcedure('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    updateService(editingService);
    setEditingService(null);
  };

  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (services.length <= 1) {
      setAlertMsg('ต้องมีบริการคงไว้อย่างน้อย 1 รายการครับ');
      return;
    }
    setServiceToDelete(id);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      deleteService(serviceToDelete);
      setSelectedServiceIndex(0);
      setServiceToDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2A9D8F] bg-[#E8F6F7] px-3 py-1 rounded-full">
          COMPREHENSIVE SERVICES
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          หมวดหมู่บริการห้องพยาบาล
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          โรงเรียนวัดใหม่อมตรส จัดการบริการสุขภาพครบวงจร ปรับแก้ไขและลบได้ Real Time ({services.length} หมวด)
        </p>

        <div className="pt-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มหมวดบริการใหม่</span>
          </button>
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv, idx) => {
          const isSelected = selectedServiceIndex === idx;
          return (
            <div
              key={srv.id}
              onClick={() => setSelectedServiceIndex(idx)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer text-left relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white border-[#2A9D8F] shadow-lg ring-2 ring-[#2A9D8F]/20'
                  : 'bg-white/80 hover:bg-white border-slate-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F6F7] flex items-center justify-center text-2xl shadow-inner">
                    {srv.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${srv.badgeColor}`}>
                      {srv.tag}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingService(srv);
                      }}
                      className="p-1 text-slate-400 hover:text-[#2A9D8F] hover:bg-slate-100 rounded-md transition-colors"
                      title="แก้ไขบริการ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(srv.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="ลบบริการ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5">
                  {srv.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mb-3">
                  {srv.english}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {srv.description}
                </p>

                {/* Example pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {srv.examples.slice(0, 3).map((ex, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      • {ex}
                    </span>
                  ))}
                  {srv.examples.length > 3 && (
                    <span className="text-[10px] text-slate-400 px-1 py-0.5">
                      +{srv.examples.length - 3} อาการ
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2A9D8F]">
                <span>ดูขั้นตอน & อุปกรณ์</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Service Deep-dive Showcase */}
      {current && (
        <div className="bg-white rounded-3xl border border-[#2A9D8F]/20 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2.5 rounded-2xl bg-[#E8F6F7]">{current.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{current.name}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                    {current.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{current.english}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingService(current)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>แก้ไขบริการนี้</span>
              </button>

              <button
                onClick={() => onNavigate('request')}
                className="px-5 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#21867a] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>แจ้งขอรับบริการนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left: Procedures */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2A9D8F]" />
                <span>ขั้นตอนการดำเนินงานมาตรฐาน</span>
              </h4>
              <div className="space-y-2.5">
                {current.procedure.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2A9D8F] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Equipment & Medical guarantees */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>เวชภัณฑ์และอุปกรณ์ประจำจุด (ชั้น 2)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {current.equipment.map((eq, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#E8F6F7]/60 text-xs text-slate-700 border border-[#2A9D8F]/15 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2A9D8F] shrink-0" />
                      <span>{eq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety notice banner */}
              <div className="p-4 rounded-2xl bg-[#FFF4C2]/50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>มาตรฐานความปลอดภัยสำหรับเด็กประถม</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  ดูแลโดย ครูศุภฤกษ์ คุ้มจุ้ย (ครูแนะแนว/ครูเอิร์ธ) ณ ห้องพยาบาล อาคาร 2 ชั้น 2
                  ตรวจสอบประวัติการแพ้ยาของนักเรียนทุกครั้งก่อนให้การดูแล
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Service Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                เพิ่มหมวดบริการห้องพยาบาลใหม่
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อบริการ (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ตรวจสุขภาพประจำปี"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น Annual Health Checkup"
                    value={newEng}
                    onChange={(e) => setNewEng(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    อิโมจิไอคอน
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 🩺 หรือ 🍎"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ป้ายกำกับ (Tag)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นัดหมายล่วงหน้า"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำอธิบายบริการ
                </label>
                <textarea
                  rows={2}
                  placeholder="อธิบายรายละเอียดการให้บริการ..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ตัวอย่างอาการ/กรณีที่ดูแล (คั่นด้วยจุลภาค ,)
                </label>
                <input
                  type="text"
                  placeholder="เช่น ตรวจสายตา, ตรวจการได้ยิน, วัดส่วนสูง"
                  value={newExamples}
                  onChange={(e) => setNewExamples(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เวชภัณฑ์และอุปกรณ์ (คั่นด้วยจุลภาค ,)
                </label>
                <input
                  type="text"
                  placeholder="เช่น แผ่นตรวจสายตา, สมุดตรวจสุขภาพ"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ขั้นตอนการดำเนินงาน (1 บรรทัดต่อ 1 ขั้นตอน)
                </label>
                <textarea
                  rows={3}
                  placeholder="1. ลงทะเบียน&#10;2. ตรวจประเมิน&#10;3. บันทึกผล"
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกบริการใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                แก้ไขหมวดบริการ: {editingService.name}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อบริการ
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.name}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    value={editingService.english}
                    onChange={(e) => setEditingService({ ...editingService, english: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  คำอธิบายบริการ
                </label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ตัวอย่างกรณีที่ดูแล (คั่นด้วยจุลภาค ,)
                </label>
                <input
                  type="text"
                  value={editingService.examples.join(', ')}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      examples: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2A9D8F] text-white font-semibold hover:bg-[#21867a]"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Service */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">ยืนยันการลบหมวดบริการ</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              คุณต้องการลบหมวดบริการนี้ใช่หรือไม่? ข้อมูลจะถูกลบออกจากระบบทันที
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteService}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-left space-y-4">
            <h3 className="text-base font-bold text-slate-900">แจ้งเตือน</h3>
            <p className="text-xs sm:text-sm text-slate-600">{alertMsg}</p>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAlertMsg(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2A9D8F] hover:bg-[#21867a]"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
