import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Save,
  ShieldCheck,
  FileCheck2,
  Copy,
  PenTool,
  Sliders,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { EssaySubmission, ExamRubric, CommentBankItem } from '../types';
import { useToast } from './Toast';

interface EssayGradingModalProps {
  submission: EssaySubmission | null;
  rubric?: ExamRubric;
  commentBank: CommentBankItem[];
  isOpen: boolean;
  onClose: () => void;
  onSaveGrading: (updatedSubmission: EssaySubmission) => void;
  onNavigateSubmission?: (direction: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const EssayGradingModal: React.FC<EssayGradingModalProps> = ({
  submission,
  rubric,
  commentBank,
  isOpen,
  onClose,
  onSaveGrading,
  onNavigateSubmission,
  hasPrev = false,
  hasNext = false,
}) => {
  const { showToast } = useToast();

  if (!isOpen || !submission) return null;

  // Local state for grading
  const [activeTab, setActiveTab] = useState<'rubric' | 'feedback' | 'corrections'>('rubric');
  const [essayViewMode, setEssayViewMode] = useState<'text' | 'images'>('text');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showCommentBankDrawer, setShowCommentBankDrawer] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Criteria scores state
  const [criteriaScores, setCriteriaScores] = useState<
    { id: string; name: string; maxScore: number; aiScore: number; teacherScore: number; aiReasoning: string }[]
  >([]);

  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [teacherNotesPrivate, setTeacherNotesPrivate] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const pageImages = submission?.pageImages || [];

  // Initialize or update state when submission changes
  useEffect(() => {
    if (submission) {
      if (submission.pageImages && submission.pageImages.length > 0 && !submission.essayContent) {
        setEssayViewMode('images');
      } else {
        setEssayViewMode('text');
      }
      if (submission.aiGrading) {
        setCriteriaScores(
          submission.aiGrading.criteriaScores.map((c) => ({
            ...c,
            teacherScore:
              submission.teacherGrading?.criteriaScores.find((ts) => ts.id === c.id)?.score ?? c.aiScore,
          }))
        );
      } else {
        // Default criteria if not yet AI graded
        setCriteriaScores([
          {
            id: 'crit-dh',
            name: 'I. Đọc hiểu văn bản (4.0đ)',
            maxScore: 4.0,
            aiScore: 3.5,
            teacherScore: 3.5,
            aiReasoning: 'Trả lời đầy đủ các câu hỏi nhận biết, thông hiểu và vận dụng.',
          },
          {
            id: 'crit-nlxh',
            name: 'II. Nghị luận xã hội (2.0đ)',
            maxScore: 2.0,
            aiScore: 1.75,
            teacherScore: 1.75,
            aiReasoning: 'Đoạn văn đúng dung lượng, lập luận rõ, có dẫn chứng thực tế.',
          },
          {
            id: 'crit-nlvh',
            name: 'III. Nghị luận văn học (4.0đ)',
            maxScore: 4.0,
            aiScore: 3.25,
            teacherScore: 3.25,
            aiReasoning: 'Cảm thụ tốt, có chất văn, cần bổ sung phần tổng kết nghệ thuật.',
          },
        ]);
      }

      setTeacherFeedback(
        submission.teacherGrading?.finalFeedback ||
          submission.aiGrading?.generalFeedback ||
          'Bài làm nắm chắc kiến thức cơ bản, diễn đạt mạch lạc.'
      );
      setTeacherNotesPrivate(submission.teacherGrading?.privateNotes || '');
      setIsApproved(submission.status === 'teacher_reviewed');
    }
  }, [submission]);

  // Calculate current teacher final score
  const totalTeacherScore = Number(
    criteriaScores.reduce((acc, curr) => acc + (Number(curr.teacherScore) || 0), 0).toFixed(2)
  );

  const totalAiScore = submission.aiGrading?.overallScore || totalTeacherScore;

  const handleScoreChange = (id: string, newScore: number) => {
    setCriteriaScores((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const boundedScore = Math.max(0, Math.min(c.maxScore, newScore));
          return { ...c, teacherScore: boundedScore };
        }
        return c;
      })
    );
  };

  const handleInsertComment = (text: string) => {
    setTeacherFeedback((prev) => (prev ? `${prev} ${text}` : text));
    showToast('Đã chèn nhận xét vào ô đánh giá!', 'info');
    setShowCommentBankDrawer(false);
  };

  const handleSave = (approve: boolean = false) => {
    const updated: EssaySubmission = {
      ...submission,
      status: approve ? 'teacher_reviewed' : submission.status === 'pending' ? 'ai_graded' : submission.status,
      teacherGrading: {
        finalScore: totalTeacherScore,
        criteriaScores: criteriaScores.map((c) => ({ id: c.id, score: c.teacherScore })),
        finalFeedback: teacherFeedback,
        privateNotes: teacherNotesPrivate,
        reviewedAt: new Date().toISOString(),
        isApproved: approve,
      },
    };

    onSaveGrading(updated);
    if (approve) {
      showToast(`Đã duyệt & khóa điểm (${totalTeacherScore}đ) cho học sinh ${submission.studentName}!`, 'success');
      onClose();
    } else {
      showToast('Đã lưu bản nháp chấm bài.', 'info');
    }
  };

  const handleTriggerAiReGrading = async () => {
    setIsLoadingAi(true);
    showToast('AI đang phân tích lại bài viết và đối chiếu ma trận Rubric...', 'info');

    try {
      const response = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayContent: submission.essayContent,
          examTitle: submission.examTitle,
          studentName: submission.studentName,
          promptSocial: rubric?.promptSocial,
          promptLiterature: rubric?.promptLiterature,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const aiData = data.data;
        const newCriteria = aiData.criteriaScores.map((c: any) => ({
          ...c,
          teacherScore: c.aiScore,
        }));

        setCriteriaScores(newCriteria);
        setTeacherFeedback(aiData.generalFeedback);

        const updatedSub: EssaySubmission = {
          ...submission,
          status: 'ai_graded',
          aiGrading: aiData,
        };

        onSaveGrading(updatedSub);
        showToast('AI đã hoàn tất phân tích đề xuất điểm mới!', 'success');
      } else {
        showToast('Không thể kết nối AI, áp dụng mô hình phân tích tiêu chuẩn.', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gọi AI chấm bài. Đã chuyển sang chế độ thủ công.', 'error');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-essay-grading"
        className="bg-white w-full max-w-7xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Top Bar / Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {submission.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{submission.studentName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                  {submission.studentCode}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">
                  {submission.className}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                    submission.status === 'teacher_reviewed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : submission.status === 'ai_graded'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {submission.status === 'teacher_reviewed'
                    ? '✓ Giáo viên đã duyệt'
                    : submission.status === 'ai_graded'
                    ? 'AI đã phân tích'
                    : 'Chờ chấm'}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md">
                {submission.examTitle} • Nộp: {submission.submittedAt}
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2">
            {onNavigateSubmission && (
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 mr-2">
                <button
                  id="btn-grading-prev-student"
                  onClick={() => onNavigateSubmission('prev')}
                  disabled={!hasPrev}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Học sinh trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-400 px-1 font-medium">|</span>
                <button
                  id="btn-grading-next-student"
                  onClick={() => onNavigateSubmission('next')}
                  disabled={!hasNext}
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Học sinh kế tiếp"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Split Screen */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Student's Essay Text (7 cols) */}
          <div className="lg:col-span-7 border-r border-slate-200 flex flex-col bg-slate-50/40 overflow-hidden">
            {/* Toolbar above essay */}
            <div className="px-5 py-2.5 border-b border-slate-200/80 bg-white flex items-center justify-between text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setEssayViewMode('text')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                      essayViewMode === 'text'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Văn bản (OCR)
                  </button>
                  {pageImages.length > 0 && (
                    <button
                      onClick={() => setEssayViewMode('images')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                        essayViewMode === 'images'
                          ? 'bg-white text-indigo-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Ảnh bài viết</span>
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {pageImages.length}
                      </span>
                    </button>
                  )}
                </div>

                {essayViewMode === 'text' && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                    {submission.wordCount || (submission.essayContent ? submission.essayContent.split(/\s+/).length : 0)} từ
                  </span>
                )}
              </div>

              {/* Font size adjustments if in text mode */}
              {essayViewMode === 'text' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Cỡ chữ:</span>
                  <button
                    onClick={() => setFontSize('sm')}
                    className={`px-2 py-0.5 rounded text-xs ${fontSize === 'sm' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('base')}
                    className={`px-2 py-0.5 rounded text-xs ${fontSize === 'base' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    className={`px-2 py-0.5 rounded text-xs ${fontSize === 'lg' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}
                  >
                    A+
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <span>Trang {selectedImageIdx + 1}/{pageImages.length}</span>
                </div>
              )}
            </div>

            {/* Essay Text or Page Images Display */}
            {essayViewMode === 'text' ? (
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                <div
                  className={`max-w-2xl mx-auto space-y-4 text-slate-800 leading-relaxed font-serif ${
                    fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
                  }`}
                >
                  {(submission.essayContent || 'Chưa có nội dung nhận diện văn bản OCR.').split('\n\n').map((paragraph, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg hover:bg-indigo-50/30 transition-colors border border-transparent hover:border-indigo-100 relative group"
                    >
                      <span className="absolute -left-3 top-3 text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Đoạn {index + 1}
                      </span>
                      <p className="whitespace-pre-line">{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
                {/* Main page image display */}
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                  {pageImages[selectedImageIdx] && (
                    <img
                      src={pageImages[selectedImageIdx].previewUrl}
                      alt={`Trang ${selectedImageIdx + 1}`}
                      referrerPolicy="no-referrer"
                      style={{ transform: `rotate(${pageImages[selectedImageIdx].rotation || 0}deg)` }}
                      className="max-h-full max-w-full object-contain rounded shadow-2xl transition-transform duration-200"
                    />
                  )}
                </div>

                {/* Thumbnails strip */}
                <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
                  {pageImages.map((page, idx) => (
                    <button
                      key={page.id || idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative shrink-0 w-14 h-18 rounded border-2 overflow-hidden transition-all ${
                        selectedImageIdx === idx
                          ? 'border-indigo-500 ring-2 ring-indigo-400/50 scale-105'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={page.previewUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-white text-[9px] font-bold text-center py-0.5">
                        Trang {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom prompt reminder bar */}
            <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between shrink-0">
              <span className="truncate max-w-md">
                <span className="font-semibold text-slate-700">Đề bài:</span> {submission.examTitle}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(submission.essayContent);
                  showToast('Đã sao chép toàn bộ bài làm của học sinh!', 'info');
                }}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Copy className="w-3.5 h-3.5" />
                Sao chép
              </button>
            </div>
          </div>

          {/* Right Column: AI Assistant & Teacher Workspace (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
            {/* Score Comparison Hero Box */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Trợ lý AI đề xuất • Thầy/Cô quyết định</span>
                </div>

                <button
                  id="btn-re-grade-ai"
                  onClick={handleTriggerAiReGrading}
                  disabled={isLoadingAi}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAi ? 'Đang chấm lại...' : 'AI Chấm lại'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* AI Score */}
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex flex-col">
                  <span className="text-[11px] text-indigo-200 font-medium">AI Đề xuất</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-indigo-100">{totalAiScore}</span>
                    <span className="text-xs text-indigo-300">/ 10</span>
                  </div>
                </div>

                {/* Teacher Final Score */}
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex flex-col">
                  <span className="text-[11px] text-emerald-300 font-semibold">Điểm Thầy/Cô chốt</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white">{totalTeacherScore}</span>
                    <span className="text-xs text-emerald-200">/ 10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Rubric, Feedback, Góp ý chi tiết) */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab('rubric')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'rubric'
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Thang điểm Rubric</span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'feedback'
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Nhận xét & Lời khuyên</span>
              </button>

              <button
                onClick={() => setActiveTab('corrections')}
                className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'corrections'
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Gợi ý sửa lỗi ({submission.aiGrading?.corrections?.length || 0})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {activeTab === 'rubric' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Thầy/Cô có thể điều chỉnh điểm từng tiêu chí:</span>
                    <span className="font-semibold text-slate-700">Tổng: {totalTeacherScore}/10</span>
                  </div>

                  {criteriaScores.map((crit) => (
                    <div
                      key={crit.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800">{crit.name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-slate-400">AI: {crit.aiScore}đ •</span>
                          <span className="text-xs font-semibold text-slate-700">Chấm:</span>
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max={crit.maxScore}
                            value={crit.teacherScore}
                            onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-center font-bold text-indigo-700 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                          <span className="text-xs text-slate-500">/ {crit.maxScore}đ</span>
                        </div>
                      </div>

                      {/* AI reasoning text */}
                      {crit.aiReasoning && (
                        <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed">
                          <span className="font-semibold text-indigo-600">AI giải thích:</span> {crit.aiReasoning}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="space-y-4">
                  {/* AI Strengths & Weaknesses Chips */}
                  {submission.aiGrading && (
                    <div className="space-y-2.5">
                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs">
                        <span className="font-bold text-emerald-800 block mb-1">Ưu điểm nổi bật (AI phân tích):</span>
                        <ul className="list-disc list-inside space-y-1 text-emerald-700">
                          {submission.aiGrading.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                        <span className="font-bold text-amber-800 block mb-1">Cần khắc phục (AI phân tích):</span>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                          {submission.aiGrading.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800">
                        Lời nhận xét của Thầy/Cô dành cho học sinh:
                      </label>
                      <button
                        id="btn-open-comment-bank"
                        type="button"
                        onClick={() => setShowCommentBankDrawer(true)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        + Ngân hàng nhận xét
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={teacherFeedback}
                      onChange={(e) => setTeacherFeedback(e.target.value)}
                      placeholder="Nhập lời khuyên, động viên hoặc đánh giá bài làm..."
                      className="w-full p-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed placeholder:text-slate-400"
                    />
                  </div>

                  {/* Private Notes for Teacher */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">
                      Ghi chú nội bộ giáo viên (Học sinh không nhìn thấy):
                    </label>
                    <input
                      type="text"
                      value={teacherNotesPrivate}
                      onChange={(e) => setTeacherNotesPrivate(e.target.value)}
                      placeholder="VD: Cần kèm thêm lý luận văn học tuần sau..."
                      className="w-full px-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'corrections' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Các phát hiện về từ ngữ, câu văn và dẫn chứng cần điều chỉnh:
                  </p>

                  {submission.aiGrading?.corrections && submission.aiGrading.corrections.length > 0 ? (
                    submission.aiGrading.corrections.map((corr) => (
                      <div
                        key={corr.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-[11px]">
                            "{corr.quote}"
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            Đoạn {corr.paragraphIndex + 1}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          <span className="font-semibold text-rose-600">Vấn đề:</span> {corr.issue}
                        </p>
                        <p className="text-slate-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                          <span className="font-semibold text-emerald-700">Gợi ý sửa:</span> {corr.suggestion}
                        </p>
                        <button
                          onClick={() => {
                            setTeacherFeedback((prev) => `${prev}\n- Góp ý: ${corr.suggestion}`);
                            showToast('Đã thêm góp ý vào nhận xét của Thầy/Cô!', 'info');
                          }}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          + Thêm vào nhận xét bài viết
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Không phát hiện lỗi diễn đạt hoặc ngữ pháp nghiêm trọng.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                id="btn-save-draft"
                onClick={() => handleSave(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Lưu nháp</span>
              </button>

              <button
                id="btn-approve-grading"
                onClick={() => handleSave(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Phê duyệt & Khóa điểm ({totalTeacherScore}đ)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Bank Slide-out Drawer */}
      {showCommentBankDrawer && (
        <div className="fixed inset-0 z-60 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-slate-900">Ngân hàng nhận xét mẫu</h4>
              </div>
              <button
                onClick={() => setShowCommentBankDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <p className="text-xs text-slate-500 mb-2">Nhấp vào nhận xét để chèn nhanh vào bài:</p>
              {commentBank.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleInsertComment(item.text)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all cursor-pointer group text-xs space-y-1.5"
                >
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <p className="text-slate-800 leading-relaxed group-hover:text-indigo-950 font-medium">
                    "{item.text}"
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    {item.tags.map((t, idx) => (
                      <span key={idx} className="text-[10px] text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
