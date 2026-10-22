export default function handler(req, res) {
  // Xử lý xác thực GET từ Facebook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'tienphat_ai_webhook_2026';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send('Forbidden');
    }
  }

  // Xử lý nhận tin nhắn POST từ Facebook gửi đến
  if (req.method === 'POST') {
    const body = req.body;
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.status(405).send('Method Not Allowed');
}
