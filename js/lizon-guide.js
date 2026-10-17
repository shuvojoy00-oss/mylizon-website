/* LizOn Quick Guide v1. Free, deterministic, and private: no API or data collection. */
(()=>{"use strict";
const knowledge=[
  {words:["ielts","writing","speaking","listening","reading","band"],answer:"LizOn offers IELTS preparation, one to one guidance and free lessons. Start with our IELTS course details or explore free IELTS classes.",links:[["IELTS courses","ielts.html"],["Free IELTS classes","ieltsclass.html"]]},
  {words:["pte","pearson"],answer:"Explore LizOn PTE preparation, class topics and free recorded lessons. A counselor can help you choose a suitable learning plan.",links:[["PTE courses","pte.html"],["Free PTE classes","pteclass.html"]]},
  {words:["abroad","study","visa","australia","canada","uk","germany","university","scholarship","দেশ","বিদেশ","ভিসা"],answer:"Your study abroad options depend on academics, English proficiency, budget, institution and intake. Our country guides can help you explore, and the assessment helps organize your profile. Final eligibility needs counselor verification.",links:[["Explore countries","studyabroad.html"],["Check my profile","assessment.html"],["Talk to Study Abroad counselor","https://wa.me/8801608881545"]]},
  {words:["fee","cost","price","discount","offer","টাকা","ফি"],answer:"Course fees and promotions can change. Please contact our team for the current fee, course duration and available class times before paying.",links:[["IELTS courses","ielts.html"],["PTE courses","pte.html"],["Contact admissions","https://wa.me/8801611611139"]]},
  {words:["free","lesson","video","class","practice","মক","ক্লাস"],answer:"You can explore LizOn's free IELTS and PTE learning libraries before selecting a full course.",links:[["IELTS free classes","ieltsclass.html"],["PTE free classes","pteclass.html"]]},
  {words:["address","office","location","where","basabo","ঠিকানা"],answer:"LizOn Education is located at 51 Kazi Office Road, beside Morning Bell School, Buddha Mandir, Basabo, Dhaka 1214.",links:[["Contact admissions","https://wa.me/8801611611139"]]},
  {words:["contact","counselor","call","appointment","admission","ভর্তি","যোগাযোগ"],answer:"You can speak with LizOn Education admissions on 01611 611139. For Study Abroad consultations, contact 01608 881545.",links:[["Admissions WhatsApp","https://wa.me/8801611611139"],["Study Abroad WhatsApp","https://wa.me/8801608881545"]]}
];
const root=document.createElement("div");root.id="lizonGuide";root.className="lizon-guide";root.innerHTML=
  '<button class="lg-launcher" type="button" aria-haspopup="dialog" aria-expanded="false">Ask LizOn <span aria-hidden="true">↗</span></button>'+
  '<section class="lg-panel" role="dialog" aria-label="Ask LizOn quick guide" hidden>'+
  '<header class="lg-header"><div><strong>Ask LizOn</strong><small>Quick Guide • Predefined answers</small></div><button class="lg-close" type="button" aria-label="Close quick guide">×</button></header>'+
  '<div class="lg-history" role="log" aria-live="polite"></div>'+
  '<div class="lg-shortcuts"><button type="button" data-ask="IELTS courses">IELTS</button><button type="button" data-ask="PTE classes">PTE</button><button type="button" data-ask="Study Abroad eligibility">Study Abroad</button><button type="button" data-ask="Course fees">Fees</button></div>'+
  '<form class="lg-form"><label class="lg-sr" for="lgQuestion">Your question</label><input id="lgQuestion" maxlength="200" placeholder="Ask about courses or study abroad..." required><button type="submit" aria-label="Send question">Send</button></form>'+
  '<p class="lg-disclaimer">General guidance only. No personal data is saved. Ask a counselor for verified eligibility, fees or visa requirements.</p></section>';
document.body.append(root);
const launcher=root.querySelector(".lg-launcher"),panel=root.querySelector(".lg-panel"),history=root.querySelector(".lg-history"),input=root.querySelector("input");
function toggle(open){panel.hidden=!open;launcher.setAttribute("aria-expanded",String(open));if(open){if(!history.childElementCount)reply("Welcome to LizOn Education. Choose a topic or ask a question about IELTS, PTE or Study Abroad.",[]);input.focus();}else launcher.focus();}
function reply(message,links,fromUser=false){
  const line=document.createElement("div");line.className="lg-message"+(fromUser?" lg-user":"");
  const p=document.createElement("p");p.textContent=message;line.append(p);
  if(links&&links.length){const refs=document.createElement("div");refs.className="lg-links";for(const [label,href] of links){const a=document.createElement("a");a.href=href;a.textContent=label;if(href.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}refs.append(a);}line.append(refs);}
  history.append(line);history.scrollTop=history.scrollHeight;
}
function answer(q){
  const trimmed=String(q||"").trim().slice(0,200);if(!trimmed)return;
  reply(trimmed,[],true);
  const text=trimmed.toLowerCase();
  const match=knowledge.map((k,i)=>({k,score:k.words.filter(w=>text.includes(w)).length,i})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i)[0]?.k;
  if(match)reply(match.answer,match.links);
  else reply("I can guide you to IELTS, PTE, Study Abroad resources or our counselors. For a personal case, speak with the relevant LizOn team.",[["IELTS courses","ielts.html"],["PTE courses","pte.html"],["Study Abroad","studyabroad.html"],["Talk to LizOn","https://wa.me/8801611611139"]]);
}
launcher.addEventListener("click",()=>toggle(panel.hidden));
root.querySelector(".lg-close").addEventListener("click",()=>toggle(false));
root.querySelector(".lg-form").addEventListener("submit",e=>{e.preventDefault();answer(input.value);input.value="";input.focus();});
root.querySelectorAll("[data-ask]").forEach(b=>b.addEventListener("click",()=>answer(b.dataset.ask)));
root.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)toggle(false);});
})();