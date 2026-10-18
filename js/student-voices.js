(() => {
const track=document.getElementById("voices-track"),prev=document.getElementById("voices-prev"),next=document.getElementById("voices-next");
if(!track)return;
let timer=null,hovered=false,visible=true,interactionUntil=0,resumeTimer=null;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
function stop(){if(timer){clearInterval(timer);timer=null}}
function interval(){stop();if(hovered||Date.now()<interactionUntil||!visible||reduced.matches||track.children.length<2||document.hidden)return;timer=setInterval(()=>move(1),2200)}
function manual(){interactionUntil=Date.now()+3500;stop();clearTimeout(resumeTimer);resumeTimer=setTimeout(interval,3600)}
function move(direction){const first=track.querySelector(".voices-carousel__card");if(!first)return;const gap=parseFloat(getComputedStyle(track).gap)||18;const step=first.getBoundingClientRect().width+gap;const end=track.scrollWidth-track.clientWidth;if(end<2)return;let target=track.scrollLeft+direction*step;if(target>end+3)target=0;if(target<0)target=end;track.scrollTo({left:target,behavior:reduced.matches?"auto":"smooth"})}
prev.addEventListener("click",()=>{manual();move(-1)});next.addEventListener("click",()=>{manual();move(1)});

track.addEventListener("mouseenter",()=>{hovered=true;stop()});track.addEventListener("mouseleave",()=>{hovered=false;interval()});
track.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")manual()});
track.addEventListener("wheel",manual,{passive:true});track.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight"].includes(e.key))manual()});
document.addEventListener("visibilitychange",interval);
reduced.addEventListener?.("change",interval);
if("IntersectionObserver" in window){new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;interval()},{threshold:.1}).observe(track)}
function make(v){const card=document.createElement("button");card.type="button";card.className="voices-carousel__card video-card";card.setAttribute("aria-label","Play "+v.title);const img=document.createElement("img");img.src="https://img.youtube.com/vi/"+v.video_id+"/hqdefault.jpg";img.alt="";img.loading="lazy";const shade=document.createElement("span");shade.className="video-card__shade";const play=document.createElement("span");play.className="video-card__small-play";play.textContent="▶";play.setAttribute("aria-hidden","true");const meta=document.createElement("span");meta.className="video-card__meta";const cat=document.createElement("small");cat.textContent=v.category;const title=document.createElement("strong");title.textContent=v.title;meta.append(cat,title);card.append(img,shade,play,meta);card.addEventListener("click",()=>{manual();if(typeof openVideo==="function")openVideo(v.youtube_url)});return card}
async function load(){try{const r=await fetch("/api/student-voices",{cache:"no-store"});if(!r.ok)throw Error("Unable to load student videos");const data=await r.json();if(!data.ok)throw Error(data.error||"Unable to load student videos");track.replaceChildren(...data.videos.map(make));if(!data.videos.length)track.textContent="Student stories are coming soon.";interval()}catch(e){track.textContent="Student stories are temporarily unavailable.";console.error(e)}}
load();
})();