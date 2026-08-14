import React, { useState, useMemo } from 'react';
import {
  Award,
  BookOpen,
  Plus,
  Sliders,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Search,
  Filter,
  Copy,
  Edit,
  Trash2,
  Eye,
  FolderPlus,
  Sparkles,
  Bot,
  LayoutGrid,
  List,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ExamRubric, GradingBatch, EssayType } from '../types';
import { ExamRubricModal } from '../components/ExamRubricModal';
import { ExamRubricDetailModal } from '../components/ExamRubricDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useToast } from '../components/Toast';

interface ExamsRubricViewProps {
  rubrics: ExamRubric[];
  batches?: GradingBatch[];
  onAddRubric: (rubric: ExamRubric) => void;
  onUpdateRubric: (rubric: ExamRubric) => void;
  onDuplicateRubric: (rubricId: string) => void;
  onDeleteRubric: (rubricId: string) => void;
  onOpenCreateBatch: (rubricId?: string) => void;
}

export const ExamsRubricView: React.FC<ExamsRubricViewProps> = ({
  rubrics,
  batches = [],
  onAddRubric,
  onUpdateRubric,
  onDuplicateRubric,
  onDeleteRubric,
  onOpenCreateBatch,
}) => {
  const { showToast } = useToast();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | EssayType>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | '10' | '11' | '12' | 'THCS'>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<ExamRubric | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailRubric, setSelectedDetailRubric] = useState<ExamRubric | null>(null);

  const [deletingRubric, setDeletingRubric] = useState<ExamRubric | null>(null);

  // Available School Years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    rubrics.forEach((r) => {
      if (r.schoolYear) years.add(r.schoolYear);
    });
    return Array.from(years);
  }, [rubrics]);

  // Filtered rubrics
  const filteredRubrics = useMemo(() => {
    return rubrics.filter((r) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.content && r.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.subject && r.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.gradingGuide && r.gradingGuide.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType =
        selectedTypeFilter === 'all' || r.essayType === selectedTypeFilter;

      const matchGrade =
        selectedGradeFilter === 'all' || r.grade === selectedGradeFilter;

      const matchYear =
        selectedYearFilter === 'all' || r.schoolYear === selectedYearFilter;

      return matchSearch && matchType && matchGrade && matchYear;
    });
  }, [rubrics, searchQuery, selectedTypeFilter, selectedGradeFilter, selectedYearFilter]);

  // Handlers
  const handleOpenCreateNew = () => {
    setEditingRubric(null);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenEdit = (rubric: ExamRubric) => {
    setEditingRubric(rubric);
    setIsCreateEditModalOpen(true);
  };

  const handleOpenDetail = (rubric: ExamRubric) => {
    setSelectedDetailRubric(rubric);
    setIsDetailModalOpen(true);
  };

  const handleDuplicate = (rubric: ExamRubric) => {
    onDuplicateRubric(rubric.id);
  };

  const handleConfirmDelete = () => {
    if (deletingRubric) {
      onDeleteRubric(deletingRubric.id);
      setDeletingRubric(null);
    }
  };

  // Helper badge color for essay type
  const getEssayTypeBadge = (type?: string) => {
    switch (type) {
      case 'Nghị luận xã hội':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Nghị luận văn học':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Đọc hiểu':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Bài viết tổng hợp':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div id="exams-rubric-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              <span>Ngân hàng Đề thi & Khung Tiêu chí Rubric</span>
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 hidden sm:inline-block">
              {rubrics.length} bộ đề
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý đề bài, ma trận rubric chi tiết và chỉ dẫn sư phạm riêng cho AI Gemini khi chấm điểm
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-create-rubric-main"
            onClick={handleOpenCreateNew}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo đề mới</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Tổng số đề & Rubric
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{rubrics.length}</p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Đầy đủ cấu trúc tiêu chí</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Nghị luận xã hội
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {rubrics.filter((r) => r.essayType === 'Nghị luận xã hội').length}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Đoạn văn & bài văn NLXH</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Nghị luận văn học
          </span>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {rubrics.filter((r) => r.essayType === 'Nghị luận văn học').length}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Phân tích & cảm thụ tác phẩm</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Chuẩn GDPT 2018
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {rubrics.filter((r) => r.essayType === 'Bài viết tổng hợp' || r.essayType === 'Đọc hiểu').length}
          </p>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Đọc hiểu & đề tổng hợp</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đề, nội dung câu hỏi, loại bài..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Grade filter */}
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="all">Tất cả khối lớp</option>
              <option value="12">Khối 12</option>
              <option value="11">Khối 11</option>
              <option value="10">Khối 10</option>
              <option value="THCS">Khối THCS</option>
            </select>

            {/* School Year filter */}
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
            >
              <option value="all">Tất cả năm học</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Xem dạng thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Xem dạng bảng"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Tabs for Essay Types */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Loại bài:
          </span>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'Nghị luận xã hội', label: '1. Nghị luận xã hội' },
            { key: 'Nghị luận văn học', label: '2. Nghị luận văn học' },
            { key: 'Đọc hiểu', label: '3. Đọc hiểu' },
            { key: 'Bài viết tổng hợp', label: '4. Bài viết tổng hợp' },
            { key: 'Khác', label: '5. Khác' },
          ].map((tab) => {
            const isActive = selectedTypeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTypeFilter(tab.key as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredRubrics.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">Không tìm thấy đề thi phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Không có đề thi hoặc rubric nào khớp với bộ lọc hiện tại. Thầy cô có thể xóa bộ lọc
            hoặc tạo một đề thi mới.
          </p>
          <button
            onClick={handleOpenCreateNew}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            + Tạo đề mới ngay
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRubrics.map((rubric) => {
            const relatedBatchesCount = batches.filter(
              (b) => b.examId === rubric.id || b.examTitle === rubric.title
            ).length;
            const criteriaCount = rubric.criteriaList?.length || 0;
            const rulesCount = rubric.teacherCustomRules?.length || 0;

            return (
              <div
                key={rubric.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3.5">
                  {/* Top Badges & Total Score */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getEssayTypeBadge(
                          rubric.essayType
                        )}`}
                      >
                        {rubric.essayType || 'Ngữ văn'}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Khối {rubric.grade}
                      </span>
                    </div>

                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {rubric.totalScore}đ
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <h3
                      onClick={() => handleOpenDetail(rubric)}
                      className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {rubric.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {rubric.content || rubric.gradingGuide || 'Chưa có trích đoạn nội dung.'}
                    </p>
                  </div>

                  {/* Meta Stats Row */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-1.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Tiêu chí</span>
                      <span className="font-bold text-slate-800">{criteriaCount} mục</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Thời gian</span>
                      <span className="font-bold text-slate-800">{rubric.timeLimitMinutes || 90}p</span>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[10px]">Đợt chấm</span>
                      <span className="font-bold text-indigo-600">{relatedBatchesCount} đợt</span>
                    </div>
                  </div>

                  {/* Teacher custom rules indicator */}
                  {rulesCount > 0 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/60 px-2.5 py-1 rounded-xl border border-amber-100">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">Có {rulesCount} yêu cầu chấm riêng cho AI</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={() => handleOpenDetail(rubric)}
                    className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(rubric)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa đề & rubric"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(rubric)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Sao chép thành đề mới"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingRubric(rubric)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa đề này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenCreateBatch(rubric.id)}
                      className="ml-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Tạo đợt chấm từ đề này"
                    >
                      <FolderPlus className="w-3 h-3" />
                      <span>Chấm</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3.5">Tên đề thi</th>
                  <th className="px-4 py-3.5">Loại bài</th>
                  <th className="px-4 py-3.5">Khối</th>
                  <th className="px-4 py-3.5">Thang điểm</th>
                  <th className="px-4 py-3.5">Tiêu chí</th>
                  <th className="px-4 py-3.5">Đợt chấm</th>
                  <th className="px-4 py-3.5">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRubrics.map((rubric) => {
                  const relatedBatchesCount = batches.filter(
                    (b) => b.examId === rubric.id || b.examTitle === rubric.title
                  ).length;
                  const criteriaCount = rubric.criteriaList?.length || 0;

                  return (
                    <tr key={rubric.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <span
                          onClick={() => handleOpenDetail(rubric)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer block max-w-xs truncate"
                        >
                          {rubric.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {rubric.subject || 'Ngữ văn'} • {rubric.schoolYear || '2024 - 2025'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEssayTypeBadge(
                            rubric.essayType
                          )}`}
                        >
                          {rubric.essayType || 'Ngữ văn'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        Khối {rubric.grade}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rubric.totalScore}đ
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {criteriaCount} tiêu chí
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-indigo-600">
                          {relatedBatchesCount} đợt
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {rubric.createdAt || '15/01/2025'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(rubric)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(rubric)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(rubric)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Sao chép thành đề mới"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingRubric(rubric)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Exam Rubric Modal */}
      <ExamRubricModal
        isOpen={isCreateEditModalOpen}
        onClose={() => setIsCreateEditModalOpen(false)}
        editingRubric={editingRubric}
        onSave={(saved) => {
          if (editingRubric) {
            onUpdateRubric(saved);
          } else {
            onAddRubric(saved);
          }
        }}
      />

      {/* Exam Rubric Detail Modal */}
      <ExamRubricDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        rubric={selectedDetailRubric}
        batches={batches}
        onEdit={(rubric) => {
          setIsDetailModalOpen(false);
          handleOpenEdit(rubric);
        }}
        onDuplicate={(rubric) => {
          setIsDetailModalOpen(false);
          handleDuplicate(rubric);
        }}
        onOpenCreateBatch={(rubricId) => {
          setIsDetailModalOpen(false);
          onOpenCreateBatch(rubricId);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingRubric}
        onClose={() => setDeletingRubric(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Đề thi & Rubric"
        message={`Thầy cô có chắc chắn muốn xóa đề thi "${deletingRubric?.title}" không? Hành động này sẽ xóa bộ tiêu chí rubric tương ứng.`}
        confirmButtonText="Xóa đề thi"
      />
    </div>
  );
};
