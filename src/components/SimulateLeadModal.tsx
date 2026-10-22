import React, { useState } from 'react';
import { X, MessageSquarePlus, Sparkles } from 'lucide-react';
import { FanpageConfig, InteractionType, PageId } from '../types';
import { SIMULATED_SCENARIOS } from '../data/initialData';

interface SimulateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FanpageConfig[];
  onSimulateSubmit: (payload: {
    pageId: PageId;
    customerName: string;
    interactionType: InteractionType;
    message: string;
  }) => Promise<void>;
}

export const SimulateLeadModal: React.FC<SimulateLeadModalProps> = ({
  isOpen,
  onClose,
  pages,
  onSimulateSubmit,
}) => {
  const [pageId, setPageId] = useState<PageId>('page2');
  const [customerName, setCustomerName] = useState('Nguyễn Minh Khôi (Shop Đặc Sản)');
  const [interactionType, setInteractionType] = useState<InteractionType>('Bình luận (Comment)');
  const [message, setMessage] = useState(
    'Shop báo giá giúp mình 1000 hộp giấy Kraft đựng cà phê kích thước 15x10x8cm, cán màng mờ, đã có file AI. Liên hệ Zalo mình 0905123789 giao Gia Lai nhé!'
  );
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePresetClick = (scenario: (typeof SIMULATED_SCENARIOS)[number]) => {
    setPageId(scenario.pageId);
    setCustomerName(scenario.customerName);
    setInteractionType(scenario.interactionType);
    setMessage(scenario.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSimulateSubmit({
        pageId,
        customerName: customerName.trim(),
        interactionType,
        message: message.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulate-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-xl w-full p-6 space-y-5 shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="simulate-modal-title" className="text-base font-bold text-slate-900">
                Giả Lập Khách Hàng Nhắn Tin / Bình Luận Mới
              </h3>
              <p className="text-xs text-slate-500">
                Test thực tế tốc độ Gemini AI tư vấn, ẩn bình luận chứa SĐT và bóc tách phiếu kỹ thuật.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng cửa sổ giả lập"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Scenarios */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700">
            Chọn nhanh tình huống thực tế ngành in:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SIMULATED_SCENARIOS.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(sc)}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-900 line-clamp-1">
                  {sc.label}
                </div>
                <div className="text-slate-500 line-clamp-1 mt-0.5">
                  {sc.customerName} · {sc.interactionType}
                </div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="sim-page"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Chọn Fanpage nhận tin
              </label>
              <select
                id="sim-page"
                value={pageId}
                onChange={(e) => setPageId(e.target.value as PageId)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                {pages.map((p, idx) => (
                  <option key={p.id} value={p.id}>
                    Page {idx + 1}: {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sim-type"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Loại tương tác
              </label>
              <select
                id="sim-type"
                value={interactionType}
                onChange={(e) =>
                  setInteractionType(e.target.value as InteractionType)
                }
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-900"
              >
                <option value="Bình luận (Comment)">Bình luận (Comment)</option>
                <option value="Tin nhắn (Inbox)">Tin nhắn (Inbox)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="sim-customer"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Tên Facebook khách hàng
            </label>
            <input
              id="sim-customer"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="sim-message"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Nội dung khách nhắn / bình luận
            </label>
            <textarea
              id="sim-message"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {submitting
                  ? 'Đang gửi & gọi Gemini AI...'
                  : 'Gửi vào Hộp thư & Chạy AI Bóc Tách'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
