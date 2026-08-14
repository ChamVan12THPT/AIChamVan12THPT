import React, { useState } from 'react';
import { X, FolderPlus, BookOpen, Users, Calendar, Sparkles, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { ClassRoom, ExamRubric, GradingBatch } from '../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoom[];
  rubrics: ExamRubric[];
  onCreateBatch: (newBatch: Omit<GradingBatch, 'id' | 'createdAt' | 'gradedByAiCount' | 'reviewedByTeacherCount' | 'averageScore' | 'status'>) => void;
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
  const [dueDate, setDueDate] = useState('2025-03-15');
  const [academicYear, setAcademicYear] = useState('2024 - 2025');
  const [semester, setSemester] = useState('Học kỳ II');
  const [sourceType, setSourceType] = useState<'class_roster' | 'upload_images' | 'paste_text'>('class_roster');
  const [customEssayCount, setCustomEssayCount] = useState<number>(38);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    const selectedExam = rubrics.find((r) => r.id === selectedExamId);

    const defaultName = name.trim() || `Đợt chấm: ${selectedExam?.title || 'Khảo sát'} - ${selectedClass?.name || 'Lớp'}`;

    onCreateBatch({
      name: defaultName,
      classId: selectedClassId,
      className: selectedClass?.name || 'Lớp 12',
      examId: selectedExamId,
      examTitle: selectedExam?.title || 'Đề khảo sát',
      totalEssays: sourceType === 'class_roster' ? (selectedClass?.studentCount || 40) : customEssayCount,
      dueDate,
      academicYear,
      semester,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
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
                Thiết lập đợt chấm thi theo chuẩn cấu trúc Đề thi Tốt nghiệp THPT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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
              placeholder="VD: Khảo sát chất lượng Ôn thi Tốt nghiệp THPT 2025 - Đợt 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Chọn Lớp & Chọn Đề thi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Lớp học áp dụng <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-batch-class"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount} học sinh)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đề thi & Khung Rubric <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-batch-rubric"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
              >
                {rubrics.map((rubric) => (
                  <option key={rubric.id} value={rubric.id}>
                    {rubric.title} ({rubric.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Học kỳ, Năm học & Hạn chấm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Học kỳ</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="Học kỳ I">Học kỳ I</option>
                <option value="Học kỳ II">Học kỳ II</option>
                <option value="Ôn tập hè">Ôn tập hè</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Năm học</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="2024 - 2025">2024 - 2025</option>
                <option value="2025 - 2026">2025 - 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hạn hoàn thành</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Nguồn bài nộp */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Phương thức nạp bài làm của học sinh
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSourceType('class_roster')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                  sourceType === 'class_roster'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">Danh sách lớp</span>
                <span className="text-[11px] text-slate-500">Khởi tạo sẵn theo sĩ số lớp học</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('upload_images')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                  sourceType === 'upload_images'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">Tải ảnh bài viết</span>
                <span className="text-[11px] text-slate-500">Đọc bài viết tay qua OCR (Sắp ra mắt)</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('paste_text')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                  sourceType === 'paste_text'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-slate-800">Nhập văn bản</span>
                <span className="text-[11px] text-slate-500">Dán trực tiếp bài làm học sinh</span>
              </button>
            </div>
          </div>

          {/* AI Assistance notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Tự động kích hoạt Trợ lý AI:</span> Sau khi tạo đợt, hệ thống có thể tự động phân tích sơ bộ các tiêu chí (Đọc hiểu, NLXH, NLVH), đề xuất điểm số và nhận xét để thầy/cô rà soát duyệt nhanh chóng.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              id="btn-submit-create-batch"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Tạo đợt chấm bài</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
