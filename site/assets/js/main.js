/* Follow Your Code - interactions. Vanilla JS, no dependencies. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  /* ---------- Header border once the page scrolls ---------- */
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    root.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    } else {
      menu.classList.remove('is-open');
      const done = () => { if (!menu.classList.contains('is-open')) menu.hidden = true; };
      reduceMotion ? done() : setTimeout(done, 260);
    }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('menu-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Hero: cursor spotlight + parallax ---------- */
  const hero = $('[data-hero]');
  if (hero && finePointer && !reduceMotion) {
    const layers = $$('[data-depth]', hero);
    let raf = 0;
    let px = 0;
    let py = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          layers.forEach((el) => {
            const d = Number(el.dataset.depth);
            el.style.setProperty('--px', `${(px * d).toFixed(2)}px`);
            el.style.setProperty('--py', `${(py * d).toFixed(2)}px`);
          });
        });
      }
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--mx', '-999px');
      hero.style.setProperty('--my', '-999px');
      layers.forEach((el) => {
        el.style.setProperty('--px', '0px');
        el.style.setProperty('--py', '0px');
      });
    });
  }

  /* ---------- Hero: typing code card ---------- */
  const typer = $('[data-typer]');
  if (typer) {
    const code = [
      [['kw', 'def '], ['fn', 'follow_your_code'], ['p', '():']],
      [['', '    '], ['kw', 'while '], ['var', 'ciekawość'], ['p', ':']],
      [['', '        '], ['fn', 'odkrywaj'], ['p', '()']],
      [['', '        '], ['fn', 'programuj'], ['p', '()']],
      [['', '        '], ['fn', 'inspiruj'], ['p', '()']],
      [],
      [['fn', 'follow_your_code'], ['p', '()'], ['cm', '  # start!']],
    ];
    const lineEls = code.map((_, i) => {
      const line = document.createElement('span');
      line.className = 'code-line';
      const ln = document.createElement('span');
      ln.className = 'ln';
      ln.textContent = String(i + 1);
      line.appendChild(ln);
      typer.appendChild(line);
      if (i < code.length - 1) typer.appendChild(document.createTextNode('\n'));
      return line;
    });
    const caret = document.createElement('span');
    caret.className = 'type-caret';

    const renderFull = () => {
      code.forEach((tokens, i) => {
        tokens.forEach(([cls, text]) => {
          const s = document.createElement('span');
          if (cls) s.className = `tk-${cls}`;
          s.textContent = text;
          lineEls[i].appendChild(s);
        });
      });
      lineEls[lineEls.length - 1].appendChild(caret);
    };

    if (reduceMotion) {
      renderFull();
    } else {
      let li = 0;
      let ti = 0;
      let ci = 0;
      let current = null;
      const step = () => {
        if (li >= code.length) return;
        const tokens = code[li];
        if (ti >= tokens.length) {
          li += 1;
          ti = 0;
          ci = 0;
          current = null;
          if (li < code.length) {
            lineEls[li].appendChild(caret);
            setTimeout(step, 220);
          }
          return;
        }
        const [cls, text] = tokens[ti];
        if (!current) {
          current = document.createElement('span');
          if (cls) current.className = `tk-${cls}`;
          lineEls[li].insertBefore(current, caret);
        }
        // Indentation appears at once, everything else is typed.
        if (!cls && /^\s+$/.test(text)) {
          current.textContent = text;
          ci = text.length;
        } else {
          current.textContent = text.slice(0, ci + 1);
          ci += 1;
        }
        if (ci >= text.length) {
          ti += 1;
          ci = 0;
          current = null;
        }
        setTimeout(step, 38 + Math.random() * 55);
      };
      lineEls[0].appendChild(caret);
      setTimeout(step, 1100);
    }
  }

  /* ---------- Testimonials: dots for the mobile carousel ---------- */
  const track = $('[data-t-track]');
  const dots = $$('[data-t-dots] button');
  if (track && dots.length) {
    const cards = $$('.t-card', track);
    const syncDots = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - center);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === best));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(syncDots), { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => {
      track.scrollTo({ left: cards[i].offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' });
    }));
    syncDots();
  }

  /* ---------- Copy e-mail ---------- */
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Clipboard API unavailable (e.g. non-secure context): fall back to a temporary textarea.
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    }
  };
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    btn.addEventListener('click', async () => {
      if (!(await copyText(btn.dataset.copy))) return;
      btn.classList.add('is-done');
      label.textContent = 'Skopiowano!';
      setTimeout(() => {
        btn.classList.remove('is-done');
        label.textContent = 'Kopiuj';
      }, 2200);
    });
  });

  /* ---------- Cookie consent (UI only) ----------
     The template only shows the dialog. The real consent logic - the cookie_consent cookie,
     loading gtag after "Akceptuję", deleting _ga* cookies on "Odrzuć" - is still to be
     ported from the Hugo site (assets/js/shared/_cookies.js). Nothing is tracked here. */
  const cookie = $('[data-cookie]');
  const PREVIEW_KEY = 'fyc-cookie-preview';
  if (cookie) {
    const showCookie = () => {
      cookie.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => cookie.classList.add('is-visible')));
    };
    const hideCookie = () => {
      cookie.classList.remove('is-visible');
      setTimeout(() => { cookie.hidden = true; }, reduceMotion ? 0 : 320);
    };
    let decided = false;
    try { decided = Boolean(sessionStorage.getItem(PREVIEW_KEY)); } catch { /* storage blocked */ }
    if (!decided) setTimeout(showCookie, 1200);
    $$('[data-cookie-choice]', cookie).forEach((b) => b.addEventListener('click', () => {
      try { sessionStorage.setItem(PREVIEW_KEY, b.dataset.cookieChoice); } catch { /* storage blocked */ }
      hideCookie();
    }));
    $$('[data-cookie-open]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      showCookie();
    }));
  }

  /* ---------- Footer year ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
