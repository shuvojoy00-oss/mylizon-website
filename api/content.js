const {getPool}=require("./_db");const{ensureContentSchema}=require("./_content");
module.exports=async(req,res)=>{if(req.method!=="GET")return res.status(405).json({ok:false,error:"Method not allowed"});
try{await ensureContentSchema();const pool=getPool();await pool.query("update public.content_posts set status='published',updated_at=now() where status='scheduled' and published_at is not null and published_at<=now()");const slug=String(req.query?.slug||"").trim();
const fields=`id,slug,title_bn,title_en,excerpt_bn,excerpt_en,body_bn,body_en,category,content_type,country,keywords,featured,source_url,source_name,source_verified,importance,image_url,image_alt,image_caption,image_credit,resource_key,published_at,updated_at`;
if(slug){const r=await pool.query(`select ${fields} from public.content_posts where slug=$1 and status='published' limit 1`,[slug]);if(!r.rows[0])return res.status(404).json({ok:false,error:"Not found"});return res.json({ok:true,post:r.rows[0]})}
const category=String(req.query?.category||"all"),limit=Math.min(Math.max(Number(req.query?.limit||100),1),100),values=[],where=["status='published'"];
if(["study-abroad","ielts","pte"].includes(category)){values.push(category);where.push(`category=$${values.length}`)}
values.push(limit);const r=await pool.query(`select ${fields} from public.content_posts where ${where.join(" and ")} order by featured desc,published_at desc nulls last,created_at desc limit $${values.length}`,values);
return res.json({ok:true,posts:r.rows})}catch(e){return res.status(500).json({ok:false,error:String(e?.message||e)})}};