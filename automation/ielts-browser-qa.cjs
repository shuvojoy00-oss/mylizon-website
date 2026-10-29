const { chromium, webkit } = require('playwright');
const fs=require('node:fs');
const lessons=JSON.parse(fs.readFileSync('data/ielts-lessons.json','utf8')).lessons;
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const path=l=>l.id==='ielts-032'?'ielts-true-false-not-given.html':`ielts-lesson-${l.id.slice(-3)}-${slug(l.title)}.html`;
const configurations=[{name:'desktop',engine:chromium,viewport:{width:1440,height:900}},{name:'android_viewport',engine:chromium,viewport:{width:393,height:852},isMobile:true,hasTouch:true},{name:'iphone_webkit_viewport',engine:webkit,viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
(async()=>{
 const output=[];let critical=0;
 for(const config of configurations){
  const browser=await config.engine.launch({headless:true});
  const context=await browser.newContext({viewport:config.viewport,isMobile:!!config.isMobile,hasTouch:!!config.hasTouch});
  for(const lesson of lessons){
   const url='https://www.mylizon.com/'+path(lesson);
   const page=await context.newPage();
   const row={id:lesson.id,viewport:config.name,url,problems:[]};
   page.on('pageerror',error=>row.problems.push('javascript:'+error.message.slice(0,120)));
   try{
    const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:25000});
    if(!response||response.status()!==200)row.problems.push('http:'+response?.status());
    const state=await page.evaluate(()=>{
     const w=document.documentElement.scrollWidth;
     return {scrollWidth:w,innerWidth:window.innerWidth,h1:document.querySelectorAll('h1').length,iframe:!!document.querySelector('iframe[src*="youtube"]'),canonical:!!document.querySelector('link[rel="canonical"]')}
    });
    if(state.scrollWidth>state.innerWidth+5)row.problems.push('horizontal_overflow:'+state.scrollWidth);
    if(state.h1!==1)row.problems.push('h1_count:'+state.h1);
    if(!state.iframe)row.problems.push('no_video');
    if(!state.canonical)row.problems.push('no_canonical');
   }catch(e){row.problems.push('navigation:'+e.message.slice(0,120))}
   if(row.problems.length)critical++;
   output.push(row);await page.close();
  }
  await context.close();await browser.close();
 }
 fs.writeFileSync('ielts-browser-qa-report.json',JSON.stringify({checked:new Date().toISOString(),viewports:configurations.map(x=>x.name),pages:output,failed:critical},null,2));
 console.log('Checks:',output.length,'Failed:',critical);process.exitCode=critical?1:0;
})().catch(e=>{console.error(e);process.exitCode=1});
