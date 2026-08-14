import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  UploadCloud,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ClassRoom } from '../types';

interface ParsedStudentRow {
  stt?: number | string;
  studentCode: string;
  fullName: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  notes: string;
  isValid: boolean;
  errorMessage?: string;
}

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    students: Array<{
      studentCode: string;
      fullName: string;
      gender: 'Nam' | 'Nữ' | 'Khác';
      notes?: string;
    }>,
    overwriteExisting: boolean
  ) => void;
  targetClass: ClassRoom;
}

export const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onImport,
  targetClass,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Tải file mẫu CSV
  const handleDownloadTemplate = () => {
    const classShort = targetClass.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const csvContent =
      'STT,Mã học sinh,Họ và tên,Giới tính,Ghi chú\n' +
      `1,HS${classShort}-01,Nguyễn Văn An,Nam,Học sinh chăm chỉ\n` +
      `2,HS${classShort}-02,Trần Thị Bình,Nữ,Có năng khiếu viết văn\n` +
      `3,HS${classShort}-03,Lê Hoàng Cường,Nam,Cần rèn luyện chữ viết\n` +
      `4,HS${classShort}-04,Phạm Ngọc Diệp,Nữ,Mục tiêu khối D01\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mau_Danh_Sach_Hoc_Sinh_${classShort}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chuẩn hóa giới tính
  const normalizeGender = (val: any): 'Nam' | 'Nữ' | 'Khác' => {
    const str = String(val || '').trim().toLowerCase();
    if (str === 'nữ' || str === 'nu' || str === 'female' || str === 'f') return 'Nữ';
    if (str === 'khác' || str === 'khac' || str === 'other') return 'Khác';
    return 'Nam';
  };

  // Phân tích dữ liệu JSON thô thành danh sách học sinh
  const processRawData = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setErrorMessage('Không tìm thấy dữ liệu hoặc tệp tin rỗng.');
      setParsedRows([]);
      return;
    }

    const processed: ParsedStudentRow[] = [];

    rows.forEach((row, idx) => {
      // Tìm các thuộc tính bất kể tên hoa thường có dấu/không dấu
      const keys = Object.keys(row);
      const findKey = (candidates: string[]) => {
        return keys.find((k) =>
          candidates.some((c) =>
            k.toLowerCase().trim().replace(/[\s_\-]/g, '').includes(c.toLowerCase().replace(/[\s_\-]/g, ''))
          )
        );
      };

      const codeKey = findKey(['mahocsinh', 'mahs', 'masohs', 'code', 'studentcode', 'ma']);
      const nameKey = findKey(['hovaten', 'hoten', 'ten', 'fullname', 'name', 'hocsinh']);
      const genderKey = findKey(['gioitinh', 'gioi', 'gender', 'gt', 'phai']);
      const noteKey = findKey(['ghichu', 'note', 'notes', 'nhanxet', 'dactrung']);
      const sttKey = findKey(['stt', 'sothutu', 'no', 'index', 'id']);

      let code = codeKey ? String(row[codeKey] || '').trim() : '';
      let name = nameKey ? String(row[nameKey] || '').trim() : '';
      let genderRaw = genderKey ? row[genderKey] : 'Nam';
      let notes = noteKey ? String(row[noteKey] || '').trim() : '';
      let stt = sttKey ? row[sttKey] : idx + 1;

      // Nếu không có header rõ ràng (mảng mộc từ text), thử dò theo vị trí
      if (Array.isArray(row)) {
        // [STT, Mã HS, Họ tên, Giới tính, Ghi chú]
        if (row.length >= 2) {
          if (/^\d+$/.test(String(row[0]).trim()) && row.length >= 3) {
            stt = row[0];
            code = String(row[1] || '').trim();
            name = String(row[2] || '').trim();
            genderRaw = row[3];
            notes = String(row[4] || '').trim();
          } else {
            code = String(row[0] || '').trim();
            name = String(row[1] || '').trim();
            genderRaw = row[2];
            notes = String(row[3] || '').trim();
          }
        }
      }

      // Tự sinh mã nếu họ tên có mà mã trống
      if (!code && name) {
        const classShort = targetClass.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const num = idx + 1;
        code = `HS${classShort}-${num < 10 ? '0' + num : num}`;
      }

      const isValid = Boolean(name && code);
      let error = undefined;
      if (!name) error = 'Thiếu họ và tên';
      else if (!code) error = 'Thiếu mã học sinh';

      if (name || code) {
        processed.push({
          stt: stt || idx + 1,
          studentCode: code.toUpperCase(),
          fullName: name,
          gender: normalizeGender(genderRaw),
          notes,
          isValid,
          errorMessage: error,
        });
      }
    });

    if (processed.length === 0) {
      setErrorMessage('Không nhận diện được định dạng dữ liệu học sinh phù hợp.');
    } else {
      setErrorMessage(null);
    }
    setParsedRows(processed);
  };

  // Xử lý đọc file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 0 });
        processRawData(json);
      } catch (err: any) {
        setErrorMessage('Lỗi khi đọc file Excel/CSV: ' + (err.message || 'File không đúng định dạng.'));
      }
    };
    reader.readAsBinaryString(file);
  };

  // Xử lý phân tích từ text copy-paste
  const handleParsePasteText = () => {
    if (!pasteText.trim()) {
      setErrorMessage('Vui lòng dán nội dung từ Excel hoặc bảng tính.');
      return;
    }

    const lines = pasteText.trim().split('\n');
    const rawArray: any[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;
      // Hỗ trợ cả dấu Tab (\t) từ Excel và dấu Phẩy (,) từ CSV
      let parts = line.includes('\t') ? line.split('\t') : line.split(',');
      parts = parts.map((p) => p.trim());

      // Bỏ qua dòng tiêu đề nếu có
      if (
        parts[0]?.toLowerCase().includes('stt') ||
        parts[1]?.toLowerCase().includes('mã') ||
        parts[0]?.toLowerCase().includes('mã') ||
        parts[0]?.toLowerCase().includes('họ')
      ) {
        return;
      }

      rawArray.push(parts);
    });

    processRawData(rawArray);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const handleConfirmImport = () => {
    const validStudents = parsedRows
      .filter((r) => r.isValid)
      .map((r) => ({
        studentCode: r.studentCode,
        fullName: r.fullName,
        gender: r.gender,
        notes: r.notes,
      }));

    if (validStudents.length === 0) {
      setErrorMessage('Không có học sinh hợp lệ nào để nhập.');
      return;
    }

    onImport(validStudents, overwriteExisting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Nhập danh sách học sinh vào lớp {targetClass.name}
              </h3>
              <p className="text-xs text-slate-500">
                Hỗ trợ tệp tin Excel (.xlsx, .xls), CSV hoặc dán trực tiếp từ bảng tính
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('upload');
                setErrorMessage(null);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tải tệp Excel / CSV
            </button>
            <button
              onClick={() => {
                setActiveTab('paste');
                setErrorMessage(null);
              }}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Dán nhanh từ bảng tính
            </button>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1.5 pb-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải file mẫu (.csv)</span>
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/60 hover:bg-indigo-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">
                  {fileName ? fileName : 'Bấm để chọn file hoặc kéo thả tệp vào đây'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Định dạng hỗ trợ: .xlsx, .xls, .csv. Các cột gồm: STT, Mã học sinh, Họ và tên, Giới tính, Ghi chú
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dán dữ liệu học sinh copy từ Excel / Google Sheets:
                </label>
                <textarea
                  rows={4}
                  placeholder={`1\tHS12D1-01\tNguyễn Thảo Linh\tNữ\tHọc sinh giỏi\n2\tHS12D1-02\tTrần Gia Bảo\tNam\tNghị luận tốt`}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <button
                type="button"
                onClick={handleParsePasteText}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
              >
                Phân tích dữ liệu vừa dán
              </button>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Xem trước danh sách ({parsedRows.length} dòng)</span>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                    {validCount} hợp lệ
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                      {invalidCount} lỗi
                    </span>
                  )}
                </h4>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span>Cập nhật nếu trùng Mã học sinh</span>
                </label>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Mã HS</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3 w-20">Giới tính</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                      <th className="py-2.5 px-3 w-24 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/30'}>
                        <td className="py-2 px-3 text-center text-slate-400">{row.stt || idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{row.studentCode}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">{row.fullName}</td>
                        <td className="py-2 px-3 text-slate-600">{row.gender}</td>
                        <td className="py-2 px-3 text-slate-500 truncate max-w-xs">{row.notes || '—'}</td>
                        <td className="py-2 px-3 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Hợp lệ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold" title={row.errorMessage}>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{row.errorMessage || 'Lỗi'}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
          <p className="text-xs text-slate-500">
            Dữ liệu sẽ được lưu tự động vào bộ nhớ của lớp {targetClass.name}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleConfirmImport}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                validCount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Lưu {validCount} học sinh vào lớp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
