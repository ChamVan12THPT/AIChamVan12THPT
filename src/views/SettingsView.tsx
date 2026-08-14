import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Sliders,
  Shield,
  Download,
  FileSpreadsheet,
  FileText,
  User,
  Save,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const SettingsView: React.FC = () => {
  const { showToast } = useToast();

  // Teacher Profile state
  const [teacherName, setTeacherName] = useState('Cô Nguyễn Thị Mai');
  const [schoolName, setSchoolName] = useState('Trường THPT Chuyên Hà Nội - Amsterdam');
  const [subjectRole, setSubjectRole] = useState('Tổ trưởng Chuyên môn Ngữ văn');

  // AI Configuration state
  const [strictnessLevel, setStrictnessLevel] = useState<'strict' | 'balanced' | 'encouraging'>('balanced');
  const [autoDetectErrors, setAutoDetectErrors] = useState(true);
  const [autoMatchRubric, setAutoMatchRubric] = useState(true);
  const [minWordThreshold, setMinWordThreshold] = useState(400);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình trợ lý AI và thông tin giáo viên!', 'success');
  };

  const handleExportExcel = () => {
    showToast('Đang tạo và xuất bảng tổng hợp điểm môn Ngữ văn (Excel)...', 'info');
    setTimeout(() => {
      showToast('Đã xuất thành công tệp "Bang_Diem_Khao_Sat_THPT_2025.xlsx"!', 'success');
    }, 1200);
  };

  const handleExportPDF = () => {
    showToast('Đang xuất phiếu nhận xét chi tiết từng học sinh (PDF)...', 'info');
    setTimeout(() => {
      showToast('Đã xuất thành công tệp "Phieu_Nhan_Xet_Hoc_Sinh.pdf"!', 'success');
    }, 1200);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Cài đặt hệ thống & Cấu hình Trợ lý AI</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh tiêu chí phân tích AI, thông tin giảng dạy và quản lý xuất dữ liệu
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. AI Assistant Persona & Strictness */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Thiết lập Trợ lý AI (Gemini 3.7 Flash)</h3>
              <p className="text-xs text-slate-500">
                Điều chỉnh mức độ khắt khe và các tính năng kiểm tra tự động
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Định hướng & Mức độ chấm điểm của AI:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStrictnessLevel('strict')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    strictnessLevel === 'strict'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">Khắt khe (Thi thử QG)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Soi kỹ từng lỗi dùng từ, bắt buộc dẫn chứng mới và lập luận chặt chẽ.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStrictnessLevel('balanced')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    strictnessLevel === 'balanced'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-indigo-950">Chuẩn mực (Khuyến nghị)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Bám sát đáp án Bộ GD&ĐT 2025, cân đối giữa cảm thụ và kỹ năng.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStrictnessLevel('encouraging')}
                  className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    strictnessLevel === 'encouraging'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">Khích lệ động viên</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Tập trung chỉ ra các điểm sáng, phù hợp các lớp ban Tự nhiên chống liệt.
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDetectErrors}
                  onChange={(e) => setAutoDetectErrors(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Tự động phát hiện lỗi chính tả, từ ngữ khẩu ngữ và câu văn què cụt</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoMatchRubric}
                  onChange={(e) => setAutoMatchRubric(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Tự động đối chiếu cấu trúc Đọc hiểu (4 câu) và phân tích đề xuất điểm chi tiết</span>
              </label>
            </div>
          </div>
        </div>

        {/* 2. Teacher Profile */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Thông tin giáo viên phụ trách</h3>
              <p className="text-xs text-slate-500">Hiển thị trên phiếu kết quả và báo cáo gửi phụ huynh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên giáo viên</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trường THPT</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Chức vụ / Tổ bộ môn</label>
              <input
                type="text"
                value={subjectRole}
                onChange={(e) => setSubjectRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Export Data Tools */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Xuất báo cáo & Bảng điểm</h3>
              <p className="text-xs text-slate-500">Tải dữ liệu điểm đã duyệt để nhập sổ điểm nhà trường</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportExcel}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Xuất bảng điểm Excel (.xlsx)</span>
                <span className="text-[11px] text-slate-500">Chuẩn mẫu nhập sổ điểm VnEdu / SMAS</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block">Xuất phiếu nhận xét PDF</span>
                <span className="text-[11px] text-slate-500">In phiếu gửi học sinh và phụ huynh</span>
              </div>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
};
