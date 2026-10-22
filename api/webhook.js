import { GoogleGenAI, Type } from '@google/genai';

const webhookEventsMemory = globalThis.__tienphatWebhookEvents || [];
globalThis.__tienphatWebhookEvents = webhookEventsMemory;

// Cấu hình Firestore từ firebase-applet-config.json
const FIREBASE_PROJECT_ID = 'gen-lang-client-0149504136';
const FIRESTORE_DB_ID = 'ai-studio-tinphtaihthngqun-fdd2fcbc-9e27-4031-8675-ecd0a9b3f595';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DB_ID}/documents`;

const DEFAULT_PAGES = {
  page1: {
    slotId: 'page1',
    fbPageId: '601076817027492',
    name: 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai',
    specialty: 'Chuyên Hộp giấy Ivory/Kraft/Duplex, Túi giấy thương hiệu, Carton bồi',
    accessToken: process.env.FB_PAGE_TOKEN_1 || '',
    webhookSubscribed: true,
  },
  page2: {
    slotId: 'page2',
    fbPageId: '311392846216896',
    name: 'In Thiệp Cưới Gia Lai',
    specialty: 'Chuyên Thiệp cưới hiện đại, Ép kim, Cắt Laser, In nhanh lấy ngay',
    accessToken: process.env.FB_PAGE_TOKEN_2 || '',
    webhookSubscribed: true,
  },
  page3: {
    slotId: 'page3',
    fbPageId: '108823410003',
    name: 'Tổng Kho Thùng Carton',
    specialty: 'Chuyên Thùng carton 3-5 lớp, Hộp ship COD, Bao bì đóng gói',
    accessToken: process.env.FB_PAGE_TOKEN_3 || '',
    webhookSubscribed: true,
  },
};

async function saveEventToFirestore(eventItem) {
  try {
    const res = await fetch(`${FIRESTORE_BASE_URL}/webhook_events?documentId=${eventItem.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          payload: { stringValue: JSON.stringify(eventItem) },
          createdAt: { integerValue: String(Date.now()) },
        },
      }),
    });
    if (!res.ok) {
      console.error('Firestore write status:', res.status, await res.text());
    }
  } catch (e) {
    console.error('Firestore write error:', e);
  }
}

async function loadEventsFromFirestore() {
  try {
    const res = await fetch(`${FIRESTORE_BASE_URL}/webhook_events?pageSize=25`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents) return [];
    const list = data.documents
      .map((doc) => {
        try {
          const parsed = JSON.parse(doc.fields?.payload?.stringValue || '{}');
          const ts = Number(doc.fields?.createdAt?.integerValue || 0);
          return parsed.id ? { ...parsed, _ts: ts } : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    list.sort((a, b) => b._ts - a._ts);
    return list.map(({ _ts, ...rest }) => rest);
  } catch {
    return [];
  }
}

const SYSTEM_PROMPT = `Bạn là Chuyên viên Tư vấn & Báo giá Kỹ thuật AI của Xưởng In & Bao Bì TIẾN PHÁT (Gia Lai).
Nhiệm vụ của bạn khi khách hàng nhắn tin hoặc bình luận:
1. Trả lời lịch sự, nhiệt tình, chuyên nghiệp, đúng trọng tâm sản phẩm khách hỏi (Túi giấy, Hộp giấy cứng/carton bồi, Thiệp cưới, Decal, Tem nhãn, Danh thiếp...).
2. Khéo léo hỏi đủ các thông số kỹ thuật còn thiếu để báo giá chuẩn: Sản phẩm cần in, Kích thước (Dài x Rộng x Cao), Số lượng, Chất liệu giấy & Gia công (Cán màng, ép kim...), và xin Số điện thoại / Zalo của khách để gửi bảng giá kèm mẫu thực tế.
3. Nếu khách hàng để lại Số điện thoại trên Bình luận (Comment), đặt shouldHideComment = true để bảo vệ thông tin khách khỏi đối thủ.
4. Trích xuất chính xác các thông số vào đối tượng specs.`;

function fallbackAnalyze(customerMessage, currentSpecs, interactionType) {
  const text = String(customerMessage || '');
  const phoneMatch = text.match(/(0[3|5|7|8|9])+([0-9]{8})\b/);
  const foundPhone = phoneMatch ? phoneMatch[0] : null;
  const qtyMatch = text.match(/(\d+[\.,]?\d*)\s*(cái|hộp|túi|thiệp|bộ|tờ|cuộn|thùng|tem)/i);
  const dimMatch = text.match(/\d+\s*[xX*]\s*\d+(\s*[xX*]\s*\d+)?(\s*(cm|mm))?/i);

  let product = currentSpecs?.product || 'Chưa xác định';
  if (/túi/i.test(text)) product = 'Túi giấy thương hiệu';
  else if (/hộp/i.test(text)) product = 'Hộp giấy / Hộp cứng';
  else if (/thiệp/i.test(text)) product = 'Thiệp cưới';
  else if (/tem|decal|nhãn/i.test(text)) product = 'Tem nhãn Decal';
  else if (/carton|thùng/i.test(text)) product = 'Thùng Carton';

  const specs = {
    product,
    dimensions: dimMatch ? dimMatch[0] : (currentSpecs?.dimensions || 'Chưa xác định'),
    quantity: qtyMatch ? qtyMatch[0] : (currentSpecs?.quantity || 'Chưa xác định'),
    materialAndFinishing: currentSpecs?.materialAndFinishing || 'Chưa xác định',
    designFileStatus: /file|thiết kế/i.test(text) ? 'Đang trao đổi file' : (currentSpecs?.designFileStatus || 'Chưa xác định'),
    phoneOrZalo: foundPhone || currentSpecs?.phoneOrZalo || 'Chưa có SĐT',
    deliveryAddress: currentSpecs?.deliveryAddress || 'Chưa xác định',
  };

  const hasPhone = specs.phoneOrZalo !== 'Chưa có SĐT';
  const status = hasPhone ? 'Đã chốt SĐT' : (specs.quantity !== 'Chưa xác định' ? 'Cần báo giá' : 'Đang hỏi quy cách');
  const shouldHideComment = interactionType === 'Bình luận (Comment)' && Boolean(foundPhone);

  const replyMessage = hasPhone
    ? `Dạ Xưởng In Tiến Phát đã nhận được SĐT Zalo (${specs.phoneOrZalo}) của anh/chị. Kỹ thuật viên bên em đang lên bảng báo giá chi tiết cho ${specs.product !== 'Chưa xác định' ? specs.product : 'đơn hàng'} và sẽ nhắn qua Zalo cho mình ngay trong ít phút ạ!`
    : `Dạ chào anh/chị! Xưởng In Tiến Phát Gia Lai xin nghe ạ. Để bên em tính giá gốc tại xưởng tốt nhất cho ${specs.product !== 'Chưa xác định' ? specs.product : 'mình'}, anh/chị cho em xin Số lượng cần in, Kích thước và SĐT Zalo để em gửi mẫu thực tế kèm báo giá chi tiết nhé!`;

  return { replyMessage, status, shouldHideComment, specs };
}

async function analyzeWithAI(params) {
  const { customerMessage, conversationHistory, currentSpecs, interactionType, pageId, pageName } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      result: fallbackAnalyze(customerMessage, currentSpecs, interactionType),
      source: 'fallback-engine',
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const historyText = Array.isArray(conversationHistory)
      ? conversationHistory.map((m) => `${m.sender === 'customer' ? 'Khách hàng' : 'Tiến Phát AI'}: ${m.content}`).join('\n')
      : '';

    const prompt = `Fanpage đang trực: ${pageName} (Mã: ${pageId})
Loại tương tác: ${interactionType}
Thông số kỹ thuật đã biết: ${JSON.stringify(currentSpecs)}
Lịch sử trò chuyện:
${historyText}
Tin nhắn mới nhất của khách hàng: "${customerMessage}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyMessage: { type: Type.STRING },
            status: { type: Type.STRING },
            shouldHideComment: { type: Type.BOOLEAN },
            specs: {
              type: Type.OBJECT,
              properties: {
                product: { type: Type.STRING },
                dimensions: { type: Type.STRING },
                quantity: { type: Type.STRING },
                materialAndFinishing: { type: Type.STRING },
                designFileStatus: { type: Type.STRING },
                phoneOrZalo: { type: Type.STRING },
                deliveryAddress: { type: Type.STRING },
              },
              required: ['product', 'dimensions', 'quantity', 'materialAndFinishing', 'designFileStatus', 'phoneOrZalo', 'deliveryAddress'],
            },
          },
          required: ['replyMessage', 'status', 'shouldHideComment', 'specs'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const fb = fallbackAnalyze(customerMessage, currentSpecs, interactionType);
    return {
      result: {
        replyMessage: parsed.replyMessage || fb.replyMessage,
        status: parsed.status || fb.status,
        shouldHideComment: Boolean(parsed.shouldHideComment),
        specs: parsed.specs || fb.specs,
      },
      source: 'gemini-2.5-flash',
    };
  } catch (err) {
    console.error('Gemini error, fallback used:', err);
    return {
      result: fallbackAnalyze(customerMessage, currentSpecs, interactionType),
      source: 'fallback-recovery',
    };
  }
}

export default async function handler(req, res) {
  const urlObj = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 1. Trả danh sách sự kiện Webhook về cho giao diện Web
  if (req.method === 'GET' && (pathname.endsWith('/events') || urlObj.searchParams.get('action') === 'events')) {
    const firestoreEvents = await loadEventsFromFirestore();
    const combined = [...webhookEventsMemory, ...firestoreEvents];
    const uniqueEvents = Array.from(new Map(combined.map((item) => [item.id, item])).values()).slice(0, 25);

    return res.status(200).json({
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'tienphat_ai_webhook_2026',
      connectedPages: Object.values(DEFAULT_PAGES),
      events: uniqueEvents,
    });
  }

  // 2. Xử lý khi giao diện Web bấm nút phân tích tin nhắn AI
  if (req.method === 'POST' && pathname.includes('/ai/analyze-message')) {
    const {
      customerMessage = '',
      conversationHistory = [],
      currentSpecs = {},
      interactionType = 'Tin nhắn (Inbox)',
      pageId = 'page1',
      pageName = 'Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai',
    } = req.body || {};

    const output = await analyzeWithAI({
      customerMessage: String(customerMessage),
      conversationHistory,
      currentSpecs,
      interactionType,
      pageId,
      pageName: String(pageName),
    });
    return res.status(200).json(output);
  }

  // 3. Xác thực GET Webhook với Meta
  if (req.method === 'GET') {
    const mode = urlObj.searchParams.get('hub.mode') || req.query?.['hub.mode'] || req.query?.hub?.mode;
    const token = urlObj.searchParams.get('hub.verify_token') || req.query?.['hub.verify_token'] || req.query?.hub?.verify_token;
    const challenge = urlObj.searchParams.get('hub.challenge') || req.query?.['hub.challenge'] || req.query?.hub?.challenge;

    const isValidToken =
      token === 'tienphat_ai_webhook_2026' ||
      (process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN);

    if (mode === 'subscribe' && isValidToken) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(String(challenge));
    }
    return res.status(403).send('Forbidden');
  }

  // 4. Nhận tin nhắn & bình luận POST thực tế từ Facebook
  if (req.method === 'POST') {
    const body = req.body;
    // In chi tiết toàn bộ JSON không bị rút gọn [...]
    console.log('FULL WEBHOOK BODY:', JSON.stringify(body));

    if (!body || body.object !== 'page' || !Array.isArray(body.entry)) {
      return res.status(200).send('EVENT_RECEIVED');
    }

    const processedEvents = [];

    for (const entry of body.entry) {
      const fbPageId = String(entry.id || '601076817027492');
      const matchedPage =
        Object.values(DEFAULT_PAGES).find((p) => p.fbPageId === fbPageId) || DEFAULT_PAGES.page1;

      // Bắt cả entry.messaging (chính) và entry.standby (khi bật Meta Business Suite)
      const messagingList = [
        ...(Array.isArray(entry.messaging) ? entry.messaging : []),
        ...(Array.isArray(entry.standby) ? entry.standby : []),
      ];

      for (const msgEvent of messagingList) {
        if (msgEvent?.message?.is_echo) continue;
        const text = msgEvent?.message?.text;
        if (!text) continue;

        const senderId = String(msgEvent?.sender?.id || 'psid_user');
        const senderName = `Khách Messenger (${senderId.slice(-4)})`;

        const { result: aiAnalysis } = await analyzeWithAI({
          customerMessage: String(text),
          conversationHistory: [{ sender: 'customer', content: String(text) }],
          currentSpecs: {},
          interactionType: 'Tin nhắn (Inbox)',
          pageId: matchedPage.slotId,
          pageName: matchedPage.name,
        });

        let graphApiStatus = 'Đã phân tích AI (Cần thêm FB_PAGE_TOKEN trên Vercel để tự gửi)';
        if (matchedPage.accessToken) {
          try {
            const fbRes = await fetch(
              `https://graph.facebook.com/v20.0/me/messages?access_token=${encodeURIComponent(matchedPage.accessToken)}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  recipient: { id: senderId },
                  message: { text: aiAnalysis.replyMessage },
                }),
              }
            );
            const fbResText = await fbRes.text();
            console.log('Graph API send response:', fbRes.status, fbResText);
            graphApiStatus = fbRes.ok
              ? 'Đã phản hồi tự động qua Graph API /me/messages'
              : `Lỗi Graph API: ${fbResText}`;
          } catch (e) {
            graphApiStatus = 'Lỗi kết nối Graph API';
          }
        }

        const now = new Date(Date.now() + 7 * 3600 * 1000);
        const timeText = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

        const eventRecord = {
          id: `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          receivedAt: timeText,
          fbPageId,
          mappedSlotId: matchedPage.slotId,
          mappedPageName: matchedPage.name,
          senderId,
          senderName,
          interactionType: 'Tin nhắn (Inbox)',
          incomingText: String(text),
          aiReply: aiAnalysis.replyMessage,
          status: aiAnalysis.status,
          shouldHideComment: aiAnalysis.shouldHideComment,
          specs: aiAnalysis.specs,
          graphApiStatus,
        };

        webhookEventsMemory.unshift(eventRecord);
        await saveEventToFirestore(eventRecord);
        processedEvents.push(eventRecord);
      }

      // Bắt thêm sự kiện bình luận bài viết (entry.changes)
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          const val = change?.value;
          const text = val?.message || val?.text;
          if (!text || val?.from?.id === fbPageId) continue;

          const senderId = String(val?.from?.id || 'fb_user');
          const senderName = String(val?.from?.name || `Khách Comment (${senderId.slice(-4)})`);

          const { result: aiAnalysis } = await analyzeWithAI({
            customerMessage: String(text),
            conversationHistory: [{ sender: 'customer', content: String(text) }],
            currentSpecs: {},
            interactionType: 'Bình luận (Comment)',
            pageId: matchedPage.slotId,
            pageName: matchedPage.name,
          });

          const now = new Date(Date.now() + 7 * 3600 * 1000);
          const timeText = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

          const eventRecord = {
            id: `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            receivedAt: timeText,
            fbPageId,
            mappedSlotId: matchedPage.slotId,
            mappedPageName: matchedPage.name,
            senderId,
            senderName,
            interactionType: 'Bình luận (Comment)',
            incomingText: String(text),
            aiReply: aiAnalysis.replyMessage,
            status: aiAnalysis.status,
            shouldHideComment: aiAnalysis.shouldHideComment,
            specs: aiAnalysis.specs,
            graphApiStatus: 'Đã phân tích Comment AI',
          };

          webhookEventsMemory.unshift(eventRecord);
          await saveEventToFirestore(eventRecord);
          processedEvents.push(eventRecord);
        }
      }
    }

    return res.status(200).json({
      status: 'EVENT_RECEIVED',
      processedCount: processedEvents.length,
      events: processedEvents,
    });
  }

  return res.status(200).json({ status: 'ok' });
}
