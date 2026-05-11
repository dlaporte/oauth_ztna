# Protocol Lab

> An interactive, single-page lab for learning **OAuth 2.0**, **OpenID Connect (OIDC)**, and **Zero Trust Network Access (ZTNA)**. Compare three production ZTNA gateways — **Cloudflare Access**, **AWS ALB + Cognito**, and **FortiGate ZTNA** — paired with an OIDC identity provider such as **Okta**.

The practical goal is to help you stand up a working ZTNA setup with whichever gateway fits your environment. The educational goal is to teach the protocol mechanics underneath, so you understand what every redirect, header, and JWT is actually doing — and why all three gateways share the same OIDC core.

---

## Quick start

```bash
git clone https://github.com/dlaporte/oauth_ztna.git
cd oauth_ztna
python3 -m http.server 8765
# → open http://127.0.0.1:8765/
```

Any static file server works. The app is a single page; nothing to install.

---

## How to use the lab

The sidebar groups twelve modules into four tracks. You can read them in order, or jump around — pick whichever entry point fits how you learn.

| Track | When to start here |
|---|---|
| **Start here** | First time? Open the **Overview** and click "See a flow happen". |
| **Concepts** | Want to understand OIDC, tokens, scopes, and how the three system layers fit together. |
| **Platforms** | The three gateway modules (Cloudflare Access, AWS ALB + Cognito, FortiGate ZTNA), plus **Okta** for the IdP side and the **Setup Wizard** for an end-to-end build. |
| **Apply** | Debugging an issue, drilling on attacks, or trying to pick the right OAuth flow. |

### Module list

| # | Module | What it covers |
|---|--------|----------------|
| 00 | **Overview** | On-ramps for the most common audiences. |
| 01 | **Flow Lab** | Animated swimlane + protocol inspector for 7 flows: Authorization Code + PKCE, Device Authorization Grant, Client Credentials + `private_key_jwt`, Refresh, Cloudflare Access login, Implicit (deprecated), ROPC (deprecated). Click any step in the swimlane to inspect the raw HTTP. |
| 02 | **How OAuth Works** | From-scratch tutorial. The password-sharing problem OAuth solved, the four roles (Resource Owner, Client, Authorization Server, Resource Server), a conceptual swimlane showing pure delegated access, scopes as the permission language, the grant types overview, and when OAuth isn't enough (→ OIDC). |
| 03 | **How OIDC Works** | OIDC layered on top of OAuth. The four principals (End-User, OpenID Provider, Relying Party, Resource Server), a conceptual swimlane, what's in an id_token, the trust model, SSO/federation. |
| 04 | **Tokens** | The five tokens you'll meet (authorization code, access_token, id_token, refresh_token, Cloudflare JWT). Embedded **Token Inspector** — paste any JWT, see header/payload/signature decoded, run the 8-point validation checklist. |
| 05 | **The Three Layers** | How the IdP, the ZTNA gateway, and your app map onto the OIDC principals. Architecture diagram, what each party knows, trust boundaries. |
| 06 | **Scopes · Audiences · Claims** | Three different things that look alike in token payloads. What each one is for, how policies use them. |
| 07 | **Interactive vs Headless** | Decision matrix: Device Authorization Grant (CLIs) vs Client Credentials + `private_key_jwt` (machine-to-machine) vs gateway service tokens (gateway-only). |
| 08 | **Cloudflare Access** | What the ZTNA gateway does, how it differs from a VPN, policy evaluation, the headers Access sends to your origin, service tokens, Tunnel. Includes the umbrella **Identity-Aware Proxy** comparison table. |
| 09 | **AWS ALB + Cognito** | AWS's identity-aware proxy via ALB listener `authenticate-cognito` and `authenticate-oidc` actions. Listener rules, the `x-amzn-oidc-data` / `x-amzn-oidc-accesstoken` / `x-amzn-oidc-identity` headers, JWT verification using the regional public-keys endpoint, comparison to Cloudflare Access. |
| 10 | **FortiGate ZTNA** | Fortinet's ZTNA Application Gateway pattern. The four components (FortiClient, EMS, FortiGate, external IdP), ZTNA tags and device posture, `proxy-policy` rule shape, request flow with mTLS device certificates, comparison vs SSL VPN, and the three-way IAP comparison table. |
| 11 | **Okta** | Org vs custom Authorization Server, application types, redirect URIs, scopes, claims, JWKS, lifetimes, `private_key_jwt`. |
| 12 | **Setup Wizard** | 13-step guide to a working ZTNA: free Okta account → OIDC app → users & groups → auth server scopes/claims → free Cloudflare account → Zero Trust → Okta as IdP → Access application → policies → Tunnel → demo app → test login & deny → test automation. |
| 13 | **Practice** | Three tabs: **Debug Lab** (16 misconfigurations and how they fail), **Attack Drills** (13 attacks and the protocol mechanism that stops each), **Decision Guide** (8 scenarios — pick the right flow). |
| 14 | **Glossary** | 32 terms with live filter. |

---

## Features worth knowing about

### Depth toggle
At the bottom of the sidebar: **Beginner / Intermediate / Advanced**. The choice actually changes what's on the page (not just a label), and it persists across reloads.

- **Beginner** — hides every packet capture and protocol detail. You see the swimlane labels, lane arrows, and per-step notes. A note in the inspector explains what's hidden.
- **Intermediate** *(default)* — the standard view.
- **Advanced** — reveals deep-dive sections in select modules: OIDC discovery, DPoP and mTLS-bound tokens, `redirect_uri` exact-string matching rules, PKCE verifier sizing, `alg=none` attacks, JWKS rotation behaviour.

### Acronym tooltips
Hover any underlined acronym (PKCE, JWT, RP, OP, IdP, ZTNA, MFA, CSRF, mTLS, DPoP, …) for an inline definition. Around 50 terms are covered.

### Click anywhere on the swimlane
On wide screens, the Flow Lab is a two-column workbench — the full swimlane on the left, the protocol inspector pinned to the right. **Click any step in the diagram** (the row, the arrow, the label) to inspect its raw HTTP. Or use the **Play / Next / Prev** controls. The active step gets an amber band highlighting its row across the whole swimlane.

### Deep links
Most useful pages are shareable. A few examples:

- `#/flow-lab?flow=cc-pkjwt&step=2` — opens the Flow Lab on Client Credentials at step 3
- `#/tokens?focus=inspector` — jumps to the Token Inspector inside the Tokens module
- `#/practice?tab=attacks` — opens Practice on the Attack Drills tab

### Keyboard
- `←` / `→` — previous / next module
- Click any acronym for a hover definition

---

## A few important notes

**This is a teaching tool, not a verifier.** The Token Inspector decodes JWTs in the browser; it does not fetch your IdP's JWKS or cryptographically verify signatures. Every "validation checklist" item is teaching that *decoding is not validating* — in production, always perform the real signature verification.

**Placeholder identifiers throughout.** The lab uses fictional tenants — `okta.example.com`, `team.cloudflareaccess.com`, `app.example.com`, `api.example.com`. Substitute your real values when you do the setup wizard. The lab **never** asks you to paste credentials.

**Sample JWTs are crafted demo payloads.** Their signatures are illustrative. Don't try to use them as real tokens.

---

## License & acknowledgments

Sample identifiers and behaviour are modeled after **Okta** and **Cloudflare Access** documentation, but the lab is not affiliated with either company. All trademarks belong to their respective owners.

Educational/teaching project. Text content is offered for non-commercial educational use. The code is MIT-licensed.

Built with [Claude Code](https://www.anthropic.com/claude-code).
