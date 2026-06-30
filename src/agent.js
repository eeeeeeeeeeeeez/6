import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI();
let chatSession = null;

export async function initializeAgent() {
    try {
        chatSession = await ai.interactions.chats.create({
            agent: "antigravity-preview-05-2026",
            environment: "remote"
        });
        return true;
    } catch (error) {
        console.error("❌ 代理人初始化失敗:", error);
        throw error;
    }
}

export async function sendMessageToAgent(userInput) {
    if (!chatSession) {
        throw new Error("代理人尚未初始化，請先呼叫 initializeAgent()");
    }
    const response = await chatSession.sendMessage({ input: userInput });
    return response.output_text;
}
