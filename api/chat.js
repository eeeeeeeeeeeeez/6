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
        // 初始化最新版 SDK
        const ai = new GoogleGenAI({ apiKey: apiKey });

        // 3. 2026 年 5 月全新破壞性改版後的新版語法結構
        // 核心改為 ai.agents.run 或 ai.agents.execute 
        const result = await ai.agents.run({
            agent: "antigravity",
            prompt: message, // 舊版 input 改為 prompt
            config: {
                environment: "remote" // 宣告在託管的遠端 Linux 沙盒執行
            }
        });

        // 4. 回傳全新架構下的文字輸出
        return res.status(200).json({ 
            reply: result.text || result.output_text
        });

    } catch (error) {
        console.error("Antigravity API Error:", error);
        return res.status(500).json({ 
            error: `Google SDK 執行失敗: ${error.message || JSON.stringify(error)}`
        });
    }
}
