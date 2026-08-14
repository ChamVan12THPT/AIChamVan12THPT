import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastProvider } from './components/Toast';
import { CreateBatchModal } from './components/CreateBatchModal';
import { EssayGradingModal } from './components/EssayGradingModal';
import { BatchDetailView } from './components/BatchDetailView';
import { UploadEssayModal } from './components/UploadEssayModal';
import { ImageViewerModal } from './components/ImageViewerModal';

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

// Services
import { classStudentService } from './services/classStudentService';
import { examRubricService } from './services/examRubricService';
import { batchSubmissionService } from './services/batchSubmissionService';

import {
  NavTabId,
  ClassRoom,
  GradingBatch,
  EssaySubmission,
  ExamRubric,
  Student,
  CommentBankItem,
  TeacherProfile,
  PageImageItem,
  SubmissionStatus,
} from './types';
import { initialCommentBank, initialTeacherProfile } from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('batches');

  // Application State backed by Service / LocalStorage
  const [classes, setClasses] = useState<ClassRoom[]>(() => classStudentService.getClasses());
  const [batches, setBatches] = useState<GradingBatch[]>(() => batchSubmissionService.getBatches());
  const [submissions, setSubmissions] = useState<EssaySubmission[]>(() => batchSubmissionService.getSubmissions());
  const [rubrics, setRubrics] = useState<ExamRubric[]>(() => examRubricService.getRubrics());
  const [students, setStudents] = useState<Student[]>(() => classStudentService.getStudents());
  const [commentBank, setCommentBank] = useState<CommentBankItem[]>(initialCommentBank);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(initialTeacherProfile);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Detailed Views State
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [selectedBatchForDetail, setSelectedBatchForDetail] = useState<GradingBatch | null>(null);
  const [isUploadEssayModalOpen, setIsUploadEssayModalOpen] = useState(false);
  
  // Image Viewer State
  const [viewerImages, setViewerImages] = useState<PageImageItem[]>([]);
  const [viewerInitialIdx, setViewerInitialIdx] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Grading Workspace Modal State
  const [selectedGradingSubmission, setSelectedGradingSubmission] = useState<EssaySubmission | null>(null);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | undefined>(undefined);

  // Synchronize helper to refresh state from services
  const refreshBatchesAndSubmissions = () => {
    setBatches(batchSubmissionService.getBatches());
    setSubmissions(batchSubmissionService.getSubmissions());
  };

  // Exam & Rubric Management Handlers
  const handleAddRubric = (newRubric: ExamRubric) => {
    setRubrics(examRubricService.getRubrics());
  };

  const handleUpdateRubric = (updatedRubric: ExamRubric) => {
    setRubrics(examRubricService.getRubrics());
  };

  const handleDuplicateRubric = (rubricId: string) => {
    examRubricService.duplicateRubric(rubricId);
    setRubrics(examRubricService.getRubrics());
  };

  const handleDeleteRubric = (rubricId: string) => {
    examRubricService.deleteRubric(rubricId);
    setRubrics(examRubricService.getRubrics());
  };

  // Class Management Handlers
  const handleAddClass = (data: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }) => {
    classStudentService.createClass(data);
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
  const pendingEssaysCount = submissions.filter((s) => s.status === 'Chưa xử lý' || s.status === 'pending').length;
  const inProgressBatchesCount = batches.filter((b) => b.status === 'in_progress').length;

  // Handle batch creation
  const handleCreateBatch = (
    newBatchData: Omit<
      GradingBatch,
      'id' | 'createdAt' | 'gradedByAiCount' | 'reviewedByTeacherCount' | 'averageScore' | 'status'
    >
  ) => {
    const newBatch = batchSubmissionService.createBatch(newBatchData);
    
    // Auto-generate starter student submissions from class roster
    const targetStudents = students.filter((s) => s.classId === newBatch.classId);
    if (targetStudents.length > 0) {
      targetStudents.forEach((st) => {
        batchSubmissionService.createSubmission({
          batchId: newBatch.id,
          studentId: st.id,
          studentName: st.fullName || st.name || 'Học sinh',
          studentCode: st.studentCode || st.code || 'HS',
          className: newBatch.className,
          examId: newBatch.examId,
          examTitle: newBatch.examTitle,
          status: 'Chưa xử lý',
          ocrStatus: 'Chưa đọc',
          aiStatus: 'Chưa chấm',
          teacherStatus: 'Chưa duyệt',
          essayContent: `Bài làm khảo sát môn Ngữ văn của học sinh ${st.fullName || st.name}.`,
          wordCount: 0,
        });
      });
    }

    refreshBatchesAndSubmissions();
    setSelectedBatchForDetail(newBatch);
    setActiveTab('batches');
  };

  // Handle uploading and assigning pages to a student
  const handleSaveUploadEssay = (submissionData: {
    studentId: string;
    studentName: string;
    studentCode: string;
    className: string;
    examId: string;
    examTitle: string;
    pageImages: PageImageItem[];
    notes?: string;
  }) => {
    if (!selectedBatchForDetail) return;

    // Check if submission already exists for this student in the batch
    const existing = submissions.find(
      (s) => s.batchId === selectedBatchForDetail.id && s.studentId === submissionData.studentId
    );

    if (existing) {
      batchSubmissionService.updateSubmission(existing.id, {
        pageImages: submissionData.pageImages,
        pageCount: submissionData.pageImages.length,
        notes: submissionData.notes,
        status: 'Đã đọc',
        ocrStatus: 'Đã đọc',
      });
    } else {
      batchSubmissionService.createSubmission({
        batchId: selectedBatchForDetail.id,
        studentId: submissionData.studentId,
        studentName: submissionData.studentName,
        studentCode: submissionData.studentCode,
        className: submissionData.className,
        examId: submissionData.examId,
        examTitle: submissionData.examTitle,
        pageImages: submissionData.pageImages,
        pageCount: submissionData.pageImages.length,
        notes: submissionData.notes,
        status: 'Đã đọc',
        ocrStatus: 'Đã đọc',
        aiStatus: 'Chưa chấm',
        teacherStatus: 'Chưa duyệt',
        essayContent: `[Bài làm gồm ${submissionData.pageImages.length} trang tài liệu đã được tải lên và sẵn sàng chấm]`,
      });
    }

    refreshBatchesAndSubmissions();
  };

  // Handle deleting submission
  const handleDeleteSubmission = (id: string) => {
    batchSubmissionService.deleteSubmission(id);
    refreshBatchesAndSubmissions();
  };

  // Handle updating status
  const handleUpdateSubmissionStatus = (id: string, status: SubmissionStatus) => {
    batchSubmissionService.updateSubmission(id, { status });
    refreshBatchesAndSubmissions();
  };

  // Handle saving an essay grading (from Teacher / AI)
  const handleSaveGrading = (updatedSubmission: EssaySubmission) => {
    batchSubmissionService.updateSubmission(updatedSubmission.id, updatedSubmission);
    refreshBatchesAndSubmissions();

    if (selectedGradingSubmission && selectedGradingSubmission.id === updatedSubmission.id) {
      setSelectedGradingSubmission(updatedSubmission);
    }
  };

  // Handle batch AI grading of all pending submissions
  const handleBatchAiGradeAll = () => {
    submissions.forEach((sub) => {
      if (sub.status === 'Chưa xử lý' || sub.status === 'pending' || sub.status === 'Đã đọc') {
        batchSubmissionService.updateSubmission(sub.id, {
          status: 'AI đã chấm',
          aiStatus: 'AI đã chấm',
          aiScore: 8.25,
          aiGrading: {
            overallScore: 8.25,
            criteriaScores: [
              {
                id: 'crit-dh',
                name: 'Phần Đọc hiểu (4.0đ)',
                maxScore: 4.0,
                aiScore: 3.5,
                teacherScore: 3.5,
                aiReasoning: 'Trả lời đúng 4 câu hỏi đọc hiểu theo cấu trúc ma trận chuẩn.',
              },
              {
                id: 'crit-nlxh',
                name: 'Phần Nghị luận xã hội (2.0đ)',
                maxScore: 2.0,
                aiScore: 1.75,
                teacherScore: 1.75,
                aiReasoning: 'Đoạn văn mạch lạc, lập luận chặt chẽ, dẫn chứng thực tế.',
              },
              {
                id: 'crit-nlvh',
                name: 'Phần Nghị luận văn học (4.0đ)',
                maxScore: 4.0,
                aiScore: 3.0,
                teacherScore: 3.0,
                aiReasoning: 'Cảm thụ tốt, bám sát văn bản ngữ liệu, hành văn giàu cảm xúc.',
              },
            ],
            strengths: ['Bố cục 3 phần rõ ràng', 'Dẫn chứng sinh động', 'Hành văn lưu loát'],
            weaknesses: ['Cần chú ý liên hệ mở rộng'],
            generalFeedback: 'Bài làm đạt yêu cầu theo chuẩn cấu trúc Đề thi Tốt nghiệp THPT 2025.',
            corrections: [],
            evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            modelUsed: 'gemini-3.7-flash',
          },
        });
      }
    });

    refreshBatchesAndSubmissions();
  };

  // Open Image Viewer
  const handleOpenImageViewer = (images: PageImageItem[], initialIdx: number = 0) => {
    setViewerImages(images);
    setViewerInitialIdx(initialIdx);
    setIsViewerOpen(true);
  };

  // Navigation inside grading workspace modal
  const handleNavigateSubmission = (direction: 'prev' | 'next') => {
    if (!selectedGradingSubmission) return;
    const currentList = selectedBatchForDetail
      ? submissions.filter((s) => s.batchId === selectedBatchForDetail.id)
      : submissions;

    const currentIndex = currentList.findIndex((s) => s.id === selectedGradingSubmission.id);
    if (currentIndex === -1) return;

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedGradingSubmission(currentList[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < currentList.length - 1) {
      setSelectedGradingSubmission(currentList[currentIndex + 1]);
    }
  };

  const currentSubmissionRubric = rubrics.find((r) => r.id === selectedGradingSubmission?.examId) || rubrics[0];
  const activeSubmissionsList = selectedBatchForDetail
    ? submissions.filter((s) => s.batchId === selectedBatchForDetail.id)
    : submissions;
  const currentGradingIndex = selectedGradingSubmission
    ? activeSubmissionsList.findIndex((s) => s.id === selectedGradingSubmission.id)
    : -1;
  const hasPrevSubmission = currentGradingIndex > 0;
  const hasNextSubmission = currentGradingIndex !== -1 && currentGradingIndex < activeSubmissionsList.length - 1;

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-100 font-sans text-slate-900 antialiased overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'batches') {
              setSelectedBatchForDetail(null);
            }
          }}
          pendingCount={pendingEssaysCount}
          inProgressCount={inProgressBatchesCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header
            activeTab={activeTab}
            teacherProfile={teacherProfile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
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
                    setSelectedBatchForDetail(b);
                    setActiveTab('batches');
                  }}
                  onGradeSubmission={(sub) => setSelectedGradingSubmission(sub)}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === 'batches' && (
                <>
                  {selectedBatchForDetail ? (
                    <BatchDetailView
                      batch={selectedBatchForDetail}
                      submissions={submissions}
                      students={students}
                      onBack={() => setSelectedBatchForDetail(null)}
                      onOpenUploadModal={() => setIsUploadEssayModalOpen(true)}
                      onOpenGradingModal={(sub) => setSelectedGradingSubmission(sub)}
                      onOpenImageViewer={handleOpenImageViewer}
                      onDeleteSubmission={handleDeleteSubmission}
                      onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
                    />
                  ) : (
                    <BatchesView
                      batches={batches}
                      classes={classes}
                      onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
                      onSelectBatch={(b) => setSelectedBatchForDetail(b)}
                    />
                  )}
                </>
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
                  batches={batches}
                  onAddRubric={handleAddRubric}
                  onUpdateRubric={handleUpdateRubric}
                  onDuplicateRubric={handleDuplicateRubric}
                  onDeleteRubric={handleDeleteRubric}
                  onOpenCreateBatch={(rubricId) => setIsCreateBatchModalOpen(true)}
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

        {/* Upload Essay & Multi-page Stitching Modal */}
        {selectedBatchForDetail && (
          <UploadEssayModal
            isOpen={isUploadEssayModalOpen}
            onClose={() => setIsUploadEssayModalOpen(false)}
            batch={selectedBatchForDetail}
            students={students}
            onSaveEssaySubmission={handleSaveUploadEssay}
            onOpenViewer={handleOpenImageViewer}
          />
        )}

        {/* Image Full-screen Zoom & Rotate Viewer Modal */}
        <ImageViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          images={viewerImages}
          initialIndex={viewerInitialIdx}
          onUpdateImage={(updated) => setViewerImages(updated)}
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
