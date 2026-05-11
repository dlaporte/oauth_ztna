/* Boot: wire route handlers from PL_routes into PL_app's router and start the app */
(function () {
'use strict';
const { $, $$, setHTML, annotateAcronyms } = window.PL_app;

// Live-first ordering: Flow Lab is the entry point right after Overview.
const ORDER = [
  'home','flow-lab',
  'oauth','oauth-vs-oidc','tokens','three-layers','scopes-aud-claims','interactive-vs-headless',
  'cloudflare','aws-alb','fortigate',
  'okta','setup',
  'practice','glossary'
];
const TITLES = {
  'home':'Overview','flow-lab':'Flow Lab',
  'oauth':'How OAuth Works','oauth-vs-oidc':'How OIDC Works',
  'tokens':'Tokens','three-layers':'The Three Layers',
  'scopes-aud-claims':'Scopes · Audiences · Claims','interactive-vs-headless':'Interactive vs Headless',
  'cloudflare':'Cloudflare Access','aws-alb':'AWS ALB + Cognito','fortigate':'FortiGate ZTNA',
  'okta':'Okta','setup':'Setup Wizard',
  'practice':'Practice','glossary':'Glossary'
};

// Old routes redirect to where their content now lives, preserving any deep-link params.
const REDIRECTS = {
  'token-inspector':    (p) => '#/tokens?focus=inspector',
  'protocol-inspector': (p) => (p.flow !== undefined && p.step !== undefined)
    ? '#/flow-lab?flow=' + encodeURIComponent(p.flow) + '&step=' + encodeURIComponent(p.step)
    : '#/flow-lab',
  'debug-lab':          ()  => '#/practice?tab=debug',
  'attacks':            ()  => '#/practice?tab=attacks',
  'decide':             ()  => '#/practice?tab=decide',
  'visualizations':     ()  => '#/three-layers'
};

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const qIdx = raw.indexOf('?');
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = qIdx === -1 ? '' : raw.slice(qIdx + 1);
  const params = {};
  query.split('&').filter(Boolean).forEach(kv => {
    const eq = kv.indexOf('=');
    const k = decodeURIComponent(eq === -1 ? kv : kv.slice(0, eq));
    const v = decodeURIComponent(eq === -1 ? '' : kv.slice(eq + 1));
    params[k] = v;
  });
  return { path, params };
}
function readRoute() {
  const { path } = parseHash();
  return window.PL_routes[path] ? path : 'home';
}
function go(route, params) {
  if (!window.PL_routes[route]) route = 'home';
  let suffix = '';
  if (params && Object.keys(params).length) {
    suffix = '?' + Object.entries(params)
      .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
      .join('&');
  }
  location.hash = '#/' + route + suffix;
}

// Expose to other route modules
window.PL_app.go = go;
window.PL_app.parseHash = parseHash;

function render() {
  const { path, params } = parseHash();
  // Apply legacy-route redirects so old deep-links keep working
  if (REDIRECTS[path]) {
    location.hash = REDIRECTS[path](params);
    return;
  }
  const route = window.PL_routes[path] ? path : 'home';
  const view = $('#view');
  setHTML(view, '');
  view.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.PL_routes[route](view, params);
  // Auto-annotate acronyms across the just-rendered module
  try { annotateAcronyms(view); } catch (e) { /* non-fatal */ }
  $$('.nav__item').forEach(n => n.classList.toggle('is-active', n.dataset.route === route));
  const c = $('#crumbs');
  c.querySelector('.crumbs__current').textContent = TITLES[route] || 'Lab';
  document.title = 'Protocol Lab — ' + (TITLES[route] || '');
  document.body.classList.remove('menu-open');
}

window.addEventListener('hashchange', render);

function init() {
  $$('.nav__item').forEach(n => {
    n.addEventListener('click', e => {
      e.preventDefault();
      go(n.dataset.route);
    });
    n.setAttribute('href', '#/' + n.dataset.route);
  });

  $('#menuBtn').addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });

  // Restore persisted depth level (default: intermediate)
  const savedLevel = (function () {
    try { return localStorage.getItem('pl_level') || 'intermediate'; }
    catch (e) { return 'intermediate'; }
  })();
  document.documentElement.dataset.level = savedLevel;
  $$('.level-toggle__btn').forEach(b => {
    b.classList.toggle('is-active', b.dataset.level === savedLevel);
    b.addEventListener('click', () => {
      $$('.level-toggle__btn').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      document.documentElement.dataset.level = b.dataset.level;
      try { localStorage.setItem('pl_level', b.dataset.level); } catch (e) { /* non-fatal */ }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const cur = readRoute();
    const i = ORDER.indexOf(cur);
    if (e.key === 'ArrowRight' && i < ORDER.length - 1) go(ORDER[i + 1]);
    if (e.key === 'ArrowLeft' && i > 0) go(ORDER[i - 1]);
  });

  if (!location.hash) location.hash = '#/home';
  render();
}

document.addEventListener('DOMContentLoaded', init);
})();
