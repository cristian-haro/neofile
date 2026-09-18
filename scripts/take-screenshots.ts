import { createServer } from 'vite';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  const assetsDir = path.resolve(process.cwd(), 'docs/assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browserPath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  console.log('[1/5] Starting programmatic Vite server on port 3333...');
  const server = await createServer({
    server: { port: 3333 }
  });
  await server.listen();

  console.log(`[2/5] Launching browser at: ${browserPath}...`);
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });

  console.log('[3/5] Navigating to http://localhost:3333 ...');
  await page.goto('http://localhost:3333', { waitUntil: 'networkidle0' });
  await wait(1200);

  // Capture 1: Home View
  console.log('[4/5] Capturing Home Hero & Dropzone...');
  await page.screenshot({
    path: path.join(assetsDir, 'neofile_hero_home.png'),
    fullPage: false
  });

  // Capture 2: Queue View with loaded files
  console.log('[4/5] Adding mock files to Conversion Queue...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const dt = new DataTransfer();
      const file1 = new File(['%PDF-1.4 mock content'], 'Financial_Report_Q3.pdf', { type: 'application/pdf' });
      const file2 = new File(['id,name,revenue,department\n1,Marketing,45000,Sales\n2,Dev,89000,Engineering'], 'Company_Metrics.csv', { type: 'text/csv' });
      const file3 = new File(['0\nSECTION\n2\nENTITIES\n0\nLINE\n10\n0\n20\n0\n11\n100\n21\n100\n0\nENDSEC\n0\nEOF'], 'Architectural_Floorplan.dxf', { type: 'application/dxf' });
      const file4 = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'Company_Logo.svg', { type: 'image/svg+xml' });
      dt.items.add(file1);
      dt.items.add(file2);
      dt.items.add(file3);
      dt.items.add(file4);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await wait(1500);

  console.log('[4/5] Capturing Conversion Queue View...');
  await page.screenshot({
    path: path.join(assetsDir, 'neofile_conversion_queue.png'),
    fullPage: false
  });

  // Capture 3: Format Matrix Explorer View
  console.log('[4/5] Switching to Format Matrix Explorer...');
  const matrixButtons = await page.$$('button');
  for (const btn of matrixButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && (text.includes('Matriz') || text.includes('Matrix'))) {
      await btn.click();
      break;
    }
  }

  await wait(1000);

  const searchInput = await page.$('input[type="text"]');
  if (searchInput) {
    await searchInput.type('PDF');
    await wait(500);
  }

  console.log('[4/5] Capturing Format Matrix Explorer View...');
  await page.screenshot({
    path: path.join(assetsDir, 'neofile_matrix_explorer.png'),
    fullPage: false
  });

  console.log('[5/5] All screenshots captured successfully in docs/assets/!');
  await browser.close();
  await server.close();
  process.exit(0);
}

capture().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
