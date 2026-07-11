/* ===================================================
   Enchanted Architect — Application Logic
   Groq API + 3D Tilt + Magic Cursor + Sparkles
   =================================================== */

// ===================================================
// MAGIC CURSOR TRAIL
// ===================================================
(function initMagicCursor() {
  const canvas = document.getElementById('magicCanvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const particles = [];
  const COLORS = [
    'hsla(43,95%,68%,',   // gold
    'hsla(270,80%,72%,',  // purple
    'hsla(330,85%,68%,',  // rose
    'hsla(185,90%,65%,',  // cyan
    'hsla(60,100%,90%,',  // star white
  ];

  let mouse = { x: -999, y: -999 };
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    for (let i = 0; i < 3; i++) spawnParticle(mouse.x, mouse.y);
  });

  function spawnParticle(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1.5 + 0.5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: Math.random() * 5 + 2,
      life: 1,
      decay: Math.random() * 0.025 + 0.015,
      color,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
    });
  }

  function drawStar(x, y, r, ctx) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outer = { x: x + r * Math.cos((i * 4 * Math.PI) / 5 - Math.PI / 2), y: y + r * Math.sin((i * 4 * Math.PI) / 5 - Math.PI / 2) };
      const inner = { x: x + (r * 0.4) * Math.cos(((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2), y: y + (r * 0.4) * Math.sin(((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2) };
      if (i === 0) ctx.moveTo(outer.x, outer.y);
      else ctx.lineTo(outer.x, outer.y);
      ctx.lineTo(inner.x, inner.y);
    }
    ctx.closePath();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.05; // gravity
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = p.life;
      const c = p.color + p.life + ')';
      ctx.fillStyle = c;
      ctx.shadowBlur = 12;
      ctx.shadowColor = c.replace('hsla', 'hsl').split(',').slice(0,3).join(',') + ')';
      if (p.shape === 'star') {
        drawStar(p.x, p.y, p.size * p.life, ctx);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===================================================
// SPARKLE LAYER (ambient floating stars)
// ===================================================
(function initSparkles() {
  const layer = document.getElementById('sparkleLayer');
  const STAR_COUNT = 60;
  const ORB_COUNT = 8;

  for (let i = 0; i < STAR_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'sparkle-star';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${2 + Math.random() * 4}s;
      --delay: ${-Math.random() * 5}s;
      width: ${2 + Math.random() * 3}px;
      height: ${2 + Math.random() * 3}px;
    `;
    layer.appendChild(el);
  }

  const ORB_COLORS = [
    'hsla(43,95%,58%,0.15)', 'hsla(270,80%,65%,0.12)',
    'hsla(330,85%,65%,0.12)', 'hsla(185,90%,60%,0.10)',
  ];

  for (let i = 0; i < ORB_COUNT; i++) {
    const el = document.createElement('div');
    el.className = 'floating-orb';
    const size = 60 + Math.random() * 160;
    el.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      background: radial-gradient(circle, ${ORB_COLORS[i % ORB_COLORS.length]}, transparent 70%);
      filter: blur(${20 + Math.random() * 30}px);
      --dur: ${6 + Math.random() * 8}s;
      --delay: ${-Math.random() * 8}s;
    `;
    layer.appendChild(el);
  }
})();

// ===================================================
// 3D TILT EFFECT
// ===================================================
function initTiltCard(el) {
  if (!el) return;
  const MAX_TILT = 12;

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY = ((x - cx) / cx) * MAX_TILT;
    const rotateX = -((y - cy) / cy) * MAX_TILT;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    const glow = el.querySelector('.card-glow');
    if (glow) {
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      glow.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, hsla(43,95%,58%,0.35), hsla(270,80%,65%,0.2), transparent 70%)`;
      glow.style.opacity = '1';
    }
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    const glow = el.querySelector('.card-glow');
    if (glow) glow.style.opacity = '0';
    setTimeout(() => { el.style.transition = ''; }, 500);
  });
}

// Init all tilt cards
function initAllTiltCards() {
  document.querySelectorAll('.tilt-card').forEach(initTiltCard);
}
initAllTiltCards();

// Hero parallax on mouse
const heroContent = document.getElementById('heroContent');
const heroSection = document.getElementById('heroSection');
if (heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    if (heroContent) {
      heroContent.style.transform = `translate(${x * 18}px, ${y * 12}px)`;
    }
    // Move orbs
    document.querySelectorAll('.orb').forEach((orb, i) => {
      const factor = (i + 1) * 0.4;
      orb.style.transform = `translate(${x * 30 * factor}px, ${y * 20 * factor}px)`;
    });
  });
  heroSection.addEventListener('mouseleave', () => {
    if (heroContent) heroContent.style.transform = '';
    document.querySelectorAll('.orb').forEach(orb => orb.style.transform = '');
  });
}

// ===================================================
// STATE
// ===================================================
const state = {
  apiKey: '', model: 'llama-3.3-70b-versatile',
  scale: 'growth', detail: 'detailed',
  concerns: { scalability: true, security: true, faultTolerance: true, caching: false, monitoring: false, cicd: false },
  history: [], currentDesign: null, currentDescription: '',
  mermaidSource: '',
};

function saveState() {
  try {
    localStorage.setItem('enchanted_key', state.apiKey);
    localStorage.setItem('enchanted_model', state.model);
    localStorage.setItem('enchanted_scale', state.scale);
    localStorage.setItem('enchanted_detail', state.detail);
    localStorage.setItem('enchanted_concerns', JSON.stringify(state.concerns));
    localStorage.setItem('enchanted_history', JSON.stringify(state.history.slice(0, 20)));
  } catch {}
}

function loadState() {
  state.apiKey = localStorage.getItem('enchanted_key') || '';
  state.model = localStorage.getItem('enchanted_model') || 'llama-3.3-70b-versatile';
  state.scale = localStorage.getItem('enchanted_scale') || 'growth';
  state.detail = localStorage.getItem('enchanted_detail') || 'detailed';
  try { const c = localStorage.getItem('enchanted_concerns'); if (c) state.concerns = JSON.parse(c); } catch {}
  try { const h = localStorage.getItem('enchanted_history'); if (h) state.history = JSON.parse(h); } catch {}
}

const $ = (id) => document.getElementById(id);

// ===================================================
// TOAST
// ===================================================
let toastContainer = null;
function ensureToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}
function showToast(msg, type = 'success', dur = 3500) {
  ensureToastContainer();
  const icon = type === 'success' ? '✨' : '🌙';
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-size:16px">${icon}</span><span>${msg}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.25s ease reverse forwards';
    setTimeout(() => toast.remove(), 250);
  }, dur);
}

// ===================================================
// SIDEBAR
// ===================================================
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function setSidebarOpen(open) {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open', open);
    sidebarOverlay.classList.toggle('visible', open);
  } else {
    sidebar.classList.toggle('collapsed', !open);
    mainContent.classList.toggle('sidebar-collapsed', !open);
  }
}

$('toggleSidebar').addEventListener('click', () => setSidebarOpen(false));
$('openSidebar').addEventListener('click', () => setSidebarOpen(true));
sidebarOverlay.addEventListener('click', () => setSidebarOpen(false));

$('newDesignBtn').addEventListener('click', () => {
  $('outputSection').style.display = 'none';
  $('errorSection').style.display = 'none';
  $('appDescription').value = '';
  updateCharCounter();
  state.currentDesign = null;
  updateHistoryList();
  $('heroSection').scrollIntoView({ behavior: 'smooth' });
  if (window.innerWidth <= 900) setSidebarOpen(false);
});

// ===================================================
// SETTINGS MODAL
// ===================================================
function openSettings() {
  const m = $('settingsModal');
  $('apiKeyInput').value = state.apiKey;
  $('modelSelect').value = state.model;
  $('scaleSelect').value = state.scale;
  $('detailSelect').value = state.detail;
  $('chkScalability').checked = state.concerns.scalability;
  $('chkSecurity').checked = state.concerns.security;
  $('chkFaultTolerance').checked = state.concerns.faultTolerance;
  $('chkCaching').checked = state.concerns.caching;
  $('chkMonitoring').checked = state.concerns.monitoring;
  $('chkCICD').checked = state.concerns.cicd;
  m.classList.add('open');
}
function closeSettings() { $('settingsModal').classList.remove('open'); }

$('settingsBtn').addEventListener('click', openSettings);
$('topbarSettings').addEventListener('click', openSettings);
$('closeSettings').addEventListener('click', closeSettings);
$('settingsModal').addEventListener('click', (e) => { if (e.target === $('settingsModal')) closeSettings(); });

$('saveSettings').addEventListener('click', () => {
  state.apiKey = $('apiKeyInput').value.trim();
  state.model = $('modelSelect').value;
  state.scale = $('scaleSelect').value;
  state.detail = $('detailSelect').value;
  state.concerns = {
    scalability: $('chkScalability').checked,
    security: $('chkSecurity').checked,
    faultTolerance: $('chkFaultTolerance').checked,
    caching: $('chkCaching').checked,
    monitoring: $('chkMonitoring').checked,
    cicd: $('chkCICD').checked,
  };
  saveState();
  closeSettings();
  $('apiKeyWarning').style.display = state.apiKey ? 'none' : 'flex';
  showToast('Configuration saved! ✨', 'success');
});

$('warningSettingsBtn').addEventListener('click', openSettings);

// ===================================================
// HISTORY
// ===================================================
function escapeHtml(str) {
  const d = document.createElement('div'); d.textContent = str; return d.innerHTML;
}
function formatDate(ts) {
  const d = new Date(ts), now = new Date(), diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function updateHistoryList() {
  const list = $('historyList');
  if (!state.history.length) {
    list.innerHTML = '<li class="history-empty">No enchantments yet.<br/>Cast your first spell!</li>';
    return;
  }
  list.innerHTML = state.history.map(item => `
    <li class="history-item ${state.currentDesign?.id === item.id ? 'active' : ''}" data-id="${item.id}">
      <span class="history-item-icon">🏰</span>
      <div class="history-item-body">
        <div class="history-item-title">${escapeHtml(item.title)}</div>
        <div class="history-item-date">${formatDate(item.timestamp)}</div>
      </div>
      <button class="history-item-delete" data-del="${item.id}" aria-label="Remove">✕</button>
    </li>
  `).join('');

  list.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.history-item-delete')) return;
      const item = state.history.find(h => h.id === el.dataset.id);
      if (item) loadDesignFromHistory(item);
    });
  });
  list.querySelectorAll('.history-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.history = state.history.filter(h => h.id !== btn.dataset.del);
      saveState(); updateHistoryList();
      showToast('Spell removed from book', 'success');
    });
  });
}

function loadDesignFromHistory(item) {
  state.currentDesign = item;
  state.currentDescription = item.description;
  $('appDescription').value = item.description;
  updateCharCounter();
  renderDesign(item.design, item.title);
  updateHistoryList();
  if (window.innerWidth <= 900) setSidebarOpen(false);
}

$('clearHistoryBtn').addEventListener('click', () => {
  if (confirm('Clear all enchantments from your spell book?')) {
    state.history = []; state.currentDesign = null;
    saveState(); updateHistoryList();
    showToast('Spell book cleared 🌙', 'success');
  }
});

// ===================================================
// CHAR COUNTER
// ===================================================
function updateCharCounter() {
  $('charCounter').textContent = `${$('appDescription').value.length} / 2000`;
}
$('appDescription').addEventListener('input', updateCharCounter);

// ===================================================
// EXAMPLE CHIPS
// ===================================================
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $('appDescription').value = chip.dataset.example;
    updateCharCounter();
    $('inputSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
$('heroStartBtn').addEventListener('click', () => {
  $('inputSection').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('appDescription').focus(), 500);
});
$('heroExampleBtn').addEventListener('click', () => {
  $('appDescription').value = "A real-time collaborative document editing platform like Google Docs. Multiple users can edit the same document simultaneously, with operational transformation for conflict resolution, presence indicators showing other users' cursors, inline commenting, revision history, and document sharing. The platform should handle 100k+ concurrent users with sub-50ms latency for edits.";
  updateCharCounter();
  $('inputSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// ===================================================
// TABS
// ===================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    document.getElementById(`panel${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
  });
});

// ===================================================
// DIAGRAM CONTROLS
// ===================================================
let diagramZoom = 1;
const diagramCanvas = $('diagramCanvas');

$('zoomInBtn').addEventListener('click', () => { diagramZoom = Math.min(diagramZoom + 0.25, 3); diagramCanvas.style.transform = `scale(${diagramZoom})`; });
$('zoomOutBtn').addEventListener('click', () => { diagramZoom = Math.max(diagramZoom - 0.25, 0.25); diagramCanvas.style.transform = `scale(${diagramZoom})`; });
$('resetZoomBtn').addEventListener('click', () => { diagramZoom = 1; diagramCanvas.style.transform = 'scale(1)'; });

// Drag-to-pan
(function() {
  const vp = $('diagramViewport');
  let dragging = false, startX, startY, sL, sT;
  vp.addEventListener('mousedown', (e) => { dragging = true; startX = e.pageX - vp.offsetLeft; startY = e.pageY - vp.offsetTop; sL = vp.scrollLeft; sT = vp.scrollTop; });
  vp.addEventListener('mouseleave', () => dragging = false);
  vp.addEventListener('mouseup', () => dragging = false);
  vp.addEventListener('mousemove', (e) => {
    if (!dragging) return; e.preventDefault();
    vp.scrollLeft = sL - (e.pageX - vp.offsetLeft - startX);
    vp.scrollTop = sT - (e.pageY - vp.offsetTop - startY);
  });
})();

$('toggleSourceBtn').addEventListener('click', () => {
  const src = $('mermaidSource');
  const visible = src.style.display !== 'none';
  src.style.display = visible ? 'none' : 'block';
  $('toggleSourceBtn').textContent = visible ? '🪄 View Mermaid Source' : '🪄 Hide Mermaid Source';
});
$('copyDiagramBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(state.mermaidSource).then(() => showToast('Mermaid source copied! ✨', 'success'));
});

// ===================================================
// COPY & DOWNLOAD
// ===================================================
$('copyAllBtn').addEventListener('click', () => {
  if (!state.currentDesign) return;
  const d = state.currentDesign.design;
  const text = ['# ' + state.currentDesign.title, '', '## Overview', d.overview, '', '## Architecture', '```mermaid', d.diagram, '```', '', '## Roadmap', d.roadmap, '', '## Tech Stack', d.techStack, '', '## Production', d.productionConcerns, '', '## Next Steps', d.assumptions].join('\n');
  navigator.clipboard.writeText(text).then(() => showToast('Design copied to scroll! 📜', 'success'));
});
$('downloadBtn').addEventListener('click', () => {
  if (!state.currentDesign) return;
  const d = state.currentDesign.design;
  const text = ['# ' + state.currentDesign.title, `*Enchanted by Enchanted Architect AI on ${new Date().toLocaleDateString()}*`, '', '## Overview', d.overview, '', '## Architecture Diagram', '```mermaid', d.diagram, '```', '', '## Implementation Roadmap', d.roadmap, '', '## Technology Stack', d.techStack, '', '## Production Concerns', d.productionConcerns, '', '## Assumptions & Next Steps', d.assumptions].join('\n');
  const blob = new Blob([text], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `enchanted-design-${Date.now()}.md`;
  a.click();
  showToast('Design downloaded! 📜', 'success');
});
$('regenerateBtn').addEventListener('click', () => { if (state.currentDescription) handleGenerate(state.currentDescription); });
$('retryBtn').addEventListener('click', () => { $('errorSection').style.display = 'none'; if (state.currentDescription) handleGenerate(state.currentDescription); });

// ===================================================
// GENERATE
// ===================================================
$('generateBtn').addEventListener('click', () => {
  const desc = $('appDescription').value.trim();
  if (!desc) { showToast('Please describe your application first! 🔮', 'error'); $('appDescription').focus(); return; }
  if (!state.apiKey) { $('apiKeyWarning').style.display = 'flex'; openSettings(); return; }
  handleGenerate(desc);
});
$('appDescription').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('generateBtn').click();
});

function setLoading(on) {
  const btn = $('generateBtn');
  btn.disabled = on;
  btn.querySelector('.btn-text').style.display = on ? 'none' : '';
  btn.querySelector('.btn-magic-sparkle').style.display = on ? 'none' : '';
  const loading = btn.querySelector('.btn-loading');
  loading.style.display = on ? 'inline-flex' : 'none';
}

function showLoadingPlaceholder() {
  const ph = `<div class="loading-placeholder">
    <div class="shimmer-block lp-heading"></div>
    <div class="shimmer-block lp-line" style="width:88%"></div>
    <div class="shimmer-block lp-para" style="width:76%"></div>
    <div class="shimmer-block lp-para" style="width:92%"></div>
    <div class="shimmer-block lp-para" style="width:68%"></div>
    <br/>
    <div class="shimmer-block lp-heading" style="width:48%"></div>
    <div class="shimmer-block lp-para" style="width:100%"></div>
    <div class="shimmer-block lp-para" style="width:83%"></div>
  </div>`;
  ['overviewContent','roadmapContent','stackContent','concernsContent','followupContent'].forEach(id => $(id).innerHTML = ph);
  $('mermaidDiagram').innerHTML = `<div style="padding:48px;text-align:center;color:var(--text-muted)">
    <div class="magic-spinner" style="width:40px;height:40px;margin:0 auto 16px;border-width:3px;border-color:hsla(43,95%,58%,0.25);border-top-color:var(--gold)"></div>
    <div style="font-family:var(--font-display);color:var(--text-gold);font-size:14px">Conjuring your architecture map...</div>
  </div>`;
  $('outputSection').style.display = 'block';
  $('errorSection').style.display = 'none';
  $('outputSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Reset tabs
  document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  $('tabOverview').classList.add('active'); $('tabOverview').setAttribute('aria-selected','true');
  $('panelOverview').classList.add('active');
}

async function handleGenerate(description) {
  state.currentDescription = description;
  setLoading(true);
  showLoadingPlaceholder();

  const concerns = Object.entries(state.concerns)
    .filter(([,v]) => v)
    .map(([k]) => ({ scalability:'Scalability', security:'Security', faultTolerance:'Fault Tolerance', caching:'Caching', monitoring:'Monitoring & Observability', cicd:'CI/CD Pipeline' }[k]))
    .filter(Boolean);

  const scaleLabel = { startup:'Startup/MVP (small team, low traffic)', growth:'Growth Stage (10k–100k users)', enterprise:'Enterprise (millions of users, high availability)' }[state.scale];
  const detailLabel = { overview:'high-level overview', detailed:'detailed with all major components and data flows', deep:'deep dive including schemas, APIs, and configuration details' }[state.detail];
  const includeProduction = $('toggleProduction').checked;
  const includeDiagram = $('toggleDiagram').checked;

  const systemPrompt = `You are an expert AI application architect and system design specialist. Transform application ideas into comprehensive, production-ready system designs.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, raw JSON only) with exactly these keys:
- "title": string (descriptive title, max 60 chars)
- "overview": string (markdown - architecture overview: what the system does, main components, how they connect, key design decisions)
- "diagram": string (${includeDiagram ? 'valid Mermaid flowchart LR diagram. Use subgraphs to group: Frontend, Backend Services, Data Layer, Infrastructure. Keep labels short (max 4 words). CRITICAL: NO parentheses in node labels - use brackets only. Example: A[Web App] --> B[API Gateway]. No special chars in labels.' : 'empty string ""'})
- "roadmap": string (markdown - numbered phases with: phase name, description, bullet tasks, complexity: Low/Medium/High/Very High)
- "techStack": string (markdown - table with columns: Layer, Technology, Justification. Cover: Frontend, Backend, Database, Cache, Queue, Auth, Infrastructure, Monitoring)
- "productionConcerns": string (markdown - specific actionable implementation details for: ${concerns.length ? concerns.join(', ') : 'scalability, security, fault tolerance'})
- "assumptions": string (markdown - 1) Assumptions made, 2) Follow-up questions to refine the design)

Mermaid rules (STRICT - violations break the diagram):
1. Start with: flowchart LR
2. Node labels: use [square brackets] only, NO parentheses () in labels
3. Short labels: max 4-5 words
4. Use --> for arrows
5. Use subgraph...end for grouping
6. Valid example: subgraph FE["Frontend"]\n  A[React App] --> B[CDN]\nend`;

  const userPrompt = `Application: ${description}

Scale: ${scaleLabel}
Detail: ${detailLabel}  
Production Concerns: ${concerns.length ? concerns.join(', ') : 'General best practices'}
Production-Ready: ${includeProduction ? 'Yes' : 'Simplified MVP'}
Diagram: ${includeDiagram ? 'Yes' : 'No'}

Generate a comprehensive, production-conscious system design. Be specific and actionable.`;

  try {
    const response = await callGroqAPI(state.apiKey, state.model, systemPrompt, userPrompt);
    let design;
    try {
      const cleaned = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      design = JSON.parse(cleaned);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) design = JSON.parse(match[0]);
      else throw new Error('Could not parse the enchanted response. Please try again!');
    }

    const title = design.title || description.slice(0, 60);
    const item = { id: Date.now().toString(), title, description, design, timestamp: Date.now() };
    state.currentDesign = item;
    state.history.unshift(item);
    saveState(); updateHistoryList();
    await renderDesign(design, title);
    setLoading(false);
    showToast('Your enchantment is ready! ✨', 'success');
  } catch (err) {
    setLoading(false);
    $('outputSection').style.display = 'none';
    $('errorSection').style.display = 'block';
    $('errorMessage').textContent = err.message || 'The spell failed. Please check your API key and try again.';
    showToast(err.message || 'Enchantment failed 🌙', 'error', 5000);
    console.error(err);
  }
}

// ===================================================
// GROQ API
// ===================================================
async function callGroqAPI(apiKey, model, systemPrompt, userPrompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Groq API error: ${res.status}`;
    if (res.status === 401) throw new Error('Invalid Groq API key. Please check your key in Configuration.');
    if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
    if (res.status === 400) throw new Error('The model rejected the request. Try a different model in Configuration.');
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq. Please try again.');
  return text;
}

// ===================================================
// MERMAID
// ===================================================
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0d0a1e',
    primaryColor: '#6b3fa0',
    primaryTextColor: '#f0ead6',
    primaryBorderColor: '#c084fc',
    lineColor: '#f5c842',
    secondaryColor: '#1a1030',
    tertiaryColor: '#231545',
    fontFamily: 'Nunito, system-ui, sans-serif',
    fontSize: '14px',
    nodeTextColor: '#f0ead6',
    edgeLabelBackground: '#1a1030',
    clusterBkg: 'hsla(270,50%,15%,0.4)',
    clusterBorder: '#c084fc',
  },
  flowchart: { curve: 'basis', padding: 20 },
  securityLevel: 'loose',
});

// ===================================================
// RENDER DESIGN
// ===================================================
async function renderDesign(design, title) {
  $('outputTitle').textContent = '✨ ' + (title || 'Your Enchantment is Ready!');
  $('overviewContent').innerHTML = marked.parse(design.overview || '*No overview generated.*');
  $('roadmapContent').innerHTML = marked.parse(design.roadmap || '*No roadmap generated.*');
  $('stackContent').innerHTML = marked.parse(design.techStack || '*No tech stack generated.*');
  $('concernsContent').innerHTML = marked.parse(design.productionConcerns || '*No production concerns generated.*');
  $('followupContent').innerHTML = marked.parse(design.assumptions || '*No follow-up information generated.*');

  state.mermaidSource = design.diagram || '';
  $('mermaidSourceCode').textContent = state.mermaidSource;
  await renderMermaidDiagram(state.mermaidSource);

  $('outputSection').style.display = 'block';
  $('errorSection').style.display = 'none';
  diagramZoom = 1; diagramCanvas.style.transform = 'scale(1)';
  $('mermaidSource').style.display = 'none';
  $('toggleSourceBtn').textContent = '🪄 View Mermaid Source';

  // Re-init tilt cards for new output cards
  setTimeout(() => {
    document.querySelectorAll('.tilt-card').forEach(initTiltCard);
  }, 100);
}

async function renderMermaidDiagram(source) {
  const container = $('mermaidDiagram');
  if (!source || !source.trim()) {
    container.innerHTML = `<div style="padding:48px;text-align:center;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:16px">🗺️</div>
      <p style="font-family:var(--font-display);color:var(--text-gold)">Diagram not generated</p>
      <p style="font-size:13px;margin-top:8px">(Diagram option was disabled in the input)</p>
    </div>`;
    return;
  }
  try {
    const id = 'mermaid-' + Date.now();
    const { svg } = await mermaid.render(id, source);
    container.innerHTML = svg;
  } catch (err) {
    console.warn('Mermaid render error, trying fallback:', err);
    try {
      const fallback = `flowchart LR
  subgraph FE["Frontend"]
    A[Web App] --> B[CDN]
  end
  subgraph BE["Backend"]
    C[API Gateway] --> D[Services]
    D --> E[Auth Service]
  end
  subgraph DB["Data"]
    F[(Database)]
    G[(Cache)]
  end
  B --> C
  D --> F
  D --> G`;
      const { svg } = await mermaid.render('fallback-' + Date.now(), fallback);
      container.innerHTML = svg + `<p style="padding:12px 0 0;font-size:12px;color:var(--warning);text-align:center">⚠️ Original diagram had syntax issues. Showing fallback. View source for details.</p>`;
    } catch {
      container.innerHTML = `<div style="padding:24px;background:hsla(252,50%,8%,0.8);border-radius:16px;border:1px solid var(--border-default)">
        <p style="color:var(--warning);margin-bottom:12px">⚠️ Diagram could not be rendered. Raw Mermaid source:</p>
        <pre style="font-size:12px;line-height:1.6;color:var(--text-secondary);overflow:auto;white-space:pre-wrap">${escapeHtml(source)}</pre>
      </div>`;
    }
  }
}

// ===================================================
// FOLLOW-UP
// ===================================================
$('followupBtn').addEventListener('click', handleFollowup);
$('followupInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleFollowup(); }
});

async function handleFollowup() {
  const q = $('followupInput').value.trim();
  if (!q || !state.apiKey || !state.currentDesign) return;

  const btn = $('followupBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="magic-spinner" style="width:18px;height:18px;border-color:hsla(250,60%,8%,0.3);border-top-color:hsl(250,60%,8%)"></span>';

  const sysPrompt = `You are an expert system architect. The user received a system design for: "${state.currentDescription}". Answer their follow-up question with detailed markdown. Be specific, technical, and actionable. Include code examples, configurations, or specific implementation details where relevant. Overview: ${state.currentDesign.design.overview?.slice(0, 500)}`;

  try {
    const res = await callGroqRaw(state.apiKey, state.model, sysPrompt, q);
    const existing = $('followupContent').innerHTML;
    $('followupContent').innerHTML = existing + `
      <hr style="margin:24px 0;border-color:var(--border-dim)">
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-muted)">
        <span>💬</span> <em style="color:var(--text-secondary)">${escapeHtml(q)}</em>
      </div>
      ${marked.parse(res)}`;
    $('followupInput').value = '';
    showToast('The oracle has answered! ✨', 'success');
  } catch (err) {
    showToast(err.message || 'Follow-up failed 🌙', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>✨</span>';
  }
}

async function callGroqRaw(apiKey, model, systemPrompt, userMsg) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, temperature: 0.6, max_tokens: 4096,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    }),
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Groq error: ${res.status}`); }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || 'No answer conjured.';
}

// ===================================================
// INIT
// ===================================================
function init() {
  loadState();
  updateHistoryList();
  updateCharCounter();
  if (!state.apiKey) $('apiKeyWarning').style.display = 'flex';
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettings(); });
  $('appDescription').title = 'Press Ctrl+Enter to conjure your design!';
}

init();
