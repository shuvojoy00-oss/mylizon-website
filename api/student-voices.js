const {getPool}=require("./_db");
const seeds=[
["featured-student-story","FEATURED STUDENT STORY","Don't Just Dream, Achieve.","https://youtu.be/aZnXglvvcGo",0],
["student-story","STUDENT STORY","A Story of Success","https://youtu.be/dsmhnjPTOLc",1],
["ielts-reviews","IELTS","Real-Time Student Reviews","https://youtu.be/osQ4Ccz9YhM",2],
["ielts-result","IELTS RESULT","Jannat · Overall 7.5","https://youtu.be/CNtfGdplgok",3]
];
function youtubeId(value){try{const u=new URL(value);const host=u.hostname.toLowerCase().replace(/^www\./,"");let id;if(host==="youtu.be")id=u.pathname.slice(1).split("/")[0];else if(["youtube.com","m.youtube.com","youtube-nocookie.com"].includes(host))id=u.searchParams.get("v")||u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];return /^[a-zA-Z0-9_-]{11}$/.test(id||"")?id:null}catch{return null}}
function auth(req){const token=process.env.ADMIN_TOKEN;if(!token)return false;const cookies=(req.headers.cookie||"").split(";").map(s=>s.trim());const cookie=cookies.find(s=>s.startsWith("lizon_admin="));return (cookie&&decodeURIComponent(cookie.slice(12))===token)||req.headers["x-admin-token"]===token}
async function setup(db){
 await db.query(`CREATE TABLE IF NOT EXISTS voice_categories (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE)`);
 await db.query(`CREATE TABLE IF NOT EXISTS student_voices (id BIGSERIAL PRIMARY KEY, category_id BIGINT REFERENCES voice_categories(id) ON DELETE RESTRICT, title TEXT NOT NULL, youtube_url TEXT NOT NULL, video_id VARCHAR(11) NOT NULL, published BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0, seed_key TEXT UNIQUE, created_at TIMESTAMPTZ DEFAULT NOW())`);
 for(const name of ["IELTS","PTE","Study Abroad","Spoken English","FEATURED STUDENT STORY","STUDENT STORY","IELTS RESULT"])await db.query("INSERT INTO voice_categories(name) VALUES($1) ON CONFLICT(name) DO NOTHING",[name]);
 for(const [key,cat,title,url,order] of seeds)await db.query("INSERT INTO student_voices(seed_key,category_id,title,youtube_url,video_id,sort_order) SELECT $1,id,$3,$4,$5,$6 FROM voice_categories WHERE name=$2 ON CONFLICT(seed_key) DO NOTHING",[key,cat,title,url,youtubeId(url),order]);
}
module.exports=async(req,res)=>{
 res.setHeader("Cache-Control","no-store");
 const admin=auth(req);
 if(req.method!=="GET"&&!admin)return res.status(401).json({ok:false,error:"Sign in required"});
 if(!["GET","POST","PATCH","DELETE"].includes(req.method))return res.status(405).json({ok:false,error:"Method not allowed"});
 try{
 const db=getPool();await setup(db);
 if(req.method==="GET"){const categories=(await db.query("SELECT id,name FROM voice_categories ORDER BY id")).rows;const videos=(await db.query("SELECT v.id,v.title,v.youtube_url,v.video_id,v.published,v.sort_order,v.category_id,c.name AS category FROM student_voices v JOIN voice_categories c ON c.id=v.category_id "+(admin?"":"WHERE v.published=TRUE ")+"ORDER BY v.sort_order ASC,v.id ASC")).rows;return res.json({ok:true,categories,videos})}
 const b=typeof req.body==="string"?JSON.parse(req.body||"{}"):req.body||{};const action=String(b.action||"");
 if(req.method==="POST"&&action==="category"){const name=String(b.name||"").trim().slice(0,70);if(!name)return res.status(400).json({ok:false,error:"Category name required"});await db.query("INSERT INTO voice_categories(name) VALUES($1)",[name]);return res.json({ok:true})}
 if(req.method==="PATCH"&&action==="category"){const name=String(b.name||"").trim().slice(0,70);if(!name)return res.status(400).json({ok:false,error:"Category name required"});const r=await db.query("UPDATE voice_categories SET name=$1 WHERE id=$2 RETURNING id",[name,b.id]);return res.status(r.rowCount?200:404).json({ok:!!r.rowCount})}
 if(req.method==="DELETE"&&action==="category"){const used=await db.query("SELECT COUNT(*)::int AS n FROM student_voices WHERE category_id=$1",[b.id]);if(used.rows[0].n)return res.status(409).json({ok:false,error:"Reassign videos before deleting this category"});await db.query("DELETE FROM voice_categories WHERE id=$1",[b.id]);return res.json({ok:true})}
 if(req.method==="DELETE"&&action==="video"){await db.query("DELETE FROM student_voices WHERE id=$1",[b.id]);return res.json({ok:true})}
 if(["POST","PATCH"].includes(req.method)&&action==="video"){
 const title=String(b.title||"").trim().slice(0,180),url=String(b.youtube_url||"").trim(),videoId=youtubeId(url);
 if(!title||!videoId)return res.status(400).json({ok:false,error:"Enter a title and valid YouTube link"});
 const category=await db.query("SELECT id FROM voice_categories WHERE id=$1",[b.category_id]);if(!category.rowCount)return res.status(400).json({ok:false,error:"Choose a category"});
 const order=Number.isFinite(Number(b.sort_order))?Math.max(-10000,Math.min(10000,Number(b.sort_order))):0;
 if(req.method==="POST")await db.query("INSERT INTO student_voices(category_id,title,youtube_url,video_id,published,sort_order) VALUES($1,$2,$3,$4,$5,$6)",[b.category_id,title,url,videoId,b.published!==false,order]);
 else {const r=await db.query("UPDATE student_voices SET category_id=$1,title=$2,youtube_url=$3,video_id=$4,published=$5,sort_order=$6 WHERE id=$7",[b.category_id,title,url,videoId,b.published!==false,order,b.id]);if(!r.rowCount)return res.status(404).json({ok:false,error:"Video not found"})}
 return res.json({ok:true});
 }
 return res.status(400).json({ok:false,error:"Unknown action"});
 }catch(e){const conflict=e.code==="23505";return res.status(conflict?409:500).json({ok:false,error:conflict?"Category already exists":String(e.message||e)})}
};