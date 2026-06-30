import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
    // CORS 安全設定
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Vercel 環境變數遺失！請檢查 GEMINI_API_KEY。" });

    const { message } = req.body;
    if (!message) return res.status(400).json({ error: '請提供 message 欄位' });

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        let result;

        // ====== 2.0.0+ 新版自適應路由機制 ======
        
        if (ai.agents && typeof ai.agents.create === 'function') {
            // 分支 A: 2.0 新版標準 Agents 宣告方式
            result = await ai.agents.create({
                agent: "antigravity",
                prompt: message,
                config: { environment: "remote" }
            });
        } 
        else if (ai.agents && typeof ai.agents.execute === 'function') {
            // 分支 B: 部分過渡版本的執行命名
            result = await ai.agents.execute({
                agent: "antigravity",
                prompt: message,
                config: { environment: "remote" }
            });
        }
        else if (ai.interactions && typeof ai.interactions.create === 'function') {
            // 分支 C: 依然維持原命名空間，但使用符合 2.0 破壞性更新後的全新參數結構
            // 2.0 版的 Interactions 拒絕接受舊版 Schema，需改用 prompt
            result = await ai.interactions.create({
                agent: "antigravity",
                prompt: message, 
                config: { environment: "remote" }
            });
        }
        else {
            // 萬一命名空間都沒中，拋出目前 SDK 的結構供除錯
            const availableKeys = {
                ai: Object.keys(ai),
                agents: ai.agents ? Object.keys(ai.agents) : null,
                interactions: ai.interactions ? Object.keys(ai.interactions) : null
            };
            throw new Error(`找不到匹配的新版 Agent 函數。當前 SDK 結構: ${JSON.stringify(availableKeys)}`);
        }

        // 提取回傳文字
        const outputText = result.text || result.output_text || (result.content && result.content.text);

        return res.status(200).json({ reply: outputText || "任務已完成，但未偵測到文字回報。" });

    } catch (error) {
        console.error("Antigravity API Error:", error);
        return res.status(500).json({ 
            error: `Google SDK 執行失敗: ${error.message || JSON.stringify(error)}`
        });
    }
}
