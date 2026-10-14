# followyourcode.pl

Website of **Follow Your Code**, a hobby, pro bono initiative run by Łukasz Kobylski and Łukasz Sudoł. They spread passion for programming, new technologies, AI and security through free workshops, lessons and talks, mostly for primary and secondary school students, occasionally for adults (e.g. an AI workshop for public-sector staff). The published offer (programming workshops, lessons about the programmer profession and the history of programming, educational projects) is in `content/co-robimy.md` - that file is the source of truth for the wording.

## Not Space To Grow

A private hobby project, fully separate from the authors' S2G day job. Nothing from S2G belongs here:

- no S2G branding (logo, colours, fonts, templates, `s2g-*` skills) - the site keeps its own look,
- no S2G tools or data (S2G reports, S2G databases, Jira/Confluence, Slack),
- the only S2G mention on the site is the employer line in one founder's bio on `/o-nas`; leave it as the authors wrote it.

## Content rules

- Visitor-facing copy is Polish. Keep the existing warm, plain tone, including the courtesy capitalisation "Nas / Nasze".
- Audience: teachers, schools, parents, organisers. Participants are children and teenagers.
- Never invent facts: events, dates, participant counts, partners, quotes. Testimonials in `data/home/testimonials.yaml` (rendered on the homepage and on `/o-nas/`) are real statements by named teachers; change them only with text the authors provide.
- Workshop photos often show minors. Use only photos the authors supply and never name a child.
- Everything is free. No prices, fees or sales language.

## Commands

- `hugo server` - local preview at http://localhost:1313 with live reload.
- `hugo --minify` - production build into `public/` (gitignored), the same command Amplify runs.
- Hugo **extended 0.152.1** (Homebrew locally). The version is pinned in `amplify.yml` and `.github/workflows/hugo.yml`; bump both together.
- A clean build prints no WARN or ERROR. With `--printPathWarnings` it also reports a pre-existing `Duplicate target paths: /site.webmanifest` (favicon partial), which is known.

## Where things live

| What | Where |
|---|---|
| Site title, description, GA ID, social links, contact, menus (`main`, `footer`) | `config.yaml` |
| Homepage sections: hero, brands, portfolio, testimonials, cta | `data/home/*.yaml`; which sections render and in what order: `themes/up-business-theme/layouts/index.html` |
| Pages: co-robimy, kontakt, polityka-prywatnosci | `content/*.md` |
| "O nas" bio cards and avatars | hardcoded in `themes/up-business-theme/layouts/_default/o-nas.html` (the page also reuses the homepage testimonials partial); `content/o-nas.md` only sets title and layout |
| Blog ("Aktualności") | `content/blog/<slug>/index.md` |
| Templates, SCSS, JS (cookie popup, Bootstrap) | `themes/up-business-theme/layouts/`, `assets/scss/`, `assets/js/` |
| Homepage images (hero, portfolio, brand logos) | `assets/images/` (root assets override theme assets by path) |
| Downloadable files | `static/files/` |

The theme is a vendored copy of [up-business-theme](https://gitlab.com/writeonlyhugo/up-business-theme), modified in place over the years (Hugo compatibility, Polish footer, cookie popup, o-nas layout, testimonials). There is no root `layouts/` and no upstream to stay in sync with: edit theme files directly.

Leftovers that nothing renders or links - do not copy patterns from them: `data/services.yaml`, `data/testimonials.yaml` (theme demo, lorem ipsum), `info.txt`, `content/formularz.html` (old Typeform embed), `content/archives.md` (its layout does not exist), `themes/up-business-theme/hugoBasicExample/`.

## Blog posts

- One page bundle per post: `content/blog/<slug>/index.md`, slug in Polish without diacritics, kebab-case.
- TOML front matter, as in the existing posts:

  ```toml
  +++
  author = "Łukasz Kobylski"
  title = "Warsztaty w ..."
  date = "YYYY-MM-DD"
  poster = "https://res.cloudinary.com/codeup-images/image/upload/c_fit,w_320/followyourcode/<file>.jpg"
  description = "One sentence for search results and link previews."
  tags = ["warsztaty", "programowanie"]
  draft = false
  +++
  ```

- `poster` is the card image on `/blog/`. Without it the card falls back to `images[0]` from the front matter, then to the site-wide `rocket.png`.
- Fill `description`: it is the page's meta description. Empty falls back to the site description, which every existing post currently does.
- Photos are hosted on Cloudinary (account `codeup-images`, folder `followyourcode/`) and embedded as raw HTML (goldmark `unsafe: true`). The authors upload them; ask for the URLs.

  ```html
  <p class="text-center">
      <img class="rounded img-thumbnail img-fluid mx-auto d-block" src="https://res.cloudinary.com/codeup-images/image/upload/c_scale,w_1024/followyourcode/<folder>/<file>.jpg" alt="..." title="followyourcode.pl"/>
  </p>
  ```

  A local image can instead live in the bundle: `![Plakat](plakat.png)` with `{.text-center}` on the next line (see `content/blog/zapraszamy-na-dzien-dziecka/`).
- Reuse existing tags (`warsztaty`, `programowanie`, `nauka`, `roboty`, `sztuczna inteligencja`, `ai`, ...). Every new tag gets its own public page.

## Deploy, repo, privacy

- Production is https://www.followyourcode.pl on AWS Amplify (CloudFront + S3), built from `amplify.yml`. The apex domain 302-redirects to `www`. Treat a push to `main` as publishing the live site: confirm with the user first.
- `.github/workflows/hugo.yml` is the old deploy to a VPS at `followyourcode.kobylski.dev` over SCP, disabled with `if: false` on both jobs. `.github/workflows/github.yaml` is GitHub's hello-world placeholder and builds nothing.
- `origin` is the co-author's GitHub repo; both authors push to `main`. Never force-push or rewrite history.
- Analytics: GA4, ID in `googleAnalytics` in `config.yaml`. GA is opt-in: nothing in `<head>`; the theme's `layouts/partials/shared/cookies.html` passes the ID to `assets/js/shared/_cookies.js`, which loads gtag only after "Akceptuję" (choice kept in the `cookie_consent` cookie for 180 days; "Ustawienia cookies" in the footer reopens the popup, rejecting deletes `_ga*` cookies). Never add a tracker or third-party embed that runs before consent.
- The ID is emitted only in production builds, so plain `hugo server` shows no popup and sends nothing to GA. To test the consent flow use `hugo server --environment production` and block `googletagmanager.com` in the browser so test visits do not reach the real GA property.
- `content/polityka-prywatnosci.md` names both authors as data administrators and describes the consent popup - update it whenever a change collects data (forms, trackers, third-party embeds).

## Done means

`hugo --minify` with no new warnings, then the changed page opened in `hugo server` at desktop and phone width. Homepage or `data/` changes: check the homepage. Blog posts: check the post and its card on `/blog/`.
