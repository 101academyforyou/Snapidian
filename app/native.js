/* Snapidian: bridge to the iOS app's native features (Capacitor). Does nothing in a normal browser. */
(function (g) {
  const cap = g.Capacitor;
  const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const plugin = name => (isNative && cap.Plugins && cap.Plugins[name]) || null;

  const toBase64 = blob => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

  // Apple Vision text recognition (on device).
  async function recognizeText(blob) {
    const p = plugin('SnapidianNative');
    if (!p) throw new Error('native text recognition unavailable');
    const { text } = await p.recognizeText({ image: await toBase64(blob) });
    return text || '';
  }

  // Apple's on-device model (Apple Intelligence, iOS 26+): 'available' | 'unavailable' | 'unsupported'
  let statusP = null;
  function aiStatus() {
    const p = plugin('SnapidianNative');
    if (!p) return Promise.resolve('unsupported');
    return (statusP ||= p.aiStatus().then(r => r.state, () => 'unsupported'));
  }
  async function organizeText(prompt) {
    const p = plugin('SnapidianNative');
    if (!p) throw new Error('unsupported');
    const { text } = await p.organize({ prompt });
    return text || '';
  }

  // iOS can't download files from a web view: write them to the app's cache and open the share sheet,
  // where the user can pick "Save to Files" or a notes app.
  async function shareFiles(files) {
    const fs = plugin('Filesystem'), share = plugin('Share');
    if (!fs || !share) throw new Error('sharing unavailable');
    const urls = [];
    for (const f of files) {
      const { uri } = await fs.writeFile({ path: f.name, data: await toBase64(f.blob), directory: 'CACHE' });
      urls.push(uri);
    }
    try {
      await share.share({ files: urls });
    } catch (e) {
      // The user closed the share sheet without picking anything.
      if (/cancel/i.test(String(e && (e.message || e)))) return false;
      throw e;
    }
    return true;
  }

  // False if the app's own plugin isn't registered; the web app then falls back to Tesseract.js.
  const hasVision = () => !!plugin('SnapidianNative');

  g.SnapNative = { isNative, hasVision, recognizeText, aiStatus, organizeText, shareFiles };
})(window);
