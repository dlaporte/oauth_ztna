/* Flow Lab, Interactive vs Headless, Protocol Inspector, Token Inspector */
(function () {
'use strict';
const { renderFlow, packetCardSafe, esc, setHTML, $, $$ } = window.PL_app;
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

ROUTES['flow-lab'] = function (view, params) {
  params = params || {};
  const FLOWS = [
    { id: 'authcode-pkce', tag: 'recommended for users', tagClass: 'tag--lime' },
    { id: 'device',        tag: 'cli & devices',          tagClass: 'tag--amber' },
    { id: 'cc-pkjwt',      tag: 'machine-to-machine',     tagClass: 'tag--cyan' },
    { id: 'refresh',       tag: 'session continuity',     tagClass: 'tag--violet' },
    { id: 'cf-access',     tag: 'ztna login',             tagClass: 'tag--cyan' },
    { id: 'implicit',      tag: 'deprecated',             tagClass: 'tag--coral' },
    { id: 'ropc',          tag: 'deprecated',             tagClass: 'tag--coral' }
  ];
  const initial = (params.flow && PL.flows[params.flow]) ? params.flow : 'authcode-pkce';
  const initialStep = Math.max(0, parseInt(params.step || '0', 10) || 0);

  setHTML(view, moduleHeader('01', 'start here · 01', 'Flow Lab — animate every step.', `
    Pick a flow. Step through it, scrub the timeline, expand any message to see the full HTTP request, and watch the
    little amber dot travel across the swimlanes. Every step explains <em>why</em> it's there, not just <em>what</em> happens.
    Several flows use Proof Key for Code Exchange (PKCE, pronounced "pixie") — a small extension that binds the authorization code to the
    requester via a random verifier, preventing intercepted codes from being exchanged.
  `) + `
    <section class="section">
      <div class="row" style="margin-bottom:18px;flex-wrap:wrap">
        <div class="lane-key">
          <span><i style="background:var(--lane-user)"></i> user</span>
          <span><i style="background:var(--lane-browser)"></i> browser</span>
          <span><i style="background:var(--lane-client)"></i> client</span>
          <span><i style="background:var(--lane-okta)"></i> okta</span>
          <span><i style="background:var(--lane-cf)"></i> cf access</span>
          <span><i style="background:var(--lane-app)"></i> app</span>
          <span><i style="background:var(--lane-api)"></i> api</span>
          <span><i style="background:var(--lane-jwks)"></i> jwks</span>
          <span><i style="background:var(--lane-ci)"></i> ci/cli</span>
        </div>
      </div>

      <div class="flow-picker" style="margin-bottom:18px">
        <label class="flow-picker__label" for="flow-select">Flow</label>
        <div class="flow-picker__field">
          <select class="flow-picker__select" id="flow-select" aria-label="Select a flow">
            ${FLOWS.map(f => {
              const flow = PL.flows[f.id];
              return `<option value="${esc(f.id)}" ${initial === f.id ? 'selected' : ''}>${esc(flow.title)} — ${esc(f.tag)}</option>`;
            }).join('')}
          </select>
          <span class="flow-picker__chev" aria-hidden="true">▾</span>
        </div>
        <span id="flow-tag" class="tag" style="margin-left:auto"></span>
      </div>

      <div id="flow-host"></div>
    </section>

    <section class="section">
      <div class="kicker">about the front / back channel</div>
      <div class="grid grid--2">
        <div class="card">
          <div class="minihead text-violet">front-channel</div>
          <h3>Through the user-agent</h3>
          <p>Anything that travels via browser redirects: query strings, URL fragments. <strong>Never put secrets here.</strong> Tokens may end up in browser history, referrer headers, proxy logs.</p>
        </div>
        <div class="card">
          <div class="minihead text-lime">back-channel</div>
          <h3>Server-to-server</h3>
          <p>Direct HTTPS POSTs from the client (or its server) to the IdP. Tokens, secrets, and assertions live here. The user-agent is not in the loop.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">flow comparison</div>
      <h2 style="margin-top:8px">All flows, side by side.</h2>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Flow</th><th>User?</th><th>Browser?</th><th>Returns id_token?</th><th>Returns refresh?</th><th>Use case</th></tr></thead>
        <tbody>
          <tr><td>Authorization Code + PKCE</td><td>yes</td><td>yes</td><td>yes (with openid)</td><td>yes</td><td>SPAs, web apps, mobile</td></tr>
          <tr><td>Device Authorization</td><td>yes</td><td>yes (any device)</td><td>yes</td><td>yes</td><td>CLIs, TVs, IoT</td></tr>
          <tr><td>Client Credentials</td><td>no</td><td>no</td><td>no</td><td>no</td><td>machine-to-machine</td></tr>
          <tr><td>Refresh Token</td><td>(implicit)</td><td>no</td><td>optional</td><td>(rotated)</td><td>session continuity</td></tr>
          <tr><td>Implicit (deprecated)</td><td>yes</td><td>yes</td><td>yes</td><td>no</td><td>do not use</td></tr>
          <tr><td>ROPC (deprecated)</td><td>yes</td><td>no</td><td>(maybe)</td><td>(maybe)</td><td>do not use</td></tr>
        </tbody>
      </table>
    </section>

    <section class="section lvl-adv">
      <div class="kicker text-violet">advanced · deep dive</div>
      <h2 style="margin-top:8px">redirect_uri matching is exact-string, not host-and-path.</h2>
      <p class="lede" style="margin-top:10px">RFC 6749 §3.1.2.2 requires the AS to compare the redirect_uri the client sends against the registered list with an exact-byte match. Most subtle production bugs come from misunderstanding what counts as "equal".</p>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Registered</th><th>Sent</th><th>Verdict</th></tr></thead>
        <tbody>
          <tr><td><code>https://app.example.com/callback</code></td><td><code>https://app.example.com/callback</code></td><td class="text-lime">match</td></tr>
          <tr><td><code>https://app.example.com/callback</code></td><td><code>https://app.example.com/callback/</code></td><td class="text-coral">no match (trailing slash)</td></tr>
          <tr><td><code>https://app.example.com/callback</code></td><td><code>https://app.example.com:443/callback</code></td><td class="text-coral">no match (explicit port)</td></tr>
          <tr><td><code>https://APP.example.com/callback</code></td><td><code>https://app.example.com/callback</code></td><td class="text-coral">no match (case)</td></tr>
          <tr><td><code>https://app.example.com/callback?x=1</code></td><td><code>https://app.example.com/callback?x=1&amp;y=2</code></td><td class="text-coral">no match (extra param)</td></tr>
        </tbody>
      </table>
      <div class="note" style="margin-top:18px">
        <div class="note__head">native loopback exception</div>
        <div>For native apps using <code>http://127.0.0.1</code> or <code>http://localhost</code>, RFC 8252 §7.3 allows the port number to vary on each request. The AS must match host + path exactly but ignore the port.</div>
      </div>
    </section>

    <section class="section lvl-adv">
      <div class="kicker text-violet">advanced · deep dive</div>
      <h2 style="margin-top:8px">PKCE verifier sizing &amp; transformation.</h2>
      <p class="lede" style="margin-top:10px">RFC 7636: the verifier is <strong>43–128 ASCII characters</strong> from <code>[A-Z][a-z][0-9]-._~</code>. The challenge is <code>BASE64URL(SHA256(verifier))</code>. The <code>plain</code> method (<code>code_challenge = code_verifier</code>) is allowed by spec but should never be used — it's PKCE in name only.</p>
      <ul class="split__list" style="margin-top:14px">
        <li>Always set <code>code_challenge_method=S256</code>. Reject <code>plain</code> on the AS if you can configure it.</li>
        <li>Generate the verifier with a CSPRNG, not Math.random.</li>
        <li>Store the verifier in <code>sessionStorage</code> (not <code>localStorage</code>) keyed by state, then delete after exchange.</li>
        <li>If <code>code_challenge</code> is missing, an attacker who intercepts the code can trade it for tokens. PKCE is what stops that — never optional for public clients.</li>
      </ul>
    </section>
  `);

  function tagFor(flowId) {
    const f = FLOWS.find(x => x.id === flowId);
    if (!f) return '';
    return `<span class="tag ${f.tagClass}">${esc(f.tag)}</span>`;
  }

  function loadFlow(flowId, stepIdx) {
    const host = $('#flow-host', view);
    setHTML(host, '');
    renderFlow(host, flowId, { initialStep: stepIdx || 0 });
    const tagEl = $('#flow-tag', view);
    if (tagEl) {
      const f = FLOWS.find(x => x.id === flowId);
      if (f) {
        tagEl.className = 'tag ' + f.tagClass;
        tagEl.textContent = f.tag;
      }
    }
  }

  $('#flow-select', view).addEventListener('change', e => {
    loadFlow(e.target.value, 0);
  });
  loadFlow(initial, initialStep);
};

ROUTES['interactive-vs-headless'] = function (view) {
  setHTML(view, moduleHeader('07', 'concepts · 06', 'Interactive vs Headless authentication.', `
    Three patterns dominate everything you'll build. Pick by asking: <em>is there a real human in front of a browser?</em>
    The interactive pattern uses the Device Authorization Grant; the headless pattern uses Client Credentials with private_key_jwt
    (a client authentication method that signs a short-lived JWT with the client's private key); the gateway-only pattern uses Cloudflare service tokens.
  `) + `
    <section class="section">
      <div class="grid grid--3">
        <div class="compare-card compare-card--interactive">
          <div class="deck">interactive · human present</div>
          <h3>Device Authorization Grant</h3>
          <p class="muted" style="margin-top:6px">Use when the client itself can't host a browser (CLI, terminal, smart TV) but a real human can complete a browser dance somewhere nearby.</p>
          <ul class="attr-list" style="margin-top:14px">
            <li><span class="k">browser</span><span>required, on any device</span></li>
            <li><span class="k">user</span><span>signs in interactively</span></li>
            <li><span class="k">credentials</span><span>handled by Okta only</span></li>
            <li><span class="k">mfa</span><span>full IdP MFA available</span></li>
            <li><span class="k">refresh</span><span>yes, with offline_access</span></li>
            <li><span class="k">good for</span><span>CLIs, devops tools, IoT setup</span></li>
          </ul>
        </div>

        <div class="compare-card compare-card--headless">
          <div class="deck">headless · machine</div>
          <h3>Client Credentials + private_key_jwt</h3>
          <p class="muted" style="margin-top:6px">Use for true machine-to-machine: scheduled jobs, CI/CD pipelines, server-side integrations. No user; the client identifies itself by signing a short-lived JWT with its private key.</p>
          <ul class="attr-list" style="margin-top:14px">
            <li><span class="k">browser</span><span>none</span></li>
            <li><span class="k">user</span><span>none</span></li>
            <li><span class="k">credentials</span><span>private key on the runner</span></li>
            <li><span class="k">on the wire</span><span>signed JWT only — no secret</span></li>
            <li><span class="k">refresh</span><span>n/a, just request a new token</span></li>
            <li><span class="k">good for</span><span>CI, cron, server integrations</span></li>
          </ul>
        </div>

        <div class="compare-card compare-card--service">
          <div class="deck">cloudflare · gateway-only</div>
          <h3>Cloudflare Access service token</h3>
          <p class="muted" style="margin-top:6px">A pair of headers (<code>CF-Access-Client-Id</code> + <code>CF-Access-Client-Secret</code>) issued by Cloudflare. Lets non-human callers traverse the Access gateway without going through Okta.</p>
          <ul class="attr-list" style="margin-top:14px">
            <li><span class="k">browser</span><span>none</span></li>
            <li><span class="k">user</span><span>none</span></li>
            <li><span class="k">credentials</span><span>id + secret as headers</span></li>
            <li><span class="k">scope</span><span>only the CF gateway, not your API</span></li>
            <li><span class="k">refresh</span><span>n/a; rotate the secret</span></li>
            <li><span class="k">good for</span><span>monitoring probes, CI deploy hits</span></li>
          </ul>
        </div>
      </div>

      <div class="note" style="margin-top:22px">
        <div class="note__head">important nuance</div>
        <div><code>private_key_jwt</code> is not a grant. It is a <em>client authentication method</em>. You can use it with Authorization Code (confidential web app) <em>or</em> with Client Credentials. The grant says <strong>what kind of token you want</strong>; the auth method says <strong>how the client proves who it is</strong>.</div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">on the wire</div>
      <h2 style="margin-top:8px">The single difference: how does the client prove who it is?</h2>

      <div class="grid grid--2" style="margin-top:18px">
        ${packetCardSafe({
          method: 'POST',
          url: 'POST /token  ·  client_credentials  ·  shared secret',
          channel: 'back',
          body: [
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Basic <secret>base64(client_id:client_secret)</secret>',
            '',
            '<key>grant_type</key>=<val>client_credentials</val>',
            '<key>scope</key>=<val>orders:read</val>'
          ].join('\n')
        }, { note: 'Symmetric secret. If it leaks, anyone with it can mint tokens. Rotate often. Never log Authorization headers.' })}

        ${packetCardSafe({
          method: 'POST',
          url: 'POST /token  ·  client_credentials  ·  private_key_jwt',
          channel: 'back',
          body: [
            'Content-Type: application/x-www-form-urlencoded',
            '',
            '<key>grant_type</key>=<val>client_credentials</val>',
            '<key>scope</key>=<val>orders:read</val>',
            '<key>client_assertion_type</key>=<val>urn:ietf:params:oauth:client-assertion-type:jwt-bearer</val>',
            '<key>client_assertion</key>=<public>eyJraWQiOi…(60-second JWT signed locally)</public>'
          ].join('\n')
        }, { note: 'Asymmetric. The private key never leaves the runner. Even with full network capture, an attacker cannot reuse anything.' })}
      </div>
    </section>

    <section class="section">
      <div class="kicker">when to use what</div>
      <h2 style="margin-top:8px">Decision matrix.</h2>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Caller</th><th>Use</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>SPA in a real browser</td><td>Authorization Code + PKCE</td><td>Public client, can't keep a secret; PKCE binds the code to the verifier.</td></tr>
          <tr><td>Server-rendered web app</td><td>Authorization Code (confidential)</td><td>Backend can keep a secret. Add private_key_jwt for stronger client auth.</td></tr>
          <tr><td>CLI tool engineers run locally</td><td>Device Authorization Grant</td><td>Real human nearby; let them sign in to Okta in their normal browser.</td></tr>
          <tr><td>CI/CD pipeline</td><td>Client Credentials + private_key_jwt</td><td>No human; signed JWT proves the runner identity without a leakable secret.</td></tr>
          <tr><td>Monitoring probe through CF</td><td>CF Service Token</td><td>Just needs to traverse the gateway. Doesn't need an Okta token at all.</td></tr>
          <tr><td>Both: monitor + call your API</td><td>CF Service Token <em>and</em> Client Credentials</td><td>Two layers, two credentials. CF for the gateway, Okta for the API.</td></tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <div class="kicker">cf service token shape</div>
      <h2 style="margin-top:8px">What does a Cloudflare Service Token request look like?</h2>
      ${packetCardSafe({
        method: 'GET',
        url: 'https://api.example.com/health',
        channel: 'back',
        body: [
          '<key>CF-Access-Client-Id</key>: <val>abc123def456.access</val>',
          '<key>CF-Access-Client-Secret</key>: <secret>e8c0a9f2b3…</secret>',
          'User-Agent: monitor/1.0',
          '',
          '<comment># If the Access policy includes "Service Token" → Allow with these IDs,</comment>',
          '<comment># Cloudflare lets the request through without an OIDC login.</comment>',
          '<comment># The origin still needs to authorize the call independently.</comment>'
        ].join('\n')
      }, { note: 'CF Service Tokens go past the gateway only. They do not authenticate to your API. If your API checks Okta tokens, the monitor needs both.' })}
    </section>
  `);
};

ROUTES['protocol-inspector'] = function (view, params) {
  params = params || {};
  // Build packets list grouped by flow, with adjacency info for prev/next within a flow.
  // Skip conceptual flows — they're teaching aids, not real protocol messages.
  const packets = [];
  const indexByKey = {};
  Object.entries(PL.flows).filter(([id, f]) => !f.conceptual).forEach(([flowId, f]) => {
    f.steps.forEach((s, i) => {
      const key = flowId + ':' + i;
      indexByKey[key] = packets.length;
      packets.push({
        flow: f.title, flowId, idx: i,
        flowLen: f.steps.length,
        label: s.label, packet: s.packet, note: s.note,
        from: s.from, to: s.to
      });
    });
  });

  // Resolve initial selection from params
  let initialI = 0;
  if (params.flow && params.step !== undefined) {
    const key = params.flow + ':' + parseInt(params.step, 10);
    if (indexByKey[key] !== undefined) initialI = indexByKey[key];
  }

  setHTML(view, moduleHeader('07', 'protocol · 01', 'Every message, on the wire.', `
    Browse every protocol message across every flow. Pick one to see the full request — method, URL, headers, body —
    and a callout of what's <span class="text-coral">secret</span>, what's <span class="text-cyan">public-but-sensitive</span>,
    and where the response actually lives. Use <em>← prev step / next step →</em> to scrub a whole flow without leaving the inspector,
    or jump to the same step in the Flow Lab to see it in animated context.
  `) + `
    <section class="section">
      <div class="proto-bench">
        <aside class="proto-list" id="proto-list">
          ${packets.map((p, i) => {
            // Insert a flow-group header when the flow changes
            const isFirstOfFlow = i === 0 || packets[i - 1].flowId !== p.flowId;
            return (isFirstOfFlow ? `<div class="proto-list__group">${esc(p.flow)}</div>` : '') +
              `<button data-i="${i}" data-flow="${esc(p.flowId)}" data-step="${p.idx}" class="${i === initialI ? 'is-active' : ''}">
                <span class="meta">step ${String(p.idx + 1).padStart(2, '0')} of ${String(p.flowLen).padStart(2, '0')}</span>
                <span style="display:block;margin-top:3px">${esc(p.label)}</span>
              </button>`;
          }).join('')}
        </aside>
        <main id="proto-detail"></main>
      </div>
    </section>
  `);

  function show(i) {
    const p = packets[i];
    const flow = PL.flows[p.flowId];
    const prevI = (p.idx > 0) ? indexByKey[p.flowId + ':' + (p.idx - 1)] : null;
    const nextI = (p.idx < p.flowLen - 1) ? indexByKey[p.flowId + ':' + (p.idx + 1)] : null;
    const channelTag = p.packet.channel === 'front'
      ? '<span class="tag" style="border-color:rgba(167,139,250,.3);color:var(--violet);background:var(--violet-soft)">front-channel</span>'
      : (p.packet.channel === 'back' ? '<span class="tag tag--lime">back-channel</span>' : '<span class="tag">in-process</span>');
    setHTML($('#proto-detail', view), `
      <div class="proto-context">
        <div class="proto-context__crumbs">
          <span class="muted fineprint">flow</span>
          <span class="tag">${esc(p.flow)}</span>
          <span class="muted">›</span>
          <span class="tag tag--amber">step ${String(p.idx + 1).padStart(2, '0')} / ${String(p.flowLen).padStart(2, '0')}</span>
          ${channelTag}
        </div>
        <div class="proto-context__nav">
          <button class="btn btn--small" data-step-jump="${prevI === null ? '' : prevI}" ${prevI === null ? 'disabled' : ''}>‹ prev step</button>
          <button class="btn btn--small" data-step-jump="${nextI === null ? '' : nextI}" ${nextI === null ? 'disabled' : ''}>next step ›</button>
          <a class="btn btn--small btn--cyan" href="#/flow-lab?flow=${esc(p.flowId)}&step=${p.idx}">View in flow context →</a>
        </div>
      </div>

      <h2 style="margin:18px 0 6px 0;font-size:24px">${esc(p.label)}</h2>
      <div class="muted" style="font-family:var(--mono);font-size:11.5px;letter-spacing:0.06em;margin-bottom:14px">
        ${esc(PL.LANES[p.from] ? PL.LANES[p.from].label : p.from)} → ${esc(PL.LANES[p.to] ? PL.LANES[p.to].label : p.to)}
      </div>

      ${packetCardSafe(p.packet, { note: p.note })}

      <div class="proto-flow-mini">
        <div class="muted fineprint" style="margin-bottom:8px">other steps in <strong>${esc(p.flow)}</strong></div>
        <div class="proto-flow-mini__list">
          ${flow.steps.map((s, j) => {
            const fid = indexByKey[p.flowId + ':' + j];
            return `<button class="proto-flow-mini__step ${j === p.idx ? 'is-active' : ''}" data-step-jump="${fid}">${String(j + 1).padStart(2, '0')} · ${esc(s.label.slice(0, 42))}${s.label.length > 42 ? '…' : ''}</button>`;
          }).join('')}
        </div>
      </div>

      <div class="legend-row" style="margin-top:14px">
        <span class="legend-pill"><span class="swatch swatch--secret"></span> secret — never log or display</span>
        <span class="legend-pill"><span class="swatch swatch--public"></span> public-but-sensitive — visible in transit, ok in URLs</span>
        <span class="legend-pill"><span class="swatch swatch--token"></span> bearer token in transit</span>
      </div>
    `);

    // Scroll the active list button into view in the sidebar
    const active = $('#proto-list button.is-active', view);
    if (active && active.scrollIntoView) {
      active.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }

  function selectIndex(i) {
    if (i === null || i === undefined || isNaN(i) || i < 0 || i >= packets.length) return;
    $$('#proto-list button', view).forEach((x, j) => x.classList.toggle('is-active', j === i));
    show(i);
    // Update hash without forcing a re-render (replaceState avoids hashchange listener)
    const p = packets[i];
    const newHash = '#/protocol-inspector?flow=' + encodeURIComponent(p.flowId) + '&step=' + p.idx;
    if (location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  $('#proto-list', view).addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    selectIndex(parseInt(b.dataset.i, 10));
  });
  view.addEventListener('click', e => {
    const j = e.target.closest('[data-step-jump]');
    if (!j) return;
    const v = j.dataset.stepJump;
    if (v === '') return;
    selectIndex(parseInt(v, 10));
  });

  show(initialI);
};

/* Reusable Token Inspector — mounts into any container. Used by the Tokens module. */
function mountTokenInspector(view) {
  view.insertAdjacentHTML('beforeend', `
    <section class="section" id="ti-section">
      <div class="card">
        <div class="row row--space" style="margin-bottom:14px;flex-wrap:wrap">
          <div class="minihead">sample tokens</div>
          <span class="muted fineprint">decode in-browser only · pasted tokens never leave this page</span>
        </div>
        <div class="jwt-chooser" id="jwt-chooser">
          ${PL.sampleTokens.map((t, i) => `<button data-i="${i}" class="${i === 0 ? 'is-active' : ''}">${esc(t.label)}</button>`).join('')}
        </div>
        <textarea class="token-input" id="token-input" placeholder="Or paste any JWT here…"></textarea>
        <div class="muted fineprint" style="margin-top:6px" id="token-note"></div>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="minihead">raw token (segmented)</div>
        <div class="jwt-display" id="ti-raw"></div>
        <div class="jwt-cols">
          <div class="jwt-col jwt-col--h">
            <div class="jwt-col__head">header</div>
            <div class="jwt-col__body" id="ti-h"></div>
          </div>
          <div class="jwt-col jwt-col--p">
            <div class="jwt-col__head">payload</div>
            <div class="jwt-col__body" id="ti-p"></div>
          </div>
          <div class="jwt-col jwt-col--s">
            <div class="jwt-col__head">signature (base64url)</div>
            <div class="jwt-col__body" id="ti-s"></div>
          </div>
        </div>
      </div>

      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead">claim by claim</div>
          <h3>What's in the payload?</h3>
          <table class="ctable matrix" style="margin-top:14px" id="ti-claims"></table>
        </div>
        <div class="card">
          <div class="minihead">validation checklist</div>
          <h3>Decoding ≠ validating.</h3>
          <p class="muted" style="margin-top:6px">A real verifier runs every one of these checks. Skipping any is a critical bug.</p>
          <ul class="checklist" id="ti-checks" style="margin-top:14px"></ul>
        </div>
      </div>

      <div class="risk" style="margin-top:18px">
        <div class="risk__head">this inspector is a teaching tool</div>
        <p>The signature column shows the base64url-encoded signature, but the inspector cannot cryptographically verify it without the matching JWKS public key. In production: never display "✓ valid" without performing the actual signature verification using the IdP's JWKS.</p>
      </div>

      <div class="lvl-adv" style="margin-top:24px">
        <div class="kicker text-violet">advanced · deep dive</div>
        <h2 style="margin-top:8px">Algorithm pinning &amp; signing-key confusion.</h2>
        <p class="lede" style="margin-top:10px">Two of the oldest JWT bugs come from being too generous about what algorithms or keys you'll accept.</p>
        <div class="grid grid--2" style="margin-top:18px">
          <div class="risk">
            <div class="risk__head">alg=none</div>
            <p>The JWT spec defines a "none" algorithm meaning the token is unsigned. Some libraries default to accepting it. Always pin the expected alg server-side: if your AS issues RS256, reject anything else outright.</p>
          </div>
          <div class="risk">
            <div class="risk__head">RS↔HS confusion</div>
            <p>If a verifier uses a single function that picks the algorithm from the JWT header, an attacker can switch RS256 → HS256 and use the public key (which they have) as the symmetric secret. Always specify the expected alg <em>family</em> as input, never read it from the header.</p>
          </div>
        </div>
        <div class="note" style="margin-top:14px">
          <div class="note__head">key rotation</div>
          <div>A real verifier caches the JWKS for hours. On signature failure, it should refresh the JWKS once (in case keys rotated) and try again, then refuse. Some IdPs publish the next key before they start signing with it — clients must accept any key currently in the JWKS, not just the most recent.</div>
        </div>
      </div>
    </section>
  `);

  const chooser = $('#jwt-chooser', view);
  const input = $('#token-input', view);
  const note = $('#token-note', view);

  function loadSample(i) {
    const t = PL.sampleTokens[i];
    input.value = t.jwt;
    note.textContent = t.note;
    repaint();
  }
  chooser.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    $$('#jwt-chooser button', view).forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    loadSample(parseInt(b.dataset.i, 10));
  });
  input.addEventListener('input', () => repaint());

  function safeDecode(seg) {
    try {
      let s = seg.replace(/-/g, '+').replace(/_/g, '/');
      while (s.length % 4) s += '=';
      const json = decodeURIComponent(escape(atob(s)));
      return { ok: true, obj: JSON.parse(json) };
    } catch (e) {
      return { ok: false };
    }
  }
  function pretty(obj) { try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); } }

  function repaint() {
    const tok = (input.value || '').trim();
    const segs = tok.split('.');
    const h = segs[0], p = segs[1], s = segs[2];
    const rawEl = $('#ti-raw', view);
    if (h && p && s) {
      setHTML(rawEl, `<span class="jwt-seg-h">${esc(h)}</span><span class="jwt-dot">.</span><span class="jwt-seg-p">${esc(p)}</span><span class="jwt-dot">.</span><span class="jwt-seg-s">${esc(s)}</span>`);
    } else {
      setHTML(rawEl, '<span class="muted">(paste a JWT above to inspect it)</span>');
    }

    const dh = h ? safeDecode(h) : { ok: false };
    const dp = p ? safeDecode(p) : { ok: false };
    $('#ti-h', view).textContent = dh.ok ? pretty(dh.obj) : '— invalid header —';
    $('#ti-p', view).textContent = dp.ok ? pretty(dp.obj) : '— invalid payload —';
    $('#ti-s', view).textContent = s ? s : '— missing signature —';

    const ct = $('#ti-claims', view);
    if (dp.ok) {
      const annot = {
        iss: 'issuer of the token',
        sub: 'subject — usually the user (or client_id for CC)',
        aud: 'audience — the intended recipient',
        exp: 'expiration time (unix seconds) — must be in the future',
        iat: 'issued-at time',
        nbf: 'not-before time',
        scp: 'scopes (space-separated permissions)',
        scope: 'scopes (alternative claim name)',
        groups: 'group memberships (custom claim — depends on AS)',
        nonce: 'OIDC: must match the value the client sent on /authorize',
        cid: 'Okta: client_id that received the token',
        azp: 'authorized party (client_id) — OIDC',
        amr: 'authentication method references (e.g. pwd, mfa)',
        auth_time: 'when the user authenticated',
        kid: 'key id used to sign (in header, not payload)',
        alg: 'signing algorithm (in header)',
        typ: 'token type (in header)',
        jti: 'unique token id — used for replay defence',
        ver: 'Okta-specific token version',
        uid: 'Okta-specific user id',
        email: 'OIDC email claim (with email scope)',
        email_verified: 'whether email is verified by IdP',
        type: 'CF Access token type',
        identity_nonce: 'CF Access nonce (per-identity)',
        country: 'CF Access: country at login',
        custom: 'CF Access: customer-defined claims block',
        preferred_username: 'OIDC: human-readable username',
        name: 'OIDC: display name'
      };
      const rowsHTML = '<thead><tr><th>Claim</th><th>Value</th><th>Meaning</th></tr></thead><tbody>' +
        Object.entries(dp.obj).map(([k, v]) => {
          const val = (typeof v === 'object') ? JSON.stringify(v) : String(v);
          let display = esc(val);
          if ((k === 'exp' || k === 'iat' || k === 'nbf' || k === 'auth_time') && /^\d+$/.test(val)) {
            display = esc(val) + ' <span class="muted">(' + new Date(parseInt(val, 10) * 1000).toISOString() + ')</span>';
          }
          return '<tr><td><code class="text-amber">' + esc(k) + '</code></td><td><code>' + display + '</code></td><td class="muted">' + esc(annot[k] || '—') + '</td></tr>';
        }).join('') + '</tbody>';
      setHTML(ct, rowsHTML);
    } else {
      setHTML(ct, '');
    }

    const checks = [];
    function check(name, ok, detail, chip) { checks.push({ name, ok, detail, chip }); }

    if (dh.ok) {
      check('Algorithm is asymmetric (alg)',
        /^(RS|ES|PS)/.test(dh.obj.alg || ''),
        'alg = ' + (dh.obj.alg || '(missing)') + ' — reject "none" and HS* unless your AS specifies it.',
        'header.alg');
      check('Key id present (kid)',
        !!dh.obj.kid,
        dh.obj.kid ? ('kid = ' + dh.obj.kid) : 'No kid — verifier may need to try every key in the JWKS.',
        'header.kid');
      check('Token type is JWT (typ)',
        (dh.obj.typ || '').toUpperCase() === 'JWT' || dh.obj.typ === undefined,
        'typ = ' + (dh.obj.typ || '(omitted, ok)'),
        'header.typ');
    } else {
      check('Header decodes', false, 'Header is not valid base64url JSON.', 'header');
    }

    if (dp.ok) {
      const o = dp.obj;
      check('Issuer present (iss)', !!o.iss, o.iss ? ('iss = ' + o.iss) : 'iss missing — verifier cannot bind the token to an AS.', 'iss');
      check('Audience present (aud)',
        !!o.aud,
        o.aud ? ('aud = ' + (Array.isArray(o.aud) ? o.aud.join(', ') : o.aud)) : 'aud missing — APIs MUST reject this.',
        'aud');
      check('Expiration present (exp)', typeof o.exp === 'number', typeof o.exp === 'number' ? ('exp = ' + o.exp + ' (' + new Date(o.exp * 1000).toISOString() + ')') : 'exp missing.', 'exp');
      if (typeof o.exp === 'number') {
        check('Not expired',
          o.exp * 1000 > Date.now(),
          o.exp * 1000 > Date.now() ? ('Still valid for ' + Math.round((o.exp * 1000 - Date.now()) / 1000) + 's') : ('Expired ' + Math.round((Date.now() - o.exp * 1000) / 1000) + 's ago'),
          'clock');
      }
      check('Issued-at present (iat)', typeof o.iat === 'number', 'iat = ' + (o.iat || '(missing)'), 'iat');
      if (typeof o.nbf === 'number') {
        check('Not-before honoured (nbf)',
          o.nbf * 1000 <= Date.now(),
          o.nbf * 1000 <= Date.now() ? 'nbf in the past ✓' : 'nbf is in the future — reject.',
          'nbf');
      }
      check('Has subject (sub)', !!o.sub, o.sub ? ('sub = ' + o.sub) : 'sub missing — token has no principal.', 'sub');
    } else {
      check('Payload decodes', false, 'Payload is not valid base64url JSON.', 'payload');
    }

    check('Signature segment present',
      !!s && s.length > 16,
      s ? (s.length + ' chars (signature is verified using JWKS — not by this UI)') : 'Signature missing.',
      'sig');

    const cl = $('#ti-checks', view);
    setHTML(cl, checks.map(c => `
      <li class="checklist__item ${c.ok ? 'ok' : 'fail'}">
        <span class="checklist__icon">${c.ok ? '✓' : '×'}</span>
        <div>
          <div class="checklist__name">${esc(c.name)}</div>
          <div class="checklist__detail">${esc(c.detail)}</div>
        </div>
        <span class="checklist__chip">${esc(c.chip)}</span>
      </li>
    `).join(''));
  }

  loadSample(0);
}

// Expose for embedding in other modules (Tokens 101).
window.PL_app.mountTokenInspector = mountTokenInspector;

})();
