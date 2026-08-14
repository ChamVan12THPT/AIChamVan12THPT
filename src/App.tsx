import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastProvider } from './components/Toast';
import { CreateBatchModal } from './components/CreateBatchModal';
import { EssayGradingModal } from './components/EssayGradingModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BatchesView } from './views/BatchesView';
import { EssaysView } from './views/EssaysView';
import { StudentsView } from './views/StudentsView';
import { ClassesView } from './views/ClassesView';
import { ExamsRubricView } from './views/ExamsRubricView';
import { AnalyticsView } from './views/AnalyticsView';
import { CommentBankView } from './views/CommentBankView';
import { SettingsView } from './views/SettingsView';

// Mock Initial Data
import {
  initialClasses,
  initialBatches,
  initialSubmissions,
  initialExamsRubrics as initialRubrics,
  initialStudents,
  initialCommentBank,
  initialTeacherProfile,
} from './data/mockData';
import { classStudentService } from './services/classStudentService';

import {
  NavTabId,
  ClassRoom,
  GradingBatch,
  EssaySubmission,
  ExamRubric,
  Student,
  CommentBankItem,
  TeacherProfile,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');

  // Application State backed by Service / LocalStorage
  const [classes, setClasses] = useState<ClassRoom[]>(() => classStudentService.getClasses());
  const [batches, setBatches] = useState<GradingBatch[]>(initialBatches);
  const [submissions, setSubmissions] = useState<EssaySubmission[]>(initialSubmissions);
  const [rubrics, setRubrics] = useState<ExamRubric[]>(initialRubrics);
  const [students, setStudents] = useState<Student[]>(() => classStudentService.getStudents());
  const [commentBank, setCommentBank] = useState<CommentBankItem[]>(initialCommentBank);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(initialTeacherProfile);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Navigation state
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [selectedGradingSubmission, setSelectedGradingSubmission] = useState<EssaySubmission | null>(null);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | undefined>(undefined);

  // Class Management Handlers
  const handleAddClass = (data: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }) => {
    const newCls = classStudentService.createClass(data);
    setClasses(classStudentService.getClasses());
  };

  const handleUpdateClass = (id: string, data: Partial<ClassRoom>) => {
    classStudentService.updateClass(id, data);
    setClasses(classStudentService.getClasses());
  };

  const handleDeleteClass = (id: string) => {
    classStudentService.deleteClass(id);
    setClasses(classStudentService.getClasses());
    setStudents(classStudentService.getStudents());
  };

  // Student Management Handlers
  const handleAddStudent = (data: {
    studentCode: string;
    fullName: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    classId: string;
    notes?: string;
  }) => {
    classStudentService.createStudent(data);
    setStudents(classStudentService.getStudents());
    setClasses(classStudentService.getClasses());
  };

  const handleUpdateStudent = (id: string, data: Partial<Student>) => {
    classStudentService.updateStudent(id, data);
    setStudents(classStudentService.getStudents());
    setClasses(classStudentService.getClasses());
  };

  const handleDeleteStudent = (id: string) => {
    classStudentService.deleteStudent(id);
    setStudents(classStudentService.getStudents());
    setClasses(classStudentService.getClasses());
  };

  const handleBulkImportStudents = (
    classId: string,
    importedList: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      notes?: string;
    }>,
    overwriteExisting: boolean
  ) => {
    classStudentService.bulkImportStudents(classId, importedList, { overwriteExisting });
    setStudents(classStudentService.getStudents());
    setClasses(classStudentService.getClasses());
  };

  // Calculate dynamic badges for Sidebar
  const pendingEssaysCount = submissions.filter((s) => s.status === 'pending').length;
  const inProgressBatchesCount = batches.filter((b) => b.status === 'in_progress').length;

  // Handle batch creation
  const handleCreateBatch = (
    newBatchData: Omit<
      GradingBatch,
      'id' | 'createdAt' | 'gradedByAiCount' | 'reviewedByTeacherCount' | 'averageScore' | 'status'
    >
  ) => {
    const newBatchId = `batch-${Date.now()}`;
    const newBatch: GradingBatch = {
      ...newBatchData,
      id: newBatchId,
      createdAt: new Date().toISOString().split('T')[0],
      gradedByAiCount: 0,
      reviewedByTeacherCount: 0,
      averageScore: 0,
      status: 'in_progress',
    };

    setBatches((prev) => [newBatch, ...prev]);

    // Generate starter submissions for this batch from the selected class
    const targetStudents = students.filter((s) => s.classId === newBatch.classId);
    const generatedSubmissions: EssaySubmission[] = targetStudents.slice(0, 3).map((st, idx) => ({
      id: `sub-${newBatchId}-${idx + 1}`,
      batchId: newBatchId,
      studentId: st.id,
      studentName: st.name,
      studentCode: st.code,
      className: newBatch.className,
      examId: newBatch.examId,
      examTitle: newBatch.examTitle,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      wordCount: 850,
      essayContent: `Bài làm mẫu của ${st.name} cho đợt chấm "${newBatch.name}".\n\nI. PHẦN ĐỌC HIỂU (4.0 điểm)\nCâu 1: Thể thơ tự do. Phương thức biểu đạt chính là biểu cảm kết hợp nghị luận.\nCâu 2: Hình ảnh người lao động được khắc họa qua sự cần cù, nhẫn nại và đức hy sinh thầm lặng.\nCâu 3: Biện pháp tu từ điệp ngữ "dẫu qua bao" nhấn mạnh sức sống bền bỉ và vẻ đẹp tâm hồn kiên cường của con người trước nghịch cảnh.\nCâu 4: Bài học rút ra: Con người cần sống có lý tưởng, biết trân trọng cội nguồn và không ngừng nỗ lực vươn lên trong cuộc sống.\n\nII. PHẦN NGHỊ LUẬN XÃ HỘI (2.0 điểm)\nTrong hành trình hoàn thiện nhân cách của mỗi người trẻ, sự tự lập và lòng kiên trì đóng vai trò như chiếc chìa khóa vạn năng mở ra cánh cửa thành công. Tự lập không chỉ đơn thuần là việc tự lo cho cuộc sống cá nhân, mà còn là bản lĩnh dám chịu trách nhiệm về những quyết định của chính mình. Khi đối mặt với thử thách trong học tập và cuộc sống, người có ý chí sẽ không chùn bước trước thất bại, coi khó khăn là cơ hội tôi luyện bản thân. Ngược lại, lối sống ỷ lại, thụ động sẽ triệt tiêu khả năng sáng tạo và khiến con người dần tụt hậu. Bởi vậy, thế hệ trẻ hôm nay cần rèn luyện tinh thần tự học, dũng cảm đương đầu với thách thức để trở thành công dân có ích cho xã hội.\n\nIII. PHẦN NGHỊ LUẬN VĂN HỌC (4.0 điểm)\nNghệ thuật đích thực bao giờ cũng hướng con người tới cái đẹp chân - thiện - mỹ. Qua đoạn trích tác phẩm, nhà văn đã thể hiện cái nhìn nhân đạo sâu sắc đối với số phận con người. Bằng ngòi bút tài hoa, sự kết hợp nhuần nhuyễn giữa hiện thực và chất thơ lãng mạn, tác giả đã khắc họa vẻ đẹp tâm hồn nhân vật đầy sống động, giàu sức truyền cảm. Tác phẩm không chỉ khẳng định tài năng bậc thầy trong nghệ thuật xây dựng hình tượng mà còn gửi gắm bức thông điệp nhân văn cao cả về niềm tin vào cuộc sống.`,
    }));

    if (generatedSubmissions.length > 0) {
      setSubmissions((prev) => [...generatedSubmissions, ...prev]);
    }

    setActiveTab('batches');
  };

  // Handle saving an essay grading (from Teacher / AI)
  const handleSaveGrading = (updatedSubmission: EssaySubmission) => {
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === updatedSubmission.id ? updatedSubmission : sub))
    );

    // Update batch stats dynamically
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === updatedSubmission.batchId) {
          const batchSubmissions = submissions.map((s) =>
            s.id === updatedSubmission.id ? updatedSubmission : s
          ).filter((s) => s.batchId === b.id);

          const reviewedCount = batchSubmissions.filter((s) => s.status === 'teacher_reviewed').length;
          const aiCount = batchSubmissions.filter(
            (s) => s.status === 'ai_graded' || s.status === 'teacher_reviewed'
          ).length;

          const scoredList = batchSubmissions
            .map((s) => s.teacherGrading?.finalScore || s.aiGrading?.overallScore)
            .filter((score): score is number => typeof score === 'number');

          const avg =
            scoredList.length > 0
              ? Number((scoredList.reduce((acc, curr) => acc + curr, 0) / scoredList.length).toFixed(2))
              : b.averageScore;

          return {
            ...b,
            reviewedByTeacherCount: reviewedCount,
            gradedByAiCount: Math.max(b.gradedByAiCount, aiCount),
            averageScore: avg,
            status: reviewedCount >= b.totalEssays ? 'completed' : 'in_progress',
          };
        }
        return b;
      })
    );

    // Update active grading submission if currently opened
    if (selectedGradingSubmission && selectedGradingSubmission.id === updatedSubmission.id) {
      setSelectedGradingSubmission(updatedSubmission);
    }
  };

  // Handle batch AI grading of all pending submissions
  const handleBatchAiGradeAll = () => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.status === 'pending') {
          return {
            ...sub,
            status: 'ai_graded',
            aiGrading: {
              overallScore: 8.0,
              criteriaScores: [
                {
                  id: 'crit-dh',
                  name: 'I. Đọc hiểu văn bản (4.0đ)',
                  maxScore: 4.0,
                  aiScore: 3.5,
                  teacherScore: 3.5,
                  aiReasoning: 'Trả lời đúng thể thơ, nêu đủ các tầng ý nghĩa biểu đạt.',
                },
                {
                  id: 'crit-nlxh',
                  name: 'II. Nghị luận xã hội (2.0đ)',
                  maxScore: 2.0,
                  aiScore: 1.75,
                  teacherScore: 1.75,
                  aiReasoning: 'Cấu trúc đoạn mạch lạc, lập luận thuyết phục, có dẫn chứng.',
                },
                {
                  id: 'crit-nlvh',
                  name: 'III. Nghị luận văn học (4.0đ)',
                  maxScore: 4.0,
                  aiScore: 3.25,
                  teacherScore: 3.25,
                  aiReasoning: 'Cảm thụ tốt, bám sát văn bản, hành văn trôi chảy.',
                },
              ],
              strengths: [
                'Nắm chắc kỹ năng đọc hiểu và trả lời trúng trọng tâm.',
                'Hành văn mạch lạc, dẫn chứng tiêu biểu.',
              ],
              weaknesses: [
                'Cần mở rộng thêm phần lý luận văn học để bài viết có chiều sâu hơn.',
              ],
              corrections: [],
              generalFeedback: 'Bài làm khá tốt, nắm chắc phương pháp làm bài theo cấu trúc GDPT 2018.',
              evaluatedAt: new Date().toISOString(),
            },
          };
        }
        return sub;
      })
    );

    // Update batches to reflect AI graded count
    setBatches((prev) =>
      prev.map((b) => ({
        ...b,
        gradedByAiCount: b.totalEssays,
      }))
    );
  };

  // Navigation across submissions inside grading modal
  const handleNavigateSubmission = (direction: 'prev' | 'next') => {
    if (!selectedGradingSubmission) return;
    const currentIndex = submissions.findIndex((s) => s.id === selectedGradingSubmission.id);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < submissions.length) {
      setSelectedGradingSubmission(submissions[nextIndex]);
    }
  };

  const currentSubmissionIndex = selectedGradingSubmission
    ? submissions.findIndex((s) => s.id === selectedGradingSubmission.id)
    : -1;

  const hasPrevSubmission = currentSubmissionIndex > 0;
  const hasNextSubmission =
    currentSubmissionIndex >= 0 && currentSubmissionIndex < submissions.length - 1;

  // Selected rubric for the active submission
  const currentSubmissionRubric = selectedGradingSubmission
    ? rubrics.find((r) => r.id === selectedGradingSubmission.examId) || rubrics[0]
    : rubrics[0];

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-slate-100/70 font-sans text-slate-800 antialiased overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingEssaysCount={pendingEssaysCount}
          inProgressBatchesCount={inProgressBatchesCount}
        />

        {/* Main Content View Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar / Header */}
          <Header
            teacher={teacherProfile}
            activeTab={activeTab}
            pendingCount={pendingEssaysCount}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
            onOpenSettings={() => setActiveTab('settings')}
            onLogout={() => setActiveTab('dashboard')}
            onNavigateTab={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Body View Container */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <DashboardView
                  classes={classes}
                  batches={batches}
                  submissions={submissions}
                  onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
                  onSelectBatch={(b) => {
                    setSelectedBatchFilter(b.id);
                    setActiveTab('essays');
                  }}
                  onGradeSubmission={(sub) => setSelectedGradingSubmission(sub)}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'batches' && (
                <BatchesView
                  batches={batches}
                  classes={classes}
                  onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
                  onSelectBatch={(b) => {
                    setSelectedBatchFilter(b.id);
                    setActiveTab('essays');
                  }}
                />
              )}

              {activeTab === 'essays' && (
                <EssaysView
                  submissions={submissions}
                  batches={batches}
                  selectedBatchId={selectedBatchFilter}
                  onGradeSubmission={(sub) => setSelectedGradingSubmission(sub)}
                  onBatchAiGradeAll={handleBatchAiGradeAll}
                />
              )}

              {activeTab === 'students' && (
                <StudentsView
                  students={students}
                  classes={classes}
                  submissions={submissions}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onBulkImportStudents={handleBulkImportStudents}
                  onOpenGrading={(sub) => setSelectedGradingSubmission(sub)}
                />
              )}

              {activeTab === 'classes' && (
                <ClassesView
                  classes={classes}
                  students={students}
                  batches={batches}
                  submissions={submissions}
                  onAddClass={handleAddClass}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onBulkImportStudents={handleBulkImportStudents}
                  onOpenCreateBatch={(classId) => setIsCreateBatchModalOpen(true)}
                  onOpenGrading={(sub) => setSelectedGradingSubmission(sub)}
                />
              )}

              {activeTab === 'exams' && (
                <ExamsRubricView
                  rubrics={rubrics}
                  onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  classes={classes}
                  batches={batches}
                  submissions={submissions}
                />
              )}

              {activeTab === 'comment_bank' && (
                <CommentBankView
                  commentBank={commentBank}
                  onAddComment={(newComment) => setCommentBank((prev) => [newComment, ...prev])}
                />
              )}

              {activeTab === 'settings' && <SettingsView />}
            </div>
          </main>
        </div>

        {/* Create Batch Modal */}
        <CreateBatchModal
          isOpen={isCreateBatchModalOpen}
          onClose={() => setIsCreateBatchModalOpen(false)}
          classes={classes}
          rubrics={rubrics}
          onCreateBatch={handleCreateBatch}
        />

        {/* Essay Grading Workspace Modal */}
        {selectedGradingSubmission && (
          <EssayGradingModal
            isOpen={Boolean(selectedGradingSubmission)}
            onClose={() => setSelectedGradingSubmission(null)}
            submission={selectedGradingSubmission}
            rubric={currentSubmissionRubric}
            commentBank={commentBank}
            onSaveGrading={handleSaveGrading}
            onNavigateSubmission={handleNavigateSubmission}
            hasPrev={hasPrevSubmission}
            hasNext={hasNextSubmission}
          />
        )}
      </div>
    </ToastProvider>
  );
}
