export default function handler(req, res) {
  // Dùng URLSearchParams để lấy chính xác tham số có dấu chấm (hub.mode, hub.verify_token...)
  const urlObj = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  
  if (req.method === 'GET') {
    const mode = urlObj.searchParams.get('hub.mode') || req.query?.['hub.mode'] || req.query?.hub?.mode;
    const token = urlObj.searchParams.get('hub.verify_token') || req.query?.['hub.verify_token'] || req.query?.hub?.verify_token;
    const challenge = urlObj.searchParams.get('hub.challenge') || req.query?.['hub.challenge'] || req.query?.hub?.challenge;

    // Chấp nhận trực tiếp mã tienphat_ai_webhook_2026 hoặc biến môi trường
    const isValidToken = 
      token === 'tienphat_ai_webhook_2026' || 
      (process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN);

    if (mode === 'subscribe' && isValidToken) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(String(challenge));
    } else {
      // In ra lý do cụ thể nếu vẫn sai để dễ kiểm tra
      return res.status(403).send(`Forbidden: mode=${mode}, token=${token}`);
    }
  }

  // Xử lý nhận tin nhắn POST từ Facebook gửi đến
  if (req.method === 'POST') {
    console.log('Webhook POST event:', JSON.stringify(req.body));
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
