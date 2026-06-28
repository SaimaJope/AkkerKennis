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

/* Brief branded page loader — smooths the gap between page navigations while the
   app renders and the session restores. Uses the site's green palette and is
   removed on window load (with a short minimum so it never just flickers, and a
   hard cap so it can never get stuck). Sits below the PIN gate's z-index. */
(function () {
  'use strict';
  var root = document.documentElement;
  var css = document.createElement('style');
  css.id = 'ak-loader-css';
  css.textContent = [
    '#ak-loader{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147482000;',
    'display:flex;align-items:center;justify-content:center;',
    'background:radial-gradient(1200px 600px at 50% -10%,#effbe7 0%,rgba(239,251,231,0) 60%),',
    'linear-gradient(160deg,#e3fbd8 0%,#d4f4c6 100%);transition:opacity .35s ease;}',
    '#ak-loader.ak-loader-out{opacity:0;pointer-events:none;}',
    '.ak-load-anim{--c1:#16361e;--c2:#8ee05e;--s:1.7px;width:calc(64*var(--s));height:calc(48*var(--s));',
    'position:relative;animation:ak-split 1s ease-in infinite alternate;}',
    '.ak-load-anim::before,.ak-load-anim::after{content:"";position:absolute;height:calc(48*var(--s));',
    'width:calc(48*var(--s));border-radius:50%;left:0;top:0;transform:translateX(calc(-10*var(--s)));',
    'background:var(--c1);opacity:0.8;}',
    '.ak-load-anim::after{left:auto;right:0;background:var(--c2);transform:translateX(calc(10*var(--s)));}',
    '@keyframes ak-split{0%,25%{width:calc(64*var(--s));}100%{width:calc(148*var(--s));}}'
  ].join('');
  (document.head || root).appendChild(css);

  function mount() {
    if (document.getElementById('ak-loader')) return;
    var o = document.createElement('div');
    o.id = 'ak-loader';
    o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<span class="ak-load-anim"></span>';
    document.body.appendChild(o);
    var shown = Date.now();
    var removed = false;
    function done() {
      if (removed) return; removed = true;
      var wait = Math.max(0, 300 - (Date.now() - shown));
      setTimeout(function () {
        o.classList.add('ak-loader-out');
        setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 380);
      }, wait);
    }
    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done);
    setTimeout(done, 3000);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
