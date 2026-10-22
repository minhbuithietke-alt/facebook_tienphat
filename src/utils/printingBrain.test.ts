import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVietnamesePhone,
  extractDimensions,
  extractQuantity,
  safeParseAIAnalysisJson,
  computeDashboardStats,
} from './printingBrain';
import { TechnicalSpec, FanpageConfig, Conversation } from '../types';

const defaultSpecs: TechnicalSpec = {
  product: 'Hộp giấy thương hiệu',
  dimensions: 'Chưa xác định',
  quantity: 'Chưa xác định',
  materialAndFinishing: 'Chưa xác định',
  designFileStatus: 'Chưa xác định',
  phoneOrZalo: 'Chưa có SĐT',
  deliveryAddress: 'Chưa xác định',
};

test('extractVietnamesePhone detects standard 10-digit Vietnamese phone numbers', () => {
  assert.equal(extractVietnamesePhone('Tư vấn giúp mình qua zalo 0905123456 nhé'), '0905123456');
  assert.equal(extractVietnamesePhone('SĐT: 0988.777.666 giao Gia Lai'), '0988777666');
  assert.equal(extractVietnamesePhone('In hộp giấy giá sao shop?'), null);
});

test('extractDimensions parses 3D box sizes and m2 area', () => {
  assert.equal(extractDimensions('Mình cần in thùng kích thước 30x20x15cm nhé'), '30x20x15cm');
  assert.equal(extractDimensions('In decal dán kính khoảng 12m2'), '12m2');
});

test('extractQuantity parses printing order quantities', () => {
  assert.equal(extractQuantity('Báo giá giúp mình 1000 hộp nhé'), '1000 hộp');
  assert.equal(extractQuantity('Số lượng: 500 thùng'), '500 thùng');
});

test('safeParseAIAnalysisJson handles malformed JSON without throwing and extracts specs', () => {
  const brokenJson = '```json { "replyMessage": "Chào bạn", broken_syntax ';
  const result = safeParseAIAnalysisJson(
    brokenJson,
    'Mình cần đặt 2000 hộp giấy Ivory kích thước 15x10x8cm, zalo 0912345678',
    defaultSpecs,
    'Bình luận (Comment)',
    'page2'
  );

  assert.equal(result.status, 'Đã chốt SĐT');
  assert.equal(result.shouldHideComment, true);
  assert.equal(result.specs.phoneOrZalo, '0912345678');
  assert.equal(result.specs.dimensions, '15x10x8cm');
  assert.equal(result.specs.quantity, '2000 hộp');
});

test('safeParseAIAnalysisJson parses valid Gemini JSON response and enforces comment hiding when phone exists', () => {
  const validJson = JSON.stringify({
    replyMessage: 'Dạ Tiến Phát đã nhận đơn và kết bạn Zalo ngay ạ!',
    status: 'Cần báo giá',
    shouldHideComment: false,
    specs: {
      product: 'Thùng carton 5 lớp',
      dimensions: '50x40x40cm',
      quantity: '500 thùng',
      materialAndFinishing: 'Sóng BC 5 lớp chịu lực',
      designFileStatus: 'Đã có file AI',
      phoneOrZalo: '0935888999',
      deliveryAddress: 'Pleiku, Gia Lai',
    },
  });

  const result = safeParseAIAnalysisJson(
    validJson,
    'Báo giá 500 thùng 50x40x40cm sđt 0935888999',
    defaultSpecs,
    'Bình luận (Comment)',
    'page3'
  );

  assert.equal(result.status, 'Đã chốt SĐT');
  assert.equal(result.shouldHideComment, true);
  assert.equal(result.specs.product, 'Thùng carton 5 lớp');
  assert.equal(result.specs.deliveryAddress, 'Pleiku, Gia Lai');
});

test('computeDashboardStats aggregates metrics accurately per page and across all pages', () => {
  const pages: FanpageConfig[] = [
    {
      id: 'page1',
      name: 'In Ấn Nhanh',
      specialty: 'Danh thiếp, Decal',
      products: ['Danh thiếp'],
      handledMessagesCount: 100,
      collectedPhonesCount: 20,
      pendingQuotesCount: 5,
    },
    {
      id: 'page2',
      name: 'Xưởng Bao Bì Giấy',
      specialty: 'Hộp giấy',
      products: ['Hộp giấy'],
      handledMessagesCount: 200,
      collectedPhonesCount: 40,
      pendingQuotesCount: 8,
    },
  ];

  const conversations: Conversation[] = [
    {
      id: 'c1',
      pageId: 'page1',
      customerName: 'Nguyễn Văn A',
      customerHandle: 'fb.com/nguyenvana',
      interactionType: 'Bình luận (Comment)',
      status: 'Đã chốt SĐT',
      commentHidden: true,
      savedOrder: false,
      updatedAt: '10:00',
      messages: [{ id: 'm1', sender: 'customer', content: '0905111222', timestamp: '10:00' }],
      specs: { ...defaultSpecs, phoneOrZalo: '0905111222' },
    },
  ];

  const allStats = computeDashboardStats(pages, conversations, 'all');
  assert.equal(allStats.totalHandledMessages, 301);
  assert.equal(allStats.totalPhonesCollected, 61);
  assert.equal(allStats.hiddenCommentsCount, 1);

  const page1Stats = computeDashboardStats(pages, conversations, 'page1');
  assert.equal(page1Stats.totalHandledMessages, 101);
  assert.equal(page1Stats.totalPhonesCollected, 21);
});
