import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // 1. CORS 安全設定
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // 2. 檢查環境變數
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Vercel 環境變數遺失！請檢查 GEMINI_API_KEY。" });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: '請提供 message 欄位' });

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // 3. 嚴格強迫使用 Interactions 核心 API (不走傳統 Chat 接口)
        // 使用目前最新 SDK 的標準單次 Interaction 呼叫方式
        const interaction = await ai.interactions.create({
            agent: "antigravity-preview-05-2026",
            input: message,
            environment: "remote" // 宣告在託管的遠端 Linux 沙盒執行
        });

        // 4. 回傳 Agent 執行並觀察完後的最終結果
        return res.status(200).json({ 
            reply: interaction.output_text || interaction.text 
        });

    } catch (error) {
        console.error("Antigravity API Error:", error);
        return res.status(500).json({ 
            error: `Google SDK 執行失敗: ${error.message || JSON.stringify(error)}`
        });
    }
}
