const { getPool } = require("./_db");
module.exports = async (req,res) => {
  if(req.method !== "GET") return res.status(405).json({ok:false,error:"Method not allowed"});
  try {
    const pool=getPool();
    const r=await pool.query(`
      select slug,title_en,published_at,
        (published_at >= ((date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka') + interval '19 hours')) as after_schedule
      from public.content_posts
      where status='published' and ai_generated=true
        and published_at >= (date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka')
        and published_at < ((date_trunc('day', now() at time zone 'Asia/Dhaka') + interval '1 day') at time zone 'Asia/Dhaka')
      order by published_at desc limit 1
    `);
    const coverage=await pool.query(`select distinct category from public.content_posts where status='published' and ai_generated=true and published_at >= ((date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka') + interval '19 hours') and published_at < ((date_trunc('day', now() at time zone 'Asia/Dhaka') + interval '1 day') at time zone 'Asia/Dhaka')`);
    const categories=coverage.rows.map(row=>row.category);
    res.setHeader("Cache-Control","no-store");
    return res.json({ok:true,timezone:"Asia/Dhaka",published_today:r.rowCount>0,published_after_schedule:r.rows[0]?.after_schedule===true,categories_after_schedule:categories,all_three_published:["study-abroad","ielts","pte"].every(category=>categories.includes(category)),latest:r.rows[0]||null});
  }catch(e){return res.status(503).json({ok:false,error:"News publication status unavailable"});}
};