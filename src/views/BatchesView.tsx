import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  UploadCloud,
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';
import { GradingBatch, ClassRoom } from '../types';

interface BatchesViewProps {
  batches: GradingBatch[];
  classes: ClassRoom[];
  onOpenCreateBatch: () => void;
  onSelectBatch: (batch: GradingBatch) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  batches,
  classes,
  onOpenCreateBatch,
  onSelectBatch,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBatches = batches.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesClass = filterClass === 'all' || b.classId === filterClass;
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.className.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesClass && matchesSearch;
  });

  return (
    <div id="batches-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" />
            <span>Quản lý Đợt Chấm Bài</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo đợt chấm, upload ghép ảnh bài viết tay và theo dõi tiến trình OCR & AI chấm
          </p>
        </div>

        <button
          id="btn-create-batch-view"
          onClick={onOpenCreateBatch}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tạo đợt chấm mới</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên đợt chấm, đề thi, lớp học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="in_progress">Đang chấm</option>
            <option value="completed">Đã hoàn thành</option>
          </select>

          {/* Class filter */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBatches.map((batch) => {
          const total = batch.totalEssays || 1;
          const aiPercent = Math.min(100, Math.round((batch.gradedByAiCount / total) * 100));
          const teacherPercent = Math.min(100, Math.round((batch.reviewedByTeacherCount / total) * 100));

          return (
            <div
              key={batch.id}
              onClick={() => onSelectBatch(batch)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                        Lớp {batch.className}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">
                        {batch.gradingDate || batch.createdAt}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors mt-1">
                      {batch.name}
                    </h3>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      batch.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {batch.status === 'completed' ? 'Hoàn thành' : 'Đang chấm'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1 font-medium text-slate-700">{batch.examTitle}</span>
                  </div>
                </div>

                {/* 5 Thống kê nhanh: Tổng bài, Đã Upload, Đang xử lý, AI chấm, GV duyệt */}
                <div className="mt-3 grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Tổng bài</span>
                    <span className="font-bold text-slate-800">{batch.totalEssays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Đã nộp</span>
                    <span className="font-bold text-indigo-600">{batch.uploadedCount ?? batch.totalEssays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">AI chấm</span>
                    <span className="font-bold text-sky-600">{batch.gradedByAiCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">GV duyệt</span>
                    <span className="font-bold text-emerald-600">{batch.reviewedByTeacherCount}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-600" />
                      AI phân tích:
                    </span>
                    <span className="font-bold text-sky-600">
                      {batch.gradedByAiCount}/{batch.totalEssays} bài ({aiPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${aiPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Giáo viên duyệt:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {batch.reviewedByTeacherCount}/{batch.totalEssays} bài ({teacherPercent}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${teacherPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Điểm TB:</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {batch.averageScore > 0 ? `${batch.averageScore.toFixed(2)}` : '—'}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Xem chi tiết & Upload bài</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
