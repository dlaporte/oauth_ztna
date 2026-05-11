/* Foundations modules: Overview, OAuth vs OIDC, Three Layers, Tokens, Scopes-Aud-Claims
   All HTML strings are built from constants in data.js + escaped lookups via esc().
*/
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

const ORDER = ['home','flow-lab','oauth','oauth-vs-oidc','tokens','three-layers','scopes-aud-claims',
  'interactive-vs-headless','cloudflare','aws-alb','fortigate','okta','setup','practice','glossary'];
const TITLES = {
  'home':'Overview','flow-lab':'Flow Lab',
  'oauth':'How OAuth Works','oauth-vs-oidc':'How OIDC Works',
  'tokens':'Tokens','three-layers':'The Three Layers','scopes-aud-claims':'Scopes · Audiences · Claims',
  'interactive-vs-headless':'Interactive vs Headless','cloudflare':'Cloudflare Access',
  'aws-alb':'AWS ALB + Cognito','fortigate':'FortiGate ZTNA','okta':'Okta',
  'setup':'Setup Wizard','practice':'Practice','glossary':'Glossary'
};

ROUTES['home'] = function (view) {
  setHTML(view, `
    <section class="hero">
      <div class="h-eyebrow">protocol lab · v1.0 · for engineers learning ztna</div>
      <h1 class="hero__title">A hands-on lab for <em>OAuth&nbsp;2.0</em>, <em>OpenID&nbsp;Connect</em> and <em>Zero&nbsp;Trust</em>.</h1>
      <p class="lede hero__lede">
        OAuth 2.0 is the open standard for delegated authorization. OpenID Connect (<em>OIDC</em>) is the identity layer on top of it.
        Zero Trust Network Access (<em>ZTNA</em>) is the access model where every request is authenticated and authorized regardless of network location.
        Learn the protocol mechanics, then compare three production ZTNA gateways side by side — <em>Cloudflare Access</em>, <em>AWS ALB + Cognito</em>, and <em>FortiGate ZTNA</em> — paired with an OIDC identity provider such as Okta.
      </p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#/flow-lab">See a flow happen →</a>
        <a class="btn" href="#/cloudflare">Compare ZTNA gateways</a>
        <a class="btn btn--ghost" href="#/oauth-vs-oidc">What's the difference between OAuth and OIDC?</a>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="stat__num">14</div><div class="stat__label">modules</div></div>
        <div class="stat"><div class="stat__num">03</div><div class="stat__label">ztna gateways</div></div>
        <div class="stat"><div class="stat__num">06</div><div class="stat__label">animated flows</div></div>
        <div class="stat"><div class="stat__num">16</div><div class="stat__label">debug labs</div></div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">the three roles</div>
      <h2 style="margin-top:8px">Every ZTNA setup has three pieces.</h2>
      <p class="lede" style="margin-top:10px">Whichever gateway you pick, the architecture is the same: an identity provider authenticates the user, an identity-aware proxy enforces access policy at the perimeter, and your application receives a verifiable assertion of who's calling.</p>
      <div class="grid grid--3" style="margin-top:22px">
        <div class="card card--accent">
          <div class="card__title"><span class="tag tag--amber">identity provider</span></div>
          <p>The authorization server. Authenticates users, mints access &amp; ID tokens, and exposes JWKS for verification. This lab uses <strong>Okta</strong>; the same role is filled by Azure Entra ID, Google, Auth0, Cognito user pools, FortiAuthenticator, etc.</p>
        </div>
        <div class="card card--cyan">
          <div class="card__title"><span class="tag tag--cyan">ztna gateway</span> <span class="muted fineprint">(identity-aware proxy)</span></div>
          <p>Sits in front of the app. Demands authentication, evaluates per-app policies, and forwards a signed assertion to the origin. Three options compared here:</p>
          <ul class="split__list" style="margin-top:8px">
            <li><a class="linklike" href="#/cloudflare">Cloudflare Access</a></li>
            <li><a class="linklike" href="#/aws-alb">AWS ALB + Cognito</a></li>
            <li><a class="linklike" href="#/fortigate">FortiGate ZTNA</a></li>
          </ul>
        </div>
        <div class="card">
          <div class="card__title"><span class="tag">your application</span></div>
          <p>The thing you're protecting. Verifies the gateway's signed assertion (CF JWT, ALB <code>x-amzn-oidc-data</code>, FortiGate headers + mTLS) and — if it exposes its own API — verifies Okta-issued access tokens too.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">four ways in</div>
      <h2 style="margin-top:8px">Pick a track. Switch any time.</h2>
      <p class="lede" style="margin-top:10px">There's a sidebar with all fourteen modules — but if you don't know where to start, here are the on-ramps that make sense for the most common audiences.</p>
      <div class="grid grid--auto-260" style="margin-top:22px">
        <div class="card card--accent">
          <div class="minihead">i'm new to oauth/oidc</div>
          <h3>Live first, theory next</h3>
          <p class="muted" style="margin-top:6px">Start with an animated flow, then unpack what's in the messages. Tokens, layers, scopes — each grounded in something you've already watched happen.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/flow-lab">Watch a flow → Tokens → OIDC</a></div>
        </div>
        <div class="card card--cyan">
          <div class="minihead">i'm comparing ztna options</div>
          <h3>Three gateways, same OIDC underneath</h3>
          <p class="muted" style="margin-top:6px">Read the gateway modules side by side. Each one covers the same patterns (auth headers, signed assertion to origin, policy model) for its product.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/cloudflare">Cloudflare Access</a> · <a class="linklike" href="#/aws-alb">AWS ALB</a> · <a class="linklike" href="#/fortigate">FortiGate ZTNA</a></div>
        </div>
        <div class="card">
          <div class="minihead">i'm building one out</div>
          <h3>End-to-end recipe</h3>
          <p class="muted" style="margin-top:6px">The Setup Wizard walks through a complete working setup (using Cloudflare Access as the worked example). The AWS ALB and FortiGate modules document the equivalent setup steps for those gateways.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/setup">Open the setup wizard →</a></div>
        </div>
        <div class="card">
          <div class="minihead">i'm debugging</div>
          <h3>Diagnose &amp; defend</h3>
          <p class="muted" style="margin-top:6px">Decode any JWT in the inspector, run validation. Sixteen common misconfigurations and thirteen attack drills with their defences.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/tokens?focus=inspector">Token inspector</a> · <a class="linklike" href="#/practice">Practice drills</a></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="grid grid--2" style="align-items:start">
        <div>
          <div class="kicker">expected outcome</div>
          <h2 style="margin-top:8px">By the end you'll be able to…</h2>
          <ul class="split__list" style="margin-top:14px">
            <li>Configure Okta as an OIDC provider for Cloudflare Access.</li>
            <li>Protect an app with Access policies based on group, email, MFA.</li>
            <li>Choose the right OAuth flow for any client type.</li>
            <li>Read a JWT, validate it, and explain why decoding ≠ verifying.</li>
            <li>Distinguish authentication from authorization — and know which layer enforces which.</li>
            <li>Recognise common misconfigurations and the attacks they enable.</li>
          </ul>
        </div>
        <div>
          <div class="pullquote">
            "Decoding a JWT is not the same as validating it. Skipping any of the eight required checks is a critical bug, not an edge case."
          </div>
          <div class="muted" style="margin-top:14px;font-family:var(--mono);font-size:11.5px;letter-spacing:0.1em;text-transform:uppercase">— from the Token Inspector module</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">all modules</div>
      <h2 style="margin-top:8px">Pick where to start.</h2>
      <div class="grid grid--auto-260" style="margin-top:22px">
        ${ORDER.filter(r => r !== 'home').map((r, i) => `
          <a class="card card--mini" href="#/${r}" style="display:block">
            <div class="muted" style="font-family:var(--mono);font-size:11px;letter-spacing:.14em">${String(i + 1).padStart(2, '0')}</div>
            <div style="font-family:var(--serif);font-size:18px;letter-spacing:-0.01em;margin-top:4px">${esc(TITLES[r])}</div>
          </a>
        `).join('')}
      </div>
    </section>
  `);
};

ROUTES['oauth'] = function (view) {
  setHTML(view, moduleHeader('02', 'concepts · 01', 'How <em>OAuth&nbsp;2.0</em> works.', `
    OAuth 2.0 is how one application gets permission to call an API <em>on behalf of</em> a user — without ever seeing the user's password.
    It's the foundation that OpenID Connect sits on top of. Understand OAuth first; OIDC then becomes "OAuth, plus a way to also know who the user is".
  `) + `

    <section class="section">
      <div class="kicker">why oauth exists</div>
      <h2 style="margin-top:8px">The password-sharing problem.</h2>
      <p class="lede" style="margin-top:10px">In the pre-OAuth web, the only way to let one application access your data on another was to give it your password. A photo-printing service wanting your Flickr pictures? Hand over your Flickr password. A budgeting tool wanting your bank statements? Hand over your bank login. Three problems came along with this:</p>
      <div class="grid grid--3" style="margin-top:18px">
        <div class="risk">
          <div class="risk__head">over-privileged</div>
          <p>The third party can do <em>anything</em> you can do — delete photos, change your password, drain the account. There's no "read only".</p>
        </div>
        <div class="risk">
          <div class="risk__head">unrevocable</div>
          <p>To "revoke" the third party's access, you have to change your password — which breaks every other place you used it.</p>
        </div>
        <div class="risk">
          <div class="risk__head">contagious</div>
          <p>The third party stores your password. A breach there is a breach of every account that shares that password.</p>
        </div>
      </div>
      <p class="lede" style="margin-top:18px">OAuth 2.0 (RFC 6749, 2012) solved this with <strong>scoped, revocable, password-free delegation</strong>. The user authorizes specific permissions for a specific client; the third party gets a token, not a password; the user can revoke any time.</p>
    </section>

    <section class="section">
      <div class="kicker">the principals</div>
      <h2 style="margin-top:8px">Four roles in every OAuth exchange.</h2>
      <p class="lede" style="margin-top:10px">These names are formal OAuth terminology. When you reach the OIDC module, you'll see the same actors with renamed roles (Client → Relying Party, AS → OpenID Provider). They're the same people; the naming differs by purpose.</p>
      <div class="grid grid--auto-260" style="margin-top:22px">
        <div class="card card--accent">
          <div class="minihead">role 1</div>
          <h3 style="margin-top:6px">Resource Owner</h3>
          <p class="muted" style="margin-top:6px">The user who owns the data being accessed. Almost always a person, occasionally a service account.</p>
        </div>
        <div class="card card--cyan">
          <div class="minihead">role 2</div>
          <h3 style="margin-top:6px">Client</h3>
          <p class="muted" style="margin-top:6px">The application requesting access on the user's behalf. The third-party tool, the SPA, the CLI, the integration. <em>Not</em> the human.</p>
        </div>
        <div class="card">
          <div class="minihead">role 3</div>
          <h3 style="margin-top:6px">Authorization Server (AS)</h3>
          <p class="muted" style="margin-top:6px">The service the Resource Owner trusts to handle authentication and issue tokens. In this lab, that's <strong>Okta</strong>.</p>
        </div>
        <div class="card">
          <div class="minihead">role 4</div>
          <h3 style="margin-top:6px">Resource Server</h3>
          <p class="muted" style="margin-top:6px">The API that holds the protected data. Validates incoming access tokens and serves the request if the token has the right scope.</p>
        </div>
      </div>
      <div class="note" style="margin-top:18px">
        <div class="note__head">AS and Resource Server are often run by the same vendor</div>
        <div>Google Calendar's Authorization Server (<code>accounts.google.com</code>) and its Resource Server (<code>googleapis.com/calendar/v3</code>) are operated by the same company. But conceptually they're separate roles — one mints tokens, the other accepts them. Understanding them as separate makes the protocol clearer.</div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">the exchange</div>
      <h2 style="margin-top:8px">Pure OAuth — no identity layer.</h2>
      <p class="lede" style="margin-top:10px">Watch a complete OAuth exchange where the client just wants to <em>call an API on the user's behalf</em>. The client doesn't learn (and doesn't need to learn) who the user is — only that it has been authorized to act for them. This is the case where OIDC isn't needed.</p>
      <div id="oauth-conceptual-flow" style="margin-top:22px"></div>
    </section>

    <section class="section">
      <div class="kicker">scopes</div>
      <h2 style="margin-top:8px">OAuth's permission language.</h2>
      <p class="lede" style="margin-top:10px">A <strong>scope</strong> is a named permission that the client requests and the Resource Owner (or admin) grants. Scopes are how OAuth answers "what is this token allowed to do?". They are the difference between "this token can do anything" and "this token can read your calendar, nothing else".</p>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead">how scopes flow</div>
          <h3>Request → grant → enforce</h3>
          <ol style="margin-top:10px;padding-left:18px;color:var(--ink-2);line-height:1.7">
            <li><strong>Client requests</strong> scopes when calling <code>/authorize</code> (e.g. <code>scope=calendar:read</code>).</li>
            <li><strong>User (or admin) grants</strong> the scopes, possibly a subset of what was asked.</li>
            <li><strong>AS records</strong> the granted scopes in the access token (in the <code>scope</code> or <code>scp</code> claim).</li>
            <li><strong>Resource Server enforces</strong> them per endpoint ("require <code>calendar:write</code> for POST").</li>
          </ol>
        </div>
        <div class="card">
          <div class="minihead">common conventions</div>
          <h3>How scopes are named</h3>
          <ul class="split__list" style="margin-top:10px">
            <li><code>resource:action</code> — e.g. <code>orders:read</code>, <code>repo:write</code>, <code>calendar:delete</code>. Used by Okta, GitHub, many SaaS.</li>
            <li><code>service.scope</code> — Google style: <code>https://www.googleapis.com/auth/calendar.readonly</code>.</li>
            <li>OIDC standards: <code>openid</code>, <code>profile</code>, <code>email</code>, <code>address</code>, <code>phone</code>, <code>offline_access</code>.</li>
            <li>No central registry. Each AS defines its own scope vocabulary.</li>
          </ul>
        </div>
      </div>
      <div class="risk" style="margin-top:18px">
        <div class="risk__head">scopes are delegation, not authorization</div>
        <p>A scope says <em>"the client is allowed to attempt this action on the user's behalf"</em>. It does <strong>not</strong> say <em>"the user is allowed to do this on this specific resource"</em>. That second decision belongs to the Resource Server using its own business rules. Granting <code>orders:write</code> doesn't override per-tenant or per-row permissions; it just opens the door to <em>try</em>.</p>
      </div>
    </section>

    <section class="section">
      <div class="kicker">grants</div>
      <h2 style="margin-top:8px">Same OAuth, different starting situations.</h2>
      <p class="lede" style="margin-top:10px">OAuth defines several <em>grant types</em> — variations of the exchange tailored to different client+user situations. They all end with the client receiving an access_token; what varies is how the exchange begins.</p>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Grant</th><th>Used when</th><th>What kicks it off</th></tr></thead>
        <tbody>
          <tr><td><strong>Authorization Code</strong> (+ PKCE)</td><td>User is present at a browser</td><td>Redirect to <code>/authorize</code></td></tr>
          <tr><td><strong>Device Authorization</strong></td><td>Client has no browser (CLI, TV)</td><td>Display a code &amp; URL to the user</td></tr>
          <tr><td><strong>Client Credentials</strong></td><td>No user — machine-to-machine</td><td>POST directly to <code>/token</code></td></tr>
          <tr><td><strong>Refresh Token</strong></td><td>Renewing a session without user interaction</td><td>POST to <code>/token</code> with refresh_token</td></tr>
          <tr><td class="muted"><strong>Implicit</strong> (deprecated)</td><td class="muted">Old SPA pattern, tokens in URL fragment</td><td class="muted">Replaced by Auth Code + PKCE</td></tr>
          <tr><td class="muted"><strong>Resource Owner Password</strong> (deprecated)</td><td class="muted">Legacy systems; the anti-pattern OAuth was designed to avoid</td><td class="muted">Removed in OAuth 2.1</td></tr>
        </tbody>
      </table>
      <p class="muted" style="margin-top:14px">Each grant gets a full protocol-level walk-through in the <a class="linklike" href="#/flow-lab">Flow Lab</a> module.</p>
    </section>

    <section class="section">
      <div class="kicker">when oauth isn't enough</div>
      <h2 style="margin-top:8px">OAuth tells you <em>what</em>, not <em>who</em>.</h2>
      <p class="lede" style="margin-top:10px">OAuth's job is delegated authorization: a token that says <em>"the holder may perform these actions on behalf of someone"</em>. It deliberately does not standardize how the client learns <em>who</em> that someone is. For many use cases — a calendar sync tool, a CI pipeline pushing to a deploy API — that's exactly right; the client doesn't need to know.</p>
      <p class="lede" style="margin-top:10px">But many applications also need to identify the user: display "Welcome, Ada", look up your profile, record audit logs with the user's identity. For those cases, OAuth alone isn't enough — and that's exactly the gap OpenID Connect fills.</p>
      <div class="card card--cyan" style="margin-top:18px">
        <div class="minihead">next module</div>
        <h3>How OIDC Works →</h3>
        <p style="margin-top:6px">OpenID Connect is "OAuth with a standardized way to also know who the user is". Same flows, with one extra scope (<code>openid</code>) and one extra token (the id_token). The next module teaches it from scratch, using the same conceptual swimlane shape you just saw.</p>
        <div style="margin-top:12px"><a class="linklike" href="#/oauth-vs-oidc">Open the OIDC tutorial →</a></div>
      </div>
    </section>

    <section class="section lvl-adv">
      <div class="kicker text-violet">advanced · deep dive</div>
      <h2 style="margin-top:8px">OAuth 1.0a vs OAuth 2.0.</h2>
      <p class="lede" style="margin-top:10px">If you encounter "OAuth 1.0" in older systems, it's a separate protocol — not just an older spec of OAuth 2.0. The 1.0a spec used HMAC request signing instead of TLS for protection; every request was individually signed with a shared secret using a canonicalized form of the URL and parameters. It was robust against early-2010s TLS weaknesses but very awkward to implement.</p>
      <p class="lede" style="margin-top:10px">OAuth 2.0 (the current spec, what this lab covers) requires TLS for transport security and uses simpler bearer-token semantics. It's much easier to implement correctly, at the cost of <em>requiring</em> TLS — bearer tokens over plaintext HTTP are trivially stolen. OAuth 2.1 is an in-progress consolidation that removes deprecated grant types and codifies PKCE-everywhere.</p>
    </section>
  `);

  // Mount the conceptual OAuth swimlane
  renderFlow($('#oauth-conceptual-flow', view), 'oauth-conceptual');
};

ROUTES['oauth-vs-oidc'] = function (view) {
  setHTML(view, moduleHeader('03', 'concepts · 02', 'How <em>OpenID Connect</em> works.', `
    OpenID Connect — OIDC, pronounced "oh-eye-dee-see" — is the standard for one application asking a trusted external service:
    <em>"can you tell me who this person is?"</em> It's how Google, Apple, Okta, and your company SSO let you click "Sign in with…"
    on dozens of apps without ever giving any of those apps your password.
  `) + `

    <section class="section">
      <div class="kicker">why oidc exists</div>
      <h2 style="margin-top:8px">The problem before federated identity.</h2>
      <p class="lede" style="margin-top:10px">In a world without OIDC, every application has its own user database. You sign up at each one with an email and password. Each app stores credentials, runs its own authentication, manages its own MFA and password resets. From a user's view: 50 passwords. From a security view: 50 chances for a credential breach. From an IT view: 50 places to provision and de-provision a leaving employee.</p>
      <p class="lede" style="margin-top:10px">Federated identity flips this. <strong>One trusted system</strong> — the Identity Provider — handles every login. Every other application <em>relies on</em> the IdP to vouch for the user. OIDC is the standard protocol that lets the IdP and the application talk to each other safely.</p>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead text-coral">without oidc</div>
          <h3>Each app handles its own login</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Every app stores hashed passwords.</li>
            <li>Every app implements MFA, password reset, account lockout.</li>
            <li>Off-boarding requires touching every app.</li>
            <li>A breach in one app exposes a re-used password everywhere.</li>
          </ul>
        </div>
        <div class="card card--cyan">
          <div class="minihead text-cyan">with oidc</div>
          <h3>One IdP, many apps</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Credentials live only at the IdP.</li>
            <li>MFA is configured once.</li>
            <li>Disable a user at the IdP → access ends everywhere.</li>
            <li>Apps never see the password — there's nothing to leak.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">the principals</div>
      <h2 style="margin-top:8px">Who is involved in an OIDC exchange.</h2>
      <p class="lede" style="margin-top:10px">OIDC defines four formal roles. Once you can name each one, the rest of the protocol is just describing how they talk to each other.</p>
      <div class="grid grid--auto-260" style="margin-top:22px">
        <div class="card card--accent">
          <div class="minihead">role 1</div>
          <h3 style="margin-top:6px">End-User</h3>
          <p class="muted" style="margin-top:6px">The human signing in. In OAuth terminology, also called the <em>Resource Owner</em> — the person whose data the application wants access to.</p>
          <p class="fineprint" style="margin-top:8px">In this lab: <code>ada@example.com</code></p>
        </div>
        <div class="card card--cyan">
          <div class="minihead">role 2</div>
          <h3 style="margin-top:6px">OpenID Provider (OP)</h3>
          <p class="muted" style="margin-top:6px">The Identity Provider. The system that authenticates the user (passwords, MFA, biometrics) and issues signed identity assertions to other applications. Owns the user directory.</p>
          <p class="fineprint" style="margin-top:8px">In this lab: <strong>Okta</strong> at <code>okta.example.com</code></p>
        </div>
        <div class="card">
          <div class="minihead">role 3</div>
          <h3 style="margin-top:6px">Relying Party (RP)</h3>
          <p class="muted" style="margin-top:6px">The application that needs to know who the user is. Called "relying" because it relies on the OP's word — it doesn't authenticate the user itself. Sometimes just called <em>Client</em>.</p>
          <p class="fineprint" style="margin-top:8px">In this lab: <strong>Cloudflare Access</strong> (it acts as an OIDC RP to Okta), or your demo app.</p>
        </div>
        <div class="card">
          <div class="minihead">role 4</div>
          <h3 style="margin-top:6px">Resource Server</h3>
          <p class="muted" style="margin-top:6px">The API that holds protected data and accepts access tokens. This is technically OAuth's role, not OIDC's — but most real systems do both at once.</p>
          <p class="fineprint" style="margin-top:8px">In this lab: <strong>your API</strong> at <code>api.example.com</code></p>
        </div>
      </div>
      <div class="note" style="margin-top:18px">
        <div class="note__head">a fifth player: the user-agent</div>
        <div>The browser (or whatever the user is interacting with) is the messenger between the User, the RP, and the OP. It's not a "principal" in the formal protocol sense — it's the channel they use. But it's also where many attacks happen, which is why OIDC has so many checks (<code>state</code>, <code>nonce</code>, redirect-URI matching) on data that travels through it.</div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">the exchange</div>
      <h2 style="margin-top:8px">A high-level walk-through.</h2>
      <p class="lede" style="margin-top:10px">Watch the full conceptual exchange between the four principals. This is OIDC stripped of protocol details — no PKCE, no JWKS rotation, no state-vs-nonce. Just <em>who says what to whom</em>. Once this clicks, the protocol-level Flow Lab will make sense.</p>
      <div id="oidc-conceptual-flow" style="margin-top:22px"></div>
    </section>

    <section class="section">
      <div class="kicker">what's in the id_token</div>
      <h2 style="margin-top:8px">The IdP's signed statement about the user.</h2>
      <p class="lede" style="margin-top:10px">The id_token is the heart of OIDC. It's a small signed message from the OP (the IdP) that says, in effect: <em>"I am Okta. I'm telling the relying party that this person — identified by sub <code>00u9abc</code>, email <code>ada@example.com</code> — successfully authenticated at this time, using these methods. This statement is valid for one hour."</em></p>
      <p class="muted" style="margin-top:8px">Reminder: <em>OP</em> is the OpenID Provider — the IdP. <em>RP</em> is the Relying Party — the application receiving the assertion.</p>
      <table class="ctable" style="margin-top:18px">
        <thead><tr><th>Claim</th><th>Meaning</th><th>Why it matters</th></tr></thead>
        <tbody>
          <tr><td><code class="text-amber">iss</code></td><td>Issuer — the URL of the OpenID Provider (OP)</td><td>Lets the application confirm the token came from the IdP it expected.</td></tr>
          <tr><td><code class="text-amber">sub</code></td><td>Subject — the user's stable ID at the OP</td><td>Persistent across sessions; safe to use as a primary key in the application.</td></tr>
          <tr><td><code class="text-amber">aud</code></td><td>Audience — the Relying Party's client_id</td><td>Token is FOR THIS application. Reject if it doesn't match.</td></tr>
          <tr><td><code class="text-amber">exp</code></td><td>Expiration time</td><td>Reject after this. Forces re-authentication.</td></tr>
          <tr><td><code class="text-amber">iat</code></td><td>Issued-at time</td><td>How fresh is this assertion?</td></tr>
          <tr><td><code class="text-amber">nonce</code></td><td>Replay-defence value the application sent</td><td>Confirms this token is the answer to a request the application just made — not an old one replayed.</td></tr>
          <tr><td><code class="text-amber">auth_time</code></td><td>When the user actually authenticated</td><td>Lets the application enforce "must have signed in within the last 10 minutes".</td></tr>
          <tr><td><code class="text-amber">amr</code></td><td>Authentication Method References (e.g. <code>pwd</code>, <code>mfa</code>)</td><td>Lets the application gate on "did they use MFA?".</td></tr>
          <tr><td><code class="text-amber">email, name, …</code></td><td>Standard profile claims (with the <code>profile</code>/<code>email</code> scopes)</td><td>Display info for the application.</td></tr>
        </tbody>
      </table>
      <p class="muted" style="margin-top:14px">Open the <a class="linklike" href="#/tokens?focus=inspector">Token Inspector</a> to decode a real-shaped id_token claim by claim.</p>
    </section>

    <section class="section">
      <div class="kicker">the trust model</div>
      <h2 style="margin-top:8px">What stops anyone from forging a token?</h2>
      <p class="muted" style="margin-top:10px">As we go through these defences, recall the actors: the <strong>OP</strong> (OpenID Provider — Okta in this lab) issues tokens; the <strong>RP</strong> (Relying Party — the application) consumes them.</p>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card card--cyan">
          <div class="minihead">cryptographic signature</div>
          <h3>The id_token is signed by the OP</h3>
          <p style="margin-top:6px">The id_token is a JWT — three base64url segments joined by dots. The third segment is a cryptographic signature made with the OP's <em>private key</em>. The OP publishes the matching <em>public key</em> at a well-known URL (the JWKS endpoint). Any RP can fetch the public key and verify the signature.</p>
          <p class="muted fineprint" style="margin-top:8px">An attacker without the OP's private key cannot produce a valid token. Tampering with even one byte breaks the signature.</p>
        </div>
        <div class="card card--accent">
          <div class="minihead">audience binding</div>
          <h3>Each token is for one specific Relying Party</h3>
          <p style="margin-top:6px">The token's <code>aud</code> claim names the RP it was issued for. Even if an attacker steals a valid token, they can't replay it at a different RP, because that other RP would check <code>aud</code> and reject it. This is also why <em>using an id_token to call an API is wrong</em> — the API isn't the audience.</p>
          <p class="muted fineprint" style="margin-top:8px">Always validate <code>aud</code> server-side. Never accept a token "as long as it's valid".</p>
        </div>
        <div class="card">
          <div class="minihead">freshness</div>
          <h3>Tokens expire fast</h3>
          <p style="margin-top:6px">id_tokens typically live for an hour. Even a stolen token has a hard time-bound on its usefulness. <code>nonce</code> further defends against replay within that window — the RP includes a random nonce in its initial request and checks that the same value comes back inside the id_token.</p>
        </div>
        <div class="card">
          <div class="minihead">channel separation</div>
          <h3>Tokens never travel through the browser</h3>
          <p style="margin-top:6px">Front-channel (browser redirects) carries only the short-lived authorization code. Tokens are exchanged on the back-channel — a direct server-to-server HTTPS POST from the RP to the OP. This is why OIDC's design is more involved than "just send the token in a redirect" — keeping tokens off the user-agent dramatically reduces exposure.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">single sign-on</div>
      <h2 style="margin-top:8px">One OpenID Provider, many Relying Parties.</h2>
      <p class="lede" style="margin-top:10px">Once a user has signed in to the OP (the IdP — Okta), every other application (RP) that trusts the same OP can identify the same user without prompting again. The OP keeps a session for the user (typically a cookie at <code>okta.example.com</code>). When the next RP redirects there, the OP recognises the session and skips the credential prompt — it goes straight to "user is authenticated, here's a code".</p>
      <p class="lede" style="margin-top:10px">Each RP, however, runs its <em>own</em> session derived from the OP's assertion. RP sessions are not shared with each other. Logout in one RP doesn't log you out of others — that's why <em>RP-Initiated Logout</em> exists in OIDC: it lets one application tell the OP "the user wants to sign out everywhere", and the OP can then propagate that to the others.</p>
    </section>

    <section class="section">
      <div class="kicker">oidc and oauth</div>
      <h2 style="margin-top:8px">How they relate.</h2>
      <p class="lede" style="margin-top:10px">OIDC sits <em>on top of</em> OAuth 2.0. They aren't alternatives. OAuth provides the underlying mechanics: the authorization endpoint, the token endpoint, the grant types, the back-channel exchange. OIDC adds the parts that turn "authorization to call APIs" into "authentication of users" — the <code>openid</code> scope, the id_token, standard identity claims, the UserInfo endpoint, and discovery.</p>
      <div class="split" style="margin-top:18px">
        <div class="split__col">
          <div class="split__title"><span class="tag tag--amber">oauth 2.0</span></div>
          <div class="split__sub">delegated authorization</div>
          <ul class="split__list">
            <li>"Can this app call this API on my behalf?"</li>
            <li>Issues an <code>access_token</code> for the API.</li>
            <li>Doesn't standardize <em>who</em> the user is — only <em>what</em> the app may do.</li>
            <li>Defines roles: client, resource owner, authorization server, resource server.</li>
            <li>Defines grants: authorization code, client credentials, device code, refresh token.</li>
          </ul>
        </div>
        <div class="split__divider"></div>
        <div class="split__col">
          <div class="split__title"><span class="tag tag--cyan">openid connect</span></div>
          <div class="split__sub">authentication on top of oauth</div>
          <ul class="split__list">
            <li>"Who is the user signing in to my app?"</li>
            <li>Issues an <code>id_token</code> alongside the access_token.</li>
            <li>Adds <code>nonce</code>, the <code>userinfo</code> endpoint, the <code>openid</code> scope, and discovery.</li>
            <li>Same flows as OAuth — adding the <code>openid</code> scope is what activates OIDC.</li>
            <li>Standardizes claims: <code>iss</code>, <code>sub</code>, <code>aud</code>, <code>iat</code>, <code>exp</code>, <code>nonce</code>, <code>auth_time</code>.</li>
          </ul>
        </div>
      </div>
      <div class="note" style="margin-top:18px">
        <div class="note__head">rule of thumb</div>
        <div>
          <strong>If your app needs to call an API:</strong> use OAuth (request the API's scopes, get an access_token).<br>
          <strong>If your app needs to know who the user is:</strong> use OIDC (request <code>openid</code>, get an id_token).<br>
          <strong>If both:</strong> request <code>openid</code> + your API scopes; you get both tokens in one round-trip.
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">the activation switch</div>
      <h2 style="margin-top:8px">The single request that gets you OIDC.</h2>
      <p class="lede" style="margin-top:10px">The same Authorization Code Flow that OAuth defines becomes OIDC the moment you include the <code>openid</code> scope. The token endpoint then returns an id_token alongside the access_token.</p>
      <div style="margin-top:18px">
        ${packetCardSafe({
          method: 'REDIRECT',
          url: 'okta.example.com/oauth2/default/v1/authorize',
          channel: 'front',
          body: [
            '<key>response_type</key>=<val>code</val>',
            '<key>client_id</key>=<val>0oa9abc123XYZdemo</val>',
            '<key>redirect_uri</key>=<val>https://app.example.com/callback</val>',
            '<key>scope</key>=<val>openid profile email orders:read</val>     <comment># openid → OIDC kicks in</comment>',
            '<key>state</key>=<val>9bA2…</val>',
            '<key>nonce</key>=<val>n-aA38…</val>                                <comment># OIDC: replay defence</comment>',
            '<key>code_challenge</key>=<public>K2u-Y…</public>',
            '<key>code_challenge_method</key>=<val>S256</val>'
          ].join('\n')
        }, { note: 'Without <code>openid</code>, you get an access_token only. Add <code>openid</code> and you also get an id_token.' })}
      </div>
    </section>

    <section class="section lvl-adv">
      <div class="kicker text-violet">advanced · deep dive</div>
      <h2 style="margin-top:8px">OIDC discovery — let the IdP describe itself.</h2>
      <p class="lede" style="margin-top:10px">Hardcoding endpoints is fragile. Every OIDC provider exposes a JSON document at <code>{issuer}/.well-known/openid-configuration</code> that lists its endpoints, supported scopes, claims, signing algorithms, and JWKS URI. Modern clients fetch this once at startup and cache it.</p>
      ${packetCardSafe({
        method: 'GET',
        url: 'https://okta.example.com/oauth2/default/.well-known/openid-configuration',
        channel: 'back',
        body: [
          '{',
          '  "<key>issuer</key>": "https://okta.example.com/oauth2/default",',
          '  "<key>authorization_endpoint</key>": ".../v1/authorize",',
          '  "<key>token_endpoint</key>": ".../v1/token",',
          '  "<key>jwks_uri</key>": ".../v1/keys",',
          '  "<key>userinfo_endpoint</key>": ".../v1/userinfo",',
          '  "<key>introspection_endpoint</key>": ".../v1/introspect",',
          '  "<key>revocation_endpoint</key>": ".../v1/revoke",',
          '  "<key>device_authorization_endpoint</key>": ".../v1/device/authorize",',
          '  "<key>response_types_supported</key>": ["code", "id_token", "token id_token"],',
          '  "<key>id_token_signing_alg_values_supported</key>": ["RS256"],',
          '  "<key>token_endpoint_auth_methods_supported</key>": ["client_secret_post", "client_secret_basic", "private_key_jwt", "none"],',
          '  "<key>code_challenge_methods_supported</key>": ["S256"]',
          '}'
        ].join('\n')
      }, { note: 'Match the issuer string exactly — discovery responses must be cryptographically bound to it (RFC 8414 §3.3). Some libraries fetch over HTTPS and cache by the issuer URL itself.' })}
    </section>

    <section class="section">
      <div class="kicker">where to next</div>
      <h2 style="margin-top:8px">Now you have the model — drill into the details.</h2>
      <div class="grid grid--3" style="margin-top:18px">
        <div class="card">
          <div class="minihead">see it on the wire</div>
          <h3>Flow Lab</h3>
          <p class="muted" style="margin-top:6px">Watch the protocol-level Authorization Code + PKCE flow with every header, parameter, and response.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/flow-lab">Open the Flow Lab →</a></div>
        </div>
        <div class="card">
          <div class="minihead">unpack the tokens</div>
          <h3>Tokens</h3>
          <p class="muted" style="margin-top:6px">The five tokens you'll meet, each one's audience, and an interactive inspector to decode any JWT.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/tokens">Read the tokens module →</a></div>
        </div>
        <div class="card">
          <div class="minihead">apply it to ZTNA</div>
          <h3>The Three Layers</h3>
          <p class="muted" style="margin-top:6px">How OIDC's principals map onto your specific stack: Okta as the OP, Cloudflare Access as the RP, your app as the resource server.</p>
          <div style="margin-top:12px"><a class="linklike" href="#/three-layers">Open Three Layers →</a></div>
        </div>
      </div>
    </section>
  `);

  // Mount the conceptual swimlane
  renderFlow($('#oidc-conceptual-flow', view), 'oidc-conceptual');
};

ROUTES['three-layers'] = function (view) {
  setHTML(view, moduleHeader('05', 'concepts · 04', 'Three layers, three jobs.', `
    Most ZTNA confusion is about <em>which</em> layer is supposed to do <em>what</em>. Get this map right and the rest of the system makes sense.
    The illustration uses Okta + Cloudflare Access as a worked example, but the same three-layer structure applies to any IdP + gateway pair —
    Okta + AWS ALB, Okta + FortiGate, Entra ID + Google IAP, and so on.
  `) + `
    <section class="section">
      <div class="grid grid--3">
        <div class="card card--cyan">
          <div class="minihead text-cyan">layer 1</div>
          <h3>Okta — Identity Provider</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Authenticates the human (passwords, MFA, biometrics).</li>
            <li>Issues access tokens, ID tokens, refresh tokens.</li>
            <li>Hosts JWKS, /authorize, /token, /userinfo, /introspect, /revoke endpoints.</li>
            <li>Owns the user directory and group membership.</li>
            <li>Defines scopes &amp; claims via Authorization Servers.</li>
          </ul>
        </div>
        <div class="card" style="border-color:rgba(244,114,182,.35);background:linear-gradient(180deg,rgba(244,114,182,.05),transparent 60%),var(--surface)">
          <div class="minihead" style="color:var(--lane-cf)">layer 2</div>
          <h3>ZTNA gateway — identity-aware proxy</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Sits in front of the app at the network or cloud edge.</li>
            <li>Outsources authentication to the IdP (Okta) via OIDC or SAML.</li>
            <li>Evaluates per-application policies (allow / deny / require) per request.</li>
            <li>Forwards a signed assertion of the user's identity to the origin.</li>
            <li>Common implementations: Cloudflare Access, AWS ALB authentication, FortiGate ZTNA, Google IAP, Azure App Proxy, oauth2-proxy.</li>
          </ul>
        </div>
        <div class="card" style="border-color:rgba(134,239,172,.35);background:linear-gradient(180deg,rgba(134,239,172,.05),transparent 60%),var(--surface)">
          <div class="minihead" style="color:var(--lane-app)">layer 3</div>
          <h3>App / API — Resource server</h3>
          <ul class="split__list" style="margin-top:10px">
            <li>Verifies the Cloudflare JWT (defence in depth).</li>
            <li>Verifies its own bearer access_token if it exposes an API.</li>
            <li>Enforces fine-grained, per-resource authorization (RBAC, ABAC).</li>
            <li>Maps user identity → application permissions.</li>
            <li>Owns the data; owns the final yes/no.</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">authorization is layered</div>
      <h2 style="margin-top:8px">Two different "yes/no" decisions, at two different layers.</h2>
      <p class="lede" style="margin-top:10px">Cloudflare Access decides <em>"is this user allowed to reach this app at all?"</em> The app/API decides <em>"is this user allowed to do this specific thing on this specific resource?"</em></p>

      <div class="grid grid--2" style="margin-top:22px">
        <div class="card card--accent">
          <div class="minihead">policy enforcement at the gateway</div>
          <h3>Cloudflare Access (PEP at edge)</h3>
          <p>"Is the user a member of <code>Engineering</code>? Did they MFA in the last 8h? Are they on a managed device?"</p>
          <p class="muted" style="margin-top:6px">Coarse-grained. Same answer for everyone hitting the same hostname.</p>
        </div>
        <div class="card card--accent">
          <div class="minihead">policy enforcement in the app</div>
          <h3>Your API (PEP in code)</h3>
          <p>"Can <code>ada@example.com</code> read order #42? Does her token have the <code>orders:read</code> scope? Is order #42 in her tenant?"</p>
          <p class="muted" style="margin-top:6px">Fine-grained. Per-request. Per-resource. Per-action.</p>
        </div>
      </div>

      <div class="note" style="margin-top:14px">
        <div class="note__head">why both</div>
        <div>The gateway can't know your business rules ("this row belongs to that tenant"). The app can't easily verify identity itself with all the rigor of an IdP. So you stack them: gateway filters out unauthenticated traffic; the app makes the final, contextual decision.</div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">request lifecycle</div>
      <h2 style="margin-top:8px">A single user request, end-to-end.</h2>
      <div id="three-layers-flow" style="margin-top:18px"></div>
    </section>

    <section class="section">
      <div class="kicker">"what each party knows"</div>
      <h2 style="margin-top:8px">Who learns what during a successful login?</h2>
      <div class="party-grid" style="margin-top:18px">
        <div class="party-card">
          <div class="party-card__head" style="color:var(--lane-okta)"><span class="blip" style="background:var(--lane-okta)"></span> Okta</div>
          <ul>
            <li>Knows the user's password, MFA factors, IP.</li>
            <li>Knows which clients (apps) the user signed into.</li>
            <li>Issues tokens. Knows what scopes were granted.</li>
            <li>Knows nothing about your business data.</li>
          </ul>
        </div>
        <div class="party-card">
          <div class="party-card__head" style="color:var(--lane-cf)"><span class="blip" style="background:var(--lane-cf)"></span> Cloudflare Access</div>
          <ul>
            <li>Learns the user's email + group claims from Okta.</li>
            <li>Sees the request URL and source IP.</li>
            <li>Issues its own JWT for the origin.</li>
            <li>Does not see your Okta API access_tokens.</li>
          </ul>
        </div>
        <div class="party-card">
          <div class="party-card__head" style="color:var(--lane-app)"><span class="blip" style="background:var(--lane-app)"></span> Your app</div>
          <ul>
            <li>Receives a CF JWT — verifies it, learns user identity.</li>
            <li>If it has its own API call, also has access_token.</li>
            <li>Knows the data; knows the permissions.</li>
            <li>Can deny even if the gateway said yes.</li>
          </ul>
        </div>
        <div class="party-card">
          <div class="party-card__head" style="color:var(--lane-user)"><span class="blip" style="background:var(--lane-user)"></span> User</div>
          <ul>
            <li>Sees only the Okta login UI and the app.</li>
            <li>Never sees Cloudflare's interception.</li>
            <li>Provides credentials only to Okta — never to the app.</li>
          </ul>
        </div>
      </div>
    </section>
  `);

  renderFlow($('#three-layers-flow', view), 'cf-access');

  // Architecture + trust boundaries — distributed here from the old Visualizations module.
  view.insertAdjacentHTML('beforeend', `
    <section class="section">
      <div class="kicker">architecture</div>
      <h2 style="margin-top:8px">All three layers, one diagram.</h2>
      <div class="arch" style="margin-top:18px">
        <svg class="arch__svg" viewBox="0 0 900 540" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="a-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <polygon points="0,0 8,4 0,8" fill="currentColor"/>
            </marker>
          </defs>

          <g transform="translate(40,40)">
            <rect class="arch__node arch__node--user" x="0" y="0" width="170" height="80" rx="10"/>
            <text class="arch__node-title" x="20" y="32">User</text>
            <text class="arch__node-sub" x="20" y="54">browser · cli · ci runner</text>
          </g>

          <g transform="translate(310,40)">
            <rect class="arch__node arch__node--cf" x="0" y="0" width="280" height="120" rx="12"/>
            <text class="arch__node-title" x="20" y="34">Cloudflare Access</text>
            <text class="arch__node-sub" x="20" y="56">identity-aware proxy · pep</text>
            <line x1="20" y1="74" x2="260" y2="74" stroke="var(--hairline-2)" stroke-dasharray="2 4"/>
            <text class="arch__node-sub" x="20" y="94" style="text-transform:none;letter-spacing:0">policy engine · cf jwt issuer</text>
            <text class="arch__node-sub" x="20" y="110" style="text-transform:none;letter-spacing:0">team.cloudflareaccess.com</text>
          </g>

          <g transform="translate(680,40)">
            <rect class="arch__node arch__node--okta" x="0" y="0" width="180" height="120" rx="12"/>
            <text class="arch__node-title" x="20" y="34">Okta</text>
            <text class="arch__node-sub" x="20" y="56">idp · authz server</text>
            <line x1="20" y1="74" x2="160" y2="74" stroke="var(--hairline-2)" stroke-dasharray="2 4"/>
            <text class="arch__node-sub" x="20" y="94" style="text-transform:none;letter-spacing:0">/authorize · /token · /jwks</text>
            <text class="arch__node-sub" x="20" y="110" style="text-transform:none;letter-spacing:0">okta.example.com</text>
          </g>

          <g transform="translate(310,210)">
            <rect class="arch__node" x="0" y="0" width="280" height="60" rx="10" stroke-dasharray="3 4"/>
            <text class="arch__node-title" x="20" y="24" style="font-size:13px">Cloudflare Tunnel (optional)</text>
            <text class="arch__node-sub" x="20" y="44" style="text-transform:none;letter-spacing:0">cloudflared on origin · outbound only</text>
          </g>

          <g transform="translate(280,310)">
            <rect class="arch__node arch__node--app" x="0" y="0" width="200" height="100" rx="10"/>
            <text class="arch__node-title" x="20" y="32">Protected app</text>
            <text class="arch__node-sub" x="20" y="54">verifies cf jwt · serves pages</text>
          </g>

          <g transform="translate(540,310)">
            <rect class="arch__node arch__node--app" x="0" y="0" width="200" height="100" rx="10"/>
            <text class="arch__node-title" x="20" y="32">Protected API</text>
            <text class="arch__node-sub" x="20" y="54">verifies okta access_token</text>
          </g>

          <g>
            <path class="arch__edge arch__edge--data" d="M 210 80 H 310" marker-end="url(#a-arrow)"/>
            <text class="arch__edge-label" x="220" y="72">https</text>

            <path class="arch__edge arch__edge--auth" d="M 590 100 H 680" marker-end="url(#a-arrow)"/>
            <text class="arch__edge-label" x="600" y="92">oidc</text>

            <path class="arch__edge arch__edge--data" d="M 450 160 V 210"/>
            <path class="arch__edge arch__edge--data" d="M 380 270 V 310" marker-end="url(#a-arrow)"/>

            <path class="arch__edge arch__edge--auth" d="M 480 360 H 540" marker-end="url(#a-arrow)"/>
            <text class="arch__edge-label" x="490" y="352">bearer</text>

            <path class="arch__edge" d="M 740 310 C 800 220, 800 130, 770 110" marker-end="url(#a-arrow)" fill="none"/>
            <text class="arch__edge-label" x="780" y="220">jwks</text>
          </g>
        </svg>
      </div>
    </section>

    <section class="section">
      <div class="kicker">trust boundaries</div>
      <h2 style="margin-top:8px">Where do you stop trusting input?</h2>
      <div style="margin-top:18px">
        <div class="boundary">
          User-agent. Anything coming from here is suspect — including your own JS. <strong>Validate state, nonce, and CSRF tokens</strong> before acting.
        </div>
        <div class="boundary" style="margin-top:14px">
          Network edge. Headers like <code>X-Forwarded-For</code> and <code>Cf-Access-Authenticated-User-Email</code> are trustworthy <em>only</em> when validated against a signed assertion (CF JWT).
        </div>
        <div class="boundary" style="margin-top:14px">
          Inside your app. Even after the gateway said yes, your business logic is the last word on whether action <em>X</em> on resource <em>Y</em> is allowed.
        </div>
      </div>
    </section>
  `);
};

ROUTES['tokens'] = function (view, params) {
  params = params || {};
  setHTML(view, moduleHeader('04', 'concepts · 03', 'A token is just a string. Until you verify it.', `
    There are five tokens you'll meet. Each one is issued by a different party, lives a different life, and goes in a different place.
    Most of them are JSON Web Tokens (JWTs): three base64url-encoded segments — header, payload, signature — separated by dots.
  `) + `
    <section class="section">
      <div class="grid grid--auto-300">
        <div class="card card--accent">
          <div class="minihead">authorization code</div>
          <h3 style="margin-top:6px">authorization code</h3>
          <p class="muted">Short, opaque, single-use. Returned to the redirect URI in the front channel; exchanged for tokens on the back channel.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Lifetime: ~10 minutes</li>
            <li>Carrier: URL query string on redirect</li>
            <li>Audience: the token endpoint of the AS</li>
            <li>Tied to: client_id, redirect_uri, code_verifier (PKCE)</li>
          </ul>
        </div>
        <div class="card card--accent">
          <div class="minihead">access token</div>
          <h3 style="margin-top:6px">access_token</h3>
          <p class="muted">The credential you send to APIs. May be a JWT (Okta custom AS) or opaque (Okta org AS).</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Lifetime: ~1 hour (configurable)</li>
            <li>Carrier: <code>Authorization: Bearer &lt;token&gt;</code></li>
            <li>Audience: your API's identifier</li>
            <li>Verified by: the API, using JWKS</li>
          </ul>
        </div>
        <div class="card card--cyan">
          <div class="minihead">id token</div>
          <h3 style="margin-top:6px">id_token</h3>
          <p class="muted">A signed identity assertion <em>about the user, for the client</em>. Only OIDC issues this.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Lifetime: ~1 hour</li>
            <li>Carrier: token endpoint response (back channel)</li>
            <li>Audience: your <code>client_id</code></li>
            <li>Verified by: the client, using JWKS</li>
          </ul>
        </div>
        <div class="card">
          <div class="minihead">refresh token</div>
          <h3 style="margin-top:6px">refresh_token</h3>
          <p class="muted">Used to get new access tokens without bothering the user. Long-lived; high-value secret.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Lifetime: days to months</li>
            <li>Carrier: POST body to /token</li>
            <li>Audience: the token endpoint</li>
            <li>Best practice: rotate on every use</li>
          </ul>
        </div>
        <div class="card" style="border-color:rgba(244,114,182,.35);background:linear-gradient(180deg,rgba(244,114,182,.05),transparent 60%),var(--surface)">
          <div class="minihead" style="color:var(--lane-cf)">cloudflare</div>
          <h3 style="margin-top:6px">CF_Authorization JWT</h3>
          <p class="muted">Cloudflare Access's own short-lived JWT. Lives as a cookie on your app's hostname; forwarded to the origin as a header.</p>
          <ul class="split__list" style="margin-top:10px">
            <li>Lifetime: ~30 minutes (configurable per app)</li>
            <li>Carrier: <code>Cookie: CF_Authorization</code> + <code>Cf-Access-Jwt-Assertion</code> header</li>
            <li>Audience: the Access app's AUD (a CF-generated UUID)</li>
            <li>Verified by: the origin, using <code>https://team.cloudflareaccess.com/cdn-cgi/access/certs</code></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">jwt anatomy</div>
      <h2 style="margin-top:8px">A JWT is three base64url segments separated by dots.</h2>
      <p class="lede" style="margin-top:10px">It is <em>not</em> encrypted. Anyone can read the payload. The signature only proves who issued it — not that they were authorized to issue it for <em>your</em> system. That's why audience matters.</p>

      <div class="card" style="margin-top:22px">
        <div class="jwt-display" id="anatomy-jwt"></div>
        <div class="jwt-cols">
          <div class="jwt-col jwt-col--h">
            <div class="jwt-col__head">header</div>
            <div class="jwt-col__body" id="anatomy-h"></div>
          </div>
          <div class="jwt-col jwt-col--p">
            <div class="jwt-col__head">payload</div>
            <div class="jwt-col__body" id="anatomy-p"></div>
          </div>
          <div class="jwt-col jwt-col--s">
            <div class="jwt-col__head">signature</div>
            <div class="jwt-col__body" id="anatomy-s"></div>
          </div>
        </div>
        <div class="legend-row" style="margin-top:14px">
          <span class="legend-pill"><span class="swatch" style="background:rgba(248,113,113,.4);border:1px solid var(--coral)"></span> header — algorithm &amp; key id</span>
          <span class="legend-pill"><span class="swatch" style="background:rgba(34,211,238,.4);border:1px solid var(--cyan)"></span> payload — claims (iss, sub, aud, exp, …)</span>
          <span class="legend-pill"><span class="swatch" style="background:rgba(167,139,250,.4);border:1px solid var(--violet)"></span> signature — proves the header+payload weren't tampered with</span>
        </div>
        <div style="margin-top:14px"><a class="linklike" href="#ti-section">Jump to the interactive inspector below ↓</a></div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">never confuse</div>
      <h2 style="margin-top:8px">Two pairs to keep separate.</h2>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="risk">
          <div class="risk__head">access_token vs id_token</div>
          <p>access_token is for APIs. id_token is for the client. Their <code>aud</code> claims point to different things. Sending an id_token to an API is a common bug — and a security problem because APIs that don't strictly check <code>aud</code> may accept it anyway.</p>
        </div>
        <div class="risk">
          <div class="risk__head">CF JWT vs Okta JWT</div>
          <p>The Cloudflare JWT is issued by <code>https://team.cloudflareaccess.com</code>. Okta's tokens are issued by <code>https://okta.example.com/oauth2/default</code>. Different signing keys. Different audiences. Different purposes.</p>
        </div>
      </div>
    </section>

    <section class="section lvl-adv">
      <div class="kicker text-violet">advanced · deep dive</div>
      <h2 style="margin-top:8px">Beyond bearer: sender-constrained tokens (DPoP &amp; mTLS).</h2>
      <p class="lede" style="margin-top:10px">A bearer token is whoever-holds-it-can-use-it. If someone steals your access_token from a log file, they can call your API as you until expiry. Sender-constrained tokens fix this by binding the token to a key the holder must demonstrate control of on every request.</p>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead text-violet">DPoP</div>
          <h3>Demonstrating Proof of Possession</h3>
          <p style="margin-top:6px">Client generates an asymmetric keypair. The token's <code>cnf</code> claim binds it to the public key. Every API request includes a <code>DPoP</code> header — a short-lived JWT signed by the same private key, bound to the request method and URL.</p>
          <p class="muted fineprint" style="margin-top:8px">A leaked access_token is useless without the matching private key. RFC 9449.</p>
        </div>
        <div class="card">
          <div class="minihead text-violet">mTLS-bound tokens</div>
          <h3>RFC 8705</h3>
          <p style="margin-top:6px">The TLS client certificate's thumbprint goes into the token's <code>cnf.x5t#S256</code> claim. The API rejects the token unless presented over a TLS connection terminated with that same certificate.</p>
          <p class="muted fineprint" style="margin-top:8px">Common for high-assurance B2B integrations and FAPI-compliant deployments.</p>
        </div>
      </div>
    </section>
  `);

  const t = PL.sampleTokens.find(x => x.key === 'access_okta');
  const parts = t.jwt.split('.');
  const hSeg = parts[0], pSeg = parts[1], sSeg = parts[2];
  const anatomyEl = $('#anatomy-jwt', view);
  setHTML(anatomyEl, `<span class="jwt-seg-h">${esc(hSeg)}</span><span class="jwt-dot">.</span><span class="jwt-seg-p">${esc(pSeg)}</span><span class="jwt-dot">.</span><span class="jwt-seg-s">${esc(sSeg)}</span>`);
  $('#anatomy-h', view).textContent = JSON.stringify(t.headerObj, null, 2);
  $('#anatomy-p', view).textContent = JSON.stringify(t.payloadObj, null, 2);
  $('#anatomy-s', view).textContent = sSeg + '\n\n# Computed as\n# RS256( base64url(header) + "." + base64url(payload), Okta_private_key )';

  // Token lifecycle (was its own block in Visualizations, now lives here).
  view.insertAdjacentHTML('beforeend', `
    <section class="section">
      <div class="kicker">token lifecycle</div>
      <h2 style="margin-top:8px">From mint to expiry.</h2>
      <ul class="split__list" style="margin-top:18px">
        <li><span class="text-amber">issued</span> — Okta mints the token with a kid + signature</li>
        <li><span class="text-amber">in-flight</span> — sent in headers, never query strings</li>
        <li><span class="text-amber">at rest</span> — kept in memory or OS keychain, not localStorage</li>
        <li><span class="text-amber">verified</span> — every consumer re-checks iss + aud + exp + sig</li>
        <li><span class="text-amber">refreshed</span> — replaced ~1 minute before exp</li>
        <li><span class="text-amber">revoked</span> — refresh-token reuse triggers family invalidation</li>
        <li><span class="text-amber">expired</span> — 401 invalid_token; client repeats the dance</li>
      </ul>
    </section>

    <section class="section">
      <div class="kicker">interactive · token inspector</div>
      <h2 style="margin-top:8px">Decode any JWT, run the validation checklist.</h2>
      <p class="lede" style="margin-top:10px">Pick a sample token from the list, or paste any JWT. The inspector splits header / payload / signature, names every claim, and walks the validation checklist that a real verifier runs.</p>
    </section>
  `);

  // Mount the interactive inspector
  if (window.PL_app.mountTokenInspector) {
    window.PL_app.mountTokenInspector(view);
  }

  // If deep-linked with ?focus=inspector, scroll to it
  if (params.focus === 'inspector') {
    setTimeout(() => {
      const target = view.querySelector('#ti-section');
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }
};

ROUTES['scopes-aud-claims'] = function (view) {
  setHTML(view, moduleHeader('06', 'concepts · 05', 'Scopes, audiences, and claims do <em>different jobs</em>.', `
    They show up next to each other in token payloads, so it's tempting to treat them interchangeably. Don't. Each one answers a different question.
  `) + `
    <section class="section">
      <div class="grid grid--3">
        <div class="card card--accent">
          <div class="minihead">scope</div>
          <h3 style="margin-top:6px">What can the token do?</h3>
          <p>A space-separated list of named permissions the client requested and the user (or admin) approved.</p>
          <p class="fineprint" style="margin-top:8px">Examples: <code>openid</code> · <code>profile</code> · <code>orders:read</code> · <code>orders:write</code> · <code>offline_access</code></p>
        </div>
        <div class="card card--cyan">
          <div class="minihead">audience</div>
          <h3 style="margin-top:6px">Who is the token for?</h3>
          <p>The intended recipient. Tokens for one API <em>must</em> not be accepted by another, even if both trust the same IdP.</p>
          <p class="fineprint" style="margin-top:8px">Examples: <code>api://orders</code> · <code>0oa9abc123XYZ</code> · <code>abc123def456</code> (CF AUD)</p>
        </div>
        <div class="card">
          <div class="minihead">claim</div>
          <h3 style="margin-top:6px">What is true about the user/client?</h3>
          <p>Statements carried in the token: identifier, email, groups, MFA status. Claims are facts the IdP attests to.</p>
          <p class="fineprint" style="margin-top:8px">Examples: <code>sub</code>, <code>email</code>, <code>groups</code>, <code>auth_time</code>, <code>amr</code></p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">side-by-side</div>
      <h2 style="margin-top:8px">In a single access_token.</h2>
      <table class="ctable matrix" style="margin-top:18px">
        <thead><tr><th>Field</th><th>Type</th><th>Purpose</th><th>Who decides it?</th></tr></thead>
        <tbody>
          <tr><td><code>scp: ["orders:read"]</code></td><td><span class="tag tag--amber">scope</span></td><td>Permissions delegated to the client</td><td>Client requests; Okta and/or user approves</td></tr>
          <tr><td><code>aud: "api://demo-api"</code></td><td><span class="tag tag--cyan">audience</span></td><td>Which API this token is for</td><td>The Authorization Server, based on resource binding</td></tr>
          <tr><td><code>sub: "00u9abc…"</code></td><td><span class="tag">claim</span></td><td>The subject — the user (or client)</td><td>Okta, from the user directory</td></tr>
          <tr><td><code>groups: ["Engineering"]</code></td><td><span class="tag">claim</span></td><td>The user's group memberships</td><td>Okta, when the requested scope authorizes the claim</td></tr>
          <tr><td><code>iss: "okta.example.com/oauth2/default"</code></td><td><span class="tag">claim</span></td><td>Who issued the token</td><td>The Authorization Server</td></tr>
        </tbody>
      </table>

      <div class="risk" style="margin-top:18px">
        <div class="risk__head">scope is not authorization, only delegation</div>
        <p>A scope says <em>the client is allowed to attempt this action on the user's behalf</em>. It does not say <em>this user is allowed to do that action on this resource</em>. That second decision belongs to the API — using the user's identity, the resource state, and your business rules.</p>
      </div>
    </section>

    <section class="section">
      <div class="kicker">cloudflare access</div>
      <h2 style="margin-top:8px">How Access policies use claims.</h2>
      <p class="lede" style="margin-top:10px">When you wire Okta as an IdP into Cloudflare Access, the OIDC scopes you request determine which claims Access can see. Access policies then read those claims (typically email + groups) and decide whether to allow the request.</p>

      <div class="grid grid--2" style="margin-top:18px">
        <div class="card">
          <div class="minihead">scopes the cf↔okta integration requests</div>
          <ul class="split__list">
            <li><code>openid</code> — required, identifies the user</li>
            <li><code>profile</code> — name, preferred_username</li>
            <li><code>email</code> — email + email_verified</li>
            <li><code>groups</code> — group memberships (custom Okta scope)</li>
          </ul>
        </div>
        <div class="card">
          <div class="minihead">claims the access policy can match on</div>
          <ul class="split__list">
            <li><code>email</code> — exact match or domain</li>
            <li><code>groups</code> — equality, contains</li>
            <li><code>given_name</code>, <code>family_name</code></li>
            <li>Custom claims you add to the Okta authorization server</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="kicker">where authorization happens</div>
      <h2 style="margin-top:8px">Two places, two levels of detail.</h2>
      <div class="grid grid--2" style="margin-top:18px">
        <div class="card card--cyan">
          <div class="minihead">at the gateway (cf access)</div>
          <h3>Coarse</h3>
          <p>"Anyone in the <code>Engineering</code> group can reach <code>app.example.com</code>." Same answer for every URL on that hostname.</p>
        </div>
        <div class="card card--accent">
          <div class="minihead">in the application</div>
          <h3>Fine</h3>
          <p>"This particular user can read <em>their own</em> orders, write to <em>their own tenant</em>, and only when their access_token has the <code>orders:write</code> scope."</p>
        </div>
      </div>
    </section>
  `);
};

})();
