/* LizOn conversational website guide. Messages stay in this browser tab only.
 * All website answers are sourced from the current public site index.
 */
(()=>{"use strict";
if(document.getElementById("lizonGuide"))return;
const MEMORY="lizon-guest-chat-v2",maxMessages=16;
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!=null)x.textContent=text;return x;};
const root=el("div","lizon-guide");root.id="lizonGuide";
root.innerHTML=`
 <button class="lg-launcher" aria-expanded="false" aria-controls="lgPanel" type="button">
   <span class="lg-launcher-icon" aria-hidden="true">✳</span><span>Ask LizOn</span>
 </button>
 <section class="lg-panel" id="lgPanel" role="dialog" aria-label="Ask LizOn" hidden>
   <header class="lg-header">
     <div class="lg-header-identity"><img src="/assets/logo/lizon-logo.png" width="34" height="34" alt="">
       <div><strong>LizOn</strong><small>Here to guide your next step</small></div></div>
     <div class="lg-header-controls"><button type="button" class="lg-clear" title="Clear chat" aria-label="Clear chat">↺</button><button type="button" class="lg-close" title="Close" aria-label="Close chat">×</button></div>
   </header>
   <div class="lg-history" role="log" aria-live="polite" aria-relevant="additions"></div>
   <section class="lg-suggestions" aria-label="Suggested questions">
    <span>YOU CAN ASK</span>
    <div class="lg-chips">
     <button type="button" data-ask="I want to prepare for IELTS. Where should I start?">IELTS preparation</button>
     <button type="button" data-ask="Show me free PTE classes">Free PTE classes</button>
     <button type="button" data-ask="I want to study in Australia, where can I find the guide?">Study Abroad</button>
     <button type="button" data-ask="Who are LizOn teachers?">Teachers</button>
    </div>
   </section>
   <div class="lg-human"><span>Need a person?</span><a class="lg-human-link" href="https://wa.me/8801611611139" target="_blank" rel="noopener noreferrer">Message our team ↗</a></div>
   <form class="lg-form">
     <label for="lgQuestion" class="lg-sr">Ask LizOn anything</label>
     <textarea id="lgQuestion" rows="1" maxlength="650" placeholder="Type in বাংলা, English or Banglish..." required></textarea>
     <button type="submit" class="lg-send" aria-label="Send message" title="Send message">
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 14-8-4 16-3-6-7-2Z"/><path d="m12 14 7-10"/></svg>
     </button>
   </form>
   <p class="lg-note">Based on public LizOn information. Verify fees, admission and visas with a counselor.</p>
 </section>`;
document.body.append(root);
const $=q=>root.querySelector(q),panel=$(".lg-panel"),launcher=$(".lg-launcher"),history=$(".lg-history"),form=$(".lg-form"),field=$("#lgQuestion"),send=$(".lg-send");
let messages=[],busy=false;
try{const cached=JSON.parse(sessionStorage.getItem(MEMORY)||"[]");if(Array.isArray(cached))messages=cached.filter(m=>["user","assistant"].includes(m.role)&&typeof m.text==="string").slice(-maxMessages);}catch{}
function persist(){try{sessionStorage.setItem(MEMORY,JSON.stringify(messages.slice(-maxMessages)));}catch{}}
function safeLink(link){
 const url=String(link.url||"");
 if(/^\/[a-z0-9/_-]+(?:\.html)?(?:#[a-z0-9_-]+)?$/i.test(url))return url;
 if(/^https:\/\/(?:wa\.me\/8801\d{9}|(?:www\.)?mylizon\.com\/[\w\-./#?=]*)$/i.test(url))return url;
 return null;
}
function bubble(text,role,links=[],save=true){
 const item=el("div","lg-message "+(role==="user"?"lg-user":"lg-assistant"));
 if(role!=="user"){const av=el("div","lg-avatar");const img=document.createElement("img");img.src="/assets/logo/lizon-logo.png";img.alt="";img.width=25;img.height=25;av.append(img);item.append(av);}
 const content=el("div","lg-bubble");const p=el("p",null,text);content.append(p);
 if(links.length&&role!=="user"){
  const box=el("div","lg-links");
  for(const link of links.slice(0,5)){
   const href=safeLink(link);if(!href)continue;
   const a=el("a",null,String(link.title||"View page").slice(0,65)+" ↗");a.href=href;
   if(href.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}
   box.append(a);
  }
  content.append(box);
 }
 item.append(content);history.append(item);history.scrollTop=history.scrollHeight;
 if(save){messages.push({role,text,links:links.map(x=>({title:x.title,url:x.url}))});messages=messages.slice(-maxMessages);persist();}
 return item;
}
function welcome(){
 const initial="Hello! I'm LizOn's website guide. Ask me about IELTS, PTE, our courses, teachers, free classes, or studying abroad. You can write in বাংলা, English or Banglish.";
 bubble(initial,"assistant",[],false);
}
function draw(){
 history.replaceChildren();
 if(!messages.length)welcome();
 else for(const m of messages)bubble(m.text,m.role,m.links||[],false);
}
function toggle(open){panel.hidden=!open;launcher.setAttribute("aria-expanded",String(open));if(open){draw();field.focus();}else launcher.focus();}
function thinking(){const node=el("div","lg-message lg-assistant lg-thinking");const av=el("div","lg-avatar");const img=document.createElement("img");img.src="/assets/logo/lizon-logo.png";img.alt="";img.width=25;img.height=25;av.append(img);
 const dots=el("div","lg-bubble");dots.innerHTML='<span></span><span></span><span></span>';node.append(av,dots);history.append(node);history.scrollTop=history.scrollHeight;return node;}
async function ask(prompt){
 const question=String(prompt||"").trim().slice(0,650);if(!question||busy)return;
 const past=messages.slice(-8).map(m=>({role:m.role,text:m.text}));
 bubble(question,"user");
 field.value="";field.style.height="";
 busy=true;send.disabled=true;
 const load=thinking(),abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),14000);
 try{
  const res=await fetch("/api/lizon-assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:question,history:past}),signal:abort.signal});
  const data=await res.json();
  load.remove();
  if(!res.ok)throw Error(data.error||"Unable to connect");
  if(!data.answer)throw Error("No answer available");
  bubble(data.answer,"assistant",Array.isArray(data.links)?data.links:[]);
 }catch(error){
  load.remove();
  const message="I couldn't search the website right now. Please try again, or contact the LizOn team directly.";
  bubble(message,"assistant",[{title:"Talk to LizOn",url:"https://wa.me/8801611611139"},{title:"Explore Study Abroad",url:"/studyabroad.html"},{title:"IELTS courses",url:"/ielts.html"}]);
 }finally{clearTimeout(timeout);busy=false;send.disabled=false;field.focus();}
}
launcher.addEventListener("click",()=>toggle(panel.hidden));
$(".lg-close").addEventListener("click",()=>toggle(false));
$(".lg-clear").addEventListener("click",()=>{messages=[];persist();draw();field.focus();});
form.addEventListener("submit",e=>{e.preventDefault();ask(field.value);});
field.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();ask(field.value);}});
field.addEventListener("input",()=>{field.style.height="auto";field.style.height=Math.min(field.scrollHeight,110)+"px";});
root.querySelectorAll("[data-ask]").forEach(b=>b.addEventListener("click",()=>ask(b.dataset.ask)));
root.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)toggle(false);});
})();