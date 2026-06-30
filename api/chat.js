import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // 1. CORS 安全設定
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

    // 2. 檢查環境變數
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: "Vercel 環境變數遺失！請檢查 GEMINI_API_KEY 是否填寫正確。" 
        });
    }

    let message;
    try {
        message = req.body.message;
    } catch (e) {
        return res.status(400).json({ error: '無法解析請求主體' });
    }

    if (!message) {
        return res.status(400).json({ error: '請提供 message 欄位' });
    }

    try {
        // 3. 初始化 SDK
        const ai = new GoogleGenAI({ apiKey: apiKey });

        let response;

        // 4. 防禦性命名空間檢查：相容不同版本的 Interactions API 呼叫路徑
        if (ai.interactions && ai.interactions.chats) {
            // 原預覽版路徑
            const chatSession = await ai.interactions.chats.create({
                agent: "antigravity-preview-05-2026",
                environment: "remote"
            });
            response = await chatSession.sendMessage({ input: message });
        } else if (ai.chats) {
            // 部分正式版 SDK 整合路徑
            const chatSession = ai.chats.create({
                model: "antigravity-preview-05-2026",
                // 補足遠端沙盒宣告
                config: { environment: "remote" }
            });
            response = await chatSession.sendMessage({ message: message });
        } else {
            // 最穩健的單次代理人任務呼叫接口 (interactions.create)
            // 如果對話 Session 的命名空間因版本更新被移到底層，改用標準 Interaction
            const interaction = await ai.interactions.create({
                agent: "antigravity-preview-05-2026",
                input: message,
                environment: "remote"
            });
            return res.status(200).json({ reply: interaction.output_text });
        }
        
        // 5. 成功回傳 JSON
        return res.status(200).json({ reply: response.output_text || response.text });

    } catch (error) {
        console.error("Antigravity SDK Error:", error);
        return res.status(500).json({ 
            error: `Google SDK 執行失敗: ${error.message || error}`,
            stack: error.stack 
        });
    }
}
