import readline from 'readline';
import { initializeAgent, sendMessageToAgent } from './agent.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    console.log("⏳ 正在啟動 Antigravity 遠端沙盒環境並建立持久連線...");
    
    try {
        await initializeAgent();
    } catch (err) {
        console.error("💥 無法建立與 Antigravity 的連線，請檢查 API Key 是否正確。");
        process.exit(1);
    }
    
    console.log("\n🤖 Antigravity Agent 已成功連線！");
    console.log("💡 提示：您可以正常與它聊天，也可以隨時命令它在後台沙盒執行複雜的代碼與網路工程。");
    console.log("🚪 輸入 'exit' 即可安全結束專案。\n");

    const promptUser = () => {
        rl.question('👤 您: ', async (input) => {
            // 結束對話條件
            if (input.trim().toLowerCase() === 'exit') {
                console.log("👋 感謝使用，正在關閉沙盒連線並退出專案...");
                rl.close();
                process.exit(0);
            }

            if (!input.trim()) {
                promptUser();
                return;
            }

            console.log("🤖 Agent 正在思考、規劃並在 Linux 沙盒中執行工具...");

            try {
                // 呼叫代理人，並等待它規劃與執行（Thought -> Action -> Observation）完畢
                const reply = await sendMessageToAgent(input);
                console.log(`\n🤖 Agent 回應:\n${reply}\n`);
            } catch (error) {
                console.error("\n❌ 處理訊息時發生錯誤:", error.message);
            }

            // 繼續下一輪對話迴圈
            promptUser();
        });
    };

    promptUser();
}

main();
