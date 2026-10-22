export type PageId = 'page1' | 'page2' | 'page3';

export type LeadStatus = 'Đã chốt SĐT' | 'Đang hỏi quy cách' | 'Cần báo giá';

export type InteractionType = 'Tin nhắn (Inbox)' | 'Bình luận (Comment)';

export interface FanpageConfig {
  id: PageId;
  name: string;
  specialty: string;
  products: string[];
  handledMessagesCount: number;
  collectedPhonesCount: number;
  pendingQuotesCount: number;
  fbPageId?: string;
  webhookSubscribed?: boolean;
  connectedViaOAuth?: boolean;
}

export interface TechnicalSpec {
  product: string;
  dimensions: string;
  quantity: string;
  materialAndFinishing: string;
  designFileStatus: string;
  phoneOrZalo: string;
  deliveryAddress: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'staff';
  content: string;
  timestamp: string;
  isComment?: boolean;
  isHiddenComment?: boolean;
}

export interface Conversation {
  id: string;
  pageId: PageId;
  customerName: string;
  customerHandle: string;
  interactionType: InteractionType;
  status: LeadStatus;
  commentHidden: boolean;
  savedOrder: boolean;
  productionOrderCode?: string;
  updatedAt: string;
  messages: ChatMessage[];
  specs: TechnicalSpec;
}

export interface AIAnalysisResult {
  replyMessage: string;
  status: LeadStatus;
  shouldHideComment: boolean;
  specs: TechnicalSpec;
}

export interface MarketingPostItem {
  id: string;
  pageId: PageId;
  topic: string;
  productFocus: string;
  tone: string;
  headline: string;
  content: string;
  hashtags: string[];
  cta: string;
  createdAt: string;
  status: 'Đã đăng tự động' | 'Lên lịch đăng' | 'Bản nháp';
  scheduledTime: string;
}

export interface FirestoreSavedOrder {
  id: string;
  orderCode: string;
  staffUid: string;
  staffEmail: string;
  pageId: PageId;
  pageName: string;
  customerName: string;
  interactionType: string;
  status: string;
  product: string;
  dimensions: string;
  quantity: string;
  materialAndFinishing: string;
  designFileStatus: string;
  phoneOrZalo: string;
  deliveryAddress: string;
  commentHidden: boolean;
  createdAtText: string;
}

export interface FacebookWebhookEventItem {
  id: string;
  receivedAt: string;
  fbPageId: string;
  mappedSlotId: PageId;
  mappedPageName: string;
  senderId: string;
  senderName: string;
  interactionType: InteractionType;
  incomingText: string;
  aiReply: string;
  status: LeadStatus;
  shouldHideComment: boolean;
  specs: TechnicalSpec;
  graphApiStatus: string;
}
