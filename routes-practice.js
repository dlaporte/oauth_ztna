/* Practice (Debug Lab + Attack Drills + Decision Guide as tabs) and Glossary.
   Visualizations module was dissolved: arch + trust → Three Layers; lifecycle →
   Tokens; flow comparison → Flow Lab. */
(function () {
'use strict';
const { esc, setHTML, $, $$ } = window.PL_app;
const ROUTES = window.PL_routes = window.PL_routes || {};

function moduleHeader(num, eyebrow, title, lede) {
  return `
    <section class="hero" style="padding-top:18px">
      <div class="module-num">${num}</div>
      <div class="h-eyebrow">${esc(eyebrow)}</div>
      <h1 class="hero__title">${title}</h1>
      ${lede ? `<p class="lede hero__lede">${lede}</p>` : ''}
    </section>
  `;
}

/* ---------- tab body renderers (used by ROUTES['practice']) ---------- */

function renderDebugTab(host) {
  setHTML(host, `
    <p class="lede" style="margin-bottom:18px">Sixteen real-world misconfigurations. Each one fails in a specific, diagnostic way. Read the symptom, click to reveal the fix.</p>
    <div class="lab-list">
      ${PL.debugCases.map(c => `
        <article class="lab-card" data-case="${esc(c.num)}">
          <div class="lab-card__num">${esc(c.num)}</div>
          <div class="lab-card__title">${esc(c.title)}</div>
          <div class="lab-card__desc">${esc(c.desc)}</div>
          <div class="lab-card__verdict">↳ ${esc(c.verdict)}</div>
          <div class="lab-card__toggle" data-act="toggle">Reveal explanation</div>
          <div class="lab-card__expand">${esc(c.detail)}</div>
        </article>
      `).join('')}
    </div>
  `);
}

function renderAttackTab(host) {
  setHTML(host, `
    <p class="lede" style="margin-bottom:18px">Thirteen attacks that real OAuth/OIDC deployments still fall to. For each, the takeaway is the same: <em>which protocol mechanism stops it, and why.</em></p>
    <div class="lab-list">
      ${PL.attacks.map(a => `
        <article class="lab-card">
          <div class="lab-card__num">${esc(a.num)}</div>
          <div class="lab-card__title">${esc(a.title)}</div>
          <div class="lab-card__desc">${esc(a.desc)}</div>
          <div class="lab-card__verdict lab-card__verdict--ok">↳ defence</div>
          <div class="lab-card__toggle" data-act="toggle">Show defence</div>
          <div class="lab-card__expand">${esc(a.fix)}</div>
        </article>
      `).join('')}
    </div>
  `);
}

function renderDecideTab(host) {
  setHTML(host, `
    <p class="lede" style="margin-bottom:18px">Pick the closest scenario. The lab will recommend a flow and explain why the alternatives are wrong (or worse).</p>
    <div class="grid" style="gap:18px">
      ${PL.decisions.map((d, i) => `
        <article class="qcard" data-q="${i}">
          <div class="qcard__q">${esc(d.q)}</div>
          <div class="qcard__opts">
            ${d.options.map((o, oi) => `<button class="qopt" data-i="${oi}">${esc(o)}</button>`).join('')}
          </div>
          <div class="answer" id="answer-${i}">
            <div class="answer__rec">${esc(d.rec)}</div>
            <div class="answer__why">${esc(d.why)}</div>
          </div>
        </article>
      `).join('')}
    </div>
  `);
}

ROUTES['practice'] = function (view, params) {
  params = params || {};
  const TABS = [
    { id: 'debug',   label: 'Debug Lab',         desc: '16 misconfigurations',   render: renderDebugTab },
    { id: 'attacks', label: 'Attack Drills',     desc: '13 attacks & defences',  render: renderAttackTab },
    { id: 'decide',  label: 'Decision Guide',    desc: '8 scenarios',            render: renderDecideTab }
  ];
  const initial = TABS.find(t => t.id === params.tab) ? params.tab : 'debug';

  setHTML(view, moduleHeader('12', 'apply · 01', 'Practice — predict, then reveal.', `
    Three drills, one place. Switch between debugging real misconfigurations, defending against textbook OAuth attacks, and picking the right flow for a scenario.
  `) + `
    <section class="section">
      <div class="practice-tabs" id="practice-tabs">
        ${TABS.map(t => `
          <button class="practice-tab ${t.id === initial ? 'is-active' : ''}" data-tab="${esc(t.id)}">
            <span class="practice-tab__label">${esc(t.label)}</span>
            <span class="practice-tab__desc">${esc(t.desc)}</span>
          </button>
        `).join('')}
      </div>
      <div id="practice-body" style="margin-top:22px"></div>
    </section>
  `);

  const tabsEl = $('#practice-tabs', view);
  const body = $('#practice-body', view);

  function show(tabId) {
    const t = TABS.find(x => x.id === tabId);
    if (!t) return;
    $$('.practice-tab', tabsEl).forEach(b => b.classList.toggle('is-active', b.dataset.tab === tabId));
    t.render(body);
    // Reflect in the URL without a full re-render
    const newHash = '#/practice?tab=' + tabId;
    if (location.hash !== newHash) {
      try { history.replaceState(null, '', newHash); } catch (e) { /* file:// disallows replaceState */ }
    }
  }

  tabsEl.addEventListener('click', e => {
    const b = e.target.closest('.practice-tab');
    if (!b) return;
    show(b.dataset.tab);
  });

  // Reveal handlers shared by debug + attack lab cards
  body.addEventListener('click', e => {
    const t = e.target.closest('.lab-card__toggle');
    if (t) {
      const card = t.closest('.lab-card');
      card.classList.toggle('is-open');
      t.textContent = card.classList.contains('is-open')
        ? (t.textContent.startsWith('Hide') ? 'Hide' : 'Hide') + ' ' + (t.textContent.includes('defence') ? 'defence' : 'explanation')
        : (t.textContent.includes('defence') ? 'Show defence' : 'Reveal explanation');
      return;
    }
    const opt = e.target.closest('.qopt');
    if (opt) {
      const card = opt.closest('.qcard');
      const qi = parseInt(card.dataset.q, 10);
      const ans = $('#answer-' + qi, body);
      $$('.qopt', card).forEach(b => b.classList.remove('is-selected'));
      opt.classList.add('is-selected');
      if (ans) ans.classList.add('is-shown');
      return;
    }
  });

  show(initial);
};

ROUTES['glossary'] = function (view) {
  setHTML(view, moduleHeader('13', 'reference', 'Glossary.', `
    The vocabulary you'll see throughout the lab. Filter live.
  `) + `
    <section class="section">
      <div class="glossary__filter">
        <input id="gloss-q" placeholder="Filter by term, acronym, or definition…" autocomplete="off"/>
        <span class="muted fineprint" id="gloss-count"></span>
      </div>
      <dl class="glossary" id="gloss-list"></dl>
    </section>
  `);

  function paint(filter) {
    const f = (filter || '').trim().toLowerCase();
    const list = PL.glossary.filter(t =>
      !f || t.term.toLowerCase().includes(f) || (t.acronym || '').toLowerCase().includes(f) || t.def.toLowerCase().includes(f)
    );
    $('#gloss-count', view).textContent = list.length + ' of ' + PL.glossary.length;
    const html = list.map(t => `
      <div class="glossary__term">
        <dt>${esc(t.term)}${t.acronym ? `<span class="acronym">${esc(t.acronym)}</span>` : ''}</dt>
        <dd>${esc(t.def)}</dd>
      </div>
    `).join('') || '<p class="muted">No matches.</p>';
    setHTML($('#gloss-list', view), html);
  }
  $('#gloss-q', view).addEventListener('input', e => paint(e.target.value));
  paint('');
};

})();
