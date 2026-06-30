import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // 1. 允許跨域 (CORS) 安全設定
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 嚴格檢查環境變數是否成功注入
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: "Vercel 環境變數遺失！請至 Vercel 後台 Settings -> Environment Variables 檢查 GEMINI_API_KEY 是否填寫正確，並重新執行 vercel --prod 部署。" 
        });
    }

    // 3. 安全解析 Request Body
    let message;
    try {
        message = req.body.message;
    } catch (e) {
        return res.status(400).json({ error: '無法解析請求主體 (Invalid JSON Body)' });
    }

    if (!message) {
        return res.status(400).json({ error: '請提供 message 欄位' });
    }

    try {
        // 4. 初始化 SDK（直接傳入金鑰，徹底防止環境變數沒讀到的問題）
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // 5. 呼叫 Antigravity 託管代理人
        const chatSession = await ai.interactions.chats.create({
            agent: "antigravity-preview-05-2026",
            environment: "remote"
        });

        // 6. 傳送訊息
        const response = await chatSession.sendMessage({ input: message });
        
        // 7. 成功回傳 JSON
        return res.status(200).json({ reply: response.output_text });

    } catch (error) {
        // 萬一 Google SDK 報錯或沙盒啟動失敗，保證回傳正確的 JSON 格式，不讓 Vercel 噴文字錯誤
        console.error("Antigravity SDK Error:", error);
        return res.status(500).json({ 
            error: `Google SDK 執行失敗: ${error.message || error}`,
            stack: error.stack 
        });
    }
}
