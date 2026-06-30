# Antigravity AI Agent - Vercel 部署版

此專案已調整為適合 Vercel Serverless Functions 運作的架構。

## 部署與使用步驟

1. 解壓縮檔案。
2. 確保您已安裝 Vercel CLI (`npm install -g vercel`)。
3. 在專案根目錄下直接執行部署命令：
   ```bash
   vercel
   ```
4. 部署完成後，請務必至 Vercel 後台的 **Settings -> Environment Variables** 新增您的環境變數：
   - 名稱：`GEMINI_API_KEY`
   - 數值：`您的_GEMINI_API_KEY_密鑰`
5. 設定完成後，執行以下命令推上生產環境獲取正式網址：
   ```bash
   vercel --prod
   ```
