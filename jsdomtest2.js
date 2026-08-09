const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('git-commands.html', 'utf8');

const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => errors.push('JSDOMERR: ' + e.message));

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  resources: 'usable',
  url: 'file://' + __dirname + '/git-commands.html',
  virtualConsole: vc
});

const { window } = dom;
window.HTMLElement.prototype.scrollIntoView = function(){};

window.onerror = function(msg, src, line, col, err){
  errors.push('WINDOW ONERROR: ' + msg + ' @' + line + ':' + col);
};

function clickStep(n){
  const btn = window.document.querySelectorAll('.step')[n];
  btn.dispatchEvent(new window.Event('click', {bubbles:true}));
}

(async () => {
  await new Promise(r => setTimeout(r, 200));
  for(let i=0;i<10;i++){
    clickStep(i);
    await new Promise(r=>setTimeout(r, 200));
    // basic state assertions
    const d = window.document;
    const activeCount = d.querySelectorAll('.step.active').length;
    if(activeCount !== 1) errors.push(`step ${i}: expected 1 active, got ${activeCount}`);
    const cmdText = d.getElementById('termCmd').textContent;
    if(!cmdText || cmdText.length < 3) errors.push(`step ${i}: termCmd empty/short: "${cmdText}"`);
  }
  // rapid clicks to stress race conditions (stash -> push quickly)
  clickStep(7); // stash
  await new Promise(r=>setTimeout(r, 30));
  clickStep(9); // push immediately (before pocket badge timeout fires)
  await new Promise(r=>setTimeout(r, 600));

  // let autoplay run through full loop from wherever it is
  await new Promise(r=>setTimeout(r, 4600));

  console.log('DONE. Errors:', errors.length);
  errors.forEach(e => console.log(' -', e));
  process.exit(errors.length ? 1 : 0);
})();
