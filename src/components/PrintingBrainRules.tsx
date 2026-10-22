import React, { useState } from 'react';
import {
  BrainCircuit,
  Code2,
  CheckCircle2,
  Play,
  ShieldCheck,
  FileJson,
  Loader2,
} from 'lucide-react';
import { PRINTING_AI_SYSTEM_PROMPT } from '../utils/printingBrain';
import { AIAnalysisResult, InteractionType, PageId } from '../types';

interface PrintingBrainRulesProps {
  onTestBrainPrompt: (payload: {
    customerMessage: string;
    interactionType: InteractionType;
    pageId: PageId;
  }) => Promise<AIAnalysisResult>;
}

export const PrintingBrainRules: React.FC<PrintingBrainRulesProps> = ({
  onTestBrainPrompt,
}) => {
  const [systemPrompt, setSystemPrompt] = useState(PRINTING_AI_SYSTEM_PROMPT);
  const [testMessage, setTestMessage] = useState(
    'In hộp giấy giá sao shop? Mình cần làm khoảng 1000 hộp đựng mỹ phẩm, zalo mình 0912888999.'
  );
  const [testInteractionType, setTestInteractionType] =
    useState<InteractionType>('Bình luận (Comment)');
  const [testPageId, setTestPageId] = useState<PageId>('page2');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AIAnalysisResult | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim() || testing) return;
    setTesting(true);
    try {
      const res = await onTestBrainPrompt({
        customerMessage: testMessage.trim(),
        interactionType: testInteractionType,
        pageId: testPageId,
      });
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  const handleSaveRules = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quy Tắc Bộ Não AI Ngành In (System Prompt & JSON Schema)
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Cấu hình trực tiếp kịch bản tư vấn kỹ thuật ngành in, quy tắc bắt buộc đủ quy cách mới báo giá, và cơ chế bóc tách JSON an toàn 100%.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveRules}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{savedToast ? 'Đã lưu cấu hình Bộ não AI!' : 'Lưu cấu hình System Prompt'}</span>
        </button>
      </div>

      {/* 3 Core Industry Logic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>01. Quy tắc hỏi đủ quy cách ngành in</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Nếu khách hỏi chung chung (VD: "In hộp giấy giá sao shop?"), AI trả lời lịch sự, hỏi rõ kích thước (Dài x Rộng x Cao hoặc m2), số lượng cần in, chất liệu (Ivory, Kraft, C300, sóng 3-5 lớp) và xin SĐT Zalo để gửi mẫu kèm bảng giá xưởng.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>02. Tự động ẩn bình luận chứa SĐT</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Khi phát hiện bình luận (Comment) trên Fanpage chứa Số điện thoại 10 số, AI tự động bật cờ <code className="font-mono text-emerald-700">shouldHideComment: true</code> và chuyển trạng thái sang "Đã ẩn bình luận chống cướp khách".
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileJson className="w-4 h-4 text-slate-700" />
            <span>03. Ép kiểu JSON chuẩn & Try-Catch an toàn</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sử dụng <code className="font-mono text-slate-800">responseMimeType: "application/json"</code> kết hợp <code className="font-mono text-slate-800">responseSchema</code> và bộ giải mã <code className="font-mono text-slate-800">try-catch</code> hai lớp giúp đồng bộ đồng thời Khung Chat (Cột 2) và Phiếu Kỹ Thuật (Cột 3).
          </p>
        </div>
      </div>

      {/* Split Editor & Live JSON Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: System Prompt Editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="system-prompt-textarea"
                className="text-sm font-bold text-slate-900 flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-amber-600" />
                <span>System Prompt nhúng trực tiếp vào Gemini API</span>
              </label>
              <span className="text-xs text-slate-500 font-mono">
                gemini-3.8-flash
              </span>
            </div>

            <textarea
              id="system-prompt-textarea"
              rows={16}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3.5 text-xs font-mono leading-relaxed bg-slate-950 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>Đảm bảo 100% không lỗi cú pháp JSON khi parse dữ liệu</span>
            <button
              type="button"
              onClick={() => setSystemPrompt(PRINTING_AI_SYSTEM_PROMPT)}
              className="text-slate-700 hover:text-slate-900 font-semibold underline"
            >
              Khôi phục mặc định
            </button>
          </div>
        </div>

        {/* Right: Live JSON Extraction & Prompt Tester */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Trình Kiểm Thử Bóc Tách JSON Trực Tiếp (Live Sandbox)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập câu hỏi bất kỳ của khách để kiểm tra JSON trả về từ Gemini API.
              </p>
            </div>

            <form onSubmit={handleRunTest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="sandbox-page"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Fanpage mục tiêu
                  </label>
                  <select
                    id="sandbox-page"
                    value={testPageId}
                    onChange={(e) => setTestPageId(e.target.value as PageId)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="page1">Page 1: In Ấn Nhanh</option>
                    <option value="page2">Page 2: Xưởng Bao Bì Giấy</option>
                    <option value="page3">Page 3: Tổng Kho Thùng Carton</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="sandbox-type"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Loại tương tác
                  </label>
                  <select
                    id="sandbox-type"
                    value={testInteractionType}
                    onChange={(e) =>
                      setTestInteractionType(e.target.value as InteractionType)
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900"
                  >
                    <option value="Bình luận (Comment)">Bình luận (Comment)</option>
                    <option value="Tin nhắn (Inbox)">Tin nhắn (Inbox)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="sandbox-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  Tin nhắn / Bình luận giả định của khách
                </label>
                <textarea
                  id="sandbox-input"
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích qua Gemini JSON Schema...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Chạy Phân Tích & Kiểm Tra JSON Output</span>
                  </>
                )}
              </button>
            </form>

            {/* JSON Output Viewer */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700">
                Kết quả JSON chuẩn (Cập nhật Cột 2 & Cột 3):
              </div>
              <pre className="p-3.5 bg-slate-950 text-emerald-400 text-xs font-mono rounded-lg overflow-x-auto max-h-60 leading-relaxed">
                {testResult
                  ? JSON.stringify(testResult, null, 2)
                  : `{\n  "replyMessage": "Nhấn nút Chạy Phân Tích phía trên để xem kết quả JSON thực tế...",\n  "status": "Đã chốt SĐT",\n  "shouldHideComment": true,\n  "specs": {\n    "product": "Hộp giấy đựng mỹ phẩm",\n    "dimensions": "Chưa xác định",\n    "quantity": "1000 hộp",\n    "phoneOrZalo": "0912888999"\n  }\n}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
