import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  Bot,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';
import {
  ExamRubric,
  DetailedRubricCriterion,
  EssayType,
  RubricScoreLevel,
} from '../types';
import {
  examRubricService,
  DEFAULT_TEACHER_CUSTOM_RULES,
  RUBRIC_PRESET_TEMPLATES,
} from '../services/examRubricService';
import { useToast } from './Toast';

interface ExamRubricModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRubric?: ExamRubric | null;
  onSave: (rubric: ExamRubric) => void;
}

export const ExamRubricModal: React.FC<ExamRubricModalProps> = ({
  isOpen,
  onClose,
  editingRubric,
  onSave,
}) => {
  const { showToast } = useToast();

  // Tab navigation inside modal
  const [activeTab, setActiveTab] = useState<'info' | 'rubric' | 'teacher_rules' | 'preview_ai'>('info');

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Ngữ văn');
  const [grade, setGrade] = useState<'10' | '11' | '12' | 'THCS' | 'Khác'>('12');
  const [schoolYear, setSchoolYear] = useState('2024 - 2025');
  const [essayType, setEssayType] = useState<EssayType>('Nghị luận xã hội');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(90);
  const [totalScore, setTotalScore] = useState<number>(10.0);
  const [content, setContent] = useState('');
  const [gradingGuide, setGradingGuide] = useState('');
  const [notes, setNotes] = useState('');

  // Criteria List
  const [criteriaList, setCriteriaList] = useState<DetailedRubricCriterion[]>([]);
  const [expandedCriterionId, setExpandedCriterionId] = useState<string | null>(null);

  // Teacher Custom Rules
  const [selectedCustomRules, setSelectedCustomRules] = useState<string[]>([]);
  const [teacherCustomPrompt, setTeacherCustomPrompt] = useState('');
  const [newCustomRuleInput, setNewCustomRuleInput] = useState('');

  // Initialize or reset form data
  useEffect(() => {
    if (isOpen) {
      if (editingRubric) {
        setTitle(editingRubric.title);
        setSubject(editingRubric.subject || 'Ngữ văn');
        setGrade((editingRubric.grade as any) || '12');
        setSchoolYear(editingRubric.schoolYear || '2024 - 2025');
        setEssayType((editingRubric.essayType as EssayType) || 'Nghị luận xã hội');
        setTimeLimitMinutes(editingRubric.timeLimitMinutes || 90);
        setTotalScore(editingRubric.totalScore || 10.0);
        setContent(editingRubric.content || editingRubric.readingPassage || '');
        setGradingGuide(editingRubric.gradingGuide || '');
        setNotes(editingRubric.notes || '');
        setCriteriaList(editingRubric.criteriaList || []);
        setSelectedCustomRules(editingRubric.teacherCustomRules || [...DEFAULT_TEACHER_CUSTOM_RULES]);
        setTeacherCustomPrompt(editingRubric.teacherCustomPrompt || '');
      } else {
        // New rubric with default preset for selected essayType
        const defaultPreset = RUBRIC_PRESET_TEMPLATES[0];
        setTitle('');
        setSubject('Ngữ văn');
        setGrade('12');
        setSchoolYear('2024 - 2025');
        setEssayType('Nghị luận xã hội');
        setTimeLimitMinutes(90);
        setTotalScore(10.0);
        setContent('');
        setGradingGuide('');
        setNotes('');
        setCriteriaList(defaultPreset.criteria.map((c, idx) => ({ ...c, id: `crit-${Date.now()}-${idx}` })));
        setSelectedCustomRules([...DEFAULT_TEACHER_CUSTOM_RULES]);
        setTeacherCustomPrompt('Khuyến khích học sinh thể hiện quan điểm cá nhân nhân văn và sáng tạo.');
      }
      setActiveTab('info');
    }
  }, [isOpen, editingRubric]);

  if (!isOpen) return null;

  // Calculate sum of criteria scores
  const criteriaSum = Number(
    criteriaList.reduce((acc, c) => acc + (Number(c.maxScore) || 0), 0).toFixed(2)
  );

  const isScoreMatched = Math.abs(criteriaSum - Number(totalScore)) <= 0.01 && criteriaSum > 0;

  // Handle adding a new blank criterion
  const handleAddCriterion = () => {
    const newCriterion: DetailedRubricCriterion = {
      id: `crit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Tiêu chí ${criteriaList.length + 1}`,
      description: 'Mô tả yêu cầu đạt được của tiêu chí này.',
      maxScore: 1.0,
      aiGuidance: 'Linh hoạt cho điểm dựa trên mức độ hoàn thiện của học sinh.',
      levels: [
        { score: 0.0, label: '0 điểm', description: 'Chưa đạt yêu cầu hoặc không làm.' },
        { score: 0.5, label: '0.5 điểm', description: 'Đạt một phần yêu cầu cơ bản.' },
        { score: 1.0, label: '1.0 điểm', description: 'Đạt yêu cầu đầy đủ và chính xác.' },
      ],
    };
    setCriteriaList([...criteriaList, newCriterion]);
    setExpandedCriterionId(newCriterion.id);
    showToast('Đã thêm tiêu chí mới', 'success');
  };

  // Handle applying a preset template
  const handleApplyPreset = (presetId: string) => {
    const preset = RUBRIC_PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (!preset) return;

    const cloned = preset.criteria.map((c, idx) => ({
      ...c,
      id: `crit-preset-${Date.now()}-${idx}`,
      levels: c.levels.map((l) => ({ ...l })),
    }));

    setCriteriaList(cloned);
    setEssayType(preset.essayType);
    setTotalScore(preset.totalScore);
    if (!title) {
      setTitle(preset.name);
    }
    showToast(`Đã áp dụng mẫu "${preset.name}"`, 'success');
  };

  // Handle removing a criterion
  const handleRemoveCriterion = (id: string) => {
    if (criteriaList.length <= 1) {
      showToast('Rubric cần có ít nhất 1 tiêu chí', 'error');
      return;
    }
    setCriteriaList(criteriaList.filter((c) => c.id !== id));
  };

  // Handle updating a criterion field
  const handleUpdateCriterion = (id: string, updates: Partial<DetailedRubricCriterion>) => {
    setCriteriaList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  // Handle adding a score level inside a criterion
  const handleAddLevel = (critId: string) => {
    setCriteriaList((prev) =>
      prev.map((c) => {
        if (c.id === critId) {
          const currentLevels = c.levels || [];
          const nextScore = Number((c.maxScore / (currentLevels.length + 1)).toFixed(2));
          return {
            ...c,
            levels: [
              ...currentLevels,
              {
                id: `lvl-${Date.now()}`,
                score: nextScore,
                label: `${nextScore}đ`,
                description: 'Mô tả mức đánh giá...',
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Handle updating a score level
  const handleUpdateLevel = (critId: string, levelIdx: number, updates: Partial<RubricScoreLevel>) => {
    setCriteriaList((prev) =>
      prev.map((c) => {
        if (c.id === critId) {
          const newLevels = [...c.levels];
          newLevels[levelIdx] = { ...newLevels[levelIdx], ...updates };
          return { ...c, levels: newLevels };
        }
        return c;
      })
    );
  };

  // Handle removing a score level
  const handleRemoveLevel = (critId: string, levelIdx: number) => {
    setCriteriaList((prev) =>
      prev.map((c) => {
        if (c.id === critId) {
          if (c.levels.length <= 1) return c;
          const newLevels = c.levels.filter((_, idx) => idx !== levelIdx);
          return { ...c, levels: newLevels };
        }
        return c;
      })
    );
  };

  // Auto-sync target totalScore with criteriaSum
  const handleSyncTotalScore = () => {
    if (criteriaSum > 0) {
      setTotalScore(criteriaSum);
      showToast(`Đã điều chỉnh thang điểm đề về ${criteriaSum}đ theo tổng tiêu chí`, 'success');
    }
  };

  // Toggle standard custom rule
  const handleToggleRule = (rule: string) => {
    if (selectedCustomRules.includes(rule)) {
      setSelectedCustomRules(selectedCustomRules.filter((r) => r !== rule));
    } else {
      setSelectedCustomRules([...selectedCustomRules, rule]);
    }
  };

  // Add custom rule
  const handleAddCustomRule = () => {
    if (newCustomRuleInput.trim()) {
      setSelectedCustomRules([...selectedCustomRules, newCustomRuleInput.trim()]);
      setNewCustomRuleInput('');
      showToast('Đã thêm yêu cầu chấm riêng mới', 'success');
    }
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = examRubricService.validateRubric({
      title,
      totalScore,
      criteriaList,
    });

    if (!validation.isValid) {
      showToast(validation.errors[0] || 'Vui lòng kiểm tra lại các thông tin tiêu chí', 'error');
      return;
    }

    const payload: Partial<ExamRubric> = {
      title: title.trim(),
      subject: subject.trim(),
      grade,
      schoolYear: schoolYear.trim(),
      essayType,
      timeLimitMinutes: Number(timeLimitMinutes) || 90,
      totalScore: Number(totalScore),
      content: content.trim(),
      gradingGuide: gradingGuide.trim(),
      notes: notes.trim(),
      criteriaList,
      teacherCustomRules: selectedCustomRules,
      teacherCustomPrompt: teacherCustomPrompt.trim(),
      status: 'ready',
    };

    if (editingRubric) {
      const updated = examRubricService.updateRubric(editingRubric.id, payload);
      onSave(updated);
      showToast('Đã cập nhật Đề thi & Rubric thành công!', 'success');
    } else {
      const created = examRubricService.createRubric(payload);
      onSave(created);
      showToast('Đã tạo Đề thi & Rubric mới thành công!', 'success');
    }

    onClose();
  };

  // Generate preview of prompt to Gemini
  const promptPreview = examRubricService.buildGeminiGradingPromptPayload(
    {
      id: 'preview',
      title: title || 'Tên đề thi chưa đặt',
      subject,
      grade,
      schoolYear,
      essayType,
      totalScore,
      content,
      gradingGuide,
      criteriaList,
      teacherCustomRules: selectedCustomRules,
      teacherCustomPrompt,
      createdAt: '',
    },
    'Ví dụ: Trong bối cảnh kỷ nguyên số, lòng thấu cảm chính là sợi dây vô hình kết nối tâm hồn con người...'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-exam-rubric"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{editingRubric ? 'Chỉnh sửa Đề thi & Rubric' : 'Tạo Đề thi & Rubric mới'}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {essayType}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Thiết lập đề bài, ma trận tiêu chí chi tiết và yêu cầu sư phạm riêng cho AI chấm bài
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Thông tin đề & Hướng dẫn chấm</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rubric')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'rubric'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>2. Tiêu chí Rubric ({criteriaList.length})</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isScoreMatched
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {criteriaSum}/{totalScore}đ
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teacher_rules')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'teacher_rules'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Yêu cầu chấm riêng của Giáo viên ({selectedCustomRules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview_ai')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'preview_ai'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-500" />
            <span>4. Xem trước Prompt AI Gemini</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: THÔNG TIN ĐỀ & HƯỚNG DẪN CHẤM */}
          {activeTab === 'info' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              {/* Row 1: Tên đề */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đề thi / Bài kiểm tra <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-rubric-title"
                  type="text"
                  required
                  placeholder="VD: Khảo sát chất lượng Ngữ văn 12 - Ôn thi Tốt nghiệp THPT 2025"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Row 2: Môn, Khối, Năm học, Loại bài */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Khối lớp
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="12">Khối 12 (Ôn thi Tốt nghiệp)</option>
                    <option value="11">Khối 11</option>
                    <option value="10">Khối 10</option>
                    <option value="THCS">Khối THCS (Lớp 9)</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={schoolYear}
                    onChange={(e) => setSchoolYear(e.target.value)}
                    placeholder="2024 - 2025"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Loại bài văn <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={essayType}
                    onChange={(e) => setEssayType(e.target.value as EssayType)}
                    className="w-full px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50/50 border border-indigo-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Nghị luận xã hội">1. Nghị luận xã hội</option>
                    <option value="Nghị luận văn học">2. Nghị luận văn học</option>
                    <option value="Đọc hiểu">3. Đọc hiểu</option>
                    <option value="Bài viết tổng hợp">4. Bài viết tổng hợp</option>
                    <option value="Khác">5. Khác</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Thang điểm & Thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Thang điểm đề thi <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.25"
                      min="0.5"
                      max="100"
                      required
                      value={totalScore}
                      onChange={(e) => setTotalScore(parseFloat(e.target.value) || 10.0)}
                      className="w-full px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-500 shrink-0">Điểm</span>
                    {criteriaSum > 0 && Math.abs(criteriaSum - totalScore) > 0.01 && (
                      <button
                        type="button"
                        onClick={handleSyncTotalScore}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold rounded-lg border border-amber-200 cursor-pointer shrink-0"
                        title="Khớp thang điểm theo tổng tiêu chí"
                      >
                        Khớp ({criteriaSum}đ)
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Thời gian làm bài (Phút)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="5"
                      min="15"
                      max="180"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 90)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <span className="text-xs text-slate-500 shrink-0">Phút</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Nội dung đề bài */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nội dung đề bài chi tiết (Ngữ liệu, yêu cầu câu hỏi)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Sẽ được chuyển cho AI làm căn cứ đối chiếu bài làm
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập toàn văn đề bài, đoạn trích đọc hiểu, yêu cầu đề nghị luận xã hội hoặc nghị luận văn học..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Row 5: Hướng dẫn chấm & Đáp án */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Hướng dẫn chấm / Dàn ý đáp án gợi ý
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Dàn ý các ý chính cần có trong bài
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={gradingGuide}
                  onChange={(e) => setGradingGuide(e.target.value)}
                  placeholder="Nhập gợi ý đáp án, các luận điểm cốt lõi, từ khóa quan trọng và mức độ phân hóa học sinh..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Row 6: Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú nội bộ giáo viên
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú lưu trữ (VD: Đề dùng cho đợt thi thử tháng 3, phối hợp tổ Ngữ văn...)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 2: THIẾT LẬP RUBRIC & TIÊU CHÍ */}
          {activeTab === 'rubric' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              {/* Presets Quick Picker */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Nạp nhanh từ Khung Rubric Mẫu chuẩn GDPT 2018
                  </span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Chọn mẫu có sẵn phù hợp với loại bài để tự động điền các tiêu chí và mức điểm chuẩn xác
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {RUBRIC_PRESET_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyPreset(tpl.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      {tpl.name.split('(')[0].replace('Mẫu ', '')} ({tpl.totalScore}đ)
                    </button>
                  ))}
                </div>
              </div>

              {/* Criteria List Controls & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    Danh sách các tiêu chí đánh giá ({criteriaList.length})
                  </h4>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isScoreMatched
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isScoreMatched ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>
                      Tổng điểm tiêu chí: <strong>{criteriaSum}đ</strong> / Thang điểm đề:{' '}
                      <strong>{totalScore}đ</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isScoreMatched && (
                    <button
                      type="button"
                      onClick={handleSyncTotalScore}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 cursor-pointer"
                    >
                      Khớp thang điểm ({criteriaSum}đ)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm tiêu chí mới</span>
                  </button>
                </div>
              </div>

              {/* Criteria Cards Accordion */}
              <div className="space-y-3">
                {criteriaList.map((crit, critIndex) => {
                  const isExpanded = expandedCriterionId === crit.id || expandedCriterionId === null;
                  return (
                    <div
                      key={crit.id}
                      className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden transition-all"
                    >
                      {/* Criterion Header */}
                      <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {critIndex + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Nhập tên tiêu chí..."
                            value={crit.name}
                            onChange={(e) =>
                              handleUpdateCriterion(crit.id, { name: e.target.value })
                            }
                            className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:bg-white px-1.5 py-0.5 rounded focus:outline-none w-full max-w-md"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Score input */}
                          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200">
                            <span className="text-[11px] text-slate-500 font-semibold">Tối đa:</span>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              max="10"
                              value={crit.maxScore}
                              onChange={(e) =>
                                handleUpdateCriterion(crit.id, {
                                  maxScore: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-14 text-xs font-bold text-indigo-700 text-center focus:outline-none"
                            />
                            <span className="text-xs font-bold text-slate-600">đ</span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedCriterionId(expandedCriterionId === crit.id ? '' : crit.id)
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(crit.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa tiêu chí này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Criterion Expanded Body */}
                      {isExpanded && (
                        <div className="p-4 space-y-4 text-xs">
                          {/* Description */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Mô tả yêu cầu đạt được
                            </label>
                            <input
                              type="text"
                              placeholder="VD: Xác định trúng và sáng rõ vấn đề nghị luận theo đề bài..."
                              value={crit.description}
                              onChange={(e) =>
                                handleUpdateCriterion(crit.id, { description: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {/* AI Guidance */}
                          <div>
                            <label className="block text-[11px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Gợi ý riêng cho AI khi chấm tiêu chí này</span>
                            </label>
                            <input
                              type="text"
                              placeholder="VD: Không bắt buộc trích nguyên văn đề, chỉ cần nêu đúng từ khóa trọng tâm..."
                              value={crit.aiGuidance || ''}
                              onChange={(e) =>
                                handleUpdateCriterion(crit.id, { aiGuidance: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-indigo-50/40 border border-indigo-100 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                            />
                          </div>

                          {/* Score Levels Table */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                Các mức đánh giá điểm chi tiết ({crit.levels?.length || 0} mức)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddLevel(crit.id)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Thêm mức đánh giá</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {crit.levels?.map((level, lvlIdx) => (
                                <div
                                  key={level.id || lvlIdx}
                                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                                >
                                  {/* Score level badge / input */}
                                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                                    <input
                                      type="number"
                                      step="0.05"
                                      min="0"
                                      max={crit.maxScore}
                                      value={level.score}
                                      onChange={(e) =>
                                        handleUpdateLevel(crit.id, lvlIdx, {
                                          score: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="w-12 text-xs font-bold text-slate-900 text-center focus:outline-none"
                                    />
                                    <span className="text-[11px] font-bold text-slate-500">đ</span>
                                  </div>

                                  {/* Label / Name */}
                                  <input
                                    type="text"
                                    placeholder="Nhãn (VD: 0.25đ / Chưa đạt)"
                                    value={level.label || ''}
                                    onChange={(e) =>
                                      handleUpdateLevel(crit.id, lvlIdx, {
                                        label: e.target.value,
                                      })
                                    }
                                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 shrink-0"
                                  />

                                  {/* Description */}
                                  <input
                                    type="text"
                                    placeholder="Mô tả mức đánh giá (VD: Xác định chưa đầy đủ vấn đề)..."
                                    value={level.description}
                                    onChange={(e) =>
                                      handleUpdateLevel(crit.id, lvlIdx, {
                                        description: e.target.value,
                                      })
                                    }
                                    className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLevel(crit.id, lvlIdx)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Xóa mức này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: YÊU CẦU CHẤM RIÊNG CỦA GIÁO VIÊN */}
          {activeTab === 'teacher_rules' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Định hướng Sư phạm & Tùy biến AI
                </span>
                <p className="text-amber-800 leading-relaxed">
                  Các yêu cầu dưới đây sẽ được nạp trực tiếp vào câu lệnh (System Prompt) cho AI Gemini
                  khi chấm bài học sinh. Giúp AI hiểu tinh thần chấm của thầy cô: linh hoạt, tôn trọng cá
                  tính sáng tạo và không máy móc rập khuôn.
                </p>
              </div>

              {/* Standard Checkbox Rules */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chọn các quy tắc chấm ưu tiên:
                </label>

                <div className="space-y-2">
                  {DEFAULT_TEACHER_CUSTOM_RULES.map((rule) => {
                    const isChecked = selectedCustomRules.includes(rule);
                    return (
                      <div
                        key={rule}
                        onClick={() => handleToggleRule(rule)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-indigo-600 text-white'
                              : 'border border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            isChecked ? 'text-indigo-950 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          {rule}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom User-defined Rule */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Thêm lưu ý riêng khác của thầy cô:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="VD: Với lớp 12D1 chuyên văn, yêu cầu trích dẫn ít nhất 1 câu lý luận văn học..."
                    value={newCustomRuleInput}
                    onChange={(e) => setNewCustomRuleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRule();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomRule}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                  >
                    + Thêm
                  </button>
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Chỉ dẫn tự do bổ sung cho Gemini AI (Prompt tự do)
                </label>
                <textarea
                  rows={3}
                  value={teacherCustomPrompt}
                  onChange={(e) => setTeacherCustomPrompt(e.target.value)}
                  placeholder="Nhập thêm bất kỳ yêu cầu cụ thể nào khác về giọng văn, phong cách nhận xét, hoặc thang đo khắt khe..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: XEM TRƯỚC PROMPT AI GEMINI */}
          {activeTab === 'preview_ai' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    Cấu trúc Dữ liệu Đầy đủ Sẽ Chuyển tới Gemini AI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    Structured Prompt Payload
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Bao gồm toàn bộ: ĐỀ BÀI + HƯỚNG DẪN CHẤM + RUBRIC TIÊU CHÍ + YÊU CẦU RIÊNG CỦA GIÁO
                  VIÊN + BÀI VIẾT CỦA HỌC SINH.
                </p>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {promptPreview}
                </pre>
              </div>
            </div>
          )}
        </form>

        {/* Modal Bottom Footer & Validation Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status summary */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                isScoreMatched
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {isScoreMatched ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>
                Tổng điểm: {criteriaSum} / {totalScore}đ{' '}
                {isScoreMatched ? '(Hợp lệ)' : '(Chưa khớp thang điểm đề)'}
              </span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              id="btn-save-rubric"
              type="button"
              onClick={handleSubmit}
              disabled={!isScoreMatched || !title.trim()}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer ${
                isScoreMatched && title.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-600/20'
                  : 'bg-slate-400 cursor-not-allowed opacity-70'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingRubric ? 'Lưu cập nhật' : 'Hoàn tất & Tạo đề'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
