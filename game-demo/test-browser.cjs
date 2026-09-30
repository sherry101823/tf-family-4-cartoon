// Run against a server rooted at the repository; needs Playwright for verification only.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.DEMO_URL || 'http://127.0.0.1:8714/game-demo/';
const out = path.join(__dirname, 'verification');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base);await page.locator('.mode-card').first().waitFor();
  await page.screenshot({path:path.join(out,'01-start.png'),fullPage:true});
  await page.locator('[data-act="start"][data-mode="solo"]').click();
  await page.locator('.portrait').waitFor();
  await page.locator('[data-act="motion"]').click();
  await page.locator('[data-act="auto"]').click();
  await page.screenshot({path:path.join(out,'02-solo.png'),fullPage:true});
  await page.locator('[data-act="execute"]').click();
  await page.waitForFunction(()=>document.querySelector('.time-label small')?.textContent==='已完成');
  await page.reload();
  await page.locator('[data-act="continue"][data-mode="solo"]').click();
  assert.equal(await page.locator('.finished').count(),1,'saved current-day progress');
  for(let n=0;n<160;n++) {
    if(await page.locator('.ending-page').count())break;
    if(await page.locator('dialog[open]').count()) {
      if(await page.locator('[data-act="event"]').count()) {
        await page.locator('[data-act="event"]').last().click();
      } else if(await page.locator('[data-act="random"]').count())await page.locator('[data-act="random"]').last().click();
      else if(await page.locator('[data-act="perform"]').count()) {
        await page.screenshot({path:path.join(out,'03-show-setup.png'),fullPage:true});
        await page.locator('[data-act="perform"]').click();
        await page.screenshot({path:path.join(out,'04-live-stage.png'),fullPage:true});
        for(let i=0;i<5;i++)await page.locator('[data-act="tap"]').click();
        await page.locator('[data-act="skip-show"]').click();
      } else if(await page.locator('[data-act="finish-result"]').count())await page.locator('[data-act="finish-result"]').click();
      else throw Error('Unknown pending dialog');
    } else {
      await page.locator('[data-act="auto"]').click();
      await page.locator('[data-act="execute"]').click();
      await page.waitForTimeout(25);
    }
  }
  assert.equal(await page.locator('.ending-page').count(),1,'solo can finish through UI');
  await page.screenshot({path:path.join(out,'05-ending.png'),fullPage:true});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fourth-light-v1-solo')));
  assert.equal(saved.day,24);assert.equal(saved.shows.length,3);
  await page.locator('[data-act="home"]').first().click();
  await page.locator('[data-act="start"][data-mode="group"]').click();
  await page.locator('[data-act="auto"]').click();
  await page.screenshot({path:path.join(out,'06-group.png'),fullPage:true});
  await page.locator('[data-act="member"][data-index="1"]').click();
  assert.equal(await page.locator('.character-name h2').textContent(),'张桂源');
  await page.locator('[data-act="execute"]').click();
  await page.waitForTimeout(25);
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'07-mobile.png'),fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'mobile has no horizontal overflow');
  await page.locator('[data-act="pick"]:not(:disabled)').first().click();
  await page.screenshot({path:path.join(out,'08-mobile-actions.png'),fullPage:true});
  await page.locator('[data-act="close"]').click();
  await page.reload();await page.locator('[data-act="continue"][data-mode="group"]').click();
  assert.equal(await page.locator('.member-tabs button').count(),3);
  assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('fourth-light-v1-solo')).done),'other mode save preserved');
  await page.setViewportSize({width:1440,height:1100});
  for(let n=0;n<160;n++) {
    if(await page.locator('.ending-page').count())break;
    if(await page.locator('dialog[open]').count()) {
      if(await page.locator('[data-act="event"]').count())await page.locator('[data-act="event"]').last().click();
      else if(await page.locator('[data-act="random"]').count())await page.locator('[data-act="random"]').last().click();
      else if(await page.locator('[data-act="perform"]').count()) {
        await page.locator('[data-act="perform"]').click();
        await page.locator('[data-act="skip-show"]').click();
      } else if(await page.locator('[data-act="finish-result"]').count())await page.locator('[data-act="finish-result"]').click();
      else throw Error('Unknown group dialog');
    } else {
      await page.locator('[data-act="auto"]').click();
      await page.locator('[data-act="execute"]').click();
      await page.waitForTimeout(25);
    }
  }
  assert.equal(await page.locator('.ending-page').count(),1,'trio can finish through UI');
  await page.screenshot({path:path.join(out,'09-group-ending.png'),fullPage:true});
  // Check every referenced stage/style combination, beyond the initially visible assets.
  const missing=await page.evaluate(async()=>{
    const names=['张函瑞','王橹杰','张桂源','左奇函'],eras=['01_小时候或刚公开','02_中期','03_2026年8月五公'],kinds=['素描小头像','彩绘素描半身立绘','像素小人'];
    const paths=names.flatMap(n=>eras.flatMap(era=>kinds.map((k,i)=>'../'+['TF家族四代_三时期卡通形象',n,`0${i+1}_${k}`,`${n}_${era}_${k}.png`].map(encodeURIComponent).join('/'))));
    return (await Promise.all(paths.map(async u=>({u,ok:(await fetch(u)).ok})))).filter(x=>!x.ok);
  });
  assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
  const filePage=await browser.newPage();
  await filePage.goto('file:///'+path.join(__dirname,'index.html').replaceAll('\\','/'));
  await filePage.locator('[data-act="start"][data-mode="solo"]').click();
  await filePage.locator('.portrait').waitFor();
  assert.ok(await filePage.locator('.portrait').evaluate(img=>img.complete&&img.naturalWidth>0),'direct-file assets load');
  await filePage.close();
  console.log(JSON.stringify({ok:true,soloFinalScores:saved.shows.map(r=>r.score),screenshots:out,assets:36,mobileWidth:390}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
