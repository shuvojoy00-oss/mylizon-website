// LizOn PTE library cross-device smoke checks. No production changes.
const fs=require('fs');
const http=require('http');
const { chromium,webkit,devices }=require('playwright');
const {spawn}=require('child_process');
const lessons=JSON.parse(fs.readFileSync('data/pte-lessons.json','utf8')).lessons.filter(x=>x.status==='published');
const alias={'speaking-2':'pte-describe-image.html','speaking-5':'pte-summarize-group-discussion.html','speaking-6':'pte-respond-to-a-situation.html','reading-1':'pte-reading-fill-in-blanks.html','reading-5':'pte-reading-reorder-paragraphs.html'};
const slug=t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const path=l=>alias[l.id]||'pte-lesson-'+l.id+'-'+slug(l.title)+'.html';
const port=9187;
const server=spawn('python3',['-m','http.server',String(port)],{stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));
let checked=0,failed=[];
async function check(browser,opts,label){
 const ctx=await browser.newContext(opts);
 await ctx.route('**/youtube-nocookie.com/**',r=>r.abort());
 await ctx.route('**/www.youtube-nocookie.com/**',r=>r.abort());
 for(const l of lessons){
  const file=path(l),p=await ctx.newPage();
  try{
   const response=await p.goto('http://127.0.0.1:'+port+'/'+file,{waitUntil:'domcontentloaded',timeout:18000});
   if(!response||response.status()!==200)throw Error('HTTP '+response?.status());
   const h1=await p.locator('h1').first().textContent();
   if(!h1||!h1.trim())throw Error('Missing heading');
   const canonical=await p.locator('link[rel=canonical]').getAttribute('href');
   if(canonical!=='https://www.mylizon.com/'+file)throw Error('Bad canonical: '+canonical);
   if(await p.locator('a[href="/pteclass.html?lesson='+l.id+'"]').count()===0)throw Error('Missing lesson link');
   if(file.startsWith('pte-lesson-')){
    const css=await p.locator('link[href="/css/knowledge-library-pte.css"]').count();
    if(!css)throw Error('Shared CSS missing');
    const wide=await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
    if(wide)throw Error('Horizontal mobile overflow');
    if(!(await p.locator('details summary').first().count()))throw Error('Practice explanation control missing');
   }
   checked++;
  }catch(e){failed.push({device:label,lesson:l.id,path:file,error:String(e.message||e)})}
  finally{await p.close()}
 }
 await ctx.close();
}
(async()=>{
 await sleep(1200);
 const chrome=await chromium.launch({headless:true});
 const safari=await webkit.launch({headless:true});
 try{
 await check(chrome,{viewport:{width:1440,height:900}},'Desktop Chromium');
 await check(chrome,{...devices['Pixel 7']},'Android Pixel');
 await check(safari,{...devices['iPhone 13']},'iPhone WebKit');
 }finally{await chrome.close();await safari.close();server.kill()}
 fs.writeFileSync('pte-library-browser-qa-report.json',JSON.stringify({checked,failed},null,2));
 console.log('PTE lesson-browser checks:',checked,'Failed:',failed.length);
 if(failed.length)console.log(failed.slice(0,25));
 if(failed.length)process.exit(1);
})().catch(e=>{server.kill();console.error(e);process.exit(1)});
