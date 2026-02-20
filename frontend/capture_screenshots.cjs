const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();

    // Set viewport for high quality
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    // 1. Dashboard
    console.log('Capturing Dashboard...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, '1_Dashboard.png'), fullPage: false });

    // 2. Insights
    console.log('Capturing Insights...');
    await page.goto('http://localhost:5173/insights', { waitUntil: 'networkidle0' });
    // Wait for the chart to render properly
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotDir, '2_Insights_Opening_Trends.png'), fullPage: false });

    // 3. Database
    console.log('Capturing Database...');
    await page.goto('http://localhost:5173/database', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, '3_Game_Database.png'), fullPage: false });

    // 4. Analysis
    console.log('Capturing Analysis...');
    await page.goto('http://localhost:5173/analysis', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(screenshotDir, '4_Stockfish_Analysis.png'), fullPage: false });

    await browser.close();
    console.log('Screenshots saved to frontend/screenshots!');
})();
