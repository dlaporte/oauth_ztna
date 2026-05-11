/* Cloudflare, Okta, Setup Wizard */
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

ROUTES['cloudflare'] = function (view) {
  setHTML(view, moduleHeader('07', 'platforms · 01', 'Cloudflare Access — the ZTNA gateway.', `
    Cloudflare Access is an identity-aware reverse proxy living at Cloudflare's edge. It implements Zero Trust Network Access (ZTNA):
    every request is authenticated and authorized before it reaches the origin. Access demands authentication, evaluates
    per-application policies, and forwards a signed assertion to your origin. It is not your Identity Provider (IdP) — that's still Okta.
  `) + `
    <section class="section">
      <div class="grid grid--2">
        <div class="card">
          <div class="minihead">what access does</div>
          <h3>The job description</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Catches every request to a protected hostname.</li>
            <li>Redirects unauthenticated users to your IdP (Okta).</li>
            <li>After login, evaluates per-app Access policies.</li>
            <li>If allowed: issues <strong>CF_Authorization</strong> JWT and forwards request to origin with <code>Cf-Access-Jwt-Assertion</code>.</li>
            <li>If denied: shows a deny page; origin never sees the request.</li>
          </ul>
        </div>
        <div class="card card--cyan">
          <div class="minihead">vpn vs ztna</div>
          <h3>Why this isn't just a VPN</h3>
          <ul class="split__list" style="margin-top:10px">
            <li><strong>VPN:</strong> network reachability == permission. If you're on the network, you can talk to the resource.</li>
            <li><strong>ZTNA:</strong> reachability is irrelevant. <em>Every</em> request is authenticated &amp; authorized, no matter the source.</li>
            <li>VPN protects layers 3-4. Access protects layer 7 — per-application identity-aware decisions.</li>
            <li>VPN denies are network-level (silent drop, ICMP); Access denies are HTTP-level with a logged reason.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">policy evaluation</div>
      <h2 style="margin-top:8px">How Access decides.</h2>
      <p class="lede" style="margin-top:10px">Each Access application has one or more policies. A policy has a verb (Allow / Block / Service Auth / Bypass), an Include rule (must match), an Exclude rule (must not match), and a Require rule (must additionally match).</p>

      <div class="card" style="margin-top:18px">
        <div class="minihead">example policy</div>
        <pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:14px;font-family:var(--mono);font-size:12.5px;line-height:1.6;color:var(--ink-2);margin-top:10px"><span class="text-amber">policy:</span> "Engineers — production app"
<span class="text-amber">action:</span> Allow

<span class="text-amber">include:</span>
  - email_domain:  example.com
  - groups:        "Engineering"

<span class="text-amber">require:</span>
  - auth_method:   mfa
  - device_posture.os_version: "&gt;= 14"

<span class="text-amber">exclude:</span>
  - country:       [KP, IR]

<span class="text-amber">session_duration:</span> 8h
<span class="text-amber">application_audience (AUD):</span> abc123def456</pre>
      </div>

      <div class="grid grid--3" style="margin-top:18px">
        <div class="card card--mini">
          <div class="minihead text-lime">include</div>
          <p>The user must match <em>at least one</em> include rule. If none match, the policy doesn't apply.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead text-cyan">require</div>
          <p>For matched users, <em>every</em> require rule must additionally hold. Failing a require → deny.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead text-coral">exclude</div>
          <p>Hard veto. Even if include and require pass, exclude wins.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">at the origin</div>
      <h2 style="margin-top:8px">What headers does Access send to your app?</h2>

      ${packetCardSafe({
        method: 'GET',
        url: 'https://origin.internal/orders',
        channel: 'back',
        body: [
          'Host: app.example.com',
          '<key>Cf-Access-Jwt-Assertion</key>: <secret>eyJraWQiOi…</secret>   <comment># the only header you should trust</comment>',
          'Cf-Access-Authenticated-User-Email: <public>ada@example.com</public>',
          'Cf-Connecting-Ip: 198.51.100.42',
          'Cf-Ray: 7a8b9c0d1e-EWR',
          'X-Forwarded-Proto: https',
          'X-Forwarded-For: 198.51.100.42'
        ].join('\n')
      }, { note: 'Verify Cf-Access-Jwt-Assertion against <code>https://team.cloudflareaccess.com/cdn-cgi/access/certs</code>. Match its <code>aud</code> against your Access app\'s AUD UUID. The convenience headers (email) are for display only — the JWT is the source of truth.' })}
    </section>

    <section class="section">
      <div class="kicker">cf access jwt</div>
      <h2 style="margin-top:8px">What's in the CF_Authorization JWT?</h2>
      <div id="cf-jwt-mount"></div>
    </section>

    <section class="section">
      <div class="kicker">service tokens & tunnel</div>
      <h2 style="margin-top:8px">Two more building blocks.</h2>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <h3>Service tokens</h3>
          <p style="margin-top:6px">A non-human credential issued by Access itself. The caller sends two headers; if the policy allows that service token, Access lets the request through without an OIDC login.</p>
          <div style="margin-top:12px">
            ${packetCardSafe({
              method: 'GET',
              url: 'https://app.example.com/health',
              channel: 'back',
              body: [
                '<key>CF-Access-Client-Id</key>: <val>abc123def456.access</val>',
                '<key>CF-Access-Client-Secret</key>: <secret>e8c0a9f2b3…</secret>'
              ].join('\n')
            })}
          </div>
          <p class="muted fineprint" style="margin-top:8px">Service tokens authenticate to the gateway only. If your origin requires its own bearer, send both.</p>
        </div>
        <div class="card">
          <h3>Cloudflare Tunnel</h3>
          <p style="margin-top:6px">A persistent, outbound-only connection from a daemon (<code>cloudflared</code>) on your origin host to Cloudflare's edge. Your origin never opens an inbound port; Cloudflare reaches it through the tunnel.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Run <code>cloudflared tunnel create my-app</code> on the origin.</li>
            <li>Map a hostname → tunnel target.</li>
            <li>Pair with an Access application to require auth.</li>
            <li>No public IP, no firewall ingress rule, no DDNS.</li>
          </ul>
        </div>
      </div>
    </section>
  `);

  const t = PL.sampleTokens.find(x => x.key === 'cf_jwt');
  const parts = t.jwt.split('.');
  const h = parts[0], p = parts[1], s = parts[2];
  setHTML($('#cf-jwt-mount', view), `
    <div class="card">
      <div class="jwt-display"><span class="jwt-seg-h">${esc(h)}</span><span class="jwt-dot">.</span><span class="jwt-seg-p">${esc(p)}</span><span class="jwt-dot">.</span><span class="jwt-seg-s">${esc(s)}</span></div>
      <div class="jwt-cols">
        <div class="jwt-col jwt-col--h"><div class="jwt-col__head">header</div><div class="jwt-col__body" id="cf-h"></div></div>
        <div class="jwt-col jwt-col--p"><div class="jwt-col__head">payload</div><div class="jwt-col__body" id="cf-p"></div></div>
        <div class="jwt-col jwt-col--s"><div class="jwt-col__head">signature</div><div class="jwt-col__body" id="cf-s"></div></div>
      </div>
      <p class="muted fineprint" style="margin-top:10px">${esc(t.note)}</p>
    </div>
  `);
  $('#cf-h', view).textContent = JSON.stringify(t.headerObj, null, 2);
  $('#cf-p', view).textContent = JSON.stringify(t.payloadObj, null, 2);
  $('#cf-s', view).textContent = s;
};

ROUTES['okta'] = function (view) {
  setHTML(view, moduleHeader('08', 'platforms · 02', 'Okta — the identity provider.', `
    Okta plays three roles in this lab: directory (users + groups), identity provider (login UI + Multi-Factor Authentication),
    and authorization server (issues tokens at standard OAuth and OpenID Connect endpoints).
  `) + `
    <section class="section">
      <div class="grid grid--2">
        <div class="card card--cyan">
          <div class="minihead">org auth server</div>
          <h3>Org Authorization Server</h3>
          <p style="margin-top:6px">Comes free with every Okta org. Issuer is your tenant URL: <code>https://okta.example.com</code>.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Audience is always your tenant URL.</li>
            <li>Token format is opaque to third parties (Okta-internal).</li>
            <li>You cannot define custom scopes.</li>
            <li>Use only for SSO — not for protecting your APIs.</li>
          </ul>
        </div>
        <div class="card card--accent">
          <div class="minihead">custom auth server</div>
          <h3>Custom Authorization Server</h3>
          <p style="margin-top:6px">A separate AS you create per API. Issuer ends with <code>/oauth2/&lt;name&gt;</code>.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>You define audience, scopes, claims, lifetimes.</li>
            <li>Tokens are JWTs, audience is your API resource identifier.</li>
            <li>Required for protecting your own APIs.</li>
            <li>Free Integrator account includes the "default" custom AS.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">application types</div>
      <h2 style="margin-top:8px">Pick the right OIDC application type.</h2>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Type</th><th>Public / confidential</th><th>Default flow</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td><span class="tag tag--amber">SPA</span></td><td>Public</td><td>Authorization Code + PKCE</td><td>React, Vue, Angular front-ends</td></tr>
          <tr><td><span class="tag tag--cyan">Web</span></td><td>Confidential</td><td>Authorization Code (+ PKCE)</td><td>Server-rendered apps (Rails, Django, Next SSR)</td></tr>
          <tr><td><span class="tag tag--violet">Native</span></td><td>Public</td><td>Authorization Code + PKCE / Device Grant</td><td>iOS, Android, desktop Electron, CLIs</td></tr>
          <tr><td><span class="tag tag--lime">Service / API</span></td><td>Confidential</td><td>Client Credentials</td><td>CI/CD, scheduled jobs, server-to-server</td></tr>
        </tbody>
      </table>
    </section>

    <section class="section">
      <div class="kicker">configuration surface</div>
      <h2 style="margin-top:8px">Where the levers live.</h2>
      <div class="grid grid--auto-300" style="margin-top:18px">
        <div class="card card--mini">
          <div class="minihead">redirect URIs</div>
          <p>Exact-match allow-list. <code>https://app.example.com/callback</code> is not the same as <code>…/callback/</code>. Wildcards: no.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">sign-out redirect URIs</div>
          <p>Where Okta will send the browser after a federated logout. Exact-match again.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">trusted origins / cors</div>
          <p>Domains allowed to make CORS requests directly to Okta endpoints (e.g. for refreshing tokens from a SPA).</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">scopes</div>
          <p>Defined per Authorization Server. Add <code>orders:read</code>, <code>orders:write</code> alongside the OIDC standards.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">claims</div>
          <p>Per-AS mapping rules: "if scope <code>groups</code> is present, populate the <code>groups</code> claim with user.groups."</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">JWKS</div>
          <p>Public keys exposed at <code>{issuer}/v1/keys</code>. Verifiers cache; rotation is automatic.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">token lifetimes</div>
          <p>Configurable per AS (access token, ID token, refresh token). Defaults are usually fine.</p>
        </div>
        <div class="card card--mini">
          <div class="minihead">private key jwt</div>
          <p>Set "Client authentication = Public key / Private key" and upload your public JWK. Then use <code>client_assertion</code> instead of a secret.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">walk-through</div>
      <h2 style="margin-top:8px">From zero to working OIDC client.</h2>
      <ol style="font-size:14.5px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Sign up for a free <a class="linklike" href="https://developer.okta.com" target="_blank" rel="noopener">Okta Integrator</a> account.</li>
        <li>Applications → Create App Integration → OIDC → choose your application type.</li>
        <li>Set sign-in redirect URIs (and sign-out URIs).</li>
        <li>Assign users / groups under the Assignments tab.</li>
        <li>Open Security → API → Authorization Servers → "default" → Scopes &amp; Claims; add <code>groups</code> claim mapping.</li>
        <li>Note your Issuer URL (<code>https://okta.example.com/oauth2/default</code>) and Client ID; the Setup Wizard uses both.</li>
      </ol>
      <p class="muted fineprint" style="margin-top:14px">Substitute your real tenant URL anywhere this lab shows <code>okta.example.com</code>.</p>
    </section>
  `);
};

ROUTES['setup'] = function (view) {
  setHTML(view, moduleHeader('09', 'platforms · 03', 'Setup wizard.', `
    The end-to-end recipe for a working ZTNA configuration: free Okta + free Cloudflare account, demo app, optional Tunnel.
  `) + `
    <section class="section">
      <div class="wizard">
        <div class="wizard__steps" id="wiz-steps">
          ${PL.wizard.map((w, i) => `<button class="wizard__step ${i === 0 ? 'is-active' : ''}" data-i="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span> ${esc(w.label)}</button>`).join('')}
        </div>
        <div class="wizard__body" id="wiz-body"></div>
      </div>
      <div class="kbd-band" style="margin-top:14px"><kbd>tip</kbd> use the depth toggle (sidebar) to see beginner-mode hand-holding or advanced raw-config callouts.</div>
    </section>
  `);

  const bodyEl = $('#wiz-body', view);

  const PAGES = {
    'okta-account': () => `
      <h2>1. Sign up for a free Okta Integrator account</h2>
      <p class="lede" style="margin-top:10px">The Integrator tier is free, never expires, and gives you a real Okta org.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Go to <a class="linklike" href="https://developer.okta.com" target="_blank" rel="noopener">developer.okta.com</a> and sign up.</li>
        <li>Pick a tenant name (becomes <code>YOURNAME.okta.com</code>).</li>
        <li>Verify your email; set your Okta admin password + MFA.</li>
        <li>Take note of your Okta domain — this lab calls it <code>okta.example.com</code>.</li>
      </ol>
      <div class="note" style="margin-top:18px"><div class="note__head">why "Integrator"</div><div>The Integrator tier is the modern free dev tier. Not to be confused with paid Okta Workforce / CIAM tenants — they cost money but have the same protocols.</div></div>
    `,

    'okta-app': () => `
      <h2>2. Create the OIDC application</h2>
      <p class="lede" style="margin-top:10px">Two apps live in your Okta tenant: one for Cloudflare Access to log users in (<em>OIDC Web</em>), one for your CLI / CI / SPA tests (<em>SPA</em> or <em>Service</em> as appropriate).</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Applications → <em>Create App Integration</em> → OIDC.</li>
        <li>For Cloudflare: choose <em>Web Application</em>. For your demo SPA: <em>Single-Page Application</em>. For automation: <em>API Service</em>.</li>
        <li>Sign-in redirect URI for CF: <code>https://team.cloudflareaccess.com/cdn-cgi/access/callback</code></li>
        <li>Sign-in redirect URI for SPA demo: <code>http://localhost:3000/callback</code> (and your prod URL).</li>
        <li>Save and capture the <strong>Client ID</strong> (and Client Secret if confidential).</li>
      </ol>
      <div class="risk" style="margin-top:18px"><div class="risk__head">never paste real secrets here</div><p>Use the secret only inside Okta and Cloudflare dashboards. The Wizard never asks for them.</p></div>
    `,

    'okta-users': () => `
      <h2>3. Create users &amp; groups</h2>
      <p class="lede" style="margin-top:10px">You need at least one user and one group to demonstrate identity-based access policies.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Directory → People → Add Person. Create <code>ada@example.com</code>, "Ada Lovelace".</li>
        <li>Directory → Groups → Add Group. Name it <code>Engineering</code>.</li>
        <li>Add Ada to <code>Engineering</code>.</li>
        <li>(Optional) create a second group <code>Contractors</code> with a second user not in Engineering.</li>
        <li>In your OIDC application's Assignments tab, assign the <code>Engineering</code> group.</li>
      </ol>
    `,

    'okta-as': () => `
      <h2>4. Authorization server: scopes &amp; claims</h2>
      <p class="lede" style="margin-top:10px">Cloudflare Access needs a <code>groups</code> claim to make group-based decisions. By default Okta won't include it — you map it on the AS.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Security → API → Authorization Servers → <code>default</code>.</li>
        <li>Scopes tab → Add Scope → <code>groups</code>.</li>
        <li>Claims tab → Add Claim → name=<code>groups</code>, include in: ID token (always), value type: Groups, filter: <code>matches regex .*</code>, scope: <code>groups</code>.</li>
        <li>Save. Now any token request with scope <code>groups</code> will include the <code>groups</code> claim.</li>
      </ol>
      <div class="card" style="margin-top:18px">
        <div class="minihead">verify it</div>
        <p>Use the OAuth Debugger or your SPA: request scope <code>openid profile email groups</code>. Decode the id_token in the <a class="linklike" href="#/token-inspector">Token Inspector</a>; you should see <code>groups: ["Engineering"]</code>.</p>
      </div>
    `,

    'cf-account': () => `
      <h2>5. Cloudflare account</h2>
      <p class="lede" style="margin-top:10px">A free Cloudflare account includes Cloudflare Zero Trust with up to 50 users at no cost.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Sign up at <a class="linklike" href="https://dash.cloudflare.com" target="_blank" rel="noopener">dash.cloudflare.com</a>.</li>
        <li>Enable MFA on the Cloudflare admin account.</li>
        <li>(Optional) add a domain you own. You can use a free subdomain via Workers if you don't.</li>
      </ol>
    `,

    'cf-zt': () => `
      <h2>6. Cloudflare Zero Trust setup</h2>
      <p class="lede" style="margin-top:10px">Activate Zero Trust and pick your team domain.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>From the Cloudflare dashboard, go to <em>Zero Trust</em>.</li>
        <li>Choose a team name → becomes <code>yourname.cloudflareaccess.com</code> (this lab calls it <code>team.cloudflareaccess.com</code>).</li>
        <li>Pick the Free plan (50 users included).</li>
      </ol>
    `,

    'cf-idp': () => `
      <h2>7. Add Okta as an IdP in Cloudflare Access</h2>
      <p class="lede" style="margin-top:10px">Cloudflare becomes an OIDC client of Okta.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>In Zero Trust → Settings → Authentication → Login methods → <em>Add new</em> → <em>Okta</em>.</li>
        <li>Paste:
          <ul style="margin-top:6px;padding-left:18px;list-style:disc;color:var(--ink-2)">
            <li>App ID = the Client ID of the Okta Web app you created for CF</li>
            <li>Client Secret = the Okta Client Secret</li>
            <li>Okta account URL = <code>https://okta.example.com</code></li>
            <li>Authorization server ID = <code>default</code> (or your custom AS id)</li>
            <li>OIDC claims (groups): <code>groups</code> — so Access can read group membership</li>
          </ul>
        </li>
        <li>Save and click <em>Test</em>. You should be redirected to Okta, sign in, and bounce back with a "success" page.</li>
      </ol>
      <div class="risk" style="margin-top:18px"><div class="risk__head">redirect URI must match</div><p>The Okta Web app's Sign-in redirect URI must be <code>https://team.cloudflareaccess.com/cdn-cgi/access/callback</code>. Mismatch = the most common error.</p></div>
    `,

    'cf-app': () => `
      <h2>8. Create the Cloudflare Access application</h2>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Zero Trust → Access → Applications → Add an application → Self-hosted.</li>
        <li>Name: <code>demo-app</code>. Domain: <code>app.example.com</code> (or a Tunnel hostname).</li>
        <li>Identity providers: enable <em>Okta</em>. Disable any others unless you want them.</li>
        <li>Session duration: 8 hours (anything from 30m to 24h is reasonable).</li>
        <li>Save. You'll see an <strong>Application Audience (AUD)</strong> UUID — record it. Your origin will use it to validate the CF JWT.</li>
      </ol>
    `,

    'cf-policy': () => `
      <h2>9. Create Access policies</h2>
      <p class="lede" style="margin-top:10px">Policies are evaluated in order; first match wins.</p>
      <div class="card" style="margin-top:18px">
        <pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:14px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);line-height:1.6">policy 1: "Engineers"
  action: Allow
  include: groups = "Engineering"
  require: auth_method = mfa
  session: 8h

policy 2: "Service tokens"
  action: Service Auth
  include: service_token = monitor-prod

policy 3: "Default deny"   <span class="text-muted"># implicit if nothing matched</span></pre>
      </div>
      <ul class="tasklist" style="margin-top:14px">
        <li>Test with a user in Engineering: should reach the app.</li>
        <li>Test with a user not in any group: should see the deny page.</li>
        <li>Curl with the service token: 200 OK at the gateway (the origin still applies its own checks).</li>
      </ul>
    `,

    'cf-tunnel': () => `
      <h2>10. (Optional) Cloudflare Tunnel</h2>
      <p class="lede" style="margin-top:10px">Use Tunnel to expose a private/local app to Access without opening any inbound port.</p>
      <ol style="margin-top:14px;line-height:1.7;color:var(--ink-2);padding-left:18px">
        <li>Install <code>cloudflared</code> on the host.</li>
        <li><code>cloudflared tunnel login</code> — opens a browser for OAuth-style consent against your CF account.</li>
        <li><code>cloudflared tunnel create demo</code> — creates a tunnel with credentials JSON.</li>
        <li>Map a hostname to a local target:
<pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:12px;margin-top:8px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2)">cloudflared tunnel route dns demo app.example.com
cloudflared tunnel run demo --url http://localhost:8080</pre>
        </li>
        <li>In Access, point the application to <code>app.example.com</code>. Done — no public IP, no port forwarding, no DDNS.</li>
      </ol>
    `,

    'demo': () => `
      <h2>11. Run the demo app</h2>
      <p class="lede" style="margin-top:10px">Any small web app works. The simplest demo is a single Node/Express endpoint that prints request headers.</p>
      <pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:14px;margin-top:14px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);line-height:1.6">// server.js (illustrative)
import express from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const app = express();
const TEAM = 'https://team.cloudflareaccess.com';
const AUD  = 'abc123def456';
const JWKS = createRemoteJWKSet(new URL(TEAM + '/cdn-cgi/access/certs'));

app.use(async (req, res, next) =&gt; {
  const tok = req.header('Cf-Access-Jwt-Assertion');
  if (!tok) return res.status(401).send('missing cf jwt');
  try {
    const { payload } = await jwtVerify(tok, JWKS, { issuer: TEAM, audience: AUD });
    req.user = payload;
    next();
  } catch (e) { res.status(401).send('invalid cf jwt'); }
});

app.get('/', (req, res) =&gt; res.json({ user: req.user }));
app.listen(8080);</pre>
      <p class="muted fineprint" style="margin-top:10px">Run <code>cloudflared tunnel run demo --url http://localhost:8080</code> and your app is now behind ZTNA.</p>
    `,

    'test': () => `
      <h2>12. Test login &amp; deny</h2>
      <ul class="tasklist">
        <li>In an incognito window, open <code>https://app.example.com/</code> — expect Access redirect to Okta.</li>
        <li>Log in as <code>ada@example.com</code> (member of Engineering) — expect to reach the app.</li>
        <li>Log out (the user menu in Access). Confirm subsequent requests redirect again.</li>
        <li>Log in as a user <em>not</em> in Engineering — expect Access deny page.</li>
        <li>In Zero Trust → Logs → Access, see the user identity, the policy that fired, and the verdict.</li>
      </ul>
    `,

    'machine': () => `
      <h2>13. Test automation access</h2>
      <p class="lede" style="margin-top:10px">Two flavours, depending on whether the machine needs to talk to the gateway only, or also to your API.</p>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead">scenario A: monitor probe (gateway only)</div>
          <pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:12px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);line-height:1.6">curl https://app.example.com/health \\
  -H "CF-Access-Client-Id: abc.access" \\
  -H "CF-Access-Client-Secret: &lt;secret&gt;"</pre>
        </div>
        <div class="card">
          <div class="minihead">scenario B: CI/CD calling your API</div>
          <pre style="white-space:pre-wrap;background:var(--bg);border:1px solid var(--hairline);border-radius:8px;padding:12px;font-family:var(--mono);font-size:12.5px;color:var(--ink-2);line-height:1.6"># 1. Build &amp; sign client_assertion (private_key_jwt)
# 2. POST /token grant_type=client_credentials
# 3. Use access_token in Authorization: Bearer
# 4. Send CF-Access-Client-Id/Secret headers too
#    so the gateway lets the request reach your API.</pre>
        </div>
      </div>
      <div class="note" style="margin-top:18px"><div class="note__head">two layers, two credentials</div><div>The gateway authenticates the request via service token. Your API authenticates it via Okta access_token. Each layer enforces its own policy.</div></div>
    `
  };

  function show(i) {
    const w = PL.wizard[i];
    const inner = (PAGES[w.body] || (() => '<p>Section coming soon.</p>'))();
    setHTML(bodyEl, inner + `
      <div class="wizard__nav">
        <button class="btn" ${i === 0 ? 'disabled' : ''} data-act="prev">← Previous</button>
        <button class="btn btn--primary" ${i === PL.wizard.length - 1 ? 'disabled' : ''} data-act="next">Next →</button>
      </div>
    `);
  }
  $('#wiz-steps', view).addEventListener('click', e => {
    const b = e.target.closest('.wizard__step');
    if (!b) return;
    $$('.wizard__step', view).forEach(x => x.classList.remove('is-active'));
    b.classList.add('is-active');
    show(parseInt(b.dataset.i, 10));
  });
  bodyEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const cur = $$('.wizard__step', view).findIndex(x => x.classList.contains('is-active'));
    let next = cur + (b.dataset.act === 'next' ? 1 : -1);
    next = Math.max(0, Math.min(PL.wizard.length - 1, next));
    const target = $$('.wizard__step', view)[next];
    target.click();
    target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
  show(0);
};

})();
