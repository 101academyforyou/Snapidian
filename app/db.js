/* Snapidian IndexedDB helper — usable from pages and the service worker */
(function (g) {
  const DB_NAME = 'snapidian', VERSION = 1;
  let dbp;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('captures')) db.createObjectStore('captures', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return open().then(db => new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      const r = fn(s);
      t.oncomplete = () => resolve(r && 'result' in r ? r.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  g.SnapDB = {
    uid,
    all: () => tx('captures', 'readonly', s => s.getAll()).then(a => a.sort((x, y) => y.createdAt - x.createdAt)),
    put: c => tx('captures', 'readwrite', s => s.put(c)),
    del: id => tx('captures', 'readwrite', s => s.delete(id)),
    get: (k) => tx('kv', 'readonly', s => s.get(k)),
    set: (k, v) => tx('kv', 'readwrite', s => s.put(v, k)),
    newCapture(blob, name) {
      return {
        id: uid(), blob, type: blob.type || 'image/png', name: name || '',
        title: '', note: '', tags: '', ocr: '', summary: '', saved: false,
        createdAt: Date.now() + Math.random() // keeps batch order stable
      };
    }
  };
})(typeof self !== 'undefined' ? self : window);
