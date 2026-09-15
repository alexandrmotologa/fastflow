const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

function buildFalconLogoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <clipPath id="squircle-clip">
      <rect x="24" y="24" width="976" height="976" rx="220" />
    </clipPath>

    <!-- Gradients -->
    <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f5ff"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>

    <linearGradient id="amber-accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <linearGradient id="titanium-bright" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>

    <linearGradient id="facet-slate-1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>

    <linearGradient id="facet-slate-2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="obsidian-core" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>

    <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.16" />
    </filter>
  </defs>

  <!-- Luxury White Squircle Container -->
  <rect x="24" y="24" width="976" height="976" rx="220" fill="#ffffff" stroke="#e2e8f0" stroke-width="6" />

  <g clip-path="url(#squircle-clip)">
    <g transform="translate(512, 512)" filter="url(#subtle-shadow)">

      <!-- Massive Hexagonal Architectural Gateway Frame -->
      <polygon points="
        0,-390
        338,-195
        338,195
        0,390
        -338,195
        -338,-195
      " fill="none" stroke="#0f172a" stroke-width="36" stroke-linejoin="round" />

      <!-- Inner High-Precision Dashed Cyan Boundary -->
      <polygon points="
        0,-355
        307,-177
        307,177
        0,355
        -307,177
        -307,-177
      " fill="none" stroke="#00f5ff" stroke-width="4" opacity="0.45" stroke-dasharray="16, 12" />

      <!-- 100% Watertight Solid Base Silhouette of Peregrine Falcon -->
      <path d="
        M 0 -330
        L 90 -280 L 190 -260 L 290 -160 L 300 -40 L 250 80 L 270 210 L 190 280 L 100 355 L 0 380
        L -100 355 L -190 280 L -270 210 L -250 80 L -300 -40 L -290 -160 L -190 -260 L -90 -280
        Z
      " fill="#090d16" />

      <!-- ================= BROAD RAPTOR SHOULDERS & MANTLE ================= -->
      <!-- Left Shoulder Mantle -->
      <polygon points="-75,-280 -190,-260 -150,-120 -65,-180" fill="url(#facet-slate-1)" />
      <polygon points="-150,-120 -240,-120 -180,50 -135,50" fill="url(#facet-slate-2)" />
      <polygon points="-135,50 -180,50 -140,210 -70,170" fill="url(#obsidian-core)" />

      <!-- Right Shoulder Mantle -->
      <polygon points="75,-280 190,-260 150,-120 65,-180" fill="url(#facet-slate-2)" />
      <polygon points="150,-120 240,-120 180,50 135,50" fill="url(#facet-slate-1)" />
      <polygon points="135,50 180,50 140,210 70,170" fill="url(#obsidian-core)" />

      <!-- ================= LEFT WING (DAG VECTOR CHEVRONS) ================= -->
      <polygon points="-190,-260 -290,-160 -240,-120 -150,-120" fill="url(#facet-slate-1)" />
      <polygon points="-290,-160 -300,-40 -220,-40 -240,-120" fill="url(#facet-slate-2)" />
      <polygon points="-300,-40 -250,80 -180,50 -220,-40" fill="url(#obsidian-core)" />
      <polygon points="-250,80 -270,210 -190,170 -180,50" fill="url(#facet-slate-1)" />
      <polygon points="-270,210 -190,280 -140,210 -190,170" fill="url(#facet-slate-2)" />
      <polygon points="-190,280 -100,355 -70,270 -140,210" fill="url(#obsidian-core)" />

      <!-- Left Wing Accent Flight Rails (Cyan DAG Vector Trim) -->
      <polygon points="-240,-120 -150,-120 -160,-110 -230,-115" fill="url(#cyan-glow)" />
      <polygon points="-220,-40 -180,50 -170,40 -210,-35" fill="url(#cyan-glow)" opacity="0.8" />

      <!-- ================= RIGHT WING (DAG VECTOR CHEVRONS) ================= -->
      <polygon points="190,-260 290,-160 240,-120 150,-120" fill="url(#facet-slate-2)" />
      <polygon points="290,-160 300,-40 220,-40 240,-120" fill="url(#facet-slate-1)" />
      <polygon points="300,-40 250,80 180,50 220,-40" fill="url(#obsidian-core)" />
      <polygon points="250,80 270,210 190,170 180,50" fill="url(#facet-slate-2)" />
      <polygon points="270,210 190,280 140,210 190,170" fill="url(#facet-slate-1)" />
      <polygon points="190,280 100,355 70,270 140,210" fill="url(#obsidian-core)" />

      <!-- Right Wing Accent Flight Rails (Cyan DAG Vector Trim) -->
      <polygon points="240,-120 150,-120 160,-110 230,-115" fill="url(#cyan-glow)" />
      <polygon points="220,-40 180,50 170,40 210,-35" fill="url(#cyan-glow)" opacity="0.8" />

      <!-- ================= FALCON HEAD & CREST ================= -->
      <!-- Aerodynamic Crown Apex -->
      <polygon points="0,-330 75,-280 0,-250" fill="url(#titanium-bright)" />
      <polygon points="0,-330 -75,-280 0,-250" fill="#334155" />
      <polygon points="75,-280 150,-200 65,-180 0,-250" fill="url(#facet-slate-1)" />
      <polygon points="-75,-280 -150,-200 -65,-180 0,-250" fill="url(#facet-slate-2)" />

      <!-- Amber Crown Peak (Speed / Energy Vector) -->
      <polygon points="0,-250 35,-220 0,-190 -35,-220" fill="url(#amber-accent)" />

      <!-- Forehead & Supraorbital Brow Armor -->
      <polygon points="0,-190 65,-180 80,-110 0,-120" fill="url(#titanium-bright)" />
      <polygon points="0,-190 -65,-180 -80,-110 0,-120" fill="#334155" />

      <!-- ================= FALCON PREDATORY OPTICS (EYES) ================= -->
      <!-- Left Eye: Sharp Almond Socket with Electric Cyan Glow -->
      <polygon points="-80,-110 -25,-105 -35,-70 -95,-80" fill="#090d16" />
      <polygon points="-75,-103 -30,-98 -38,-75 -85,-82" fill="url(#cyan-glow)" />
      <polygon points="-58,-97 -45,-95 -50,-80 -62,-83" fill="#090d16" /> <!-- Predator pupil -->

      <!-- Right Eye: Sharp Almond Socket with Electric Cyan Glow -->
      <polygon points="80,-110 25,-105 35,-70 95,-80" fill="#090d16" />
      <polygon points="75,-103 30,-98 38,-75 85,-82" fill="url(#cyan-glow)" />
      <polygon points="58,-97 45,-95 50,-80 62,-83" fill="#090d16" /> <!-- Predator pupil -->

      <!-- Peregrine Malar Facial Facets (Characteristic Tear Stripes) -->
      <polygon points="-95,-80 -35,-70 -50,15 -115,-10" fill="url(#facet-slate-2)" />
      <polygon points="95,-80 35,-70 50,15 115,-10" fill="url(#facet-slate-1)" />
      <polygon points="-115,-10 -50,15 -60,95 -135,50" fill="#090d16" />
      <polygon points="115,-10 50,15 60,95 135,50" fill="url(#facet-slate-2)" />

      <!-- ================= RAPTOR HOOKED BEAK ================= -->
      <!-- Amber Beak Base (Cere) -->
      <polygon points="0,-120 28,-100 0,-65 -28,-100" fill="url(#amber-accent)" />
      
      <!-- Upper Beak Blade (Titanium & Steel) -->
      <polygon points="0,-65 32,-35 0,35" fill="url(#titanium-bright)" />
      <polygon points="0,-65 -32,-35 0,35" fill="#475569" />
      
      <!-- Hooked Beak Tip (Diving Talon Geometry) -->
      <polygon points="0,35 22,25 0,85 -22,25" fill="#1e293b" />
      <polygon points="0,35 15,30 0,85" fill="url(#amber-accent)" />
      <polygon points="0,35 -15,30 0,85" fill="#94a3b8" />

      <!-- ================= CHEST DAG TOPOLOGICAL RUNNER (CENTRAL ARTERY) ================= -->
      <!-- Cyan DAG Heart Diamond -->
      <polygon points="0,95 45,125 0,170 -45,125" fill="url(#cyan-glow)" />
      <polygon points="0,115 22,130 0,155 -22,130" fill="#090d16" />

      <!-- Wave 1 Interlocking Chevron Flange -->
      <polygon points="-45,125 0,170 85,210 0,235 -85,210" fill="url(#facet-slate-1)" />
      <polygon points="0,170 45,125 85,210" fill="url(#titanium-bright)" />

      <!-- Wave 2 Interlocking Chevron Flange -->
      <polygon points="0,235 95,275 0,315 -95,275" fill="url(#facet-slate-2)" />
      <polygon points="0,235 95,275 0,275" fill="#475569" />

      <!-- Wave 3 Terminal Chevron Tail -->
      <polygon points="0,315 75,350 0,380 -75,350" fill="url(#obsidian-core)" />
      <polygon points="0,315 75,350 0,350" fill="#334155" />

      <!-- Cyan Terminal Anchor Node -->
      <polygon points="0,355 25,370 0,385 -25,370" fill="url(#cyan-glow)" />

    </g>
  </g>
</svg>`;
}

async function renderLogo() {
  const outputDir = path.join(__dirname, '..', 'docs', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svg = buildFalconLogoSvg();
  const svgPath = path.join(outputDir, 'logo.svg');
  const pngPath = path.join(outputDir, 'logo.png');

  fs.writeFileSync(svgPath, svg);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1024 } });
  const pngBuffer = resvg.render().asPng();
  fs.writeFileSync(pngPath, pngBuffer);

  // Also write to brain artifacts directory
  const brainDir = 'C:\\Users\\alexander\\.gemini\\antigravity-ide\\brain\\e1fd86c6-1867-4d28-8e54-5220a497d8d1';
  if (fs.existsSync(brainDir)) {
    fs.writeFileSync(path.join(brainDir, 'logo.svg'), svg);
    fs.writeFileSync(path.join(brainDir, 'logo.png'), pngBuffer);
  }

  console.log('✓ Successfully rendered official developer-branding falcon logo (logo.svg & logo.png at 1024x1024)');
}

renderLogo().catch(console.error);
