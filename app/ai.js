/* Snapidian AI organize — Claude API (user's own key) or Chrome built-in AI (on-device). */
(function (g) {
  const SCHEMA = {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Short, specific note title (max ~40 characters)' },
      summary: { type: 'string', description: '1-3 sentence summary of what the screenshot shows and why it might matter' },
      tags: { type: 'array', items: { type: 'string' }, description: '3-6 lowercase topic tags without # or spaces' },
      text: { type: 'string', description: 'All readable text in the screenshot, in reading order; empty string if none' }
    },
    required: ['title', 'summary', 'tags', 'text'],
    additionalProperties: false
  };

  function instructions(lang, ocrText) {
    const out = lang === 'zh' ? 'Traditional Chinese (繁體中文, Taiwan usage)' : 'English';
    return [
      'You organize a phone screenshot into a Markdown note.',
      `Write "title", "summary" and "tags" in ${out}. Tags may stay in English when they are product names or common technical terms.`,
      'Tags: 3-6 short topic tags, lowercase where the script has case, no "#", use "-" instead of spaces.',
      '"text": transcribe the readable text in the screenshot as-is (keep its original language), in reading order, one paragraph or list item per line. Skip status-bar clutter such as time, battery and signal. Use an empty string if there is no meaningful text.',
      'Describe only what is in the image; do not guess at things you cannot see.',
      ocrText ? `Text recognized by OCR earlier (may contain errors):\n${ocrText.slice(0, 4000)}` : ''
    ].filter(Boolean).join('\n');
  }

  // Downscale so the long edge is at most 1568px (Claude's recommended size) and re-encode.
  async function prepareImage(blob) {
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    return new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new Error('encode failed')), 'image/jpeg', 0.9));
  }

  function toBase64(blob) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(',')[1]);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(blob);
    });
  }

  function clean(obj) {
    const tags = Array.isArray(obj.tags) ? obj.tags : [];
    return {
      title: String(obj.title || '').trim().slice(0, 80),
      summary: String(obj.summary || '').trim(),
      tags: tags.map(t => String(t).replace(/^#/, '').trim().replace(/\s+/g, '-')).filter(Boolean).slice(0, 8),
      text: String(obj.text || '').trim()
    };
  }

  class AIError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
  }

  // ---------------- Claude ----------------
  let sdkP = null;
  const loadSdk = () => (sdkP ||= import('./vendor/anthropic-sdk.js').then(m => m.default));

  async function claude({ blob, ocr, lang, apiKey, model }) {
    if (!apiKey) throw new AIError('no_key');
    const Anthropic = await loadSdk();
    // The key is the user's own and stays in their browser, so a direct browser call is intended here.
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
    const img = await prepareImage(blob);
    const data = await toBase64(img);
    let res;
    try {
      res = await client.beta.messages.create({
        model: model || 'claude-opus-5-5',
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } },
            { type: 'text', text: instructions(lang, ocr) }
          ]
        }]
      });
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) throw new AIError('bad_key');
      if (e instanceof Anthropic.PermissionDeniedError) throw new AIError('bad_key');
      if (e instanceof Anthropic.RateLimitError) throw new AIError('rate_limit');
      if (e instanceof Anthropic.APIConnectionError) throw new AIError('network');
      if (e instanceof Anthropic.APIError) throw new AIError('api', `${e.status ?? ''} ${e.message}`.trim());
      throw e;
    }
    if (res.stop_reason === 'refusal') throw new AIError('refusal');
    if (res.stop_reason === 'max_tokens') throw new AIError('api', 'response too long');
    const textBlock = res.content.find(b => b.type === 'text');
    if (!textBlock) throw new AIError('api', 'empty response');
    return clean(JSON.parse(textBlock.text));
  }

  // ---------------- ChatGPT, Gemini and other services (plain HTTPS with the user's own key) ----------------
  async function httpJson(url, init) {
    let res;
    try { res = await fetch(url, init); } catch (e) { throw new AIError('network'); }
    let body = null;
    try { body = await res.json(); } catch (e) { /* not JSON */ }
    if (!res.ok) {
      const err = body && (body.error || (Array.isArray(body) && body[0] && body[0].error));
      const msg = (err && (err.message || err.status)) || res.statusText || '';
      if (res.status === 401 || res.status === 403) throw new AIError('bad_key');
      if (res.status === 429) throw new AIError('rate_limit');
      throw new AIError('api', `${res.status} ${msg}`.trim());
    }
    return body;
  }
  const isBadRequest = e => e instanceof AIError && e.code === 'api' && /^400\b/.test(e.message);

  // Models sometimes wrap JSON in ```json fences or a sentence; take the outermost {...}.
  function parseJsonText(text) {
    const t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    const i = t.indexOf('{'), j = t.lastIndexOf('}');
    if (i < 0 || j < i) throw new AIError('api', 'no JSON in response');
    return JSON.parse(t.slice(i, j + 1));
  }

  // OpenAI Chat Completions — also spoken by OpenRouter, Groq, DeepSeek, Mistral, Ollama, LM Studio and others.
  async function openaiCompatible({ blob, ocr, lang, apiKey, model, baseUrl }) {
    if (!model) throw new AIError('no_model');
    const custom = !!baseUrl;
    if (!custom && !apiKey) throw new AIError('no_key');
    const data = await toBase64(await prepareImage(blob));
    const url = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
    const headers = { 'content-type': 'application/json' };
    if (apiKey) headers.authorization = 'Bearer ' + apiKey;
    const base = {
      model,
      messages: [{ role: 'user', content: [
        { type: 'text', text: instructions(lang, ocr) + '\nReply with JSON only.' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + data } }
      ] }]
    };
    const withSchema = { ...base, response_format: { type: 'json_schema', json_schema: { name: 'snapidian_note', strict: true, schema: SCHEMA } } };
    let res;
    try {
      res = await httpJson(url, { method: 'POST', headers, body: JSON.stringify(withSchema) });
    } catch (e) {
      // Some compatible services reject response_format; ask again relying on the instructions alone.
      if (!custom || !isBadRequest(e)) throw e;
      res = await httpJson(url, { method: 'POST', headers, body: JSON.stringify(base) });
    }
    const choice = res && res.choices && res.choices[0];
    if (!choice) throw new AIError('api', 'empty response');
    if (choice.finish_reason === 'content_filter' || (choice.message && choice.message.refusal)) throw new AIError('refusal');
    const content = choice.message && choice.message.content;
    const text = Array.isArray(content) ? content.map(p => p.text || '').join('') : content;
    if (!text) throw new AIError('api', 'empty response');
    return clean(parseJsonText(text));
  }

  // Google Gemini API (generateContent)
  async function gemini({ blob, ocr, lang, apiKey, model }) {
    if (!apiKey) throw new AIError('no_key');
    if (!model) throw new AIError('no_model');
    const data = await toBase64(await prepareImage(blob));
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`;
    const headers = { 'content-type': 'application/json', 'x-goog-api-key': apiKey };
    const contents = [{ role: 'user', parts: [
      { inlineData: { mimeType: 'image/jpeg', data } },
      { text: instructions(lang, ocr) + '\nReply with JSON only.' }
    ] }];
    let res;
    try {
      res = await httpJson(url, { method: 'POST', headers, body: JSON.stringify({ contents, generationConfig: { responseMimeType: 'application/json', responseJsonSchema: SCHEMA } }) });
    } catch (e) {
      if (!isBadRequest(e)) throw e;
      res = await httpJson(url, { method: 'POST', headers, body: JSON.stringify({ contents }) });
    }
    if (res && res.promptFeedback && res.promptFeedback.blockReason) throw new AIError('refusal');
    const cand = res && res.candidates && res.candidates[0];
    if (!cand) throw new AIError('api', 'empty response');
    if (/SAFETY|PROHIBITED|BLOCKLIST/.test(cand.finishReason || '')) throw new AIError('refusal');
    const text = ((cand.content && cand.content.parts) || []).map(p => p.text || '').join('');
    if (!text) throw new AIError('api', 'empty response');
    return clean(parseJsonText(text));
  }

  // What each service needs in Settings. Model names are suggestions; users can type any model.
  const PROVIDERS = {
    claude: { key: true, model: 'claude-opus-5-5', models: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5'], keyHint: 'sk-ant-…' },
    openai: { key: true, model: 'gpt-5.5', models: ['gpt-5.5'], keyHint: 'sk-…' },
    gemini: { key: true, model: 'gemini-3.8-flash', models: ['gemini-3.8-flash'], keyHint: 'AIza…' },
    custom: { key: false, baseUrl: true, model: '', models: [], keyHint: '' }
  };

  // ---------------- Chrome built-in AI (Prompt API, Gemini Nano on device) ----------------
  const LM = () => g.LanguageModel;

  function chromeOptions(lang, withImage) {
    // The on-device model supports a short list of output languages; fall back to English if Chinese is not offered.
    const inputs = [{ type: 'text', languages: [...new Set(['en', lang])] }];
    if (withImage) inputs.push({ type: 'image' });
    return { expectedInputs: inputs, expectedOutputs: [{ type: 'text', languages: [lang === 'zh' ? 'zh' : 'en'] }] };
  }

  async function chromeStatus(lang) {
    if (!LM()) return { state: 'unsupported' };
    for (const withImage of [true, false]) {
      for (const l of lang === 'zh' ? ['zh', 'en'] : ['en']) {
        try {
          const opts = chromeOptions(l, withImage);
          const a = await LM().availability(opts);
          if (a && a !== 'unavailable') return { state: a, withImage, outLang: l, opts };
        } catch (e) { /* unsupported option combination — try the next one */ }
      }
    }
    return { state: 'unavailable' };
  }

  async function chrome({ blob, ocr, lang, onProgress }) {
    const st = await chromeStatus(lang);
    if (st.state === 'unsupported') throw new AIError('chrome_unsupported');
    if (st.state === 'unavailable') throw new AIError('chrome_unavailable');
    if (!st.withImage && !ocr) throw new AIError('chrome_need_ocr');

    // Chrome also fires a 'downloadprogress' event (100%) when the model is already on the device, so only
    // report progress when a download is actually needed.
    const downloading = st.state === 'downloadable' || st.state === 'downloading';
    const session = await LM().create({
      ...st.opts,
      monitor(m) { if (downloading) m.addEventListener('downloadprogress', e => onProgress && onProgress(e.loaded)); }
    });
    try {
      const content = [{ type: 'text', value: instructions(lang, ocr) + '\nReply with JSON only.' }];
      if (st.withImage) content.unshift({ type: 'image', value: await prepareImage(blob) });
      const out = await session.prompt([{ role: 'user', content }], { responseConstraint: SCHEMA });
      const parsed = clean(JSON.parse(out));
      if (!st.withImage) parsed.text = ''; // the model never saw the image, so keep the OCR text instead
      return parsed;
    } finally {
      session.destroy?.();
    }
  }

  // Chrome only downloads its model right after a user gesture, so call this from a click (e.g. when the
  // user turns on automatic organizing). Later automatic runs then find the model ready.
  async function warmUp(lang, onProgress) {
    const st = await chromeStatus(lang);
    if (st.state !== 'downloadable' && st.state !== 'downloading') return st.state;
    const session = await LM().create({
      ...st.opts,
      monitor(m) { m.addEventListener('downloadprogress', e => onProgress && onProgress(e.loaded)); }
    });
    session.destroy?.();
    return 'available';
  }

  g.SnapAI = {
    AIError,
    chromeStatus,
    warmUp,
    hasChrome: () => !!LM(),
    PROVIDERS,
    organize(provider, args) {
      if (provider === 'claude') return claude(args);
      if (provider === 'chrome') return chrome(args);
      if (provider === 'openai') return openaiCompatible({ ...args, baseUrl: '' });
      if (provider === 'custom') return args.baseUrl ? openaiCompatible(args) : Promise.reject(new AIError('no_base_url'));
      if (provider === 'gemini') return gemini(args);
      return Promise.reject(new AIError('off'));
    }
  };
})(window);
