/* Snapidian App */
(() => {
  const { t } = I18N;
  const $ = s => document.querySelector(s);

  // ---------------- settings ----------------
  const DEFAULTS = {
    method: 'auto', vault: '', notes: 'Snapidian', attach: 'Snapidian/attachments',
    prefix: 'Snap-', tags: 'snapidian', incOcr: true, ocrLang: 'chi_tra+eng'
  };
  const SKEY = 'snapidian.settings';
  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
  const saveSettings = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} };

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
    for (const f of imgs) {
      const c = SnapDB.newCapture(f, f.name);
      await SnapDB.put(c);
    }
    await load();
    toast(t(sharedMsg ? 'app.shared' : 'app.added', { n: imgs.length }));
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
        input.value = c[key];
        input.addEventListener('input', () => { c[key] = input.value; persist(c); });
      };
      bind('.f-title', 'title'); bind('.f-note', 'note'); bind('.f-tags', 'tags'); bind('.f-ocr', 'ocr');
      if (c.ocr) el.querySelector('.ocr-box').open = true;
      return el;
    }));

    const pending = caps.filter(c => !c.saved).length;
    $('#empty').hidden = caps.length > 0;
    $('#bar').hidden = caps.length === 0;
    $('#count').textContent = t('app.count', { n: caps.length, p: pending });
    $('#saveAllBtn').disabled = pending === 0;
    $('#clearDoneBtn').hidden = pending === caps.length;
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

  async function connectVault() {
    try {
      dirHandle = await window.showDirectoryPicker({ id: 'snapidian-vault', mode: 'readwrite' });
      await SnapDB.set('vaultDir', dirHandle);
      if (!S.vault) { S.vault = dirHandle.name; saveSettings(); $('#s-vault').value = S.vault; }
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
      const probe = new File([''], 'a.md', { type: 'text/markdown' });
      return navigator.canShare && navigator.canShare({ files: [probe] }) ? 'share' : 'zip';
    }
    return m;
  }

  async function save(list) {
    if (!list.length) return;
    const method = await resolveMethod();

    if (method === 'folder') {
      const root = await getDir(true);
      if (!root) { await connectVault(); if (!(await getDir(true))) return; }
      const dir = await getDir(true);
      let lastNote = '';
      for (const c of list) {
        const n = names(c);
        const imgPath = await writeFile(dir, n.imgPath, c.blob);
        lastNote = await writeFile(dir, n.notePath, buildMarkdown(c, imgPath));
        await markSaved(c);
      }
      const vault = S.vault || dir.name;
      toast(t('app.saved.folder', { f: lastNote }), {
        label: t('app.openObsidian'),
        href: `obsidian://open?vault=${encodeURIComponent(vault)}&file=${encodeURIComponent(lastNote.replace(/\.md$/, ''))}`
      });
    } else if (method === 'share') {
      const files = [];
      for (const c of list) {
        const n = names(c);
        files.push(new File([c.blob], n.img, { type: c.type }));
        files.push(new File([buildMarkdown(c, n.img)], n.note, { type: 'text/markdown' }));
      }
      try {
        await navigator.share({ files, title: list.length === 1 ? (list[0].title || 'Snapidian') : 'Snapidian' });
        for (const c of list) await markSaved(c);
        toast(t('app.saved.share'));
      } catch (e) {
        if (e.name !== 'AbortError') { toast(t('app.error', { e: e.message })); }
      }
    } else {
      const entries = [];
      for (const c of list) {
        const n = names(c);
        entries.push({ path: n.imgPath, data: new Uint8Array(await c.blob.arrayBuffer()) });
        entries.push({ path: n.notePath, data: buildMarkdown(c, n.imgPath) });
      }
      const blob = makeZip(entries);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = list.length === 1 ? names(list[0]).note.replace(/\.md$/, '.zip') : `Snapidian-${stamp(new Date())}.zip`;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      for (const c of list) await markSaved(c);
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
  async function runOcr(c, btn) {
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('app.ocr.running', { p: 0 });
    ocrProgress = p => { btn.textContent = t('app.ocr.running', { p: Math.round(p * 100) }); };
    try {
      const w = await getWorker();
      const { data } = await w.recognize(c.blob);
      // Tesseract inserts spaces between CJK characters — remove them
      c.ocr = data.text.replace(/([　-鿿＀-￯])\s+(?=[　-鿿＀-￯])/g, '$1').trim();
      if (!c.title.trim()) {
        const first = c.ocr.split('\n').map(s => s.trim()).find(s => s.length >= 2);
        if (first) c.title = first.slice(0, 40);
      }
      await SnapDB.put(c);
      render();
      toast(t('app.ocr.done'));
    } catch (e) {
      console.error(e);
      toast(t('app.ocr.fail'));
      btn.disabled = false; btn.textContent = label;
    } finally { ocrProgress = null; }
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
      try { await save([c]); } catch (err) { toast(t('app.error', { e: err.message })); }
    } else if (e.target.closest('.a-ocr')) {
      runOcr(c, e.target.closest('.a-ocr'));
    } else if (e.target.closest('.a-copy')) {
      try { await navigator.clipboard.writeText(buildMarkdown(c, names(c).imgPath)); toast(t('app.copied')); }
      catch (err) { toast(t('app.error', { e: err.message })); }
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
    try { await save(caps.filter(c => !c.saved)); } catch (err) { toast(t('app.error', { e: err.message })); }
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
  const fields = ['method', 'vault', 'notes', 'attach', 'prefix', 'tags', 'ocrLang'];
  function updateConn() {
    const el = $('#s-conn'), btn = $('#s-connect');
    if (!hasFS) { el.textContent = t('set.noFs'); btn.hidden = true; return; }
    el.textContent = dirHandle ? t('set.connected', { n: dirHandle.name }) : t('set.notConnected');
  }
  $('#settingsBtn').addEventListener('click', async () => {
    fields.forEach(k => { $('#s-' + k).value = S[k]; });
    $('#s-incOcr').checked = S.incOcr;
    $('#s-lang').value = I18N.lang;
    if (hasFS && !dirHandle) dirHandle = await SnapDB.get('vaultDir').catch(() => null) || null;
    updateConn();
    dlg.showModal();
  });
  $('#s-connect').addEventListener('click', connectVault);
  $('#s-lang').addEventListener('change', e => I18N.setLang(e.target.value));
  dlg.addEventListener('close', () => {
    fields.forEach(k => { S[k] = $('#s-' + k).value.trim(); });
    S.notes = cleanFolder(S.notes); S.attach = cleanFolder(S.attach);
    S.incOcr = $('#s-incOcr').checked;
    saveSettings();
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
