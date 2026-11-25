# Snapidian 上架 App Store 指南

iPhone App 用 [Capacitor](https://capacitorjs.com/) 把網站包成原生 App，Xcode 專案在 `ios/`。
網站檔案會打包進 App 裡（不需要網路也能開啟），並加上 iPhone 原生功能：

| 功能 | 網頁版 | iPhone App |
|---|---|---|
| 辨識截圖文字 | Tesseract.js | **Apple Vision**（裝置上執行、繁中辨識較好） |
| 在裝置上執行的 AI | Chrome 內建 AI | **Apple Intelligence**（iOS 26+，依辨識出的文字整理） |
| 雲端 AI | Claude／ChatGPT／Gemini／其他（自己的 API 金鑰） | 同左，第一次使用前會詢問同意 |
| 存檔 | 下載或寫入資料夾 | **iOS 分享選單**（存到「檔案」或筆記 App） |

原生程式碼在 `ios/App/App/SnapidianNativePlugin.swift`（Vision、Apple Intelligence）與 `SnapidianViewController.swift`（註冊外掛）。

> ⚠️ 這些 Swift 程式碼是在 Linux 上寫的，沒辦法在那裡編譯。第一次在 Xcode 建置時如果出現錯誤，把錯誤訊息貼給 Claude 修正。

---

## 1. 在 Mac 上建置

需要：Xcode 26 以上（Apple Intelligence 需要 iOS 26 SDK）、Node.js 20 以上。

```bash
git clone https://github.com/101academyforyou/Snapidian.git
```

```bash
cd Snapidian
```

```bash
npm install
```

```bash
npm run ios:sync
```

```bash
npm run ios:open
```

`ios:sync` 會把網站複製到 `www/` 再同步進 Xcode 專案；之後網站有改動，重新執行一次即可。

在 Xcode 裡：

1. 左側點 **App** 專案 → **Signing & Capabilities** → **Team** 選你的開發者帳號。
2. **Bundle Identifier** 目前是 `org.onepointzeroone.snapidian`。可以改，但要和 App Store Connect 建立的 App 一致。
3. 接上 iPhone，選它當執行目標，按 ▶︎ 試跑。確認：加入截圖後會自動辨識文字、「✦ AI 整理」可用、「下載 Markdown」會跳出分享選單。
4. 版本號在 **General → Identity**：Version `1.0`、Build `1`（每次上傳 Build 要加 1）。

## 2. 上傳

1. Xcode 目標選 **Any iOS Device (arm64)**。
2. 選單 **Product → Archive**。
3. 完成後在 Organizer 按 **Distribute App → App Store Connect → Upload**。

## 3. App Store Connect

到 [App Store Connect](https://appstoreconnect.apple.com/) → **我的 App** → **＋ 新增 App**：

| 欄位 | 內容 |
|---|---|
| 平台 | iOS |
| 名稱 | Snapidian |
| 主要語言 | 繁體中文 |
| 套件 ID | `org.onepointzeroone.snapidian`（和 Xcode 一致） |
| SKU | `snapidian-ios` |

### App 資訊

| 欄位 | 內容 |
|---|---|
| 類別 | 主要：生產力工具；次要：工具程式 |
| 隱私權政策網址 | https://snapidian.onepointzeroone.org/privacy/ |
| 支援網址 | https://github.com/101academyforyou/Snapidian/issues |
| 行銷網址 | https://snapidian.onepointzeroone.org/ |
| 價格 | 免費 |
| 年齡分級 | 問卷全部選「無」→ 4+ |

### 商店文字（繁體中文）

**副標題**（30 字內）
```
截圖一鍵整理成 Markdown 筆記
```

**宣傳文字**
```
截圖不再沉睡在相簿裡。自動辨識文字、AI 整理標題與摘要，存成你筆記庫裡的 Markdown 筆記。
```

**描述**
```
Snapidian 把手機截圖變成第二大腦的一部分。

・自動辨識截圖文字：使用 Apple 在 iPhone 上執行的文字辨識，支援繁體中文、簡體中文、日文與英文，截圖不會上傳。
・AI 整理：用 iPhone 內建的 Apple Intelligence 自動寫好標題、摘要與標籤；也可以改用自己的 Claude、ChatGPT 或 Gemini API 金鑰。
・存成 Markdown 筆記：圖片直接存在筆記檔案裡，透過分享選單存到「檔案」或你的筆記 App。
・記錄截圖時間：自動讀取截圖的拍攝時間寫進筆記。
・隱私優先：沒有帳號、沒有伺服器，所有資料只存在你的 iPhone。

Capture Anything. Save to Your Knowledge.
```

**關鍵字**（100 字元內，逗號分隔）
```
截圖,筆記,Markdown,OCR,文字辨識,第二大腦,知識管理,AI,摘要,整理
```

### 英文（English）— 在「App 資訊」新增語言

**Subtitle**
```
Screenshots to Markdown notes
```

**Promotional Text**
```
Stop letting screenshots rot in your camera roll. Recognize text, let AI write a title and summary, and save them as Markdown notes.
```

**Description**
```
Snapidian makes your phone screenshots part of your second brain.

• Text recognition on device: Apple’s on-device text recognition reads Traditional and Simplified Chinese, Japanese and English. Screenshots are never uploaded.
• AI organize: Apple Intelligence on your iPhone writes a title, summary and tags. Or use your own Claude, ChatGPT or Gemini API key.
• Markdown notes: the image is stored inside the note; save it to Files or your notes app from the share sheet.
• Capture time: reads when the screenshot was taken and adds it to the note.
• Privacy first: no accounts, no servers — everything stays on your iPhone.

Capture Anything. Save to Your Knowledge.
```

**Keywords**
```
screenshot,notes,markdown,ocr,text recognition,second brain,knowledge,ai,summary,organize
```

> 不要在關鍵字、名稱或描述使用其他公司的 App 名稱或商標（審查準則 2.3.7），會被退回。

### 截圖

已準備好 6.9 吋 iPhone 截圖（1320 × 2868）：`appstore/screenshots/`

- 繁體中文：`zh-1-list.png`、`zh-2-note.png`、`zh-3-ai.png`
- 英文：`en-1-list.png`、`en-2-note.png`、`en-3-ai.png`

這些是用模擬資料產生的。建議之後換成你在 iPhone 上實際使用的截圖，更有說服力。

### App 隱私權（App Privacy）

選 **「不收集資料（Data Not Collected）」**。理由：開發者沒有伺服器、不收集任何資料；
只有使用者自己選擇雲端 AI 並同意後，App 才會用使用者自己的 API 金鑰，直接把那張截圖傳給該 AI 服務。

### 提供給審查人員的備註（App Review Information → Notes）

```
Snapidian needs no account or login.

How to test:
1. Tap "Add screenshots" and pick any screenshot from Photos.
2. Text in the image is recognized automatically on device with Apple's Vision framework.
3. Tap "✦ AI organize": on devices with Apple Intelligence (iOS 26+), a title, summary and tags are written on device with Apple's Foundation Models framework.
4. Tap "Download Markdown" to save the note through the iOS share sheet (e.g. Save to Files).

Cloud AI (Claude, ChatGPT, Gemini) is optional and uses the user's own API key. Before a screenshot is sent to a third-party AI for the first time, the app explains what is sent and asks for permission. No data is collected by the developer.
```

### 送審

1. 在「App Store」分頁的 1.0 版本：貼上文字、上傳截圖。
2. **建置版本**：選剛上傳的 Build（上傳後約 10–30 分鐘才會出現）。
3. 按 **新增以供審查** → **提交審查**。

---

## 審查可能遇到的問題

- **4.2 最低功能要求**（只是包網頁）：App 已加入 Apple Vision 文字辨識、Apple Intelligence、分享選單等原生功能，並把網站打包在 App 內。如果仍被退回，回覆時說明這些原生功能，或告訴 Claude 再加原生功能（例如從「照片」的分享選單直接匯入截圖的 Share Extension）。
- **5.1.2 第三方 AI**：已在第一次使用雲端 AI 前詢問同意，隱私權政策也有說明。
- **Apple Intelligence 無法使用**：審查用的裝置不支援時，App 仍可辨識文字與存檔；AI 會提示改選其他服務。
