import { GoogleGenAI } from '@google/genai';

// 在 Vercel 環境下，API Key 會直接從 process.env.GEMINI_API_KEY 讀取，不需手動 config dotenv
const ai = new GoogleGenAI();

export default async function handler(req, res) {
    // CORS 設定
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        // 建立支援 Interactions API 的對話會話
        const chatSession = await ai.interactions.chats.create({
            agent: "antigravity-preview-05-2026",
            environment: "remote"
        });

        // 傳送訊息
        const response = await chatSession.sendMessage({ input: message });

        return res.status(200).json({ reply: response.output_text });
    } catch (error) {
        // 捕捉具體錯誤回傳給前端，避免直接拋出 Vercel 500
        return res.status(500).json({ error: error.message });
    }
}
