import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Plus,
  Sliders,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExamRubric } from '../types';
import { useToast } from '../components/Toast';

interface ExamsRubricViewProps {
  rubrics: ExamRubric[];
  onOpenCreateBatch: () => void;
}

export const ExamsRubricView: React.FC<ExamsRubricViewProps> = ({
  rubrics,
  onOpenCreateBatch,
}) => {
  const { showToast } = useToast();
  const [selectedRubric, setSelectedRubric] = useState<ExamRubric>(rubrics[0]);
  const [expandedSection, setExpandedSection] = useState<string>('sec-doc-hieu');

  return (
    <div id="exams-rubric-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            <span>Ma trận Đề thi & Khung Tiêu chí Rubric</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu trúc ma trận chuẩn Đề thi Tốt nghiệp THPT 2025 theo Chương trình GDPT 2018
          </p>
        </div>

        <button
          onClick={() => {
            showToast('Tính năng tạo mẫu Rubric tùy chỉnh đã sẵn sàng!', 'info');
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm bộ Rubric mới</span>
        </button>
      </div>

      {/* Main Rubric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rubric Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block px-1">
            Danh sách Đề thi & Rubric chuẩn
          </span>

          {rubrics.map((r) => {
            const isSelected = selectedRubric.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRubric(r)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-indigo-600 px-2 py-0.5 bg-white rounded-md border border-indigo-100">
                    {r.type}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{r.totalScore} điểm</span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 mt-2">{r.title}</h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {r.timeLimitMinutes} phút
                  </span>
                  <span>•</span>
                  <span>Khối {r.grade}</span>
                  <span>•</span>
                  <span>{r.sections.length} phần thi</span>
                </div>
              </div>
            );
          })}

          {/* Standard GDPT 2018 highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white text-xs space-y-2">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Đặc điểm cấu trúc THPT 2025
            </span>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              - Phần I: Đọc hiểu 4.0đ (Ngữ liệu mới ngoài SGK, 4 câu hỏi nhận biết, thông hiểu, vận dụng).<br />
              - Phần II: Nghị luận xã hội 2.0đ (Đoạn văn ~200 chữ tích hợp với ngữ liệu Đọc hiểu).<br />
              - Phần III: Nghị luận văn học 4.0đ (Bài văn ~600 chữ phân tích giá trị tác phẩm).
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Criteria Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase">
                Chi tiết tiêu chuẩn chấm điểm
              </span>
              <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedRubric.title}</h3>
            </div>

            <button
              onClick={onOpenCreateBatch}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs self-start"
            >
              Áp dụng cho đợt chấm mới
            </button>
          </div>

          {/* Prompts preview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">Đề bài tham chiếu:</span>
            {selectedRubric.promptSocial && (
              <p className="text-slate-700">
                <span className="font-semibold text-indigo-700">Câu NLXH:</span> {selectedRubric.promptSocial}
              </p>
            )}
            {selectedRubric.promptLiterature && (
              <p className="text-slate-700">
                <span className="font-semibold text-indigo-700">Câu NLVH:</span> {selectedRubric.promptLiterature}
              </p>
            )}
          </div>

          {/* Sections and Criteria Accordions */}
          <div className="space-y-4">
            {selectedRubric.sections.map((section) => (
              <div
                key={section.id}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
              >
                <div
                  onClick={() =>
                    setExpandedSection(expandedSection === section.id ? '' : section.id)
                  }
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-sm text-slate-900">{section.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Tối đa {section.maxScore} điểm
                    </span>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {expandedSection === section.id && (
                  <div className="p-4 bg-white divide-y divide-slate-100 text-xs space-y-4">
                    {section.criteria.map((crit) => (
                      <div key={crit.id} className="pt-3 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-xs">{crit.name}</span>
                          <span className="font-bold text-indigo-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {crit.maxScore} điểm
                          </span>
                        </div>
                        <p className="text-slate-600">{crit.description}</p>

                        {/* 4 Levels Guide */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                            <span className="font-bold text-emerald-800 block text-[10px] uppercase">
                              Giỏi / Tối đa
                            </span>
                            <p className="text-[11px] text-emerald-700 mt-0.5">
                              {crit.scoringGuide.excellent}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100">
                            <span className="font-bold text-blue-800 block text-[10px] uppercase">
                              Khá
                            </span>
                            <p className="text-[11px] text-blue-700 mt-0.5">
                              {crit.scoringGuide.good}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                            <span className="font-bold text-amber-800 block text-[10px] uppercase">
                              Trung bình
                            </span>
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              {crit.scoringGuide.average}
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100">
                            <span className="font-bold text-rose-800 block text-[10px] uppercase">
                              Yếu / Cần cố gắng
                            </span>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              {crit.scoringGuide.weak}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
