/* Snapidian anonymous user count.
 * Each browser adds 1 to a public counter the first time it opens the web app, and the homepage shows the total.
 * Only a bare "+1" is sent: no identifier, no screenshot, no text. The iPhone app never calls this. */
(function () {
  const BASE = 'https://abacus.jasoncameron.dev';
  const NS = 'snapidian-onepointzeroone', KEY = 'users';
  const FLAG = 'snapidian.counted';
  const call = path => fetch(`${BASE}/${path}/${NS}/${KEY}`, { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })
    .then(r => (r.ok ? r.json() : null)).then(j => (j && Number.isFinite(j.value) ? j.value : null)).catch(() => null);

  const counted = () => { try { return localStorage.getItem(FLAG) === '1'; } catch (e) { return true; } };

  window.SnapStats = {
    // Counts this browser once. Called by the web app on startup.
    countOnce() {
      if (counted()) return Promise.resolve(null);
      try { localStorage.setItem(FLAG, '1'); } catch (e) { return Promise.resolve(null); }
      return call('hit');
    },
    get: () => call('get'),
    // Fills <… data-user-count> with the total and unhides it; stays hidden if the count is unavailable.
    show(el) {
      if (!el) return;
      const num = el.querySelector('[data-num]');
      const label = el.querySelector('[data-label]');
      let n = null;
      const paint = () => {
        if (!n) return;
        num.textContent = n.toLocaleString();
        label.textContent = I18N.t(n === 1 ? 'hero.users.one' : 'hero.users');
        el.hidden = false;
      };
      SnapStats.get().then(v => { n = v; paint(); });
      I18N.onChange(paint);
    }
  };
})();
