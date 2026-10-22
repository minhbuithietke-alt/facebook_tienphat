import { GoogleGenAI, Type } from '@google/genai';

const webhookEventsMemory = [];

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
    fbPageId: '470417080411338',
    name: 'Tem Nhãn Gia Lai',
    specialty: 'Chuyên in ấn tem nhãn giá tốt tại Gia Lai',
    accessToken: process.env.FB_PAGE_TOKEN_3 || '',
    webhookSubscribed: true,
  },
};

const SYSTEM_PROMPT = `Bạn là Chuyên viên Tư vấn & Báo giá Kỹ thuật AI của Xưởng In & Bao Bì TIẾN PHÁT (Gia Lai).
Nhiệm vụ của bạn khi khách hàng nhắn tin:
1. Trả lời lịch sự, nhiệt tình, chuyên nghiệp, đúng trọng tâm sản phẩm khách hỏi (Túi giấy, Hộp giấy cứng/carton bồi, Thiệp cưới, Decal...).
2. Khéo léo hỏi đủ thông số kỹ thuật để báo giá: Sản phẩm, Kích thước (DxRxC), Số lượng, Chất liệu giấy & Gia công, và xin Số điện thoại / Zalo của khách để gửi báo giá chi tiết.
3. Trích xuất chính xác các thông số vào đối tượng specs.`;

function fallbackAnalyze(customerMessage, currentSpecs) {
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

  const specs = {
    product,
    dimensions: dimMatch ? dimMatch[0] : 'Chưa xác định',
    quantity: qtyMatch ? qtyMatch[0] : 'Chưa xác định',
    materialAndFinishing: 'Chưa xác định',
    designFileStatus: 'Chưa xác định',
    phoneOrZalo: foundPhone || 'Chưa có SĐT',
    deliveryAddress: 'Chưa xác định',
  };

  const hasPhone = specs.phoneOrZalo !== 'Chưa có SĐT';
  const status = hasPhone ? 'Đã chốt SĐT' : 'Đang hỏi quy cách';
  const replyMessage = hasPhone
    ? `Dạ Xưởng In Tiến Phát đã nhận được SĐT Zalo (${specs.phoneOrZalo}) của anh/chị. Kỹ thuật viên bên em đang lên báo giá chi tiết và sẽ nhắn qua Zalo ngay!`
    : `Dạ chào anh/chị! Xưởng In Tiến Phát Gia Lai xin nghe ạ. Để em tính giá gốc tại xưởng tốt nhất, anh/chị cho em xin Số lượng cần in, Kích thước và SĐT Zalo để em gửi mẫu thực tế kèm báo giá nhé!`;

  return { replyMessage, status, shouldHideComment: false, specs };
}

async function analyzeWithAI(customerMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return fallbackAnalyze(customerMessage, {});
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Khách hàng nhắn tin: "${customerMessage}"`,
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
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error('AI Error:', e);
    return fallbackAnalyze(customerMessage, {});
  }
}

export default async function handler(req, res) {
  const urlObj = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  if (req.method === 'GET' && (pathname.endsWith('/events') || urlObj.searchParams.get('action') === 'events')) {
    return res.status(200).json({
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'tienphat_secure_2026',
      connectedPages: Object.values(DEFAULT_PAGES),
      events: webhookEventsMemory.slice(0, 25),
    });
  }

  if (req.method === 'GET') {
    const mode = urlObj.searchParams.get('hub.mode');
    const token = urlObj.searchParams.get('hub.verify_token');
    const challenge = urlObj.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === (process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'tienphat_secure_2026')) {
      return res.status(200).send(String(challenge));
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    const body = req.body;
    if (!body || body.object !== 'page' || !Array.isArray(body.entry)) {
      return res.status(200).send('EVENT_RECEIVED');
    }

    for (const entry of body.entry) {
      const fbPageId = String(entry.id || '601076817027492');
      const matchedPage = Object.values(DEFAULT_PAGES).find((p) => p.fbPageId === fbPageId) || DEFAULT_PAGES.page1;
      const messagingList = Array.isArray(entry.messaging) ? entry.messaging : [];

      for (const msgEvent of messagingList) {
        if (msgEvent?.message?.is_echo || !msgEvent?.message?.text) continue;
        const text = msgEvent.message.text;
        const senderId = String(msgEvent.sender.id);

        const aiAnalysis = await analyzeWithAI(text);

        let graphApiStatus = 'Chưa có Token';
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
            graphApiStatus = fbRes.ok ? 'Đã gửi phản hồi Messenger thành công' : 'Lỗi gửi Graph API';
          } catch {
            graphApiStatus = 'Lỗi kết nối Graph API';
          }
        }

        const now = new Date(Date.now() + 7 * 3600 * 1000);
        const timeText = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

        webhookEventsMemory.unshift({
          id: `wh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          receivedAt: timeText,
          fbPageId,
          mappedSlotId: matchedPage.slotId,
          mappedPageName: matchedPage.name,
          senderId,
          senderName: `Khách (${senderId.slice(-4)})`,
          interactionType: 'Tin nhắn (Inbox)',
          incomingText: text,
          aiReply: aiAnalysis.replyMessage,
          status: aiAnalysis.status || 'Đang hỏi quy cách',
          shouldHideComment: false,
          specs: aiAnalysis.specs || {},
          graphApiStatus,
        });
      }
    }
    return res.status(200).json({ status: 'EVENT_RECEIVED' });
  }

  return res.status(200).json({ status: 'ok' });
}
