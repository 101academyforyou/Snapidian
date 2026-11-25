# Snapidian

🌐 https://snapidian.onepointzeroone.org/ · App: https://snapidian.onepointzeroone.org/app/

**Capture Anything. Save to Your Knowledge.**
讓手機截圖成為 Obsidian 第二大腦的一部分。

Snapidian 是一個網站 + 可安裝的 App（PWA），支援繁體中文 / English。
把截圖加上標題、想法、標籤與 OCR 文字，一鍵存成 Obsidian 筆記。

## 功能 Features

- 📥 **匯入截圖**：點選、拖放、貼上（Ctrl/⌘+V），Android 安裝後可從相簿「分享」到 Snapidian（Web Share Target）
- 🔤 **OCR**：瀏覽器本機辨識（tesseract.js），支援繁中 / 簡中 / 英文 / 日文
- 📝 **Obsidian 格式**：YAML frontmatter、tags、`![[附件]]` 內嵌圖片
- 💾 **三種儲存方式**
  - 直接寫入 Vault 資料夾（桌面版 Chrome / Edge，File System Access API），寫完可用 `obsidian://` 開啟
  - 系統分享（手機分享給 Obsidian 或其他 App）
  - 下載 ZIP（含資料夾結構，解壓到 Vault 即可）
- ✨ **AI 整理（選用，預設關閉）**：自動產生標題、摘要、標籤並擷取文字
  - **Chrome 內建 AI**：桌面版 Chrome 的 Gemini Nano（Prompt API），在本機執行、免費
  - **Claude**：填入自己的 Anthropic API 金鑰（只存在瀏覽器），截圖會傳給 Claude 分析；SDK 打包在 `app/vendor/`
- 🔒 **隱私**：資料存在裝置的 IndexedDB，無伺服器、無帳號
- 📱 **離線可用、可安裝**（Service Worker + Web App Manifest）
- 🌐 **中英雙語**：自動偵測，可隨時切換

## 專案結構

```
index.html            官網 Landing page
app/                  Snapidian App
  index.html          App 介面
  app.js              主要邏輯（匯入、編輯、OCR、存入 Obsidian）
  db.js               IndexedDB 存取（App 與 Service Worker 共用）
  zip.js              無相依的 ZIP 產生器
  app.css
assets/
  i18n.js             中英文字典（官網與 App 共用）
  site.css            官網樣式
  icon*.png / icon.svg
manifest.webmanifest  PWA 設定（含 share_target）
sw.js                 Service Worker（離線快取 + 分享接收）
```

## 本機執行

純靜態網站，不需要建置：

```bash
python3 -m http.server 8000
```

開啟 http://localhost:8000 （官網）與 http://localhost:8000/app/ （App）。

## 部署

任何靜態主機皆可（需 HTTPS 才能安裝 PWA 與使用分享功能）。
本專案已設定 GitHub Pages + 自訂網域 `snapidian.onepointzeroone.org`：

1. **DNS**：在 `onepointzeroone.org` 的 DNS 新增
   `CNAME  snapidian  →  101academyforyou.github.io`
   （若用 Cloudflare，先設為 DNS only／灰色雲，等 HTTPS 憑證發好再開 Proxy）
2. **GitHub**：Settings → Pages → Source 選 **GitHub Actions**（`.github/workflows/pages.yml` 會自動部署）
3. Settings → Pages → Custom domain 填 `snapidian.onepointzeroone.org`，憑證發好後勾選 **Enforce HTTPS**

## 產生的筆記範例

```markdown
---
created: 2026-11-25T10:24:08
source: Snapidian
tags:
  - snapidian
  - meeting
---

# 會議白板截圖

![[Snapidian/attachments/Snap-20261125-102408.png]]

## 筆記
Q1 roadmap 的三個重點。

## 辨識文字
> Roadmap Q1 — Onboarding / Search / Sync
```
