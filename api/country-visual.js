const CITIES={
 australia:"Sydney",newzealand:"Auckland",uk:"London",canada:"Toronto",usa:"New York",ireland:"Dublin",belgium:"Brussels",
 switzerland:"Zurich",denmark:"Copenhagen",finland:"Helsinki",netherlands:"Amsterdam",norway:"Oslo",sweden:"Stockholm",
 france:"Paris",poland:"Warsaw",spain:"Barcelona",austria:"Vienna",croatia:"Zagreb",germany:"Berlin",greece:"Athens",
 italy:"Milan",lithuania:"Vilnius",estonia:"Tallinn",hungary:"Budapest",malta:"Valletta",india:"New Delhi",china:"Shanghai",
 turkey:"Istanbul",uae:"Dubai",latvia:"Riga",romania:"Bucharest",czech:"Prague",portugal:"Lisbon",slovenia:"Ljubljana",
 serbia:"Belgrade",slovakia:"Bratislava",bulgaria:"Sofia",singapore:"Singapore",qatar:"Doha","saudi-arabia":"Riyadh",
 thailand:"Bangkok",japan:"Tokyo",southkorea:"Seoul"
};
const NAMES={
 australia:"Australia",newzealand:"New Zealand",uk:"United Kingdom",canada:"Canada",usa:"United States",ireland:"Ireland",
 belgium:"Belgium",switzerland:"Switzerland",denmark:"Denmark",finland:"Finland",netherlands:"Netherlands",norway:"Norway",
 sweden:"Sweden",france:"France",poland:"Poland",spain:"Spain",austria:"Austria",croatia:"Croatia",germany:"Germany",
 greece:"Greece",italy:"Italy",lithuania:"Lithuania",estonia:"Estonia",hungary:"Hungary",malta:"Malta",india:"India",
 china:"China",turkey:"Türkiye",uae:"United Arab Emirates",latvia:"Latvia",romania:"Romania",czech:"Czech Republic",
 portugal:"Portugal",slovenia:"Slovenia",serbia:"Serbia",slovakia:"Slovakia",bulgaria:"Bulgaria",singapore:"Singapore",
 qatar:"Qatar","saudi-arabia":"Saudi Arabia",thailand:"Thailand",japan:"Japan",southkorea:"South Korea"
};
const TYPE_TERMS={
 hero:(city,country)=>`${city} ${country} city university students`,
 profile:(city,country)=>`${country} university students campus`,
 study:(city,country)=>`${country} university campus students`,
 money:(city,country)=>`${city} student housing university`,
 visa:(city,country)=>`${city} airport terminal travel`,
 work:(city,country)=>`${city} students cafe work city`,
 after:(city,country)=>`${country} university graduation students`,
 arrival:(city,country)=>`${city} airport arrival terminal`,
 cities:(city,country)=>`${city} ${country} city street people`
};
const bad=/\b(flag|map|coat of arms|logo|seal|diagram|icon|svg|locator|blank|emblem|poster|stamp|coin|banknote)\b/i;
const strip=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim();
module.exports=async(req,res)=>{
 if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});
 const country=String(req.query?.country||"").trim().toLowerCase();
 const type=String(req.query?.type||"hero").trim().toLowerCase();
 const city=CITIES[country],name=NAMES[country];
 if(!city||!name)return res.status(400).json({ok:false,error:"Unknown destination"});
 const build=TYPE_TERMS[type]||TYPE_TERMS.hero;
 const q=build(city,name);
 const params=new URLSearchParams({
  action:"query",format:"json",origin:"*",generator:"search",gsrsearch:q,gsrnamespace:"6",gsrlimit:"16",
  prop:"imageinfo",iiprop:"url|size|mime|extmetadata",iiurlwidth:"1600"
 });
 try{
  const r=await fetch("https://commons.wikimedia.org/w/api.php?"+params.toString(),{
   headers:{"user-agent":"LizOnEducation/1.0 (study-abroad visual selector)","accept":"application/json"},
   signal:AbortSignal.timeout(10000)
  });
  if(!r.ok)throw new Error("Commons "+r.status);
  const j=await r.json();
  const pages=Object.values(j?.query?.pages||{});
  const scored=pages.map(p=>{
    const i=p.imageinfo?.[0],title=String(p.title||"").replace(/^File:/,"");
    if(!i||bad.test(title))return null;
    if(!/^image\/(jpeg|png|webp)$/i.test(i.mime||""))return null;
    const w=Number(i.width||0),h=Number(i.height||0);
    if(w<700||h<450)return null;
    let score=0;
    const low=title.toLowerCase(),ql=q.toLowerCase();
    if(low.includes(city.toLowerCase()))score+=8;
    if(low.includes(name.toLowerCase()))score+=6;
    if(type==="study"&&/univers|campus|student/.test(low))score+=6;
    if(type==="visa"||type==="arrival"){if(/airport|terminal|travel/.test(low))score+=6;}
    if(type==="after"&&/graduat|commencement|student/.test(low))score+=6;
    if(type==="money"&&/student|housing|residence|dorm/.test(low))score+=5;
    if(type==="work"&&/student|cafe|coffee|office|work/.test(low))score+=4;
    if(type==="cities"&&/city|street|skyline|center|centre/.test(low))score+=4;
    score+=Math.min(4,w/1200);
    return {p,i,title,score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score);
  const best=scored[0];
  if(!best)return res.status(404).json({ok:false,error:"No suitable photograph found"});
  const md=best.i.extmetadata||{};
  const data={
   ok:true,country,type,city,
   image:best.i.thumburl||best.i.url,
   original:best.i.descriptionurl||best.i.url,
   title:best.title,
   credit:strip(md.Artist?.value||"Wikimedia Commons contributor"),
   license:strip(md.LicenseShortName?.value||md.UsageTerms?.value||"Wikimedia Commons"),
   source:"Wikimedia Commons"
  };
  res.setHeader("Cache-Control","s-maxage=604800, stale-while-revalidate=2592000");
  return res.json(data);
 }catch(e){
  return res.status(502).json({ok:false,error:String(e?.message||e)});
 }
};