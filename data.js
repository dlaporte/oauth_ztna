/* =========================================================================
   Protocol Lab — Content / data
   All sample identifiers are fictional placeholders for educational use.
   ========================================================================= */

window.PL = {};

/* ------------------------------------------------------------------
   Sample JWTs — base64url encoded snapshots used by the Token Inspector.
   These are crafted demo payloads (NOT real tokens). Signatures are
   intentionally illustrative; the inspector teaches that decode != verify.
   ------------------------------------------------------------------ */

/* Acronym dictionary used by the auto-tooltip pass.
   First-occurrence-per-text-node only; skipped inside code/pre/packet bodies. */
PL.ACRONYMS = {
  'OAuth':       'an open standard for delegated authorization (current spec: OAuth 2.0)',
  'OIDC':        'OpenID Connect — an identity layer on top of OAuth 2.0',
  'OpenID Connect': 'identity layer on top of OAuth 2.0; adds the id_token and standard user claims',
  'ZTNA':        'Zero Trust Network Access — every request is authenticated and authorized regardless of network location',
  'Zero Trust':  'access model where every request is authenticated and authorized regardless of network location',
  'PKCE':        'Proof Key for Code Exchange — binds the authorization code to the requester via a random verifier (pronounced "pixie")',
  'JWT':         'JSON Web Token — a signed, base64url-encoded token with three segments: header.payload.signature',
  'JWKS':        'JSON Web Key Set — a JSON document at the IdP exposing public signing keys, indexed by `kid`',
  'JWK':         'JSON Web Key — a single public key entry in a JWKS, identified by its `kid`',
  'IdP':         'Identity Provider — the system that authenticates the user (Okta, in this lab)',
  'IdPs':        'Identity Providers',
  'MFA':         'Multi-Factor Authentication — proving identity with more than just a password',
  'SSO':         'Single Sign-On — sign in once, gain access to many connected applications',
  'CSRF':        'Cross-Site Request Forgery — a malicious site causing your authenticated browser to perform an action',
  'SPA':         'Single-Page Application — JavaScript-driven web app, runs in the browser; cannot keep secrets',
  'SPAs':        'Single-Page Applications',
  'mTLS':        'mutual TLS — both client and server authenticate each other with X.509 certificates',
  'DPoP':        'Demonstrating Proof of Possession — proves the holder of a token also controls a paired key, defeating bearer-token theft',
  'RBAC':        'Role-Based Access Control — permissions assigned via role membership',
  'ABAC':        'Attribute-Based Access Control — permissions evaluated from attributes (user, resource, environment)',
  'PEP':         'Policy Enforcement Point — the component that *applies* an access decision (Cloudflare Access at the edge)',
  'PDP':         'Policy Decision Point — the component that *makes* an access decision (the policy engine)',
  'ROPC':        'Resource Owner Password Credentials — the deprecated grant where the client collects the user password directly',
  'CIAM':        'Customer Identity & Access Management — IdP product line oriented at end-user (B2C) sign-in',
  'CSP':         'Content Security Policy — HTTP header that restricts what JS / sources a page may load; defence against XSS',
  'CDN':         'Content Delivery Network',
  'CI/CD':       'Continuous Integration / Continuous Deployment — automated build & deploy pipelines',
  'CI':          'Continuous Integration — automated build & test pipelines',
  'XSS':         'Cross-Site Scripting — injection of malicious JS into a page',
  'CORS':        'Cross-Origin Resource Sharing — browser mechanism that allows controlled cross-origin HTTP requests',
  'TTL':         'time-to-live',
  'CC':          'Client Credentials — the OAuth grant for machine-to-machine, where the token sub is the client_id',
  'AS':          'Authorization Server — the OAuth role that issues tokens at /authorize and /token',
  'RS':          'Resource Server — the API that holds resources and validates incoming access tokens',
  'AUD':         'Application Audience — Cloudflare\'s per-application UUID; the aud claim on a CF Access JWT',
  'RP':          'Relying Party — the application that needs to know who the user is. Called "relying" because it relies on the IdP\'s assertion rather than authenticating the user itself',
  'RPs':         'Relying Parties — applications that delegate user authentication to a trusted IdP',
  'OP':          'OpenID Provider — the OIDC name for the Identity Provider; the system that authenticates the user and issues id_tokens',
  'SP':          'Service Provider — alternate name for the Relying Party, common in SAML terminology; the application receiving the identity assertion',
  'OPs':         'OpenID Providers — Identity Providers that implement OIDC',
  'API':         'Application Programming Interface — the back-end service a client calls; in OAuth terms, the Resource Server',
  'TLS':         'Transport Layer Security — the encryption layer underneath HTTPS',
  'B2C':         'Business-to-Consumer — applications serving end-users, as opposed to B2B (business-to-business)',
  'IAM':         'Identity & Access Management — the broader category that includes IdPs, RBAC, lifecycle management, and audit',
  'SAML':        'Security Assertion Markup Language — the XML-based federated identity protocol that pre-dates OIDC; still common in enterprise',
  'UI':          'User Interface',
  'URL':         'Uniform Resource Locator',
  'URI':         'Uniform Resource Identifier — like a URL, but more general (may identify resources without locating them)',
  'HTTP':        'HyperText Transfer Protocol — the request/response protocol of the web',
  'HTTPS':       'HTTP Secure — HTTP carried over a TLS-encrypted connection',
  'JSON':        'JavaScript Object Notation — the text format used for almost every payload in this lab',
  'RFC':         'Request For Comments — the IETF\'s standards documents (e.g. RFC 6749 = OAuth 2.0)'
};

PL.b64url = function (obj) {
  const s = JSON.stringify(obj);
  let b = btoa(unescape(encodeURIComponent(s)));
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
PL.fakeSig = function (len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor((Math.sin(i * 41) + 1) * 31) % chars.length];
  return s;
};
PL.makeJWT = function (header, payload, sigSeed) {
  return PL.b64url(header) + '.' + PL.b64url(payload) + '.' + (sigSeed || PL.fakeSig(86));
};

PL.now = Math.floor(Date.now() / 1000);
PL.iss_okta = 'https://okta.example.com/oauth2/default';
PL.iss_okta_org = 'https://okta.example.com';
PL.aud_api = 'api://demo-api';
PL.aud_clientid = '0oa9abc123XYZdemo';
PL.aud_cf = 'team.cloudflareaccess.com/cdn-cgi/access/aud/abc123def456';

PL.sampleTokens = [
  {
    key: 'access_okta',
    label: 'Okta access token (custom AS)',
    note: 'API access token issued by an Okta custom Authorization Server. Typed as JWT, audience is the API.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'k_8c3a1f29' },
    payloadObj: {
      iss: PL.iss_okta,
      sub: '00u9abc123XYZuser',
      aud: PL.aud_api,
      iat: PL.now - 30,
      exp: PL.now + 3570,
      cid: PL.aud_clientid,
      uid: '00u9abc123XYZuser',
      scp: ['openid', 'profile', 'email', 'orders:read'],
      groups: ['Engineering', 'oauth-class'],
      auth_time: PL.now - 120,
      jti: 'AT.5fA9-hQpZkxLbN7Xc3'
    }
  },
  {
    key: 'id_token',
    label: 'OIDC ID token',
    note: 'Identity assertion about the end-user. Audience is the client app, not the API.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'k_8c3a1f29' },
    payloadObj: {
      iss: PL.iss_okta,
      sub: '00u9abc123XYZuser',
      aud: PL.aud_clientid,
      iat: PL.now - 30,
      exp: PL.now + 3570,
      auth_time: PL.now - 120,
      nonce: 'n-aA38F2_9l7',
      email: 'ada@example.com',
      email_verified: true,
      name: 'Ada Lovelace',
      preferred_username: 'ada@example.com',
      azp: PL.aud_clientid,
      amr: ['pwd', 'mfa']
    }
  },
  {
    key: 'access_orgserver',
    label: 'Okta access token (org AS, opaque-style)',
    note: 'Org-level Authorization Server returns access tokens that may be opaque to third parties. Shown decoded for teaching.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'org_3a91' },
    payloadObj: {
      ver: 1,
      jti: 'AT.org_z7jXc2',
      iss: PL.iss_okta_org,
      aud: PL.iss_okta_org,
      sub: 'ada@example.com',
      iat: PL.now - 60,
      exp: PL.now + 3540,
      cid: PL.aud_clientid,
      uid: '00u9abc123XYZuser',
      scp: ['openid', 'profile']
    }
  },
  {
    key: 'cf_jwt',
    label: 'Cloudflare Access JWT (CF-Authorization)',
    note: 'Issued by Cloudflare Access to the origin app after policy passes. Different issuer, different audience, different signing key from Okta.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'cf_5e2b91d4' },
    payloadObj: {
      iss: 'https://team.cloudflareaccess.com',
      aud: ['abc123def456'],
      sub: '5d4f8a1b-2c3d-4e5f-9a8b-7c6d5e4f3a2b',
      iat: PL.now - 5,
      exp: PL.now + 1795,
      email: 'ada@example.com',
      identity_nonce: 'n7Hf2z',
      country: 'US',
      type: 'app',
      custom: {
        groups: ['Engineering', 'oauth-class'],
        idp: { type: 'okta', id: 'b1c2d3e4-okta' }
      }
    }
  },
  {
    key: 'access_cc',
    label: 'Client Credentials access token',
    note: 'Machine-to-machine access token. No user (sub == client). Issued via private_key_jwt assertion.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'k_8c3a1f29' },
    payloadObj: {
      iss: PL.iss_okta,
      sub: '0oa9svc_ci_runner',
      aud: PL.aud_api,
      iat: PL.now - 10,
      exp: PL.now + 590,
      cid: '0oa9svc_ci_runner',
      scp: ['orders:read', 'orders:write'],
      jti: 'AT.cc_b21Xz9'
    }
  },
  {
    key: 'expired',
    label: 'Expired token (debug)',
    note: 'Identical claims, but exp is in the past — fails validation.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'k_8c3a1f29' },
    payloadObj: {
      iss: PL.iss_okta,
      sub: '00u9abc123XYZuser',
      aud: PL.aud_api,
      iat: PL.now - 7200,
      exp: PL.now - 3600,
      cid: PL.aud_clientid,
      scp: ['openid', 'orders:read']
    }
  },
  {
    key: 'wrong_aud',
    label: 'Wrong audience (debug)',
    note: 'Issued for a different API. The receiving API must reject it.',
    headerObj: { alg: 'RS256', typ: 'JWT', kid: 'k_8c3a1f29' },
    payloadObj: {
      iss: PL.iss_okta,
      sub: '00u9abc123XYZuser',
      aud: 'api://wrong-api',
      iat: PL.now - 30,
      exp: PL.now + 3570,
      scp: ['openid', 'profile']
    }
  }
];

PL.sampleTokens.forEach(t => { t.jwt = PL.makeJWT(t.headerObj, t.payloadObj); });

/* ------------------------------------------------------------------
   Flows — swimlane definitions
   Each step has: from-lane, to-lane, label, channel (front/back), packet
   ------------------------------------------------------------------ */

const LANES = {
  user:    { id: 'user',    label: 'User',           color: 'var(--lane-user)' },
  browser: { id: 'browser', label: 'Browser',        color: 'var(--lane-browser)' },
  client:  { id: 'client',  label: 'Client app',     color: 'var(--lane-client)' },
  okta:    { id: 'okta',    label: 'Okta auth server', color: 'var(--lane-okta)' },
  cf:      { id: 'cf',      label: 'Cloudflare Access', color: 'var(--lane-cf)' },
  app:     { id: 'app',     label: 'Protected app',  color: 'var(--lane-app)' },
  api:     { id: 'api',     label: 'Protected API',  color: 'var(--lane-api)' },
  jwks:    { id: 'jwks',    label: 'JWKS endpoint',  color: 'var(--lane-jwks)' },
  ci:      { id: 'ci',      label: 'CI / runner',    color: 'var(--lane-ci)' },
  cli:     { id: 'cli',     label: 'CLI / device',   color: 'var(--lane-ci)' }
};

PL.LANES = LANES;

/* Author packets compactly. tokens highlighted with <secret>, <public>, <token> markers */
function p(lines) { return lines.join('\n'); }
function highlight(s) {
  return s
    .replace(/<secret>([^<]+)<\/secret>/g, '<span class="h-secret">$1</span>')
    .replace(/<public>([^<]+)<\/public>/g, '<span class="h-public">$1</span>')
    .replace(/<comment>([^<]+)<\/comment>/g, '<span class="h-comment">$1</span>')
    .replace(/<key>([^<]+)<\/key>/g, '<span class="h-key">$1</span>')
    .replace(/<val>([^<]+)<\/val>/g, '<span class="h-val">$1</span>');
}
PL.highlight = highlight;

PL.flows = {};

/* === Conceptual OIDC flow ===
   For the OIDC tutorial. No protocol-level details (no PKCE, no JWKS, no
   nonce handling). Just the principal-to-principal exchanges so a learner
   builds a mental model first. */
PL.flows['oidc-conceptual'] = {
  id: 'oidc-conceptual',
  title: 'OIDC at the conceptual level',
  deck: 'No protocol details — just the exchanges between principals.',
  conceptual: true,           // hides from Flow Lab picker + Protocol Inspector list
  lanes: ['user', 'browser', 'client', 'okta', 'api'],
  steps: [
    {
      from: 'user', to: 'client', label: 'User opens the app',
      channel: 'front',
      packet: { method: 'CLICK', url: 'app.example.com/profile',
        body: '<comment># The app has no idea who the user is yet — they have no session, no cookie, no identity.</comment>' },
      note: 'OIDC begins when an unauthenticated person lands on a protected page. The Relying Party (RP) cannot identify them on its own.'
    },
    {
      from: 'client', to: 'browser', label: 'RP delegates authentication to the IdP',
      channel: 'front',
      packet: { method: 'REDIRECT', url: 'okta.example.com (the OpenID Provider)',
        body: '<comment># "I don\'t know who this person is. Please ask the IdP to identify them on my behalf, then send them back to me."</comment>' },
      note: 'The RP redirects the user-agent to the IdP. The RP itself never collects credentials — that\'s the whole point of federated identity.'
    },
    {
      from: 'user', to: 'okta', label: 'User authenticates with the IdP',
      channel: 'front',
      packet: { method: 'PROMPT', url: 'okta.example.com (login UI)',
        body: '<comment># Username, password, MFA, biometrics — whatever methods the IdP supports.\n# These never touch the RP.</comment>' },
      note: 'The user proves who they are to the IdP, ONCE. After this, every other RP that trusts the same IdP can identify the same user without asking again — that\'s SSO.'
    },
    {
      from: 'okta', to: 'browser', label: 'IdP issues a temporary code',
      channel: 'front',
      packet: { method: 'REDIRECT', url: 'app.example.com/callback?code=…',
        body: '<comment># The IdP sends the user back to the RP with a short-lived code.\n# The code is a claim ticket — it cannot be used directly; only the RP can redeem it.</comment>' },
      note: 'The browser carries a code, not the actual identity. This separation is what protects identity tokens from leaking through browser history or logs.'
    },
    {
      from: 'client', to: 'okta', label: 'RP redeems the code on the back channel',
      channel: 'back',
      packet: { method: 'POST', url: 'okta.example.com/token',
        body: '<comment># Server-to-server. The RP exchanges the code for tokens.\n# This back-channel exchange means tokens never travel through the user-agent.</comment>' },
      note: 'The RP authenticates itself to the IdP (with a client secret or signed assertion) and trades the code for tokens.'
    },
    {
      from: 'okta', to: 'client', label: 'IdP returns id_token + access_token',
      channel: 'back',
      packet: { method: 'POST', url: '↩ token response',
        body: [
          '{',
          '  "<key>id_token</key>": "<secret>eyJ… signed identity assertion</secret>",',
          '  "<key>access_token</key>": "<secret>eyJ… capability for the API</secret>",',
          '  "<key>token_type</key>": "Bearer",',
          '  "<key>expires_in</key>": 3600',
          '}'
        ].join('\n') },
      note: 'Two tokens for two purposes. The id_token tells the RP who the user is. The access_token lets the RP call APIs as the user.'
    },
    {
      from: 'client', to: 'client', label: 'RP verifies the id_token',
      channel: 'back',
      packet: { method: 'COMPUTE', url: 'in the RP',
        body: [
          '<key>signature</key>  ✓ verified with the IdP\'s public key (JWKS)',
          '<key>iss</key>        ✓ matches the expected IdP',
          '<key>aud</key>        ✓ this token was issued FOR THIS RP',
          '<key>exp</key>        ✓ has not expired',
          '<key>nonce</key>      ✓ matches the value the RP sent at the start',
          '<comment># Only after these pass does the RP trust the identity claim.</comment>'
        ].join('\n') },
      note: 'Without verification, an attacker could forge tokens. The signature is what makes the IdP\'s claim trustworthy — it\'s why the IdP\'s public keys (JWKS) matter so much.'
    },
    {
      from: 'client', to: 'user', label: 'User is signed in',
      channel: 'front',
      packet: { method: 'RENDER', url: 'app.example.com/profile',
        body: '<comment># The RP creates a local session for the user, sets a session cookie,\n# and renders the page. Subsequent requests use the cookie.</comment>' },
      note: 'The RP now has a local session derived from the IdP\'s assertion. Each RP runs its own session — they\'re not shared between RPs.'
    },
    {
      from: 'client', to: 'api', label: '(optional) RP calls APIs as the user',
      channel: 'back',
      packet: { method: 'GET', url: 'api.example.com/profile',
        body: 'Authorization: Bearer <secret>eyJ… access_token</secret>' },
      note: 'OIDC tells the RP WHO the user is. OAuth (which OIDC is built on) tells APIs WHAT the RP is allowed to do on the user\'s behalf. They\'re different jobs.'
    }
  ]
};

/* === Authorization Code + PKCE === */

PL.flows['authcode-pkce'] = {
  id: 'authcode-pkce',
  title: 'Authorization Code Flow with PKCE',
  deck: 'For SPAs, native apps, and modern web apps. The standard for any flow that involves a user.',
  lanes: ['user', 'browser', 'client', 'okta', 'jwks', 'api'],
  steps: [
    {
      from: 'user', to: 'client', label: 'User clicks "Sign in"',
      channel: 'front',
      packet: {
        method: 'CLICK',
        url: 'app.example.com/login',
        body: p([
          '<comment># User initiates authentication on the SPA</comment>'
        ])
      },
      note: 'Authentication has not happened yet. The client app needs to delegate that to Okta.'
    },
    {
      from: 'client', to: 'client', label: 'Generate state, code_verifier, code_challenge',
      channel: 'front',
      packet: {
        method: 'COMPUTE',
        url: 'in-memory',
        body: p([
          '<key>state</key>          = <val>cryptographically-random</val>      <comment># prevents CSRF on callback</comment>',
          '<key>code_verifier</key>  = <secret>random_43_to_128_chars_high_entropy</secret>',
          '<key>code_challenge</key> = BASE64URL( SHA256( <secret>code_verifier</secret> ) )',
          '<key>nonce</key>          = <val>cryptographically-random</val>      <comment># OIDC replay protection on id_token</comment>'
        ])
      },
      note: 'The verifier never leaves the client. Only the SHA-256 challenge is sent on the front channel.'
    },
    {
      from: 'client', to: 'browser', label: 'Build /authorize URL & redirect',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'okta.example.com/oauth2/default/v1/authorize',
        body: p([
          '<key>response_type</key>=<val>code</val>',
          '<key>client_id</key>=<val>0oa9abc123XYZdemo</val>',
          '<key>redirect_uri</key>=<val>https://app.example.com/callback</val>',
          '<key>scope</key>=<val>openid profile email orders:read</val>',
          '<key>state</key>=<val>9bA2…</val>',
          '<key>nonce</key>=<val>n-aA38…</val>',
          '<key>code_challenge</key>=<public>K2u-Y… (sha256 of verifier)</public>',
          '<key>code_challenge_method</key>=<val>S256</val>'
        ])
      },
      note: 'Front-channel: travels through the user-agent. Never put a secret here.'
    },
    {
      from: 'browser', to: 'okta', label: 'GET /authorize',
      channel: 'front',
      packet: {
        method: 'GET',
        url: 'https://okta.example.com/oauth2/default/v1/authorize?…',
        body: p([
          '<comment># Okta validates client_id, redirect_uri (must be a registered exact match),</comment>',
          '<comment># scope, response_type, and PKCE parameters.</comment>'
        ])
      },
      note: 'Okta enforces redirect_uri allow-list. Misconfiguration is the #1 cause of "invalid_redirect_uri" errors.'
    },
    {
      from: 'okta', to: 'user', label: 'Login & MFA prompt',
      channel: 'front',
      packet: {
        method: 'PROMPT',
        url: 'okta.example.com (login UI)',
        body: p([
          '<comment># User authenticates directly with Okta.</comment>',
          '<comment># Client app never sees the user password.</comment>'
        ])
      },
      note: 'This isolation is the central security property of OAuth: credentials never touch the relying party.'
    },
    {
      from: 'okta', to: 'browser', label: 'Redirect back with code & state',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'app.example.com/callback?code=…&state=…',
        body: p([
          '<key>code</key>=<public>JxDR-9p_… (single-use, ~10 min)</public>',
          '<key>state</key>=<val>9bA2…</val> <comment># client must compare to value it stored</comment>'
        ])
      },
      note: 'The code is short-lived and one-time. By itself it is not enough to access anything.'
    },
    {
      from: 'browser', to: 'client', label: 'Callback hits client',
      channel: 'front',
      packet: {
        method: 'GET',
        url: 'https://app.example.com/callback?code=…&state=…',
        body: p([
          '<comment># Client checks state matches what it generated in step 2.</comment>'
        ])
      },
      note: 'If state does not match, abort. This is your CSRF defense.'
    },
    {
      from: 'client', to: 'okta', label: 'POST /token (code exchange)',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/token',
        body: p([
          'Content-Type: application/x-www-form-urlencoded',
          '',
          '<key>grant_type</key>=<val>authorization_code</val>',
          '<key>code</key>=<val>JxDR-9p_…</val>',
          '<key>redirect_uri</key>=<val>https://app.example.com/callback</val>',
          '<key>client_id</key>=<val>0oa9abc123XYZdemo</val>',
          '<key>code_verifier</key>=<secret>the original 43-128 char verifier</secret>'
        ])
      },
      note: 'Public clients (SPA / native): no client_secret, just code_verifier. Confidential web apps add Authorization: Basic … or private_key_jwt.'
    },
    {
      from: 'okta', to: 'client', label: '200 OK: tokens',
      channel: 'back',
      packet: {
        method: 'POST',
        url: '↩ Okta token response',
        body: p([
          'HTTP/1.1 200 OK',
          'Content-Type: application/json',
          '',
          '{',
          '  "<key>access_token</key>": "<secret>eyJraWQiOi…</secret>",',
          '  "<key>id_token</key>":     "<secret>eyJraWQiOi…</secret>",',
          '  "<key>refresh_token</key>": "<secret>krI3y…</secret>",',
          '  "<key>token_type</key>":   "Bearer",',
          '  "<key>scope</key>":        "openid profile email orders:read",',
          '  "<key>expires_in</key>":   3600',
          '}'
        ])
      },
      note: 'Tokens travel only on the back channel. They never appear in browser history or referrer headers.'
    },
    {
      from: 'client', to: 'jwks', label: 'GET /jwks (cache the keys)',
      channel: 'back',
      packet: {
        method: 'GET',
        url: 'https://okta.example.com/oauth2/default/v1/keys',
        body: p([
          '<comment># JWKS endpoint exposes Okta\'s public signing keys keyed by `kid`.</comment>',
          '<comment># Cache for hours; rotate on signature failure.</comment>'
        ])
      },
      note: 'Always use kid from the token header to pick the correct public key. Never trust alg=none.'
    },
    {
      from: 'client', to: 'client', label: 'Validate id_token (iss, aud, exp, nonce, sig)',
      channel: 'back',
      packet: {
        method: 'COMPUTE',
        url: 'in-process JWT validation',
        body: p([
          '<key>iss</key>   ✓ matches https://okta.example.com/oauth2/default',
          '<key>aud</key>   ✓ matches client_id 0oa9abc123XYZdemo',
          '<key>exp</key>   ✓ in the future',
          '<key>nonce</key> ✓ matches the value sent in /authorize',
          '<key>sig</key>   ✓ verified via JWKS using kid k_8c3a1f29'
        ])
      },
      note: 'Decoding ≠ validating. Skipping any of these checks is a critical bug.'
    },
    {
      from: 'client', to: 'api', label: 'Call API with Bearer access_token',
      channel: 'back',
      packet: {
        method: 'GET',
        url: 'https://api.example.com/orders',
        body: p([
          'Authorization: Bearer <secret>eyJraWQiOi…</secret>',
          'Accept: application/json'
        ])
      },
      note: 'Send the access_token, not the id_token. Different audiences, different purposes.'
    },
    {
      from: 'api', to: 'jwks', label: 'API also fetches JWKS to verify token',
      channel: 'back',
      packet: {
        method: 'GET',
        url: 'https://okta.example.com/oauth2/default/v1/keys',
        body: p([
          '<comment># Resource server validates the bearer token end-to-end:</comment>',
          '<comment># iss, aud (must include this API), exp, scope, signature.</comment>'
        ])
      },
      note: 'The API does not call back to Okta on every request — it caches the JWKS and validates locally.'
    },
    {
      from: 'api', to: 'client', label: '200 OK with data',
      channel: 'back',
      packet: {
        method: 'GET',
        url: '↩ /orders response',
        body: p([
          'HTTP/1.1 200 OK',
          'Content-Type: application/json',
          '',
          '[ { "id": 1, "total": 42.00 }, … ]'
        ])
      },
      note: 'Authorization succeeded based on a verified token, not on a session cookie.'
    }
  ]
};

/* === Device Authorization Grant === */
PL.flows['device'] = {
  id: 'device',
  title: 'Device Authorization Grant',
  deck: 'For input-constrained devices, CLIs, and TVs. Human-in-the-loop, browser-assisted authentication.',
  lanes: ['user', 'cli', 'browser', 'okta', 'api'],
  steps: [
    {
      from: 'user', to: 'cli', label: 'User runs `mycli login`',
      channel: 'front',
      packet: { method: 'EXEC', url: 'terminal', body: '<comment># CLI has no browser of its own and no client_secret.</comment>' },
      note: 'Native CLIs are public clients. They cannot keep secrets, but they can ask a real browser for help.'
    },
    {
      from: 'cli', to: 'okta', label: 'POST /device/authorize',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/device/authorize',
        body: p([
          'Content-Type: application/x-www-form-urlencoded',
          '',
          '<key>client_id</key>=<val>0oa9_clidemo</val>',
          '<key>scope</key>=<val>openid profile email orders:read offline_access</val>'
        ])
      },
      note: 'No user is involved at this point. The CLI just asks Okta for a device + user code pair.'
    },
    {
      from: 'okta', to: 'cli', label: '200 OK: device_code + user_code',
      channel: 'back',
      packet: {
        method: 'POST',
        url: '↩ device authorization response',
        body: p([
          '{',
          '  "<key>device_code</key>": "<secret>aG9tZS1ydW4tODh6</secret>",',
          '  "<key>user_code</key>":   "<public>WQRZ-FXLV</public>",',
          '  "<key>verification_uri</key>": "https://okta.example.com/activate",',
          '  "<key>verification_uri_complete</key>": "https://okta.example.com/activate?user_code=WQRZ-FXLV",',
          '  "<key>expires_in</key>": 600,',
          '  "<key>interval</key>": 5',
          '}'
        ])
      },
      note: 'user_code is short and human-friendly. device_code is the secret the CLI uses to claim the token.'
    },
    {
      from: 'cli', to: 'user', label: 'Print code & URL: "Visit … and enter WQRZ-FXLV"',
      channel: 'front',
      packet: { method: 'PRINT', url: 'terminal output', body: 'Open https://okta.example.com/activate and enter <public>WQRZ-FXLV</public>' },
      note: 'The CLI now polls. Meanwhile the user does the browser dance on a different device if they want.'
    },
    {
      from: 'user', to: 'browser', label: 'User authenticates & approves',
      channel: 'front',
      packet: { method: 'PROMPT', url: 'okta.example.com/activate', body: '<comment># User logs in, sees CLI consent screen, clicks Allow.</comment>' },
      note: 'Phishing risk: educate users that the user_code shown in the browser must match what the CLI printed.'
    },
    {
      from: 'cli', to: 'okta', label: 'POST /token (poll, every 5s)',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/token',
        body: p([
          '<key>grant_type</key>=<val>urn:ietf:params:oauth:grant-type:device_code</val>',
          '<key>device_code</key>=<secret>aG9tZS1ydW4tODh6</secret>',
          '<key>client_id</key>=<val>0oa9_clidemo</val>'
        ])
      },
      note: 'Until the user approves, Okta returns 400 with error=authorization_pending or slow_down.'
    },
    {
      from: 'okta', to: 'cli', label: '200 OK with tokens',
      channel: 'back',
      packet: {
        method: 'POST',
        url: '↩ token response',
        body: p([
          '{',
          '  "<key>access_token</key>": "<secret>eyJraWQ…</secret>",',
          '  "<key>id_token</key>":     "<secret>eyJraWQ…</secret>",',
          '  "<key>refresh_token</key>": "<secret>krI3y…</secret>",',
          '  "<key>token_type</key>": "Bearer",',
          '  "<key>expires_in</key>": 3600',
          '}'
        ])
      },
      note: 'Store tokens in OS keychain (macOS Keychain, Windows Credential Manager, libsecret) — never plain config files.'
    },
    {
      from: 'cli', to: 'api', label: 'Call API with Bearer token',
      channel: 'back',
      packet: { method: 'GET', url: 'https://api.example.com/orders', body: 'Authorization: Bearer <secret>eyJraWQ…</secret>' },
      note: 'From here the CLI behaves identically to a browser-based client: it presents an access token to the API.'
    }
  ]
};

/* === Client Credentials + Private Key JWT === */
PL.flows['cc-pkjwt'] = {
  id: 'cc-pkjwt',
  title: 'Client Credentials with private_key_jwt',
  deck: 'Browserless, machine-to-machine. The client proves its identity by signing a short-lived JWT assertion.',
  lanes: ['ci', 'okta', 'jwks', 'api'],
  steps: [
    {
      from: 'ci', to: 'ci', label: 'Build & sign client assertion (RS256)',
      channel: 'back',
      packet: {
        method: 'COMPUTE',
        url: 'sign with private key (PEM)',
        body: p([
          '<comment># client_assertion: short-lived JWT proving the client owns the registered key</comment>',
          '<key>{ "alg": "RS256", "kid": "ci-key-1" }</key>',
          '<key>{</key>',
          '  <key>"iss"</key>: "0oa9svc_ci_runner",   <comment># the client_id</comment>',
          '  <key>"sub"</key>: "0oa9svc_ci_runner",   <comment># same as iss</comment>',
          '  <key>"aud"</key>: "https://okta.example.com/oauth2/default/v1/token",',
          '  <key>"jti"</key>: "rnd-9bA2…",           <comment># single-use</comment>',
          '  <key>"iat"</key>: 1715200000,',
          '  <key>"exp"</key>: 1715200060             <comment># max ~5 min</comment>',
          '<key>}</key>',
          '',
          'Signature = RS256( header.payload, <secret>RUNNER_PRIVATE_KEY</secret> )'
        ])
      },
      note: 'The private key never leaves the runner. Okta validates the assertion using the public JWK registered for this client.'
    },
    {
      from: 'ci', to: 'okta', label: 'POST /token with client_assertion',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/token',
        body: p([
          'Content-Type: application/x-www-form-urlencoded',
          '',
          '<key>grant_type</key>=<val>client_credentials</val>',
          '<key>scope</key>=<val>orders:read orders:write</val>',
          '<key>client_assertion_type</key>=<val>urn:ietf:params:oauth:client-assertion-type:jwt-bearer</val>',
          '<key>client_assertion</key>=<public>eyJraWQiOi…</public>'
        ])
      },
      note: 'No user. No browser. No client_secret on the wire — only a signed assertion. This is the MFA of client authentication.'
    },
    {
      from: 'okta', to: 'okta', label: 'Validate assertion (key, iss, aud, jti, exp)',
      channel: 'back',
      packet: {
        method: 'COMPUTE',
        url: 'in Okta',
        body: p([
          '<key>kid</key> matches a registered JWK for this client      ✓',
          '<key>iss</key> = <key>sub</key> = client_id                  ✓',
          '<key>aud</key> = the token endpoint URL                      ✓',
          '<key>jti</key> not seen recently (replay defence)            ✓',
          '<key>exp</key> within configured max lifetime                ✓'
        ])
      },
      note: 'Replay defence requires Okta to remember jti for at least the assertion lifetime.'
    },
    {
      from: 'okta', to: 'ci', label: '200 OK: access_token (no id_token, no refresh)',
      channel: 'back',
      packet: {
        method: 'POST',
        url: '↩ token response',
        body: p([
          '{',
          '  "<key>access_token</key>": "<secret>eyJraWQ…</secret>",',
          '  "<key>token_type</key>": "Bearer",',
          '  "<key>expires_in</key>": 600,',
          '  "<key>scope</key>": "orders:read orders:write"',
          '}'
        ])
      },
      note: 'Client credentials never produces an id_token (there is no user). Refresh tokens also do not apply — just request a new one.'
    },
    {
      from: 'ci', to: 'api', label: 'Call API with Bearer token',
      channel: 'back',
      packet: { method: 'POST', url: 'https://api.example.com/orders', body: 'Authorization: Bearer <secret>eyJraWQ…</secret>' },
      note: 'Token sub == client_id. The API authorizes based on scopes the client was granted, not on a user.'
    },
    {
      from: 'api', to: 'jwks', label: 'API verifies token via JWKS',
      channel: 'back',
      packet: { method: 'GET', url: 'https://okta.example.com/oauth2/default/v1/keys', body: '<comment># Same JWKS validation as the user flow.</comment>' },
      note: 'The API need not know who the human user is — for client credentials there is no user.'
    }
  ]
};

/* === Refresh Token === */
PL.flows['refresh'] = {
  id: 'refresh',
  title: 'Refresh Token Flow',
  deck: 'Trade a long-lived refresh token for a fresh access token without bothering the user.',
  lanes: ['client', 'okta', 'api'],
  steps: [
    {
      from: 'client', to: 'client', label: 'Detect access_token expiring',
      channel: 'back',
      packet: { method: 'COMPUTE', url: 'in client', body: '<comment># access_token has 1 minute left → refresh proactively</comment>' },
      note: 'Refresh on a timer or on first 401, not on every request.'
    },
    {
      from: 'client', to: 'okta', label: 'POST /token grant_type=refresh_token',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/token',
        body: p([
          '<key>grant_type</key>=<val>refresh_token</val>',
          '<key>refresh_token</key>=<secret>krI3y…</secret>',
          '<key>client_id</key>=<val>0oa9abc123XYZdemo</val>',
          '<key>scope</key>=<val>openid profile orders:read</val>  <comment># may down-scope</comment>'
        ])
      },
      note: 'Public clients should rotate refresh tokens (the response replaces the old one and invalidates it).'
    },
    {
      from: 'okta', to: 'client', label: '200 OK: new tokens',
      channel: 'back',
      packet: {
        method: 'POST',
        url: '↩ token response',
        body: p([
          '{',
          '  "<key>access_token</key>": "<secret>eyJ…(new)</secret>",',
          '  "<key>refresh_token</key>": "<secret>krI3y…(rotated)</secret>",',
          '  "<key>id_token</key>": "<secret>eyJ…(optional)</secret>",',
          '  "<key>expires_in</key>": 3600',
          '}'
        ])
      },
      note: 'Refresh token rotation enables theft detection: if the old one is reused, Okta invalidates the chain.'
    },
    {
      from: 'client', to: 'api', label: 'Continue calling API with new access_token',
      channel: 'back',
      packet: { method: 'GET', url: 'https://api.example.com/orders', body: 'Authorization: Bearer <secret>eyJ…(new)</secret>' },
      note: 'User experiences no interruption. Refreshes happen entirely on the back channel.'
    }
  ]
};

/* === Cloudflare Access policy evaluation === */
PL.flows['cf-access'] = {
  id: 'cf-access',
  title: 'Cloudflare Access — login & policy evaluation',
  deck: 'Cloudflare Access sits in front of the app. It is the policy enforcement point. Okta is its identity provider.',
  lanes: ['user', 'browser', 'cf', 'okta', 'app'],
  steps: [
    {
      from: 'user', to: 'browser', label: 'User opens https://app.example.com',
      channel: 'front',
      packet: { method: 'GET', url: 'https://app.example.com/', body: '<comment># DNS for app.example.com points to Cloudflare.</comment>' },
      note: 'Traffic terminates at Cloudflare\'s edge before reaching the origin. This is what makes Access an identity-aware proxy.'
    },
    {
      from: 'browser', to: 'cf', label: 'CF Access intercepts: no CF-Authorization cookie',
      channel: 'front',
      packet: {
        method: 'GET',
        url: 'edge: app.example.com',
        body: p([
          '<comment># Access checks for the CF_Authorization cookie. None present.</comment>',
          '<comment># Redirect to the Access login page.</comment>'
        ])
      },
      note: 'Until login completes, the request never reaches your origin. The origin sees nothing.'
    },
    {
      from: 'cf', to: 'browser', label: '302 → team.cloudflareaccess.com login',
      channel: 'front',
      packet: { method: 'REDIRECT', url: 'https://team.cloudflareaccess.com/login/...', body: '<comment># IdP picker (or auto-redirect if a single IdP is configured).</comment>' },
      note: 'team.cloudflareaccess.com is your unique Zero Trust domain. Treat it like a tenant identifier.'
    },
    {
      from: 'cf', to: 'okta', label: 'CF starts an OIDC Authorization Code flow with Okta',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'https://okta.example.com/oauth2/v1/authorize?…',
        body: p([
          '<key>client_id</key>=<val>0oa9_cf_idp</val>',
          '<key>redirect_uri</key>=<val>https://team.cloudflareaccess.com/cdn-cgi/access/callback</val>',
          '<key>scope</key>=<val>openid profile email groups</val>',
          '<key>response_type</key>=<val>code</val>'
        ])
      },
      note: 'Cloudflare is now the OIDC client. Okta is the IdP. The user is the same human as ever.'
    },
    {
      from: 'okta', to: 'user', label: 'User signs in (and MFA)',
      channel: 'front',
      packet: { method: 'PROMPT', url: 'okta.example.com', body: '<comment># Okta authenticates the user.</comment>' },
      note: 'If you stop in your browser dev tools here, you can watch Okta hand control back to Cloudflare.'
    },
    {
      from: 'okta', to: 'cf', label: 'Code → CF token exchange (back channel)',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/v1/token',
        body: p([
          '<key>grant_type</key>=<val>authorization_code</val>',
          '<key>code</key>=<val>JxDR-…</val>',
          '<key>redirect_uri</key>=<val>https://team.cloudflareaccess.com/cdn-cgi/access/callback</val>',
          '<key>client_id</key>=<val>0oa9_cf_idp</val>',
          'Authorization: Basic <secret>base64(client_id:client_secret)</secret>'
        ])
      },
      note: 'Cloudflare uses the access_token / id_token only to *learn the user identity* — it does not forward Okta\'s tokens to your app.'
    },
    {
      from: 'cf', to: 'cf', label: 'Evaluate Access application policies',
      channel: 'back',
      packet: {
        method: 'COMPUTE',
        url: 'access policy engine',
        body: p([
          'Policy: "Engineers" — Action: ALLOW',
          '  Include: <key>email_domain</key> = example.com',
          '  Include: <key>groups</key>      = "Engineering"',
          '  Require: <key>auth_method</key> = mfa',
          'Decision: <val>ALLOW</val>'
        ])
      },
      note: 'The Access policy is evaluated on Cloudflare\'s edge. The origin app does not see a denied user at all.'
    },
    {
      from: 'cf', to: 'browser', label: 'Set CF_Authorization cookie & redirect to app',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'https://app.example.com/',
        body: p([
          'Set-Cookie: <key>CF_Authorization</key>=<secret>eyJraWQiOi…(CF Access JWT)</secret>; Domain=app.example.com; Secure; HttpOnly',
          '<comment># This is a CF-issued JWT, distinct from any Okta token.</comment>'
        ])
      },
      note: 'The CF-Authorization JWT is what the origin uses to verify the request. Its issuer is your Zero Trust team domain.'
    },
    {
      from: 'browser', to: 'cf', label: 'GET / with CF_Authorization cookie',
      channel: 'front',
      packet: { method: 'GET', url: 'https://app.example.com/', body: 'Cookie: <key>CF_Authorization</key>=<secret>eyJraWQiOi…</secret>' },
      note: 'Cookie is on app.example.com — the cookie travels with every request to that hostname.'
    },
    {
      from: 'cf', to: 'app', label: 'Forward request to origin (with CF JWT header)',
      channel: 'back',
      packet: {
        method: 'GET',
        url: 'https://origin.internal/',
        body: p([
          'Cf-Access-Jwt-Assertion: <secret>eyJraWQiOi…</secret>',
          'Cf-Access-Authenticated-User-Email: <public>ada@example.com</public>',
          '<comment># Origin can validate the JWT against https://team.cloudflareaccess.com/cdn-cgi/access/certs</comment>'
        ])
      },
      note: 'Best practice: validate the Cf-Access-Jwt-Assertion on the origin too. Defence in depth — never rely solely on the gateway.'
    },
    {
      from: 'app', to: 'browser', label: '200 OK: app HTML',
      channel: 'back',
      packet: { method: 'GET', url: '↩ origin response', body: '<comment># Whatever your application normally serves.</comment>' },
      note: 'From here, behaviour is identical to any other web app — just protected by Access at the perimeter.'
    }
  ]
};

/* === Implicit (deprecated) === */
PL.flows['implicit'] = {
  id: 'implicit',
  title: 'Implicit Flow (deprecated)',
  deck: 'Returns tokens directly in the URL fragment. Modern guidance says never use it. Keep this for understanding old systems.',
  lanes: ['user', 'browser', 'client', 'okta'],
  deprecated: true,
  steps: [
    {
      from: 'client', to: 'browser', label: 'Redirect to /authorize?response_type=token id_token',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'https://okta.example.com/oauth2/default/v1/authorize',
        body: p([
          '<key>response_type</key>=<val>token id_token</val>',
          '<key>client_id</key>=<val>0oa9_legacy</val>',
          '<key>redirect_uri</key>=<val>https://app.example.com/callback</val>',
          '<key>scope</key>=<val>openid profile</val>',
          '<key>nonce</key>=<val>n-aA38…</val>'
        ])
      },
      note: 'No PKCE, no back-channel exchange. Tokens come back in the URL fragment.'
    },
    {
      from: 'okta', to: 'browser', label: 'Redirect with #access_token & #id_token',
      channel: 'front',
      packet: {
        method: 'REDIRECT',
        url: 'app.example.com/callback#access_token=…&id_token=…',
        body: p([
          '<key>#access_token</key>=<secret>eyJraWQ…</secret>',
          '<key>#id_token</key>=<secret>eyJraWQ…</secret>',
          '<key>token_type</key>=<val>Bearer</val>',
          '<key>expires_in</key>=<val>3600</val>'
        ])
      },
      note: 'Tokens land in browser history, may leak via referrer, and there is no proof the client app actually requested them.'
    }
  ],
  riskBanner: 'Deprecated by OAuth 2.0 BCP. Use Authorization Code + PKCE for SPAs instead.'
};

/* === ROPC (deprecated) === */
PL.flows['ropc'] = {
  id: 'ropc',
  title: 'Resource Owner Password Credentials (deprecated)',
  deck: 'The client collects the user\'s password directly. This is the anti-pattern OAuth was designed to avoid.',
  lanes: ['user', 'client', 'okta', 'api'],
  deprecated: true,
  steps: [
    {
      from: 'user', to: 'client', label: 'User types username + password into client UI',
      channel: 'front',
      packet: { method: 'PROMPT', url: 'client app form', body: '<comment># The client app sees the password in clear text.</comment>' },
      note: 'This defeats the entire reason OAuth exists. Federated login? Lost. MFA? Awkward at best.'
    },
    {
      from: 'client', to: 'okta', label: 'POST /token grant_type=password',
      channel: 'back',
      packet: {
        method: 'POST',
        url: 'https://okta.example.com/oauth2/default/v1/token',
        body: p([
          '<key>grant_type</key>=<val>password</val>',
          '<key>username</key>=<val>ada@example.com</val>',
          '<key>password</key>=<secret>hunter2</secret>',
          '<key>client_id</key>=<val>0oa9_legacy</val>'
        ])
      },
      note: 'Many IdPs (including Okta) restrict or have removed this grant. Migrate before you have to.'
    }
  ],
  riskBanner: 'Removed from OAuth 2.1. Use Authorization Code + PKCE or Device Authorization Grant instead.'
};

/* ------------------------------------------------------------------
   Glossary
   ------------------------------------------------------------------ */

PL.glossary = [
  { term: 'OAuth 2.0', acronym: '', def: 'Delegated authorization framework. Lets a user authorize an application to access a resource on their behalf, without sharing credentials.' },
  { term: 'OpenID Connect', acronym: 'OIDC', def: 'Identity layer on top of OAuth 2.0. Adds an ID token, standard claims (iss, sub, aud, iat, exp, nonce), and a UserInfo endpoint.' },
  { term: 'Zero Trust Network Access', acronym: 'ZTNA', def: 'Access model where every request is authenticated and authorized regardless of network location. No implicit trust from being "inside the network".' },
  { term: 'Identity Provider', acronym: 'IdP', def: 'Service that authenticates users and issues identity assertions. Okta acts as your IdP in this lab.' },
  { term: 'Authorization Server', acronym: 'AS', def: 'OAuth role that issues tokens. Often the same product as the IdP, but conceptually distinct.' },
  { term: 'Resource Server', acronym: 'RS', def: 'API that holds the user\'s resources and validates incoming access tokens.' },
  { term: 'Client', acronym: '', def: 'The application requesting access on behalf of the user (or itself, for client credentials).' },
  { term: 'Public client', acronym: '', def: 'Cannot keep a secret (SPA, native apps, CLIs). Must use PKCE or device grant instead of client_secret.' },
  { term: 'Confidential client', acronym: '', def: 'Can keep a secret on a server (server-rendered web apps, backend services). Authenticates with secret or private_key_jwt.' },
  { term: 'Scope', acronym: '', def: 'A space-separated list of named permissions a client requests (`openid profile orders:read`). Scopes describe *what* the token can do, not *who* approved it.' },
  { term: 'Audience', acronym: 'aud', def: 'The intended recipient of a token. APIs MUST verify they are the audience before trusting a token.' },
  { term: 'Claim', acronym: '', def: 'A statement about an entity carried in a token (sub, email, groups). Claims describe facts; scopes describe permissions.' },
  { term: 'Access token', acronym: 'AT', def: 'Token presented to APIs to authorize an action. Usually short-lived, may be JWT or opaque.' },
  { term: 'ID token', acronym: 'IDT', def: 'OIDC token *about the user*, intended for the client. Never send it to an API as Authorization.' },
  { term: 'Refresh token', acronym: 'RT', def: 'Long-lived token used to obtain new access tokens without user interaction. Treat as a bearer secret.' },
  { term: 'Authorization code', acronym: '', def: 'Short-lived, single-use code returned to the client redirect URI. Exchanged at the token endpoint for tokens.' },
  { term: 'PKCE', acronym: 'pixie', def: 'Proof Key for Code Exchange. Binds the code request to the client by hashing a verifier. Required for public clients, recommended for all.' },
  { term: 'state', acronym: '', def: 'Opaque value the client sends to /authorize and verifies on callback. Defends against CSRF on the redirect.' },
  { term: 'nonce', acronym: '', def: 'OIDC value sent to /authorize and reflected in the id_token. Prevents id_token replay across sessions.' },
  { term: 'JSON Web Key Set', acronym: 'JWKS', def: 'A document at /jwks (or /keys) listing the IdP\'s public signing keys. Used to verify token signatures.' },
  { term: 'JSON Web Key', acronym: 'JWK', def: 'A single public key entry within a JWKS, identified by its `kid`.' },
  { term: 'JSON Web Token', acronym: 'JWT', def: 'A signed (and optionally encrypted) compact token: header.payload.signature, each base64url.' },
  { term: 'Bearer token', acronym: '', def: 'Whoever holds it can use it. There is no proof of possession beyond knowing the value. Treat like cash.' },
  { term: 'Sender-constrained token', acronym: '', def: 'Token bound to a specific client (e.g. via mTLS or DPoP) so a thief cannot replay it. Stronger than bearer.' },
  { term: 'private_key_jwt', acronym: '', def: 'Client authentication method where the client signs a short-lived JWT assertion with its private key, instead of sending a shared secret.' },
  { term: 'Client Credentials Grant', acronym: 'CC', def: 'OAuth grant for machine-to-machine. No user. Token sub == client_id.' },
  { term: 'Device Authorization Grant', acronym: '', def: 'OAuth grant for input-constrained devices. The CLI gets a user_code; the user types it into a real browser.' },
  { term: 'Cloudflare Access', acronym: '', def: 'Cloudflare\'s ZTNA gateway. Authenticates users via your IdP (Okta) and enforces per-application policies at the edge.' },
  { term: 'Cloudflare Tunnel', acronym: '', def: 'Outbound-only tunnel from your origin to Cloudflare\'s edge. Lets you publish private services with no public inbound ports.' },
  { term: 'Service token', acronym: '', def: 'A Client ID + Client Secret pair issued by Cloudflare Access for non-human callers. Sent as request headers; bypasses the IdP login.' },
  { term: 'Policy enforcement point', acronym: 'PEP', def: 'The component that *applies* an authorization decision (Cloudflare Access at the edge; sometimes the API itself).' },
  { term: 'Policy decision point', acronym: 'PDP', def: 'The component that *makes* an authorization decision (the policy engine inside Access; sometimes a sidecar like OPA).' }
];

/* ------------------------------------------------------------------
   Debug Lab cases
   ------------------------------------------------------------------ */

PL.debugCases = [
  { num: '01', title: 'Wrong redirect_uri', verdict: 'Okta blocks at /authorize',
    desc: 'Client requests redirect_uri=https://app.example.com/cb, but only https://app.example.com/callback is registered.',
    detail: 'Okta returns an error page (not a redirect). Why: redirect URIs are exact-match to prevent token theft. Even a missing trailing slash will fail. Fix: register every URI you legitimately use.' },
  { num: '02', title: 'Missing PKCE', verdict: 'Okta rejects code exchange',
    desc: 'Public client sends /authorize without code_challenge, then /token without code_verifier.',
    detail: 'For public clients (SPA / native), Okta requires PKCE. The token endpoint returns 400 invalid_request. Fix: always send code_challenge + code_challenge_method=S256, and the matching verifier on exchange.' },
  { num: '03', title: 'state mismatch on callback', verdict: 'Client must abort',
    desc: 'The state in the redirect URL does not match what the client stored.',
    detail: 'Either the user was tricked (CSRF), or you are crossing browser sessions / tabs. Never proceed with the code exchange. Display a generic error and start over.' },
  { num: '04', title: 'Wrong issuer (iss)',  verdict: 'API rejects token',
    desc: 'API was configured with iss=https://okta.example.com/oauth2/default but token was issued by /oauth2/v2.',
    detail: 'Custom Authorization Servers are independent issuers. Make sure your API\'s expected iss exactly matches the issuer URL of the AS that minted the token.' },
  { num: '05', title: 'Wrong audience (aud)', verdict: 'API rejects token',
    desc: 'Token has aud=api://other-api, but this is api://demo-api.',
    detail: 'Always validate aud server-side. Tokens for one API must not be accepted by another, even if both trust the same IdP.' },
  { num: '06', title: 'Expired token (exp in past)', verdict: 'API returns 401',
    desc: 'access_token exp is 5 minutes ago.',
    detail: 'Clients should refresh proactively (~1 minute before exp). On 401 with WWW-Authenticate: error="invalid_token", the client may attempt one refresh and retry.' },
  { num: '07', title: 'Missing required scope', verdict: 'API returns 403',
    desc: 'Token has scp=[openid, profile] but endpoint requires orders:write.',
    detail: 'This is an authorization failure, not authentication. Return 403 with WWW-Authenticate: insufficient_scope, scope="orders:write".' },
  { num: '08', title: 'Missing group claim', verdict: 'API returns 403',
    desc: 'API requires groups includes "Engineering". Claim is absent.',
    detail: 'Either the user really is not in that group, or the Okta auth server\'s claim mapping is missing for the requested scope. Check the Authorization Server claims, not just the user\'s group memberships.' },
  { num: '09', title: 'Invalid signature', verdict: 'API rejects token',
    desc: 'Token was signed with a key the API\'s JWKS cache no longer has.',
    detail: 'Either the signing key rotated and the API is caching too long, or the token is forged. On a single failure, re-fetch JWKS and try once more — then refuse.' },
  { num: '10', title: 'Wrong kid', verdict: 'API cannot find key',
    desc: 'Header kid=abc, but JWKS contains only kid=def.',
    detail: 'Often a sign of mixing tokens from different Authorization Servers. The kid is the index into JWKS — it must match exactly.' },
  { num: '11', title: 'Cloudflare policy denies access', verdict: 'CF returns deny page',
    desc: 'User logs into Okta successfully but the Access app policy excludes their group.',
    detail: 'Authentication succeeded; authorization at the gateway failed. Look at the Access logs in the Zero Trust dashboard. Check the policy Include / Require / Exclude order.' },
  { num: '12', title: 'Okta login OK, CF policy blocks', verdict: 'User confused: signed in but cannot reach app',
    desc: 'A common reality: identity is verified, but ZTNA policy says no.',
    detail: 'Treat AuthN and AuthZ as two separate steps. The Access deny page should explain *why*. Custom rule: "block users with no MFA" is a typical example.' },
  { num: '13', title: 'CF allows, API rejects token', verdict: 'App-level 401',
    desc: 'CF Access let the user through, but the request to /api carries the wrong (or no) Okta token.',
    detail: 'Cloudflare Access does not give your API tokens. Your client must hold its own access_token from Okta. The CF JWT is only for the gateway.' },
  { num: '14', title: 'Service token works at CF, fails at app authz', verdict: 'CF: 200 → API: 403',
    desc: 'A scheduled job uses a CF Access service token to traverse the gateway. The API expects an Okta-issued bearer.',
    detail: 'Two layers, two policies. The service token only gets you past the front door. The API must additionally accept whatever it expects (often a private_key_jwt-issued client credentials token).' },
  { num: '15', title: 'Access token sent where ID token expected', verdict: 'Login fails; client gets garbage',
    desc: 'Client tries to render user info from access_token claims (which it cannot, for opaque AS).',
    detail: 'Use the id_token (or UserInfo) for who the user is. Use the access_token only as a credential to call the API.' },
  { num: '16', title: 'ID token used to call an API', verdict: 'API rejects',
    desc: 'aud is the client_id, not the API. iss is correct but aud check fails.',
    detail: 'A symptom of confusing AuthN with AuthZ. ID tokens are for the client; access tokens are for the API.' }
];

/* ------------------------------------------------------------------
   Attack Simulations
   ------------------------------------------------------------------ */

PL.attacks = [
  { num: '01', title: 'Authorization code interception', desc: 'Attacker intercepts the redirect (e.g. malicious app registered for the same custom URL scheme on a phone).',
    fix: 'PKCE: the attacker has the code but not the code_verifier. Token endpoint refuses the exchange.' },
  { num: '02', title: 'CSRF on the OAuth callback', desc: 'Attacker tricks a logged-in victim into completing an OAuth flow that links the attacker\'s account to the victim\'s session.',
    fix: 'Random `state` per request, bound to the user-agent session. Reject any callback whose state does not match.' },
  { num: '03', title: 'Token replay (id_token)', desc: 'Attacker captures an id_token and re-uses it on a different client.',
    fix: '`nonce` claim must match what the client originally sent — and the `aud` must equal the client_id.' },
  { num: '04', title: 'Overly broad scopes', desc: 'A read-only widget requests admin scope; the user clicks Allow.',
    fix: 'Principle of least privilege. Define narrow custom scopes (orders:read vs orders:write) and request only what you need.' },
  { num: '05', title: 'Wrong audience accepted', desc: 'API accepts any token signed by Okta, regardless of which AS or which API it was for.',
    fix: 'Validate `aud` and `iss` exactly. Reject tokens that were issued for other APIs even if the signature is valid.' },
  { num: '06', title: 'Bearer token leakage in logs / referrer', desc: 'Tokens passed via query string end up in proxy logs, browser history, referrer headers.',
    fix: 'Always send tokens in Authorization headers or back-channel POST bodies. Never in URL query parameters.' },
  { num: '07', title: 'Local storage XSS', desc: 'Tokens stored in localStorage are stolen by injected JavaScript.',
    fix: 'Prefer httpOnly cookies (server-side proxy pattern) for SPAs, or short-lived in-memory tokens with refresh on demand. Strict CSP. Treat XSS as the only threat that matters here.' },
  { num: '08', title: 'Refresh token theft', desc: 'Attacker steals a refresh token and silently mints access tokens forever.',
    fix: 'Refresh token rotation + reuse detection. On replay of an old RT, invalidate the entire token family.' },
  { num: '09', title: 'Open redirect via redirect_uri', desc: 'Loose redirect_uri matching ("starts with") lets an attacker append `?next=evil.com`.',
    fix: 'Exact-match registered redirect URIs. No wildcards. No path-prefix matching.' },
  { num: '10', title: 'Trusting a decoded JWT', desc: 'Application reads claims from a JWT without checking signature, issuer, audience, expiry.',
    fix: 'Decode is not validate. Always verify sig + iss + aud + exp + alg expectations before using any claim.' },
  { num: '11', title: 'alg=none acceptance', desc: 'Library accepts a token with algorithm "none" — effectively unsigned.',
    fix: 'Pin the expected alg per audience. Reject anything else, especially `none` and asymmetric/symmetric confusion.' },
  { num: '12', title: 'Confusing AuthN with AuthZ', desc: 'API gates access on "the user is logged in" instead of "the token grants this scope on this resource".',
    fix: 'AuthN proves identity; AuthZ proves permission. Always distinguish — and enforce both, at the right layer.' },
  { num: '13', title: 'Mixed up tokens (id ↔ access)', desc: 'Client sends id_token to the API; API tries to use access_token claims to render a profile.',
    fix: 'ID tokens for clients, access tokens for APIs. UserInfo endpoint when you need authoritative profile data.' }
];

/* ------------------------------------------------------------------
   Decision Guide questions
   ------------------------------------------------------------------ */

PL.decisions = [
  {
    q: 'I am building a single-page app that calls an API.',
    options: ['Authorization Code + PKCE', 'Implicit Flow', 'Client Credentials'],
    correct: 0,
    rec: 'Authorization Code Flow with PKCE — the modern standard for SPAs.',
    why: 'Implicit is deprecated (tokens in URL fragments leak). Client Credentials has no user. PKCE protects the public client without needing a secret.'
  },
  {
    q: 'I am building a server-rendered web app where the backend can keep a secret.',
    options: ['Authorization Code (confidential client)', 'Device Grant', 'ROPC'],
    correct: 0,
    rec: 'Authorization Code Flow with a confidential client (client_secret or private_key_jwt).',
    why: 'A confidential client gets stronger client authentication on the back-channel exchange. PKCE is still recommended.'
  },
  {
    q: 'I am building a CLI tool for engineers to call an internal API.',
    options: ['Device Authorization Grant', 'Client Credentials', 'Stuff a client_secret into the binary'],
    correct: 0,
    rec: 'Device Authorization Grant — the user authenticates in their real browser, the CLI gets the tokens.',
    why: 'Native apps cannot keep secrets. Device grant gets you a per-user identity, MFA, and refreshable tokens, with no shared secret in a binary.'
  },
  {
    q: 'I am writing CI/CD automation that pushes deploys via an API. No human is present.',
    options: ['Client Credentials + private_key_jwt', 'Service account password in env var', 'Service Account OAuth Implicit'],
    correct: 0,
    rec: 'Client Credentials Grant with private_key_jwt for client authentication.',
    why: 'No user, so use a machine grant. Use private_key_jwt instead of a shared secret so the credential never travels — only short-lived signed assertions do.'
  },
  {
    q: 'I just need users to log in to my web app. I do not need to call any external API.',
    options: ['OIDC (id_token only)', 'OAuth without OIDC', 'SAML — wait, why?'],
    correct: 0,
    rec: 'OpenID Connect — request the openid scope and use the id_token to establish the session.',
    why: 'Plain OAuth is for delegated authorization. If you only need authentication, OIDC is the right specification: it standardizes claims, signing, and discovery.'
  },
  {
    q: 'I need an app to call an API on the user\'s behalf. What does it send?',
    options: ['access_token (Authorization: Bearer …)', 'id_token', 'refresh_token'],
    correct: 0,
    rec: 'The access_token, in the Authorization header, with audience matching the API.',
    why: 'ID tokens are for the client to know the user. Refresh tokens are for getting more access tokens. APIs always want access tokens.'
  },
  {
    q: 'I need Cloudflare Access to protect an internal app. What is Access\'s role?',
    options: ['Identity-aware proxy / policy enforcement', 'Authorization Server / IdP', 'A bigger CDN cache'],
    correct: 0,
    rec: 'Cloudflare Access is the identity-aware proxy. Okta is the IdP. Access enforces ZTNA policies, then forwards a CF JWT to the origin.',
    why: 'CF Access does not replace your IdP. It uses the IdP to authenticate the user, then issues its own short-lived JWT for the origin to verify.'
  },
  {
    q: 'My API is behind Cloudflare Access. What should the API validate?',
    options: ['Cf-Access-Jwt-Assertion AND its own bearer token', 'Just trust the Cf-Access-Authenticated-User-Email header', 'Nothing — Cloudflare handled it'],
    correct: 0,
    rec: 'Validate the Cf-Access-Jwt-Assertion (defence in depth) AND your normal Okta bearer token if you have one.',
    why: 'Trust headers like Cf-Access-Authenticated-User-Email only if you also verify the signed JWT. Otherwise an attacker who bypasses the proxy can spoof them.'
  }
];

/* ------------------------------------------------------------------
   Setup Wizard steps
   ------------------------------------------------------------------ */

PL.wizard = [
  { id: 'okta-account', label: 'Okta account', body: 'okta-account' },
  { id: 'okta-app', label: 'OIDC app in Okta', body: 'okta-app' },
  { id: 'okta-users', label: 'Users & groups', body: 'okta-users' },
  { id: 'okta-as', label: 'Auth server, scopes, claims', body: 'okta-as' },
  { id: 'cf-account', label: 'Cloudflare account', body: 'cf-account' },
  { id: 'cf-zt', label: 'Zero Trust setup', body: 'cf-zt' },
  { id: 'cf-idp', label: 'Add Okta as IdP in CF', body: 'cf-idp' },
  { id: 'cf-app', label: 'Create CF Access app', body: 'cf-app' },
  { id: 'cf-policy', label: 'Access policies', body: 'cf-policy' },
  { id: 'cf-tunnel', label: 'Cloudflare Tunnel (optional)', body: 'cf-tunnel' },
  { id: 'demo', label: 'Run the demo app', body: 'demo' },
  { id: 'test', label: 'Test login & deny', body: 'test' },
  { id: 'machine', label: 'Test automation access', body: 'machine' }
];
