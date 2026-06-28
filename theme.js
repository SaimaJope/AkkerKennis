/* AkkerBooster dark-mode toggle.
 *
 * The site is built from many standalone pages that share inline-styled
 * components, so instead of re-theming every colour by hand we flip the whole
 * page with a CSS filter: invert() swaps the white backgrounds and dark text,
 * and hue-rotate(180deg) keeps the brand greens looking roughly themselves.
 * Images, video and the map are counter-inverted so the logo and photos keep
 * their real colours.
 *
 * The choice is saved in localStorage and applied here in <head> — before the
 * page paints — so navigating between pages keeps the theme with no flash.
 * The footer's "Turn on/off dark mode" text calls window.akToggleDark().
 */
(function () {
  'use strict';

  var KEY = 'ak_dark';
  var root = document.documentElement;

  function injectResponsiveCss() {
    if (document.getElementById('ak-responsive-css')) return;
    var link = document.createElement('link');
    link.id = 'ak-responsive-css';
    link.rel = 'stylesheet';
    link.href = './responsive.css';
    link.media = 'screen';
    (document.head || root).appendChild(link);
  }

  function injectCss() {
    if (document.getElementById('ak-dark-css')) return;
    var s = document.createElement('style');
    s.id = 'ak-dark-css';
    // The filter goes on #dc-root (the app mount), not <html> or <body>:
    //  - <html> is the scroll container, and filtering it would break the
    //    sticky header; #dc-root isn't, so sticky keeps working.
    //  - the PIN gate (gate.js) is a sibling of #dc-root, so it stays untouched.
    // <html> just carries a dark backdrop for the overscroll area.
    s.textContent = [
      'html.ak-dark{background:#0f140f;}',
      'html.ak-dark #dc-root{filter:invert(1) hue-rotate(180deg);}',
      'html.ak-dark #dc-root img,',
      'html.ak-dark #dc-root video,',
      'html.ak-dark #dc-root iframe,',
      'html.ak-dark #dc-root canvas,',
      'html.ak-dark #dc-root [data-ak-keep]{filter:invert(1) hue-rotate(180deg);}'
    ].join('');
    (document.head || root).appendChild(s);
  }

  function apply(on) {
    injectCss();
    root.classList.toggle('ak-dark', !!on);
  }

  injectResponsiveCss();

  // Restore the saved preference before first paint.
  var saved = '0';
  try { saved = localStorage.getItem(KEY) || '0'; } catch (e) {}
  if (saved === '1') apply(true);

  // Called by the footer toggle. Returns the new state so the label can update.
  window.akToggleDark = function () {
    var on = !root.classList.contains('ak-dark');
    apply(on);
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    return on;
  };

  window.akIsDark = function () {
    return root.classList.contains('ak-dark');
  };
})();

/* Navigation performance — no loading screen, just make pages feel instant.
   1) Native cross-document View Transitions (Chrome): the page swap becomes a
      soft crossfade instead of a freeze-then-snap. Ignored where unsupported.
   2) Preconnect to the Firebase/Google origins so the SDK + data connect sooner.
   3) Prefetch internal pages on hover/touch so the click navigates from cache. */
(function () {
  'use strict';
  var head = document.head || document.documentElement;

  // 1) Smooth same-origin page transitions where supported.
  var vt = document.createElement('style');
  vt.id = 'ak-view-transition';
  vt.textContent = '@view-transition{navigation:auto;}';
  head.appendChild(vt);

  function addLink(rel, href, opts) {
    opts = opts || {};
    var l = document.createElement('link');
    l.rel = rel; l.href = href;
    if (opts.cross) l.crossOrigin = 'anonymous';
    if (opts.as) l.as = opts.as;
    head.appendChild(l);
    return l;
  }

  // 2) Warm up the connections the app uses.
  addLink('preconnect', 'https://www.gstatic.com', { cross: true });
  addLink('preconnect', 'https://firestore.googleapis.com', { cross: true });

  // 3) Prefetch internal .html pages the moment the user shows intent.
  var seen = {};
  function prefetch(url) {
    if (seen[url]) return;
    seen[url] = 1;
    addLink('prefetch', url, { as: 'document' });
  }
  function intentTarget(e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a || !a.href || a.origin !== location.origin) return null;
    if (a.hasAttribute('download') || a.target === '_blank') return null;
    if (!/\.html(\?|$)/.test(a.pathname)) return null;
    var url = a.href.split('#')[0];
    if (url === location.href.split('#')[0]) return null;
    return url;
  }
  function onIntent(e) { var u = intentTarget(e); if (u) prefetch(u); }
  document.addEventListener('mouseover', onIntent, { capture: true, passive: true });
  document.addEventListener('touchstart', onIntent, { capture: true, passive: true });
})();

/* Branded page loader.
   A short, on-brand cover for the gap while the framework hydrates and the
   first data arrives — not a fake delay. It is removed the moment the app
   finishes its first render: support.js carries `html.sc-dc-streaming` while
   any component is still rendering, so we fade out as soon as that clears.
   A tiny minimum on-screen time keeps it from flickering on instant loads,
   and hard fallbacks (window load + an 8s safety net) guarantee it can never
   get stuck. It sits below the PIN gate, so a locked page shows the gate. */
(function () {
  'use strict';
  var root = document.documentElement;

  function now() {
    return (window.performance && performance.now) ? performance.now() : +new Date();
  }

  var css = document.createElement('style');
  css.id = 'ak-loader-css';
  css.textContent = [
    '#ak-loader{position:fixed;inset:0;z-index:2147482000;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;gap:22px;box-sizing:border-box;padding:24px;',
      "font-family:'Ubuntu',Arial,sans-serif;color:#16361e;",
      'background:radial-gradient(1200px 600px at 50% -10%,#effbe7 0%,rgba(239,251,231,0) 60%),',
      'linear-gradient(160deg,#e3fbd8 0%,#d4f4c6 100%);',
      'opacity:1;transition:opacity .42s ease;}',
    '#ak-loader.ak-loader-out{opacity:0;pointer-events:none;}',
    '#ak-loader .ak-l-badge{position:relative;width:84px;height:84px;display:flex;',
      'align-items:center;justify-content:center;}',
    '#ak-loader .ak-l-ring{position:absolute;inset:0;border-radius:50%;',
      'border:3px solid rgba(22,54,30,0.14);border-top-color:#16361e;',
      'animation:ak-l-spin .9s linear infinite;}',
    '#ak-loader .ak-l-logo{width:56px;height:56px;border-radius:50%;display:block;}',
    '#ak-loader .ak-l-word{display:inline-flex;align-items:center;gap:9px;',
      'font-size:15px;font-weight:600;letter-spacing:.2px;}',
    '#ak-loader .ak-l-dot{width:8px;height:8px;border-radius:50%;background:#8ee05e;',
      'animation:ak-l-pulse 1s ease-in-out infinite;}',
    '@keyframes ak-l-spin{to{transform:rotate(360deg);}}',
    '@keyframes ak-l-pulse{0%,100%{opacity:.35;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}',
    '@media (prefers-reduced-motion:reduce){#ak-loader .ak-l-ring,#ak-loader .ak-l-dot{animation:none;}}'
  ].join('');
  (document.head || root).appendChild(css);

  var el = document.createElement('div');
  el.id = 'ak-loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'Loading');
  el.innerHTML =
    '<div class="ak-l-badge"><span class="ak-l-ring"></span>' +
      '<img class="ak-l-logo" src="assets/logo.png" alt="" width="56" height="56" /></div>' +
    '<div class="ak-l-word"><span class="ak-l-dot"></span>Loading AkkerBooster…</div>';
  (document.body || root).appendChild(el);

  var MIN_MS = 320;
  var mountedAt = now();
  var sawStreaming = root.classList.contains('sc-dc-streaming');
  var removed = false;
  var mo = null;

  function finish() {
    if (removed) return;
    removed = true;
    if (mo) { mo.disconnect(); mo = null; }
    var wait = Math.max(0, MIN_MS - (now() - mountedAt));
    setTimeout(function () {
      el.classList.add('ak-loader-out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (css.parentNode) css.parentNode.removeChild(css);
      }, 460);
    }, wait);
  }

  // Primary signal: the framework toggles sc-dc-streaming off when the first
  // render pass completes. Remove the loader the moment that happens.
  if (window.MutationObserver) {
    mo = new MutationObserver(function () {
      if (root.classList.contains('sc-dc-streaming')) { sawStreaming = true; return; }
      if (sawStreaming) finish();
    });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }

  // Fallback for pages that render before the observer ever sees streaming.
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (!root.classList.contains('sc-dc-streaming')) finish();
    }, 60);
  });

  // Absolute safety net — the loader must never outlive the page.
  setTimeout(finish, 8000);
})();
