import React, { useState } from 'react';
import {
  Edit3,
  Check,
  X,
  MessageSquare,
  PhoneCall,
  FileClock,
  ShieldAlert,
  ArrowRight,
  Printer,
  Layers,
  Package,
  Link2,
  Database,
  LogIn,
  Trash2,
} from 'lucide-react';
import {
  Conversation,
  FanpageConfig,
  FirestoreSavedOrder,
  PageId,
} from '../types';
import { computeDashboardStats } from '../utils/printingBrain';
import { User } from '../firebase';

interface FanpageDashboardProps {
  pages: FanpageConfig[];
  conversations: Conversation[];
  selectedPage: PageId | 'all';
  onSelectPage: (pageId: PageId | 'all') => void;
  onUpdatePageName: (pageId: PageId, newName: string) => void;
  onOpenInboxForPage: (pageId: PageId | 'all') => void;
  onOpenSimulateModal: () => void;
  onOpenFacebookModal: () => void;
  currentUser: User | null;
  onStaffLogin: () => void;
  firestoreOrders: FirestoreSavedOrder[];
  onDeleteFirestoreOrder: (orderId: string) => Promise<void>;
}

export const FanpageDashboard: React.FC<FanpageDashboardProps> = ({
  pages,
  conversations,
  selectedPage,
  onSelectPage,
  onUpdatePageName,
  onOpenInboxForPage,
  onOpenSimulateModal,
  onOpenFacebookModal,
  currentUser,
  onStaffLogin,
  firestoreOrders,
  onDeleteFirestoreOrder,
}) => {
  const [editingPageId, setEditingPageId] = useState<PageId | null>(null);
  const [editingName, setEditingName] = useState('');

  const stats = computeDashboardStats(pages, conversations, selectedPage);

  const visiblePages =
    selectedPage === 'all' ? pages : pages.filter((p) => p.id === selectedPage);

  const startEditing = (page: FanpageConfig) => {
    setEditingPageId(page.id);
    setEditingName(page.name);
  };

  const savePageName = (pageId: PageId) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onUpdatePageName(pageId, trimmed);
    }
    setEditingPageId(null);
  };

  const getPageIcon = (id: PageId) => {
    if (id === 'page1') return Printer;
    if (id === 'page2') return Layers;
    return Package;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Multi-Page Switcher */}
      <div className="space-y-4 pb-5 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Quản Lý 3 Fanpage In Ấn & Bao Bì
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Giám sát trực tuyến lưu lượng tin nhắn, kết nối Facebook OAuth (tối đa 3 Fanpage), nhận Webhook Graph API và lưu đơn hàng lên Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={onOpenFacebookModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Kết nối Facebook OAuth (Tối đa 3 Page) & Webhook</span>
            </button>

            <button
              type="button"
              onClick={onOpenSimulateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              + Giả lập khách nhắn tin/bình luận mới
            </button>
          </div>
        </div>

        <div
          role="group"
          aria-label="Lọc theo Fanpage"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/80 rounded-lg"
        >
          <button
            type="button"
            onClick={() => onSelectPage('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedPage === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Xem tất cả (3 Page)
          </button>
          {pages.map((p, index) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPage(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedPage === p.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Page {index + 1}: {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Số tin nhắn AI đã xử lý</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {stats.totalHandledMessages.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Phản hồi tự động 24/7 qua Webhook
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Số SĐT khách đã thu thập</span>
            <PhoneCall className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-700 font-mono tabular-nums mt-2">
            {stats.totalPhonesCollected.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tự động đồng bộ Zalo báo giá xưởng
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Số đơn chờ báo giá kỹ thuật</span>
            <FileClock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600 font-mono tabular-nums mt-2">
            {stats.totalPendingQuotes.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Đã bóc tách quy cách Dài x Rộng x Cao
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bình luận chứa SĐT đã ẩn</span>
            <ShieldAlert className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums mt-2">
            {stats.hiddenCommentsCount.toLocaleString('vi-VN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Chống đối thủ cướp khách trên Fanpage
          </div>
        </div>
      </div>

      {/* 3 Fanpage Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {visiblePages.map((page) => {
          const pageIndex = pages.findIndex((p) => p.id === page.id) + 1;
          const Icon = getPageIcon(page.id);
          const isEditing = editingPageId === page.id;
          const pageConvs = conversations.filter((c) => c.pageId === page.id);
          const livePhones = pageConvs.filter(
            (c) =>
              c.status === 'Đã chốt SĐT' ||
              (c.specs.phoneOrZalo &&
                c.specs.phoneOrZalo !== 'Chưa có SĐT' &&
                c.specs.phoneOrZalo !== 'Chưa xác định')
          ).length;
          const livePending = pageConvs.filter(
            (c) => c.status === 'Cần báo giá'
          ).length;

          return (
            <div
              key={page.id}
              className="bg-white rounded-xl border border-slate-200 flex flex-col justify-between p-5"
            >
              <div>
                {/* Top Header with Edit Name */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-500">
                        Fanpage 0{pageIndex} ·{' '}
                        {page.webhookSubscribed !== false
                          ? 'Webhook Graph API Active'
                          : 'Đang kết nối AI'}
                      </div>
                      {isEditing ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <input
                            type="text"
                            aria-label={`Nhập tên mới cho Page ${pageIndex}`}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') savePageName(page.id);
                              if (e.key === 'Escape') setEditingPageId(null);
                            }}
                            className="w-full px-2.5 py-1 text-sm font-semibold border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            aria-label={`Lưu tên Page ${pageIndex}`}
                            onClick={() => savePageName(page.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Hủy sửa tên"
                            onClick={() => setEditingPageId(null)}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">
                          {page.name}
                        </h3>
                      )}
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEditing(page)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa tên</span>
                    </button>
                  )}
                </div>

                {/* Specialty & Product Line */}
                <div className="py-4 space-y-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {page.specialty}
                  </p>
                  <div className="text-xs text-slate-500">
                    Sản phẩm chủ lực: {page.products.join(' · ')}
                  </div>
                </div>

                {/* Page Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {(
                        page.handledMessagesCount +
                        pageConvs.reduce((s, c) => s + c.messages.length, 0)
                      ).toLocaleString('vi-VN')}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Tin đã xử lý
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-emerald-700 font-mono tabular-nums">
                      {(page.collectedPhonesCount + livePhones).toLocaleString(
                        'vi-VN'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      SĐT thu thập
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-600 font-mono tabular-nums">
                      {(page.pendingQuotesCount + livePending).toLocaleString(
                        'vi-VN'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Chờ báo giá
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {pageConvs.length} hội thoại đang trực
                </span>
                <button
                  type="button"
                  onClick={() => onOpenInboxForPage(page.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-amber-600 transition-colors"
                >
                  <span>Mở Hộp thư Page {pageIndex}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Firestore Database Orders Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>
                Đơn Hàng Đã Lưu Trên Firestore Database ({firestoreOrders.length})
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lưu trữ đám mây theo thời gian thực khi nhân viên bấm "Xuất phiếu lệnh sản xuất / Lưu đơn" tại Hộp thư AI.
            </p>
          </div>

          {!currentUser && (
            <button
              type="button"
              onClick={onStaffLogin}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập Nhân viên để đồng bộ Firestore</span>
            </button>
          )}
        </div>

        {!currentUser ? (
          <div className="p-6 text-center space-y-2 bg-slate-50/60">
            <p className="text-xs text-slate-600">
              Bạn chưa đăng nhập tài khoản Nhân viên. Hãy bấm nút <strong>Đăng nhập Nhân viên (Google)</strong> ở thanh bên trái hoặc phía trên để xem và lưu đơn hàng trực tiếp lên Cloud Firestore.
            </p>
          </div>
        ) : firestoreOrders.length === 0 ? (
          <div className="p-6 text-center space-y-2 bg-slate-50/60">
            <p className="text-xs text-slate-600">
              Tài khoản nhân viên <strong>{currentUser.email}</strong> chưa có đơn hàng nào lưu trên Firestore. Hãy mở <strong>2. Hộp Thư & Bình Luận AI</strong> và nhấn <strong>Xuất phiếu lệnh sản xuất / Lưu đơn</strong>!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Mã Lệnh SX</th>
                  <th className="py-3 px-4">Khách hàng & Fanpage</th>
                  <th className="py-3 px-4">Sản phẩm & Quy cách</th>
                  <th className="py-3 px-4">SĐT / Địa chỉ</th>
                  <th className="py-3 px-4">Nhân viên lưu</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {firestoreOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.orderCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {ord.customerName}
                      </div>
                      <div className="text-slate-500">{ord.pageName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        {ord.product}
                      </div>
                      <div className="text-slate-500 font-mono tabular-nums">
                        KT: {ord.dimensions} · SL: {ord.quantity}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-700">
                        {ord.phoneOrZalo}
                      </div>
                      <div className="text-slate-500">{ord.deliveryAddress}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{ord.staffEmail}</div>
                      <div className="text-slate-400">{ord.createdAtText}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        aria-label={`Xóa đơn hàng ${ord.orderCode}`}
                        onClick={() => onDeleteFirestoreOrder(ord.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Conversations Table across selected Fanpage(s) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Danh sách khách hàng & Đơn bóc tách gần nhất
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấp vào bất kỳ khách hàng nào để chuyển sang Hộp thư & Phiếu thông số kỹ thuật AI.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenInboxForPage(selectedPage)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Xem toàn bộ hộp thư
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Nguồn Fanpage</th>
                <th className="py-3 px-4">Sản phẩm & Quy cách</th>
                <th className="py-3 px-4">SĐT / Zalo</th>
                <th className="py-3 px-4">Trạng thái xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {(selectedPage === 'all'
                ? conversations
                : conversations.filter((c) => c.pageId === selectedPage)
              ).map((conv) => {
                const pageObj = pages.find((p) => p.id === conv.pageId);
                return (
                  <tr
                    key={conv.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{conv.customerName}</div>
                      <div className="text-slate-500 font-normal mt-0.5">
                        {conv.interactionType} · {conv.updatedAt}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {pageObj?.name || conv.pageId}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {conv.specs.product}
                      </div>
                      <div className="text-slate-500 font-mono tabular-nums">
                        KT: {conv.specs.dimensions} · SL: {conv.specs.quantity}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                      {conv.specs.phoneOrZalo}
                      {conv.commentHidden && (
                        <div className="text-emerald-700 font-sans mt-0.5">
                          Đã ẩn bình luận bảo mật SĐT
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
