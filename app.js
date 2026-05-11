/* =========================================================================
   Protocol Lab — application
   All HTML strings below are built from constants in data.js.
   Any user input (JWT textarea, glossary filter) is escaped via esc()
   before being inserted, or set via textContent rather than innerHTML.
   ========================================================================= */
(function () {
'use strict';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function setHTML(node, html) { node.innerHTML = html; }

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

function packetCardSafe(p, opts) {
  opts = opts || {};
  const lines = (p.body || '').split('\n');
  const rows = lines.map((line, i) => {
    const escLine = esc(line) || '&nbsp;';
    const html = escLine.replace(/&lt;([\/]?(?:secret|public|comment|key|val))&gt;/g, '<$1>');
    return `<span class="packet__lineno">${i + 1}</span><span class="packet__content">${PL.highlight(html)}</span>`;
  }).join('');
  const channelLabel = (p.channel === 'front') ? 'front-channel' : (p.channel === 'back' ? 'back-channel' : 'in-process');
  const channelClass = (p.channel === 'front') ? 'packet__channel--front' : (p.channel === 'back' ? 'packet__channel--back' : '');
  return `
    <div class="packet">
      <div class="packet__head">
        <span class="packet__method packet__method--${esc(p.method)}">${esc(p.method)}</span>
        <span class="packet__url">${esc(p.url)}</span>
        <span class="packet__channel ${channelClass}">${channelLabel}</span>
      </div>
      <div class="packet__body">${rows}</div>
      ${opts.note ? `<div class="packet__footer"><strong>note ›</strong> ${opts.note}</div>` : ''}
    </div>
  `;
}

/* ---------- swimlane flow renderer ---------- */
function buildFlowSVG(flow) {
  const lanes = flow.lanes;
  const laneIndex = Object.fromEntries(lanes.map((id, i) => [id, i]));
  const labelW = 64;
  const colW = 134;
  const w = labelW + colW * lanes.length + 24;
  const top = 52;
  const stepH = 60;
  const h = top + flow.steps.length * stepH + 24;

  let lanesSVG = '';
  lanes.forEach((id, i) => {
    const x = labelW + colW * i + colW / 2;
    const lab = (PL.LANES[id] && PL.LANES[id].label) || id;
    lanesSVG += `
      <g>
        <text class="flow__lane-label" x="${x}" y="22" text-anchor="middle">${esc(lab)}</text>
        <rect x="${x - 16}" y="30" width="32" height="14" rx="3" fill="var(--lane-${id})" opacity="0.18"/>
        <line class="flow__lane-line" x1="${x}" y1="48" x2="${x}" y2="${h - 12}"/>
      </g>
    `;
  });

  // Step row bands: drawn first so they sit behind the wires/labels
  let bandsSVG = '';
  flow.steps.forEach((s, i) => {
    const rowY = top + i * stepH;
    bandsSVG += `<rect class="flow__step-band" id="step-band-${i}" x="0" y="${rowY}" width="${w}" height="${stepH}" rx="6" />`;
  });

  let stepsSVG = '';
  flow.steps.forEach((s, i) => {
    const y = top + i * stepH + 24;
    const fromX = labelW + colW * laneIndex[s.from] + colW / 2;
    const toX = labelW + colW * laneIndex[s.to] + colW / 2;
    const dir = (toX === fromX) ? 0 : (toX > fromX ? 1 : -1);
    const arrowY = y + 18;

    stepsSVG += `<text class="flow__step-num" x="14" y="${arrowY + 4}">${String(i + 1).padStart(2, '0')}</text>`;

    if (dir === 0) {
      const cx = fromX;
      stepsSVG += `
        <path class="flow__arrow" id="step-arrow-${i}" d="M ${cx + 8} ${arrowY - 6} q 28 0 28 24 q 0 18 -28 18" />
        <text class="flow__step-label" x="${cx + 46}" y="${arrowY - 2}">${esc(s.label)}</text>
      `;
    } else {
      const startX = fromX + (dir > 0 ? 12 : -12);
      const endX   = toX   - (dir > 0 ? 14 : -14);
      stepsSVG += `
        <line class="flow__arrow" id="step-arrow-${i}" x1="${startX}" y1="${arrowY}" x2="${endX}" y2="${arrowY}" />
        <polygon class="flow__arrow" id="step-head-${i}" points="${endX},${arrowY - 4} ${endX},${arrowY + 4} ${endX + (dir > 0 ? 6 : -6)},${arrowY}"/>
        <text class="flow__step-label" x="${(startX + endX) / 2}" y="${arrowY - 6}" text-anchor="middle">${esc(s.label)}</text>
        <circle id="step-dot-${i}" class="flow__token" cx="${startX}" cy="${arrowY}" r="0"/>
      `;
    }
  });

  // Click targets: drawn last so they sit ON TOP of bands and arrows; each
  // covers the entire row width so any click on that row activates the step.
  let hitsSVG = '';
  flow.steps.forEach((s, i) => {
    const rowY = top + i * stepH;
    hitsSVG += `<rect class="flow__step-hit" data-step-i="${i}" x="0" y="${rowY}" width="${w}" height="${stepH}" />`;
  });

  // No explicit width/height — let CSS stretch the SVG to fill its column,
  // preserving aspect ratio via the viewBox. This avoids dead space to the
  // right of the lanes when the swimlane column is wider than the natural SVG.
  return `
    <svg class="flow__svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
      ${bandsSVG}
      ${lanesSVG}
      ${stepsSVG}
      ${hitsSVG}
    </svg>
  `;
}

function renderFlow(container, flowId, opts) {
  const flow = PL.flows[flowId];
  if (!flow) { setHTML(container, '<p class="muted">Flow not found.</p>'); return; }
  opts = opts || {};
  let activeStep = Math.max(0, Math.min(flow.steps.length - 1, opts.initialStep | 0));
  let playing = false;
  let timer = null;

  const html = `
    <article class="flow flow--workbench" data-flow="${esc(flowId)}">
      <header class="flow__head">
        <div>
          <div class="flow__title">${esc(flow.title)}</div>
          <div class="muted" style="font-size:13px;margin-top:2px">${esc(flow.deck)}</div>
        </div>
        <div class="flow__controls">
          <button class="btn btn--small" data-act="prev" title="Previous step (←)">‹</button>
          <button class="btn btn--small btn--primary" data-act="play">Play</button>
          <button class="btn btn--small" data-act="next" title="Next step (→)">›</button>
          <button class="btn btn--small btn--ghost" data-act="reset" title="Reset to first step">⟲</button>
        </div>
      </header>
      ${flow.deprecated ? `<div class="risk" style="margin:14px 18px 0"><div class="risk__head">${esc(flow.riskBanner || 'Deprecated')}</div></div>` : ''}
      <div class="flow__hint muted fineprint">click any step in the swimlane to inspect it · drag the timeline to scrub</div>
      <div class="flow__body">
        <div class="flow__lanes-scroll" id="flow-lanes-scroll">${buildFlowSVG(flow)}</div>
        <section class="flow__inspect" id="flow-inspect"></section>
      </div>
      <div class="timeline" id="flow-timeline">
        ${flow.steps.map((s, i) => `<button class="timeline__step" data-i="${i}">${String(i+1).padStart(2,'0')} · ${esc(s.label.slice(0, 36))}${s.label.length > 36 ? '…' : ''}</button>`).join('')}
      </div>
    </article>
  `;
  container.insertAdjacentHTML('beforeend', html);

  const root = container.querySelector(`.flow[data-flow="${flowId}"]`);
  const inspect = $('#flow-inspect', root);
  const timeline = $('#flow-timeline', root);
  const lanesScroll = $('#flow-lanes-scroll', root);

  function paint(opts) {
    opts = opts || {};
    flow.steps.forEach((s, i) => {
      const arrow = $('#step-arrow-' + i, root);
      const head = $('#step-head-' + i, root);
      const dot = $('#step-dot-' + i, root);
      const band = $('#step-band-' + i, root);
      [arrow, head, band].forEach(node => {
        if (!node) return;
        node.classList.remove('is-active', 'is-done');
        if (i < activeStep) node.classList.add('is-done');
        if (i === activeStep) node.classList.add('is-active');
      });
      if (dot && arrow && arrow.tagName === 'line') {
        if (i === activeStep) {
          dot.setAttribute('r', '6');
          const startX = parseFloat(arrow.getAttribute('x1'));
          const endX = parseFloat(arrow.getAttribute('x2'));
          dot.setAttribute('cx', startX);
          const dur = 700;
          const t0 = performance.now();
          (function move() {
            const t = (performance.now() - t0) / dur;
            if (t >= 1) { dot.setAttribute('cx', endX); return; }
            dot.setAttribute('cx', startX + (endX - startX) * t);
            requestAnimationFrame(move);
          })();
        } else {
          dot.setAttribute('r', '0');
        }
      }
    });
    $$('.timeline__step', timeline).forEach((b, i) => {
      b.classList.toggle('is-active', i === activeStep);
      b.classList.toggle('is-done', i < activeStep);
    });
    const s = flow.steps[activeStep];
    const channelTag = s.packet.channel === 'front'
      ? '<span class="tag" style="border-color:rgba(167,139,250,.3);color:var(--violet);background:var(--violet-soft)">front-channel</span>'
      : (s.packet.channel === 'back'
          ? '<span class="tag tag--lime">back-channel</span>'
          : '<span class="tag">in-process</span>');
    setHTML(inspect, `
      <div class="flow__inspect-head">
        <span class="tag tag--amber">step ${String(activeStep + 1).padStart(2, '0')} / ${String(flow.steps.length).padStart(2, '0')}</span>
        ${channelTag}
        <span class="flow__inspect-arrow">${esc(PL.LANES[s.from] ? PL.LANES[s.from].label : s.from)} → ${esc(PL.LANES[s.to] ? PL.LANES[s.to].label : s.to)}</span>
        <div class="flow__inspect-title">${esc(s.label)}</div>
      </div>
      ${packetCardSafe(s.packet, { note: s.note })}
      <div class="lvl-beg-only" style="padding:14px 16px;border:1px dashed var(--hairline-2);border-radius:var(--r-md);background:var(--surface);font-size:13.5px;color:var(--ink-2);margin-top:12px">
        <strong style="color:var(--cyan)">Beginner view.</strong> The raw HTTP request for this step is hidden in beginner mode. Switch the depth to <em>Intermediate</em> in the sidebar to see method, URL, headers, and body.
      </div>
      <div class="flow__inspect-foot">
        <a class="linklike" href="#/protocol-inspector?flow=${esc(flowId)}&step=${activeStep}">
          Open in standalone Protocol Inspector →
        </a>
        <span class="legend-row" style="margin:0">
          <span class="legend-pill"><span class="swatch swatch--secret"></span> secret</span>
          <span class="legend-pill"><span class="swatch swatch--public"></span> public-but-sensitive</span>
          <span class="legend-pill"><span class="swatch swatch--token"></span> bearer token</span>
        </span>
      </div>
    `);
    // "Follow" behaviour: when the user used a control (play/next/prev/timeline),
    // bring the active row into view. We don't do this when the user clicked a
    // step directly — they're already looking at it, scrolling would feel jumpy.
    if (opts.follow) {
      try {
        const band = $('#step-band-' + activeStep, root);
        if (band) {
          // 1) If the swimlane container itself scrolls (narrow / non-workbench), scroll it.
          if (lanesScroll && lanesScroll.scrollHeight > lanesScroll.clientHeight && band.getBBox) {
            const bb = band.getBBox();
            const target = Math.max(0, bb.y - (lanesScroll.clientHeight / 2) + (bb.height / 2));
            if (typeof lanesScroll.scrollTo === 'function') {
              lanesScroll.scrollTo({ top: target, behavior: 'smooth' });
            } else {
              lanesScroll.scrollTop = target;
            }
          }
          // 2) If the band is outside the viewport (workbench mode w/ tall flow), scroll the page.
          if (band.getBoundingClientRect) {
            const r = band.getBoundingClientRect();
            const vh = window.innerHeight || 800;
            if (r.top < 80 || r.bottom > vh - 40) {
              if (typeof band.scrollIntoView === 'function') {
                band.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }
          }
        }
      } catch (e) { /* non-fatal */ }
    }
  }

  function play() {
    playing = true;
    $('button[data-act="play"]', root).textContent = 'Pause';
    function step() {
      if (!playing) return;
      if (activeStep < flow.steps.length - 1) {
        activeStep++;
        paint({ follow: true });
        timer = setTimeout(step, 1500);
      } else {
        pause();
      }
    }
    timer = setTimeout(step, 800);
  }
  function pause() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
    const b = $('button[data-act="play"]', root);
    if (b) b.textContent = 'Play';
  }

  root.addEventListener('click', e => {
    const ctrl = e.target.closest('[data-act]');
    if (ctrl) {
      const act = ctrl.dataset.act;
      if (act === 'play') { playing ? pause() : play(); }
      if (act === 'next') { pause(); activeStep = Math.min(flow.steps.length - 1, activeStep + 1); paint({ follow: true }); }
      if (act === 'prev') { pause(); activeStep = Math.max(0, activeStep - 1); paint({ follow: true }); }
      if (act === 'reset') { pause(); activeStep = 0; paint({ follow: true }); }
      return;
    }
    // Click anywhere on a step row in the SVG → activate that step.
    // No follow — the user is looking at the row they clicked.
    const hit = e.target.closest('.flow__step-hit');
    if (hit) {
      pause();
      activeStep = parseInt(hit.getAttribute('data-step-i'), 10) || 0;
      paint();
      return;
    }
  });
  timeline.addEventListener('click', e => {
    const b = e.target.closest('.timeline__step');
    if (!b) return;
    pause();
    activeStep = parseInt(b.dataset.i, 10);
    paint({ follow: true });
  });

  paint();
}

/* Auto-annotate acronyms with <abbr title="full form"> on first occurrence per
   text node. Skips code/pre/packet bodies and existing abbr elements. */
function annotateAcronyms(root) {
  if (!root || !window.PL || !window.PL.ACRONYMS) return;
  const dict = window.PL.ACRONYMS;
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  // Escape regex meta-characters; treat / and . as literal
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
  const re = new RegExp('\\b(' + keys.map(escRe).join('|') + ')\\b', 'g');

  const skipTags = new Set(['CODE','PRE','ABBR','SCRIPT','STYLE','TEXTAREA','INPUT','BUTTON','SVG','TEXT','TITLE','OPTION']);
  const skipClassRegex = /\b(packet__content|jwt-display|jwt-col__body|tag|tag--\w+|kbd|fineprint|brand)\b/;

  function shouldSkip(node) {
    let n = node.parentElement;
    while (n) {
      if (skipTags.has(n.tagName)) return true;
      const cls = n.getAttribute && n.getAttribute('class');
      if (cls && skipClassRegex.test(cls)) return true;
      n = n.parentElement;
    }
    return false;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const targets = [];
  let cur;
  while ((cur = walker.nextNode())) {
    if (cur.nodeValue && re.test(cur.nodeValue) && !shouldSkip(cur)) {
      targets.push(cur);
    }
    re.lastIndex = 0;
  }

  targets.forEach(textNode => {
    const seen = new Set();
    const escapedHTML = textNode.nodeValue
      .replace(/[&<>]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c]))
      .replace(re, (match) => {
        if (seen.has(match)) return match;
        seen.add(match);
        const def = dict[match].replace(/"/g, '&quot;');
        return '<abbr title="' + def + '">' + match + '</abbr>';
      });
    if (escapedHTML !== textNode.nodeValue) {
      const span = document.createElement('span');
      span.innerHTML = escapedHTML;
      // Replace original text node with the new fragment
      const frag = document.createDocumentFragment();
      while (span.firstChild) frag.appendChild(span.firstChild);
      textNode.parentNode.replaceChild(frag, textNode);
    }
  });
}

window.PL_app = { renderFlow, packetCardSafe, esc, setHTML, $, $$, annotateAcronyms };
})();
