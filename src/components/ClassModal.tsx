import React, { useState, useEffect } from 'react';
import { X, GraduationCap, AlertCircle } from 'lucide-react';
import { ClassRoom } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }) => void;
  editingClass?: ClassRoom | null;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClass,
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<'10' | '11' | '12'>('12');
  const [schoolYear, setSchoolYear] = useState('2024 - 2025');
  const [notes, setNotes] = useState('');
  const [teacherInCharge, setTeacherInCharge] = useState('Cô Hoàng Thu Hà');
  const [targetGraduationRate, setTargetGraduationRate] = useState(100);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingClass) {
      setName(editingClass.name);
      setGrade(editingClass.grade);
      setSchoolYear(editingClass.schoolYear || '2024 - 2025');
      setNotes(editingClass.notes || '');
      setTeacherInCharge(editingClass.teacherInCharge || 'Cô Hoàng Thu Hà');
      setTargetGraduationRate(editingClass.targetGraduationRate || 100);
    } else {
      setName('');
      setGrade('12');
      setSchoolYear('2024 - 2025');
      setNotes('');
      setTeacherInCharge('Cô Hoàng Thu Hà');
      setTargetGraduationRate(100);
    }
    setError(null);
  }, [editingClass, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên lớp học!');
      return;
    }

    onSave({
      name: name.trim(),
      grade,
      schoolYear: schoolYear.trim() || '2024 - 2025',
      notes: notes.trim(),
      teacherInCharge: teacherInCharge.trim(),
      targetGraduationRate: Number(targetGraduationRate) || 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {editingClass ? 'Chỉnh sửa thông tin lớp học' : 'Tạo lớp học mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingClass
                  ? `Cập nhật thông tin cho lớp ${editingClass.name}`
                  : 'Điền thông tin lớp để quản lý danh sách học sinh và đợt chấm bài'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: 12A1 (Ban Tự nhiên), 12D1 (Ban Xã hội)..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Khối lớp <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as '10' | '11' | '12')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800"
              >
                <option value="12">Khối 12 (Ôn thi Tốt nghiệp 2025)</option>
                <option value="11">Khối 11 (Chương trình GDPT 2018)</option>
                <option value="10">Khối 10 (Cơ bản & Chuyên)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Năm học <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="2024 - 2025"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giáo viên phụ trách
              </label>
              <input
                type="text"
                value={teacherInCharge}
                onChange={(e) => setTeacherInCharge(e.target.value)}
                placeholder="VD: Cô Hoàng Thu Hà"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mục tiêu tốt nghiệp (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetGraduationRate}
                onChange={(e) => setTargetGraduationRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú về lớp học
            </label>
            <textarea
              rows={3}
              placeholder="VD: Lớp định hướng thi khối D01, chú trọng rèn kỹ năng viết đoạn NLXH 200 chữ và nghị luận văn học nâng cao..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
