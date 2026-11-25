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
      'md.ocr': '辨識文字'
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
      'md.ocr': 'Recognized text'
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
