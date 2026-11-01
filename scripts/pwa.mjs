import { readdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function walk(dir) {
  let out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    out.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return out;
}
await copyFile("assets/icon.png", "dist/icon.png");
await writeFile(
  "dist/manifest.webmanifest",
  JSON.stringify({
    name: "Cozy Solitaire",
    short_name: "Cozy",
    id: "/",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2e8",
    theme_color: "#345b49",
    icons: [
      {
        src: "/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  }),
);
let html = await readFile("dist/index.html", "utf8");
html = html.replace(
  "</head>",
  '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#345b49"></head>',
);
await writeFile("dist/index.html", html);
const files = (await walk("dist"))
  .filter((p) => !p.endsWith("/sw.js"))
  .map((p) => "/" + p.slice(5));
const cache =
  "cozy-" + createHash("sha256").update(html).digest("hex").slice(0, 12);
await writeFile(
  "dist/sw.js",
  `const CACHE=${JSON.stringify(cache)},FILES=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cozy-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('/index.html'):Response.error())));});`,
);
console.log(`PWA: precache ${files.length} local files (${cache})`);
