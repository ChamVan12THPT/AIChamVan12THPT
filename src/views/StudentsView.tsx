import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Award,
  BookOpen,
  TrendingUp,
  X,
  FileText,
  Sparkles,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Student, ClassRoom, EssaySubmission } from '../types';
import { useToast } from '../components/Toast';
import { StudentModal } from '../components/StudentModal';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ImportStudentsModal } from '../components/ImportStudentsModal';

interface StudentsViewProps {
  students: Student[];
  classes: ClassRoom[];
  submissions: EssaySubmission[];
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
  onOpenGrading: (submission: EssaySubmission) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  submissions,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkImportStudents,
  onOpenGrading,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Nam' | 'Nữ' | 'Khác'>('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<'all' | 'gioi' | 'kha' | 'trung_binh'>('all');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudentDetail, setViewingStudentDetail] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = s.fullName || s.name || '';
      const code = s.studentCode || s.code || '';
      const className = s.className || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        className.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchesGender = selectedGender === 'all' || s.gender === selectedGender;

      let matchesScore = true;
      const score = s.averageScore || 0;
      if (selectedScoreFilter === 'gioi') matchesScore = score >= 8.0;
      else if (selectedScoreFilter === 'kha') matchesScore = score >= 6.5 && score < 8.0;
      else if (selectedScoreFilter === 'trung_binh') matchesScore = score > 0 && score < 6.5;

      return matchesSearch && matchesClass && matchesGender && matchesScore;
    });
  }, [students, searchTerm, selectedClass, selectedGender, selectedScoreFilter]);

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

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    onDeleteStudent(deleteTarget.id);
    showToast(`Đã xóa học sinh ${deleteTarget.fullName || deleteTarget.name}!`, 'info');
    setDeleteTarget(null);
  };

  const handleBulkImport = (
    importedList: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      notes?: string;
    }>,
    overwrite: boolean
  ) => {
    const targetClassId = selectedClass !== 'all' ? selectedClass : (classes[0] ? classes[0].id : '');
    if (!targetClassId) return;

    onBulkImportStudents(targetClassId, importedList, overwrite);
    showToast(`Đã nhập thành công ${importedList.length} học sinh!`, 'success');
  };

  const activeImportClass = useMemo(() => {
    if (selectedClass !== 'all') {
      return classes.find((c) => c.id === selectedClass) || classes[0];
    }
    return classes[0] || { id: 'default', name: 'Lớp 12', grade: '12', schoolYear: '2024-2025' };
  }, [classes, selectedClass]);

  return (
    <div id="students-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Hồ sơ học sinh & Lịch sử tiến bộ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi năng lực ngữ văn, lịch sử điểm số và các nhận xét bồi dưỡng học sinh toàn trường
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm học sinh</span>
          </button>

          {classes.length > 0 && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Nhập từ Excel/CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh, mã số hoặc lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Class filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả các lớp ({students.length} em)</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Gender filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nữ">Nữ</option>
            <option value="Nam">Nam</option>
            <option value="Khác">Khác</option>
          </select>

          {/* Score filter */}
          <select
            value={selectedScoreFilter}
            onChange={(e) => setSelectedScoreFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
          >
            <option value="all">Tất cả học lực</option>
            <option value="gioi">Điểm Giỏi (&ge; 8.0)</option>
            <option value="kha">Điểm Khá (6.5 - 7.9)</option>
            <option value="trung_binh">Điểm TB (&lt; 6.5)</option>
          </select>
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const studentSubs = submissions.filter((sub) => sub.studentId === student.id);
            const essayCount = studentSubs.length || student.essayCount || 0;
            const avg = student.averageScore || 0;

            return (
              <div
                key={student.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.fullName || student.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center">
                          {(student.fullName || student.name || 'H').charAt(0)}
                        </div>
                      )}

                      <div>
                        <h3
                          onClick={() => setViewingStudentDetail(student)}
                          className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {student.fullName || student.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500 font-mono font-bold">
                            {student.studentCode || student.code}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold truncate max-w-[120px]">
                            {student.className}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">Điểm TB</span>
                      <span
                        className={`text-lg font-black ${
                          avg >= 8.0
                            ? 'text-emerald-700'
                            : avg >= 6.5
                            ? 'text-indigo-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {avg > 0 ? avg : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Strengths */}
                  <div className="mt-4 space-y-2 text-xs">
                    {student.notes ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] line-clamp-2 italic">
                        "{student.notes}"
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-800 text-[11px]">
                        <span className="font-bold block mb-0.5">Đặc trưng:</span>
                        <p className="line-clamp-2">
                          {student.strengthsSummary || 'Hành văn mạch lạc, tích cực làm bài.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Đã làm: <strong>{essayCount}</strong> bài</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingStudentDetail(student)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Hồ sơ</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setIsStudentModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Sửa học sinh"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget(student)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa học sinh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">Không tìm thấy học sinh phù hợp</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ bớt các tiêu chí lọc để xem thêm kết quả.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        classes={classes}
        existingStudents={students}
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

      {classes.length > 0 && (
        <ImportStudentsModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleBulkImport}
          targetClass={activeImportClass}
        />
      )}

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa học sinh"
        message={`Bạn có chắc chắn muốn xóa học sinh "${deleteTarget?.fullName || deleteTarget?.name}" (${deleteTarget?.studentCode || deleteTarget?.code})?`}
      />
    </div>
  );
};
