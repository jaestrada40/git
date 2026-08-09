const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({width:1280, height:900});
  const errors = [];
  page.on('console', msg => { if(msg.type()==='error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGEERROR: '+err.message));
  await page.goto('file://' + __dirname + '/git-commands.html');
  await page.waitForTimeout(1000);
  await page.screenshot({path:'shot_step1.png'});
  // click step 3 (index 2, git add)
  const steps = await page.$$('.step');
  await steps[2].click();
  await page.waitForTimeout(700);
  await page.screenshot({path:'shot_step3.png'});
  await steps[4].click(); // branch
  await page.waitForTimeout(700);
  await page.screenshot({path:'shot_branch.png'});
  await steps[5].click(); // switch
  await page.waitForTimeout(700);
  await page.screenshot({path:'shot_switch.png'});
  await steps[6].click(); // merge
  await page.waitForTimeout(700);
  await page.screenshot({path:'shot_merge.png'});
  await steps[7].click(); // stash
  await page.waitForTimeout(900);
  await page.screenshot({path:'shot_stash.png'});
  await steps[9].click(); // push
  await page.waitForTimeout(700);
  await page.screenshot({path:'shot_push.png'});
  console.log('ERRORS:', JSON.stringify(errors));
  await browser.close();
})();
