import { GradingBatch, EssaySubmission, PageImageItem, SubmissionStatus, OcrStatus, AiGradingStatus, TeacherReviewStatus } from '../types';
import { initialBatches, initialSubmissions } from '../data/mockData';

const BATCHES_STORAGE_KEY = 'aichamvan_batches_v2';
const SUBMISSIONS_STORAGE_KEY = 'aichamvan_submissions_v2';

// 8 Sample handwritten essay page images for high-fidelity rendering & simulation
export const sampleEssayPages: PageImageItem[] = [
  {
    id: 'sample-p1',
    name: 'Trang_1_Phan_Doc_Hieu.jpg',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    pageNumber: 1,
    rotation: 0,
    fileSize: 1024 * 340,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:30',
  },
  {
    id: 'sample-p2',
    name: 'Trang_2_Doc_Hieu_Cau_3_4.jpg',
    url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&auto=format&fit=crop&q=80',
    pageNumber: 2,
    rotation: 0,
    fileSize: 1024 * 420,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:31',
  },
  {
    id: 'sample-p3',
    name: 'Trang_3_Doan_Van_NLXH.jpg',
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    pageNumber: 3,
    rotation: 0,
    fileSize: 1024 * 390,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:32',
  },
  {
    id: 'sample-p4',
    name: 'Trang_4_Mo_Bai_NLVH.jpg',
    url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=80',
    pageNumber: 4,
    rotation: 0,
    fileSize: 1024 * 450,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:33',
  },
  {
    id: 'sample-p5',
    name: 'Trang_5_Luan_Diem_1_NLVH.jpg',
    url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80',
    pageNumber: 5,
    rotation: 0,
    fileSize: 1024 * 380,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:34',
  },
  {
    id: 'sample-p6',
    name: 'Trang_6_Luan_Diem_2_NLVH.jpg',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    pageNumber: 6,
    rotation: 0,
    fileSize: 1024 * 410,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:35',
  },
  {
    id: 'sample-p7',
    name: 'Trang_7_Danh_Gia_Nghe_Thuat.jpg',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    pageNumber: 7,
    rotation: 0,
    fileSize: 1024 * 360,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:36',
  },
  {
    id: 'sample-p8',
    name: 'Trang_8_Ket_Bai_Nhan_Xet.jpg',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    pageNumber: 8,
    rotation: 0,
    fileSize: 1024 * 375,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-08-14 08:37',
  },
];

/**
 * Service quản lý Đợt Chấm Bài và Bài Viết / File Ảnh
 * Thiết kế phân lớp Service/Repository độc lập, sẵn sàng chuyển sang Cloud DB / Firebase.
 */
class BatchSubmissionService {
  // --- QUẢN LÝ ĐỢT CHẤM (BATCHES) ---
  
  public getBatches(): GradingBatch[] {
    try {
      const stored = localStorage.getItem(BATCHES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Lỗi đọc batches từ LocalStorage:', e);
    }
    
    // Khởi tạo bổ sung các trường mới cho mock batches
    const enhanced = initialBatches.map((b) => ({
      ...b,
      gradingDate: b.gradingDate || b.createdAt,
      uploadedCount: b.uploadedCount ?? b.totalEssays,
      processingCount: b.processingCount ?? (b.status === 'in_progress' ? Math.max(0, b.totalEssays - b.gradedByAiCount) : 0),
    }));
    this.saveBatches(enhanced);
    return enhanced;
  }

  public getBatchById(batchId: string): GradingBatch | undefined {
    return this.getBatches().find((b) => b.id === batchId);
  }

  public createBatch(data: {
    name: string;
    classId: string;
    className: string;
    examId: string;
    examTitle: string;
    gradingDate?: string;
    notes?: string;
    academicYear?: string;
    semester?: string;
    dueDate?: string;
    totalEssays?: number;
  }): GradingBatch {
    const batches = this.getBatches();
    const now = new Date().toISOString().split('T')[0];
    
    const newBatch: GradingBatch = {
      id: `batch-${Date.now()}`,
      name: data.name.trim() || `Đợt chấm ${data.examTitle} - ${data.className}`,
      classId: data.classId,
      className: data.className,
      examId: data.examId,
      examTitle: data.examTitle,
      gradingDate: data.gradingDate || now,
      dueDate: data.dueDate || now,
      createdAt: now,
      academicYear: data.academicYear || '2024 - 2025',
      semester: data.semester || 'Học kỳ II',
      notes: data.notes?.trim() || '',
      totalEssays: data.totalEssays || 0,
      uploadedCount: 0,
      processingCount: 0,
      gradedByAiCount: 0,
      reviewedByTeacherCount: 0,
      averageScore: 0,
      status: 'in_progress',
    };

    const updated = [newBatch, ...batches];
    this.saveBatches(updated);
    return newBatch;
  }

  public updateBatch(batchId: string, partial: Partial<GradingBatch>): GradingBatch {
    const batches = this.getBatches();
    const idx = batches.findIndex((b) => b.id === batchId);
    if (idx === -1) {
      throw new Error(`Không tìm thấy đợt chấm ${batchId}`);
    }

    const updatedBatch = { ...batches[idx], ...partial };
    batches[idx] = updatedBatch;
    this.saveBatches(batches);
    return updatedBatch;
  }

  public deleteBatch(batchId: string): boolean {
    const batches = this.getBatches().filter((b) => b.id !== batchId);
    this.saveBatches(batches);

    // Xóa các bài làm thuộc batch đó
    const subs = this.getSubmissions().filter((s) => s.batchId !== batchId);
    this.saveSubmissions(subs);
    return true;
  }

  public recalculateBatchStats(batchId: string): GradingBatch | undefined {
    const subs = this.getSubmissions(batchId);
    const batch = this.getBatchById(batchId);
    if (!batch) return undefined;

    const total = subs.length;
    const uploaded = subs.filter((s) => (s.pageImages && s.pageImages.length > 0) || s.essayContent).length;
    const aiGraded = subs.filter((s) => s.status === 'AI đã chấm' || s.status === 'ai_graded' || s.aiGrading).length;
    const teacherReviewed = subs.filter((s) => s.status === 'Giáo viên đã duyệt' || s.status === 'teacher_reviewed' || s.teacherGrading?.isApproved).length;
    const processing = subs.filter((s) => s.status === 'Đang đọc' || s.status === 'AI đang chấm').length;

    // Tính điểm trung bình (ưu tiên điểm GV duyệt, nếu chưa thì lấy điểm AI)
    const scoredSubs = subs.filter((s) => (s.teacherScore != null || s.teacherGrading?.finalScore != null || s.aiScore != null || s.aiGrading?.overallScore != null));
    let avg = 0;
    if (scoredSubs.length > 0) {
      const sum = scoredSubs.reduce((acc, curr) => {
        const score = curr.teacherScore ?? curr.teacherGrading?.finalScore ?? curr.aiScore ?? curr.aiGrading?.overallScore ?? 0;
        return acc + score;
      }, 0);
      avg = Math.round((sum / scoredSubs.length) * 100) / 100;
    }

    const updated = this.updateBatch(batchId, {
      totalEssays: total || batch.totalEssays,
      uploadedCount: uploaded,
      gradedByAiCount: aiGraded,
      reviewedByTeacherCount: teacherReviewed,
      processingCount: processing,
      averageScore: avg,
      status: teacherReviewed >= total && total > 0 ? 'completed' : 'in_progress',
    });

    return updated;
  }

  // --- QUẢN LÝ BÀI NỘP / BÀI CHẤM (SUBMISSIONS) ---

  public getSubmissions(batchId?: string): EssaySubmission[] {
    let subs: EssaySubmission[] = [];
    try {
      const stored = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (stored) {
        subs = JSON.parse(stored);
      } else {
        subs = initialSubmissions;
        this.saveSubmissions(subs);
      }
    } catch (e) {
      console.warn('Lỗi đọc submissions từ LocalStorage:', e);
      subs = initialSubmissions;
    }

    // Chuẩn hóa và bổ sung dữ liệu ảnh mẫu & status mới nếu chưa có
    subs = subs.map((s) => {
      const standardStatus = this.mapToStandardStatus(s.status);
      const pageImgs = s.pageImages && s.pageImages.length > 0 ? s.pageImages : (s.hasHandwritingImage ? sampleEssayPages.slice(0, 4) : []);
      return {
        ...s,
        status: standardStatus,
        pageImages: pageImgs,
        pageCount: s.pageCount || pageImgs.length || 1,
        uploadedAt: s.uploadedAt || s.submittedAt,
        ocrStatus: s.ocrStatus || (standardStatus === 'Chưa xử lý' ? 'Chưa đọc' : 'Đã đọc'),
        aiStatus: s.aiStatus || (standardStatus === 'AI đã chấm' || standardStatus === 'Giáo viên đã duyệt' ? 'AI đã chấm' : 'Chưa chấm'),
        teacherStatus: s.teacherStatus || (standardStatus === 'Giáo viên đã duyệt' ? 'Giáo viên đã duyệt' : 'Chưa duyệt'),
        aiScore: s.aiScore ?? s.aiGrading?.overallScore,
        teacherScore: s.teacherScore ?? s.teacherGrading?.finalScore,
      };
    });

    if (batchId) {
      return subs.filter((s) => s.batchId === batchId);
    }
    return subs;
  }

  public getSubmissionById(id: string): EssaySubmission | undefined {
    return this.getSubmissions().find((s) => s.id === id);
  }

  public createSubmission(data: Partial<EssaySubmission> & { batchId: string; studentId: string; studentName: string; studentCode: string; className: string; examId: string; examTitle: string }): EssaySubmission {
    const subs = this.getSubmissions();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    const pageImages = data.pageImages || [];
    const newSub: EssaySubmission = {
      id: data.id || `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      batchId: data.batchId,
      studentId: data.studentId,
      studentName: data.studentName,
      studentCode: data.studentCode,
      className: data.className,
      examId: data.examId,
      examTitle: data.examTitle,
      pageImages: pageImages,
      pageCount: pageImages.length || 1,
      status: (data.status as SubmissionStatus) || 'Chưa xử lý',
      uploadedAt: now,
      submittedAt: now,
      ocrStatus: data.ocrStatus || (pageImages.length > 0 ? 'Đã đọc' : 'Chưa đọc'),
      aiStatus: data.aiStatus || 'Chưa chấm',
      teacherStatus: data.teacherStatus || 'Chưa duyệt',
      aiScore: data.aiScore,
      teacherScore: data.teacherScore,
      essayContent: data.essayContent || '',
      wordCount: data.wordCount || (data.essayContent ? data.essayContent.trim().split(/\s+/).length : 0),
      aiGrading: data.aiGrading,
      teacherGrading: data.teacherGrading,
      notes: data.notes,
    };

    const updated = [newSub, ...subs];
    this.saveSubmissions(updated);
    this.recalculateBatchStats(data.batchId);
    return newSub;
  }

  public updateSubmission(id: string, partial: Partial<EssaySubmission>): EssaySubmission {
    const subs = this.getSubmissions();
    const idx = subs.findIndex((s) => s.id === id);
    if (idx === -1) {
      throw new Error(`Không tìm thấy bài làm ${id}`);
    }

    // Tự động tính lại word count hoặc pageCount nếu thay đổi
    let pageCount = partial.pageCount;
    if (partial.pageImages) {
      pageCount = partial.pageImages.length;
    }

    const updatedSub: EssaySubmission = {
      ...subs[idx],
      ...partial,
      pageCount: pageCount ?? subs[idx].pageCount,
    };

    subs[idx] = updatedSub;
    this.saveSubmissions(subs);
    this.recalculateBatchStats(updatedSub.batchId);
    return updatedSub;
  }

  public deleteSubmission(id: string): boolean {
    const subs = this.getSubmissions();
    const target = subs.find((s) => s.id === id);
    const filtered = subs.filter((s) => s.id !== id);
    this.saveSubmissions(filtered);
    if (target) {
      this.recalculateBatchStats(target.batchId);
    }
    return true;
  }

  public bulkAssignImagesToStudents(
    batchId: string,
    assignments: Array<{
      studentId: string;
      studentName: string;
      studentCode: string;
      className: string;
      examId: string;
      examTitle: string;
      pageImages: PageImageItem[];
    }>
  ): EssaySubmission[] {
    const created: EssaySubmission[] = [];
    for (const item of assignments) {
      const sub = this.createSubmission({
        batchId,
        studentId: item.studentId,
        studentName: item.studentName,
        studentCode: item.studentCode,
        className: item.className,
        examId: item.examId,
        examTitle: item.examTitle,
        pageImages: item.pageImages,
        status: 'Chưa xử lý',
        ocrStatus: 'Đã đọc',
        aiStatus: 'Chưa chấm',
        teacherStatus: 'Chưa duyệt',
        essayContent: `[Bài viết học sinh gồm ${item.pageImages.length} trang tài liệu đã được tải lên và sẵn sàng cho AI đọc & chấm điểm]`,
      });
      created.push(sub);
    }
    return created;
  }

  // --- HELPERS ---

  private mapToStandardStatus(status: any): SubmissionStatus {
    if (status === 'teacher_reviewed' || status === 'Giáo viên đã duyệt') return 'Giáo viên đã duyệt';
    if (status === 'ai_graded' || status === 'AI đã chấm') return 'AI đã chấm';
    if (status === 'pending' || status === 'Chưa xử lý') return 'Chưa xử lý';
    if (status === 'Đang đọc') return 'Đang đọc';
    if (status === 'Đã đọc') return 'Đã đọc';
    if (status === 'AI đang chấm') return 'AI đang chấm';
    if (status === 'Cần kiểm tra') return 'Cần kiểm tra';
    return 'Chưa xử lý';
  }

  private saveBatches(batches: GradingBatch[]) {
    try {
      localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.warn('Lỗi lưu batches vào LocalStorage:', e);
    }
  }

  private saveSubmissions(subs: EssaySubmission[]) {
    try {
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(subs));
    } catch (e) {
      console.warn('Lỗi lưu submissions vào LocalStorage:', e);
    }
  }
}

export const batchSubmissionService = new BatchSubmissionService();
