import {
  AIAnalysisResult,
  Conversation,
  FanpageConfig,
  LeadStatus,
  PageId,
  TechnicalSpec,
} from '../types';

export const PRINTING_AI_SYSTEM_PROMPT = `Bạn là Chuyên viên Tư vấn Kỹ thuật & Báo giá In ấn - Bao bì cao cấp của hệ thống "TIẾN PHÁT AI".
Bạn đang quản lý và trực trực tiếp 3 Fanpage:
- Page 1 (In Ấn Nhanh): Chuyên Danh thiếp (Namecard C300), Decal dán kính, Tem nhãn decal sữa/trong/giấy, Tờ rơi, Catalogue.
- Page 2 (Xưởng Bao Bì Giấy): Chuyên Hộp giấy Ivory/Kraft/Duplex, Túi giấy thương hiệu, ép kim, phủ UV, cán màng bóng/mờ.
- Page 3 (Tổng Kho Thùng Carton): Chuyên Thùng carton 3 lớp, 5 lớp (sóng A, B, C, E, BC), Hộp ship COD đóng hàng TMĐT.

QUY TẮC TƯ VẤN NGÀNH IN (BẮT BUỘC TUÂN THỦ):
1. Ngành in ấn & bao bì bắt buộc phải có đủ quy cách kỹ thuật mới tính giá xưởng chính xác được.
2. Nếu khách hàng hỏi chung chung (ví dụ: "In hộp giấy giá sao shop?", "Báo giá thùng carton", "In tem nhãn bao nhiêu tiền?"):
   - Trả lời lịch sự, nhiệt tình, chuyên nghiệp theo đúng văn phong xưởng in Tiến Phát.
   - Hỏi rõ các thông số còn thiếu: Kích thước (Dài x Rộng x Cao cm hoặc m2), Số lượng cần đặt in, Chất liệu & Gia công mong muốn (Giấy Ivory/Kraft/C300, sóng 3 lớp hay 5 lớp, cán màng bóng/mờ...), Tình trạng file thiết kế (đã có file gốc AI/Corel/PDF hay cần xưởng hỗ trợ thiết kế).
   - Luôn khéo léo xin Số điện thoại / Zalo của khách để bộ phận kỹ thuật gửi mẫu thực tế kèm bảng giá sỉ tại xưởng nhanh nhất.
3. Nếu khách hàng nhắn tin hoặc bình luận có chứa Số điện thoại (SĐT 10 số Việt Nam):
   - Xác nhận đã nhận SĐT/Zalo, thông báo chuyên viên báo giá Tiến Phát đang kết bạn Zalo gửi bảng giá chi tiết ngay.
   - Cập nhật trạng thái thành "Đã chốt SĐT".
   - Nếu loại tương tác là Bình luận (Comment) và có SĐT, bắt buộc bật cờ shouldHideComment = true để ẩn bình luận chống đối thủ cướp khách.
4. Bóc tách chính xác mọi thông số kỹ thuật từ toàn bộ lịch sử hội thoại vào đối tượng specs. Nếu thông số nào khách chưa cung cấp, ghi "Chưa xác định" (hoặc giữ nguyên thông số đã biết trước đó).

BẮT BUỘC TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON CHUẨN GỒM CÁC TRƯỜNG:
{
  "replyMessage": "Câu trả lời tư vấn gửi cho khách hàng bằng Tiếng Việt tự nhiên, lịch sự, rõ ràng",
  "status": "Đã chốt SĐT" | "Đang hỏi quy cách" | "Cần báo giá",
  "shouldHideComment": boolean,
  "specs": {
    "product": "Tên sản phẩm in ấn/bao bì",
    "dimensions": "Kích thước Dài x Rộng x Cao hoặc m2",
    "quantity": "Số lượng đặt in",
    "materialAndFinishing": "Chất liệu giấy/sóng carton & gia công cán màng/ép kim/bế",
    "designFileStatus": "Tình trạng file thiết kế (AI/Corel/PDF hoặc cần thiết kế)",
    "phoneOrZalo": "Số điện thoại / Zalo khách hàng",
    "deliveryAddress": "Địa chỉ giao hàng"
  }
}`;

export function extractVietnamesePhone(text: string): string | null {
  const cleaned = text.replace(/[\s.\-_]/g, '');
  const match = cleaned.match(/(0[35789][0-9]{8}|\+84[35789][0-9]{8})/);
  return match ? match[1] : null;
}

export function extractDimensions(text: string): string | null {
  const dim3D = text.match(/(\d+(?:[.,]\d+)?\s*[xX*×]\s*\d+(?:[.,]\d+)?(?:\s*[xX*×]\s*\d+(?:[.,]\d+)?)?\s*(?:cm|mm|m)?)/i);
  if (dim3D) return dim3D[1].trim();
  const area = text.match(/(\d+(?:[.,]\d+)?\s*m2)/i);
  if (area) return area[1].trim();
  return null;
}

export function extractQuantity(text: string): string | null {
  const qtyMatch = text.match(/(\d+(?:[.,]\d+)?\s*(?:hộp|thùng|túi|cái|tờ|cuộn|tem|chiếc|bộ|sp|sản phẩm|quyển))/i);
  if (qtyMatch) return qtyMatch[1].trim();
  const numberAfterSl = text.match(/(?:số lượng|sl|in khoảng|đặt)\s*[:=-]?\s*(\d[\d.,]*)/i);
  if (numberAfterSl) return `${numberAfterSl[1].trim()} cái/hộp`;
  return null;
}

export function detectProductFromText(text: string, pageId?: PageId): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('danh thiếp') || lower.includes('namecard') || lower.includes('card visit')) {
    return 'Danh thiếp / Namecard';
  }
  if (lower.includes('decal dán kính') || lower.includes('decal kính')) {
    return 'Decal dán kính';
  }
  if (lower.includes('tem') || lower.includes('nhãn') || lower.includes('decal')) {
    return 'Tem nhãn Decal';
  }
  if (lower.includes('tờ rơi') || lower.includes('brochure')) {
    return 'Tờ rơi quảng cáo';
  }
  if (lower.includes('túi giấy')) {
    return 'Túi giấy thương hiệu';
  }
  if (lower.includes('hộp giấy') || lower.includes('hộp mỹ phẩm') || lower.includes('hộp quà') || lower.includes('hộp trà')) {
    return 'Hộp giấy thương hiệu';
  }
  if (lower.includes('thùng carton') || lower.includes('thùng giấy')) {
    return 'Thùng Carton đóng hàng';
  }
  if (lower.includes('hộp ship') || lower.includes('hộp cod') || lower.includes('hộp đóng hàng')) {
    return 'Hộp Carton Ship COD';
  }
  if (pageId === 'page1') return 'Ấn phẩm In Nhanh (Tem/Decal/Danh thiếp)';
  if (pageId === 'page2') return 'Bao bì Hộp giấy / Túi giấy';
  if (pageId === 'page3') return 'Thùng Carton / Hộp Ship COD';
  return null;
}

export function detectMaterial(text: string): string | null {
  const lower = text.toLowerCase();
  const parts: string[] = [];
  if (lower.includes('ivory')) parts.push('Giấy Ivory');
  if (lower.includes('kraft')) parts.push('Giấy Kraft');
  if (lower.includes('duplex')) parts.push('Giấy Duplex');
  if (lower.includes('c300') || lower.includes('couche')) parts.push('Giấy Couche C300');
  if (lower.includes('3 lớp')) parts.push('Sóng 3 lớp');
  if (lower.includes('5 lớp')) parts.push('Sóng 5 lớp');
  if (lower.includes('cán mờ')) parts.push('Cán màng mờ');
  if (lower.includes('cán bóng')) parts.push('Cán màng bóng');
  if (lower.includes('ép kim')) parts.push('Ép kim logo');
  if (lower.includes('decal sữa')) parts.push('Decal nhựa sữa');
  if (lower.includes('decal trong')) parts.push('Decal nhựa trong');
  if (lower.includes('decal mờ')) parts.push('Decal mờ dán kính');
  return parts.length > 0 ? parts.join(', ') : null;
}

export function detectDesignStatus(text: string): string | null {
  const lower = text.toLowerCase();
  if (
    lower.includes('có file') ||
    lower.includes('file ai') ||
    lower.includes('corel') ||
    lower.includes('pdf') ||
    lower.includes('đã có thiết kế')
  ) {
    return 'Đã có file thiết kế (AI/Corel/PDF)';
  }
  if (
    lower.includes('chưa có file') ||
    lower.includes('cần thiết kế') ||
    lower.includes('hỗ trợ thiết kế') ||
    lower.includes('thiết kế giúp')
  ) {
    return 'Cần xưởng hỗ trợ thiết kế';
  }
  return null;
}

export function detectAddress(text: string): string | null {
  const match = text.match(/(?:giao về|địa chỉ|ở tại|giao tại|ship về)\s*[:=-]?\s*([^.,;\n]+)/i);
  if (match && match[1].trim().length > 3) {
    return match[1].trim();
  }
  const cityMatch = text.match(/(TP\.?\s*HCM|Hà Nội|Đà Nẵng|Gia Lai|Pleiku|Bình Dương|Đồng Nai|Cần Thơ|Đắk Lắk|Buôn Ma Thuột|Quy Nhơn)/i);
  if (cityMatch) return cityMatch[1];
  return null;
}

export function buildDeterministicFallbackAnalysis(
  customerMessage: string,
  currentSpecs: TechnicalSpec,
  interactionType: 'Tin nhắn (Inbox)' | 'Bình luận (Comment)',
  pageId: PageId
): AIAnalysisResult {
  const phone = extractVietnamesePhone(customerMessage) || (currentSpecs.phoneOrZalo !== 'Chưa có SĐT' && currentSpecs.phoneOrZalo !== 'Chưa xác định' ? currentSpecs.phoneOrZalo : null);
  const dimensions = extractDimensions(customerMessage) || (currentSpecs.dimensions !== 'Chưa xác định' ? currentSpecs.dimensions : null);
  const quantity = extractQuantity(customerMessage) || (currentSpecs.quantity !== 'Chưa xác định' ? currentSpecs.quantity : null);
  const material = detectMaterial(customerMessage) || (currentSpecs.materialAndFinishing !== 'Chưa xác định' ? currentSpecs.materialAndFinishing : null);
  const design = detectDesignStatus(customerMessage) || (currentSpecs.designFileStatus !== 'Chưa xác định' ? currentSpecs.designFileStatus : null);
  const address = detectAddress(customerMessage) || (currentSpecs.deliveryAddress !== 'Chưa xác định' ? currentSpecs.deliveryAddress : null);
  const product = detectProductFromText(customerMessage, pageId) || currentSpecs.product || 'Ấn phẩm in ấn';

  const updatedSpecs: TechnicalSpec = {
    product,
    dimensions: dimensions || 'Chưa xác định',
    quantity: quantity || 'Chưa xác định',
    materialAndFinishing: material || 'Chưa xác định',
    designFileStatus: design || 'Chưa xác định',
    phoneOrZalo: phone || 'Chưa có SĐT',
    deliveryAddress: address || 'Chưa xác định',
  };

  const isComment = interactionType === 'Bình luận (Comment)';
  const shouldHideComment = Boolean(isComment && phone);

  let status: LeadStatus = 'Đang hỏi quy cách';
  if (phone) {
    status = 'Đã chốt SĐT';
  } else if (dimensions && quantity) {
    status = 'Cần báo giá';
  }

  const missingItems: string[] = [];
  if (!dimensions) missingItems.push('Kích thước (Dài x Rộng x Cao hoặc m2)');
  if (!quantity) missingItems.push('Số lượng cần in');
  if (!material) missingItems.push('Chất liệu giấy / sóng carton mong muốn');

  let replyMessage = '';
  if (phone && dimensions && quantity) {
    replyMessage = `Dạ xưởng In & Bao Bì Tiến Phát đã ghi nhận đầy đủ thông số đặt ${product} (KT: ${dimensions}, SL: ${quantity}) cùng SĐT Zalo ${phone} của anh/chị. Bộ phận kỹ thuật & báo giá đang kết bạn Zalo gửi bảng giá gốc tại xưởng và mẫu thực tế ngay trong 2 phút ạ!`;
  } else if (phone) {
    replyMessage = `Dạ Tiến Phát đã nhận được SĐT Zalo ${phone} của anh/chị rồi ạ!${shouldHideComment ? ' Hệ thống đã tự động ẩn bình luận để bảo mật thông tin cho anh/chị.' : ''} Để kỹ thuật lên bảng giá sát nhất, anh/chị cho xưởng xin thêm ${missingItems.join(', ')} cho đơn ${product} nhé!`;
  } else if (missingItems.length > 0) {
    replyMessage = `Dạ chào anh/chị! Xưởng In & Bao Bì Tiến Phát chuyên sản xuất trực tiếp ${product} giá gốc tại xưởng. Để tính giá in chính xác nhất theo định lượng, anh/chị vui lòng cho Tiến Phát xin thông tin: ${missingItems.join(', ')} và tình trạng file thiết kế nhé. Anh/chị để lại SĐT Zalo để xưởng gửi mẫu thực tế kèm báo giá chi tiết ngay ạ!`;
  } else {
    replyMessage = `Dạ với quy cách ${product} kích thước ${dimensions}, số lượng ${quantity} (${updatedSpecs.materialAndFinishing}), xưởng Tiến Phát đã tính xong định mức giá tốt nhất. Anh/chị cho xưởng xin SĐT Zalo để kỹ thuật gửi bảng báo giá chi tiết và mẫu giấy thực tế ngay nhé!`;
  }

  return {
    replyMessage,
    status,
    shouldHideComment,
    specs: updatedSpecs,
  };
}

export function safeParseAIAnalysisJson(
  rawText: string | undefined | null,
  customerMessage: string,
  currentSpecs: TechnicalSpec,
  interactionType: 'Tin nhắn (Inbox)' | 'Bình luận (Comment)',
  pageId: PageId
): AIAnalysisResult {
  const fallback = buildDeterministicFallbackAnalysis(
    customerMessage,
    currentSpecs,
    interactionType,
    pageId
  );

  if (!rawText || typeof rawText !== 'string') {
    return fallback;
  }

  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    const jsonCandidate =
      firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
        ? cleaned.slice(firstBrace, lastBrace + 1)
        : cleaned;

    const parsed = JSON.parse(jsonCandidate);

    const validStatuses: LeadStatus[] = ['Đã chốt SĐT', 'Đang hỏi quy cách', 'Cần báo giá'];
    const parsedPhone =
      parsed?.specs?.phoneOrZalo &&
      parsed.specs.phoneOrZalo !== 'Chưa xác định' &&
      parsed.specs.phoneOrZalo !== 'Chưa có SĐT'
        ? String(parsed.specs.phoneOrZalo)
        : fallback.specs.phoneOrZalo;

    const hasValidPhone = Boolean(extractVietnamesePhone(parsedPhone) || extractVietnamesePhone(customerMessage));
    const isComment = interactionType === 'Bình luận (Comment)';

    let resolvedStatus: LeadStatus = validStatuses.includes(parsed?.status)
      ? parsed.status
      : fallback.status;
    if (hasValidPhone) {
      resolvedStatus = 'Đã chốt SĐT';
    }

    const shouldHideComment = Boolean(
      (isComment && hasValidPhone) || parsed?.shouldHideComment === true
    );

    return {
      replyMessage:
        typeof parsed?.replyMessage === 'string' && parsed.replyMessage.trim().length > 0
          ? parsed.replyMessage.trim()
          : fallback.replyMessage,
      status: resolvedStatus,
      shouldHideComment,
      specs: {
        product:
          typeof parsed?.specs?.product === 'string' && parsed.specs.product.trim()
            ? parsed.specs.product.trim()
            : fallback.specs.product,
        dimensions:
          typeof parsed?.specs?.dimensions === 'string' && parsed.specs.dimensions.trim()
            ? parsed.specs.dimensions.trim()
            : fallback.specs.dimensions,
        quantity:
          typeof parsed?.specs?.quantity === 'string' && parsed.specs.quantity.trim()
            ? parsed.specs.quantity.trim()
            : fallback.specs.quantity,
        materialAndFinishing:
          typeof parsed?.specs?.materialAndFinishing === 'string' &&
          parsed.specs.materialAndFinishing.trim()
            ? parsed.specs.materialAndFinishing.trim()
            : fallback.specs.materialAndFinishing,
        designFileStatus:
          typeof parsed?.specs?.designFileStatus === 'string' &&
          parsed.specs.designFileStatus.trim()
            ? parsed.specs.designFileStatus.trim()
            : fallback.specs.designFileStatus,
        phoneOrZalo: parsedPhone,
        deliveryAddress:
          typeof parsed?.specs?.deliveryAddress === 'string' &&
          parsed.specs.deliveryAddress.trim()
            ? parsed.specs.deliveryAddress.trim()
            : fallback.specs.deliveryAddress,
      },
    };
  } catch {
    return fallback;
  }
}

export function computeDashboardStats(
  pages: FanpageConfig[],
  conversations: Conversation[],
  selectedPage: PageId | 'all'
) {
  const filteredConvs =
    selectedPage === 'all'
      ? conversations
      : conversations.filter((c) => c.pageId === selectedPage);

  const filteredPages =
    selectedPage === 'all' ? pages : pages.filter((p) => p.id === selectedPage);

  const baseMessages = filteredPages.reduce((sum, p) => sum + p.handledMessagesCount, 0);
  const liveMessages = filteredConvs.reduce((sum, c) => sum + c.messages.length, 0);

  const phonesCollected = filteredConvs.filter(
    (c) =>
      c.status === 'Đã chốt SĐT' ||
      (c.specs.phoneOrZalo &&
        c.specs.phoneOrZalo !== 'Chưa có SĐT' &&
        c.specs.phoneOrZalo !== 'Chưa xác định')
  ).length + filteredPages.reduce((sum, p) => sum + p.collectedPhonesCount, 0);

  const pendingQuotes = filteredConvs.filter((c) => c.status === 'Cần báo giá').length +
    filteredPages.reduce((sum, p) => sum + p.pendingQuotesCount, 0);

  const hiddenCommentsCount = filteredConvs.filter((c) => c.commentHidden).length;

  return {
    totalHandledMessages: baseMessages + liveMessages,
    totalPhonesCollected: phonesCollected,
    totalPendingQuotes: pendingQuotes,
    hiddenCommentsCount,
    activeConversationsCount: filteredConvs.length,
  };
}
