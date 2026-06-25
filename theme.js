/* AkkerKennis dark-mode toggle.
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
