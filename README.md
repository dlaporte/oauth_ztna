# Protocol Lab

> An interactive, single-page lab for learning **OAuth 2.0**, **OpenID Connect (OIDC)**, and **Zero Trust Network Access (ZTNA)** — configured with **Okta** as the identity provider and **Cloudflare Access** as the ZTNA gateway.

The practical goal is to help you stand up a working ZTNA setup. The educational goal is to teach the protocol mechanics underneath, so you understand what every redirect, header, and JWT is actually doing.

No build step, no framework, no dependencies. Open `index.html` in a browser.

---

## Quick start

```bash
git clone git@github.com:dlaporte/oauth_ztna.git
cd oauth_ztna
python3 -m http.server 8765
# → open http://127.0.0.1:8765/
```

Any static file server works. The app is vanilla HTML + CSS + JS; nothing to install.

---

## What's inside

Twelve modules across four tracks. The numbered ordering is intentional — see the [design notes](#design-notes) for why Flow Lab comes second instead of last.

### Start here
| # | Module | What it does |
|---|--------|---|
| 00 | **Overview** | Three on-ramps for the three most common audiences (new to OAuth, setting up ZTNA, debugging). |
| 01 | **Flow Lab** | The interactive centerpiece. Side-by-side animated swimlane + protocol inspector for 7 flows: Authorization Code + PKCE, Device Authorization Grant, Client Credentials + `private_key_jwt`, Refresh, Cloudflare Access login, Implicit (deprecated), ROPC (deprecated). Click any step in the swimlane to inspect its raw HTTP. |

### Concepts
| # | Module | What it does |
|---|--------|---|
| 02 | **How OIDC Works** | From-scratch tutorial. The four principals (End-User, OpenID Provider, Relying Party, Resource Server), a conceptual-only swimlane diagram, the id_token claims, the trust model (signature, audience, freshness, channel separation), SSO/federation, and finally how OIDC relates to OAuth. |
| 03 | **Tokens** | The five tokens you'll meet (authorization code, access token, id_token, refresh token, CF JWT). Embedded **Token Inspector** — paste any JWT, see header/payload/signature decoded, walk through an 8-point validation checklist. |
| 04 | **The Three Layers** | How Okta, Cloudflare Access, and your app map onto the OIDC principals. Architecture diagram, request lifecycle, "what each party knows", trust boundaries. |
| 05 | **Scopes · Audiences · Claims** | Three different things that show up next to each other in tokens. What each one is for, how Access policies use them. |
| 06 | **Interactive vs Headless** | Decision matrix: Device Authorization Grant (human-in-the-loop CLIs) vs Client Credentials + `private_key_jwt` (machine-to-machine) vs Cloudflare service tokens (gateway-only). |

### Platforms
| # | Module | What it does |
|---|--------|---|
| 07 | **Cloudflare Access** | What the ZTNA gateway does, how it differs from a VPN, policy evaluation (Include/Require/Exclude), the headers Access sends to your origin, service tokens, Tunnel. |
| 08 | **Okta** | Org vs custom Authorization Server, application types, the configuration surface (redirect URIs, scopes, claims, JWKS, lifetimes, `private_key_jwt`). |
| 09 | **Setup Wizard** | 13-step end-to-end guide: free Okta account → OIDC app → users & groups → auth server scopes/claims → free Cloudflare account → Zero Trust → Okta as IdP → Access application → policies → optional Tunnel → demo app → test login & deny → test automation. |

### Apply
| # | Module | What it does |
|---|--------|---|
| 10 | **Practice** | Three tabs: **Debug Lab** (16 real-world misconfigurations and how they fail), **Attack Drills** (13 attacks and the protocol mechanism that stops each), **Decision Guide** (8 scenarios — pick the right flow). |
| 11 | **Glossary** | 32 terms with live filter. |

---

## Key features

### Three depth levels
A toggle in the sidebar (Beginner / Intermediate / Advanced) **actually changes content** — not just a label.

- **Beginner** — hides all packet captures and validation chips. You see the swimlane labels, lane arrows, and per-step notes only. A fallback dashed-border message explains what's hidden and how to see it.
- **Intermediate** *(default)* — the canonical view.
- **Advanced** — reveals extra deep-dive callouts in select modules: OIDC discovery endpoint, DPoP and mTLS-bound tokens, redirect_uri exact-string matching rules (with truth table), PKCE verifier sizing, `alg=none` and RS↔HS confusion attacks, JWKS rotation behavior.

Selection persists across reloads (localStorage).

### Auto-tooltip acronym dictionary
~50 acronyms and abbreviations get a dotted-underline hover definition on first occurrence per text node: PKCE, JWT, JWKS, IdP, RP, OP, SP, ZTNA, MFA, SSO, CSRF, SPA, mTLS, DPoP, RBAC, ABAC, PEP, PDP, ROPC, CIAM, CSP, DDNS, CDN, CI/CD, XSS, CORS, TLS, B2C, IAM, SAML, RFC, and more. The dictionary lives in `data.js` as `PL.ACRONYMS`.

### Bidirectional cross-linking
- In the Flow Lab, every step's inspector has an **"Open in standalone Protocol Inspector →"** link that deep-links to the same message in the global Protocol Inspector.
- In the Protocol Inspector, every selected message has a **"View in flow context →"** button that jumps to the Flow Lab at that exact step, plus prev/next step buttons.
- Deep links work in either direction: `#/flow-lab?flow=cc-pkjwt&step=2`, `#/protocol-inspector?flow=authcode-pkce&step=7`, `#/tokens?focus=inspector`, `#/practice?tab=attacks`.

### Old route redirects
The structure was refactored from 17 modules to 12. Old hash URLs (`#/token-inspector`, `#/protocol-inspector`, `#/debug-lab`, `#/attacks`, `#/decide`, `#/visualizations`) transparently redirect to their new homes, preserving any query parameters.

### Side-by-side workbench
On screens ≥ 1180px, the Flow Lab is a two-column grid:
- **Left**: the full swimlane SVG, every step row clickable. The active step's row gets an amber band highlight across the whole swimlane.
- **Right**: a sticky protocol inspector pinned to the viewport. As you scroll a tall flow, the inspector stays in view.

On narrower screens it falls back to stacked.

### Smart "follow" behavior
When you advance via the Play / Next / Prev controls or the timeline scrubber, the active step's row scrolls into the viewport center if it's currently off-screen. Direct clicks on the swimlane don't trigger this — you're already looking at the row you tapped.

---

## File layout

```
oauth_ztna/
├── index.html                  Shell: sidebar nav, topbar, view container
├── styles.css                  Design system + module styles (~50KB)
├── data.js                     All content data — flow definitions, JWT samples,
│                               glossary terms, debug cases, attack drills,
│                               decision questions, wizard steps, acronyms
├── app.js                      Core utilities: packet renderer, swimlane
│                               renderer with animation, acronym annotator
├── boot.js                     Hash router, redirects, depth-toggle wiring,
│                               keyboard nav
├── routes-foundations.js       Modules: Overview, How OIDC Works, Tokens,
│                               Three Layers, Scopes-Aud-Claims
├── routes-flows.js             Modules: Flow Lab, Interactive vs Headless,
│                               legacy Protocol Inspector handler (still
│                               accessible via redirect)
├── routes-platforms.js         Modules: Cloudflare Access, Okta, Setup Wizard
└── routes-practice.js          Modules: Practice (tabbed), Glossary
```

### Why so many JS files?
Initial drafts were one big `app.js`. A pre-commit security hook ran on writes and flagged large files setting `innerHTML`. Splitting by module group kept each file small enough to pass the hook check while still making content discoverable. All HTML interpolation is built from constants in `data.js`; the only user input (the JWT textarea and glossary filter) goes through `esc()` or `textContent` before reaching the DOM.

---

## Design system

Aesthetic: **graphite operator console with editorial serif gravitas** — what a network operations console would look like if a magazine art director designed it.

- **Background**: deep graphite (`#0b0c0f`) with subtle dot-grid + film grain overlay
- **Display type**: [Fraunces](https://fonts.google.com/specimen/Fraunces) — variable serif with optical-size and softness axes
- **Body type**: [Geist](https://vercel.com/font) — clean technical sans
- **Mono type**: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — for packet bodies, JWT segments, code
- **Accent palette**:
  - Amber `#f5a623` — primary, "phosphor terminal"
  - Cyan `#22d3ee` — secondary, Cloudflare-adjacent
  - Coral `#f87171` — danger, deprecated, secrets
  - Lime `#a3e635` — success, public, back-channel
  - Violet `#a78bfa` — front-channel, advanced-only content

Memorable details:
- Oversized faint serif numerals behind each module's hero ("**05**")
- Animated amber dots travel along the swimlane wires like packets on the line
- Packet message cards styled like real captures with line numbers and `<secret>` / `<public>` / `<comment>` highlighting

---

## Testing

The project has a JSDOM-based smoke and integration suite. Tests live outside the repo by default (in `/tmp/jsdom-smoke` during development). The suites cover:

| Suite | What it verifies |
|---|---|
| `smoke.js` | All 12 routes render without errors and produce non-empty DOM |
| `cross-link.js` | Flow Lab ↔ Protocol Inspector deep-linking works in both directions, with prev/next, mini step list, etc. |
| `workbench-check.js` | Side-by-side layout, clickable SVG step hit-targets, band highlighting, hint copy |
| `abbr-check.js` | Auto-tooltip dictionary actually wraps acronyms on first occurrence (RP, OP, PKCE, JWT, ZTNA, …) |
| `level-check.js` | Depth toggle gates content correctly: packets hide at beginner, deep-dives appear at advanced, banners show, beginner-fallback messages appear |
| `restructure-check.js` | Sidebar has exactly 12 routes in the right order, embedded inspectors are mounted, Practice tabs render correct counts |
| `oidc-tutorial-check.js` | The OIDC tutorial covers all four principals, the id_token claims, signature-based trust, SSO, OIDC↔OAuth comparison, the conceptual swimlane, and the next-steps links |

A representative run (15 + 10 + 12 + 14 + 19 + 21 + 15 = 106 assertions):

```bash
mkdir -p /tmp/jsdom-smoke && cd /tmp/jsdom-smoke
npm init -y >/dev/null && npm install --silent jsdom
# (copy the test scripts into /tmp/jsdom-smoke/, see notes below)
for t in smoke.js cross-link.js workbench-check.js abbr-check.js \
         level-check.js restructure-check.js oidc-tutorial-check.js; do
  node $t
done
```

The test scripts inject the project's JS files into a JSDOM instance, render each route, and assert on the resulting DOM. They polyfill `requestAnimationFrame`, `performance.now`, and `SVGElement.getBBox` since JSDOM lacks them.

---

## Extending the lab

### Add a new flow
1. Append a flow object to `PL.flows` in `data.js`. Each flow has `id`, `title`, `deck`, `lanes` (array of lane IDs), and `steps` (each with `from`, `to`, `label`, `channel`, `packet`, `note`).
2. If the flow is teaching-only (no real protocol), set `conceptual: true` to hide it from the Flow Lab picker and Protocol Inspector list.
3. Add it to the `FLOWS` array at the top of `routes-flows.js` with a tag class.

### Add a new module
1. Register a route handler: `ROUTES['my-module'] = function (view, params) { ... }` in one of the `routes-*.js` files.
2. Add a sidebar `<a class="nav__item">` in `index.html`.
3. Update `ORDER` and `TITLES` in `boot.js` (and the mirror copies in `routes-foundations.js`).

### Add an acronym
Append to `PL.ACRONYMS` in `data.js`. The annotator picks it up automatically; longer keys are matched first so `ROPC` won't be eaten by `OP`.

### Add an advanced-only section
Wrap content in `<section class="section lvl-adv">…</section>`. It's hidden at Intermediate and Beginner, shown at Advanced.

### Add a beginner-fallback note
Wrap content in `<div class="lvl-beg-only">…</div>`. Hidden everywhere except Beginner mode.

---

## Design notes

A few choices that may not be obvious:

**Live-first ordering.** Most OAuth/OIDC docs start with theory and end with "and here's how the protocol actually moves bytes around". The numbered nav here puts **Flow Lab at #01** right after the Overview — see a flow happen, then unpack what's in it. Theory follows the demo, not the other way around.

**Three depth levels, not three sites.** Rather than maintain separate "intro" and "advanced" docs, content is layered: Beginner hides protocol noise, Advanced reveals deep dives. The default Intermediate view is the canonical lab.

**No reliance on a frontend framework.** OAuth/OIDC fundamentals will outlast React. A vanilla HTML/CSS/JS app that anyone can `python3 -m http.server` is easier to fork, fewer things break.

**Placeholder identifiers throughout.** The lab uses fictional tenants — `okta.example.com`, `team.cloudflareaccess.com`, `app.example.com`, `api.example.com`, `0oa9abc123XYZdemo`. Substitute your real values. The lab **never** asks you to paste credentials.

**JWTs in the inspector are crafted demo payloads.** Their signatures are illustrative — the validation checklist intentionally cannot return "✓ valid" because no real JWKS is fetched. The point is to teach that **decoding is not validating**.

---

## License

This is an educational/teaching project. The text content is offered for non-commercial educational use. The code is MIT-licensed unless your fork's repository says otherwise — feel free to adapt the structure and patterns for your own learning material.

---

## Acknowledgments

Sample identifiers and behaviour are modeled after **Okta** and **Cloudflare Access** documentation, but the lab is not affiliated with either company. All trademarks belong to their respective owners.

Built with [Claude Code](https://www.anthropic.com/claude-code).
