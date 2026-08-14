import React, { useState } from 'react';
import {
  X,
  Award,
  BookOpen,
  Edit,
  Copy,
  FolderPlus,
  Bot,
  FileText,
  Clock,
  CheckCircle2,
  Sliders,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExamRubric, GradingBatch } from '../types';
import { examRubricService } from '../services/examRubricService';
import { useToast } from './Toast';

interface ExamRubricDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubric: ExamRubric | null;
  batches?: GradingBatch[];
  onEdit: (rubric: ExamRubric) => void;
  onDuplicate: (rubric: ExamRubric) => void;
  onOpenCreateBatch?: (rubricId: string) => void;
}

export const ExamRubricDetailModal: React.FC<ExamRubricDetailModalProps> = ({
  isOpen,
  onClose,
  rubric,
  batches = [],
  onEdit,
  onDuplicate,
  onOpenCreateBatch,
}) => {
  const { showToast } = useToast();
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [expandedCriterionId, setExpandedCriterionId] = useState<string | null>(null);

  if (!isOpen || !rubric) return null;

  // Find batches using this exam
  const relatedBatches = batches.filter(
    (b) => b.examId === rubric.id || b.examTitle === rubric.title
  );

  const criteriaCount = rubric.criteriaList?.length || 0;

  const promptPreview = examRubricService.buildGeminiGradingPromptPayload(
    rubric,
    'Ví dụ: Trích bài làm văn của học sinh khi chấm thực tế...'
  );

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptPreview);
    showToast('Đã sao chép cấu trúc Prompt AI vào bộ nhớ tạm!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-rubric-detail"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {rubric.essayType || 'Ngữ văn'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Khối {rubric.grade}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Năm học {rubric.schoolYear || '2024 - 2025'}
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Thang {rubric.totalScore} điểm
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{rubric.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {rubric.timeLimitMinutes || 90} phút
                </span>
                <span>•</span>
                <span>{criteriaCount} tiêu chí đánh giá</span>
                <span>•</span>
                <span>{relatedBatches.length} đợt chấm đang dùng</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(rubric)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-indigo-600" />
              <span>Chỉnh sửa</span>
            </button>

            <button
              onClick={() => onDuplicate(rubric)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Sao chép làm đề mới</span>
            </button>

            <button
              onClick={() => setShowAiPrompt(!showAiPrompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>{showAiPrompt ? 'Ẩn Prompt Gemini' : 'Xem Prompt Gemini'}</span>
            </button>
          </div>

          {onOpenCreateBatch && (
            <button
              onClick={() => onOpenCreateBatch(rubric.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Áp dụng vào đợt chấm mới</span>
            </button>
          )}
        </div>

        {/* Modal Detail Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* AI Prompt Preview Drawer */}
          {showAiPrompt && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  Cấu trúc Payload gửi đến Gemini AI
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Sao chép Prompt</span>
                </button>
              </div>
              <pre className="p-3.5 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {promptPreview}
              </pre>
            </div>
          )}

          {/* 1. Nội dung đề bài */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Nội dung Đề bài & Ngữ liệu</span>
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {rubric.content || rubric.readingPassage || 'Chưa có nội dung đề chi tiết.'}
            </div>
          </div>

          {/* 2. Hướng dẫn chấm / Đáp án */}
          {rubric.gradingGuide && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Hướng dẫn chấm & Đáp án tham chiếu</span>
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 text-emerald-950 leading-relaxed whitespace-pre-wrap">
                {rubric.gradingGuide}
              </div>
            </div>
          )}

          {/* 3. Yêu cầu chấm riêng của giáo viên */}
          {rubric.teacherCustomRules && rubric.teacherCustomRules.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Yêu cầu chấm riêng của Giáo viên ({rubric.teacherCustomRules.length})</span>
                </h4>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                <ul className="space-y-1.5">
                  {rubric.teacherCustomRules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                {rubric.teacherCustomPrompt && (
                  <p className="text-amber-900 font-medium italic pt-2 border-t border-amber-200/50">
                    * Lưu ý bổ sung: "{rubric.teacherCustomPrompt}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 4. Khung Ma trận Rubric Tiêu chí chi tiết */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Khung Tiêu chí Rubric Chi tiết (Tổng: {rubric.totalScore}đ)</span>
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                {criteriaCount} tiêu chí
              </span>
            </div>

            <div className="space-y-3">
              {rubric.criteriaList && rubric.criteriaList.length > 0 ? (
                rubric.criteriaList.map((crit, idx) => {
                  const isExpanded = expandedCriterionId === crit.id || expandedCriterionId === null;
                  return (
                    <div
                      key={crit.id || idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                    >
                      <div
                        onClick={() =>
                          setExpandedCriterionId(expandedCriterionId === crit.id ? '' : crit.id)
                        }
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{crit.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Tối đa: {crit.maxScore}đ
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white space-y-3 border-t border-slate-100">
                          <p className="text-slate-600">{crit.description}</p>

                          {crit.aiGuidance && (
                            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
                              <Bot className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                              <p className="text-indigo-900 text-[11px]">
                                <strong>Gợi ý AI:</strong> {crit.aiGuidance}
                              </p>
                            </div>
                          )}

                          {/* Level boxes */}
                          {crit.levels && crit.levels.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                              {crit.levels.map((lvl, lIdx) => (
                                <div
                                  key={lvl.id || lIdx}
                                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 text-[11px]">
                                      {lvl.label || `${lvl.score} điểm`}
                                    </span>
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-slate-200">
                                      {lvl.score}đ
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-normal">
                                    {lvl.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-center">
                  Đề thi này sử dụng cấu trúc phân nhóm truyền thống.
                </div>
              )}
            </div>
          </div>

          {/* 5. Ghi chú */}
          {rubric.notes && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
              <strong>Ghi chú:</strong> {rubric.notes}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
