/**
 * LizOn PTE deterministic assessment core.
 * Published rule-level raw marks only, not equivalent to proprietary official PTE scores.
 * Source: Pearson PTE Academic Test Taker Score Guide, 2025 updates, checked Oct 2026.
 * No AI calls, no user data, no server dependencies.
 */
function normalizeText(value) { return String(value ?? "").normalize("NFKC").trim().toLowerCase().replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g," "); }

function tokenize(text) { return (normalizeText(text).match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)||[]); }

function scoreSingle(expected, actual) { return {earned:normalizeText(expected)===normalizeText(actual)?1:0,max:1,method:"binary"}; }

function scoreMultiChoice(correct, selected) {
  const c=new Set(correct.map(String)), s=new Set(selected.map(String));
  let positive=0, penalty=0;
  for(const id of s){ if(c.has(id))positive++; else penalty++; }
  return {earned:Math.max(0,positive-penalty),max:c.size,method:"positive-minus-negative-floor-zero",correctSelected:positive,incorrectSelected:penalty};
}

function scoreBlanks(expected, actual) {
  if(!Array.isArray(expected)||!Array.isArray(actual)||expected.length!==actual.length)throw new Error("Gap arrays must match");
  const flags=expected.map((word,i)=>normalizeText(word)===normalizeText(actual[i]));
  return {earned:flags.filter(Boolean).length,max:expected.length,method:"per-correct-gap",matches:flags};
}

function scoreReorder(expected, actual){
  if(!Array.isArray(expected)||!Array.isArray(actual)||actual.length!==expected.length)throw new Error("Paragraph sets must match");
  const e=new Set(expected.map(String)), a=actual.map(String);
  if(e.size!==expected.length || new Set(a).size!==a.length || a.some(id=>!e.has(id)))throw new Error("Invalid paragraph IDs");
  const index=new Map(expected.map((x,i)=>[String(x),i]));
  let earned=0; const matchingPairs=[];
  for(let i=0;i<a.length-1;i++){
    if(index.get(a[i+1])===index.get(a[i])+1){earned++; matchingPairs.push([a[i],a[i+1]]);}
  }
  return {earned,max:Math.max(0,e.size-1),method:"correct-adjacent-pairs",matchingPairs};
}

function alignWords(reference,response){
  const a=tokenize(reference),b=tokenize(response),n=a.length,m=b.length;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=a[i]===b[j]?1+dp[i+1][j+1]:Math.max(dp[i+1][j],dp[i][j+1]);
  const matched=[], missed=[], extra=[]; let i=0,j=0;
  while(i<n&&j<m){
    if(a[i]===b[j]){matched.push({referenceIndex:i,responseIndex:j,word:a[i]});i++;j++;}
    else if(dp[i+1][j]>=dp[i][j+1]){missed.push({index:i,word:a[i]});i++;}
    else{extra.push({index:j,word:b[j]});j++;}
  }
  while(i<n){missed.push({index:i,word:a[i]});i++;}
  while(j<m){extra.push({index:j,word:b[j]});j++;}
  return {matched,missed,extra,totalReferenceWords:n,totalResponseWords:m};
}

function scoreDictation(reference,response) {
  const result=alignWords(reference,response);
  return {earned:result.matched.length,max:result.totalReferenceWords,method:"sequence-aware-exact-spelling",alignment:result,warning:"Practice alignment; not Pearson's undisclosed scoring implementation"};
}

function inspectEssayForm(text,flags={}){
  const count=tokenize(text).length,trimmed=String(text||"").trim();
  const letters=trimmed.replace(/[^a-zA-Z]/g,"");
  const caps=letters.length>0&&letters===letters.toUpperCase();
  const noPunctuation=trimmed.length>0&&!/[.,;:!?]/.test(trimmed);
  const invalid=!!(flags.bulletsOnly||flags.veryShortSentences||caps||noPunctuation);
  const form=invalid||count<120||count>380?0:(count>=200&&count<=300?2:1);
  return {form,maxForm:2,wordCount:count,flags:{allCaps:caps,noPunctuation,bulletsOnly:!!flags.bulletsOnly,veryShortSentences:!!flags.veryShortSentences},requiresInstructorReview:!!flags.veryShortSentences||!!flags.bulletsOnly,method:"published-essay-form-bands"};
}

function inspectSwtForm(text,flags={}){
  const count=tokenize(text).length;
  const sentenceIsValidated=flags.oneCompleteSentence===true;
  const capitalOnly=!!String(text||"").replace(/[^a-zA-Z]/g,"")&&String(text||"").replace(/[^a-zA-Z]/g,"")===String(text||"").replace(/[^a-zA-Z]/g,"").toUpperCase();
  const form=(count>=5&&count<=75&&sentenceIsValidated&&!capitalOnly)?1:0;
  return {form,maxForm:1,wordCount:count,requiresInstructorReview:flags.oneCompleteSentence===undefined,method:"published-SWT-form-conditional-on-sentence-validation"};
}

function inspectSstForm(text,flags={}){
  const count=tokenize(text).length, letters=String(text||"").replace(/[^a-zA-Z]/g,"");
  const allCaps=letters.length>0&&letters===letters.toUpperCase();
  const noPunctuation=String(text||"").trim().length>0&&!/[.,;:!?]/.test(text);
  const invalid=allCaps||noPunctuation||flags.bulletsOnly||flags.veryShortSentences;
  const form=invalid||count<40||count>100?0:(count>=50&&count<=70?2:1);
  return {form,maxForm:2,wordCount:count,requiresInstructorReview:!!flags.veryShortSentences||!!flags.bulletsOnly,method:"published-SST-form-bands"};
}

function scoreRubricTraits(traits,limits,{gateOnContent=false,gateOnForm=false}={}){
  for(const [name,max] of Object.entries(limits)){
    if(!Number.isInteger(max)||max<0)throw Error("Invalid rubric limit");
    if(!Number.isInteger(traits[name])||traits[name]<0||traits[name]>max)throw Error("Invalid trait: "+name);
  }
  const blocked=(gateOnContent&&traits.content===0)||(gateOnForm&&traits.form===0);
  const raw=blocked?0:Object.keys(limits).reduce((sum,k)=>sum+traits[k],0);
  return {earned:raw,max:Object.values(limits).reduce((s,n)=>s+n,0),gateTriggered:blocked,method:"rubric-raw-only-not-pte-10-to-90"};
}

export { normalizeText, tokenize, scoreSingle, scoreMultiChoice, scoreBlanks, scoreReorder, alignWords, scoreDictation, inspectEssayForm, inspectSwtForm, inspectSstForm, scoreRubricTraits };
