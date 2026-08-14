import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  TrendingUp,
  Plus,
  Target,
  FileSpreadsheet,
  Search,
  ChevronRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Filter,
  FileText,
  Sparkles,
  BookOpen,
  Award,
  Download,
  AlertCircle,
} from 'lucide-react';
import { ClassRoom, Student, GradingBatch, EssaySubmission } from '../types';
import { useToast } from '../components/Toast';
import { ClassModal } from '../components/ClassModal';
import { StudentModal } from '../components/StudentModal';
import { ImportStudentsModal } from '../components/ImportStudentsModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { StudentDetailModal } from '../components/StudentDetailModal';

interface ClassesViewProps {
  classes: ClassRoom[];
  students: Student[];
  batches: GradingBatch[];
  submissions: EssaySubmission[];
  onAddClass: (data: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }) => void;
  onUpdateClass: (id: string, data: Partial<ClassRoom>) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (data: {
    studentCode: string;
    fullName: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    classId: string;
    notes?: string;
  }) => void;
  onUpdateStudent: (id: string, data: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onBulkImportStudents: (
    classId: string,
    importedList: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      notes?: string;
    }>,
    overwriteExisting: boolean
  ) => void;
  onOpenCreateBatch: (preselectedClassId?: string) => void;
  onOpenGrading: (submission: EssaySubmission) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  students,
  batches,
  submissions,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkImportStudents,
  onOpenCreateBatch,
  onOpenGrading,
}) => {
  const { showToast } = useToast();

  // Navigation state inside Classes view (List or Detail)
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Filters for Classes List
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');

  // Filters for Students Table inside Class Detail
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | 'Nam' | 'Nữ' | 'Khác'>('all');
  const [studentScoreFilter, setStudentScoreFilter] = useState<'all' | 'gioi' | 'kha' | 'trung_binh' | 'chua_co'>('all');

  // Modal States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewingStudentDetail, setViewingStudentDetail] = useState<Student | null>(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'class' | 'student';
    id: string;
    name: string;
  } | null>(null);

  // Active selected class object
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Students belonging to active class
  const classStudents = useMemo(() => {
    if (!activeClass) return [];
    return students.filter((s) => s.classId === activeClass.id);
  }, [students, activeClass]);

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(classSearchTerm.toLowerCase());
      const matchGrade = gradeFilter === 'all' || c.grade === gradeFilter;
      return matchSearch && matchGrade;
    });
  }, [classes, classSearchTerm, gradeFilter]);

  // Filtered students for Class Detail
  const filteredClassStudents = useMemo(() => {
    return classStudents.filter((s) => {
      const name = s.fullName || s.name || '';
      const code = s.studentCode || s.code || '';
      const matchSearch =
        name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        code.toLowerCase().includes(studentSearchTerm.toLowerCase());

      const matchGender = studentGenderFilter === 'all' || s.gender === studentGenderFilter;

      let matchScore = true;
      const score = s.averageScore || 0;
      if (studentScoreFilter === 'gioi') matchScore = score >= 8.0;
      else if (studentScoreFilter === 'kha') matchScore = score >= 6.5 && score < 8.0;
      else if (studentScoreFilter === 'trung_binh') matchScore = score > 0 && score < 6.5;
      else if (studentScoreFilter === 'chua_co') matchScore = score === 0;

      return matchSearch && matchGender && matchScore;
    });
  }, [classStudents, studentSearchTerm, studentGenderFilter, studentScoreFilter]);

  // Handle saving class
  const handleSaveClass = (data: {
    name: string;
    grade: '10' | '11' | '12';
    schoolYear: string;
    notes?: string;
    teacherInCharge?: string;
    targetGraduationRate?: number;
  }) => {
    if (editingClass) {
      onUpdateClass(editingClass.id, data);
      showToast(`Đã cập nhật thông tin lớp ${data.name}!`, 'success');
    } else {
      onAddClass(data);
      showToast(`Đã tạo thành công lớp học ${data.name}!`, 'success');
    }
  };

  // Handle saving student
  const handleSaveStudent = (data: {
    studentCode: string;
    fullName: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    classId: string;
    notes?: string;
  }) => {
    if (editingStudent) {
      onUpdateStudent(editingStudent.id, data);
      showToast(`Đã cập nhật học sinh ${data.fullName}!`, 'success');
    } else {
      onAddStudent(data);
      showToast(`Đã thêm học sinh ${data.fullName} vào danh sách!`, 'success');
    }
  };

  // Handle confirmed deletion
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'class') {
      onDeleteClass(deleteTarget.id);
      showToast(`Đã xóa lớp ${deleteTarget.name} khỏi hệ thống!`, 'info');
      if (selectedClassId === deleteTarget.id) {
        setSelectedClassId(null);
      }
    } else if (deleteTarget.type === 'student') {
      onDeleteStudent(deleteTarget.id);
      showToast(`Đã xóa học sinh ${deleteTarget.name}!`, 'info');
    }
    setDeleteTarget(null);
  };

  // Handle bulk import
  const handleImportStudents = (
    importedList: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      notes?: string;
    }>,
    overwrite: boolean
  ) => {
    if (!activeClass) return;
    onBulkImportStudents(activeClass.id, importedList, overwrite);
    showToast(`Đã nhập thành công ${importedList.length} học sinh vào lớp ${activeClass.name}!`, 'success');
  };

  // ==========================================
  // VIEW 2: TRANG CHI TIẾT LỚP (Class Detail)
  // ==========================================
  if (activeClass) {
    const classBatches = batches.filter((b) => b.classId === activeClass.id);
    const totalEssaysInClass = submissions.filter((s) => s.className.includes(activeClass.name.split(' ')[0])).length;
    const reviewedEssaysInClass = submissions.filter(
      (s) => s.className.includes(activeClass.name.split(' ')[0]) && s.status === 'teacher_reviewed'
    ).length;

    return (
      <div id="class-detail-view" className="space-y-6 animate-in fade-in duration-150">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setSelectedClassId(null)}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Quay lại danh sách lớp</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingClass(activeClass);
                setIsClassModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Sửa thông tin lớp</span>
            </button>

            <button
              onClick={() => onOpenCreateBatch(activeClass.id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs shadow-indigo-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo đợt chấm cho lớp</span>
            </button>
          </div>
        </div>

        {/* Top Class Banner Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl shadow-2xs">
                {activeClass.grade}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{activeClass.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 font-bold">
                    Khối {activeClass.grade}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    Năm học: {activeClass.schoolYear}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Giáo viên phụ trách: <strong className="text-slate-700">{activeClass.teacherInCharge || 'Cô Hoàng Thu Hà'}</strong>
                  {activeClass.notes && <span> • {activeClass.notes}</span>}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[90px]">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Số học sinh</span>
                <span className="text-base font-black text-slate-900 block mt-0.5">
                  {classStudents.length} em
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center min-w-[90px]">
                <span className="text-[10px] text-indigo-700 block uppercase font-bold">Điểm TB lớp</span>
                <span className="text-base font-black text-indigo-700 block mt-0.5">
                  {activeClass.averageScore || '—'}
                </span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-center min-w-[90px]">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">Bài đã chấm</span>
                <span className="text-base font-black text-emerald-700 block mt-0.5">
                  {reviewedEssaysInClass}/{totalEssaysInClass || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Table Management Header */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Danh sách học sinh lớp {activeClass.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {filteredClassStudents.length} / {classStudents.length} em
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Quản lý mã học sinh, hồ sơ và theo dõi kết quả chấm văn từng em
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setIsStudentModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm học sinh</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Nhập danh sách từ Excel/CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh theo họ tên hoặc mã học sinh..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Lọc:</span>
              </div>

              {/* Gender Filter */}
              <select
                value={studentGenderFilter}
                onChange={(e) => setStudentGenderFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none"
              >
                <option value="all">Tất cả giới tính</option>
                <option value="Nữ">Nữ</option>
                <option value="Nam">Nam</option>
                <option value="Khác">Khác</option>
              </select>

              {/* Score Filter */}
              <select
                value={studentScoreFilter}
                onChange={(e) => setStudentScoreFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:bg-white focus:outline-none"
              >
                <option value="all">Tất cả mức điểm</option>
                <option value="gioi">Điểm Giỏi (&ge; 8.0)</option>
                <option value="kha">Điểm Khá (6.5 - 7.9)</option>
                <option value="trung_binh">Điểm TB (&lt; 6.5)</option>
                <option value="chua_co">Chưa có điểm</option>
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center">STT</th>
                  <th className="py-3 px-3.5 w-28">Mã học sinh</th>
                  <th className="py-3 px-3.5">Họ và tên</th>
                  <th className="py-3 px-3.5 w-20 text-center">Giới tính</th>
                  <th className="py-3 px-3.5">Ghi chú</th>
                  <th className="py-3 px-3.5 w-24 text-center">Số bài đã làm</th>
                  <th className="py-3 px-3.5 w-24 text-center">Điểm trung bình</th>
                  <th className="py-3 px-3.5 w-32 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClassStudents.length > 0 ? (
                  filteredClassStudents.map((st, idx) => {
                    const studentSubs = submissions.filter((sub) => sub.studentId === st.id);
                    const essayCount = studentSubs.length || st.essayCount || 0;
                    const avgScore = st.averageScore || 0;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3 px-3.5 text-center text-slate-400 font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                            {st.studentCode || st.code}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-2.5">
                            {st.avatar ? (
                              <img
                                src={st.avatar}
                                alt={st.fullName || st.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                {(st.fullName || st.name || 'H').charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {st.fullName || st.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              st.gender === 'Nữ'
                                ? 'bg-rose-50 text-rose-700'
                                : st.gender === 'Nam'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {st.gender}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 max-w-xs truncate">
                          {st.notes || <span className="text-slate-300 italic">—</span>}
                        </td>
                        <td className="py-3 px-3.5 text-center font-semibold text-slate-700">
                          {essayCount} bài
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          {avgScore > 0 ? (
                            <span
                              className={`font-black text-sm ${
                                avgScore >= 8.0
                                  ? 'text-emerald-700'
                                  : avgScore >= 6.5
                                  ? 'text-indigo-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {avgScore}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingStudentDetail(st)}
                              title="Xem chi tiết & Lịch sử tiến bộ"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingStudent(st);
                                setIsStudentModalOpen(true);
                              }}
                              title="Sửa thông tin học sinh"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setDeleteTarget({
                                  type: 'student',
                                  id: st.id,
                                  name: st.fullName || st.name || 'học sinh này',
                                });
                              }}
                              title="Xóa học sinh"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-semibold text-slate-600">
                          {classStudents.length === 0
                            ? 'Chưa có học sinh nào trong lớp học này.'
                            : 'Không tìm thấy học sinh nào khớp với bộ lọc.'}
                        </p>
                        {classStudents.length === 0 && (
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setEditingStudent(null);
                                setIsStudentModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
                            >
                              + Thêm học sinh
                            </button>
                            <button
                              onClick={() => setIsImportModalOpen(true)}
                              className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer"
                            >
                              Nhập từ Excel/CSV
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals & Dialogs */}
        <ClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSave={handleSaveClass}
          editingClass={editingClass}
        />

        <StudentModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          onSave={handleSaveStudent}
          editingStudent={editingStudent}
          classes={classes}
          defaultClassId={activeClass.id}
          existingStudents={students}
        />

        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportStudents}
          targetClass={activeClass}
        />

        <StudentDetailModal
          isOpen={Boolean(viewingStudentDetail)}
          onClose={() => setViewingStudentDetail(null)}
          student={viewingStudentDetail}
          classes={classes}
          submissions={submissions}
          onOpenGrading={onOpenGrading}
          onEditStudent={(st) => {
            setEditingStudent(st);
            setIsStudentModalOpen(true);
          }}
        />

        <DeleteConfirmModal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title={deleteTarget?.type === 'class' ? 'Xác nhận xóa lớp học' : 'Xác nhận xóa học sinh'}
          message={
            deleteTarget?.type === 'class'
              ? `Bạn có chắc chắn muốn xóa lớp "${deleteTarget?.name}"? Mọi học sinh và dữ liệu liên quan sẽ bị xóa khỏi hệ thống.`
              : `Bạn có chắc chắn muốn xóa học sinh "${deleteTarget?.name}" khỏi danh sách lớp?`
          }
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 1: TRANG "LỚP HỌC" (Classes List Table)
  // ==========================================
  return (
    <div id="classes-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            <span>Quản lý Lớp học & Học sinh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách lớp, sĩ số, hồ sơ học sinh và theo dõi phổ điểm ôn thi môn Ngữ văn
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClass(null);
            setIsClassModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm lớp</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm lớp học theo tên..."
            value={classSearchTerm}
            onChange={(e) => setClassSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Khối lớp:</span>
          </div>

          <div className="flex gap-1.5">
            {(['all', '12', '11', '10'] as const).map((grade) => (
              <button
                key={grade}
                onClick={() => setGradeFilter(grade)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  gradeFilter === grade
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grade === 'all' ? 'Tất cả' : `Khối ${grade}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Table as requested: STT, Tên lớp, Khối, Số học sinh, Số bài đã chấm, Điểm trung bình gần nhất, Ngày cập nhật, Thao tác */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4">Tên lớp</th>
                <th className="py-3.5 px-4 w-24 text-center">Khối</th>
                <th className="py-3.5 px-4 w-28 text-center">Số học sinh</th>
                <th className="py-3.5 px-4 w-32 text-center">Số bài đã chấm</th>
                <th className="py-3.5 px-4 w-36 text-center">Điểm TB gần nhất</th>
                <th className="py-3.5 px-4 w-32 text-center">Ngày cập nhật</th>
                <th className="py-3.5 px-4 w-40 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls, idx) => {
                  const studentCount = students.filter((s) => s.classId === cls.id).length || cls.studentCount || 0;
                  const gradedCount = submissions.filter(
                    (s) => s.className.includes(cls.name.split(' ')[0]) && s.status === 'teacher_reviewed'
                  ).length || cls.gradedEssaysCount || 0;

                  const avgScore = cls.latestAverageScore || cls.averageScore || 0;

                  return (
                    <tr
                      key={cls.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-medium">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                            {cls.grade}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors block">
                              {cls.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Năm học {cls.schoolYear} • GV: {cls.teacherInCharge || 'Cô Hoàng Thu Hà'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          Khối {cls.grade}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {studentCount} em
                      </td>

                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {gradedCount} bài
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {avgScore > 0 ? (
                          <span
                            className={`font-black text-sm ${
                              avgScore >= 8.0
                                ? 'text-emerald-700'
                                : avgScore >= 6.5
                                ? 'text-indigo-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {avgScore}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {cls.updatedAt || cls.createdAt || '15/01/2025'}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedClassId(cls.id)}
                            title="Xem chi tiết lớp"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 font-semibold text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingClass(cls);
                              setIsClassModalOpen(true);
                            }}
                            title="Sửa thông tin lớp"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeleteTarget({
                                type: 'class',
                                id: cls.id,
                                name: cls.name,
                              });
                            }}
                            title="Xóa lớp học"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <GraduationCap className="w-10 h-10 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-600">
                        Không tìm thấy lớp học nào phù hợp.
                      </p>
                      <button
                        onClick={() => {
                          setEditingClass(null);
                          setIsClassModalOpen(true);
                        }}
                        className="mt-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer"
                      >
                        + Thêm lớp học mới
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        editingClass={editingClass}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp "${deleteTarget?.name}"? Mọi học sinh trong lớp này sẽ bị xóa theo.`}
      />
    </div>
  );
};
