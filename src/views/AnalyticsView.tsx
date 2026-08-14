import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  CheckCircle2,
  PieChart,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ClassRoom, EssaySubmission, GradingBatch } from '../types';

interface AnalyticsViewProps {
  classes: ClassRoom[];
  batches: GradingBatch[];
  submissions: EssaySubmission[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  classes,
  batches,
  submissions,
}) => {
  // Score buckets for THPT graduation distribution
  const scoreBuckets = [
    { range: '< 5.0', count: 1, label: 'Yếu', color: 'bg-rose-500' },
    { range: '5.0 - 6.25', count: 3, label: 'Trung bình', color: 'bg-amber-500' },
    { range: '6.5 - 7.75', count: 18, label: 'Khá', color: 'bg-blue-500' },
    { range: '8.0 - 8.75', count: 20, label: 'Giỏi', color: 'bg-indigo-500' },
    { range: '9.0 - 10.0', count: 6, label: 'Xuất sắc', color: 'bg-emerald-500' },
  ];

  const totalEvaluated = scoreBuckets.reduce((sum, b) => sum + b.count, 0);

  const commonErrors = [
    {
      title: 'Thiếu dẫn chứng thực tế trong đoạn NLXH',
      percent: 42,
      impact: 'Trừ 0.25 - 0.5 điểm',
      advice: 'Cần hướng dẫn học sinh đọc thêm tin tức thời sự, cập nhật các tấm gương thanh niên tiêu biểu.',
    },
    {
      title: 'Diễn xuôi văn bản, kể lể thay vì phân tích nghệ thuật',
      percent: 36,
      impact: 'Trừ 0.5 - 1.0 điểm',
      advice: 'Cần rèn kỹ năng bám sát từ ngữ, hình ảnh, biện pháp tu từ và cảm xúc nhân vật.',
    },
    {
      title: 'Sử dụng từ ngữ khẩu ngữ hoặc văn phong nói',
      percent: 28,
      impact: 'Trừ 0.25 điểm',
      advice: 'Nhắc nhở học sinh sử dụng vốn từ nghị luận chuẩn mực, giàu tính biểu cảm.',
    },
    {
      title: 'Phần kết bài quá vội vàng hoặc thiếu đánh giá nâng tầm',
      percent: 22,
      impact: 'Trừ 0.25 - 0.5 điểm',
      advice: 'Luyện tập các công thức kết bài mở rộng theo lý luận văn học ngắn gọn.',
    },
  ];

  return (
    <div id="analytics-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Thống kê & Phổ điểm Ôn thi Tốt nghiệp THPT</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Phân tích phổ điểm, tỉ lệ xếp loại học lực và các điểm nghẽn kỹ năng cần bồi dưỡng
        </p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Điểm TB toàn khối 12</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-indigo-600">7.82</span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            +0.35 điểm so với khảo sát đợt trước
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tỉ lệ Giỏi & Xuất sắc (≥ 8.0)</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-emerald-600">54.2%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            26 / 48 học sinh được khảo sát
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Điểm cao nhất ghi nhận</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-indigo-900">9.25</span>
            <span className="text-xs text-slate-500">/ 10</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            Lớp 12D1 (Nguyễn Thảo Linh)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tỉ lệ đạt yêu cầu tốt nghiệp</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-sky-600">97.9%</span>
          </div>
          <span className="text-[11px] text-sky-700 font-medium mt-1 block">
            Chỉ 1 em dưới 5.0đ cần phụ đạo
          </span>
        </div>
      </div>

      {/* Main Charts Row: Score Distribution & Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Phổ điểm (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Phổ điểm khảo sát Ngữ văn THPT 2025</h3>
              <p className="text-xs text-slate-500">Phân bố số lượng học sinh theo từng dải điểm</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Tổng {totalEvaluated} bài đã chấm
            </span>
          </div>

          {/* Bar Chart Representation */}
          <div className="space-y-4 pt-2">
            {scoreBuckets.map((bucket, idx) => {
              const percent = Math.round((bucket.count / totalEvaluated) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 w-24">{bucket.range}</span>
                    <span className="text-slate-500">{bucket.label}</span>
                    <span className="font-bold text-slate-900 w-16 text-right">
                      {bucket.count} em ({percent}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bucket.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold text-slate-800">Nhận định chuyên môn AI:</span> Phổ điểm tập trung chủ yếu ở khoảng 7.5 - 8.5 điểm (Ban Xã hội) và 6.5 - 7.5 điểm (Ban Tự nhiên). Cấu trúc đề 2025 phân hóa học sinh rất tốt ở câu Vận dụng Đọc hiểu và chiều sâu nghệ thuật bài NLVH.
            </p>
          </div>
        </div>

        {/* Common Errors Analysis (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">Lỗi sai phổ biến cần lưu ý</h3>
              <p className="text-[11px] text-slate-500">Tổng hợp tự động từ các bài AI phân tích</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {commonErrors.map((err, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-800 leading-snug">{err.title}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                    {err.percent}% HS mắc
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{err.advice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
