import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowUpDown,
  GraduationCap,
  Play,
} from 'lucide-react';
import { EssaySubmission, GradingBatch } from '../types';
import { useToast } from '../components/Toast';

interface EssaysViewProps {
  submissions: EssaySubmission[];
  batches: GradingBatch[];
  selectedBatchId?: string;
  onGradeSubmission: (submission: EssaySubmission) => void;
  onBatchAiGradeAll: () => void;
}

export const EssaysView: React.FC<EssaysViewProps> = ({
  submissions,
  batches,
  selectedBatchId,
  onGradeSubmission,
  onBatchAiGradeAll,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'ai_graded' | 'teacher_reviewed'>('all');
  const [batchFilter, setBatchFilter] = useState<string>(selectedBatchId || 'all');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.examTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesBatch = batchFilter === 'all' || sub.batchId === batchFilter;

    return matchesSearch && matchesStatus && matchesBatch;
  });

  const pendingCount = filteredSubmissions.filter((s) => s.status === 'pending').length;

  const handleBatchAiGrade = () => {
    setIsProcessingBatch(true);
    showToast('Đang tiến hành chấm hàng loạt bằng AI theo tiêu chuẩn GDPT 2018...', 'info');

    setTimeout(() => {
      onBatchAiGradeAll();
      setIsProcessingBatch(false);
      showToast('Đã hoàn tất AI chấm bài! Thầy/Cô có thể vào rà soát và duyệt điểm.', 'success');
    }, 1500);
  };

  return (
    <div id="essays-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Danh sách bài viết học sinh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Xem bài làm, đối chiếu đề xuất điểm từ AI và phê duyệt kết quả chính thức
          </p>
        </div>

        {/* Batch AI Action */}
        <button
          id="btn-batch-ai-grade"
          onClick={handleBatchAiGrade}
          disabled={isProcessingBatch || pendingCount === 0}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isProcessingBatch ? 'animate-spin' : ''}`} />
          <span>
            {isProcessingBatch ? 'AI đang phân tích...' : `AI Chấm hàng loạt (${pendingCount} bài chờ)`}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, mã số, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ chấm ({submissions.filter((s) => s.status === 'pending').length})</option>
            <option value="ai_graded">AI đã chấm ({submissions.filter((s) => s.status === 'ai_graded').length})</option>
            <option value="teacher_reviewed">Đã duyệt ({submissions.filter((s) => s.status === 'teacher_reviewed').length})</option>
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả đợt chấm</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3.5 px-4">Học sinh</th>
                <th className="py-3.5 px-3">Lớp</th>
                <th className="py-3.5 px-3">Đề thi</th>
                <th className="py-3.5 px-3">Số từ</th>
                <th className="py-3.5 px-3">AI Đề xuất</th>
                <th className="py-3.5 px-3">Điểm duyệt</th>
                <th className="py-3.5 px-3">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => onGradeSubmission(sub)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-indigo-700 font-bold flex items-center justify-center text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          {sub.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {sub.studentName}
                          </p>
                          <span className="text-[11px] text-slate-400 font-mono">{sub.studentCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {sub.className}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 max-w-[200px] truncate text-slate-600">
                      {sub.examTitle}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500 font-mono">
                      {sub.wordCount || sub.essayContent.split(/\s+/).length} từ
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-indigo-600">
                      {sub.aiGrading ? `${sub.aiGrading.overallScore}đ` : <span className="text-slate-400 font-normal">Chờ AI</span>}
                    </td>

                    <td className="py-3.5 px-3">
                      {sub.teacherGrading?.isApproved ? (
                        <span className="font-bold text-emerald-600 text-sm">
                          {sub.teacherGrading.finalScore}đ
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa chốt</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          sub.status === 'teacher_reviewed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.status === 'ai_graded'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {sub.status === 'teacher_reviewed'
                          ? '✓ Đã duyệt'
                          : sub.status === 'ai_graded'
                          ? 'AI đã chấm'
                          : 'Chờ chấm'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGradeSubmission(sub);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      >
                        {sub.status === 'teacher_reviewed' ? 'Xem lại' : 'Chấm bài'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy bài viết nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
