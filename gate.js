/* AkkerKennis access gate — lightweight client-side PIN screen.
 *
 * NOTE: this is a static site, so the check runs in the browser. It keeps
 * casual visitors out, but anyone technical can read the PIN from this file
 * or bypass the overlay via dev tools. For real protection use a host with
 * server-side auth (Cloudflare Access, Netlify password protection, etc.).
 *
 * To change the code, edit PIN below. To make the unlock persist on the
 * device instead of per browser session, swap sessionStorage for localStorage.
 */
(function () {
  'use strict';

  var PIN = '1234';
  var KEY = 'ak_gate_ok';
  var LEN = PIN.length;
  var store = null;

  // Already unlocked this session — let the page through untouched.
  // (sessionStorage access itself can throw in some sandboxed contexts.)
  try { store = window.sessionStorage; if (store && store.getItem(KEY) === '1') return; } catch (e) { store = null; }

  var entered = '';
  var locked = true;

  // Lock scrolling and inject styling immediately, before any content paints.
  var css = document.createElement('style');
  css.id = 'ak-gate-css';
  css.textContent = [
    'html.ak-locked, html.ak-locked body{overflow:hidden!important;height:100%!important;}',
    '#ak-gate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;',
    'justify-content:center;padding:24px;box-sizing:border-box;',
    "font-family:'Ubuntu',Arial,sans-serif;color:#16361e;-webkit-tap-highlight-color:transparent;",
    'background:radial-gradient(1200px 600px at 50% -10%,#effbe7 0%,rgba(239,251,231,0) 60%),',
    'linear-gradient(160deg,#e3fbd8 0%,#d4f4c6 100%);animation:ak-fade .35s ease both;}',
    '#ak-gate.ak-done{animation:ak-out .4s ease forwards;pointer-events:none;}',
    '@keyframes ak-fade{from{opacity:0}to{opacity:1}}',
    '@keyframes ak-out{from{opacity:1}to{opacity:0;visibility:hidden}}',
    '#ak-card{width:100%;max-width:360px;box-sizing:border-box;background:#fff;',
    'border:1px solid rgba(22,54,30,0.13);border-radius:24px;',
    'box-shadow:0 24px 60px -20px rgba(16,40,22,0.35);padding:36px 30px 28px;text-align:center;}',
    '#ak-card.ak-shake{animation:ak-shake .42s cubic-bezier(.36,.07,.19,.97) both;}',
    '@keyframes ak-shake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}',
    '30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}',
    '.ak-logo{width:56px;height:56px;border-radius:50%;display:block;margin:0 auto 14px;}',
    '.ak-brand{font-size:22px;font-weight:700;letter-spacing:.2px;margin:0 0 2px;}',
    '.ak-title{font-size:15px;color:#5a7060;margin:0 0 22px;font-weight:500;}',
    '#ak-dots{display:flex;gap:14px;justify-content:center;margin:0 auto 4px;}',
    '.ak-dot{width:14px;height:14px;border-radius:50%;background:transparent;',
    'border:2px solid rgba(22,54,30,0.28);box-sizing:border-box;',
    'transition:transform .15s ease,background .15s ease,border-color .15s ease;}',
    '.ak-dot.filled{background:#16361e;border-color:#16361e;transform:scale(1.08);}',
    '#ak-error{min-height:20px;margin:12px 0 16px;font-size:13px;font-weight:600;color:#fe4c24;}',
    '#ak-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}',
    '.ak-key{height:60px;border:1px solid rgba(22,54,30,0.14);border-radius:16px;background:#f4fcec;',
    "color:#16361e;font-family:inherit;font-size:24px;font-weight:600;cursor:pointer;",
    'display:flex;align-items:center;justify-content:center;user-select:none;',
    'transition:transform .08s ease,background .15s ease,border-color .15s ease;}',
    '.ak-key:hover{background:#e3fbd8;border-color:rgba(22,54,30,0.3);}',
    '.ak-key:active{transform:scale(.95);background:#d4f4c6;}',
    '.ak-key.ak-ghost{background:transparent;border-color:transparent;cursor:default;}',
    '.ak-key.ak-back svg{width:26px;height:26px;}',
    '.ak-hint{margin:18px 0 0;font-size:12px;color:#8aa088;letter-spacing:.2px;}'
  ].join('');
  (document.head || document.documentElement).appendChild(css);
  document.documentElement.classList.add('ak-locked');

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function build() {
    if (document.getElementById('ak-gate')) return;

    var gate = document.createElement('div');
    gate.id = 'ak-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-label', 'Enter access code');

    var keys = '';
    for (var n = 1; n <= 9; n++) keys += '<button type="button" class="ak-key" data-k="' + n + '">' + n + '</button>';
    keys += '<button type="button" class="ak-key ak-ghost" tabindex="-1" aria-hidden="true"></button>';
    keys += '<button type="button" class="ak-key" data-k="0">0</button>';
    keys += '<button type="button" class="ak-key ak-back" data-k="back" aria-label="Delete">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="#16361e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M21 4H8l-7 8 7 8h13a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"/><path d="M18 9l-6 6M12 9l6 6"/></svg></button>';

    gate.innerHTML =
      '<div id="ak-card">' +
        '<img class="ak-logo" src="assets/logo.png" alt="" width="56" height="56" />' +
        '<div class="ak-brand">AkkerKennis</div>' +
        '<p class="ak-title">Enter access code to continue</p>' +
        '<div id="ak-dots"></div>' +
        '<div id="ak-error" aria-live="polite"></div>' +
        '<div id="ak-pad">' + keys + '</div>' +
        '<p class="ak-hint">Protected area</p>' +
      '</div>';

    document.body.appendChild(gate);

    var card = gate.querySelector('#ak-card');
    var dotsEl = gate.querySelector('#ak-dots');
    var errEl = gate.querySelector('#ak-error');

    function renderDots() {
      var html = '';
      for (var i = 0; i < LEN; i++) html += '<span class="ak-dot' + (i < entered.length ? ' filled' : '') + '"></span>';
      dotsEl.innerHTML = html;
    }
    renderDots();

    function success() {
      try { if (store) store.setItem(KEY, '1'); } catch (e) {}
      locked = false;
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.classList.remove('ak-locked');
      gate.classList.add('ak-done');
      setTimeout(function () {
        if (gate.parentNode) gate.parentNode.removeChild(gate);
        if (css.parentNode) css.parentNode.removeChild(css);
      }, 420);
    }

    function fail() {
      errEl.textContent = 'Incorrect code. Try again.';
      card.classList.remove('ak-shake');
      // reflow so the animation can replay on consecutive wrong entries
      void card.offsetWidth;
      card.classList.add('ak-shake');
      entered = '';
      renderDots();
    }

    function check() {
      if (entered.length < LEN) return;
      if (entered === PIN) success();
      else fail();
    }

    function press(d) {
      if (!locked || entered.length >= LEN) return;
      errEl.textContent = '';
      entered += d;
      renderDots();
      if (entered.length === LEN) setTimeout(check, 140);
    }

    function back() {
      if (!locked) return;
      errEl.textContent = '';
      entered = entered.slice(0, -1);
      renderDots();
    }

    gate.querySelector('#ak-pad').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var k = b.getAttribute('data-k');
      if (k === 'back') back();
      else if (k !== null) press(k);
    });

    function onKey(e) {
      if (!locked) return;
      if (e.key >= '0' && e.key <= '9') { press(e.key); e.preventDefault(); }
      else if (e.key === 'Backspace') { back(); e.preventDefault(); }
    }
    document.addEventListener('keydown', onKey, true);
  });
})();
