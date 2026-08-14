import React from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Award,
  TrendingUp,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Student, ClassRoom, EssaySubmission, ExamRubric } from '../types';
import { classStudentService } from '../services/classStudentService';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  classes: ClassRoom[];
  submissions: EssaySubmission[];
  onOpenGrading: (submission: EssaySubmission) => void;
  onEditStudent?: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  classes,
  submissions,
  onOpenGrading,
  onEditStudent,
}) => {
  if (!isOpen || !student) return null;

  const targetClass = classes.find((c) => c.id === student.classId);
  const studentHistory = classStudentService.getStudentProgressHistory(student.id, submissions);

  // Tính toán nhanh
  const scores = studentHistory
    .map((h) => h.finalScore)
    .filter((s): s is number => typeof s === 'number');

  const avgScore =
    scores.length > 0
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
      : student.averageScore || 0;

  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Top Header Card */}
        <div className="p-6 border-b border-slate-200/80 bg-linear-to-r from-slate-50 to-indigo-50/30 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullName || student.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
                  {(student.fullName || student.name || 'HS').charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  student.gender === 'Nữ'
                    ? 'bg-rose-100 text-rose-700'
                    : student.gender === 'Nam'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {student.gender}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-lg text-slate-900">
                  {student.fullName || student.name}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 font-mono font-bold">
                  {student.studentCode || student.code}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-800">
                  {targetClass?.name || student.className}
                </span>
                {targetClass && (
                  <>
                    <span>•</span>
                    <span>Khối {targetClass.grade}</span>
                    <span>•</span>
                    <span>Năm học {targetClass.schoolYear}</span>
                  </>
                )}
              </p>

              {student.notes && (
                <p className="text-xs text-slate-500 mt-1 italic line-clamp-1 max-w-lg">
                  "{student.notes}"
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEditStudent && (
              <button
                onClick={() => {
                  onClose();
                  onEditStudent(student);
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
              <span className="text-[11px] text-indigo-700 font-semibold block">Điểm trung bình</span>
              <span className="text-2xl font-black text-indigo-700 mt-0.5 block">
                {avgScore > 0 ? avgScore : '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-[11px] text-emerald-700 font-semibold block">Điểm cao nhất</span>
              <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
                {maxScore > 0 ? maxScore : '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-[11px] text-amber-700 font-semibold block">Điểm thấp nhất</span>
              <span className="text-2xl font-black text-amber-700 mt-0.5 block">
                {minScore > 0 ? minScore : '—'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Số bài đã nộp</span>
              <span className="text-2xl font-bold text-slate-800 mt-0.5 block">
                {studentHistory.length} bài
              </span>
            </div>
          </div>

          {/* Student Profile Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Đặc trưng & Ưu điểm:</span>
              <p className="text-slate-600 leading-relaxed">
                {student.strengthsSummary || 'Hành văn mạch lạc, nắm chắc cấu trúc đề thi.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600">
              <span className="font-bold text-slate-800 block mb-1">Điểm cần bồi dưỡng thêm:</span>
              <p className="text-slate-600 leading-relaxed">
                {student.needsImprovementSummary || 'Cần chú ý dẫn chứng thực tế trong đoạn nghị luận xã hội.'}
              </p>
            </div>
          </div>

          {/* Connected History: Student → Essay → Exam → AI Score → Teacher Score → Feedback */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Lịch sử bài viết & Tiến bộ học tập ({studentHistory.length})</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                Liên kết đề thi & đối chiếu điểm AI / Giáo viên
              </span>
            </div>

            {studentHistory.length > 0 ? (
              <div className="space-y-3">
                {studentHistory.map((item) => {
                  const originalSub = submissions.find((s) => s.id === item.essayId);
                  return (
                    <div
                      key={item.essayId}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-sm text-slate-900 truncate">
                            {item.examTitle}
                          </h5>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              item.status === 'teacher_reviewed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'ai_graded'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'teacher_reviewed'
                              ? 'Đã duyệt điểm'
                              : item.status === 'ai_graded'
                              ? 'AI đã chấm'
                              : 'Chờ chấm'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>Nộp: {item.submittedAt}</span>
                          <span>•</span>
                          <span>Độ dài: {item.wordCount} từ</span>
                        </p>

                        {/* Feedback preview */}
                        {(item.teacherFeedback || item.generalFeedback) && (
                          <p className="text-xs text-slate-600 line-clamp-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100 mt-1">
                            "{item.teacherFeedback || item.generalFeedback}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        {/* Scores badge */}
                        <div className="text-right">
                          <div className="flex items-baseline gap-2">
                            {item.aiScore !== undefined && (
                              <span className="text-[11px] text-slate-500 font-mono" title="Điểm AI đề xuất">
                                AI: <strong className="text-indigo-600">{item.aiScore}</strong>
                              </span>
                            )}
                            <span className="text-base font-black text-emerald-700" title="Điểm chính thức">
                              {item.finalScore !== undefined ? `${item.finalScore}đ` : '—'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {item.teacherScore !== undefined ? 'Giáo viên đã duyệt' : 'Chưa duyệt'}
                          </span>
                        </div>

                        {originalSub && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenGrading(originalSub);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Xem bài</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <h5 className="font-bold text-xs text-slate-700">Chưa có bài viết trực tuyến</h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Học sinh chưa tham gia đợt làm bài nào trong hệ thống. Khi tạo đợt chấm bài mới cho lớp, bài làm của học sinh sẽ tự động được lưu và thống kê tại đây.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Ngày tạo hồ sơ: {student.createdAt || '01/09/2024'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
