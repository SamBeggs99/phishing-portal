import { escapeHtml } from "./shared.js";

function makeCertificateSvg({ name, scorePercent, passed, issuedOn }) {
  const safeName = escapeHtml(name).trim() || "Participant";
  const safeDate = escapeHtml(issuedOn);
  const safeScore = Number.isFinite(scorePercent) ? `${Math.round(scorePercent)}%` : "—";
  const statusLabel = passed ? "Certified — Phishing Awareness" : "Training Incomplete";
  const statusColor = passed ? "#2ECC71" : "#F5A623";

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <defs>
    <linearGradient id="certBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F1210"/>
      <stop offset="50%" stop-color="#141614"/>
      <stop offset="100%" stop-color="#1C1F1D"/>
    </linearGradient>
    <linearGradient id="redLine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#E8332A"/>
      <stop offset="100%" stop-color="#76232F"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1400" height="900" fill="url(#certBg)"/>
  
  <!-- Dot pattern -->
  <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
    <circle cx="20" cy="20" r="0.8" fill="rgba(232,51,42,0.15)"/>
  </pattern>
  <rect width="1400" height="900" fill="url(#dots)"/>

  <!-- Red accent lines -->
  <rect x="60" y="60" width="1280" height="780" rx="16" fill="none" stroke="rgba(232,51,42,0.2)" stroke-width="1"/>
  <rect x="72" y="110" width="1256" height="4" rx="2" fill="url(#redLine)" opacity="0.7"/>
  <rect x="72" y="786" width="1256" height="2" rx="1" fill="rgba(232,51,42,0.3)"/>

  <!-- Shield icon -->
  <g transform="translate(660,150)">
    <path d="M40 4L76 18V46L40 60L4 46V18L40 4Z" fill="rgba(232,51,42,0.15)" stroke="#E8332A" stroke-width="1.5"/>
    <path d="M28 32L36 40L52 26" stroke="#E8332A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Portal name -->
  <text x="700" y="256" text-anchor="middle" font-size="16" font-family="ui-monospace, monospace" fill="rgba(232,51,42,0.9)" letter-spacing="4" text-transform="uppercase">PHISHDEFENSE TRAINING PORTAL</text>

  <!-- Status -->
  <text x="700" y="310" text-anchor="middle" font-size="22" font-family="ui-sans-serif, system-ui, sans-serif" fill="${statusColor}" font-weight="600">${escapeHtml(statusLabel)}</text>

  <!-- Divider -->
  <rect x="580" y="330" width="240" height="1" fill="rgba(255,255,255,0.1)"/>

  <!-- This certifies -->
  <text x="700" y="390" text-anchor="middle" font-size="17" font-family="ui-sans-serif, system-ui, sans-serif" fill="rgba(232,234,233,0.5)" font-weight="400" letter-spacing="1">This certifies that</text>

  <!-- Name -->
  <text x="700" y="468" text-anchor="middle" font-size="58" font-family="ui-sans-serif, system-ui, sans-serif" fill="#E8EAE9" font-weight="800" letter-spacing="-1">${safeName}</text>

  <!-- Description -->
  <text x="700" y="526" text-anchor="middle" font-size="20" font-family="ui-sans-serif, system-ui, sans-serif" fill="rgba(232,234,233,0.65)">has successfully completed the Phishing Awareness Assessment</text>

  <!-- Score badge -->
  <rect x="610" y="556" width="180" height="48" rx="8" fill="rgba(232,51,42,0.15)" stroke="rgba(232,51,42,0.3)" stroke-width="1"/>
  <text x="700" y="576" text-anchor="middle" font-size="12" font-family="ui-monospace, monospace" fill="rgba(232,51,42,0.8)" letter-spacing="2">SCORE</text>
  <text x="700" y="596" text-anchor="middle" font-size="18" font-family="ui-monospace, monospace" fill="#E8332A" font-weight="700">${safeScore}</text>

  <!-- Footer details -->
  <text x="120" y="740" font-size="14" font-family="ui-monospace, monospace" fill="rgba(232,234,233,0.4)" letter-spacing="0.5">ISSUED: ${safeDate}</text>
  <text x="1280" y="740" text-anchor="end" font-size="14" font-family="ui-monospace, monospace" fill="rgba(232,234,233,0.4)" letter-spacing="0.5">VERSION 1.0</text>

  <!-- Decorative dots -->
  <circle cx="120" cy="800" r="5" fill="#E8332A" opacity="0.7"/>
  <circle cx="136" cy="800" r="5" fill="#E8332A" opacity="0.4"/>
  <circle cx="152" cy="800" r="5" fill="#E8332A" opacity="0.2"/>
</svg>`;
}

export function renderCertificate({ name, scorePercent, passed, issuedOn, containerEl }) {
  const svg = makeCertificateSvg({ name, scorePercent, passed, issuedOn });
  containerEl.innerHTML = svg;
  containerEl.dataset.svg = svg;
}

export function downloadCertificateSvg({ name, containerEl }) {
  const svg = containerEl?.dataset?.svg;
  if (!svg) return;

  const safeName = String(name ?? "certificate")
    .trim()
    .replaceAll(/[^a-z0-9\-_ ]/gi, "")
    .replaceAll(/\s+/g, "-")
    .slice(0, 60) || "certificate";

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `phishdefense-cert-${safeName}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
