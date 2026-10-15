/* Follow Your Code - interactions. Vanilla JS, no dependencies. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /* ---------- Story: active step + progress line ---------- */
  const story = $('[data-story]');
  const storyItems = $$('[data-story-item]');
  const storyList = story ? $('.story__list', story) : null;
  const storyNum = $('[data-story-num]');
  const storyLabel = $('[data-story-label]');
  let activeIndex = 0;

  const setActive = (i) => {
    if (i === activeIndex) return;
    activeIndex = i;
    storyItems.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    if (storyNum) {
      storyNum.textContent = String(i + 1).padStart(2, '0');
      storyLabel.textContent = storyItems[i].dataset.label;
      storyNum.classList.remove('is-changing');
      void storyNum.offsetWidth;
      storyNum.classList.add('is-changing');
    }
  };

  const updateStoryFill = () => {
    if (!storyList) return;
    const r = storyList.getBoundingClientRect();
    const focus = window.innerHeight * 0.55;
    const fill = clamp((focus - r.top) / r.height, 0, 1);
    storyList.style.setProperty('--fill', fill.toFixed(4));
    // The active step is the last one whose top has passed the focus line.
    let idx = 0;
    storyItems.forEach((el, i) => {
      if (el.getBoundingClientRect().top < focus) idx = i;
    });
    setActive(idx);
  };

  /* ---------- Header state + story progress on scroll ---------- */
  const nav = $('[data-nav]');
  let scrollQueued = false;
  const onScroll = () => {
    scrollQueued = false;
    nav.classList.toggle('is-scrolled', window.scrollY > 16);
    updateStoryFill();
  };
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('resize', updateStoryFill);
  onScroll();

  /* ---------- Desktop nav: sliding hover pill ---------- */
  const links = $('[data-nav-links]');
  if (links) {
    const pill = $('.nav__pill', links);
    $$('a', links).forEach((a) => {
      a.addEventListener('mouseenter', () => {
        pill.style.width = `${a.offsetWidth}px`;
        pill.style.transform = `translateX(${a.offsetLeft}px)`;
        pill.style.opacity = '1';
      });
    });
    links.addEventListener('mouseleave', () => { pill.style.opacity = '0'; });
  }

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
  const settle = (el) => {
    // Once revealed, drop the attribute so the element's own transitions (active story card) take over again.
    const onEnd = (e) => {
      if (e.target === el && e.propertyName === 'opacity') {
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--d');
        el.removeEventListener('transitionend', onEnd);
      }
    };
    el.addEventListener('transitionend', onEnd);
  };
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          settle(entry.target);
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

  /* ---------- CTA: starfield, countdown, rocket launch ---------- */
  const cta = $('[data-cta]');
  if (cta) {
    const canvas = $('.cta__stars', cta);
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars = [];
    let w = 0;
    let h = 0;
    let speed = 0.35;
    let targetSpeed = 0.35;
    let running = false;
    let rafId = 0;

    const resize = () => {
      const r = cta.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 5200);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.9 + 0.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      speed += (targetSpeed - speed) * 0.06;
      for (const s of stars) {
        s.y += speed * s.z * 1.6;
        if (s.y > h + 20) { s.y = -20; s.x = Math.random() * w; }
        const len = Math.max(0, (speed - 1) * s.z * 6);
        ctx.globalAlpha = 0.25 + s.z * 0.75;
        ctx.fillStyle = '#ffffff';
        if (len > 1) {
          ctx.fillRect(s.x, s.y - len, s.z * 1.6, len);
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.z * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (running) rafId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', () => { resize(); if (!running) draw(); });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      draw();
    } else {
      new IntersectionObserver(([entry]) => {
        running = entry.isIntersecting;
        if (running) { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(draw); }
      }).observe(cta);
    }

    // Countdown runs once when the panel comes into view; without motion it shows the last step.
    const countdown = $('[data-countdown]', cta);
    const steps = ['> start za 3...', '> start za 2...', '> start za 1...', '> start! ✦'];
    if (countdown && (reduceMotion || !('IntersectionObserver' in window))) {
      countdown.textContent = steps[steps.length - 1];
    } else if (countdown) {
      const cio = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        cio.disconnect();
        steps.forEach((txt, i) => setTimeout(() => { countdown.textContent = txt; }, 600 + i * 800));
      }, { threshold: 0.5 });
      cio.observe(cta);
    }

    // Hovering "Kontakt" warms up the engine; staying a moment launches the rocket.
    const launchBtn = $('[data-launch]', cta);
    if (launchBtn && finePointer && !reduceMotion) {
      let launchTimer = 0;
      launchBtn.addEventListener('pointerenter', () => {
        if (cta.classList.contains('is-launching')) return;
        cta.classList.add('is-ready');
        targetSpeed = 1.6;
        clearTimeout(launchTimer);
        launchTimer = setTimeout(() => {
          cta.classList.remove('is-ready');
          cta.classList.add('is-launching');
          targetSpeed = 9;
          setTimeout(() => { targetSpeed = 0.35; }, 1400);
          setTimeout(() => cta.classList.remove('is-launching'), 3600);
        }, 900);
      });
      launchBtn.addEventListener('pointerleave', () => {
        if (cta.classList.contains('is-launching')) return;
        clearTimeout(launchTimer);
        cta.classList.remove('is-ready');
        targetSpeed = 0.35;
      });
    }
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
