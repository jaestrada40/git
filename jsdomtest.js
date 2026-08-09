const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('git-commands.html', 'utf8');

const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  resources: 'usable',
  url: 'file://' + __dirname + '/git-commands.html',
  virtualConsole: (() => {
    const { VirtualConsole } = require('jsdom');
    const vc = new VirtualConsole();
    vc.on('jsdomError', (e) => errors.push('JSDOMERR: ' + e.message));
    vc.on('error', (e) => errors.push('CONSOLEERR: ' + (e.message||e)));
    return vc;
  })()
});

const { window } = dom;

function step(n){
  return new Promise(resolve => {
    setTimeout(() => {
      try {
        // simulate click on step n
        const btn = window.document.querySelectorAll('.step')[n];
        btn.dispatchEvent(new window.Event('click', {bubbles:true}));
      } catch(e){ errors.push('CLICK ERR step '+n+': ' + e.stack); }
      resolve();
    }, 50);
  });
}

(async () => {
  // let initial render + timers fire a bit
  await new Promise(r => setTimeout(r, 200));
  for(let i=0;i<10;i++){
    await step(i);
    await new Promise(r=>setTimeout(r, 150));
  }
  // also let autoplay run through a couple of full cycles via fake timers advancing
  await new Promise(r=>setTimeout(r, 500));
  console.log('DONE. Errors:', errors.length);
  errors.forEach(e => console.log(e));
  process.exit(errors.length ? 1 : 0);
})();

window.onerror = function(msg, src, line, col, err){
  errors.push('WINDOW ONERROR: ' + msg + ' @' + line + ':' + col);
};
