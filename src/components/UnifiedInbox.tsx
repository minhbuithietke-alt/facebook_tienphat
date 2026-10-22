import React, { useState } from 'react';
import {
  Plus,
  Send,
  EyeOff,
  FileCheck2,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  Printer,
} from 'lucide-react';
import {
  Conversation,
  FanpageConfig,
  LeadStatus,
  PageId,
  TechnicalSpec,
} from '../types';

interface UnifiedInboxProps {
  pages: FanpageConfig[];
  conversations: Conversation[];
  selectedPage: PageId | 'all';
  onSelectPage: (pageId: PageId | 'all') => void;
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  autoPilot: boolean;
  onToggleAutoPilot: () => void;
  isAiProcessing: boolean;
  onSendCustomerMessage: (convId: string, text: string) => Promise<void>;
  onSendStaffReply: (convId: string, text: string) => void;
  onTriggerAiReplyNow: (convId: string) => Promise<void>;
  onUpdateSpecs: (convId: string, updatedSpecs: TechnicalSpec) => void;
  onUpdateStatus: (convId: string, status: LeadStatus) => void;
  onToggleHideComment: (convId: string) => void;
  onExportProductionOrder: (convId: string) => void;
  onOpenSimulateModal: () => void;
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  pages,
  conversations,
  selectedPage,
  onSelectPage,
  activeConversationId,
  onSelectConversation,
  autoPilot,
  onToggleAutoPilot,
  isAiProcessing,
  onSendCustomerMessage,
  onSendStaffReply,
  onTriggerAiReplyNow,
  onUpdateSpecs,
  onUpdateStatus,
  onToggleHideComment,
  onExportProductionOrder,
  onOpenSimulateModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [inputMode, setInputMode] = useState<'customer' | 'staff'>('customer');
  const [messageInput, setMessageInput] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const filteredConversations = conversations.filter((conv) => {
    const matchesPage = selectedPage === 'all' || conv.pageId === selectedPage;
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesPage && matchesStatus;
  });

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ||
    filteredConversations[0] ||
    conversations[0];

  const activePage = pages.find((p) => p.id === activeConv?.pageId);

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !messageInput.trim() || isAiProcessing) return;
    const text = messageInput.trim();
    setMessageInput('');

    if (inputMode === 'customer') {
      await onSendCustomerMessage(activeConv.id, text);
    } else {
      onSendStaffReply(activeConv.id, text);
    }
  };

  const handleSpecFieldChange = (field: keyof TechnicalSpec, value: string) => {
    if (!activeConv) return;
    onUpdateSpecs(activeConv.id, {
      ...activeConv.specs,
      [field]: value,
    });
  };

  const getPageLabel = (pageId: PageId) => {
    const idx = pages.findIndex((p) => p.id === pageId) + 1;
    const page = pages.find((p) => p.id === pageId);
    return `Page ${idx}: ${page?.name || pageId}`;
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* COLUMN 1 (LEFT): Customer Conversation List */}
      <div className="w-full lg:w-88 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
        {/* Top Action & Filter Header */}
        <div className="p-4 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 whitespace-nowrap">
              Khách hàng ({filteredConversations.length})
            </h2>
            <button
              type="button"
              onClick={onOpenSimulateModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Giả lập khách nhắn mới</span>
            </button>
          </div>

          {/* Page Filter Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => onSelectPage('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedPage === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả Page
            </button>
            {pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPage(p.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedPage === p.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Page {idx + 1}
              </button>
            ))}
          </div>

          {/* Status Filter Selector */}
          <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(
              [
                { value: 'all', label: 'Tất cả' },
                { value: 'Đã chốt SĐT', label: 'Chốt SĐT' },
                { value: 'Đang hỏi quy cách', label: 'Hỏi quy cách' },
                { value: 'Cần báo giá', label: 'Cần báo giá' },
              ] as const
            ).map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => setStatusFilter(st.value)}
                className={`py-1 px-1 rounded-md font-medium whitespace-nowrap text-center transition-colors ${
                  statusFilter === st.value
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">
                Không có cuộc trò chuyện nào khớp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={onOpenSimulateModal}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                + Giả lập khách nhắn mới
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    isSelected
                      ? 'bg-amber-50/70 hover:bg-amber-50'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium text-slate-700 truncate">
                      {getPageLabel(conv.pageId)}
                    </span>
                    <span className="font-mono tabular-nums shrink-0">
                      {conv.updatedAt}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-900 mt-1 truncate">
                    {conv.customerName}
                  </div>

                  {lastMsg && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {lastMsg.sender === 'ai' ? 'AI: ' : ''}
                      {lastMsg.content}
                    </p>
                  )}

                  {/* Metadata unboxed line with separators */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs mt-2.5 text-slate-500">
                    <span
                      className={`font-semibold ${
                        conv.status === 'Đã chốt SĐT'
                          ? 'text-emerald-700'
                          : conv.status === 'Cần báo giá'
                          ? 'text-amber-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {conv.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{conv.interactionType}</span>
                    {conv.commentHidden && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium">
                          Đã ẩn bình luận SĐT
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2 (MIDDLE): Chat Conversation Window */}
      <div className="flex-1 flex flex-col bg-slate-50 h-full min-w-0">
        {activeConv ? (
          <>
            {/* Conversation Top Bar with Auto-Pilot Toggle */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {activeConv.customerName}
                  </h3>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {activePage?.name}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>{activeConv.interactionType}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={`font-semibold ${
                      activeConv.status === 'Đã chốt SĐT'
                        ? 'text-emerald-700'
                        : activeConv.status === 'Cần báo giá'
                        ? 'text-amber-700'
                        : 'text-slate-700'
                    }`}
                  >
                    Trạng thái: {activeConv.status}
                  </span>
                  {activeConv.commentHidden && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-semibold">
                        Đã ẩn bình luận chống cướp khách
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* AI Auto-Pilot Switch */}
              <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-2 rounded-lg">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    AI Tự Động Trả Lời 100% (Auto-Pilot)
                  </div>
                  <div className="text-xs text-slate-500">
                    {autoPilot
                      ? 'Gemini tự động tư vấn & bóc tách ngay lập tức'
                      : 'Tắt tự động - Chờ nhân viên bấm nút AI'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoPilot}
                  aria-label="Chế độ AI Tự Động Trả Lời 100% (Auto-Pilot)"
                  onClick={onToggleAutoPilot}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ${
                    autoPilot ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-150 ${
                      autoPilot ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeConv.messages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isCustomer ? 'items-start' : 'items-end'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 px-1">
                      {isCustomer ? (
                        <>
                          <User className="w-3.5 h-3.5 text-slate-600" />
                          <span className="font-semibold text-slate-700">
                            {activeConv.customerName}
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            {msg.timestamp}
                          </span>
                          {(msg.isHiddenComment || activeConv.commentHidden) &&
                            activeConv.interactionType ===
                              'Bình luận (Comment)' && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" />
                                  Đã ẩn bình luận chứa SĐT
                                </span>
                              </>
                            )}
                        </>
                      ) : (
                        <>
                          <Bot className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-semibold text-slate-800">
                            {msg.sender === 'ai'
                              ? 'Chuyên viên AI Tiến Phát (Gemini)'
                              : 'Chuyên viên Báo giá'}
                          </span>
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            {msg.timestamp}
                          </span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-xl rounded-xl px-4 py-3 text-sm leading-relaxed ${
                        isCustomer
                          ? 'bg-white text-slate-900 border border-slate-200'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isAiProcessing && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-2.5 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>
                    Bộ não Gemini AI đang phân tích quy cách in & tạo câu trả lời...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Interactive Customer Test Prompts */}
            <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-600 shrink-0">
                Test nhanh câu khách hỏi:
              </span>
              <button
                type="button"
                disabled={isAiProcessing}
                onClick={() =>
                  onSendCustomerMessage(
                    activeConv.id,
                    'In hộp giấy giá sao shop ơi?'
                  )
                }
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 whitespace-nowrap shrink-0"
              >
                "In hộp giấy giá sao shop?"
              </button>
              <button
                type="button"
                disabled={isAiProcessing}
                onClick={() =>
                  onSendCustomerMessage(
                    activeConv.id,
                    'Mình đặt 1000 hộp kích thước 20x15x10cm giấy Ivory 350 cán mờ, đã có file AI.'
                  )
                }
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 whitespace-nowrap shrink-0"
              >
                "Bổ sung KT 20x15x10cm, SL 1000 hộp Ivory"
              </button>
              <button
                type="button"
                disabled={isAiProcessing}
                onClick={() =>
                  onSendCustomerMessage(
                    activeConv.id,
                    'Gửi báo giá qua Zalo 0909333444 giúp mình nhé, giao về Quận 7 TP.HCM.'
                  )
                }
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 whitespace-nowrap shrink-0"
              >
                "Gửi SĐT Zalo 0909333444 + Địa chỉ"
              </button>
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={handleSendSubmit}
              className="p-4 bg-white border-t border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setInputMode('customer')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      inputMode === 'customer'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Đóng vai Khách nhắn thêm (Test AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('staff')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      inputMode === 'staff'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Nhân viên trả lời thủ công
                  </button>
                </div>

                {!autoPilot && (
                  <button
                    type="button"
                    disabled={isAiProcessing}
                    onClick={() => onTriggerAiReplyNow(activeConv.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gọi AI phân tích & trả lời ngay</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label="Nhập nội dung tin nhắn hoặc bình luận"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={
                    inputMode === 'customer'
                      ? 'Nhập tin nhắn/bình luận của khách hàng (VD: Báo giá 500 thùng 40x30x30cm, zalo 0912345678)...'
                      : 'Nhập tin nhắn nhân viên tư vấn gửi khách hàng...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  disabled={isAiProcessing || !messageInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi tin</span>
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>

      {/* COLUMN 3 (RIGHT): Automated Order Technical Spec Extraction */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full overflow-y-auto">
        {activeConv && (
          <div className="p-5 space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Phiếu Thông Số Kỹ Thuật (AI Bóc Tách)
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Tự động đọc hội thoại và điền quy cách in ấn theo thời gian thực.
                </p>
              </div>

              {/* Lead Status Selector */}
              <div>
                <label
                  htmlFor="spec-status-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Trạng thái xử lý đơn
                </label>
                <select
                  id="spec-status-select"
                  value={activeConv.status}
                  onChange={(e) =>
                    onUpdateStatus(activeConv.id, e.target.value as LeadStatus)
                  }
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Đã chốt SĐT">Đã chốt SĐT</option>
                  <option value="Đang hỏi quy cách">Đang hỏi quy cách</option>
                  <option value="Cần báo giá">Cần báo giá</option>
                </select>
              </div>

              {/* 6 Technical Spec Fields */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="spec-product"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    1. Sản phẩm quan tâm
                  </label>
                  <input
                    id="spec-product"
                    type="text"
                    value={activeConv.specs.product}
                    onChange={(e) =>
                      handleSpecFieldChange('product', e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="spec-dimensions"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      2. Kích thước (DxRxC / m2)
                    </label>
                    <input
                      id="spec-dimensions"
                      type="text"
                      value={activeConv.specs.dimensions}
                      onChange={(e) =>
                        handleSpecFieldChange('dimensions', e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="spec-quantity"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      3. Số lượng đặt in
                    </label>
                    <input
                      id="spec-quantity"
                      type="text"
                      value={activeConv.specs.quantity}
                      onChange={(e) =>
                        handleSpecFieldChange('quantity', e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="spec-material"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    4. Chất liệu & Gia công (Ivory, Kraft, C300, cán màng, sóng 3-5 lớp...)
                  </label>
                  <input
                    id="spec-material"
                    type="text"
                    value={activeConv.specs.materialAndFinishing}
                    onChange={(e) =>
                      handleSpecFieldChange(
                        'materialAndFinishing',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="spec-design"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    5. Tình trạng file thiết kế (AI/Corel/PDF hoặc cần thiết kế)
                  </label>
                  <input
                    id="spec-design"
                    type="text"
                    value={activeConv.specs.designFileStatus}
                    onChange={(e) =>
                      handleSpecFieldChange('designFileStatus', e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="spec-phone"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    6. Số điện thoại / Zalo khách hàng
                  </label>
                  <input
                    id="spec-phone"
                    type="text"
                    value={activeConv.specs.phoneOrZalo}
                    onChange={(e) =>
                      handleSpecFieldChange('phoneOrZalo', e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums font-bold border border-slate-200 rounded-lg bg-slate-50 text-emerald-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="spec-address"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    7. Địa chỉ giao hàng
                  </label>
                  <input
                    id="spec-address"
                    type="text"
                    value={activeConv.specs.deliveryAddress}
                    onChange={(e) =>
                      handleSpecFieldChange('deliveryAddress', e.target.value)
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Hide Comment & Export Production Order */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              {activeConv.savedOrder && activeConv.productionOrderCode && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Đã lưu lệnh: {activeConv.productionOrderCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOrderModalOpen(true)}
                    className="underline font-semibold"
                  >
                    Xem phiếu
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onToggleHideComment(activeConv.id)}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-colors ${
                  activeConv.commentHidden
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <EyeOff className="w-4 h-4" />
                <span>
                  {activeConv.commentHidden
                    ? 'Đã ẩn bình luận chứa SĐT (Chống cướp khách)'
                    : 'Ẩn bình luận chứa SĐT'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onExportProductionOrder(activeConv.id);
                  setOrderModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-amber-400" />
                <span>Xuất phiếu lệnh sản xuất / Lưu đơn</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Production Order Preview Modal */}
      {orderModalOpen && activeConv && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="production-order-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-mono text-amber-600 font-semibold">
                  PHIẾU LỆNH SẢN XUẤT & BÁO GIÁ XƯỞNG TIẾN PHÁT
                </div>
                <h3
                  id="production-order-title"
                  className="text-lg font-bold text-slate-900 mt-0.5"
                >
                  Mã lệnh: {activeConv.productionOrderCode || 'LSX-TP-261088'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-semibold text-slate-900">
                  {activeConv.customerName}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nguồn Fanpage:</span>
                <span className="font-medium text-slate-800">
                  {activePage?.name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Sản phẩm đặt in:</span>
                <span className="font-bold text-slate-900">
                  {activeConv.specs.product}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Kích thước kỹ thuật:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {activeConv.specs.dimensions}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Số lượng sản xuất:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {activeConv.specs.quantity}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Chất liệu & Gia công:</span>
                <span className="font-medium text-slate-900 text-right max-w-xs">
                  {activeConv.specs.materialAndFinishing}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">File thiết kế:</span>
                <span className="font-medium text-slate-900">
                  {activeConv.specs.designFileStatus}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">SĐT / Zalo khách:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-700">
                  {activeConv.specs.phoneOrZalo}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Địa chỉ giao hàng:</span>
                <span className="font-medium text-slate-900">
                  {activeConv.specs.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In phiếu lệnh</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
