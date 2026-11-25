/* Snapidian user count shown on the homepage.
 * The number is set by hand in assets/stats.json; nothing is sent from the website or the app. */
(function () {
  const SRC = (document.currentScript && document.currentScript.src) || location.href;
  window.SnapStats = {
    get: () => fetch(new URL('stats.json', SRC), { cache: 'no-cache' })
      .then(r => (r.ok ? r.json() : null)).then(j => (j && Number.isFinite(j.users) ? j.users : null)).catch(() => null),
    // Fills <… data-user-count> with the number and unhides it; stays hidden while the number is 0 or missing.
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
