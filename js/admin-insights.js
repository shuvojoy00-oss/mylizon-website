(() => {
  const $ = id => document.getElementById(id);
  let token = sessionStorage.getItem("lizonAdminToken") || "";

  async function api(url, opts={}) {
    opts.headers = {...(opts.headers||{}),"Content-Type":"application/json","x-admin-token":token};
    const r=await fetch(url,opts); const d=await r.json();
    if(!r.ok || !d.ok) throw new Error(d.error||"Request failed"); return d;
  }

  async function login(){
    $("login-error").textContent="";
    const r=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("admin-password").value})});
    const d=await r.json();
    if(!d.ok){$("login-error").textContent=d.error||"Login failed";return}
    token=d.token;sessionStorage.setItem("lizonAdminToken",token);showDesk();
  }

  function showDesk(){ $("login-card").hidden=true;$("desk").hidden=false;loadPosts(); }
  if(token) showDesk();
  $("login-btn").addEventListener("click",login);
  $("admin-password").addEventListener("keydown",e=>{if(e.key==="Enter")login()});

  document.querySelector(".toolbar").addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    $("body-bn").focus();
    if(b.dataset.cmd) document.execCommand(b.dataset.cmd,false,null);
    if(b.dataset.block) document.execCommand("formatBlock",false,b.dataset.block);
    if(b.hasAttribute("data-link")){const u=prompt("Link URL");if(u)document.execCommand("createLink",false,u)}
  });

  function payload(){
    return {
      id:Number($("post-id").value)||undefined,
      title_bn:$("title-bn").value.trim(),title_en:$("title-en").value.trim(),
      excerpt_bn:$("excerpt-bn").value.trim(),excerpt_en:$("excerpt-en").value.trim(),
      body_bn:$("body-bn").innerHTML.trim(),body_en:$("body-en").innerHTML.trim(),
      category:$("category").value,content_type:$("content-type").value,status:$("status").value,
      importance:$("importance").value,featured:$("featured-check").checked,
      source_verified:$("verified-check").checked,source_name:$("source-name").value.trim(),
      source_url:$("source-url").value.trim()
    };
  }

  $("post-form").addEventListener("submit",async e=>{
    e.preventDefault();$("save-message").textContent="Saving...";
    try{
      const p=payload(); const editing=!!p.id;
      await api("/api/content-admin",{method:editing?"PATCH":"POST",body:JSON.stringify(p)});
      $("save-message").textContent="Saved.";await loadPosts();if(!editing)clearForm();
    }catch(err){$("save-message").textContent=err.message}
  });

  function clearForm(){
    $("post-id").value="";["title-bn","title-en","excerpt-bn","excerpt-en","source-name","source-url"].forEach(id=>$(id).value="");
    $("body-bn").innerHTML="";$("body-en").innerHTML="";$("category").value="study-abroad";$("content-type").value="news";$("status").value="draft";$("importance").value="useful";$("featured-check").checked=false;$("verified-check").checked=false;
    $("save-message").textContent="";
  }
  $("new-post").addEventListener("click",clearForm);

  async function loadPosts(){
    try{
      const d=await api("/api/content-admin");
      const posts=d.posts||[];
      $("admin-posts").innerHTML=posts.length?posts.map(p=>`<div class="admin-post" data-id="${p.id}"><strong>${p.title_bn}</strong><small class="${p.status==="review"?"review":""}">${p.category} · ${p.status}${p.ai_generated?" · AI":""}</small></div>`).join(""):"<p>No posts yet.</p>";
    }catch(e){$("admin-posts").innerHTML="<p>"+e.message+"</p>"}
  }
  $("refresh-posts").addEventListener("click",loadPosts);

  $("admin-posts").addEventListener("click",async e=>{
    const row=e.target.closest("[data-id]");if(!row)return;
    try{
      const d=await api("/api/content-admin?id="+encodeURIComponent(row.dataset.id));
      const full=d.post;
      $("post-id").value=full.id;$("title-bn").value=full.title_bn||"";$("title-en").value=full.title_en||"";
      $("excerpt-bn").value=full.excerpt_bn||"";$("excerpt-en").value=full.excerpt_en||"";
      $("body-bn").innerHTML=full.body_bn||"";$("body-en").innerHTML=full.body_en||"";
      $("category").value=full.category;$("content-type").value=full.content_type;$("status").value=full.status;
      $("importance").value=full.importance||"useful";$("featured-check").checked=!!full.featured;$("verified-check").checked=!!full.source_verified;
      $("source-name").value=full.source_name||"";$("source-url").value=full.source_url||"";
      $("save-message").textContent=full.ai_generated?"AI generated post loaded for review.":"Post loaded.";
      window.scrollTo({top:0,behavior:"smooth"});
    }catch(err){$("save-message").textContent=err.message}
  });

  $("run-ai").addEventListener("click",async()=>{
    const b=$("run-ai");b.disabled=true;b.textContent="Checking...";
    try{const d=await api("/api/news-run",{method:"POST",body:"{}"});b.textContent=`Done · ${d.saved.length} saved`;await loadPosts()}
    catch(e){b.textContent=e.message}
    finally{setTimeout(()=>{b.disabled=false;b.textContent="Run AI News Check"},3500)}
  });
})();