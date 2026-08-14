import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { ClassRoom, ExamRubric, GradingBatch } from '../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  rubrics: ExamRubric[];
  onCreateBatch: (
    newBatch: Omit<
      GradingBatch,
      | 'id'
      | 'createdAt'
      | 'gradedByAiCount'
      | 'reviewedByTeacherCount'
      | 'averageScore'
      | 'status'
    >
  ) => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  classes,
  rubrics,
  onCreateBatch,
}) => {
  const [name, setName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedExamId, setSelectedExamId] = useState(rubrics[0]?.id || '');
  const [gradingDate, setGradingDate] = useState('2026-08-14');
  const [dueDate, setDueDate] = useState('2026-08-20');
  const [notes, setNotes] = useState('');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [semester, setSemester] = useState('Học kỳ I');
  const [sourceType, setSourceType] = useState<'class_roster' | 'upload_images' | 'paste_text'>('class_roster');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
    const selectedExam = rubrics.find((r) => r.id === selectedExamId) || rubrics[0];

    const defaultName =
      name.trim() ||
      `Đợt chấm: ${selectedExam?.title || 'Đề khảo sát'} - ${selectedClass?.name || 'Lớp'}`;

    onCreateBatch({
      name: defaultName,
      classId: selectedClass?.id || selectedClassId,
      className: selectedClass?.name || 'Lớp 12',
      examId: selectedExam?.id || selectedExamId,
      examTitle: selectedExam?.title || 'Đề khảo sát',
      gradingDate,
      dueDate,
      academicYear,
      semester,
      notes,
      totalEssays: selectedClass?.studentCount || 40,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-create-batch"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Tạo đợt chấm bài mới</h3>
              <p className="text-xs text-slate-500">
                Lựa chọn Lớp học, Đề thi / Rubric và Ngày chấm để khởi tạo đợt chấm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tên đợt chấm */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên đợt chấm bài <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-batch-name"
              type="text"
              placeholder="VD: Đề nghị luận xã hội số 03 - Lớp 12A1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Chọn Lớp & Chọn Đề thi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lớp học <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-batch-class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount || 0} học sinh)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đề thi & Rubric <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-batch-rubric"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              >
                {rubrics.map((rubric) => (
                  <option key={rubric.id} value={rubric.id}>
                    {rubric.title} ({rubric.essayType || rubric.type || '10.0đ'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngày chấm & Hạn hoàn thành */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ngày chấm</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-batch-grading-date"
                type="date"
                value={gradingDate}
                onChange={(e) => setGradingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Hạn hoàn thành chấm</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú đợt chấm
            </label>
            <textarea
              id="input-batch-notes"
              rows={2}
              placeholder="VD: Chấm khảo sát định kỳ chất lượng đầu năm, lưu ý kiểm tra kỹ dẫn chứng phần Nghị luận xã hội..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Phương thức nạp bài làm */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Khởi tạo bài nộp cho đợt chấm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('class_roster')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  sourceType === 'class_roster'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Users className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Theo danh sách lớp</span>
                  <span className="text-[11px] text-slate-500">
                    Tự động tạo danh sách học sinh theo lớp đã chọn
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('upload_images')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  sourceType === 'upload_images'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <UploadCloud className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Tải ảnh chụp bài làm</span>
                  <span className="text-[11px] text-slate-500">
                    Sẵn sàng upload nhiều trang bài viết tay (JPG, PNG, PDF)
                  </span>
                </div>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            id="btn-submit-create-batch"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Tạo đợt chấm bài</span>
          </button>
        </div>
      </div>
    </div>
  );
};
