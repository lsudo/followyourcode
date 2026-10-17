// Copy the website into dist/ (what Amplify deploys) and check it first.
// Fails on anything that would break the live site or its search listing.
// Usage: node scripts/build.mjs
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { extname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://www.followyourcode.pl';

// Repository files that are not part of the website. Dotfiles are skipped too.
const NOT_SITE = new Set(['legacy', 'scripts', 'dist', 'node_modules', 'amplify.yml', 'AGENTS.md', 'CLAUDE.md', 'README.md']);
const SITE_TYPES = new Set(['.html', '.css', '.js', '.xml', '.txt', '.webmanifest', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff2', '.pdf']);
const TEXT_TYPES = new Set(['.html', '.css', '.js', '.xml', '.txt', '.webmanifest']);

const problems = [];
const warnings = [];

// 1. Copy.
rmSync(DIST, { recursive: true, force: true });
for (const name of readdirSync(ROOT)) {
  if (name.startsWith('.') || NOT_SITE.has(name)) continue;
  cpSync(join(ROOT, name), join(DIST, name), {
    recursive: true,
    filter: (src) => !src.slice(ROOT.length).split(sep).some((part) => part.startsWith('.')),
  });
}

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [relative(DIST, full).split(sep).join('/').normalize('NFC')];
});
const files = walk(DIST).sort();
const fileSet = new Set(files);
const read = (file) => readFileSync(join(DIST, file), 'utf8');

for (const file of files) {
  if (!SITE_TYPES.has(extname(file).toLowerCase())) {
    problems.push(`${file}: not a website file type; add its folder to NOT_SITE in scripts/build.mjs or its type to SITE_TYPES`);
  }
}

// URL path of a file, the way Amplify serves it: dir/index.html -> /dir/
const urlPath = (file) => '/' + (file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -'index.html'.length) : file);
const ownUrl = (file) => ORIGIN + encodeURI(urlPath(file));

// File served for a root path, or null. A directory without the trailing slash
// counts as found: Amplify redirects it to the slash form.
const fileFor = (path) => {
  let p = decodeURI(path.split('#')[0].split('?')[0]).normalize('NFC').replace(/^\//, '');
  if (p === '' || p.endsWith('/')) p += 'index.html';
  if (fileSet.has(p)) return p;
  if (fileSet.has(p + '/index.html')) return p + '/index.html';
  return null;
};

const pages = files.filter((f) => f.endsWith('.html'));
const isRedirect = (file) => /http-equiv="refresh"/.test(read(file));
const attr = (html, re) => (html.match(re) || [])[1];

// 2. Links and assets: every internal href/src/url() resolves, and none points at a redirect page.
let links = 0;
const checkTarget = (where, raw, resolved) => {
  links++;
  const target = fileFor(resolved);
  if (!target) problems.push(`${where}: broken link ${raw}`);
  else if (target.endsWith('.html') && target !== '404.html' && isRedirect(target)) {
    problems.push(`${where}: links to the redirect page ${raw}; link to its target instead`);
  }
};
const resolveFrom = (file, ref) => (ref.startsWith('/') ? ref : posix.join(posix.dirname('/' + file), ref));
const external = (ref) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref) || ref === '';

for (const file of files.filter((f) => TEXT_TYPES.has(extname(f)))) {
  const text = read(file);
  if (file.endsWith('.html') && !isRedirect(file)) {
    for (const [, ref] of text.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      if (!external(ref)) checkTarget(file, ref, resolveFrom(file, ref));
    }
  }
  if (file.endsWith('.css')) {
    for (const [, ref] of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      if (!external(ref)) checkTarget(file, ref, resolveFrom(file, ref));
    }
  }
  // Absolute links to this site, anywhere: canonical, og:, JSON-LD, sitemap, feeds, llms.txt.
  for (const [url] of text.matchAll(/https?:\/\/(?:www\.)?followyourcode\.pl(?:\/[^\s"'<>)\]]*)?/g)) {
    if (!url.startsWith(ORIGIN)) {
      problems.push(`${file}: ${url} should use ${ORIGIN}`);
      continue;
    }
    checkTarget(file, url, url.slice(ORIGIN.length) || '/');
  }
}

// 3. Page heads.
const indexable = [];
const seen = { title: new Map(), description: new Map() };
for (const file of pages) {
  const html = read(file);
  if (isRedirect(file)) {
    const target = attr(html, /http-equiv="refresh" content="0; url=([^"]+)"/);
    const dest = target && fileFor(resolveFrom(file, target));
    if (!dest) problems.push(`${file}: redirect target ${target} not found`);
    else if (attr(html, /<link rel="canonical" href="([^"]+)"/) !== ownUrl(dest)) problems.push(`${file}: canonical must be ${ownUrl(dest)}`);
    if (!/<meta name="robots" content="noindex/.test(html)) problems.push(`${file}: redirect page needs robots noindex`);
    continue;
  }
  if (!/<html lang="pl">/.test(html)) problems.push(`${file}: missing <html lang="pl">`);
  const title = attr(html, /<title>([^<]+)<\/title>/);
  if (!title) problems.push(`${file}: missing <title>`);
  for (const [, tag] of html.matchAll(/(<img\b[^>]*>)/g)) {
    if (!/\salt="/.test(tag)) problems.push(`${file}: image without alt: ${tag.slice(0, 80)}`);
  }
  if (file === '404.html') continue;

  indexable.push(file);
  const description = attr(html, /<meta name="description" content="([^"]+)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  if (!description) problems.push(`${file}: missing meta description`);
  if (canonical !== ownUrl(file)) problems.push(`${file}: canonical ${canonical} must be ${ownUrl(file)}`);
  if (attr(html, /<meta property="og:url" content="([^"]+)"/) !== canonical) problems.push(`${file}: og:url must equal the canonical URL`);
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) problems.push(`${file}: noindex on a public page`);
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) problems.push(`${file}: ${h1} <h1> elements, expected 1`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (e) { problems.push(`${file}: invalid JSON-LD: ${e.message}`); }
  }
  for (const [key, value] of [['title', title], ['description', description]]) {
    if (!value) continue;
    seen[key].set(value, [...(seen[key].get(value) || []), file]);
  }
}
for (const [key, map] of Object.entries(seen)) {
  for (const [value, where] of map) {
    if (where.length > 1) warnings.push(`same ${key} on ${where.length} pages (${where.join(', ')}): ${value.slice(0, 60)}`);
  }
}

// 4. Sitemap lists exactly the indexable pages.
if (!fileSet.has('sitemap.xml')) problems.push('sitemap.xml missing');
else {
  const listed = new Set();
  for (const [, loc] of read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const target = loc.startsWith(ORIGIN) && fileFor(loc.slice(ORIGIN.length));
    if (!target || !indexable.includes(target)) problems.push(`sitemap.xml: ${loc} is not a public page`);
    else listed.add(target);
  }
  for (const file of indexable) if (!listed.has(file)) problems.push(`sitemap.xml: missing ${ownUrl(file)}`);
}
for (const required of ['robots.txt', 'llms.txt', '404.html', 'index.html']) {
  if (!existsSync(join(DIST, required))) problems.push(`${required} missing`);
}

console.log(`dist/: ${files.length} files, ${pages.length} HTML pages (${indexable.length} public), ${links} links checked`);
for (const w of warnings) console.log(`warning: ${w}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('OK');
