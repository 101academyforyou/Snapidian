# Vendored libraries

`anthropic-sdk.js` is the official Anthropic TypeScript SDK (`@anthropic-ai/sdk@1.8.0`, Apache-2.0, see `anthropic-sdk.LICENSE`),
bundled as a single browser ES module so the static site needs no build step:

```bash
npm install @anthropic-ai/sdk@1.8.0 esbuild@0.25.0
echo 'export { default } from "@anthropic-ai/sdk"; export * from "@anthropic-ai/sdk";' > entry.js
npx esbuild entry.js --bundle --format=esm --platform=browser --minify --legal-comments=eof --outfile=anthropic-sdk.js
```
