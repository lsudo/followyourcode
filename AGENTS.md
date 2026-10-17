# followyourcode.pl

Website of **Follow Your Code**, a hobby, pro bono initiative run by Łukasz Kobylski and Łukasz Sudoł. They spread passion for programming, new technologies, AI and security through workshops, lessons and talks, mostly for primary and secondary school students, occasionally for adults (e.g. an AI workshop for public-sector staff). The published offer (programming and AI workshops, lessons about the programmer profession and the history of programming, educational projects) is in `co-robimy/index.html` - that page is the source of truth for the wording.

## Not Space To Grow

A private hobby project, fully separate from the authors' S2G day job. Nothing from S2G belongs here:

- no S2G branding (logo, colours, fonts, templates, `s2g-*` skills) - the site keeps its own look,
- no S2G tools or data (S2G reports, S2G databases, Jira/Confluence, Slack),
- the only S2G mention on the site is the employer line in one founder's bio on `/o-nas/`; leave it as the authors wrote it.

## Content rules

- Visitor-facing copy is Polish. Keep the existing warm, plain tone, including the courtesy capitalisation "Nas / Nasze".
- Audience: teachers, schools, parents, organisers. Participants are children and teenagers.
- Never invent facts: events, dates, participant counts, partners, quotes. The testimonials (homepage and `/o-nas/`) are real statements by named teachers; change them only with text the authors provide.
- Workshop photos often show minors. Use only photos the authors supply and never name a child.
- No prices, fees or sales language, and no blanket "free" claims ("0 zł", "bezpłatne", "za darmo"). Schools are invited with the pro bono line: "Zaproś Nas do swojej szkoły - pro bono".

## How the site works

Plain HTML, CSS and JS at the repository root, edited by hand: no framework, no generator, no dependencies.

- Each page is `<path>/index.html`, served at `/<path>/`. Internal links are relative (`../co-robimy/`); only `404.html` uses root-absolute links, because it is served at any depth.
- The header, footer and cookie popup are copied into every page. A change to them must be made in all of them: grep for a line of the block.
- `assets/css/style.css` (design tokens at the top), `assets/js/main.js` (nav, reveal effects, testimonials, CTA, cookie consent), self-hosted fonts in `assets/fonts/`, images in `assets/img/`.
- `legacy/` is the old Hugo site, kept for reference (`legacy/README.md`). Nothing builds or deploys from it.
- Google indexes the old Hugo URLs, so every one of them must keep answering. `followyourcode/`, `polityka/`, `archives/`, `series/`, `formularz/` (the retired Typeform page) and every `page/1/` are meta-refresh redirects, most of them copied from Hugo's aliases; `images/`, `files/`, the root favicons and `dzien-dziecka-plakat.png` are old asset paths. Never remove or rename a public URL without leaving a redirect.

## Commands

- `node scripts/serve.mjs` - local preview at http://127.0.0.1:8000, answering like Amplify, with caching off. A plain `python -m http.server` lets the browser keep a stale `style.css`.
- `node scripts/build.mjs` - copies the website into `dist/` (gitignored) and checks it: internal links and assets, titles, meta descriptions, canonical and `og:url`, one `<h1>`, image `alt`, JSON-LD syntax, no `noindex` on public pages, `sitemap.xml` listing exactly the public pages. Amplify runs the same command, so a failing check stops the deploy. Repository files that are not part of the website are listed in `NOT_SITE` in the script.

## SEO conventions

Every public page has:

- a `<title>` ending in " - Follow your code" and a unique meta description (about 110-160 characters, taken from the page's own text), with `og:title` / `og:description` matching;
- `canonical` and `og:url` set to the page's absolute URL on `https://www.followyourcode.pl/` (www, trailing slash; the apex domain redirects to www);
- `og:image`: the poster photo on posts, otherwise `assets/img/og-image.jpg` (1200x630, with width, height and alt), plus `twitter:card`;
- `alt` on every image, and `width`/`height` with the image's real pixel size.

The homepage carries Organization and WebSite JSON-LD; posts carry BlogPosting and BreadcrumbList JSON-LD and `article:published_time`. `robots.txt`, `sitemap.xml`, `llms.txt` and the RSS feeds (`index.xml`, `blog/index.xml`, `tags/**/index.xml`) are maintained by hand.

## Blog posts

A new post `blog/<slug>/` (slug in Polish without diacritics, kebab-case) touches:

1. `blog/<slug>/index.html` - copy the newest post, then replace the title, description, canonical, `og:*`, `article:published_time`, the JSON-LD, the page header and the article.
2. `blog/index.html` - a new card at the top.
3. Each of its tags: a card on `tags/<tag>/index.html` and the count on `tags/index.html`. A new tag gets its own page and `index.xml`, copied from an existing tag.
4. Feeds: a new `<item>` at the top of `index.xml`, `blog/index.xml` and each `tags/<tag>/index.xml`.
5. `sitemap.xml` (the new URL, and a fresh `lastmod` for the home, blog and tag pages) and the Aktualności list in `llms.txt`.

Then run `node scripts/build.mjs`. Photos are hosted on Cloudinary (account `codeup-images`, folder `followyourcode/`); the authors upload them, so ask for the URLs. Card images use `c_fill,w_960,h_600,f_auto,q_auto` (16:10).

## Deploy, repo, privacy

- Production is https://www.followyourcode.pl on AWS Amplify (CloudFront + S3), built from `amplify.yml`: `node scripts/build.mjs`, then `dist/` is deployed. Amplify serves `404.html` for missing paths. Treat a push to `main` as publishing the live site: confirm with the user first.
- `origin` is the co-author's GitHub repo; both authors push to `main`. Never force-push or rewrite history. `.github/workflows/github.yaml` is GitHub's hello-world placeholder and builds nothing.
- Analytics: GA4, ID in `data-ga-id` on the cookie popup of every page. GA is opt-in: `assets/js/main.js` loads gtag only after "Akceptuję", and only on the followyourcode.pl hostname, so local previews never reach GA. The choice is kept in the `cookie_consent` cookie for 180 days, "Ustawienia cookies" in the footer reopens the popup, and rejecting deletes the `_ga*` cookies. Never add a tracker or third-party embed that runs before consent.
- `polityka-prywatnosci/index.html` names both authors as data administrators and describes the consent popup - update it whenever a change collects data (forms, trackers, third-party embeds).

## Done means

`node scripts/build.mjs` passes, then the changed page is opened through `node scripts/serve.mjs` at desktop and phone width (about 1440 and 390 px). Homepage changes: check the homepage. Blog posts: check the post, its card on `/blog/` and its tag pages.
