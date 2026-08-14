import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  RotateCw,
  Trash2,
  MoveLeft,
  MoveRight,
  Eye,
  Plus,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { PageImageItem, Student, GradingBatch } from '../types';
import { documentStorageService } from '../services/storageService';
import { sampleEssayPages } from '../services/batchSubmissionService';
import { useToast } from './Toast';

interface UploadEssayModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: GradingBatch;
  students: Student[];
  onSaveEssaySubmission: (submissionData: {
    studentId: string;
    studentName: string;
    studentCode: string;
    className: string;
    examId: string;
    examTitle: string;
    pageImages: PageImageItem[];
    notes?: string;
  }) => void;
  onOpenViewer?: (images: PageImageItem[], initialIdx: number) => void;
}

export const UploadEssayModal: React.FC<UploadEssayModalProps> = ({
  isOpen,
  onClose,
  batch,
  students,
  onSaveEssaySubmission,
  onOpenViewer,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [pageImages, setPageImages] = useState<PageImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const targetStudents = students.filter((s) => s.classId === batch.classId);
  const selectedStudent = targetStudents.find((s) => s.id === selectedStudentId) || targetStudents[0] || students[0];

  // Process files selected or dropped
  const processFiles = async (files: FileList | File[]) => {
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (validTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      showToast('Vui lòng chọn file hợp lệ (JPG, JPEG, PNG, hoặc PDF)', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const newItems: PageImageItem[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const uploaded = await documentStorageService.uploadFile(file, `batch-${batch.id}`);
        uploaded.pageNumber = pageImages.length + newItems.length + 1;
        newItems.push(uploaded);
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }

      setPageImages((prev) => [...prev, ...newItems]);
      showToast(`Đã thêm thành công ${newItems.length} trang bài viết`, 'success');
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      showToast('Có lỗi xảy ra khi tải ảnh lên', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Re-order and manipulation handlers
  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= pageImages.length) return;

    const copy = [...pageImages];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Cập nhật lại số thứ tự trang 1..N
    const renumbered = copy.map((item, idx) => ({ ...item, pageNumber: idx + 1 }));
    setPageImages(renumbered);
  };

  const handleRotatePage = (index: number) => {
    const copy = [...pageImages];
    const currentRot = copy[index].rotation || 0;
    copy[index] = { ...copy[index], rotation: (currentRot + 90) % 360 };
    setPageImages(copy);
  };

  const handleDeletePage = (index: number) => {
    const copy = pageImages.filter((_, idx) => idx !== index);
    const renumbered = copy.map((item, idx) => ({ ...item, pageNumber: idx + 1 }));
    setPageImages(renumbered);
  };

  const handleLoadSamplePages = () => {
    setPageImages(sampleEssayPages);
    showToast('Đã nạp 8 trang bài viết mẫu chuẩn THPT!', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Vui lòng chọn học sinh được gán bài nộp', 'error');
      return;
    }
    if (pageImages.length === 0) {
      showToast('Vui lòng tải lên ít nhất 1 ảnh trang bài làm', 'error');
      return;
    }

    onSaveEssaySubmission({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName || selectedStudent.name || 'Học sinh',
      studentCode: selectedStudent.studentCode || selectedStudent.code || 'HS',
      className: batch.className,
      examId: batch.examId,
      examTitle: batch.examTitle,
      pageImages,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-upload-essay"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Tải ảnh & Ghép trang bài làm</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-medium">
                  {batch.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ JPG, PNG, PDF đa trang (tối ưu cho bài viết tay từ 1 đến 8+ trang)
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

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Chọn Học Sinh */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Bước 1: Chọn học sinh nộp bài trong lớp {batch.className}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {targetStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.studentCode || st.code} - {st.fullName || st.name} ({st.gender})
                    </option>
                  ))}
                  {targetStudents.length === 0 && (
                    <option value="">Lớp chưa có học sinh nào</option>
                  )}
                </select>
              </div>
              <div className="text-xs text-slate-500">
                {selectedStudent ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Đang gán cho: <strong className="text-slate-800">{selectedStudent.fullName || selectedStudent.name}</strong> ({selectedStudent.studentCode || selectedStudent.code})
                  </span>
                ) : (
                  <span>Vui lòng chọn học sinh</span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Upload Zone & Drag Drop */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Bước 2: Tải lên các trang bài làm (Thứ tự từ Trang 1 đến hết)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSamplePages}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Nạp 8 trang bài thi mẫu</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDraggingOver
                  ? 'border-indigo-500 bg-indigo-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/40 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Kéo thả ảnh bài viết vào đây hoặc <span className="text-indigo-600 underline">Bấm để chọn file</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hỗ trợ tải cùng lúc nhiều ảnh JPG, PNG hoặc file PDF chụp bài làm của học sinh
                  </p>
                </div>
              </div>
            </div>

            {/* Upload progress indicator */}
            {isUploading && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-3">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex-1">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-700 font-mono">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Step 3: Quản lý & Sắp xếp trang (Thumbnail Grid, Rotate, Re-order, Delete) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Danh sách trang ({pageImages.length} trang đã chọn)</span>
              </span>
              {pageImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPageImages([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                >
                  Xóa tất cả trang
                </button>
              )}
            </div>

            {pageImages.length === 0 ? (
              <div className="p-8 rounded-xl border border-slate-200/80 bg-white text-center text-slate-400 text-xs">
                Chưa có trang bài viết nào. Thầy/Cô hãy tải ảnh hoặc bấm "Nạp 8 trang bài thi mẫu" ở trên.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {pageImages.map((page, idx) => (
                  <div
                    key={page.id}
                    className="group relative bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Top page badge */}
                    <div className="px-2.5 py-1.5 bg-slate-900/80 text-white text-[11px] font-bold flex items-center justify-between">
                      <span>Trang {idx + 1}</span>
                      <span className="text-[10px] text-slate-300 font-normal">
                        {page.rotation > 0 ? `${page.rotation}°` : ''}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative aspect-[3/4] bg-slate-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={page.url}
                        alt={`Trang ${idx + 1}`}
                        style={{ transform: `rotate(${page.rotation || 0}deg)` }}
                        className="w-full h-full object-cover transition-transform duration-200"
                      />

                      {/* Quick Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="Xem phóng to"
                          onClick={() => onOpenViewer && onOpenViewer(pageImages, idx)}
                          className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-indigo-600 shadow-sm cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Xoay 90 độ"
                          onClick={() => handleRotatePage(idx)}
                          className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white hover:text-indigo-600 shadow-sm cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Xóa trang"
                          onClick={() => handleDeletePage(idx)}
                          className="p-1.5 rounded-lg bg-white/90 text-rose-600 hover:bg-rose-50 shadow-sm cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Order Controls */}
                    <div className="px-2 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePage(idx, 'left')}
                        title="Di chuyển sang trái"
                        className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <MoveLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        P.{idx + 1}
                      </span>
                      <button
                        type="button"
                        disabled={idx === pageImages.length - 1}
                        onClick={() => handleMovePage(idx, 'right')}
                        title="Di chuyển sang phải"
                        className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 4: Ghi chú thêm */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú riêng về bài nộp (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Bài viết tay 8 trang, chữ viết rõ ràng, có phần phụ lục bổ sung"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {pageImages.length > 0 && (
              <span>
                Tổng cộng: <strong className="text-slate-800">{pageImages.length} trang</strong> đã sẵn sàng ghép thành bài làm.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              id="btn-confirm-save-essay"
              disabled={pageImages.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Lưu bài & Gán cho học sinh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
