const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function convertMermaidToPng() {
  const mermaidFiles = [
    'AT_HT_Complete_Lifecycle.mmd',
    'AT_Burning_FIFO_Allocation.mmd',
    'HT_Issuance_Points_Distribution.mmd',
    'Backend_Services_Architecture.mmd',
    'Service_Interaction_Sequence.mmd'
  ];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const file of mermaidFiles) {
    const mmdPath = path.join(__dirname, file);
    const pngPath = path.join(__dirname, file.replace('.mmd', '.png'));
    
    if (fs.existsSync(mmdPath)) {
      const mermaidCode = fs.readFileSync(mmdPath, 'utf8');
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</head>
<body>
  <div class="mermaid">${mermaidCode}</div>
  <script>
    mermaid.contentLoaded();
  </script>
</body>
</html>
      `;
      
      await page.setContent(html);
      await page.waitForTimeout(2000);
      
      const svgElement = await page.$('svg');
      if (svgElement) {
        const boundingBox = await svgElement.boundingBox();
        await page.screenshot({
          path: pngPath,
          clip: {
            x: 0,
            y: 0,
            width: boundingBox.width + 20,
            height: boundingBox.height + 20
          }
        });
        console.log(`✅ Created: ${path.basename(pngPath)}`);
      }
    }
  }

  await browser.close();
}

convertMermaidToPng().catch(console.error);
