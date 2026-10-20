# followyourcode.pl

Website of Follow Your Code: https://www.followyourcode.pl

Plain HTML, CSS and JS at the repository root, edited by hand. There is no build step and no dependencies; Node.js is needed only for the two scripts:

    node scripts/serve.mjs    # local preview at http://127.0.0.1:8000
    npm run build             # copy the site into dist/ and check it (the hosting runs this on deploy)

How pages, blog posts and the SEO files are maintained is described in [AGENTS.md](AGENTS.md). The previous Hugo site is kept in [legacy/](legacy/).
