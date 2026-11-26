/* Snapidian App */
(() => {
  // A translation file older than this script (a cached copy) lacks newer strings. Reload once to get
  // matching files; the sessionStorage flag keeps this from ever looping.
  if (I18N.t('app.ocr.retry') === 'app.ocr.retry') {
    try {
      if (!sessionStorage.getItem('snapidian.i18nReload')) {
        sessionStorage.setItem('snapidian.i18nReload', '1');
        location.reload();
        return;
      }
    } catch (e) { /* storage blocked: carry on with what we have */ }
  }
  const { t } = I18N;
  // Translate, but if the translation file is an older cached copy that lacks a key, keep the
  // element's built-in text rather than showing the raw key (e.g. "app.downloadMd").
  function applyI18n(root) {
    const before = new Map();
    (root || document).querySelectorAll('[data-i18n]').forEach(el => before.set(el, el.textContent));
    I18N.apply(root);
    before.forEach((text, el) => { if (el.textContent === el.dataset.i18n && text.trim()) el.textContent = text; });
  }
  const $ = s => document.querySelector(s);

  // Bump on every release so users (and support) can tell which version is running.
  const APP_VERSION = '2026.11.26-28';

  // ---------------- settings ----------------
  const DEFAULTS = {
    method: 'auto', vault: '', notes: 'Snapidian', attach: 'Snapidian/attachments',
    prefix: 'Snap-', tags: 'snapidian', incOcr: true, ocrLang: 'chi_tra+eng',
    aiProvider: window.SnapNative && SnapNative.isNative ? 'apple' : 'chrome', models: {}, customBaseUrl: '', aiAuto: false, aiConsent: {}, settingsVersion: 3
  };
  const SKEY = 'snapidian.settings';
  let S = { ...DEFAULTS };
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(SKEY) || '{}') || {}; } catch (e) {}
  Object.assign(S, saved);
  // Settings saved before version 2 stored AI organize as 'off' only because that was the old default;
  // move them to the new default, Chrome's built-in AI, once. (Check what was saved, not the merged
  // defaults, which already carry version 2.)
  if (Object.keys(saved).length && !(saved.settingsVersion >= 2)) {
    if (S.aiProvider === 'off') S.aiProvider = 'chrome';
    S.settingsVersion = 2;
    try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
  }
  const saveSettings = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} };

  // API keys are kept apart from the other settings, one per service, and never leave this browser
  // except in requests to that service.
  const keyName = p => 'snapidian.key.' + p;
  const getKey = (p = S.aiProvider) => { try { return localStorage.getItem(keyName(p)) || ''; } catch (e) { return ''; } };
  const setKey = (p, v) => { try { v ? localStorage.setItem(keyName(p), v) : localStorage.removeItem(keyName(p)); } catch (e) {} };
  // Earlier versions kept a single Claude key and model.
  try {
    const old = localStorage.getItem('snapidian.claudeKey');
    if (old) { if (!getKey('claude')) setKey('claude', old); localStorage.removeItem('snapidian.claudeKey'); }
  } catch (e) {}
  S.models = { ...(S.models || {}) };
  if (S.claudeModel && !S.models.claude) S.models.claude = S.claudeModel;
  delete S.claudeModel;
  const modelFor = p => (S.models[p] || (SnapAI.PROVIDERS[p] && SnapAI.PROVIDERS[p].model) || '').trim();
  // On-device AI: Chrome's built-in AI in the browser, Apple Intelligence in the iOS app.
  const NATIVE = !!(window.SnapNative && SnapNative.isNative);
  const LOCAL_AI = NATIVE ? 'apple' : 'chrome';
  let appleState = 'unsupported';
  if (NATIVE) {
    if (S.aiProvider === 'chrome') S.aiProvider = 'apple';
    SnapNative.aiStatus().then(s => { appleState = s; render(); });
  }
  function providerReady(p) {
    if (p === 'apple') return NATIVE && appleState === 'available';
    if (p === 'chrome') return !NATIVE && SnapAI.hasChrome();
    if (p === 'custom') return !!(S.customBaseUrl && modelFor('custom'));
    if (SnapAI.PROVIDERS[p]) return !!getKey(p) && !!modelFor(p);
    return false;
  }
  // Chrome's built-in AI is the default: a chosen service that isn't set up yet (no key or model) falls back to
  // it rather than stopping. Only "off" turns AI organize off.
  function effectiveProvider() {
    if (providerReady(S.aiProvider)) return S.aiProvider;
    if (S.aiProvider !== 'off' && providerReady(LOCAL_AI)) return LOCAL_AI;
    return null;
  }
  const aiReady = () => !!effectiveProvider();

  // Version 3: everyone defaults to Chrome's built-in AI; keep another choice only if it is set up to run.
  if (Object.keys(saved).length && !(saved.settingsVersion >= 3)) {
    if (S.aiProvider === 'off' || (S.aiProvider !== 'chrome' && S.aiProvider !== 'apple' && !providerReady(S.aiProvider))) S.aiProvider = LOCAL_AI;
    S.settingsVersion = 3;
    try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {}
  }

  // Writing straight into a folder needs the File System Access API; the iOS app shares files instead.
  const hasFS = 'showDirectoryPicker' in window && !(window.SnapNative && SnapNative.isNative);
  let dirHandle = null;

  // ---------------- state ----------------
  let caps = [];
  const urls = new Map();
  const urlFor = c => { if (!urls.has(c.id)) urls.set(c.id, URL.createObjectURL(c.blob)); return urls.get(c.id); };

  // ---------------- helpers ----------------
  const pad = n => String(n).padStart(2, '0');
  const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const isoLocal = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const extOf = type => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/heic': 'heic', 'image/heif': 'heif', 'image/avif': 'avif' }[type] || 'png');
  const cleanFolder = p => (p || '').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
  const safeName = s => s.replace(/[\\/:*?"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  const parseTags = s => [...new Set((s || '').split(/[\s,，、#]+/).map(x => x.trim()).filter(Boolean))];
  const joinPath = (folder, file) => (cleanFolder(folder) ? cleanFolder(folder) + '/' : '') + file;

  function toast(msg, action) {
    const el = $('#toast');
    el.textContent = msg;
    if (action) {
      const a = document.createElement('a');
      a.href = action.href; a.textContent = action.label;
      el.append(a);
    }
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), action ? 6000 : 2600);
  }

  // File names follow when the screenshot was taken, when that is known.
  function names(c) {
    const d = new Date(c.takenAt || c.createdAt);
    const base = `${S.prefix}${stamp(d)}`;
    const img = `${base}.${extOf(c.type)}`;
    const note = (c.title.trim() ? safeName(c.title) : base) + '.md';
    return { img, note, imgPath: joinPath(S.attach, img), notePath: joinPath(S.notes, note) };
  }

  const fmtTime = ms => new Date(ms).toLocaleString(I18N.lang === 'zh' ? 'zh-TW' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });

  /** imgPath: vault path for an ![[embed]]; or pass { dataUri } to put the image inside the note itself. */
  function buildMarkdown(c, imgPath, { dataUri } = {}) {
    const d = new Date(c.createdAt);
    const tags = parseTags(S.tags + ' ' + c.tags);
    // Only what the user (or AI organize) wrote goes into the note body: no generated heading or time
    // line. Times stay in the frontmatter.
    const title = c.title.trim();
    const lines = ['---'];
    if (c.takenAt) lines.push(`taken: ${isoLocal(new Date(c.takenAt))}`);
    lines.push(`created: ${isoLocal(d)}`, 'source: Snapidian');
    if (tags.length) { lines.push('tags:'); tags.forEach(x => lines.push(`  - ${x}`)); }
    const embed = dataUri ? `![${title.replace(/[\[\]]/g, '')}](${dataUri})` : `![[${imgPath}]]`;
    lines.push('---', '');
    if (title) lines.push(`# ${title}`, '');
    lines.push(embed, '');
    if ((c.summary || '').trim()) lines.push(`## ${t('md.summary')}`, c.summary.trim(), '');
    if (c.note.trim()) lines.push(`## ${t('md.note')}`, c.note.trim(), '');
    if (S.incOcr && c.ocr.trim()) lines.push(`## ${t('md.ocr')}`, ...c.ocr.trim().split('\n').map(l => '> ' + l), '');
    return lines.join('\n');
  }

  // ---------------- data ----------------
  async function load() {
    caps = await SnapDB.all();
    render();
    // Screenshots added before capture times were recorded, or shared in by the service worker, get theirs now.
    const missing = caps.filter(c => c.takenAt === undefined);
    for (const c of missing) {
      const m = await SnapMeta.takenAt(c.blob);
      c.takenAt = m ? m.at : null; c.takenSource = m ? m.source : null;
      await SnapDB.put(c);
    }
    if (missing.length) render();
    // Screenshots that were never recognized (added before this was automatic, or shared in) get recognized now.
    for (const c of caps) if (!c.ocrState && !c.ocr.trim()) queueOcr(c);
  }

  async function addFiles(files, sharedMsg) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    const ids = [];
    for (const f of imgs) {
      const c = SnapDB.newCapture(f, f.name);
      const m = await SnapMeta.takenAt(f);
      c.takenAt = m ? m.at : null; c.takenSource = m ? m.source : null;
      ids.push(c.id);
      await SnapDB.put(c);
    }
    await load();
    toast(t(sharedMsg ? 'app.shared' : 'app.added', { n: imgs.length }));
    const added = () => caps.filter(c => ids.includes(c.id));
    // Recognize text first, so AI organize (if on) can use it too.
    const jobs = added().map(queueOcr);
    // AI organize (if on) waits for the text so it can use it too.
    if (S.aiAuto && aiReady()) { await Promise.all(jobs); await aiMany(added()); }
  }

  const persist = (() => {
    const timers = new Map();
    return c => {
      clearTimeout(timers.get(c.id));
      timers.set(c.id, setTimeout(() => SnapDB.put(c), 300));
    };
  })();

  // ---------------- render ----------------
  function render() {
    const list = $('#list');
    const tpl = $('#cardTpl');
    const keep = new Set(caps.map(c => c.id));
    for (const [id, u] of urls) if (!keep.has(id)) { URL.revokeObjectURL(u); urls.delete(id); }

    list.replaceChildren(...caps.map(c => {
      const el = tpl.content.firstElementChild.cloneNode(true);
      applyI18n(el);
      el.dataset.id = c.id;
      el.classList.toggle('saved', c.saved);
      el.querySelector('img').src = urlFor(c);
      el.querySelector('.status').textContent = t(c.saved ? 'app.status.saved' : 'app.status.pending');
      el.querySelector('.taken').textContent = c.takenAt ? t('app.taken', { d: fmtTime(c.takenAt) }) : t('app.addedAt', { d: fmtTime(c.createdAt) });
      const bind = (sel, key) => {
        const input = el.querySelector(sel);
        input.value = c[key] ?? '';
        input.addEventListener('input', () => { c[key] = input.value; persist(c); });
      };
      bind('.f-title', 'title'); bind('.f-note', 'note'); bind('.f-tags', 'tags'); bind('.f-ocr', 'ocr'); bind('.f-summary', 'summary');
      el.querySelector('.sum-box').hidden = !(c.summary || '').trim();
      // Always offered; if AI can't run yet, clicking explains what's missing and opens Settings.
      el.querySelector('.a-ai').hidden = false;
      if (aiRun.has(c.id)) queueMicrotask(() => paintAi(c.id));
      // Quick switch: shows the service AI organize will actually use (a chosen service that isn't set up yet
      // falls back to Chrome's built-in AI).
      if (NATIVE) { const o = el.querySelector('.a-ai-switch option[value=chrome]'); if (o) { o.value = 'apple'; o.textContent = 'Apple AI'; } }
      el.querySelector('.a-ai-switch').value = effectiveProvider() || (S.aiProvider === 'off' ? LOCAL_AI : S.aiProvider);
      queueMicrotask(() => paintOcr(c.id));
      if (c.ocr) el.querySelector('.ocr-box').open = true;
      return el;
    }));

    const pending = caps.filter(c => !c.saved).length;
    $('#empty').hidden = caps.length > 0;
    $('#bar').hidden = caps.length === 0;
    $('#count').textContent = t('app.count', { n: caps.length, p: pending });
    $('#saveAllBtn').disabled = pending === 0;
    $('#clearDoneBtn').hidden = pending === caps.length;
    $('#aiAllBtn').hidden = pending === 0;
    $('#aiTip').hidden = aiReady() || caps.length === 0;
    $('#autoAiRow').hidden = !aiReady();
    $('#autoAi').checked = !!S.aiAuto;
  }

  // ---------------- saving ----------------
  async function getDir(interactive) {
    if (!hasFS) return null;
    if (!dirHandle) dirHandle = await SnapDB.get('vaultDir').catch(() => null) || null;
    if (!dirHandle) return null;
    const opts = { mode: 'readwrite' };
    if ((await dirHandle.queryPermission(opts)) === 'granted') return dirHandle;
    if (interactive && (await dirHandle.requestPermission(opts)) === 'granted') return dirHandle;
    return null;
  }

  // A vault's top-level folder holds Obsidian's ".obsidian" settings folder.
  const isVaultRoot = dir => dir.getDirectoryHandle('.obsidian').then(() => true, () => false);

  async function connectVault() {
    try {
      dirHandle = await window.showDirectoryPicker({ id: 'snapidian-vault', mode: 'readwrite' });
      await SnapDB.set('vaultDir', dirHandle);
      if (await isVaultRoot(dirHandle)) {
        // Obsidian names a vault after its top-level folder.
        S.vault = dirHandle.name; saveSettings(); $('#s-vault').value = S.vault;
      } else {
        toast(t('app.notVaultRoot', { n: dirHandle.name }));
      }
      updateConn();
      updateDest();
    } catch (e) { if (e.name !== 'AbortError') toast(t('app.error', { e: e.message })); }
  }

  // Main-page line showing where notes go, with a button to pick or change the folder.
  function updateDest() {
    const inFolder = folderMode() && dirHandle;
    $('#destName').textContent = inFolder ? '📁 ' + dirHandle.name : t(NATIVE ? 'app.dest.share' : 'app.dest.downloads');
    const btn = $('#destBtn');
    btn.hidden = !hasFS;
    btn.textContent = t(inFolder ? 'app.dest.change' : 'app.dest.choose');
  }
  $('#destBtn').addEventListener('click', async () => {
    // Picking a folder here means "save there", so switch away from share / ZIP.
    if (S.method === 'share' || S.method === 'zip') { S.method = 'auto'; saveSettings(); }
    await connectVault();
  });

  async function writeFile(root, path, data) {
    const parts = path.split('/');
    const file = parts.pop();
    let dir = root;
    for (const p of parts) dir = await dir.getDirectoryHandle(p, { create: true });
    // never overwrite an existing note/image: add -1, -2 …
    const dot = file.lastIndexOf('.');
    let name = file, i = 1;
    while (await dir.getFileHandle(name).then(() => true, () => false)) name = `${file.slice(0, dot)}-${i++}${file.slice(dot)}`;
    const fh = await dir.getFileHandle(name, { create: true });
    const w = await fh.createWritable();
    await w.write(data); await w.close();
    return [...parts, name].join('/');
  }

  // "Download Markdown" / "Download all": into the folder chosen in Settings (or on the main page) when one is
  // connected and the save method allows it; otherwise to the browser's Downloads as self-contained Markdown.
  const folderMode = () => hasFS && (S.method === 'auto' || S.method === 'folder');
  async function exportNotes(list) {
    if (!list.length) return;
    if (folderMode() && dirHandle && await getDir(true)) return save(list);
    return downloadMarkdown(list);
  }

  async function resolveMethod() {
    let m = S.method;
    if (m === 'auto') {
      if (await getDir(true)) return 'folder';
      const probe = [new File([''], 'a.png', { type: 'image/png' }), new File([''], 'a.md', { type: 'text/markdown' })];
      return navigator.canShare && navigator.canShare({ files: probe }) ? 'share' : 'zip';
    }
    return m;
  }

  // Returns false if the user dismissed the iOS share sheet.
  async function downloadFile(blob, filename) {
    if (NATIVE) return SnapNative.shareFiles([{ name: filename, blob }]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  const toDataUri = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });

  // Self-contained Markdown: each note carries its image inside as a data URI. One note downloads as
  // a .md file; several go into one ZIP so the browser doesn't ask about a burst of downloads.
  async function downloadMarkdown(list) {
    if (!list.length) return;
    const notes = [];
    const used = new Set();
    for (const c of list) {
      let name = names(c).note, i = 1;
      while (used.has(name)) name = names(c).note.replace(/\.md$/, `-${i++}.md`);
      used.add(name);
      notes.push({ path: name, data: buildMarkdown(c, null, { dataUri: await toDataUri(c.blob) }) });
    }
    const ok = notes.length === 1
      ? await downloadFile(new Blob([notes[0].data], { type: 'text/markdown' }), notes[0].path)
      : await downloadFile(makeZip(notes), `Snapidian-${stamp(new Date())}.zip`);
    if (ok === false) return;
    for (const c of list) await markSaved(c);
    render();
    toast(notes.length === 1 ? t('app.mdDownloaded') : t('app.mdZipDownloaded', { n: notes.length }));
  }

  async function downloadZip(list) {
    const entries = [];
    for (const c of list) {
      const n = names(c);
      entries.push({ path: n.imgPath, data: new Uint8Array(await c.blob.arrayBuffer()) });
      entries.push({ path: n.notePath, data: buildMarkdown(c, n.imgPath) });
    }
    if (await downloadFile(makeZip(entries), list.length === 1 ? names(list[0]).note.replace(/\.md$/, '.zip') : `Snapidian-${stamp(new Date())}.zip`) === false) return;
    for (const c of list) await markSaved(c);
  }

  // Permission errors from the browser (vault folder access or the share sheet) all surface as this.
  const isPermissionError = e => e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');

  async function save(list) {
    if (!list.length) return;
    const method = await resolveMethod();

    if (method === 'folder') {
      if (!(await getDir(true))) { await connectVault(); if (!(await getDir(true))) return; }
      const dir = await getDir(true);
      let lastNote = '';
      try {
        for (const c of list) {
          const n = names(c);
          const imgPath = await writeFile(dir, n.imgPath, c.blob);
          lastNote = await writeFile(dir, n.notePath, buildMarkdown(c, imgPath));
          await markSaved(c);
        }
      } catch (e) {
        if (!isPermissionError(e)) throw e;
        // Access to the folder was revoked or it is a protected location: forget it and hand over a ZIP instead.
        dirHandle = null;
        await SnapDB.set('vaultDir', null).catch(() => {});
        await downloadZip(list.filter(c => !c.saved));
        toast(t('app.err.folderPerm'));
        render();
        return;
      }
      if (await isVaultRoot(dir)) {
        toast(t('app.saved.folder', { f: lastNote }), {
          label: t('app.openObsidian'),
          href: `obsidian://open?vault=${encodeURIComponent(dir.name)}&file=${encodeURIComponent(lastNote.replace(/\.md$/, ''))}`
        });
      } else {
        // Without the vault's top-level folder we can't know the vault name, so an obsidian:// link would fail.
        toast(t('app.saved.folder', { f: lastNote }) + ' ' + t('app.notVaultRootShort'));
      }
    } else if (method === 'share') {
      const files = [];
      for (const c of list) {
        const n = names(c);
        files.push(new File([c.blob], n.img, { type: c.type }));
        files.push(new File([buildMarkdown(c, n.img)], n.note, { type: 'text/markdown' }));
      }
      // Browsers only share some file types; Chrome, for example, rejects .md files with "Permission denied".
      if (!(navigator.canShare && navigator.canShare({ files }))) {
        await downloadZip(list);
        toast(t('app.err.shareType'));
      } else {
        try {
          await navigator.share({ files, title: list.length === 1 ? (list[0].title || 'Snapidian') : 'Snapidian' });
          for (const c of list) await markSaved(c);
          toast(t('app.saved.share'));
        } catch (e) {
          if (e.name === 'AbortError') return;
          if (!isPermissionError(e)) throw e;
          await downloadZip(list);
          toast(t('app.err.shareType'));
        }
      }
    } else {
      await downloadZip(list);
      toast(t('app.saved.zip'));
    }
    render();
  }

  async function markSaved(c) { c.saved = true; await SnapDB.put(c); }

  // ---------------- OCR ----------------
  let workerP = null, workerLang = null, ocrProgress = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src));
      document.head.append(s);
    });
  }
  // Tesseract reports some failures (e.g. its language data not downloading) only through errorHandler,
  // leaving the pending promise unsettled; ocrFail lets that error, or a time limit, end the current job.
  let ocrFail = null;
  const OCR_LIMIT_MS = 120000;
  async function getWorker() {
    if (workerP && workerLang === S.ocrLang) return workerP;
    if (workerP) workerP.then(w => w.terminate(), () => {});
    workerLang = S.ocrLang;
    workerP = (async () => {
      if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js');
      return Tesseract.createWorker(S.ocrLang.split('+'), 1, {
        logger: m => { if (m.status === 'recognizing text' && ocrProgress) ocrProgress(m.progress); },
        errorHandler: e => { if (ocrFail) ocrFail(e instanceof Error ? e : new Error(String(e))); }
      });
    })();
    workerP.catch(() => { workerP = null; });
    return workerP;
  }
  function resetWorker() {
    if (workerP) workerP.then(w => w.terminate(), () => {});
    workerP = null;
  }
  // Run one recognition step, failing on a worker error or after OCR_LIMIT_MS instead of hanging.
  function guarded(promise) {
    let timer;
    const failed = new Promise((_, reject) => {
      ocrFail = reject;
      timer = setTimeout(() => reject(new Error('text recognition timed out')), OCR_LIMIT_MS);
    });
    return Promise.race([promise, failed]).finally(() => { clearTimeout(timer); ocrFail = null; });
  }
  // Text recognition runs by itself, one screenshot at a time, right after screenshots are added.
  // Progress is tracked per capture because render() rebuilds the cards.
  const ocrBusy = new Map();    // id -> progress 0..1 while recognizing
  const ocrWaiting = new Map(); // id -> promise for queued or running captures
  let ocrChain = Promise.resolve();
  function paintOcr(id) {
    const el = document.querySelector(`.cap[data-id="${id}"] .ocr-status`);
    if (!el) return;
    const c = caps.find(x => x.id === id);
    el.replaceChildren();
    if (ocrBusy.has(id)) el.textContent = t('app.ocr.running', { p: Math.round(ocrBusy.get(id) * 100) });
    else if (ocrWaiting.has(id)) el.textContent = t('app.ocr.queued');
    else if (c && c.ocrState === 'failed') {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'link-btn a-ocr-retry'; b.textContent = t('app.ocr.retry');
      el.append(t('app.ocr.failedShort') + ' ', b);
    }
  }
  function queueOcr(c) {
    if (ocrWaiting.has(c.id)) return ocrWaiting.get(c.id);
    const job = ocrChain.then(() => recognize(c));
    ocrChain = job.catch(() => {});
    ocrWaiting.set(c.id, job);
    paintOcr(c.id);
    return job;
  }
  async function recognize(c) {
    ocrBusy.set(c.id, 0); paintOcr(c.id);
    ocrProgress = p => { ocrBusy.set(c.id, p); paintOcr(c.id); };
    try {
      let data;
      if (NATIVE && SnapNative.hasVision()) data = { text: await guarded(SnapNative.recognizeText(c.blob)) }; // Apple Vision, on device
      else {
        const w = await guarded(getWorker());
        ({ data } = await guarded(w.recognize(c.blob)));
      }
      // Tesseract inserts spaces between CJK characters — remove them
      const text = data.text.replace(/([　-鿿＀-￯])\s+(?=[　-鿿＀-￯])/g, '$1').trim();
      if (!c.ocr.trim()) c.ocr = text; // never overwrite text the user (or AI) already filled in
      c.ocrState = 'done';
      await SnapDB.put(c);
      return true;
    } catch (e) {
      console.error(e);
      resetWorker(); // a broken or stuck worker would fail every later job too
      c.ocrState = 'failed';
      await SnapDB.put(c).catch(() => {});
      return false;
    } finally {
      ocrProgress = null;
      ocrBusy.delete(c.id);
      ocrWaiting.delete(c.id);
      render();
    }
  }

  // ---------------- AI organize ----------------
  const aiBusy = new Set();
  function aiErrorText(e) {
    if (e instanceof SnapAI.AIError) {
      const key = 'app.ai.err.' + e.code;
      return e.code === 'api' ? t(key, { e: e.message }) : t(key);
    }
    return t('app.ai.err.api', { e: e.message || String(e) });
  }
  const notReadyReason = p => t(p === 'off' ? 'app.ai.err.off' : p === 'apple' ? 'app.ai.err.apple_unavailable' : p === 'chrome' ? 'app.ai.err.chrome_unsupported' : p === 'custom' && !S.customBaseUrl ? 'app.ai.err.no_base_url' : !modelFor(p) ? 'app.ai.err.no_model' : 'app.ai.err.no_key');
  // Take the user straight to where it's fixed, with the reason shown there (the dialog covers the toast).
  function askToSetUp(p) {
    // A cloud service only needs its key / model / URL: ask for just those in a small window.
    if (SnapAI.PROVIDERS[p]) { openAiSetup(p, effectiveProvider() === p ? null : S.aiProvider); return; }
    const why = notReadyReason(p);
    toast(why);
    if (!$('#settings').open) { $('#settingsBtn').click(); $('#s-aiNeed').textContent = why; $('#s-aiNeed').hidden = false; }
  }

  // Model picker: a list of known models for the service plus "Other (type a name)", which reveals a text
  // field. The text field always holds the chosen model, so callers read the model from it.
  const OTHER_MODEL = '__other';
  function fillModelPicker(sel, input, p, current) {
    const models = (SnapAI.PROVIDERS[p] || {}).models || [];
    const opts = models.map(m => Object.assign(document.createElement('option'), { value: m.id, textContent: `${m.name}（${t('set.ai.m.' + m.tag)}）` }));
    opts.push(Object.assign(document.createElement('option'), { value: OTHER_MODEL, textContent: t('set.ai.m.other') }));
    sel.replaceChildren(...opts);
    sel.hidden = !models.length; // "other service": the models differ per service, so only the text field
    const known = models.some(m => m.id === current);
    sel.value = known ? current : OTHER_MODEL;
    input.value = current || '';
    input.hidden = known && models.length > 0;
    sel.onchange = () => {
      if (sel.value === OTHER_MODEL) { input.hidden = false; input.value = ''; input.focus(); }
      else { input.hidden = true; input.value = sel.value; }
    };
  }

  // Small window to set up one AI service (key, model, and URL for "other service").
  const PROVIDER_NAMES = { claude: 'Claude', openai: 'ChatGPT', gemini: 'Gemini' };
  const providerName = p => PROVIDER_NAMES[p] || t('app.ai.switch.custom');
  let setupFor = null, setupRevertTo = null;
  function openAiSetup(p, revertTo) {
    const meta = SnapAI.PROVIDERS[p];
    setupFor = p; setupRevertTo = revertTo;
    $('#as-title').textContent = t('app.ai.setup.title', { n: providerName(p) });
    $('#as-hint').textContent = t('set.ai.hint.' + p);
    $('#as-error').hidden = true;
    $('#as-baseRow').hidden = !meta.baseUrl;
    $('#as-base').value = S.customBaseUrl || '';
    $('#as-key').value = getKey(p);
    $('#as-key').placeholder = meta.keyHint || t('set.ai.keyOptional');
    $('#as-keyHint').textContent = t('set.ai.keyHint.' + p);
    $('#as-model').value = modelFor(p);
    fillModelPicker($('#as-modelSel'), $('#as-model'), p, modelFor(p));
    $('#aiSetup').showModal();
    (meta.baseUrl && !S.customBaseUrl ? $('#as-base') : $('#as-key')).focus();
  }
  $('#as-ok').addEventListener('click', e => {
    const p = setupFor, meta = SnapAI.PROVIDERS[p];
    const key = $('#as-key').value.trim(), model = $('#as-model').value.trim(), base = $('#as-base').value.trim().replace(/\/+$/, '');
    const missing = meta.baseUrl && !base ? 'app.ai.err.no_base_url' : meta.key && !key ? 'app.ai.err.no_key' : !model ? 'app.ai.err.no_model' : null;
    if (missing) { e.preventDefault(); $('#as-error').textContent = t(missing + '.here'); $('#as-error').hidden = false; return; }
    setKey(p, key);
    S.models[p] = model;
    if (meta.baseUrl) S.customBaseUrl = base;
    S.aiProvider = p;
    setupRevertTo = null;
    saveSettings();
  });
  $('#aiSetup').addEventListener('close', () => {
    if ($('#aiSetup').returnValue === 'ok' && S.aiProvider === setupFor) toast(t('app.ai.switched', { n: providerName(setupFor) }));
    else if (setupRevertTo) { S.aiProvider = setupRevertTo; saveSettings(); } // cancelled: go back to the previous AI
    setupFor = setupRevertTo = null;
    render();
  });

  // Progress of AI organize, per capture (render() rebuilds the cards, so the button is looked up each time).
  // AI services don't report how far along an answer is, so the bar while analyzing is an estimate from typical
  // times that stops short of full; the model download, when there is one, shows Chrome's real percentage.
  const aiRun = new Map(); // id -> { prov, stage, start, dl }
  const TYPICAL_SECONDS = { chrome: 12 }; // cloud services: 6
  function paintAi(id) {
    const btn = document.querySelector(`.cap[data-id="${id}"] .a-ai`);
    const st = aiRun.get(id);
    if (!btn) return;
    if (!st) { btn.classList.remove('ai-busy'); btn.style.removeProperty('--p'); return; }
    btn.disabled = true;
    btn.classList.add('ai-busy');
    let text, p;
    if (st.stage === 'download') { text = t('app.ai.download', { p: Math.round(st.dl * 100) }); p = st.dl; }
    else if (st.stage === 'think') {
      // Estimated: approaches 95% and stays there until the answer arrives.
      const T = TYPICAL_SECONDS[st.prov] || 6;
      p = 0.1 + 0.85 * (1 - Math.exp(-(Date.now() - st.start) / 1000 / T));
      text = t('app.ai.stage.think', { n: st.prov === 'chrome' || st.prov === 'apple' ? 'AI' : providerName(st.prov), p: Math.floor(p * 100) });
    } else if (st.stage === 'done') { p = 1; text = t('app.ai.stage.done'); }
    else { p = 0.05; text = t(st.stage === 'prepare' ? 'app.ai.stage.prepare' : 'app.ai.running', { p: 5 }); }
    btn.textContent = text;
    btn.style.setProperty('--p', Math.round(p * 100) + '%');
  }
  setInterval(() => aiRun.forEach((_, id) => paintAi(id)), 500);

  async function runAi(c) {
    if (aiBusy.has(c.id)) return;
    if (!aiReady()) { askToSetUp(S.aiProvider); return false; }
    aiBusy.add(c.id);
    const prov = effectiveProvider();
    if (SnapAI.PROVIDERS[prov] && !(S.aiConsent || {})[prov]) {
      if (!confirm(t('app.ai.consent', { n: providerName(prov) }))) { aiBusy.delete(c.id); return false; }
      S.aiConsent = { ...(S.aiConsent || {}), [prov]: true };
      saveSettings();
    }
    if (prov === 'apple' && ocrWaiting.has(c.id)) await ocrWaiting.get(c.id);
    const st = { prov, stage: 'start', start: Date.now(), dl: 0 };
    aiRun.set(c.id, st);
    paintAi(c.id);
    const setStage = stage => { st.stage = stage; if (stage === 'think') st.start = Date.now(); paintAi(c.id); };
    try {
      const r = await SnapAI.organize(prov, {
        blob: c.blob, ocr: c.ocr, lang: I18N.lang, apiKey: getKey(prov), model: modelFor(prov), baseUrl: S.customBaseUrl,
        onStage: setStage,
        // Chrome reports download progress only when its model must be downloaded first.
        onProgress: p => { st.dl = p; setStage(p >= 1 ? 'start' : 'download'); }
      });
      if (!c.title.trim()) c.title = r.title;
      c.summary = r.summary;
      c.tags = parseTags(c.tags + ' ' + r.tags.join(' ')).join(' ');
      if (!c.ocr.trim() && r.text) c.ocr = r.text;
      await SnapDB.put(c);
      setStage('done'); // show 100% for a moment before the card refreshes
      await new Promise(res => setTimeout(res, 400));
      return true;
    } catch (e) {
      console.error(e);
      toast(aiErrorText(e));
      return false;
    } finally {
      aiBusy.delete(c.id);
      aiRun.delete(c.id);
      render();
    }
  }
  async function aiMany(list) {
    let ok = 0;
    for (const c of list) {
      if (await runAi(c)) { ok++; render(); } else break; // stop on the first error so a bad key isn't retried for every card
    }
    if (ok) toast(t('app.ai.done'));
  }

  // ---------------- events ----------------
  $('#fileInput').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => addFiles(e.dataTransfer.files));
  document.addEventListener('paste', e => {
    const files = [...(e.clipboardData?.items || [])].filter(i => i.kind === 'file').map(i => i.getAsFile()).filter(Boolean);
    if (files.length) { e.preventDefault(); addFiles(files); }
  });

  $('#list').addEventListener('click', async e => {
    const card = e.target.closest('.cap');
    if (!card) return;
    const c = caps.find(x => x.id === card.dataset.id);
    if (!c) return;
    if (e.target.closest('.a-save')) {
      try { await save([c]); } catch (err) { toast(t('app.error', { e: `${err.name}: ${err.message}` })); }
    } else if (e.target.closest('.a-ai')) {
      if (await runAi(c)) { render(); toast(t('app.ai.done')); }
    } else if (e.target.closest('.a-ocr-retry')) {
      e.preventDefault(); // the retry link sits inside <summary>; don't toggle the box
      c.ocrState = undefined; queueOcr(c);
    } else if (e.target.closest('.a-md')) {
      try { await exportNotes([c]); } catch (err) { toast(t('app.error', { e: `${err.name}: ${err.message}` })); }
    } else if (e.target.closest('.a-del')) {
      if (!confirm(t('app.confirmDelete'))) return;
      await SnapDB.del(c.id); await load();
    } else if (e.target.matches('.thumb img')) {
      const v = document.createElement('div');
      v.className = 'viewer';
      v.innerHTML = `<img alt="" src="${urlFor(c)}">`;
      v.addEventListener('click', () => v.remove());
      document.body.append(v);
    }
  });

  $('#saveAllBtn').addEventListener('click', async () => {
    try { await exportNotes(caps.filter(c => !c.saved)); } catch (err) { toast(t('app.error', { e: `${err.name}: ${err.message}` })); }
  });
  // Switching the AI service from a card applies to every card.
  $('#list').addEventListener('change', e => {
    const sel = e.target.closest('.a-ai-switch');
    if (!sel) return;
    const p = sel.value;
    if (!providerReady(p) && SnapAI.PROVIDERS[p]) { openAiSetup(p, S.aiProvider); return; }
    S.aiProvider = p;
    saveSettings();
    render();
    if (providerReady(p)) toast(t('app.ai.switched', { n: sel.options[sel.selectedIndex].textContent }));
    else askToSetUp(p);
  });
  $('#aiAllBtn').addEventListener('click', () => aiMany(caps.filter(c => !c.saved && !(c.summary || '').trim())));
  $('#clearAllBtn').addEventListener('click', async () => {
    if (!caps.length || !confirm(t('app.confirmClearAll', { n: caps.length }))) return;
    for (const c of caps) await SnapDB.del(c.id);
    await load();
    toast(t('app.clearedAll'));
  });
  $('#clearDoneBtn').addEventListener('click', async () => {
    for (const c of caps.filter(c => c.saved)) await SnapDB.del(c.id);
    await load();
  });

  // language
  $('#langBtn').addEventListener('click', () => I18N.toggle());
  I18N.onChange(() => { $('#s-lang').value = I18N.lang; render(); updateConn(); });

  // settings dialog
  const dlg = $('#settings');
  const fields = ['method', 'vault', 'notes', 'attach', 'prefix', 'tags', 'ocrLang', 'aiProvider'];
  // While the dialog is open, keep what was typed for each service so switching back and forth keeps it.
  let draft = {}, shownProvider = null;
  function stashApiFields() {
    if (!shownProvider || !SnapAI.PROVIDERS[shownProvider]) return;
    draft[shownProvider] = { key: $('#s-apiKey').value.trim(), model: $('#s-model').value.trim(), baseUrl: $('#s-baseUrl').value.trim() };
  }
  async function updateAiUi() {
    stashApiFields();
    const p = $('#s-aiProvider').value;
    shownProvider = p;
    const meta = SnapAI.PROVIDERS[p];
    $('#s-apiBox').hidden = !meta;
    $('#s-aiAutoRow').hidden = p === 'off';
    if (meta) {
      const d = draft[p] || { key: getKey(p), model: modelFor(p), baseUrl: S.customBaseUrl };
      $('#s-apiKey').value = d.key; $('#s-model').value = d.model; $('#s-baseUrl').value = d.baseUrl || '';
      $('#s-baseUrlRow').hidden = !meta.baseUrl;
      $('#s-apiKey').placeholder = meta.keyHint || t('set.ai.keyOptional');
      $('#s-keyHint').textContent = t('set.ai.keyHint.' + p);
      fillModelPicker($('#s-modelSel'), $('#s-model'), p, d.model);
    }
    const hint = $('#s-aiHint');
    if (p === 'off') { hint.textContent = ''; return; }
    if (meta) { hint.textContent = t('set.ai.hint.' + p); return; }
    if (p === 'apple') { hint.textContent = t('set.ai.hint.apple') + ' ' + t('set.ai.apple.' + appleState); return; }
    hint.textContent = t('set.ai.hint.chrome');
    const st = await SnapAI.chromeStatus(I18N.lang);
    if ($('#s-aiProvider').value === 'chrome') hint.textContent = t('set.ai.hint.chrome') + ' ' + t('set.ai.chrome.status', { s: t('set.ai.chrome.' + st.state) });
  }
  $('#s-aiProvider').addEventListener('change', updateAiUi);
  function updateConn() {
    const el = $('#s-conn'), btn = $('#s-connect');
    if (!hasFS) { el.textContent = t('set.noFs'); btn.hidden = true; return; }
    el.textContent = dirHandle ? t('set.connected', { n: dirHandle.name }) : t('set.notConnected');
  }
  $('#settingsBtn').addEventListener('click', async () => {
    fields.forEach(k => { $('#s-' + k).value = S[k]; });
    $('#s-incOcr').checked = S.incOcr;
    $('#s-aiAuto').checked = S.aiAuto;
    $('#s-lang').value = I18N.lang;
    draft = {}; shownProvider = null;
    updateAiUi();
    if (hasFS && !dirHandle) dirHandle = await SnapDB.get('vaultDir').catch(() => null) || null;
    updateConn();
    dlg.showModal();
  });
  $('#s-connect').addEventListener('click', connectVault);
  $('#aiTipBtn').addEventListener('click', () => $('#settingsBtn').click());
  $('#autoAi').addEventListener('change', async e => {
    S.aiAuto = e.target.checked;
    saveSettings();
    if (!S.aiAuto || effectiveProvider() !== 'chrome') return;
    // This click is the user gesture Chrome needs to start downloading its model, so start it now.
    try {
      const state = await SnapAI.warmUp(I18N.lang, p => toast(t('app.ai.download', { p: Math.round(p * 100) })));
      if (state === 'available') toast(t('app.ai.ready'));
    } catch (err) {
      console.error(err);
      toast(t('app.ai.err.api', { e: err.message || String(err) }));
    }
  });
  $('#s-lang').addEventListener('change', e => I18N.setLang(e.target.value));
  dlg.addEventListener('close', () => {
    $('#s-aiNeed').hidden = true;
    fields.forEach(k => { S[k] = $('#s-' + k).value.trim(); });
    S.notes = cleanFolder(S.notes); S.attach = cleanFolder(S.attach);
    S.incOcr = $('#s-incOcr').checked;
    S.aiAuto = $('#s-aiAuto').checked;
    updateDest();
    stashApiFields();
    for (const [p, d] of Object.entries(draft)) {
      setKey(p, d.key);
      S.models[p] = d.model;
      if (p === 'custom') S.customBaseUrl = d.baseUrl.replace(/\/+$/, '');
    }
    saveSettings();
    render();
    toast(t('set.saved'));
  });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  // PWA install
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#installBtn').hidden = false; });
  $('#installBtn').addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null; $('#installBtn').hidden = true;
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js').catch(() => {});

  // ---------------- boot ----------------
  // Phones and the iOS app have no drag-and-drop or Ctrl/⌘+V: describe tapping instead.
  if (NATIVE || matchMedia('(pointer: coarse)').matches) $('#drop span[data-i18n]').dataset.i18n = 'app.drop.descTouch';
  applyI18n();
  if (NATIVE) {
    const o = $('#s-aiProvider option[value=chrome]');
    if (o) { o.value = 'apple'; o.dataset.i18n = 'set.ai.apple'; o.textContent = t('set.ai.apple'); }
  }
  if (hasFS) SnapDB.get('vaultDir').then(h => { if (h && !dirHandle) dirHandle = h; updateDest(); }, () => updateDest());
  else updateDest();
  I18N.onChange(updateDest);
  $('#appVersion').textContent = APP_VERSION;
  load().then(() => {
    const q = new URLSearchParams(location.search);
    if (q.has('shared')) {
      const n = +q.get('shared') || 0;
      const title = q.get('t');
      if (title && n === 1 && caps[0] && !caps[0].title) { caps[0].title = title; SnapDB.put(caps[0]); render(); }
      if (n) toast(t('app.shared', { n }));
      history.replaceState(null, '', location.pathname);
    }
  });
})();
