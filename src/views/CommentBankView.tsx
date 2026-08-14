import React, { useState } from 'react';
import {
  MessageSquareQuote,
  Search,
  Plus,
  Copy,
  Check,
  Tag,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';
import { CommentBankItem } from '../types';
import { useToast } from '../components/Toast';

interface CommentBankViewProps {
  commentBank: CommentBankItem[];
  onAddComment: (comment: CommentBankItem) => void;
}

export const CommentBankView: React.FC<CommentBankViewProps> = ({
  commentBank,
  onAddComment,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New comment modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<CommentBankItem['category']>('Khen ngợi');
  const [newTags, setNewTags] = useState('');

  const categories = [
    'all',
    'Khen ngợi',
    'Lập luận & Dẫn chứng',
    'Diễn đạt & Dùng từ',
    'Chính tả & Ngữ pháp',
    'Mở bài - Kết bài',
    'Liên hệ thực tế',
  ];

  const filteredComments = commentBank.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (comment: CommentBankItem) => {
    navigator.clipboard.writeText(comment.text);
    setCopiedId(comment.id);
    showToast('Đã sao chép nhận xét vào bộ nhớ tạm!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const item: CommentBankItem = {
      id: `cb-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Mới'],
      usageCount: 0,
    };

    onAddComment(item);
    showToast('Đã thêm nhận xét mới vào ngân hàng!', 'success');
    setShowAddModal(false);
    setNewText('');
    setNewTags('');
  };

  return (
    <div id="comment-bank-view" className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-indigo-600" />
            <span>Ngân hàng nhận xét & Lời khuyên mẫu</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kho nhận xét chuẩn mực môn Ngữ văn THPT hỗ trợ chèn nhanh khi chấm bài
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm nhận xét mới</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm nhận xét theo từ khóa hoặc thẻ tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <span className="text-xs text-slate-500 font-medium self-center">
            Hiển thị {filteredComments.length} nhận xét
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Tất cả danh mục' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Masonry/Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComments.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Đã dùng {item.usageCount} lần
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                "{item.text}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Thêm nhận xét mẫu mới</h3>
            <form onSubmit={handleCreateComment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Danh mục phân loại
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                >
                  <option value="Khen ngợi">Khen ngợi</option>
                  <option value="Lập luận & Dẫn chứng">Lập luận & Dẫn chứng</option>
                  <option value="Diễn đạt & Dùng từ">Diễn đạt & Dùng từ</option>
                  <option value="Chính tả & Ngữ pháp">Chính tả & Ngữ pháp</option>
                  <option value="Mở bài - Kết bài">Mở bài - Kết bài</option>
                  <option value="Liên hệ thực tế">Liên hệ thực tế</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung nhận xét <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Nhập nội dung lời nhận xét mẫu chuẩn mực..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thẻ từ khóa (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="VD: Dẫn chứng, Sáng tạo, Kết bài hay"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Lưu nhận xét
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
