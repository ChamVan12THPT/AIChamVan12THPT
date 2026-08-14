import React, { useState, useEffect } from 'react';
import { X, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { Student, ClassRoom } from '../types';
import { classStudentService } from '../services/classStudentService';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: {
    studentCode: string;
    fullName: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    classId: string;
    notes?: string;
  }) => void;
  editingStudent?: Student | null;
  classes: ClassRoom[];
  defaultClassId?: string;
  existingStudents: Student[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudent,
  classes,
  defaultClassId,
  existingStudents,
}) => {
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nữ');
  const [classId, setClassId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingStudent) {
      setStudentCode(editingStudent.studentCode || editingStudent.code || '');
      setFullName(editingStudent.fullName || editingStudent.name || '');
      setGender(editingStudent.gender || 'Nữ');
      setClassId(editingStudent.classId || (classes[0] ? classes[0].id : ''));
      setNotes(editingStudent.notes || '');
    } else {
      const selectedClassId = defaultClassId || (classes[0] ? classes[0].id : '');
      setClassId(selectedClassId);
      setFullName('');
      setGender('Nữ');
      setNotes('');

      // Tự sinh mã học sinh dựa trên lớp
      const targetClass = classes.find((c) => c.id === selectedClassId);
      if (targetClass) {
        const nextCode = classStudentService.generateNextStudentCode(targetClass, existingStudents);
        setStudentCode(nextCode);
      } else {
        setStudentCode('');
      }
    }
    setError(null);
  }, [editingStudent, isOpen, defaultClassId, classes]);

  if (!isOpen) return null;

  const handleGenerateCode = () => {
    const targetClass = classes.find((c) => c.id === classId);
    if (targetClass) {
      const nextCode = classStudentService.generateNextStudentCode(targetClass, existingStudents);
      setStudentCode(nextCode);
    }
  };

  const handleClassChange = (newClassId: string) => {
    setClassId(newClassId);
    if (!editingStudent) {
      const targetClass = classes.find((c) => c.id === newClassId);
      if (targetClass) {
        const nextCode = classStudentService.generateNextStudentCode(targetClass, existingStudents);
        setStudentCode(nextCode);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên học sinh!');
      return;
    }
    if (!studentCode.trim()) {
      setError('Vui lòng nhập mã học sinh!');
      return;
    }
    if (!classId) {
      setError('Vui lòng chọn lớp học!');
      return;
    }

    try {
      onSave({
        studentCode: studentCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        gender,
        classId,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin học sinh!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingStudent
                  ? `Cập nhật hồ sơ học sinh ${editingStudent.fullName || editingStudent.name}`
                  : 'Nhập thông tin học sinh để lưu trữ bài làm và theo dõi tiến độ chấm văn'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Thảo Linh, Trần Gia Bảo..."
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
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
                Mã học sinh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: HS12D1-01"
                  value={studentCode}
                  onChange={(e) => {
                    setStudentCode(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-3.5 pr-8 py-2 text-sm uppercase font-mono bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                  required
                />
                <button
                  type="button"
                  title="Tự động tạo mã theo lớp"
                  onClick={handleGenerateCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giới tính <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Nam' | 'Nữ' | 'Khác')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800"
              >
                <option value="Nữ">Nữ</option>
                <option value="Nam">Nam</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lớp học <span className="text-rose-500">*</span>
            </label>
            <select
              value={classId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-800"
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} (Khối {cls.grade} • {cls.schoolYear})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú đặc điểm học sinh
            </label>
            <textarea
              rows={3}
              placeholder="VD: Học sinh có tư duy phản biện tốt trong bài NLXH, cần chú ý rèn chữ viết và chính tả..."
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
              {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
