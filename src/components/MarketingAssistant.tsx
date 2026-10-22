import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Send,
  CalendarClock,
  Loader2,
  FileText,
  MessageCircleHeart,
} from 'lucide-react';
import { FanpageConfig, MarketingPostItem, PageId } from '../types';
import { INITIAL_MARKETING_POSTS } from '../data/initialData';

interface MarketingAssistantProps {
  pages: FanpageConfig[];
  selectedPage: PageId | 'all';
}

export const MarketingAssistant: React.FC<MarketingAssistantProps> = ({
  pages,
  selectedPage,
}) => {
  const [posts, setPosts] = useState<MarketingPostItem[]>(INITIAL_MARKETING_POSTS);
  const [targetPageId, setTargetPageId] = useState<PageId>(
    selectedPage === 'all' ? 'page2' : selectedPage
  );
  const [productFocus, setProductFocus] = useState(
    'Hộp giấy Ivory 350gsm cán màng mờ, ép kim logo nổi'
  );
  const [campaignGoal, setCampaignGoal] = useState(
    'Thu hút chủ shop mỹ phẩm & thực phẩm đặt in bao bì giá gốc tại xưởng'
  );
  const [tone, setTone] = useState('Chuyên nghiệp, cam kết tiến độ & giá sỉ tận xưởng');
  const [scheduledTime, setScheduledTime] = useState('20:00 - Tối nay');
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const followUpTemplates = [
    {
      id: 'care-1',
      stage: 'Kịch bản 1: Nhắc khách gửi kích thước & số lượng (Sau 15 phút)',
      content:
        'Dạ anh/chị ơi, xưởng In & Bao Bì Tiến Phát vẫn đang giữ lịch báo giá ưu đãi cho mình ạ. Anh/chị đã đo được kích thước Dài x Rộng x Cao (hoặc số lượng dự kiến in) chưa để kỹ thuật bên em tính giá gốc tại xưởng tốt nhất cho mình nhé!',
    },
    {
      id: 'care-2',
      stage: 'Kịch bản 2: Gửi mẫu thực tế & thúc đẩy chốt đơn qua Zalo',
      content:
        'Dạ Tiến Phát đã gửi bảng báo giá chi tiết kèm video quay mẫu giấy Ivory/Kraft và thùng Carton thực tế qua Zalo của mình rồi ạ. Đơn đặt in trong tuần này bên xưởng đang hỗ trợ miễn phí 100% phí thiết kế và giao hàng tận nơi, anh/chị xem qua để xưởng lên khuôn in sớm nhé!',
    },
    {
      id: 'care-3',
      stage: 'Kịch bản 3: Chăm sóc khách cũ đặt in lại (Re-order)',
      content:
        'Dạ chào anh/chị! Đợt hộp giấy / thùng carton lần trước bên xưởng Tiến Phát giao mình dùng có ưng ý không ạ? Khuôn bế và bình bản in của bên mình xưởng vẫn đang lưu trữ miễn phí, đợt này nếu anh/chị in thêm sẽ được giảm trực tiếp chi phí khuôn ban đầu nhé ạ!',
    },
  ];

  const handleGeneratePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFocus.trim() || generating) return;
    setGenerating(true);

    const pageObj = pages.find((p) => p.id === targetPageId) || pages[0];

    try {
      const response = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageName: pageObj.name,
          specialty: pageObj.specialty,
          productFocus: productFocus.trim(),
          campaignGoal: campaignGoal.trim(),
          tone,
        }),
      });
      const data = await response.json();
      const generated = data?.post;

      const newPost: MarketingPostItem = {
        id: `post-${Date.now()}`,
        pageId: targetPageId,
        topic: campaignGoal.trim(),
        productFocus: productFocus.trim(),
        tone,
        headline:
          generated?.headline ||
          `[XƯỞNG IN TIẾN PHÁT] Báo Giá ${productFocus} Giá Gốc Tận Xưởng`,
        content:
          generated?.content ||
          `Xưởng sản xuất trực tiếp ${productFocus} chất lượng cao, cam kết đúng định lượng giấy và tiến độ giao hàng.`,
        cta:
          generated?.cta ||
          'Để lại SĐT Zalo hoặc Kích thước + Số lượng để nhận báo giá ngay!',
        hashtags: Array.isArray(generated?.hashtags)
          ? generated.hashtags
          : ['#InAnTienPhat', '#BaoBiGiay', '#ThungCarton'],
        createdAt: 'Vừa tạo bằng Gemini AI',
        status: 'Lên lịch đăng',
        scheduledTime,
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch {
      const fallbackPost: MarketingPostItem = {
        id: `post-${Date.now()}`,
        pageId: targetPageId,
        topic: campaignGoal.trim(),
        productFocus: productFocus.trim(),
        tone,
        headline: `[${pageObj.name.toUpperCase()}] Sản Xuất ${productFocus} Giá Sỉ Tận Xưởng`,
        content: `Xưởng In & Bao Bì Tiến Phát nhận in nhanh và sản xuất trực tiếp ${productFocus}. Cam kết chuẩn màu thương hiệu, giấy đúng định lượng, hỗ trợ thiết kế miễn phí 100%.`,
        cta: 'Comment ngay [Kích thước + Số lượng] hoặc SĐT Zalo để nhận bảng giá ưu đãi!',
        hashtags: ['#TienPhatAI', '#InAnBaoBi', '#GiaGocTaiXuong'],
        createdAt: 'Vừa tạo xong',
        status: 'Lên lịch đăng',
        scheduledTime,
      };
      setPosts((prev) => [fallbackPost, ...prev]);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishNow = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, status: 'Đã đăng tự động', createdAt: 'Vừa đăng lên Fanpage' }
          : p
      )
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Trợ Lý Viết Bài & Chăm Sóc Khách Hàng Tự Động (AI Content & Care)
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Sử dụng Gemini AI tự động sáng tạo bài đăng bán hàng chuẩn ngành In Ấn - Bao Bì cho 3 Fanpage và kịch bản đeo bám khách chờ báo giá.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: AI Post Generator Form & Care Scripts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Soạn Bài Đăng Bán Hàng Fanpage Bằng Gemini AI
              </h3>
            </div>

            <form onSubmit={handleGeneratePost} className="space-y-3.5">
              <div>
                <label
                  htmlFor="mkt-page"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Chọn Fanpage đăng bài
                </label>
                <select
                  id="mkt-page"
                  value={targetPageId}
                  onChange={(e) => setTargetPageId(e.target.value as PageId)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-900"
                >
                  {pages.map((p, idx) => (
                    <option key={p.id} value={p.id}>
                      Page {idx + 1}: {p.name} ({p.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="mkt-product"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Sản phẩm in ấn / bao bì trọng tâm
                </label>
                <input
                  id="mkt-product"
                  type="text"
                  required
                  value={productFocus}
                  onChange={(e) => setProductFocus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="mkt-goal"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Mục tiêu chiến dịch / Ưu đãi kèm theo
                </label>
                <textarea
                  id="mkt-goal"
                  rows={2}
                  required
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="mkt-tone"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Phong cách nội dung
                  </label>
                  <select
                    id="mkt-tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="Chuyên nghiệp, cam kết tiến độ & giá sỉ tận xưởng">
                      Chuyên nghiệp - Giá xưởng
                    </option>
                    <option value="Thúc đẩy chốt sale nhanh, ưu đãi miễn phí thiết kế">
                      Chốt sale - Tặng thiết kế
                    </option>
                    <option value="Chia sẻ kiến thức chọn định lượng giấy & quy cách in">
                      Chuyên gia tư vấn kỹ thuật
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mkt-schedule"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Khung giờ đăng tự động
                  </label>
                  <input
                    id="mkt-schedule"
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Gemini AI đang viết bài chuẩn SEO ngành in...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Tạo Bài Viết Bán Hàng Bằng Gemini AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Automated Customer Care Follow-up Scripts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <MessageCircleHeart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Kịch Bản Chăm Sóc & Nhắc Khách Chốt Đơn Tự Động
              </h3>
            </div>
            <div className="space-y-3">
              {followUpTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {tpl.stage}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(tpl.id, tpl.content)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 shrink-0"
                    >
                      {copiedId === tpl.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tpl.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Generated Posts Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Danh sách bài viết Fanpage đã tạo ({posts.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {posts.map((post) => {
              const pageObj = pages.find((p) => p.id === post.pageId);
              const fullPostText = `${post.headline}\n\n${post.content}\n\n👉 ${post.cta}\n\n${post.hashtags.join(' ')}`;
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {pageObj?.name || post.pageId}
                      </span>
                      <span>·</span>
                      <span>{post.createdAt}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                        {post.scheduledTime}
                      </span>
                    </div>
                    <span
                      className={`font-semibold ${
                        post.status === 'Đã đăng tự động'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {post.headline}
                  </h4>

                  <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {post.content}
                  </p>

                  <div className="p-3 bg-amber-50/70 rounded-lg text-xs font-semibold text-slate-900">
                    Kêu gọi hành động (CTA): {post.cta}
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    {post.hashtags.join('  ')}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyText(post.id, fullPostText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {copiedId === post.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã sao chép bài viết</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép nội dung</span>
                        </>
                      )}
                    </button>

                    {post.status !== 'Đã đăng tự động' && (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(post.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đăng ngay lên {pageObj?.name}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
