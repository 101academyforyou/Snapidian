/* Snapidian App */
(() => {
  const { t } = I18N;
  const $ = s => document.querySelector(s);

  // Bump on every release so users (and support) can tell which version is running.
  const APP_VERSION = '2026.11.25-6';

  // ---------------- settings ----------------
  const DEFAULTS = {
    method: 'auto', vault: '', notes: 'Snapidian', attach: 'Snapidian/attachments',
    prefix: 'Snap-', tags: 'snapidian', incOcr: true, ocrLang: 'chi_tra+eng',
    aiProvider: 'off', claudeModel: 'claude-opus-5-5', aiAuto: false, autoOcr: true
  };
  const SKEY = 'snapidian.settings';
  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
  const saveSettings = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} };

  // The Claude key is kept apart from the other settings and never leaves this browser except to call the Claude API.
  const KKEY = 'snapidian.claudeKey';
  const getKey = () => { try { return localStorage.getItem(KKEY) || ''; } catch (e) { return ''; } };
  const setKey = v => { try { v ? localStorage.setItem(KKEY, v) : localStorage.removeItem(KKEY); } catch (e) {} };
  const aiReady = () => S.aiProvider === 'claude' ? !!getKey() : S.aiProvider === 'chrome' ? SnapAI.hasChrome() : false;

  const hasFS = 'showDirectoryPicker' in window;
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

  function names(c) {
    const d = new Date(c.createdAt);
    const base = `${S.prefix}${stamp(d)}`;
    const img = `${base}.${extOf(c.type)}`;
    const note = (c.title.trim() ? safeName(c.title) : base) + '.md';
    return { img, note, imgPath: joinPath(S.attach, img), notePath: joinPath(S.notes, note) };
  }

  function buildMarkdown(c, imgPath) {
    const d = new Date(c.createdAt);
    const tags = parseTags(S.tags + ' ' + c.tags);
    const title = c.title.trim() || `${t('app.untitled')} ${d.toLocaleString(I18N.lang === 'zh' ? 'zh-TW' : 'en-US')}`;
    const lines = ['---', `created: ${isoLocal(d)}`, 'source: Snapidian'];
    if (tags.length) { lines.push('tags:'); tags.forEach(x => lines.push(`  - ${x}`)); }
    lines.push('---', '', `# ${title}`, '', `![[${imgPath}]]`, '');
    if ((c.summary || '').trim()) lines.push(`## ${t('md.summary')}`, c.summary.trim(), '');
    if (c.note.trim()) lines.push(`## ${t('md.note')}`, c.note.trim(), '');
    if (S.incOcr && c.ocr.trim()) lines.push(`## ${t('md.ocr')}`, ...c.ocr.trim().split('\n').map(l => '> ' + l), '');
    return lines.join('\n');
  }

  // ---------------- data ----------------
  async function load() {
    caps = await SnapDB.all();
    render();
  }

  async function addFiles(files, sharedMsg) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    const ids = [];
    for (const f of imgs) {
      const c = SnapDB.newCapture(f, f.name);
      ids.push(c.id);
      await SnapDB.put(c);
    }
    await load();
    toast(t(sharedMsg ? 'app.shared' : 'app.added', { n: imgs.length }));
    const added = () => caps.filter(c => ids.includes(c.id));
    // Recognize text first, so AI organize (if on) can use it too.
    if (S.autoOcr) for (const c of added()) await runOcr(c, { quiet: true });
    if (S.aiAuto && aiReady()) await aiMany(added());
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
      I18N.apply(el);
      el.dataset.id = c.id;
      el.classList.toggle('saved', c.saved);
      el.querySelector('img').src = urlFor(c);
      el.querySelector('.status').textContent = t(c.saved ? 'app.status.saved' : 'app.status.pending');
      const bind = (sel, key) => {
        const input = el.querySelector(sel);
        input.value = c[key] ?? '';
        input.addEventListener('input', () => { c[key] = input.value; persist(c); });
      };
      bind('.f-title', 'title'); bind('.f-note', 'note'); bind('.f-tags', 'tags'); bind('.f-ocr', 'ocr'); bind('.f-summary', 'summary');
      el.querySelector('.sum-box').hidden = !(c.summary || '').trim();
      el.querySelector('.a-ai').hidden = S.aiProvider === 'off';
      if (ocrBusy.has(c.id)) queueMicrotask(() => paintOcr(c.id));
      if (c.ocr) el.querySelector('.ocr-box').open = true;
      return el;
    }));

    const pending = caps.filter(c => !c.saved).length;
    $('#empty').hidden = caps.length > 0;
    $('#bar').hidden = caps.length === 0;
    $('#count').textContent = t('app.count', { n: caps.length, p: pending });
    $('#saveAllBtn').disabled = pending === 0;
    $('#clearDoneBtn').hidden = pending === caps.length;
    $('#aiAllBtn').hidden = S.aiProvider === 'off' || pending === 0;
    $('#aiTip').hidden = S.aiProvider !== 'off' || caps.length === 0;
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
    } catch (e) { if (e.name !== 'AbortError') toast(t('app.error', { e: e.message })); }
  }

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

  async function resolveMethod() {
    let m = S.method;
    if (m === 'auto') {
      if (await getDir(true)) return 'folder';
      const probe = [new File([''], 'a.png', { type: 'image/png' }), new File([''], 'a.md', { type: 'text/markdown' })];
      return navigator.canShare && navigator.canShare({ files: probe }) ? 'share' : 'zip';
    }
    return m;
  }

  function downloadFile(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  async function downloadZip(list) {
    const entries = [];
    for (const c of list) {
      const n = names(c);
      entries.push({ path: n.imgPath, data: new Uint8Array(await c.blob.arrayBuffer()) });
      entries.push({ path: n.notePath, data: buildMarkdown(c, n.imgPath) });
    }
    downloadFile(makeZip(entries), list.length === 1 ? names(list[0]).note.replace(/\.md$/, '.zip') : `Snapidian-${stamp(new Date())}.zip`);
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
  async function getWorker() {
    if (workerP && workerLang === S.ocrLang) return workerP;
    if (workerP) (await workerP).terminate();
    workerLang = S.ocrLang;
    workerP = (async () => {
      if (!window.Tesseract) await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js');
      return Tesseract.createWorker(S.ocrLang.split('+'), 1, {
        logger: m => { if (m.status === 'recognizing text' && ocrProgress) ocrProgress(m.progress); }
      });
    })();
    workerP.catch(() => { workerP = null; });
    return workerP;
  }
  // Recognition can outlive the card's DOM (render() rebuilds the list), so progress is tracked per capture.
  const ocrBusy = new Map(); // id -> progress 0..1
  const ocrBtn = id => document.querySelector(`.cap[data-id="${id}"] .a-ocr`);
  function paintOcr(id) {
    const btn = ocrBtn(id);
    if (!btn) return;
    const busy = ocrBusy.has(id);
    btn.disabled = busy;
    btn.textContent = busy ? t('app.ocr.running', { p: Math.round(ocrBusy.get(id) * 100) }) : t('app.ocr');
  }
  async function runOcr(c, { quiet = false } = {}) {
    if (ocrBusy.has(c.id)) return false;
    ocrBusy.set(c.id, 0); paintOcr(c.id);
    ocrProgress = p => { ocrBusy.set(c.id, p); paintOcr(c.id); };
    try {
      const w = await getWorker();
      const { data } = await w.recognize(c.blob);
      // Tesseract inserts spaces between CJK characters — remove them
      c.ocr = data.text.replace(/([　-鿿＀-￯])\s+(?=[　-鿿＀-￯])/g, '$1').trim();
      await SnapDB.put(c);
      if (!quiet) toast(t('app.ocr.done'));
      return true;
    } catch (e) {
      console.error(e);
      toast(t('app.ocr.fail'));
      return false;
    } finally {
      ocrProgress = null;
      ocrBusy.delete(c.id);
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
  async function runAi(c, btn) {
    if (aiBusy.has(c.id)) return;
    if (!aiReady()) { toast(t(S.aiProvider === 'claude' ? 'app.ai.err.no_key' : S.aiProvider === 'off' ? 'app.ai.err.off' : 'app.ai.err.chrome_unsupported')); return false; }
    aiBusy.add(c.id);
    btn = btn || document.querySelector(`.cap[data-id="${c.id}"] .a-ai`);
    const label = btn && btn.innerHTML;
    const setLabel = s => { if (btn) btn.textContent = s; };
    if (btn) btn.disabled = true;
    setLabel(t('app.ai.running'));
    try {
      const r = await SnapAI.organize(S.aiProvider, {
        blob: c.blob, ocr: c.ocr, lang: I18N.lang, apiKey: getKey(), model: S.claudeModel,
        onProgress: p => setLabel(t('app.ai.download', { p: Math.round(p * 100) }))
      });
      if (!c.title.trim()) c.title = r.title;
      c.summary = r.summary;
      c.tags = parseTags(c.tags + ' ' + r.tags.join(' ')).join(' ');
      if (!c.ocr.trim() && r.text) c.ocr = r.text;
      await SnapDB.put(c);
      return true;
    } catch (e) {
      console.error(e);
      toast(aiErrorText(e));
      return false;
    } finally {
      aiBusy.delete(c.id);
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
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
      if (await runAi(c, e.target.closest('.a-ai'))) { render(); toast(t('app.ai.done')); }
    } else if (e.target.closest('.a-ocr')) {
      runOcr(c);
    } else if (e.target.closest('.a-md')) {
      const n = names(c);
      downloadFile(new Blob([buildMarkdown(c, n.img)], { type: 'text/markdown' }), n.note);
      // the note embeds the image by name, so hand over the image too
      setTimeout(() => downloadFile(c.blob, n.img), 300);
      toast(t('app.mdDownloaded'));
    } else if (e.target.closest('.a-copy')) {
      try { await navigator.clipboard.writeText(buildMarkdown(c, names(c).imgPath)); toast(t('app.copied')); }
      catch (err) { toast(t('app.error', { e: `${err.name}: ${err.message}` })); }
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
    try { await save(caps.filter(c => !c.saved)); } catch (err) { toast(t('app.error', { e: `${err.name}: ${err.message}` })); }
  });
  $('#aiAllBtn').addEventListener('click', () => aiMany(caps.filter(c => !c.saved && !(c.summary || '').trim())));
  $('#clearDoneBtn').addEventListener('click', async () => {
    for (const c of caps.filter(c => c.saved)) await SnapDB.del(c.id);
    await load();
  });

  // language
  $('#langBtn').addEventListener('click', () => I18N.toggle());
  I18N.onChange(() => { $('#s-lang').value = I18N.lang; render(); updateConn(); });

  // settings dialog
  const dlg = $('#settings');
  const fields = ['method', 'vault', 'notes', 'attach', 'prefix', 'tags', 'ocrLang', 'aiProvider', 'claudeModel'];
  async function updateAiUi() {
    const p = $('#s-aiProvider').value;
    $('#s-claudeBox').hidden = p !== 'claude';
    $('#s-aiAutoRow').hidden = p === 'off';
    const hint = $('#s-aiHint');
    if (p === 'off') { hint.textContent = ''; return; }
    if (p === 'claude') { hint.textContent = t('set.ai.hint.claude'); return; }
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
    $('#s-autoOcr').checked = S.autoOcr;
    $('#s-claudeKey').value = getKey();
    $('#s-lang').value = I18N.lang;
    updateAiUi();
    if (hasFS && !dirHandle) dirHandle = await SnapDB.get('vaultDir').catch(() => null) || null;
    updateConn();
    dlg.showModal();
  });
  $('#s-connect').addEventListener('click', connectVault);
  $('#aiTipBtn').addEventListener('click', () => $('#settingsBtn').click());
  $('#s-lang').addEventListener('change', e => I18N.setLang(e.target.value));
  dlg.addEventListener('close', () => {
    fields.forEach(k => { S[k] = $('#s-' + k).value.trim(); });
    S.notes = cleanFolder(S.notes); S.attach = cleanFolder(S.attach);
    S.incOcr = $('#s-incOcr').checked;
    S.aiAuto = $('#s-aiAuto').checked;
    S.autoOcr = $('#s-autoOcr').checked;
    setKey($('#s-claudeKey').value.trim());
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
  I18N.apply();
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
