(()=>{
const $=id=>document.getElementById(id);
let countries=[],selectedCountries=[],postsCache=[],activePostStatus="all",currentSlug="";
const esc=s=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const val=id=>$(id).value.trim(),html=id=>$(id).innerHTML.trim();

async function api(url,options={}){
  options.headers={...(options.headers||{}),"Content-Type":"application/json"};
  const r=await fetch(url,{...options,credentials:"same-origin"});
  const d=await r.json().catch(()=>({}));
  if(r.status===401){
    $("desk").hidden=true;$("login-card").hidden=false;$("login-error").textContent="Please sign in again.";
    throw Error("Unauthorized");
  }
  if(!r.ok||!d.ok)throw Error(d.error||"Request failed");
  return d;
}

async function login(){
  const r=await fetch("/api/admin-login",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("admin-password").value})});
  const d=await r.json();
  if(!d.ok){$("login-error").textContent=d.error||"Login failed";return}
  $("login-error").textContent="";$("admin-password").value="";show();
}
async function show(){$("login-card").hidden=true;$("desk").hidden=false;await Promise.all([loadCountries(),load()])}
async function restoreSession(){try{await loadCountries();await load()}catch{return}$("login-card").hidden=true;$("desk").hidden=false}
restoreSession();

const storyHelp={
  news:"News appears in Latest and can be promoted to Important Now or Lead Story based on importance and featured status.",
  "recent-questions":"Used for Recently Reported Questions. It can also appear inside the IELTS or PTE category feed.",
  "problem-solution":"Used for What Students Are Facing and practical problem solving stories.",
  "exam-intelligence":"Used for IELTS or PTE patterns, scoring changes, strategy and exam intelligence.",
  opportunity:"Used for scholarships, funding, admissions and other student opportunities.",
  guide:"Used for evergreen explainers and practical student guides.",
  outlook:"Used for Outlook and Prediction. Predictions must be clearly labelled and should never be presented as confirmed fact.",
  announcement:"Used for important LizOn or official announcements."
};
function updateStoryHelp(){$("story-type-help").textContent=storyHelp[$("content-type").value]||""}
$("content-type").addEventListener("change",updateStoryHelp);updateStoryHelp();
$("login-btn").onclick=login;$("admin-password").addEventListener("keydown",e=>{if(e.key==="Enter")login()});

async function loadCountries(){
  try{countries=await fetch("/data/studyabroad-countries.json",{cache:"no-store"}).then(r=>r.json());renderCountries()}catch{countries=[]}
}
function renderCountries(filter=""){
  const q=filter.trim().toLowerCase();
  $("country-options").innerHTML=countries.filter(c=>!q||c.name.toLowerCase().includes(q)||c.id.toLowerCase().includes(q)).map(c=>{
    const on=selectedCountries.includes(c.id),disabled=!on&&selectedCountries.length>=3;
    return `<label class="country-option ${disabled?"disabled":""}"><input type="checkbox" value="${esc(c.id)}" ${on?"checked":""} ${disabled?"disabled":""}><span>${esc(c.name)}</span></label>`;
  }).join("");
  renderSelectedCountries();
}
function renderSelectedCountries(){
  $("selected-countries").innerHTML=selectedCountries.map(id=>{
    const c=countries.find(x=>x.id===id);
    return `<button type="button" class="country-chip" data-remove-country="${esc(id)}">${esc(c?.name||id)} <span>×</span></button>`;
  }).join("")||'<span class="muted">No country selected</span>';
}
$("country-search").addEventListener("input",e=>renderCountries(e.target.value));
$("country-options").addEventListener("change",e=>{
  if(e.target.type!=="checkbox")return;
  const id=e.target.value;
  if(e.target.checked){if(selectedCountries.length<3&&!selectedCountries.includes(id))selectedCountries.push(id)}
  else selectedCountries=selectedCountries.filter(x=>x!==id);
  renderCountries($("country-search").value);
});
$("selected-countries").addEventListener("click",e=>{
  const b=e.target.closest("[data-remove-country]");if(!b)return;
  selectedCountries=selectedCountries.filter(x=>x!==b.dataset.removeCountry);renderCountries($("country-search").value);
});

document.querySelectorAll(".toolbar").forEach(tb=>tb.onclick=e=>{
  const b=e.target.closest("button");if(!b)return;
  const lang=tb.dataset.toolbar,ed=$(lang==="bn"?"body-bn":"body-en");ed.focus();
  if(b.dataset.cmd)document.execCommand(b.dataset.cmd,false,null);
  if(b.dataset.block)document.execCommand("formatBlock",false,b.dataset.block);
  if(b.hasAttribute("data-link")){const u=prompt("Link URL");if(u)document.execCommand("createLink",false,u)}
});

function payload(statusOverride){
  const status=statusOverride||$("status").value||"draft";
  const scheduleValue=val("schedule-at");
  return{
    id:+$("post-id").value||undefined,
    title_bn:val("title-bn"),title_en:val("title-en"),
    excerpt_bn:val("excerpt-bn"),excerpt_en:val("excerpt-en"),
    body_bn:html("body-bn"),body_en:html("body-en"),
    category:$("category").value,content_type:$("content-type").value,
    country:selectedCountries.join(","),keywords:val("keywords"),
    image_url:val("image-url"),image_alt:val("image-alt"),image_caption:val("image-caption"),image_credit:val("image-credit"),
    source_name:val("source-name"),source_url:val("source-url"),
    status,importance:$("importance").value,featured:$("featured-check").checked,source_verified:$("verified-check").checked,
    publish_at:status==="scheduled"&&scheduleValue?new Date(scheduleValue).toISOString():null
  };
}

async function translateText(text,target,format="text"){
  if(!text)return"";
  $("translation-status").textContent="Generating translation…";
  const d=await api("/api/news-translate",{method:"POST",body:JSON.stringify({text,target,format})});
  $("translation-status").textContent="Translation ready";
  setTimeout(()=>{if($("translation-status").textContent==="Translation ready")$("translation-status").textContent=""},1800);
  return d.translation||"";
}
async function generate(kind,target){
  const source=target==="bn"?"en":"bn";
  const sourceId=kind==="body"?`body-${source}`:`${kind}-${source}`;
  const targetId=kind==="body"?`body-${target}`:`${kind}-${target}`;
  const sourceText=kind==="body"?$(sourceId).innerHTML.trim():$(sourceId).value.trim();
  if(!sourceText){$("translation-status").textContent=`Write the ${source==="bn"?"Bangla":"English"} version first.`;return}
  try{
    const out=await translateText(sourceText,target,kind==="body"?"html":"text");
    if(kind==="body")$(targetId).innerHTML=out;else $(targetId).value=out;
  }catch(e){$("translation-status").textContent="Translation failed: "+e.message}
}
document.querySelectorAll("[data-generate]").forEach(b=>b.onclick=()=>generate(b.dataset.generate,b.dataset.target));

function validateForPublish(p){
  if(!p.title_bn||!p.title_en)throw Error("Generate or add both Bangla and English titles before publishing.");
  if(!p.body_bn||!p.body_en)throw Error("Generate or add both Bangla and English full articles before publishing.");
  if(p.status==="scheduled"){
    if(!p.publish_at)throw Error("Choose a date and time before scheduling.");
    if(new Date(p.publish_at)<=new Date())throw Error("Schedule time must be in the future.");
  }
}
function setBusy(b,label="Working…"){
  ["save-draft","preview-post","schedule-post","publish-now","new-post"].forEach(id=>{if($(id))$(id).disabled=b});
  if(b)$("save-message").textContent=label;
}
async function saveWithStatus(status,showMessage=true){
  const p=payload(status);
  if(!(p.title_bn||p.title_en))throw Error("Add a title in Bangla or English.");
  if(!(p.body_bn||p.body_en))throw Error("Add the article in Bangla or English.");
  if(status==="published"||status==="scheduled")validateForPublish(p);
  const d=await api("/api/content-admin",{method:p.id?"PATCH":"POST",body:JSON.stringify(p)});
  $("post-id").value=d.post.id;
  currentSlug=d.post.slug||currentSlug;
  $("status").value=d.post.status||status;
  if(d.post.published_at&&status==="scheduled")$("schedule-at").value=toLocalInput(d.post.published_at);
  if(showMessage){
    $("save-message").textContent=status==="published"?"Published successfully.":status==="scheduled"?"Scheduled successfully.":"Draft saved.";
  }
  await load();
  return d.post;
}
$("post-form").onsubmit=e=>e.preventDefault();
$("save-draft").onclick=async()=>{try{setBusy(true,"Saving draft…");await saveWithStatus("draft")}catch(e){$("save-message").textContent=e.message}finally{setBusy(false)}};
$("publish-now").onclick=async()=>{try{setBusy(true,"Publishing…");await saveWithStatus("published")}catch(e){$("save-message").textContent=e.message}finally{setBusy(false)}};
$("schedule-post").onclick=async()=>{try{setBusy(true,"Scheduling…");await saveWithStatus("scheduled")}catch(e){$("save-message").textContent=e.message}finally{setBusy(false)}};
$("preview-post").onclick=async()=>{
  try{
    setBusy(true,"Preparing preview…");
    const status=$("status").value||"draft";
    const post=await saveWithStatus(status,false);
    window.open("news-article.html?admin_preview="+encodeURIComponent(post.id),"_blank","noopener");
    $("save-message").textContent="Preview opened.";
  }catch(e){$("save-message").textContent=e.message}finally{setBusy(false)}
};

function clear(){
  $("post-id").value="";currentSlug="";
  ["title-bn","title-en","excerpt-bn","excerpt-en","keywords","image-url","image-alt","image-caption","image-credit","source-name","source-url","schedule-at"].forEach(i=>$(i).value="");
  $("body-bn").innerHTML="";$("body-en").innerHTML="";selectedCountries=[];renderCountries();
  $("status").value="draft";$("importance").value="useful";$("featured-check").checked=false;$("verified-check").checked=false;
  $("save-message").textContent="";$("image-preview-wrap").hidden=true;$("image-preview").removeAttribute("src");
}
$("new-post").onclick=clear;

async function load(){
  const d=await api("/api/content-admin");
  postsCache=d.posts||[];
  renderPosts();
}
function filteredPosts(){
  const q=$("post-search").value.trim().toLowerCase();
  return postsCache.filter(p=>{
    if(activePostStatus!=="all"&&p.status!==activePostStatus)return false;
    if(!q)return true;
    return[p.title_bn,p.title_en,p.category,p.country,p.status].some(v=>String(v||"").toLowerCase().includes(q));
  });
}
function statusLabel(p){
  if(p.status==="scheduled"&&p.published_at)return"Scheduled · "+new Date(p.published_at).toLocaleString();
  return p.status.charAt(0).toUpperCase()+p.status.slice(1);
}
function renderPosts(){
  const list=filteredPosts();
  $("admin-posts").innerHTML=list.map(p=>`<div class="admin-post" data-id="${p.id}"><strong>${esc(p.title_bn||p.title_en||"Untitled")}</strong><small><span class="status-badge status-${esc(p.status)}">${esc(statusLabel(p))}</span> · ${esc(p.category)}${p.country?" · "+esc(p.country.split(",").map(id=>countries.find(c=>c.id===id)?.name||id).join(", ")):""}</small></div>`).join("")||"<p>No posts found.</p>";
}
$("refresh-posts").onclick=load;
$("post-search").addEventListener("input",renderPosts);
document.querySelectorAll("[data-post-status]").forEach(b=>b.onclick=()=>{
  activePostStatus=b.dataset.postStatus;
  document.querySelectorAll("[data-post-status]").forEach(x=>x.classList.toggle("active",x===b));
  renderPosts();
});
function toLocalInput(value){
  if(!value)return"";
  const d=new Date(value),pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
$("admin-posts").onclick=async e=>{
  const r=e.target.closest("[data-id]");if(!r)return;
  const p=(await api("/api/content-admin?id="+r.dataset.id)).post;
  $("post-id").value=p.id;currentSlug=p.slug||"";
  for(const[id,k]of[["title-bn","title_bn"],["title-en","title_en"],["excerpt-bn","excerpt_bn"],["excerpt-en","excerpt_en"],["keywords","keywords"],["image-url","image_url"],["image-alt","image_alt"],["image-caption","image_caption"],["image-credit","image_credit"],["source-name","source_name"],["source-url","source_url"]])$(id).value=p[k]||"";
  $("body-bn").innerHTML=p.body_bn||"";$("body-en").innerHTML=p.body_en||"";
  selectedCountries=String(p.country||"").split(",").map(x=>x.trim()).filter(Boolean).slice(0,3);renderCountries();
  $("category").value=p.category;$("content-type").value=p.content_type;updateStoryHelp();
  $("status").value=p.status||"draft";$("schedule-at").value=p.status==="scheduled"?toLocalInput(p.published_at):"";
  $("importance").value=p.importance||"useful";$("featured-check").checked=!!p.featured;$("verified-check").checked=!!p.source_verified;
  updateImagePreview();$("save-message").textContent="Editing "+statusLabel(p);scrollTo({top:0,behavior:"smooth"});
};

const debounce=(fn,ms=500)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
async function compressImage(file){
  if(file.size>12*1024*1024)throw Error("Please use an image smaller than 12 MB.");
  const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=data});
  const targetW=1600,targetH=900,targetRatio=targetW/targetH,sourceRatio=img.width/img.height;
  let sx=0,sy=0,sw=img.width,sh=img.height;
  if(sourceRatio>targetRatio){sw=img.height*targetRatio;sx=(img.width-sw)/2}else{sh=img.width/targetRatio;sy=(img.height-sh)/2}
  const canvas=document.createElement("canvas");canvas.width=targetW;canvas.height=targetH;
  canvas.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,targetW,targetH);
  return canvas.toDataURL("image/webp",.84);
}
function updateImagePreview(){
  const u=val("image-url");
  if(u){$("image-preview").src=u;$("image-preview-wrap").hidden=false}else{$("image-preview-wrap").hidden=true;$("image-preview").removeAttribute("src")}
}
$("image-file").addEventListener("change",async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{$("translation-status").textContent="Preparing 1600 × 900 cover…";$("image-url").value=await compressImage(file);updateImagePreview();$("translation-status").textContent="Cover ready: 1600 × 900";setTimeout(()=>$("translation-status").textContent="",1800)}
  catch(err){$("translation-status").textContent=err.message}
});
$("image-url").addEventListener("input",debounce(updateImagePreview,500));
$("remove-image").onclick=()=>{$("image-url").value="";$("image-file").value="";updateImagePreview()};
})();