export type BatchStatus = 'draft' | 'in_progress' | 'completed';

// Trạng thái mở rộng cho bài làm theo yêu cầu Module Đợt Chấm Bài
export type SubmissionStatus =
  | 'Chưa xử lý'
  | 'Đang đọc'
  | 'Đã đọc'
  | 'AI đang chấm'
  | 'AI đã chấm'
  | 'Giáo viên đã duyệt'
  | 'Cần kiểm tra';

export type OcrStatus = 'Chưa đọc' | 'Đang đọc' | 'Đã đọc' | 'Lỗi đọc';
export type AiGradingStatus = 'Chưa chấm' | 'AI đang chấm' | 'AI đã chấm' | 'Cần kiểm tra';
export type TeacherReviewStatus = 'Chưa duyệt' | 'Đang xem' | 'Giáo viên đã duyệt' | 'Yêu cầu chấm lại';

// Tương thích ngược với type cũ
export type EssayStatus = 'pending' | 'ai_graded' | 'teacher_reviewed' | SubmissionStatus;

export interface PageImageItem {
  id: string;
  url: string;
  name: string;
  pageNumber: number;
  rotation: number; // 0, 90, 180, 270
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export type NavTabId =
  | 'dashboard'
  | 'batches'
  | 'essays'
  | 'students'
  | 'classes'
  | 'exams'
  | 'analytics'
  | 'comment_bank'
  | 'settings';

export interface CriterionScore {
  id: string;
  name: string;
  maxScore: number;
  aiScore: number;
  teacherScore: number;
  aiReasoning: string;
  guide?: string;
}

export interface SuggestedCorrection {
  id: string;
  quote: string;
  paragraphIndex: number;
  issue: string;
  suggestion: string;
  type: 'grammar' | 'expression' | 'argument' | 'knowledge';
}

export interface AiGradingResult {
  overallScore: number;
  criteriaScores: CriterionScore[];
  strengths: string[];
  weaknesses: string[];
  generalFeedback: string;
  corrections: SuggestedCorrection[];
  evaluatedAt: string;
  modelUsed?: string;
}

export interface TeacherGradingResult {
  finalScore: number;
  criteriaScores: { id: string; score: number; note?: string }[];
  finalFeedback: string;
  privateNotes?: string;
  reviewedAt: string;
  isApproved: boolean;
}

export interface EssaySubmission {
  id: string;
  batchId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  examId: string;
  examTitle: string;
  
  // Page Images & Documents
  pageImages?: PageImageItem[];
  pageCount?: number;
  
  // Trạng thái theo yêu cầu
  status: SubmissionStatus | EssayStatus;
  uploadedAt?: string;
  ocrStatus?: OcrStatus;
  aiStatus?: AiGradingStatus;
  teacherStatus?: TeacherReviewStatus;
  aiScore?: number;
  teacherScore?: number;
  
  // Nội dung trích xuất hoặc dán
  essayContent: string;
  submittedAt: string;
  hasHandwritingImage?: boolean;
  handwritingImageUrl?: string;
  wordCount: number;
  
  // Kết quả chấm chi tiết
  aiGrading?: AiGradingResult;
  teacherGrading?: TeacherGradingResult;
  notes?: string;
}

export interface GradingBatch {
  id: string;
  name: string;
  classId: string;
  className: string;
  examId: string;
  examTitle: string;
  
  // Thống kê đợt chấm
  totalEssays: number;
  uploadedCount?: number;
  processingCount?: number;
  gradedByAiCount: number;
  reviewedByTeacherCount: number;
  averageScore: number;
  
  status: BatchStatus;
  gradingDate?: string; // Ngày chấm
  dueDate: string;
  createdAt: string;
  academicYear: string;
  semester: string;
  notes?: string;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  classId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility & convenience aliases
  name?: string;
  code?: string;
  className?: string;
  avatar?: string;
  essayCount?: number;
  averageScore?: number;
  latestScore?: number;
  strengthsSummary?: string;
  needsImprovementSummary?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: '10' | '11' | '12';
  schoolYear: string;
  notes?: string;
  studentCount?: number;
  gradedEssaysCount?: number;
  latestAverageScore?: number;
  averageScore?: number;
  teacherInCharge?: string;
  targetGraduationRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProgressHistoryItem {
  essayId: string;
  batchId: string;
  batchName: string;
  examId: string;
  examTitle: string;
  submittedAt: string;
  status: EssayStatus;
  aiScore?: number;
  teacherScore?: number;
  finalScore?: number;
  generalFeedback?: string;
  teacherFeedback?: string;
  strengths: string[];
  weaknesses: string[];
  wordCount: number;
}

export type EssayType =
  | 'Nghị luận xã hội'
  | 'Nghị luận văn học'
  | 'Đọc hiểu'
  | 'Bài viết tổng hợp'
  | 'Khác';

export interface RubricScoreLevel {
  id?: string;
  score: number;
  label?: string;
  description: string;
}

export interface DetailedRubricCriterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  levels: RubricScoreLevel[];
  aiGuidance?: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
  description: string;
  scoringGuide: {
    excellent: string;
    good: string;
    average: string;
    weak: string;
  };
}

export interface RubricSection {
  id: string;
  title: string;
  maxScore: number;
  criteria: RubricCriterion[];
}

export interface ExamRubric {
  id: string;
  title: string;
  subject?: string;
  grade: '10' | '11' | '12' | 'THCS' | 'Khác' | string;
  schoolYear?: string;
  essayType?: EssayType | string;
  type?: 'Tốt nghiệp THPT 2025' | 'Kiểm tra định kỳ' | 'Khảo sát chất lượng' | 'Luyện đề chuyên sâu' | string;
  timeLimitMinutes?: number;
  totalScore: number;
  
  // Content & Prompts
  content?: string;
  readingPassage?: string;
  promptSocial?: string;
  promptLiterature?: string;
  
  // Grading guide
  gradingGuide?: string;
  
  // Structured Rubric Criteria
  criteriaList?: DetailedRubricCriterion[];
  sections?: RubricSection[];
  
  // Teacher custom rules for AI & notes
  teacherCustomRules?: string[];
  teacherCustomPrompt?: string;
  notes?: string;
  
  // Status & metadata
  status?: 'ready' | 'draft' | 'in_use';
  usageCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentBankItem {
  id: string;
  category: 'Khen ngợi' | 'Lập luận & Dẫn chứng' | 'Diễn đạt & Dùng từ' | 'Chính tả & Ngữ pháp' | 'Mở bài - Kết bài' | 'Liên hệ thực tế';
  text: string;
  tags: string[];
  usageCount: number;
}

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  school: string;
  email: string;
  avatar: string;
  aiStrictness: 'gentle' | 'standard' | 'rigorous';
  autoSuggestComments: boolean;
  preferredRubricStandard: string;
}
