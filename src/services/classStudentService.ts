import { ClassRoom, Student, EssaySubmission, ExamRubric, StudentProgressHistoryItem } from '../types';
import { initialClasses, initialStudents } from '../data/mockData';

const CLASSES_STORAGE_KEY = 'aichamvan_classes_v2';
const STUDENTS_STORAGE_KEY = 'aichamvan_students_v2';

/**
 * Service quản lý Lớp học và Học sinh
 * Được thiết kế theo mẫu Repository Service độc lập,
 * cho phép dễ dàng chuyển đổi sang Firebase Firestore / Cloud SQL trong tương lai mà không phải đổi giao diện.
 */
class ClassStudentService {
  // --- Khởi tạo dữ liệu từ LocalStorage hoặc MockData ---
  public getClasses(): ClassRoom[] {
    try {
      const stored = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Lỗi đọc classes từ LocalStorage:', e);
    }
    // Fallback & seed
    this.saveClassesToStorage(initialClasses);
    return initialClasses;
  }

  public getClassById(classId: string): ClassRoom | undefined {
    const classes = this.getClasses();
    return classes.find((c) => c.id === classId);
  }

  public createClass(data: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }): ClassRoom {
    const classes = this.getClasses();
    const now = new Date().toISOString().split('T')[0];
    const newClass: ClassRoom = {
      id: `class-${Date.now()}`,
      name: data.name.trim(),
      grade: data.grade,
      schoolYear: data.schoolYear.trim() || '2024 - 2025',
      notes: data.notes?.trim() || '',
      studentCount: 0,
      gradedEssaysCount: 0,
      latestAverageScore: 0,
      averageScore: 0,
      teacherInCharge: data.teacherInCharge?.trim() || 'Cô Hoàng Thu Hà',
      targetGraduationRate: data.targetGraduationRate || 100,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newClass, ...classes];
    this.saveClassesToStorage(updatedList);
    return newClass;
  }

  public updateClass(classId: string, data: Partial<ClassRoom>): ClassRoom {
    const classes = this.getClasses();
    const index = classes.findIndex((c) => c.id === classId);
    if (index === -1) {
      throw new Error(`Không tìm thấy lớp học với ID: ${classId}`);
    }

    const now = new Date().toISOString().split('T')[0];
    const updatedClass: ClassRoom = {
      ...classes[index],
      ...data,
      updatedAt: now,
    };

    classes[index] = updatedClass;
    this.saveClassesToStorage(classes);
    return updatedClass;
  }

  public deleteClass(classId: string): boolean {
    const classes = this.getClasses();
    const filtered = classes.filter((c) => c.id !== classId);
    this.saveClassesToStorage(filtered);

    // Xóa hoặc ngắt liên kết các học sinh thuộc lớp đó
    const students = this.getStudents();
    const updatedStudents = students.filter((s) => s.classId !== classId);
    this.saveStudentsToStorage(updatedStudents);

    return true;
  }

  // --- Quản lý Học Sinh ---

  public getStudents(classId?: string): Student[] {
    let students: Student[] = [];
    try {
      const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (stored) {
        students = JSON.parse(stored);
      } else {
        students = initialStudents;
        this.saveStudentsToStorage(students);
      }
    } catch (e) {
      console.warn('Lỗi đọc students từ LocalStorage:', e);
      students = initialStudents;
    }

    if (classId && classId !== 'all') {
      return students.filter((s) => s.classId === classId);
    }
    return students;
  }

  public getStudentById(studentId: string): Student | undefined {
    const students = this.getStudents();
    return students.find((s) => s.id === studentId);
  }

  public createStudent(data: {
    studentCode: string;
    fullName: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    classId: string;
    notes?: string;
  }): Student {
    const students = this.getStudents();
    const classes = this.getClasses();
    const targetClass = classes.find((c) => c.id === data.classId);

    // Kiểm tra trùng mã học sinh trong lớp hoặc toàn hệ thống
    const existing = students.find(
      (s) => s.studentCode.trim().toLowerCase() === data.studentCode.trim().toLowerCase()
    );
    if (existing) {
      throw new Error(`Mã học sinh "${data.studentCode}" đã tồn tại trên hệ thống!`);
    }

    const now = new Date().toISOString().split('T')[0];
    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    ];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newStudent: Student = {
      id: `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentCode: data.studentCode.trim(),
      fullName: data.fullName.trim(),
      gender: data.gender,
      classId: data.classId,
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
      // Compatibility aliases
      name: data.fullName.trim(),
      code: data.studentCode.trim(),
      className: targetClass ? targetClass.name : 'Chưa phân lớp',
      avatar: randomAvatar,
      essayCount: 0,
      averageScore: 0,
      latestScore: 0,
      strengthsSummary: 'Chưa có dữ liệu bài chấm',
      needsImprovementSummary: 'Chưa có dữ liệu bài chấm',
    };

    const updatedList = [newStudent, ...students];
    this.saveStudentsToStorage(updatedList);

    // Cập nhật sĩ số lớp
    this.recalculateClassStudentCounts();

    return newStudent;
  }

  public updateStudent(studentId: string, data: Partial<Student>): Student {
    const students = this.getStudents();
    const index = students.findIndex((s) => s.id === studentId);
    if (index === -1) {
      throw new Error(`Không tìm thấy học sinh với ID: ${studentId}`);
    }

    const classes = this.getClasses();
    const targetClassId = data.classId || students[index].classId;
    const targetClass = classes.find((c) => c.id === targetClassId);

    const now = new Date().toISOString().split('T')[0];
    const updatedStudent: Student = {
      ...students[index],
      ...data,
      fullName: data.fullName ? data.fullName.trim() : students[index].fullName,
      studentCode: data.studentCode ? data.studentCode.trim() : students[index].studentCode,
      name: data.fullName ? data.fullName.trim() : students[index].fullName,
      code: data.studentCode ? data.studentCode.trim() : students[index].studentCode,
      className: targetClass ? targetClass.name : students[index].className,
      updatedAt: now,
    };

    students[index] = updatedStudent;
    this.saveStudentsToStorage(students);

    // Cập nhật sĩ số các lớp
    this.recalculateClassStudentCounts();

    return updatedStudent;
  }

  public deleteStudent(studentId: string): boolean {
    const students = this.getStudents();
    const filtered = students.filter((s) => s.id !== studentId);
    this.saveStudentsToStorage(filtered);

    // Cập nhật sĩ số lớp
    this.recalculateClassStudentCounts();
    return true;
  }

  /**
   * Nhập hàng loạt học sinh từ file Excel hoặc CSV
   */
  public bulkImportStudents(
    classId: string,
    importedList: Array<{
      studentCode: string;
      fullName: string;
      gender?: 'Nam' | 'Nữ' | 'Khác' | string;
      notes?: string;
    }>,
    options?: { overwriteExisting?: boolean }
  ): { successCount: number; updatedCount: number; errors: string[] } {
    const students = this.getStudents();
    const classes = this.getClasses();
    const targetClass = classes.find((c) => c.id === classId);
    const now = new Date().toISOString().split('T')[0];

    let successCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ];

    const currentMap = new Map(students.map((s) => [s.studentCode.toLowerCase().trim(), s]));

    importedList.forEach((row, idx) => {
      const code = (row.studentCode || '').trim();
      const name = (row.fullName || '').trim();
      const rawGender = (row.gender || '').trim();
      const gender: 'Nam' | 'Nữ' | 'Khác' =
        rawGender.toLowerCase() === 'nữ' || rawGender.toLowerCase() === 'female' || rawGender.toLowerCase() === 'nu'
          ? 'Nữ'
          : rawGender.toLowerCase() === 'khác' || rawGender.toLowerCase() === 'other'
          ? 'Khác'
          : 'Nam';
      const notes = (row.notes || '').trim();

      if (!code || !name) {
        errors.push(`Dòng ${idx + 1}: Thiếu mã học sinh hoặc họ tên.`);
        return;
      }

      const existing = currentMap.get(code.toLowerCase());

      if (existing) {
        if (options?.overwriteExisting) {
          existing.fullName = name;
          existing.name = name;
          existing.gender = gender;
          existing.notes = notes || existing.notes;
          existing.classId = classId;
          existing.className = targetClass ? targetClass.name : existing.className;
          existing.updatedAt = now;
          updatedCount++;
        } else {
          // Bỏ qua nếu đã tồn tại
          errors.push(`Dòng ${idx + 1}: Mã "${code}" đã tồn tại (đã bỏ qua).`);
        }
      } else {
        const newStudent: Student = {
          id: `hs-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          studentCode: code,
          fullName: name,
          name: name,
          code: code,
          gender,
          classId,
          className: targetClass ? targetClass.name : 'Lớp học',
          notes,
          createdAt: now,
          updatedAt: now,
          avatar: defaultAvatars[idx % defaultAvatars.length],
          essayCount: 0,
          averageScore: 0,
          latestScore: 0,
          strengthsSummary: 'Chưa có bài chấm',
          needsImprovementSummary: 'Chưa có bài chấm',
        };
        students.push(newStudent);
        currentMap.set(code.toLowerCase(), newStudent);
        successCount++;
      }
    });

    this.saveStudentsToStorage(students);
    this.recalculateClassStudentCounts();

    return { successCount, updatedCount, errors };
  }

  /**
   * Tự động sinh mã học sinh kế tiếp cho một lớp (VD: HS12A1-08)
   */
  public generateNextStudentCode(targetClass: ClassRoom, existingStudents: Student[]): string {
    const classShortName = targetClass.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = `HS${classShortName}`;
    const classStudents = existingStudents.filter((s) => s.classId === targetClass.id);

    let maxNum = 0;
    classStudents.forEach((s) => {
      const code = s.studentCode || s.code || '';
      const match = code.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextNum = maxNum + 1;
    const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    return `${prefix}-${formattedNum}`;
  }

  /**
   * Lấy lịch sử tiến bộ và các bài chấm chi tiết của từng học sinh
   * Kết nối: Học sinh → Bài viết → Đề thi → Điểm AI → Điểm giáo viên → Nhận xét → Lịch sử tiến bộ
   */
  public getStudentProgressHistory(
    studentId: string,
    submissions: EssaySubmission[]
  ): StudentProgressHistoryItem[] {
    const studentSubmissions = submissions.filter((sub) => sub.studentId === studentId);

    return studentSubmissions
      .map((sub) => {
        const aiScore = sub.aiGrading?.overallScore;
        const teacherScore = sub.teacherGrading?.finalScore;
        const finalScore = teacherScore ?? aiScore;

        return {
          essayId: sub.id,
          batchId: sub.batchId,
          batchName: sub.className || 'Đợt chấm bài',
          examId: sub.examId,
          examTitle: sub.examTitle,
          submittedAt: sub.submittedAt,
          status: sub.status,
          aiScore,
          teacherScore,
          finalScore,
          generalFeedback: sub.aiGrading?.generalFeedback,
          teacherFeedback: sub.teacherGrading?.finalFeedback,
          strengths: sub.aiGrading?.strengths || [],
          weaknesses: sub.aiGrading?.weaknesses || [],
          wordCount: sub.wordCount || 0,
        };
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // --- Hàm hỗ trợ LocalStorage & Tính toán nội bộ ---

  private saveClassesToStorage(classes: ClassRoom[]) {
    try {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    } catch (e) {
      console.error('Lỗi lưu classes vào LocalStorage:', e);
    }
  }

  private saveStudentsToStorage(students: Student[]) {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Lỗi lưu students vào LocalStorage:', e);
    }
  }

  public recalculateClassStudentCounts() {
    const classes = this.getClasses();
    const students = this.getStudents();

    const updatedClasses = classes.map((cls) => {
      const classStudents = students.filter((s) => s.classId === cls.id);
      const studentCount = classStudents.length;
      
      const scores = classStudents
        .map((s) => s.averageScore || 0)
        .filter((sc) => sc > 0);
      
      const avgScore = scores.length > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
        : cls.averageScore || 0;

      return {
        ...cls,
        studentCount,
        averageScore: avgScore,
        latestAverageScore: avgScore,
      };
    });

    this.saveClassesToStorage(updatedClasses);
    return updatedClasses;
  }
}

export const classStudentService = new ClassStudentService();
