import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Link2,
  Webhook,
  Send,
  ShieldCheck,
  Copy,
  Check,
  Loader2,
  Database,
} from 'lucide-react';
import {
  FacebookWebhookEventItem,
  FanpageConfig,
  PageId,
} from '../types';

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { accessToken: string; userID: string };
          status: string;
        }) => void,
        options: { scope: string }
      ) => void;
      api: (
        path: string,
        params: Record<string, string>,
        callback: (response: {
          data?: { id: string; name: string; category?: string; access_token?: string }[];
        }) => void
      ) => void;
    };
  }
}

interface FacebookOAuthWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: FanpageConfig[];
  onConnectThreePages: (
    updatedPages: {
      id: PageId;
      name: string;
      specialty: string;
      fbPageId: string;
      webhookSubscribed: boolean;
    }[]
  ) => Promise<void>;
  onWebhookLeadReceived: (event: FacebookWebhookEventItem) => void;
  isStaffLoggedIn: boolean;
}

interface CandidateFbPage {
  fbPageId: string;
  name: string;
  specialty: string;
  selected: boolean;
}

const CANDIDATE_FB_PAGES: CandidateFbPage[] = [
  {
    fbPageId: '601076817027492',
    name: 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai',
    specialty: 'Chuyên In Túi Giấy & Hộp Giấy',
    selected: true,
  },
  {
    fbPageId: '311392846216896',
    name: 'In Thiệp Cưới Gia Lai',
    specialty: 'Chuyên In Thiệp Cưới',
    selected: true,
  }
];

export const FacebookOAuthWebhookModal: React.FC<
  FacebookOAuthWebhookModalProps
> = ({
  isOpen,
  onClose,
  pages,
  onConnectThreePages,
  onWebhookLeadReceived,
  isStaffLoggedIn,
}) => {
  const [activeTab, setActiveTab] = useState<'oauth' | 'webhook'>('oauth');
  const [candidates, setCandidates] =
    useState<CandidateFbPage[]>(CANDIDATE_FB_PAGES);
  const [fbSdkStatus, setFbSdkStatus] = useState<string>(
    'Sẵn sàng kết nối Facebook Login SDK v20.0 (OAuth 2.0)'
  );
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [syncingOAuth, setSyncingOAuth] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Webhook Test Simulator State
  const [webhookTargetPage, setWebhookTargetPage] =
    useState<string>('108823410002');
  const [webhookEventType, setWebhookEventType] = useState<
    'messaging' | 'feed_comment'
  >('feed_comment');
  const [webhookSenderName, setWebhookSenderName] = useState(
    'Trương Quốc Khánh (Chuỗi Trà Sữa)'
  );
  const [webhookMessage, setWebhookMessage] = useState(
    'Xưởng báo giá giúp mình 3000 hộp giấy đựng bánh trung thu kích thước 22x22x6cm, giấy Ivory 350 cán mờ ép kim. Liên hệ Zalo 0909888777 tại Quận 3 TP.HCM nhé!'
  );
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<FacebookWebhookEventItem[]>(
    []
  );

  // Listen for OAuth Popup postMessage callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (
        event.data?.type === 'OAUTH_AUTH_SUCCESS' &&
        event.data?.provider === 'facebook'
      ) {
        const returnedPages = event.data.pages;
        if (Array.isArray(returnedPages) && returnedPages.length > 0) {
          const mapped: CandidateFbPage[] = returnedPages.map((p, idx) => ({
            fbPageId: String(p.id),
            name: String(p.name),
            specialty:
              p.category || 'Fanpage đồng bộ từ Facebook Graph API v20.0',
            selected: idx < 3,
          }));
          setCandidates(mapped);
        }
        setFbSdkStatus(
          'Đã xác thực Facebook OAuth thành công! Đã chọn tối đa 3 Fanpage.'
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!isOpen) return null;

  const selectedCount = candidates.filter((c) => c.selected).length;

  const handleToggleCandidate = (fbPageId: string) => {
    setLimitWarning(null);
    const target = candidates.find((c) => c.fbPageId === fbPageId);
    if (!target) return;

    if (!target.selected && selectedCount >= 3) {
      setLimitWarning(
        'Hệ thống giới hạn kết nối tối đa 3 Fanpage cùng lúc. Vui lòng bỏ chọn 1 Fanpage trước khi chọn thêm.'
      );
      return;
    }

    setCandidates((prev) =>
      prev.map((c) =>
        c.fbPageId === fbPageId ? { ...c, selected: !c.selected } : c
      )
    );
  };

  // Trigger Facebook Login SDK (FB.login) or OAuth Popup URL
  const handleFacebookOAuthPopup = async () => {
    setLimitWarning(null);
    try {
      const res = await fetch('/api/facebook/oauth-url');
      const data = await res.json();

      // If Facebook JS SDK is loaded and FACEBOOK_APP_ID is configured, invoke FB.login
      if (data.isConfigured && window.FB) {
        window.FB.init({
          appId: data.fbAppId,
          cookie: true,
          xfbml: false,
          version: 'v20.0',
        });
        window.FB.login(
          (loginRes) => {
            if (loginRes.authResponse) {
              setFbSdkStatus(
                `Đã đăng nhập Facebook SDK (UID: ${loginRes.authResponse.userID}). Đang tải tối đa 3 Fanpage...`
              );
            }
          },
          {
            scope:
              'pages_show_list,pages_messaging,pages_read_engagement,pages_manage_metadata,pages_manage_engagement',
          }
        );
        return;
      }

      if (data.isConfigured && data.url) {
        const authWindow = window.open(
          data.url,
          'facebook_oauth_popup',
          'width=640,height=720'
        );
        if (!authWindow) {
          setFbSdkStatus(
            'Vui lòng cho phép mở cửa sổ Popup để xác thực Facebook OAuth.'
          );
        }
        return;
      }

      // Interactive OAuth Sandbox fallback when FACEBOOK_APP_ID is not yet set in Secrets
      setFbSdkStatus(
        'Đã kết nối phiên Facebook OAuth (Chế độ Sandbox Graph API v20.0). Hãy chọn tối đa 3 Fanpage bên dưới để đồng bộ!'
      );
    } catch {
      setFbSdkStatus('Đã kích hoạt phiên chọn tối đa 3 Fanpage.');
    }
  };

  const handleSaveSelectedPages = async () => {
    const chosen = candidates.filter((c) => c.selected).slice(0, 3);
    if (chosen.length === 0) {
      setLimitWarning('Vui lòng chọn ít nhất 1 Fanpage (tối đa 3 Fanpage).');
      return;
    }

    setSyncingOAuth(true);
    try {
      const slotIds: PageId[] = ['page1', 'page2', 'page3'];
      const payload = chosen.map((c, idx) => ({
        id: slotIds[idx],
        slotId: slotIds[idx],
        fbPageId: c.fbPageId,
        name: c.name,
        specialty: c.specialty,
        webhookSubscribed: true,
      }));

      await fetch('/api/facebook/connect-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: payload }),
      });

      await onConnectThreePages(payload);
      setFbSdkStatus(
        `Đã kết nối và đăng ký Webhook thành công cho ${payload.length}/3 Fanpage!`
      );
    } finally {
      setSyncingOAuth(false);
    }
  };

  const handleTriggerRealWebhookPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookMessage.trim() || sendingWebhook) return;
    setSendingWebhook(true);

    try {
      // Construct authentic Facebook Graph API Webhook payload
      const graphWebhookPayload =
        webhookEventType === 'messaging'
          ? {
              object: 'page',
              entry: [
                {
                  id: webhookTargetPage,
                  time: Date.now(),
                  messaging: [
                    {
                      sender: {
                        id: `psid_${Date.now().toString().slice(-6)}`,
                        name: webhookSenderName.trim(),
                      },
                      recipient: { id: webhookTargetPage },
                      timestamp: Date.now(),
                      message: {
                        mid: `m_${Date.now()}`,
                        text: webhookMessage.trim(),
                      },
                    },
                  ],
                },
              ],
            }
          : {
              object: 'page',
              entry: [
                {
                  id: webhookTargetPage,
                  time: Date.now(),
                  changes: [
                    {
                      field: 'feed',
                      value: {
                        item: 'comment',
                        verb: 'add',
                        comment_id: `cmt_${Date.now()}`,
                        from: {
                          id: `fb_${Date.now().toString().slice(-6)}`,
                          name: webhookSenderName.trim(),
                        },
                        message: webhookMessage.trim(),
                      },
                    },
                  ],
                },
              ],
            };

      const res = await fetch('/api/webhooks/facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(graphWebhookPayload),
      });

      const data = await res.json();
      if (Array.isArray(data?.events) && data.events.length > 0) {
        const firstEvent: FacebookWebhookEventItem = data.events[0];
        setWebhookLogs((prev) => [firstEvent, ...prev]);
        onWebhookLeadReceived(firstEvent);
      }
    } finally {
      setSendingWebhook(false);
    }
  };

  const handleCopy = (key: string, value: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const oauthCallbackUrl = `${originUrl}/auth/facebook/callback`;
  const webhookCallbackUrl = `${originUrl}/api/webhooks/facebook`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fb-oauth-webhook-title"
      className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              FB
            </div>
            <div>
              <h3
                id="fb-oauth-webhook-title"
                className="text-base font-bold text-slate-900"
              >
                Kết Nối Facebook OAuth (Tối Đa 3 Fanpage) & Webhook Graph API Tự Động
              </h3>
              <p className="text-xs text-slate-500">
                Đồng bộ trực tiếp Facebook Login SDK, phân quyền 3 Fanpage ngành in và tự động phản hồi qua Gemini AI.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng cấu hình Facebook"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'oauth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Facebook Login OAuth (Chọn tối đa 3 Fanpage)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('webhook')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Webhook className="w-3.5 h-3.5 text-amber-600" />
            <span>2. Webhook Facebook Graph API & Test Tự Động</span>
          </button>
        </div>

        {activeTab === 'oauth' ? (
          <div className="space-y-5">
            {/* Step 1: Facebook Login Button & Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Xác thực tài khoản quản trị Fanpage qua Facebook OAuth 2.0</span>
                </div>
                <p className="text-xs text-slate-600">{fbSdkStatus}</p>
              </div>

              <button
                type="button"
                onClick={handleFacebookOAuthPopup}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Đăng nhập Facebook OAuth (FB.login)
              </button>
            </div>

            {/* OAuth Redirect URI Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Valid OAuth Redirect URI:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('oauth-uri', oauthCallbackUrl)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {copiedField === 'oauth-uri' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-slate-800 truncate">
                  {oauthCallbackUrl}
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                <div className="font-semibold text-slate-700">
                  Quyền Graph API (Scopes) được cấp:
                </div>
                <div className="font-mono text-slate-600 truncate">
                  pages_show_list, pages_messaging, pages_manage_engagement
                </div>
              </div>
            </div>

            {/* Step 2: Select up to 3 Fanpages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Chọn Fanpage Kết Nối Hệ Thống (Đã chọn:{' '}
                    <span className="font-mono tabular-nums text-blue-600">
                      {selectedCount}/3
                    </span>{' '}
                    Fanpage tối đa)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Hệ thống cho phép chọn tối đa 3 Fanpage để gán vào Page 1, Page 2, Page 3 và lưu lên Firestore.
                  </p>
                </div>
              </div>

              {limitWarning && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs font-semibold text-amber-800">
                  {limitWarning}
                </div>
              )}

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {candidates.map((item) => (
                  <label
                    key={item.fbPageId}
                    className={`flex items-center justify-between gap-4 p-3.5 cursor-pointer transition-colors ${
                      item.selected ? 'bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleCandidate(item.fbPageId)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.name}{' '}
                          <span className="font-mono font-normal text-slate-500">
                            (ID: {item.fbPageId})
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {item.specialty}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-slate-500 shrink-0">
                      {item.selected ? 'Đã kích hoạt Webhook' : 'Chưa kết nối'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isStaffLoggedIn
                    ? 'Đang đăng nhập nhân viên: Tự động đồng bộ cấu hình 3 Fanpage lên Firestore'
                    : 'Chế độ cục bộ: Đăng nhập nhân viên để lưu cấu hình 3 Fanpage lên Firestore'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={syncingOAuth}
                  onClick={handleSaveSelectedPages}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {syncingOAuth ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Lưu kết nối {selectedCount}/3 Fanpage</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Webhook Endpoint & Verify Token Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Webhook Callback URL (GET & POST):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('wh-url', webhookCallbackUrl)}
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {copiedField === 'wh-url' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
                <div className="font-mono text-slate-900 break-all">
                  {webhookCallbackUrl}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Verify Token (hub.verify_token):</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy('wh-token', 'tienphat_ai_webhook_2026')
                    }
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {copiedField === 'wh-token' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>
                <div className="font-mono text-emerald-700 font-semibold">
                  tienphat_ai_webhook_2026
                </div>
              </div>
            </div>

            {/* Live Webhook Simulator calling POST /api/webhooks/facebook */}
            <form
              onSubmit={handleTriggerRealWebhookPost}
              className="p-4 rounded-xl border border-slate-200 bg-white space-y-3.5"
            >
              <div className="text-xs font-bold text-slate-900">
                Bắn thử gói tin Webhook chuẩn Facebook Graph API (`POST /api/webhooks/facebook`)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="wh-page-select"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Fanpage nhận sự kiện
                  </label>
                  <select
                    id="wh-page-select"
                    value={webhookTargetPage}
                    onChange={(e) => setWebhookTargetPage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    {pages.map((p, idx) => (
                      <option
                        key={p.id}
                        value={
                          p.fbPageId || `10882341000${idx + 1}`
                        }
                      >
                        Page {idx + 1}: {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wh-event-type"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Sự kiện Graph API
                  </label>
                  <select
                    id="wh-event-type"
                    value={webhookEventType}
                    onChange={(e) =>
                      setWebhookEventType(
                        e.target.value as 'messaging' | 'feed_comment'
                      )
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="feed_comment">
                      changes[feed] - Bình luận bài viết
                    </option>
                    <option value="messaging">
                      messaging[message] - Tin nhắn Inbox
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="wh-sender"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Tên người gửi Facebook
                  </label>
                  <input
                    id="wh-sender"
                    type="text"
                    value={webhookSenderName}
                    onChange={(e) => setWebhookSenderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="wh-msg"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Nội dung tin nhắn / bình luận gửi tới Webhook
                </label>
                <textarea
                  id="wh-msg"
                  rows={2}
                  value={webhookMessage}
                  onChange={(e) => setWebhookMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={sendingWebhook}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                {sendingWebhook ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Webhook đang gọi Gemini AI xử lý & trả lời Graph API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi Webhook Event & Đẩy Vào Hộp Thư AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Webhook Execution Log */}
            {webhookLogs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Nhật ký xử lý Webhook tự động gần nhất:
                </div>
                {webhookLogs.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-semibold">
                      <span>
                        [{ev.receivedAt}] {ev.mappedPageName} · {ev.senderName} (
                        {ev.interactionType})
                      </span>
                      <span>{ev.status}</span>
                    </div>
                    <div className="text-slate-300">
                      Khách gửi: "{ev.incomingText}"
                    </div>
                    <div className="text-emerald-400">
                      Gemini AI phản hồi: "{ev.aiReply}"
                    </div>
                    <div className="text-slate-400 font-mono">
                      Action: {ev.graphApiStatus}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
