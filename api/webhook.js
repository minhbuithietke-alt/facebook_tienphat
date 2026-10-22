// Trả về danh sách sự kiện cho giao diện Web
  if (req.method === 'GET' && (pathname.endsWith('/events') || urlObj.searchParams.get('action') === 'events')) {
    // Nếu chưa có sự kiện nào, tự động thêm 1 sự kiện mẫu thật để web không hiện dữ liệu demo cũ
    if (globalMemory.length === 0) {
      globalMemory.push({
        id: `wh-init-${Date.now()}`,
        receivedAt: "09:50",
        fbPageId: "601076817027492",
        mappedSlotId: "page1",
        mappedPageName: "Tiến Phát In Túi Giấy & Hộp Giấy Gia Lai",
        senderId: "7199632656781412",
        senderName: "Khách (1412)",
        interactionType: "Tin nhắn (Inbox)",
        incomingText: "Hệ thống Tiến Phát AI đã sẵn sàng nhận tin nhắn từ Fanpage!",
        aiReply: "Dạ hệ thống đã kết nối thành công! Anh/chị cứ nhắn tin thoải mái, AI sẽ tự động phân tích và trả lời ạ.",
        status: "Đang hỏi quy cách",
        shouldHideComment: false,
        specs: { product: "Hộp giấy / Túi giấy", dimensions: "Chưa xác định", quantity: "Chưa xác định", materialAndFinishing: "Chưa xác định", designFileStatus: "Chưa xác định", phoneOrZalo: "Chưa có SĐT", deliveryAddress: "Chưa xác định" },
        graphApiStatus: "Hệ thống sẵn sàng"
      });
    }

    return res.status(200).json({
      verifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'tienphat_secure_2026',
      connectedPages: Object.values(DEFAULT_PAGES),
      events: globalMemory.slice(0, 25),
    });
  }
