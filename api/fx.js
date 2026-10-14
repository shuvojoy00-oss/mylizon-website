const cache=new Map();
module.exports=async(req,res)=>{
  if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});
  const base=String(req.query?.base||"").trim().toUpperCase();
  if(!/^[A-Z]{3}$/.test(base))return res.status(400).json({ok:false,error:"Invalid currency"});
  if(base==="BDT")return res.json({ok:true,base:"BDT",rate:1,source:"direct",updated_at:new Date().toISOString()});
  const hit=cache.get(base);
  if(hit&&Date.now()-hit.time<6*60*60*1000)return res.json(hit.data);
  const urls=[
    `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`,
    `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(base)}`
  ];
  let last;
  for(const url of urls){
    try{
      const r=await fetch(url,{headers:{"accept":"application/json"},signal:AbortSignal.timeout(8000)});
      if(!r.ok)throw new Error("FX upstream "+r.status);
      const j=await r.json();
      const rate=Number(j?.rates?.BDT);
      if(!Number.isFinite(rate)||rate<=0)throw new Error("BDT rate unavailable");
      const data={ok:true,base,rate,source:new URL(url).hostname,updated_at:j.time_last_update_utc||j.date||new Date().toISOString()};
      cache.set(base,{time:Date.now(),data});
      res.setHeader("Cache-Control","s-maxage=21600, stale-while-revalidate=86400");
      return res.json(data);
    }catch(e){last=e}
  }
  return res.status(502).json({ok:false,error:String(last?.message||last||"FX unavailable")});
};