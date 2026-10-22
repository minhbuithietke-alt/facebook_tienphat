import { Conversation, FanpageConfig, MarketingPostItem, PageId } from '../types';

export const INITIAL_FANPAGES: FanpageConfig[] = [
  {
    id: 'page1',
    name: 'In Ấn Nhanh',
    specialty: 'Chuyên Danh thiếp, Decal dán kính, Tem nhãn, Tờ rơi',
    products: ['Danh thiếp C300', 'Decal dán kính', 'Tem nhãn cuộn/tờ', 'Tờ rơi A4/A5'],
    handledMessagesCount: 1420,
    collectedPhonesCount: 386,
    pendingQuotesCount: 9,
  },
  {
    id: 'page2',
    name: 'Xưởng Bao Bì Giấy',
    specialty: 'Chuyên Hộp giấy Ivory/Kraft/Duplex, Túi giấy thương hiệu',
    products: ['Hộp giấy Ivory', 'Hộp cứng âm dương', 'Túi giấy Kraft/Couche', 'Hộp mỹ phẩm ép kim'],
    handledMessagesCount: 2150,
    collectedPhonesCount: 612,
    pendingQuotesCount: 14,
  },
  {
    id: 'page3',
    name: 'Tổng Kho Thùng Carton',
    specialty: 'Chuyên Thùng carton 3-5 lớp, Hộp ship COD',
    products: ['Thùng carton 3 lớp', 'Thùng carton 5 lớp BC', 'Hộp ship COD nắp gài', 'Thùng bế in Flexo'],
    handledMessagesCount: 3080,
    collectedPhonesCount: 894,
    pendingQuotesCount: 18,
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    pageId: 'page2',
    customerName: 'Trần Minh Ngọc (Mỹ Phẩm Organic)',
    customerHandle: 'fb.com/minhngoc.organic',
    interactionType: 'Bình luận (Comment)',
    status: 'Đã chốt SĐT',
    commentHidden: true,
    savedOrder: false,
    updatedAt: 'Vừa xong',
    messages: [
      {
        id: 'm-101',
        sender: 'customer',
        content: 'Shop báo giá giúp mình 2000 hộp giấy đựng serum kích thước 12x5x5cm, giấy Ivory 350 cán màng mờ, có ép kim logo nhé. Zalo mình 0905888999 giao về Pleiku, Gia Lai.',
        timestamp: '09:42',
        isComment: true,
        isHiddenComment: true,
      },
      {
        id: 'm-102',
        sender: 'ai',
        content: 'Dạ Xưởng Bao Bì Giấy Tiến Phát đã nhận được đầy đủ thông số 2000 hộp serum Ivory 350 (12x5x5cm, cán màng mờ, ép kim logo) và SĐT Zalo 0905888999 của chị Minh Ngọc ạ! Hệ thống đã tự động ẩn bình luận để bảo mật SĐT tránh bị làm phiền. Chuyên viên báo giá Tiến Phát đang kết bạn Zalo gửi bảng giá gốc tại xưởng ngay trong 2 phút nhé ạ!',
        timestamp: '09:42',
      },
    ],
    specs: {
      product: 'Hộp giấy đựng serum mỹ phẩm',
      dimensions: '12x5x5cm',
      quantity: '2000 hộp',
      materialAndFinishing: 'Giấy Ivory 350gsm, cán màng mờ, ép kim logo',
      designFileStatus: 'Đã có logo, cần dàn khuôn bế chuẩn',
      phoneOrZalo: '0905888999',
      deliveryAddress: 'TP. Pleiku, Gia Lai',
    },
  },
  {
    id: 'conv-2',
    pageId: 'page3',
    customerName: 'Lê Hoàng Nam (Kho Nông Sản Tây Nguyên)',
    customerHandle: 'fb.com/hoangnam.agri',
    interactionType: 'Tin nhắn (Inbox)',
    status: 'Cần báo giá',
    commentHidden: false,
    savedOrder: false,
    updatedAt: '5 phút trước',
    messages: [
      {
        id: 'm-201',
        sender: 'customer',
        content: 'Xưởng ơi bên mình cần đặt 1500 thùng carton 5 lớp đóng sầu riêng xuất khẩu, kích thước 45x35x30cm, in Flexo 2 màu, đã có file thiết kế Corel.',
        timestamp: '09:35',
      },
      {
        id: 'm-202',
        sender: 'ai',
        content: 'Dạ chào anh Hoàng Nam! Tổng Kho Thùng Carton Tiến Phát đã ghi nhận quy cách 1500 thùng carton 5 lớp (KT: 45x35x30cm, in Flexo 2 màu, đã có file Corel). Với hàng nông sản nặng, xưởng tư vấn dùng sóng BC chịu lực chống bục cao. Anh cho Tiến Phát xin SĐT Zalo và địa chỉ kho nhận hàng để kỹ thuật gửi bảng giá sỉ tốt nhất ngay nhé!',
        timestamp: '09:35',
      },
    ],
    specs: {
      product: 'Thùng carton 5 lớp đựng nông sản',
      dimensions: '45x35x30cm',
      quantity: '1500 thùng',
      materialAndFinishing: 'Carton 5 lớp sóng BC chịu lực, in Flexo 2 màu',
      designFileStatus: 'Đã có file thiết kế Corel (.cdr)',
      phoneOrZalo: 'Chưa có SĐT',
      deliveryAddress: 'Chưa xác định',
    },
  },
  {
    id: 'conv-3',
    pageId: 'page1',
    customerName: 'Phạm Thanh Thảo (Coffee & Tea)',
    customerHandle: 'fb.com/thaocoffee.gl',
    interactionType: 'Tin nhắn (Inbox)',
    status: 'Đang hỏi quy cách',
    commentHidden: false,
    savedOrder: false,
    updatedAt: '12 phút trước',
    messages: [
      {
        id: 'm-301',
        sender: 'customer',
        content: 'In tem nhãn dán ly trà sữa với decal dán kính quán giá sao shop ơi?',
        timestamp: '09:28',
      },
      {
        id: 'm-302',
        sender: 'ai',
        content: 'Dạ chào chị Thanh Thảo! Xưởng In Ấn Nhanh Tiến Phát chuyên in tem nhãn ly trà sữa (decal nhựa sữa/decal trong chống nước 100%) và decal dán kính khổ lớn giá gốc tại xưởng. Để báo giá chính xác nhất, chị Thảo cho xưởng xin: Kích thước tem (hoặc số m2 decal kính), Số lượng cần in, và SĐT Zalo để kỹ thuật gửi mẫu thực tế kèm bảng giá ưu đãi nhé!',
        timestamp: '09:28',
      },
    ],
    specs: {
      product: 'Tem nhãn ly trà sữa & Decal dán kính',
      dimensions: 'Chưa xác định',
      quantity: 'Chưa xác định',
      materialAndFinishing: 'Decal nhựa chống nước (đang tư vấn)',
      designFileStatus: 'Chưa xác định',
      phoneOrZalo: 'Chưa có SĐT',
      deliveryAddress: 'Chưa xác định',
    },
  },
  {
    id: 'conv-4',
    pageId: 'page1',
    customerName: 'Kiến Trúc Sư Vũ Đình Trọng',
    customerHandle: 'fb.com/vudinhtrong.arch',
    interactionType: 'Bình luận (Comment)',
    status: 'Đã chốt SĐT',
    commentHidden: true,
    savedOrder: true,
    productionOrderCode: 'LSX-TP-261001',
    updatedAt: '25 phút trước',
    messages: [
      {
        id: 'm-401',
        sender: 'customer',
        content: 'In 10 hộp danh thiếp giấy C300 cán mờ bo góc, có sẵn file AI rồi. Liên hệ zalo 0918222333 giao Quận 1 TP.HCM.',
        timestamp: '09:10',
        isComment: true,
        isHiddenComment: true,
      },
      {
        id: 'm-402',
        sender: 'ai',
        content: 'Dạ In Ấn Nhanh Tiến Phát đã nhận đơn 10 hộp danh thiếp C300 cán mờ bo góc (đã có file AI) của anh Trọng qua Zalo 0918222333. Hệ thống đã ẩn bình luận bảo mật SĐT và chuyển lệnh in nhanh trong ngày ạ!',
        timestamp: '09:10',
      },
    ],
    specs: {
      product: 'Danh thiếp / Namecard C300',
      dimensions: '9x5.4cm (Chuẩn Namecard)',
      quantity: '10 hộp (1000 cái)',
      materialAndFinishing: 'Giấy Couche C300, cán màng mờ 2 mặt, bo 4 góc',
      designFileStatus: 'Đã có file gốc Adobe Illustrator (.AI)',
      phoneOrZalo: '0918222333',
      deliveryAddress: 'Quận 1, TP.HCM',
    },
  },
];

export interface SimulatedScenario {
  pageId: PageId;
  customerName: string;
  interactionType: 'Tin nhắn (Inbox)' | 'Bình luận (Comment)';
  message: string;
  label: string;
}

export const SIMULATED_SCENARIOS: SimulatedScenario[] = [
  {
    pageId: 'page2',
    customerName: 'Đặng Thu Hà (Yến Sào Cao Cấp)',
    interactionType: 'Tin nhắn (Inbox)',
    label: 'Khách hỏi chung chung: "In hộp giấy giá sao shop?"',
    message: 'In hộp giấy đựng yến sào giá sao shop ơi? Tư vấn giúp mình nhé.',
  },
  {
    pageId: 'page3',
    customerName: 'Nguyễn Quốc Tuấn (Shop Giày Sneaker)',
    interactionType: 'Bình luận (Comment)',
    label: 'Bình luận có SĐT + đủ quy cách thùng COD (Test Tự ẩn Comment)',
    message: 'Báo giá gấp 3000 hộp ship COD kích thước 32x20x12cm sóng E 3 lớp cứng cáp, in logo 1 màu, đã có file PDF. Gửi báo giá qua Zalo 0938555777 giao Bình Dương nhé shop!',
  },
  {
    pageId: 'page1',
    customerName: 'Hoàng Gia Bảo (Showroom Nội Thất)',
    interactionType: 'Bình luận (Comment)',
    label: 'Bình luận đặt Decal dán kính + Tờ rơi kèm SĐT',
    message: 'Mình cần in 25m2 decal mờ dán kính văn phòng và 2000 tờ rơi A5 giấy C150, chưa có file thiết kế. Liên hệ mình số 0979666888 tại Đà Nẵng.',
  },
  {
    pageId: 'page2',
    customerName: 'Lâm Bảo Châu (Thời Trang Thiết Kế)',
    interactionType: 'Tin nhắn (Inbox)',
    label: 'Khách báo quy cách Túi giấy Kraft nhưng chưa để lại SĐT',
    message: 'Xưởng tính giá giúp mình 1000 túi giấy Kraft trắng kích thước 25x35x10cm, xỏ dây dù bóng, đã có file AI thiết kế sẵn.',
  },
];

export const INITIAL_MARKETING_POSTS: MarketingPostItem[] = [
  {
    id: 'post-1',
    pageId: 'page2',
    topic: 'Ưu đãi in hộp giấy thương hiệu cuối năm',
    productFocus: 'Hộp giấy Ivory 350gsm cán mờ ép kim',
    tone: 'Chuyên nghiệp - Cam kết giá xưởng',
    headline: '[XƯỞNG BAO BÌ TIẾN PHÁT] Nâng Tầm Thương Hiệu Với Hộp Giấy Ivory Ép Kim - Giá Gốc Tại Xưởng',
    content: 'Bao bì đẹp giúp tăng 45% tỷ lệ khách hàng chốt đơn ngay từ ánh nhìn đầu tiên! Xưởng Bao Bì Giấy Tiến Phát nhận sản xuất trực tiếp Hộp mỹ phẩm, Hộp quà Tết, Hộp dược phẩm, Túi giấy thương hiệu trên chất liệu Ivory, Kraft, Duplex cao cấp. Miễn phí dựng mẫu 3D & in test màu thực tế.',
    cta: 'Comment ngay [Kích thước + Số lượng] hoặc SĐT Zalo để nhận bảng báo giá sỉ tại xưởng trong 3 phút!',
    hashtags: ['#XuongBaoBiTienPhat', '#InHopGiayGiaXuong', '#InTuiGiayThuongHieu', '#BaoBiGiayCaoCap'],
    createdAt: 'Hôm nay, 08:30',
    status: 'Đã đăng tự động',
    scheduledTime: '08:30 - Hàng ngày',
  },
  {
    id: 'post-2',
    pageId: 'page3',
    topic: 'Xả kho thùng carton ship COD 3 lớp - 5 lớp',
    productFocus: 'Thùng Carton 3-5 lớp & Hộp Ship COD',
    tone: 'Bán sỉ số lượng lớn - Giao nhanh 24h',
    headline: '[TỔNG KHO CARTON TIẾN PHÁT] Sẵn Kho Hơn 80 Kích Thước Hộp Ship COD & Thùng Carton 3-5 Lớp Giá Sỉ',
    content: 'Giải pháp đóng gói tiết kiệm chi phí tối đa cho các chủ Shop TMĐT, Kho Nông Sản và Xưởng Sản Xuất. Giấy sóng A, B, C, E, BC định lượng cao, chịu lực nén tốt, chống móp méo khi vận chuyển xa. Nhận đặt bế kích thước riêng và in thương hiệu chỉ từ 500 thùng.',
    cta: 'Nhắn tin ngay kích thước Dài x Rộng x Cao để Tổng Kho Tiến Phát báo giá xuất xưởng tốt nhất!',
    hashtags: ['#TongKhoThungCarton', '#HopShipCOD', '#ThungCarton5Lop', '#TienPhatPackaging'],
    createdAt: 'Hôm qua, 19:00',
    status: 'Lên lịch đăng',
    scheduledTime: '19:30 - Tối nay',
  },
];
