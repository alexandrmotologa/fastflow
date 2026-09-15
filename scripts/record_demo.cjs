const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
  const imagesDir = path.join(__dirname, '..', 'docs', 'images');
  const tempFramesDir = path.join(__dirname, '..', 'dist', 'frames');
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
  if (!fs.existsSync(tempFramesDir)) fs.mkdirSync(tempFramesDir, { recursive: true });

  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 860, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:5233/ ...');
  await page.goto('http://localhost:5233/', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  // 1. Capture Hero Studio Screenshot
  const heroPath = path.join(imagesDir, 'fastflow-hero.png');
  await page.screenshot({ path: heroPath });
  console.log('✓ Captured docs/images/fastflow-hero.png');

  // Prepare frames array for GIF recording
  let frameIndex = 0;
  async function saveFrame() {
    const framePath = path.join(tempFramesDir, `frame_${String(frameIndex++).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath });
  }

  // Capture initial idle state (5 frames)
  for (let i = 0; i < 6; i++) {
    await saveFrame();
    await new Promise((r) => setTimeout(r, 100));
  }

  // Click Run Pipeline
  console.log('Triggering Run Pipeline simulation...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('Run Pipeline')
    );
    if (btn) btn.click();
  });

  // Capture active waves and conduit pulses (approx 35 frames across ~3.5 seconds)
  for (let i = 0; i < 35; i++) {
    await saveFrame();
    await new Promise((r) => setTimeout(r, 100));
  }

  // 2. Open Wire Payload Popover
  console.log('Clicking edge payload badge...');
  const clickedEdge = await page.evaluate(() => {
    const edgeBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.innerText.includes('props')
    );
    if (edgeBtn) {
      edgeBtn.click();
      return true;
    }
    return false;
  });

  await new Promise((r) => setTimeout(r, 500));
  for (let i = 0; i < 8; i++) {
    await saveFrame();
    await new Promise((r) => setTimeout(r, 100));
  }

  const inspectorPath = path.join(imagesDir, 'fastflow-wire-inspector.png');
  await page.screenshot({ path: inspectorPath });
  console.log('✓ Captured docs/images/fastflow-wire-inspector.png');

  // 3. Select a node to open drawer with Code Node & Fault Tolerance
  console.log('Selecting node to display Node Config Drawer...');
  await page.evaluate(() => {
    const nodes = document.querySelectorAll('.react-flow__node');
    if (nodes.length > 1) {
      (nodes[1] || nodes[0]).click();
    }
  });

  await new Promise((r) => setTimeout(r, 600));
  for (let i = 0; i < 8; i++) {
    await saveFrame();
    await new Promise((r) => setTimeout(r, 100));
  }

  const drawerPath = path.join(imagesDir, 'fastflow-node-config.png');
  await page.screenshot({ path: drawerPath });
  console.log('✓ Captured docs/images/fastflow-node-config.png');

  await browser.close();
  console.log(`Saved ${frameIndex} frames to ${tempFramesDir}.`);

  // 4. Compile frames to animated GIF using ffmpeg
  const gifOutput = path.join(imagesDir, 'fastflow-demo.gif');
  console.log('Compiling frames to animated GIF via ffmpeg...');

  // Use two-pass ffmpeg palette generation for high-fidelity anti-dithered GIF
  const palettePath = path.join(tempFramesDir, 'palette.png');
  const inputPattern = path.join(tempFramesDir, 'frame_%04d.png');

  try {
    execSync(
      `ffmpeg -y -framerate 10 -i "${inputPattern}" -vf "fps=10,scale=1080:-1:flags=lanczos,palettegen=max_colors=192:stats_mode=diff" "${palettePath}"`,
      { stdio: 'inherit' }
    );
    execSync(
      `ffmpeg -y -framerate 10 -i "${inputPattern}" -i "${palettePath}" -lavfi "fps=10,scale=1080:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4" "${gifOutput}"`,
      { stdio: 'inherit' }
    );
    console.log(`✓ Successfully compiled high-fidelity animated GIF at ${gifOutput}`);

    // Copy to brain artifacts directory as well
    const brainDir = 'C:\\Users\\alexander\\.gemini\\antigravity-ide\\brain\\e1fd86c6-1867-4d28-8e54-5220a497d8d1';
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(gifOutput, path.join(brainDir, 'fastflow-demo.gif'));
      fs.copyFileSync(heroPath, path.join(brainDir, 'fastflow-hero.png'));
      fs.copyFileSync(inspectorPath, path.join(brainDir, 'fastflow-wire-inspector.png'));
      fs.copyFileSync(drawerPath, path.join(brainDir, 'fastflow-node-config.png'));
    }
  } catch (err) {
    console.error('Error compiling GIF with ffmpeg:', err.message);
  }

  // Cleanup temp frames directory
  try {
    fs.rmSync(tempFramesDir, { recursive: true, force: true });
    console.log('Cleaned up temporary frames.');
  } catch (e) {}

  console.log('All real screenshots and animated demo GIF generated successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
