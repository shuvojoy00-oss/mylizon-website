import {sb, getSessionUser, getMyProfile} from "../portal/assets/portal.js";
const $ = id => document.getElementById(id);
const allowed = new Set(["admin","super_admin","manager","admissions","admission","counselor"]);
const adminRoles = new Set(["admin","super_admin","manager"]);
const state = { user:null, profile:null, leads:[], staff:[], selected:null, dueOnly:false };
const statuses = {new:"New",contacted:"Contacted",interested:"Interested",consultation:"Consultation",enrolled:"Enrolled",lost:"Lost"};
const interests = {study_abroad:"Study Abroad",ielts:"IELTS",pte:"PTE",spoken:"Spoken English",other:"Other"};
const asText = value => String(value == null || value === "" ? "Not specified" : value);
const money = value => "৳"+Number(value||0).toLocaleString("en-BD",{maximumFractionDigits:0});
const dateText = d => d ? new Date(d.length===10 ? d+"T12:00:00" : d).toLocaleDateString("en-BD",{year:"numeric",month:"short",day:"numeric"}) : "Not set";
const today = () => {const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
function notice(message, error=false){$("notice").textContent=message;$("notice").className=error?"error":"";$("notice").hidden=false;}
function gate(message){$("gate").hidden=false;$("workspace").hidden=true;$("gateMessage").textContent=message;$("signInLink").hidden=false;}
function showWorkspace(){$("gate").hidden=true;$("workspace").hidden=false;}
function isAdmin(){return adminRoles.has(String(state.profile?.role||"").toLowerCase());}
async function start(){
  try{
    const user=await getSessionUser();
    if(!user){gate("Please sign in with an authorized LizOn staff account.");return;}
    const profile=await getMyProfile(user);
    if(!profile||profile.status!=="active"||!allowed.has(String(profile.role||"").toLowerCase())){gate("This area is only for authorized active LizOn admissions staff.");return;}
    state.user=user;state.profile=profile;
    $("signedInAs").textContent=(profile.full_name||user.email)+" · "+profile.role;
    showWorkspace();
    await loadStaff();
    await loadLeads();
  }catch(err){gate("Could not verify workspace access: "+err.message);}
}
async function loadStaff(){
  const {data,error}=await sb.from("profiles").select("id,full_name,email,role,status").eq("status","active").order("full_name").limit(200);
  if(error){state.staff=[{id:state.user.id,full_name:state.profile.full_name||state.user.email,role:state.profile.role}];return;}
  state.staff=(data||[]).filter(p=>allowed.has(String(p.role||"").toLowerCase()));
}
async function loadLeads(){
  const {data,error}=await sb.from("lizon_leads").select("*").order("created_at",{ascending:false}).limit(500);
  if(error){notice("CRM database is not yet ready or access is restricted. An administrator must install os/schema.sql in the existing Supabase project. "+error.message,true);$("leadsList").textContent="CRM setup required.";return;}
  state.leads=data||[];
  if(state.selected&&!state.leads.some(x=>x.id===state.selected))state.selected=null;
  render();
}
function visibleLeads(){
  const q=$("search").value.trim().toLocaleLowerCase();
  const status=$("statusFilter").value;
  return state.leads.filter(l=>{
    if(status&&l.status!==status)return false;
    if(state.dueOnly&&(!l.next_followup||l.next_followup>today()||["enrolled","lost"].includes(l.status)))return false;
    const hay=[l.full_name,l.phone,l.email,l.country,l.course,l.interest].join(" ").toLocaleLowerCase();
    return !q||hay.includes(q);
  });
}
function renderStats(){
  const leads=state.leads;
  $("statTotal").textContent=leads.length+(leads.length===500?"+":"");
  $("statDue").textContent=leads.filter(l=>l.next_followup&&l.next_followup<=today()&&!["enrolled","lost"].includes(l.status)).length;
  $("statInterested").textContent=leads.filter(l=>["interested","consultation"].includes(l.status)).length;
  $("statPaid").textContent=money(leads.reduce((sum,l)=>sum+Number(l.fee_paid_bdt||0),0));
}
function renderList(){
  const records=visibleLeads();const list=$("leadsList");list.replaceChildren();$("resultCount").textContent=records.length;
  if(!records.length){const p=document.createElement("p");p.className="empty";p.textContent="No matching leads yet.";list.append(p);return;}
  for(const lead of records){
    const b=document.createElement("button");b.type="button";b.className="lead-row"+(state.selected===lead.id?" selected":"");
    const top=document.createElement("div");top.className="lead-top";
    const name=document.createElement("strong");name.textContent=lead.full_name;
    const status=document.createElement("span");status.className="state";status.textContent=statuses[lead.status]||lead.status;
    top.append(name,status);
    const bottom=document.createElement("div");bottom.className="lead-bottom";
    const info=document.createElement("span");info.textContent=(interests[lead.interest]||lead.interest)+" · "+(lead.country||lead.course||lead.phone);
    const next=document.createElement("span");
    next.textContent=lead.next_followup?"Due "+dateText(lead.next_followup):"No follow up";
    if(lead.next_followup&&lead.next_followup<=today()&&!["enrolled","lost"].includes(lead.status))next.className="due";
    bottom.append(info,next);b.append(top,bottom);
    b.addEventListener("click",()=>{state.selected=lead.id;render();loadActivities(lead.id);});
    list.append(b);
  }
}
function setField(id,value){$(id).textContent=asText(value);}
function renderDetails(){
  const lead=state.leads.find(l=>l.id===state.selected);
  $("noSelection").hidden=!!lead;$("selectedView").hidden=!lead;
  if(!lead)return;
  setField("detailName",lead.full_name);
  setField("detailContact",[lead.phone,lead.email].filter(Boolean).join(" · "));
  setField("detailInterest",interests[lead.interest]||lead.interest);
  setField("detailSource",lead.source);
  setField("detailCountry",lead.country);
  setField("detailCourse",lead.course);
  setField("detailBudget",lead.budget_bdt==null?"Not specified":money(lead.budget_bdt));
  setField("detailCreated",dateText(lead.created_at));
  $("detailPriority").textContent=lead.priority||"normal";
  $("detailPriority").className="priority "+(lead.priority==="urgent"?"urgent":"");
  $("editStatus").value=lead.status;
  $("editPriority").value=lead.priority;
  $("editFollowup").value=lead.next_followup||"";
  $("editFeeTotal").value=lead.fee_total_bdt??0;
  $("editFeePaid").value=lead.fee_paid_bdt??0;
  $("editNotes").value=lead.notes||"";
  $("editFeeTotal").disabled=!isAdmin();
  $("editFeePaid").disabled=!isAdmin();
  const sel=$("editAssignee");sel.replaceChildren(new Option("Unassigned",""));
  for(const person of state.staff)sel.add(new Option(person.full_name||person.email||"Staff",person.id));
  if(lead.assigned_to&&!state.staff.some(p=>p.id===lead.assigned_to))sel.add(new Option("Assigned staff",lead.assigned_to));
  sel.value=lead.assigned_to||"";
  sel.disabled=!isAdmin();
}
function render(){renderStats();renderList();renderDetails();}
async function loadActivities(leadId){
  const target=$("activityList");target.textContent="Loading activity...";
  const {data,error}=await sb.from("lizon_lead_activity").select("body,kind,created_at").eq("lead_id",leadId).order("created_at",{ascending:false}).limit(50);
  if(state.selected!==leadId)return;
  target.replaceChildren();
  if(error){target.textContent="Could not load activity: "+error.message;return;}
  if(!(data||[]).length){target.textContent="No notes recorded yet.";return;}
  for(const item of data){
    const box=document.createElement("div");box.className="note";
    const small=document.createElement("small");small.textContent=(item.kind||"note")+" · "+dateText(item.created_at);
    const p=document.createElement("p");p.textContent=item.body;
    box.append(small,p);target.append(box);
  }
}
async function addLead(e){
  e.preventDefault();const submit=$("submitLead");submit.disabled=true;
  try{
    const f=new FormData(e.currentTarget), name=String(f.get("full_name")||"").trim(),phone=String(f.get("phone")||"").trim();
    if(!name||!phone)throw Error("Name and phone are required.");
    const number=f.get("budget_bdt");
    const payload={full_name:name,phone,email:String(f.get("email")||"").trim()||null,
      interest:f.get("interest"),source:f.get("source"),priority:f.get("priority"),
      country:String(f.get("country")||"").trim()||null,course:String(f.get("course")||"").trim()||null,
      budget_bdt:number?Number(number):null,next_followup:f.get("next_followup")||null,
      notes:String(f.get("notes")||"").trim()||null,created_by:state.user.id};
    const {data,error}=await sb.from("lizon_leads").insert(payload).select("id").single();
    if(error)throw error;
    $("newLeadDialog").close();e.currentTarget.reset();state.selected=data.id;
    await loadLeads();await loadActivities(data.id);notice("Lead saved securely.");
  }catch(err){notice("Could not create lead: "+err.message,true);}
  finally{submit.disabled=false;}
}
async function saveLead(e){
  e.preventDefault();const lead=state.leads.find(x=>x.id===state.selected);if(!lead)return;
  const btn=$("saveLead");btn.disabled=true;
  try{
    const total=Number($("editFeeTotal").value||0),paid=Number($("editFeePaid").value||0);
    if(isAdmin()&&(total<0||paid<0||paid>total))throw Error("Check total fee and payment amounts.");
    const changes={status:$("editStatus").value,priority:$("editPriority").value,next_followup:$("editFollowup").value||null,
      notes:$("editNotes").value.trim()||null};
    if(isAdmin()){changes.assigned_to=$("editAssignee").value||null;changes.fee_total_bdt=total;changes.fee_paid_bdt=paid;}
    const {data,error}=await sb.from("lizon_leads").update(changes).eq("id",lead.id).select("id").maybeSingle();
    if(error)throw error;if(!data)throw Error("Your account cannot update this lead.");
    await loadLeads();notice("Lead updated."); 
  }catch(err){notice("Could not save changes: "+err.message,true);}
  finally{btn.disabled=false;}
}
async function addActivity(e){
  e.preventDefault();if(!state.selected)return;
  const body=$("activityBody").value.trim();if(!body)return;
  const btn=e.currentTarget.querySelector('button[type="submit"]');btn.disabled=true;
  const {error}=await sb.from("lizon_lead_activity").insert({lead_id:state.selected,kind:"note",body,created_by:state.user.id});
  btn.disabled=false;
  if(error){notice("Could not add note: "+error.message,true);return;}
  $("activityBody").value="";await loadActivities(state.selected);notice("Activity recorded.");
}
function downloadCsv(){
  const cols=["full_name","phone","email","interest","source","country","course","status","priority","next_followup","fee_total_bdt","fee_paid_bdt","created_at"];
  const safe=v=>{let s=String(v??"");if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[cols.join(","),...visibleLeads().map(l=>cols.map(c=>safe(l[c])).join(","))];
  const blob=new Blob(["\ufeff"+rows.join("\r\n")],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="lizon-leads-"+today()+".csv";a.click();URL.revokeObjectURL(url);
}
$("search").addEventListener("input",renderList);
$("statusFilter").addEventListener("change",renderList);
$("addLead").addEventListener("click",()=>$("newLeadDialog").showModal());
$("closeDialog").addEventListener("click",()=>$("newLeadDialog").close());
$("refresh").addEventListener("click",loadLeads);
$("newLeadForm").addEventListener("submit",addLead);
$("updateLeadForm").addEventListener("submit",saveLead);
$("activityForm").addEventListener("submit",addActivity);
$("exportCsv").addEventListener("click",downloadCsv);
$("signOut").addEventListener("click",async()=>{await sb.auth.signOut();location.href="../portal/login.html";});
document.querySelector('a[href="#followups"]').addEventListener("click",()=>{state.dueOnly=true;renderList();});
document.querySelector('a[href="#leads"]').addEventListener("click",()=>{state.dueOnly=false;renderList();});
document.querySelector('a[href="#overview"]').addEventListener("click",()=>{state.dueOnly=false;renderList();});
start();