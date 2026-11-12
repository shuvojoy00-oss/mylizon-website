import { QUESTION_TYPES } from "./question-types.mjs";
import {scoreSingle,scoreMultiChoice,scoreBlanks,scoreReorder,scoreDictation,inspectEssayForm} from "./scoring.mjs";

const $=id=>document.getElementById(id);
const catalog=$("questions"),body=$("task-body"),feedback=$("task-feedback"),actions=$("task-actions");
const demo=new Set(["ra","rs","swt","we","rfib-dropdown","rmcma","rmcsa","rop","wfd"]);
const examples=Object.freeze({
 ra:{passage:"Research into coastal ecosystems reveals how small environmental changes can affect marine biodiversity across entire regions.",description:"Read the passage aloud. A microphone recording is captured in this preview, but acoustic scores are not yet calculated."},
 rs:{sentence:"The seminar on environmental policy begins at nine tomorrow morning.",description:"Listen to the synthetic example sentence and repeat it using your microphone. Real exam audio and pronunciation assessment will be added after validation."},
 swt:{passage:"Cities are increasingly recognising the importance of accessible green spaces. Parks and urban forests can reduce the effect of high temperatures, support wildlife and provide residents with opportunities for physical activity. Researchers have also found that the benefits depend on design and equitable access. A large park located far from residential areas may not improve wellbeing as effectively as smaller green spaces connected to walking routes. Local authorities therefore need to consider both the total area of greenery and how easily different communities can reach it. Long term maintenance is also necessary to preserve the environmental and social value of these spaces."},
 we:{prompt:"Some universities ask students to study subjects outside their main field. Others believe students should focus entirely on their chosen degree. Discuss both approaches and give your opinion."},
 "rfib-dropdown":{parts:["Scientific research often begins with a question, but reliable conclusions depend on careful "," and clear "," of the results. Researchers must also explain the limitations of their findings."],options:[["investigation","imagination","invention"],["communication","competition","calculation"]],answers:["investigation","communication"]},
 rmcma:{passage:"Community libraries play an important role beyond lending books. Many provide quiet study environments, digital resources and public workshops. They also offer support to people who cannot afford internet access at home. However, library services must respond to changing community needs rather than assuming that every visitor wants the same facilities.",question:"Which TWO statements are supported by the passage?",options:[["a","Libraries may provide digital access."],["b","Every visitor comes to borrow printed books."],["c","Library services should consider local needs."],["d","All library workshops require payment."]],correct:["a","c"]},
 rmcsa:{passage:"Coastal mangrove forests can protect shorelines by slowing waves and trapping sediments. They also provide habitats for many marine organisms. Restoring mangroves may be useful, but successful projects must account for suitable soil conditions and tidal patterns.",question:"What is the central message of the passage?",options:[["a","Mangrove restoration succeeds in every location."],["b","Mangroves provide benefits, but restoration depends on local conditions."],["c","Mangroves are useful only for marine biodiversity."],["d","Soil conditions have no effect on restoration."]],correct:"b"},
 rop:{question:"Arrange the statements into a logical paragraph.",pieces:[["a","This information can help city planners identify areas where additional shade is needed."],["b","Researchers first collected temperature measurements from different neighbourhoods."],["c","The measurements revealed that densely built districts were generally warmer."],["d","They then compared the results with maps showing trees and other green areas."]],correct:["b","d","c","a"]},
 wfd:{sentence:"The university library closes earlier during the winter holidays.",description:"Listen once to the synthetic practice sentence and type the words you hear. This sample uses browser speech synthesis, not calibrated examination audio."}
});
let chosen="rfib-dropdown",filter="All",recorder=null,stream=null,audioUrl=null,speechPlayed=false;
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function clearAudio(){try{if(recorder&&recorder.state!=="inactive")recorder.stop();}catch{};stream?.getTracks().forEach(t=>t.stop());stream=null;recorder=null; if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;} if("speechSynthesis" in window)speechSynthesis.cancel();}
function setFeedback(title,text,neutral=false){feedback.hidden=false;feedback.className="feedback"+(neutral?" neutral":"");feedback.replaceChildren(element("strong",null,title),element("div",null,text));}
function resetStage(){clearAudio();speechPlayed=false;body.replaceChildren();feedback.hidden=true;actions.replaceChildren();}
function button(label,handler,kind="primary"){const b=element("button","button "+kind,label);b.type="button";b.addEventListener("click",handler);return b;}
function title(text){body.append(element("p","question-label",text));}
function line(text,cls="instructions"){body.append(element("p",cls,text));}
function passage(text){body.append(element("div","passage",text));}
function addAction(label,handler,kind){actions.append(button(label,handler,kind));}
function renderCatalog(){
 catalog.replaceChildren();
 const visible=QUESTION_TYPES.filter(q=>filter==="All"||q.section===filter);
 $("count").textContent=visible.length+" types";
 for(const q of visible){const b=element("button","question-choice"+(q.id===chosen?" selected":""));b.type="button";b.setAttribute("aria-current",q.id===chosen?"true":"false");
 const desc=element("span");desc.append(element("strong",null,q.title),element("small",null,q.section+" • "+q.itemsInExam.min+(q.itemsInExam.max!==q.itemsInExam.min?"–"+q.itemsInExam.max:"")+" per test"));
 b.append(desc,element("span","mini-status"+(demo.has(q.id)?"":" spec"),demo.has(q.id)?"Try sample":"Specified"));
 b.addEventListener("click",()=>{chosen=q.id;renderCatalog();renderTask();});
 catalog.append(b);}
}
function renderTask(){
 resetStage();const q=QUESTION_TYPES.find(item=>item.id===chosen);
 $("task-title").textContent=q.title;$("task-code").textContent=q.id.toUpperCase();
 $("task-caption").textContent=q.section+" • Skills: "+q.skills.join(" + ");
 if(!demo.has(q.id))return showSpecification(q);
 if(chosen==="rfib-dropdown")return renderDropdown();
 if(chosen==="rmcma"||chosen==="rmcsa")return renderMultiple(chosen);
 if(chosen==="rop")return renderReorder();
 if(chosen==="wfd")return renderDictation();
 if(chosen==="swt"||chosen==="we")return renderWriting(chosen);
 if(chosen==="ra"||chosen==="rs")return renderSpeaking(chosen);
}
function showSpecification(q){
 title("Research verified implementation plan");
 const wrap=element("div","spec-panel");
 wrap.append(element("h3",null,"Scoring and interaction"));
 const dl=element("dl");
 for(const [name,value] of [["Response input",q.input],["Assessment method",q.rule],["Integrated skills",q.skills.join(", ")],["Expert Content review in official live test",q.expertContentReview?"Yes":"No"]]){dl.append(element("dt",null,name),element("dd",null,value.replaceAll("-"," ")));}
 wrap.append(dl,element("div","limited","This task has a verified schema but is not yet a functioning practice component. It will be activated only after its interaction, assets, scoring and tests meet the quality requirements."));
 body.append(wrap);
 addAction("Try a working sample",()=>{chosen="rfib-dropdown";renderCatalog();renderTask();},"secondary");
}
function renderDropdown(){
 const q=examples["rfib-dropdown"];title("Fill the passage gaps");line("Use context and grammar to choose the best word. Each correctly completed gap earns one raw mark.");
 const p=element("div","passage input-line");const selects=[];
 q.parts.forEach((part,i)=>{p.append(document.createTextNode(part));if(i<q.options.length){const select=element("select","gap");select.setAttribute("aria-label","Blank "+(i+1));const placeholder=element("option",null,"Select word");placeholder.value="";select.append(placeholder);for(const word of q.options[i]){const opt=element("option",null,word);opt.value=word;select.append(opt);}selects.push(select);p.append(select);}});
 body.append(p);
 addAction("Check answers",()=>{const r=scoreBlanks(q.answers,selects.map(s=>s.value));setFeedback(r.earned+" / "+r.max+" raw marks",r.matches.map((ok,i)=>(ok?"Blank "+(i+1)+": correct":"Blank "+(i+1)+": review the surrounding context")).join(" • "));});
 addAction("Reset",()=>{selects.forEach(x=>x.value="");feedback.hidden=true;},"secondary");
}
function renderMultiple(id){
 const q=examples[id];title("Read and choose");passage(q.passage);line(q.question,"question-prompt");
 const choices=element("div","choices"),inputs=[];
 for(const [value,label] of q.options){const row=element("label"),input=element("input");input.type=id==="rmcma"?"checkbox":"radio";input.name=id;input.value=value;inputs.push(input);row.append(input,document.createTextNode(label));choices.append(row);}body.append(choices);
 addAction("Check answer",()=>{const chosen=inputs.filter(input=>input.checked).map(input=>input.value);const result=id==="rmcma"?scoreMultiChoice(q.correct,chosen):scoreSingle(q.correct,chosen[0]||"");setFeedback(result.earned+" / "+result.max+" raw marks",id==="rmcma"?"Correct choices earn one each; incorrect selected choices deduct one, with a minimum item score of zero.":"Single answer marking. Review the central claim rather than matching isolated keywords.");});
}
function renderReorder(){
 const q=examples.rop;title("Build the paragraph");line(q.question);
 let order=q.pieces.map(x=>x[0]);const wrapper=element("ol","reorder");body.append(wrapper);
 function draw(){wrapper.replaceChildren();for(let i=0;i<order.length;i++){const id=order[i],text=q.pieces.find(p=>p[0]===id)[1];const li=element("li"),label=element("span",null,text);const up=element("button",null,"↑"),down=element("button",null,"↓");up.type=down.type="button";up.title="Move up";down.title="Move down";up.setAttribute("aria-label","Move statement "+(i+1)+" up");down.setAttribute("aria-label","Move statement "+(i+1)+" down");up.disabled=i===0;down.disabled=i===order.length-1;up.onclick=()=>swap(i,i-1);down.onclick=()=>swap(i,i+1);li.append(label,up,down);wrapper.append(li);}}
 function swap(a,b){[order[a],order[b]]=[order[b],order[a]];draw();feedback.hidden=true;}draw();
 addAction("Check order",()=>{const r=scoreReorder(q.correct,order);setFeedback(r.earned+" / "+r.max+" raw marks","Each correctly ordered adjacent pair earns one mark. A paragraph can receive partial credit without being perfectly ordered.");});
 addAction("Reset",()=>{order=q.pieces.map(p=>p[0]);draw();feedback.hidden=true;},"secondary");
}
function liveEditor(intro){const editor=element("textarea","answer-area");editor.setAttribute("aria-label","Your written response");editor.placeholder="Type your answer here...";body.append(editor);const count=element("div","subrow","0 words");body.append(count);editor.addEventListener("input",()=>{count.textContent=editor.value.trim()?editor.value.trim().split(/\s+/).length+" words":"0 words";feedback.hidden=true;});line(intro);return editor;}
function renderWriting(id){
 const q=examples[id];title(id==="we"?"20 minute essay practice preview":"One sentence summary practice");
 if(id==="swt")passage(q.passage);else line(q.prompt,"question-prompt");
 const editor=liveEditor(id==="swt"?"For SWT, official form requires one complete sentence between 5 and 75 words. Automated sentence validation and content evaluation are not yet enabled.":"Essay form receives full credit for 200–300 words. Content and other traits require an independently calibrated evaluator.");
 addAction("Check writing form",()=>{
  if(id==="we"){const r=inspectEssayForm(editor.value);setFeedback("Essay form: "+r.form+" / 2 raw marks","Word count: "+r.wordCount+". Only published length and obvious formatting checks were evaluated. Content, grammar, coherence, vocabulary and final score are not graded. Manual review may still be required.",true);}
  else{const n=editor.value.trim()?editor.value.trim().split(/\s+/).length:0;setFeedback("Summary form review","Word count: "+n+". "+(n<5||n>75?"Outside the official 5–75 word form range.":"Inside the 5–75 word range, but one complete sentence and Content must still be validated.")+" No AI grade has been generated.",true);}
 });
}
function playSynthetic(text){if(!("speechSynthesis" in window)){setFeedback("Audio unavailable","This browser does not support sample speech synthesis.",true);return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="en-GB";utterance.rate=.91;speechSynthesis.speak(utterance);}
function renderDictation(){
 const q=examples.wfd;title("Listen and type");line(q.description);
 const intro=element("div","mic");intro.append(element("div","mic-indicator","♪"),element("strong",null,"Synthetic sample audio"));body.append(intro);
 const editor=liveEditor("One mark is awarded for each correctly recalled and spelled word. The practice algorithm uses ordered word alignment; it is not Pearson's proprietary method.");
 addAction("Play sample once",()=>{if(speechPlayed)return;speechPlayed=true;playSynthetic(q.sentence);actions.querySelector(".play-once")?.setAttribute("disabled","true");},"secondary");
 actions.lastChild.classList.add("play-once");
 addAction("Check dictation",()=>{const r=scoreDictation(q.sentence,editor.value);setFeedback(r.earned+" / "+r.max+" raw practice marks",r.alignment.missed.length?"Missing or incorrectly ordered: "+r.alignment.missed.map(x=>x.word).join(", "):"All reference words matched in sequence.");});
 addAction("Reset sample",()=>{speechPlayed=false;editor.value="";feedback.hidden=true;renderTask();},"secondary");
}
function renderSpeaking(id){
 const q=examples[id];title(id==="ra"?"Read the text aloud":"Listen and repeat");
 if(id==="ra")passage(q.passage);else{line(q.description);const tip=element("p","passage","This spoken sentence is hidden, as in listening practice. Use Play Sample.");body.append(tip);addAction("Play synthetic sentence",()=>{if(speechPlayed)return;speechPlayed=true;playSynthetic(q.sentence);actions.querySelector(".sample-once")?.setAttribute("disabled","true");},"secondary");actions.lastChild.classList.add("sample-once");}
 if(id==="ra")line(q.description);
 const mic=element("div","mic"),indicator=element("div","mic-indicator","●"),label=element("div","audio-label","No recording yet");
 mic.append(indicator,label);body.append(mic);
 const control=button("Start recording",async()=>{
  if(recorder&&recorder.state==="recording"){recorder.stop();control.textContent="Start recording";return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){setFeedback("Microphone unavailable","Use a current browser with MediaRecorder and microphone permission.",true);return;}
  try{
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   const chunks=[];recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
   recorder.onstop=()=>{stream?.getTracks().forEach(t=>t.stop());stream=null;indicator.classList.remove("recording");label.textContent="Recording captured locally. No speech score has been generated.";const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(blob);const old=mic.querySelector("audio");old?.remove();const player=element("audio","audio-preview");player.controls=true;player.src=audioUrl;mic.append(player);control.textContent="Start recording";setFeedback("Audio captured for preview","The recording has not been uploaded or graded. Authentic pronunciation and fluency evaluation will be enabled only after service integration and accuracy testing.",true);};
   recorder.start();indicator.classList.add("recording");label.textContent="Recording in progress. Select Stop when finished.";control.textContent="Stop recording";
  }catch(error){setFeedback("Microphone permission required","Allow microphone access to use this recording preview.",true);}
 });
 actions.append(control);
}
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{filter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(n=>n.classList.toggle("active",n===b));if(filter!=="All"&&!QUESTION_TYPES.some(q=>q.id===chosen&&q.section===filter)){chosen=QUESTION_TYPES.find(q=>q.section===filter).id;}renderCatalog();renderTask();}));
renderCatalog();renderTask();
