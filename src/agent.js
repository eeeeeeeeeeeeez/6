import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const ai = new GoogleGenAI();
let chatSession = null;

/**
 * 初始化 Antigravity 代理人對話會話
 */
export async function initializeAgent() {
    try {
        // 建立支援 Interactions API 的託管型對話會話
        chatSession = await ai.interactions.chats.create({
            agent: "antigravity-preview-05-2026",
            environment: "remote" // 指定使用 Google 託管的獨立安全遠端沙盒
        });
        return true;
    } catch (error) {
        console.error("❌ 代理人初始化失敗:", error);
        throw error;
    }
}

/**
 * 發送訊息給代理人，並取得其在沙盒內動手執行後的最終回報
 */
export async function sendMessageToAgent(userInput) {
    if (!chatSession) {
        throw new Error("代理人尚未初始化，請先呼叫 initializeAgent()");
    }
    
    // 發送訊息（Agent 會維持多輪對話間的記憶與沙盒檔案狀態）
    const response = await chatSession.sendMessage({ input: userInput });
    return response.output_text;
}
