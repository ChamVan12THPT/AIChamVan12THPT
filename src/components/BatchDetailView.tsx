import React, { useState } from 'react';
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  Eye,
  Trash2,
  Edit3,
  Calendar,
  Users,
  Award,
  AlertCircle,
  FolderKanban,
  CheckCheck,
  RotateCw,
  Plus
} from 'lucide-react';
import {
  GradingBatch,
  EssaySubmission,
  Student,
  SubmissionStatus,
  PageImageItem
} from '../types';
import { useToast } from '../components/Toast';

interface BatchDetailViewProps {
  batch: GradingBatch;
  submissions: EssaySubmission[];
  students: Student[];
  onBack: () => void;
  onOpenUploadModal: () => void;
  onOpenGradingModal: (submission: EssaySubmission) => void;
  onOpenImageViewer: (images: PageImageItem[], initialIdx: number) => void;
  onDeleteSubmission: (id: string) => void;
  onUpdateSubmissionStatus: (id: string, status: SubmissionStatus) => void;
  onSimulateOcrBatch?: () => void;
  onSimulateAiGradingBatch?: () => void;
}

export const BatchDetailView: React.FC<BatchDetailViewProps> = ({
  batch,
  submissions,
  students,
  onBack,
  onOpenUploadModal,
  onOpenGradingModal,
  onOpenImageViewer,
  onDeleteSubmission,
  onUpdateSubmissionStatus,
  onSimulateOcrBatch,
  onSimulateAiGradingBatch,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const batchSubmissions = submissions.filter((s) => s.batchId === batch.id);

  // Lọc theo từ khóa và trạng thái
  const filteredSubmissions = batchSubmissions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Thống kê nhanh
  const totalCount = batchSubmissions.length;
  const uploadedCount = batchSubmissions.filter((s) => (s.pageImages && s.pageImages.length > 0) || s.essayContent).length;
  const processingCount = batchSubmissions.filter((s) => s.status === 'Đang đọc' || s.status === 'AI đang chấm').length;
  const aiGradedCount = batchSubmissions.filter((s) => s.status === 'AI đã chấm' || s.status === 'ai_graded' || s.aiScore != null || s.aiGrading != null).length;
  const teacherApprovedCount = batchSubmissions.filter((s) => s.status === 'Giáo viên đã duyệt' || s.status === 'teacher_reviewed').length;

  // Tính điểm trung bình
  const gradedList = batchSubmissions.filter((s) => (s.teacherScore != null || s.aiScore != null || s.teacherGrading != null || s.aiGrading != null));
  const avgScore = gradedList.length > 0
    ? Math.round(
        (gradedList.reduce((acc, curr) => acc + (curr.teacherScore ?? curr.teacherGrading?.finalScore ?? curr.aiScore ?? curr.aiGrading?.overallScore ?? 0), 0) /
          gradedList.length) *
          100
      ) / 100
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Chưa xử lý':
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Chưa xử lý</span>;
      case 'Đang đọc':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">Đang đọc OCR...</span>;
      case 'Đã đọc':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã đọc</span>;
      case 'AI đang chấm':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">AI đang chấm...</span>;
      case 'AI đã chấm':
      case 'ai_graded':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">AI đã chấm</span>;
      case 'Giáo viên đã duyệt':
      case 'teacher_reviewed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Giáo viên đã duyệt</span>;
      case 'Cần kiểm tra':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cần kiểm tra</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getOcrBadge = (ocrStatus?: string) => {
    switch (ocrStatus) {
      case 'Đã đọc':
        return <span className="text-xs font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng</span>;
      case 'Đang đọc':
        return <span className="text-xs font-medium text-amber-600 flex items-center gap-1 animate-pulse"><RotateCw className="w-3.5 h-3.5 animate-spin" /> Đang nhận diện</span>;
      case 'Lỗi đọc':
        return <span className="text-xs font-medium text-rose-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Lỗi ảnh</span>;
      default:
        return <span className="text-xs text-slate-400">Chưa quét</span>;
    }
  };

  return (
    <div id="batch-detail-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                Quản lý đợt chấm bài
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">{batch.className}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">{batch.name}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenUploadModal}
            id="btn-upload-essay-modal"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Upload & Ghép trang bài làm</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards (8 Thông số theo đúng yêu cầu đề bài) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Tên đợt / Đề */}
        <div className="col-span-2 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-600" />
            Đề thi & Lớp
          </span>
          <div className="mt-2">
            <p className="text-xs font-bold text-slate-800 line-clamp-1">{batch.examTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Lớp: <strong className="text-slate-700">{batch.className}</strong> ({batch.academicYear})</p>
          </div>
        </div>

        {/* 2. Tổng số bài */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số bài</span>
          <div className="mt-2">
            <p className="text-xl font-black text-slate-900">{totalCount}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sĩ số: {batch.totalEssays} HS</p>
          </div>
        </div>

        {/* 3. Đã upload */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Đã upload</span>
          <div className="mt-2">
            <p className="text-xl font-black text-indigo-600">{uploadedCount}</p>
            <p className="text-[10px] text-indigo-500 mt-0.5">
              {totalCount > 0 ? `${Math.round((uploadedCount / totalCount) * 100)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* 4. Đang xử lý */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Đang xử lý</span>
          <div className="mt-2">
            <p className="text-xl font-black text-amber-600">{processingCount}</p>
            <p className="text-[10px] text-amber-500 mt-0.5">OCR / AI chấm</p>
          </div>
        </div>

        {/* 5. AI đã chấm */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-sky-600 uppercase tracking-wider">AI đã chấm</span>
          <div className="mt-2">
            <p className="text-xl font-black text-sky-600">{aiGradedCount}</p>
            <p className="text-[10px] text-sky-500 mt-0.5">
              {totalCount > 0 ? `${Math.round((aiGradedCount / totalCount) * 100)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* 6. GV đã duyệt */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">GV đã duyệt</span>
          <div className="mt-2">
            <p className="text-xl font-black text-emerald-600">{teacherApprovedCount}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">
              {totalCount > 0 ? `${Math.round((teacherApprovedCount / totalCount) * 100)}%` : '0%'}
            </p>
          </div>
        </div>

        {/* 7. Điểm trung bình */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Điểm TB
          </span>
          <div className="mt-2">
            <p className="text-xl font-black text-indigo-700">{avgScore > 0 ? avgScore.toFixed(2) : '--'}</p>
            <p className="text-[10px] text-indigo-500 mt-0.5">Thang 10.0</p>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã số học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Tất cả bài' },
            { id: 'Chưa xử lý', label: 'Chưa xử lý' },
            { id: 'Đã đọc', label: 'Đã đọc' },
            { id: 'AI đã chấm', label: 'AI đã chấm' },
            { id: 'Giáo viên đã duyệt', label: 'GV đã duyệt' },
            { id: 'Cần kiểm tra', label: 'Cần kiểm tra' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Data Table: | STT | Học sinh | Số trang | OCR | AI | Giáo viên | Điểm | */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 text-center">Số trang</th>
                <th className="py-3 px-4">OCR (Trạng thái)</th>
                <th className="py-3 px-4">AI (Chấm sơ bộ)</th>
                <th className="py-3 px-4">Giáo viên (Phê duyệt)</th>
                <th className="py-3 px-4 text-center">Điểm số</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-slate-600 text-sm">Chưa có bài làm nào trong danh sách</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Thầy/Cô hãy bấm "+ Upload & Ghép trang bài làm" ở trên để tải bài viết học sinh
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub, idx) => {
                  const pageImgs = sub.pageImages || [];
                  const pCount = sub.pageCount || pageImgs.length || 1;
                  const finalScore = sub.teacherScore ?? sub.teacherGrading?.finalScore ?? sub.aiScore ?? sub.aiGrading?.overallScore;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Học sinh */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center border border-indigo-100 shrink-0 text-xs">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer" onClick={() => onOpenGradingModal(sub)}>
                              {sub.studentName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{sub.studentCode}</p>
                          </div>
                        </div>
                      </td>

                      {/* Số trang */}
                      <td className="py-3.5 px-4 text-center">
                        {pageImgs.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenImageViewer(pageImgs, 0)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{pCount} trang</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono">1 (Text)</span>
                        )}
                      </td>

                      {/* OCR (Trạng thái) */}
                      <td className="py-3.5 px-4">
                        {getOcrBadge(sub.ocrStatus)}
                      </td>

                      {/* AI */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {sub.aiGrading || sub.aiScore != null ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                              <Sparkles className="w-3 h-3 text-sky-500" />
                              {sub.aiScore ?? sub.aiGrading?.overallScore}đ
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Chưa chấm</span>
                          )}
                        </div>
                      </td>

                      {/* Giáo viên */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      {/* Điểm */}
                      <td className="py-3.5 px-4 text-center">
                        {finalScore != null ? (
                          <span className="text-sm font-black text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                            {finalScore.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">--</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {pageImgs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => onOpenImageViewer(pageImgs, 0)}
                              title="Xem ảnh bài làm"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenGradingModal(sub)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Chấm / Duyệt
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSubmission(sub.id)}
                            title="Xóa bài nộp"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
