#!/usr/bin/env node
/**
 * Rebuilds the public assistant's website knowledge directly from checked-in
 * HTML and public editorial JSON. No model/API key or paid service required.
 * Automatically run on published website changes via GitHub Actions.
 */
import {readFileSync, readdirSync, writeFileSync, existsSync} from "node:fs";
import {join, basename} from "node:path";
const root=process.cwd(), out=join(root,"data/lizon-knowledge.json");
const skip=/^(admin|login|portal|os|dashboard|verify|test|404|success|thank-you|payment|receipt|staff-admin|edit|news-admin)/i;
const files=readdirSync(root).filter(n=>n.endsWith(".html")&&!skip.test(n)).sort();
function decode(s){return s.replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(parseInt(n,10))).replace(/&(nbsp|amp|quot|apos|lt|gt|hellip|ndash|mdash);/gi,(_,n)=>({nbsp:" ",amp:"&",quot:'"',apos:"'",lt:"<",gt:">",hellip:"…",ndash:"–",mdash:"—"}[n]));}
function clean(html){
 let s=html.replace(/<!--[\s\S]*?-->/g," ")
  .replace(/<(script|style|svg|noscript|template|iframe|nav|footer|form|select|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi," ")
  .replace(/<\w+[^>]*(?:aria-hidden=["']true["']|hidden(?:\s|=|>))[^>]*>[\s\S]*?<\/\w+>/gi," ")
  .replace(/<\/\s*(?:h1|h2|h3|h4|p|section|article|li|div|tr|td|blockquote)\s*>/gi,". ")
  .replace(/<[^>]+>/g," ");
 s=decode(s).replace(/\s+/g," ").replace(/(?:\.\s*){2,}/g,". ").trim();return s;
}
function chunks(text,max=730){
 const sentences=text.match(/[^.!?।\n]+(?:[.!?।]+|$)/g)||[text];
 const out=[];let str="";
 for(const raw of sentences){const s=raw.trim();if(!s)continue;
  if(str&&str.length+s.length>max){out.push(str.trim());str="";}
  if(s.length>max){for(let i=0;i<s.length;i+=max)out.push(s.slice(i,i+max));}
  else str+=(str?" ":"")+s;
 }if(str)out.push(str);return out;
}
const docs=[];
for(const path of files){
 try{
 const html=readFileSync(join(root,path),"utf8");
 if(/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html))continue;
 const title=decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||basename(path,".html").replaceAll("-"," "));
 const description=decode((html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)/i)||[])[1]||"");
 const main=(html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)||[])[1] || (html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)||[])[1] || html;
 const content=clean(main).slice(0,38000);
 const excerpt=chunks((description+". "+content).trim()).slice(0,50);
 for(let i=0;i<excerpt.length;i++)if(excerpt[i].length>=35)docs.push({title,url:"/"+path,part:i,text:excerpt[i]});
 }catch(e){console.error("Skipping page",path,e.message);}
}
const PUBLIC_DATA=/^(studyabroad-(?:countries|intelligence|costs|timelines)|lizon-public-(?:staff|courses|faq))\.json$/;
const dataDir=join(root,"data");
if(existsSync(dataDir))for(const name of readdirSync(dataDir).filter(n=>PUBLIC_DATA.test(n))){
 try{
  const data=JSON.parse(readFileSync(join(dataDir,name),"utf8"));
  const flat=[];
  function flatten(o,depth=0){
   if(flat.length>5000||depth>8)return;
   if(typeof o==="string"&&o.trim().length>=4)flat.push(o.trim());
   else if(typeof o==="number")flat.push(String(o));
   else if(Array.isArray(o))o.forEach(x=>flatten(x,depth+1));
   else if(o&&typeof o==="object")for(const [key,value] of Object.entries(o)){
     if(/^(id|slug|updatedAt|createdAt|image|imageUrl|icon|flag|href|url|link|source|source_url)$/i.test(key))continue;
     if(typeof value==="string"&&value.length<140)flat.push(key+" "+value);else flatten(value,depth+1);
   }
  }
  flatten(data);
  for(const [i,text] of chunks(flat.join(". "),720).slice(0,230).entries())if(text.length>=35)
   docs.push({title:name.replace(".json","").replaceAll("-"," "),url:"/studyabroad.html",part:i,text});
 }catch(e){console.error("Skipping JSON",name,e.message);}
}
writeFileSync(out,JSON.stringify({schema:1,generatedAt:new Date().toISOString(),pageCount:files.length,entries:docs},null,0)+"\n");
console.log("Indexed",files.length,"public pages and",docs.length,"passages =>",out);
