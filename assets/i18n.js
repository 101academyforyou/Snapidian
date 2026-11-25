/* Snapidian i18n — shared by the website and the app (zh-Hant / en) */
(function (global) {
  const DICT = {
    zh: {
      // ---------- common ----------
      'meta.title': 'Snapidian — 讓截圖成為你的第二大腦',
      'brand.slogan': 'Capture Anything. Save to Your Knowledge.',
      'brand.tagline': '讓手機截圖成為 Obsidian 第二大腦的一部分',
      'lang.toggle': 'EN',
      'nav.features': '功能',
      'nav.how': '使用方式',
      'nav.faq': '常見問題',
      'nav.open': '開啟 App',

      // ---------- landing ----------
      'hero.badge': '免費 · 開源 · 資料只存在你的裝置',
      'hero.cta.open': '立即開啟 App',
      'hero.cta.install': '安裝到手機',
      'hero.note': '支援 iOS、Android 與桌面瀏覽器，免帳號、免伺服器。',
      'mock.title': '會議白板截圖',
      'mock.tags': '#meeting #idea',
      'mock.saved': '已存入 Obsidian',

      'features.title': '截圖不再沉睡在相簿裡',
      'features.sub': '從擷取到整理，一氣呵成，直接寫進你的 Obsidian Vault。',
      'f1.title': '一鍵分享匯入',
      'f1.desc': '在 Android 相簿直接「分享」到 Snapidian，或貼上、拖放、批次選取截圖。',
      'f2.title': 'OCR 文字辨識',
      'f2.desc': '支援繁中、簡中與英文辨識，截圖裡的文字也能被 Obsidian 全文搜尋。',
      'f3.title': '原生 Markdown 筆記',
      'f3.desc': '自動產生 YAML frontmatter、標籤、![[內嵌圖片]]，完全符合 Obsidian 格式。',
      'f4.title': '直接寫入 Vault',
      'f4.desc': '桌面版可連結 Vault 資料夾直接寫入；手機可分享給 Obsidian 或下載 ZIP。',
      'f5.title': '隱私優先',
      'f5.desc': '所有截圖與筆記都存在你的裝置，不上傳任何伺服器。',
      'f6.title': '可安裝、可離線',
      'f6.desc': 'PWA 技術，加入主畫面後就像原生 App，離線也能整理截圖。',

      'how.title': '三步驟，把截圖變知識',
      'how1.title': '擷取',
      'how1.desc': '截圖後分享到 Snapidian，或在 App 內選取圖片。',
      'how2.title': '整理',
      'how2.desc': '加上標題、想法與標籤，一鍵 OCR 擷取文字。',
      'how3.title': '存入',
      'how3.desc': '儲存到 Obsidian，筆記與附件自動放到正確資料夾。',

      'preview.title': '產生的筆記長這樣',
      'preview.sub': '乾淨、可搜尋、可連結 —— 就是一般的 Obsidian 筆記。',

      'install.title': '安裝 Snapidian App',
      'install.ios.title': 'iPhone / iPad',
      'install.ios.desc': '用 Safari 開啟 App → 點「分享」→「加入主畫面」。',
      'install.android.title': 'Android',
      'install.android.desc': '用 Chrome 開啟 App → 點「安裝應用程式」。安裝後即可從相簿分享截圖。',
      'install.desktop.title': '桌面電腦',
      'install.desktop.desc': '用 Chrome / Edge 開啟，可直接連結 Vault 資料夾寫入筆記。',

      'faq.title': '常見問題',
      'faq1.q': '需要註冊帳號或付費嗎？',
      'faq1.a': '不需要。Snapidian 完全免費，沒有帳號系統，所有資料都留在你的裝置上。',
      'faq2.q': '截圖要怎麼進到 Obsidian？',
      'faq2.a': '桌面版 Chrome / Edge 可以連結你的 Vault 資料夾直接寫入；手機上可透過系統分享傳給 Obsidian，或下載包含筆記與圖片的 ZIP 解壓到 Vault。',
      'faq3.q': 'OCR 會把圖片上傳嗎？',
      'faq3.a': '不會。OCR 在瀏覽器本機執行，第一次使用時只會下載辨識模型。',
      'faq4.q': '筆記格式可以自訂嗎？',
      'faq4.a': '可以設定筆記資料夾、附件資料夾、檔名前綴、預設標籤與是否附上 OCR 文字。',

      'cta.title': '現在就開始建立你的視覺第二大腦',
      'footer.made': '為 Obsidian 使用者打造。Obsidian 為 Dynalist Inc. 之商標，本專案與其無關。',

      // ---------- app ----------
      'app.title': 'Snapidian App',
      'app.back': '官網',
      'app.settings': '設定',
      'app.drop.title': '加入截圖',
      'app.drop.desc': '點擊選取、拖放或直接貼上 (Ctrl/⌘+V)',
      'app.camera': '拍照',
      'app.empty': '還沒有截圖。加入第一張，開始建立你的第二大腦吧！',
      'app.count': '{n} 張截圖 · {p} 張待存入',
      'app.saveAll': '全部存入 Obsidian',
      'app.clearDone': '清除已存入',
      'app.field.title': '標題',
      'app.field.note': '想法 / 筆記',
      'app.field.tags': '標籤（以空白或逗號分隔）',
      'app.field.ocr': 'OCR 文字',
      'app.ocr': '辨識文字',
      'app.ocr.running': '辨識中… {p}%',
      'app.ocr.done': 'OCR 完成',
      'app.ocr.fail': 'OCR 失敗，請檢查網路後再試',
      'app.save': '存入 Obsidian',
      'app.copy': '複製 Markdown',
      'app.delete': '刪除',
      'app.confirmDelete': '確定要刪除這張截圖嗎？',
      'app.status.pending': '待存入',
      'app.status.saved': '已存入',
      'app.copied': '已複製 Markdown',
      'app.added': '已加入 {n} 張截圖',
      'app.shared': '已從分享匯入 {n} 張截圖',
      'app.saved.folder': '已寫入 Vault：{f}',
      'app.saved.share': '已傳送到分享選單',
      'app.saved.zip': '已下載 ZIP，請解壓縮到 Vault',
      'app.openObsidian': '在 Obsidian 開啟',
      'app.error': '發生錯誤：{e}',
      'app.untitled': '截圖',
      'app.install': '安裝 App',

      'set.title': '設定',
      'set.vault': 'Vault 名稱',
      'set.vault.hint': '用於 obsidian:// 開啟連結，需與 Obsidian 中的 Vault 名稱相同',
      'set.notes': '筆記資料夾',
      'set.attach': '附件資料夾',
      'set.prefix': '檔名前綴',
      'set.tags': '預設標籤',
      'set.method': '儲存方式',
      'set.method.auto': '自動（建議）',
      'set.method.folder': '直接寫入 Vault 資料夾',
      'set.method.share': '系統分享（傳給 Obsidian）',
      'set.method.zip': '下載 ZIP',
      'set.connect': '連結 Vault 資料夾',
      'set.connected': '已連結：{n}',
      'set.notConnected': '尚未連結',
      'set.noFs': '此瀏覽器不支援直接寫入資料夾（請使用桌面版 Chrome / Edge）',
      'set.includeOcr': '筆記中附上 OCR 文字',
      'set.ocrLang': 'OCR 語言',
      'set.lang': '介面語言',
      'set.done': '完成',
      'set.saved': '設定已儲存',

      'md.note': '筆記',
      'md.ocr': '辨識文字',

      // ---------- iPhone guide ----------
      'nav.iphone': 'iPhone 一鍵截圖',
      'ip.meta': 'iPhone 一鍵截圖存成 Obsidian 筆記 — Snapidian',
      'ip.badge': 'iPhone 教學 · 約 5 分鐘設定',
      'ip.title': '輕敲手機背面兩下，截圖直接變成 Obsidian 筆記',
      'ip.sub': '用 iPhone 內建的「捷徑」與「背面輕點」，截圖、辨識文字、存成 Markdown 筆記一次完成，不用打開任何 App。',
      'ip.cta': '開始設定',
      'ip.teaser.title': 'iPhone 一鍵截圖存入 Obsidian',
      'ip.teaser.desc': '輕敲手機背面兩下，自動截圖、辨識文字，存成 Markdown 筆記。',
      'ip.teaser.link': '看設定教學 →',
      'ip.flow1': '輕敲背面兩下',
      'ip.flow2': '截圖＋辨識文字',
      'ip.flow3': '存成 Markdown',
      'ip.flow4': '出現在 Obsidian',

      'ip.why.title': '為什麼要用捷徑？',
      'ip.why.desc': 'iOS 不允許任何 App 偵測「使用者剛截圖」，所以一般截圖鍵無法自動觸發。改用捷徑的「拍攝螢幕快照」動作，再綁定背面輕點，就能做到一個動作完成截圖與存檔。',

      'ip.need.title': '準備工作',
      'ip.need1': 'iPhone XS 以上、iOS 16 以上（「從影像中擷取文字」與背面輕點都需要）',
      'ip.need2': '已安裝 Obsidian，並建立好 Vault（放在「我的 iPhone」或 iCloud Drive 都可以）',
      'ip.need3': '已安裝 Apple 的「捷徑」App（iPhone 內建，若刪除可從 App Store 重新下載）',

      'ip.s1.title': '建立新捷徑',
      'ip.s1.desc': '打開「捷徑」App → 右上角「＋」→ 把捷徑命名為「Snapidian 截圖」。',
      'ip.s2.title': '加入以下動作',
      'ip.s2.desc': '點「加入動作」，用搜尋找到下列動作，依序加入（灰色小字是英文名稱，iPhone 是英文介面時用它搜尋）：',
      'ip.a1': '拍攝螢幕快照',
      'ip.a1.d': '截下目前畫面。',
      'ip.a2': '從影像中擷取文字',
      'ip.a2.d': '輸入選「螢幕快照」，辨識截圖裡的文字（支援中文）。',
      'ip.a3': '格式化日期',
      'ip.a3.d': '日期選「目前日期」，格式選「自訂」，填入 yyyyMMdd-HHmmss。',
      'ip.a4': '設定名稱',
      'ip.a4.d': '對象選「螢幕快照」，名稱填 Snap-［格式化的日期］.png。',
      'ip.a5': '儲存檔案',
      'ip.a5.d': '關掉「詢問儲存位置」，路徑選 Vault 裡的 Snapidian/attachments 資料夾。',
      'ip.a6': '文字',
      'ip.a6.d': '貼上下方的筆記範本，把［ ］換成前面動作的「魔術變數」。',
      'ip.a7': '設定名稱',
      'ip.a7.d': '對象選上一步的「文字」，名稱填 Snap-［格式化的日期］.md。',
      'ip.a8': '儲存檔案',
      'ip.a8.d': '關掉「詢問儲存位置」，路徑選 Vault 裡的 Snapidian 資料夾。',
      'ip.tpl.title': '筆記範本',
      'ip.tpl.copy': '複製範本',
      'ip.tpl.copied': '已複製',
      'ip.tpl.hint': '在捷徑的「文字」動作裡，點一下要替換的位置，再從鍵盤上方選對應的變數。',

      'ip.s3.title': '綁定背面輕點',
      'ip.s3.desc': '「設定」→「輔助使用」→「觸控」→「背面輕點」→「點兩下」→ 選「Snapidian 截圖」。',
      'ip.s3.alt': 'iPhone 15 Pro 以後的機型，也可以在「設定」→「動作按鈕」→「捷徑」綁定。',
      'ip.s4.title': '試一次',
      'ip.s4.desc': '隨便打開一個畫面，輕敲手機背面兩下。第一次會詢問是否允許存取 Obsidian 資料夾，選「一律允許」。打開 Obsidian，Snapidian 資料夾裡就會出現新筆記。',

      'ip.opt.title': '進階：截圖當下順手寫一句想法',
      'ip.opt.desc': '在最前面加一個「詢問輸入」動作（提示填「想法或標籤？」），再把它的結果放進範本的「筆記」區塊。截圖後會跳出輸入框，打完再存。',

      'ip.faq.title': '常見問題',
      'ip.q1': '截圖裡會出現捷徑的畫面嗎？',
      'ip.a1x': '不會。「拍攝螢幕快照」截的是你輕敲時正在看的畫面。',
      'ip.q2': '找不到 Obsidian 的資料夾？',
      'ip.a2x': '先打開一次 Obsidian 讓 Vault 建立好。Vault 在「我的 iPhone」→「Obsidian」→ Vault 名稱，或「iCloud Drive」→「Obsidian」→ Vault 名稱。',
      'ip.q3': '圖片沒顯示在筆記裡？',
      'ip.a3x': '確認兩個「設定名稱」用的是同一個「格式化的日期」變數，讓圖片檔名和範本裡的 ![[ ]] 完全一致。Obsidian 會在整個 Vault 找同名圖片，不用寫完整路徑。',
      'ip.q4': '截圖還會留在相簿嗎？',
      'ip.a4x': '不會。捷徑截的圖只會存進 Vault，不會出現在相簿。',
      'ip.q5': '一般截圖鍵截的圖可以處理嗎？',
      'ip.a5x': '可以。用 Snapidian App 選取這些截圖，再一起整理、存入 Obsidian。',

      'ip.back': '← 回到首頁',
      'ip.toApp': '改用 Snapidian App 整理既有截圖'
    },
    en: {
      'meta.title': 'Snapidian — Turn screenshots into your second brain',
      'brand.slogan': 'Capture Anything. Save to Your Knowledge.',
      'brand.tagline': 'Make your phone screenshots part of your Obsidian second brain',
      'lang.toggle': '中文',
      'nav.features': 'Features',
      'nav.how': 'How it works',
      'nav.faq': 'FAQ',
      'nav.open': 'Open App',

      'hero.badge': 'Free · Open source · Your data stays on your device',
      'hero.cta.open': 'Open the App',
      'hero.cta.install': 'Install on your phone',
      'hero.note': 'Works on iOS, Android and desktop browsers. No account, no server.',
      'mock.title': 'Whiteboard from meeting',
      'mock.tags': '#meeting #idea',
      'mock.saved': 'Saved to Obsidian',

      'features.title': 'Stop letting screenshots rot in your camera roll',
      'features.sub': 'From capture to organized note in one flow — written straight into your Obsidian vault.',
      'f1.title': 'Share to import',
      'f1.desc': 'Share straight from your Android gallery, or paste, drag & drop and batch-select screenshots.',
      'f2.title': 'OCR text recognition',
      'f2.desc': 'Traditional Chinese, Simplified Chinese and English — make text in images searchable in Obsidian.',
      'f3.title': 'Native Markdown notes',
      'f3.desc': 'YAML frontmatter, tags and ![[embedded images]] generated in pure Obsidian format.',
      'f4.title': 'Write to your vault',
      'f4.desc': 'On desktop, connect your vault folder and write directly. On mobile, share to Obsidian or download a ZIP.',
      'f5.title': 'Privacy first',
      'f5.desc': 'Screenshots and notes live on your device. Nothing is uploaded anywhere.',
      'f6.title': 'Installable & offline',
      'f6.desc': 'A PWA that feels native on your home screen and works offline.',

      'how.title': 'Three steps from screenshot to knowledge',
      'how1.title': 'Capture',
      'how1.desc': 'Share a screenshot to Snapidian, or pick images inside the app.',
      'how2.title': 'Organize',
      'how2.desc': 'Add a title, your thoughts and tags. Extract text with one-tap OCR.',
      'how3.title': 'Save',
      'how3.desc': 'Save to Obsidian — notes and attachments land in the right folders.',

      'preview.title': 'What the generated note looks like',
      'preview.sub': 'Clean, searchable, linkable — just a regular Obsidian note.',

      'install.title': 'Install the Snapidian App',
      'install.ios.title': 'iPhone / iPad',
      'install.ios.desc': 'Open the app in Safari → tap Share → "Add to Home Screen".',
      'install.android.title': 'Android',
      'install.android.desc': 'Open the app in Chrome → tap "Install app". Then share screenshots right from your gallery.',
      'install.desktop.title': 'Desktop',
      'install.desktop.desc': 'Open in Chrome / Edge and connect your vault folder to write notes directly.',

      'faq.title': 'FAQ',
      'faq1.q': 'Do I need an account or to pay?',
      'faq1.a': 'No. Snapidian is completely free, has no accounts, and keeps all data on your device.',
      'faq2.q': 'How do screenshots get into Obsidian?',
      'faq2.a': 'On desktop Chrome / Edge you can connect your vault folder and write directly. On mobile, use the system share sheet to send to Obsidian, or download a ZIP with the note and image and unzip it into your vault.',
      'faq3.q': 'Does OCR upload my images?',
      'faq3.a': 'No. OCR runs locally in your browser; only the recognition model is downloaded on first use.',
      'faq4.q': 'Can I customize the note format?',
      'faq4.a': 'Yes — notes folder, attachments folder, filename prefix, default tags and whether to include OCR text.',

      'cta.title': 'Start building your visual second brain today',
      'footer.made': 'Built for Obsidian users. Obsidian is a trademark of Dynalist Inc.; this project is not affiliated.',

      'app.title': 'Snapidian App',
      'app.back': 'Website',
      'app.settings': 'Settings',
      'app.drop.title': 'Add screenshots',
      'app.drop.desc': 'Tap to choose, drag & drop, or paste (Ctrl/⌘+V)',
      'app.camera': 'Camera',
      'app.empty': 'No screenshots yet. Add your first one and start building your second brain!',
      'app.count': '{n} screenshots · {p} pending',
      'app.saveAll': 'Save all to Obsidian',
      'app.clearDone': 'Clear saved',
      'app.field.title': 'Title',
      'app.field.note': 'Thoughts / notes',
      'app.field.tags': 'Tags (space or comma separated)',
      'app.field.ocr': 'OCR text',
      'app.ocr': 'Recognize text',
      'app.ocr.running': 'Recognizing… {p}%',
      'app.ocr.done': 'OCR finished',
      'app.ocr.fail': 'OCR failed — check your connection and try again',
      'app.save': 'Save to Obsidian',
      'app.copy': 'Copy Markdown',
      'app.delete': 'Delete',
      'app.confirmDelete': 'Delete this screenshot?',
      'app.status.pending': 'Pending',
      'app.status.saved': 'Saved',
      'app.copied': 'Markdown copied',
      'app.added': 'Added {n} screenshot(s)',
      'app.shared': 'Imported {n} screenshot(s) from share',
      'app.saved.folder': 'Written to vault: {f}',
      'app.saved.share': 'Sent to the share sheet',
      'app.saved.zip': 'ZIP downloaded — unzip it into your vault',
      'app.openObsidian': 'Open in Obsidian',
      'app.error': 'Error: {e}',
      'app.untitled': 'Screenshot',
      'app.install': 'Install app',

      'set.title': 'Settings',
      'set.vault': 'Vault name',
      'set.vault.hint': 'Used for obsidian:// links — must match your vault name in Obsidian',
      'set.notes': 'Notes folder',
      'set.attach': 'Attachments folder',
      'set.prefix': 'Filename prefix',
      'set.tags': 'Default tags',
      'set.method': 'Save method',
      'set.method.auto': 'Automatic (recommended)',
      'set.method.folder': 'Write to vault folder',
      'set.method.share': 'System share (send to Obsidian)',
      'set.method.zip': 'Download ZIP',
      'set.connect': 'Connect vault folder',
      'set.connected': 'Connected: {n}',
      'set.notConnected': 'Not connected',
      'set.noFs': 'This browser cannot write to folders (use desktop Chrome / Edge)',
      'set.includeOcr': 'Include OCR text in notes',
      'set.ocrLang': 'OCR languages',
      'set.lang': 'Interface language',
      'set.done': 'Done',
      'set.saved': 'Settings saved',

      'md.note': 'Notes',
      'md.ocr': 'Recognized text',

      'nav.iphone': 'iPhone one-tap',
      'ip.meta': 'Save iPhone screenshots to Obsidian with one tap — Snapidian',
      'ip.badge': 'iPhone guide · about 5 minutes',
      'ip.title': 'Double-tap the back of your iPhone. Your screenshot becomes an Obsidian note.',
      'ip.sub': 'Using the built-in Shortcuts app and Back Tap: screenshot, recognize text and save a Markdown note in one go — without opening any app.',
      'ip.cta': 'Start setup',
      'ip.teaser.title': 'One-tap iPhone screenshots into Obsidian',
      'ip.teaser.desc': 'Double-tap the back of your iPhone to screenshot, recognize text and save a Markdown note.',
      'ip.teaser.link': 'See the setup guide →',
      'ip.flow1': 'Double-tap the back',
      'ip.flow2': 'Screenshot + text',
      'ip.flow3': 'Saved as Markdown',
      'ip.flow4': 'Shows up in Obsidian',

      'ip.why.title': 'Why a shortcut?',
      'ip.why.desc': 'iOS does not let any app detect that you just took a screenshot, so the regular screenshot buttons cannot trigger anything. The Shortcuts “Take Screenshot” action bound to Back Tap does the capture and the save in one gesture.',

      'ip.need.title': 'What you need',
      'ip.need1': 'iPhone XS or later on iOS 16+ (needed for “Extract Text from Image” and Back Tap)',
      'ip.need2': 'Obsidian installed with a vault (On My iPhone or iCloud Drive both work)',
      'ip.need3': 'Apple’s Shortcuts app (built in; reinstall from the App Store if you removed it)',

      'ip.s1.title': 'Create a new shortcut',
      'ip.s1.desc': 'Open Shortcuts → tap “+” in the top-right → name it “Snapidian Screenshot”.',
      'ip.s2.title': 'Add these actions',
      'ip.s2.desc': 'Tap “Add Action”, search for each action below and add them in order:',
      'ip.a1': 'Take Screenshot',
      'ip.a1.d': 'Captures whatever is on screen.',
      'ip.a2': 'Extract Text from Image',
      'ip.a2.d': 'Set the input to “Screenshot” to recognize its text (Chinese supported).',
      'ip.a3': 'Format Date',
      'ip.a3.d': 'Date: “Current Date”, format: “Custom”, enter yyyyMMdd-HHmmss.',
      'ip.a4': 'Set Name',
      'ip.a4.d': 'Target: “Screenshot”, name: Snap-[Formatted Date].png.',
      'ip.a5': 'Save File',
      'ip.a5.d': 'Turn off “Ask Where to Save”, pick the Snapidian/attachments folder in your vault.',
      'ip.a6': 'Text',
      'ip.a6.d': 'Paste the note template below and replace each [ ] with the matching magic variable.',
      'ip.a7': 'Set Name',
      'ip.a7.d': 'Target: the “Text” from the previous step, name: Snap-[Formatted Date].md.',
      'ip.a8': 'Save File',
      'ip.a8.d': 'Turn off “Ask Where to Save”, pick the Snapidian folder in your vault.',
      'ip.tpl.title': 'Note template',
      'ip.tpl.copy': 'Copy template',
      'ip.tpl.copied': 'Copied',
      'ip.tpl.hint': 'In the Text action, tap where a value goes, then pick the variable from the bar above the keyboard.',

      'ip.s3.title': 'Bind it to Back Tap',
      'ip.s3.desc': 'Settings → Accessibility → Touch → Back Tap → Double Tap → choose “Snapidian Screenshot”.',
      'ip.s3.alt': 'On iPhone 15 Pro and later you can also use Settings → Action Button → Shortcut.',
      'ip.s4.title': 'Try it',
      'ip.s4.desc': 'Open any screen and double-tap the back of your phone. The first time, iOS asks to access your Obsidian folder — choose “Always Allow”. Open Obsidian and the new note is in the Snapidian folder.',

      'ip.opt.title': 'Bonus: add a thought while you capture',
      'ip.opt.desc': 'Add an “Ask for Input” action at the very top (prompt: “Thought or tags?”) and put its result in the template’s Notes section. After the screenshot an input box pops up; type and it saves.',

      'ip.faq.title': 'FAQ',
      'ip.q1': 'Will the shortcut itself show up in the screenshot?',
      'ip.a1x': 'No. “Take Screenshot” captures the screen you were looking at when you tapped.',
      'ip.q2': 'Can’t find the Obsidian folder?',
      'ip.a2x': 'Open Obsidian once so the vault exists. It lives under On My iPhone → Obsidian → your vault, or iCloud Drive → Obsidian → your vault.',
      'ip.q3': 'The image doesn’t show in the note?',
      'ip.a3x': 'Make sure both Set Name actions use the same Formatted Date variable, so the image filename matches the ![[ ]] in the template exactly. Obsidian finds images by name anywhere in the vault, so no full path is needed.',
      'ip.q4': 'Does the screenshot also go to my Photos?',
      'ip.a4x': 'No. Screenshots taken by the shortcut are saved only to your vault.',
      'ip.q5': 'What about screenshots taken with the buttons?',
      'ip.a5x': 'Pick them in the Snapidian App, organize them together and save them to Obsidian.',

      'ip.back': '← Back to home',
      'ip.toApp': 'Use the Snapidian App for existing screenshots'
    }
  };

  const KEY = 'snapidian.lang';
  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  let lang = detect();
  const listeners = [];

  function t(key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? key;
    if (vars) for (const k in vars) s = s.replaceAll('{' + k + '}', vars[k]);
    return s;
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
    const titleKey = document.documentElement.dataset.titleKey;
    if (titleKey) document.title = t(titleKey);
  }

  function setLang(l) {
    lang = l === 'zh' ? 'zh' : 'en';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    apply();
    listeners.forEach(fn => fn(lang));
  }

  global.I18N = {
    t, apply, setLang,
    get lang() { return lang; },
    toggle() { setLang(lang === 'zh' ? 'en' : 'zh'); },
    onChange(fn) { listeners.push(fn); }
  };
})(window);
