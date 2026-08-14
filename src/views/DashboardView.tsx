import React from 'react';
import {
  GraduationCap,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { ClassRoom, GradingBatch, EssaySubmission } from '../types';

interface DashboardViewProps {
  classes: ClassRoom[];
  batches: GradingBatch[];
  submissions: EssaySubmission[];
  onOpenCreateBatch: () => void;
  onSelectBatch: (batch: GradingBatch) => void;
  onGradeSubmission: (submission: EssaySubmission) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classes,
  batches,
  submissions,
  onOpenCreateBatch,
  onSelectBatch,
  onGradeSubmission,
  onNavigateTab,
}) => {
  // Aggregate stat calculations
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const aiGradedCount = submissions.filter((s) => s.status === 'ai_graded').length;
  const teacherReviewedCount = submissions.filter((s) => s.status === 'teacher_reviewed').length;

  const validScores = submissions
    .map((s) => s.teacherGrading?.finalScore || s.aiGrading?.overallScore)
    .filter((score): score is number => typeof score === 'number' && !isNaN(score));

  const averageScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
      : '7.85';

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Principle Reminder Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Trợ lý AI hỗ trợ giáo viên chấm bài Ngữ văn THPT
              </h2>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Chuẩn GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              <span className="font-semibold text-white">Nguyên tắc quan trọng:</span> AI chỉ đóng vai trò trợ lý phân tích văn bản, gợi ý lỗi dùng từ và đề xuất điểm theo Rubric. Thầy/Cô luôn là người kiểm tra, linh hoạt cân chỉnh và quyết định điểm số cuối cùng.
            </p>
          </div>
        </div>

        <button
          id="btn-dash-create-batch"
          onClick={onOpenCreateBatch}
          className="shrink-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo đợt chấm mới</span>
        </button>
      </div>

      {/* 6 Key Stat Metrics as requested */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. Tổng số lớp */}
        <div
          id="stat-classes"
          onClick={() => onNavigateTab('classes')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
            <span className="text-xs font-medium text-slate-600">Tổng số lớp</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{totalClasses}</span>
            <span className="text-xs text-slate-500">lớp</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">Khối 11 & 12</span>
        </div>

        {/* 2. Tổng số học sinh */}
        <div
          id="stat-students"
          onClick={() => onNavigateTab('students')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
            <span className="text-xs font-medium text-slate-600">Tổng số học sinh</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">em</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Đang theo dõi</span>
        </div>

        {/* 3. Số bài đang chờ chấm */}
        <div
          id="stat-pending"
          onClick={() => onNavigateTab('essays')}
          className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs hover:shadow-md transition-all cursor-pointer group bg-amber-50/20"
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-medium text-slate-700">Chờ chấm</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
            <span className="text-xs text-amber-600">bài</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Cần xử lý sớm</span>
        </div>

        {/* 4. Số bài AI đã phân tích */}
        <div
          id="stat-ai-graded"
          onClick={() => onNavigateTab('essays')}
          className="p-4 rounded-2xl bg-white border border-indigo-200 shadow-xs hover:shadow-md transition-all cursor-pointer group bg-indigo-50/20"
        >
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-medium text-slate-700">AI đã phân tích</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-700">{aiGradedCount}</span>
            <span className="text-xs text-indigo-600">bài</span>
          </div>
          <span className="text-[11px] text-indigo-700 font-medium mt-1 block">Chờ duyệt điểm</span>
        </div>

        {/* 5. Số bài giáo viên đã duyệt */}
        <div
          id="stat-reviewed"
          onClick={() => onNavigateTab('essays')}
          className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:shadow-md transition-all cursor-pointer group bg-emerald-50/20"
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-medium text-slate-700">Đã duyệt điểm</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-700">{teacherReviewedCount}</span>
            <span className="text-xs text-emerald-600">bài</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Đã khóa điểm</span>
        </div>

        {/* 6. Điểm trung bình gần nhất */}
        <div
          id="stat-avg-score"
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-indigo-600 transition-colors">
            <span className="text-xs font-medium text-slate-600">Điểm TB gần nhất</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{averageScore}</span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Đạt chỉ tiêu khá/giỏi</span>
        </div>
      </div>

      {/* Main Content Grid: Recent Batches Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: "Đợt chấm gần đây" Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Đợt chấm gần đây</h3>
                <p className="text-xs text-slate-500">Theo dõi tiến độ chấm và duyệt điểm của từng lớp</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('batches')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-4">Tên đợt chấm</th>
                  <th className="py-3 px-3">Lớp</th>
                  <th className="py-3 px-3">Số bài</th>
                  <th className="py-3 px-3">AI Chấm</th>
                  <th className="py-3 px-3">Đã duyệt</th>
                  <th className="py-3 px-3">Điểm TB</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {batches.map((batch) => {
                  const progress = Math.round((batch.reviewedByTeacherCount / batch.totalEssays) * 100);
                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectBatch(batch)}
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        {batch.name}
                        <span className="block text-[11px] font-normal text-slate-500 truncate">
                          {batch.examTitle}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {batch.className.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">{batch.totalEssays}</td>
                      <td className="py-3.5 px-3">
                        <span className="text-indigo-600 font-semibold">{batch.gradedByAiCount}</span>
                        <span className="text-slate-400">/{batch.totalEssays}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-emerald-600 font-bold">{batch.reviewedByTeacherCount}</span>
                        <span className="text-slate-400">/{batch.totalEssays}</span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {batch.averageScore > 0 ? `${batch.averageScore}` : '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            batch.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {batch.status === 'completed' ? 'Hoàn thành' : 'Đang chấm'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBatch(batch);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Chấm bài
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow & Fast Grade Queue */}
        <div className="space-y-6">
          {/* Quick Submissions to Grade */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Bài viết cần xử lý ngay</span>
              </h3>
              <span className="text-xs text-amber-700 font-semibold px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200">
                {pendingCount + aiGradedCount} bài
              </span>
            </div>

            <div className="space-y-2.5">
              {submissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onGradeSubmission(sub)}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                        {sub.studentName}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                        {sub.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{sub.examTitle}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full block ${
                        sub.status === 'teacher_reviewed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'ai_graded'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'teacher_reviewed'
                        ? 'Đã duyệt'
                        : sub.status === 'ai_graded'
                        ? 'AI đã chấm'
                        : 'Chờ chấm'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 mt-1 block">
                      {sub.teacherGrading?.finalScore || sub.aiGrading?.overallScore || '—'}đ
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('essays')}
              className="w-full py-2 text-xs font-semibold text-center text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Xem toàn bộ danh sách bài viết
            </button>
          </div>

          {/* Quick Teacher Guide */}
          <div className="bg-gradient-to-br from-indigo-50/60 to-sky-50/40 rounded-2xl border border-indigo-100 p-5 space-y-3">
            <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quy trình chấm bài 4 bước</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>Tạo đợt chấm & chọn đề thi theo ma trận GDPT 2018.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>AI tự động đọc, phân tích đoạn văn và đề xuất điểm chi tiết.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>Thầy/Cô rà soát, điều chỉnh điểm số và chèn nhận xét.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>Phê duyệt khóa điểm và xuất báo cáo kết quả thi.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
