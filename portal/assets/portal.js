// /portal/assets/portal.js
import { createClient } from "./supabase.js";
import { COURSES, COURSE_TEACHER_DEFAULTS, formatBatch } from "./config.js";

const sb = createClient();

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

export async function getSession() {
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function requireAuth(allowedRoles) {
  const session = await getSession();
  if (!session) {
    location.href = "./login.html";
    return null;
  }

  // fetch profile
  const { data: profile, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    // If profile missing, block cleanly
    console.error(error);
    alert("Your portal profile is not ready yet. Contact LizOn admin.");
    await sb.auth.signOut();
    location.href = "./login.html";
    return null;
  }

  if (profile.status !== "active") {
    alert("Your access is blocked/inactive. Contact LizOn admin.");
    await sb.auth.signOut();
    location.href = "./login.html";
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    alert("Access denied for your role.");
    // redirect by role
    if (profile.role === "student") location.href = "./student.html";
    else if (profile.role === "teacher") location.href = "./teacher.html";
    else location.href = "./admin.html";
    return null;
  }

  return { session, profile };
}

export async function logout() {
  await sb.auth.signOut();
  location.href = "./login.html";
}

export function bindTopbar(profile) {
  const nameEl = qs("#topbarName");
  const roleEl = qs("#topbarRole");
  if (nameEl) nameEl.textContent = profile.full_name || "User";
  if (roleEl) roleEl.textContent = profile.role.replace("_", " ");
  const logoutBtn = qs("#btnLogout");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  const installBtn = qs("#btnInstall");
  if (installBtn) setupInstallButton(installBtn);
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function setupInstallButton(btn){
  btn.addEventListener("click", async () => {
    // If browser supports install prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
      return;
    }
    // Otherwise show simple instructions
    alert(
      "To add portal to your home screen:\n\n" +
      "iPhone (Safari): Share → Add to Home Screen\n" +
      "Android (Chrome): Menu → Add to Home screen / Install app\n"
    );
  });
}

/* ---------------- Student Dashboard ---------------- */

export async function loadStudentDashboard(profile) {
  const cardsEl = qs("#studentCards");
  const annEl = qs("#announcements");
  if (!cardsEl) return;

  // Announcements (global + role + course optional)
  const { data: anns } = await sb
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  annEl.innerHTML = (anns || []).length
    ? anns.map(a => `<div class="notice" style="margin-bottom:10px;">
        <div style="font-weight:800; margin-bottom:4px;">${escapeHtml(a.title)}</div>
        <div class="mini">${escapeHtml(a.body || "")}</div>
      </div>`).join("")
    : `<div class="mini">No announcements yet.</div>`;

  // Enrollments for this student (group courses)
  const { data: enrolls, error: e1 } = await sb
    .from("enrollments")
    .select("id, course, batch_month, status, meet_link, notes_link, homework_link, recordings_link, practice_link, teacher_name")
    .eq("student_id", profile.id)
    .order("batch_month", { ascending: false });

  if (e1) throw e1;

  // 1:1 room (optional)
  const { data: oneOnOnes } = await sb
    .from("one_on_one_rooms")
    .select("id, status, meet_link, notes_link, homework_link, recordings_link, teacher_name, label")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false });

  const items = [
    ...(enrolls || []).map(x => ({ type: "group", ...x })),
    ...(oneOnOnes || []).map(x => ({ type: "1:1", course: "1:1", ...x }))
  ];

  cardsEl.innerHTML = items.length
    ? items.map(item => renderCourseCard(item)).join("")
    : `<div class="mini">No active courses yet. Contact LizOn admin.</div>`;

  // bind buttons
  qsa("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const url = btn.getAttribute("data-open");
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
}

function renderCourseCard(item) {
  const isExpired = item.status === "expired";
  const badge = isExpired
    ? `<span class="badge badgeExpired">Expired</span>`
    : `<span class="badge badgeLive">Active</span>`;

  const title = item.type === "1:1"
    ? `1:1 — ${escapeHtml(item.label || "Private Classroom")}`
    : `${escapeHtml(item.course)} — ${escapeHtml(formatBatch(item.batch_month || ""))}`;

  const teacher = item.teacher_name || COURSE_TEACHER_DEFAULTS[item.course] || "Assigned Teacher";

  return `
    <div class="card half">
      <div class="row">
        <div>
          <div class="h1">${title}</div>
          <div class="mini">Teacher: <b>${escapeHtml(teacher)}</b></div>
        </div>
        ${badge}
      </div>
      <div class="hr"></div>
      <div class="row">
        <button class="btn btnPrimary" ${isExpired ? "disabled" : ""} data-open="${escapeAttr(item.meet_link)}">Join Live Class</button>
        <button class="btn" data-open="${escapeAttr(item.notes_link)}">Notes</button>
        <button class="btn" ${isExpired ? "disabled" : ""} data-open="${escapeAttr(item.homework_link)}">Submit Homework</button>
        <button class="btn" data-open="${escapeAttr(item.recordings_link)}">Recordings</button>
        ${item.practice_link ? `<button class="btn" ${isExpired ? "disabled" : ""} data-open="${escapeAttr(item.practice_link)}">Practice</button>` : ""}
      </div>
      <div style="margin-top:10px" class="mini">
        Tip: Use laptop for class, phone as backup. Mic muted unless speaking.
      </div>
    </div>
  `;
}

/* ---------------- Teacher Dashboard ---------------- */

export async function loadTeacherDashboard(profile) {
  const listEl = qs("#teacherList");
  if (!listEl) return;

  // Group enrollments where teacher_email matches profile email (or teacher_id matches)
  const { data: classes, error } = await sb
    .from("enrollments")
    .select("course, batch_month, status, meet_link, notes_link, homework_link, recordings_link, practice_link, teacher_name")
    .eq("teacher_id", profile.id)
    .order("batch_month", { ascending: false });

  if (error) throw error;

  // 1:1 rooms assigned to teacher
  const { data: rooms, error: e2 } = await sb
    .from("one_on_one_rooms")
    .select("id, student_id, status, meet_link, notes_link, homework_link, recordings_link, teacher_name, label")
    .eq("teacher_id", profile.id)
    .order("created_at", { ascending: false });

  if (e2) throw e2;

  const groupRows = (classes || []).map(c => `
    <tr>
      <td><b>${escapeHtml(c.course)}</b></td>
      <td>${escapeHtml(formatBatch(c.batch_month || ""))}</td>
      <td>${escapeHtml(c.status)}</td>
      <td>
        ${linkBtn("Meet", c.meet_link)}
        ${linkBtn("Notes", c.notes_link)}
        ${linkBtn("HW", c.homework_link)}
        ${linkBtn("Rec", c.recordings_link)}
        ${c.practice_link ? linkBtn("Practice", c.practice_link) : ""}
      </td>
    </tr>
  `).join("");

  const oneRows = (rooms || []).map(r => `
    <tr>
      <td><b>1:1</b></td>
      <td>${escapeHtml(r.label || "Private")}</td>
      <td>${escapeHtml(r.status)}</td>
      <td>
        ${linkBtn("Meet", r.meet_link)}
        ${linkBtn("Notes", r.notes_link)}
        ${linkBtn("HW", r.homework_link)}
        ${linkBtn("Rec", r.recordings_link)}
      </td>
    </tr>
  `).join("");

  listEl.innerHTML = `
    <div class="card">
      <div class="h1">My Classes</div>
      <p class="p">Only the classes assigned to you appear here.</p>
      <div class="hr"></div>

      <div class="h1" style="font-size:16px;">Group Batches</div>
      <table class="table" style="margin-top:10px;">
        <thead><tr><th>Course</th><th>Batch</th><th>Status</th><th>Links</th></tr></thead>
        <tbody>
          ${groupRows || `<tr><td colspan="4" class="mini">No group batches assigned yet.</td></tr>`}
        </tbody>
      </table>

      <div class="hr"></div>

      <div class="h1" style="font-size:16px;">1-on-1 Students</div>
      <table class="table" style="margin-top:10px;">
        <thead><tr><th>Type</th><th>Label</th><th>Status</th><th>Links</th></tr></thead>
        <tbody>
          ${oneRows || `<tr><td colspan="4" class="mini">No 1-on-1 students assigned yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  qsa("[data-open]").forEach(btn => btn.addEventListener("click", () => window.open(btn.dataset.open, "_blank", "noopener,noreferrer")));
}

function linkBtn(label, url){
  if (!url) return "";
  return `<button class="btn" style="padding:6px 10px; margin:2px;" data-open="${escapeAttr(url)}">${label}</button>`;
}

/* ---------------- Admin Dashboard ---------------- */

export async function loadAdminDashboard(profile) {
  const role = profile.role;
  if (!["admin", "super_admin"].includes(role)) return;

  // Fill course select
  const courseSel = qs("#course");
  if (courseSel) {
    courseSel.innerHTML = COURSES.map(c => `<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join("");
  }

  // Populate teacher select (from profiles)
  const { data: teachers } = await sb
    .from("profiles")
    .select("id, full_name, email, role, status")
    .in("role", ["teacher", "admin", "super_admin"])
    .eq("status", "active")
    .order("role", { ascending: true });

  const teacherSel = qs("#teacher");
  if (teacherSel) {
    teacherSel.innerHTML = `<option value="">Auto (by course default)</option>` +
      (teachers || []).map(t => `<option value="${t.id}">${escapeHtml(t.full_name || t.email)} — ${escapeHtml(t.role)}</option>`).join("");
  }

  // Bind create enrollment
  const form = qs("#enrollForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const studentEmail = qs("#studentEmail").value.trim().toLowerCase();
      const course = qs("#course").value;
      const batch = qs("#batch").value.trim();
      const teacherId = qs("#teacher").value || null;

      const meet = qs("#meetLink").value.trim();
      const notes = qs("#notesLink").value.trim();
      const hw = qs("#hwLink").value.trim();
      const rec = qs("#recLink").value.trim();
      const practice = qs("#practiceLink").value.trim();

      if (!studentEmail || !course) return alert("Student email and course are required.");
      if (course !== "1:1" && !batch) return alert("Batch month required for group courses. Example: 2026-01");

      // find student profile by email
      const { data: student, error: es } = await sb
        .from("profiles")
        .select("id, email, role")
        .eq("email", studentEmail)
        .single();

      if (es || !student) return alert("Student not found in profiles. Create the user first in Supabase Auth, then insert profile row.");

      if (course === "1:1") {
        // create 1:1 room
        const defaultTeacherName = COURSE_TEACHER_DEFAULTS["1:1"] || "Teacher";
        const teacher = teacherId ? (teachers || []).find(t => t.id === teacherId) : null;

        const payload = {
          student_id: student.id,
          teacher_id: teacher ? teacher.id : null,
          teacher_name: teacher ? (teacher.full_name || teacher.email) : defaultTeacherName,
          label: `1:1 — ${studentEmail}`,
          status: "active",
          meet_link: meet || null,
          notes_link: notes || null,
          homework_link: hw || null,
          recordings_link: rec || null
        };

        const { error: eIns } = await sb.from("one_on_one_rooms").insert(payload);
        if (eIns) {
          console.error(eIns);
          return alert("Failed to create 1:1 room. Check console.");
        }
        alert("1:1 classroom created.");
        form.reset();
        return;
      }

      // group enrollment
      const defaultTeacherName = COURSE_TEACHER_DEFAULTS[course] || "Teacher";
      const teacher = teacherId ? (teachers || []).find(t => t.id === teacherId) : null;

      const payload = {
        student_id: student.id,
        course,
        batch_month: batch,
        status: "active",
        teacher_id: teacher ? teacher.id : null,
        teacher_name: teacher ? (teacher.full_name || teacher.email) : defaultTeacherName,
        meet_link: meet || null,
        notes_link: notes || null,
        homework_link: hw || null,
        recordings_link: rec || null,
        practice_link: practice || null
      };

      const { error: e2 } = await sb.from("enrollments").insert(payload);
      if (e2) {
        console.error(e2);
        return alert("Failed to enroll. Check console.");
      }
      alert("Student enrolled.");
      form.reset();
      refreshAdminTables();
    });
  }

  // Bind announcement
  const annForm = qs("#annForm");
  if (annForm) {
    annForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = qs("#annTitle").value.trim();
      const body = qs("#annBody").value.trim();
      if (!title) return alert("Title required.");
      const { error } = await sb.from("announcements").insert({ title, body, is_active: true });
      if (error) {
        console.error(error);
        return alert("Failed to post announcement.");
      }
      alert("Announcement posted.");
      annForm.reset();
      refreshAdminTables();
    });
  }

  await refreshAdminTables();
}

async function refreshAdminTables(){
  // Enrollments
  const enrollEl = qs("#enrollmentsTableBody");
  const oneEl = qs("#oneOnOneTableBody");
  const annEl = qs("#annTableBody");

  if (enrollEl) {
    const { data } = await sb
      .from("enrollments")
      .select("id, course, batch_month, status, teacher_name, created_at, student_id")
      .order("created_at", { ascending: false })
      .limit(25);

    enrollEl.innerHTML = (data || []).map(r => `
      <tr>
        <td>${escapeHtml(r.course)}</td>
        <td>${escapeHtml(r.batch_month || "-")}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.teacher_name || "-")}</td>
        <td class="mini">${new Date(r.created_at).toLocaleString()}</td>
      </tr>
    `).join("") || `<tr><td colspan="5" class="mini">No enrollments yet.</td></tr>`;
  }

  if (oneEl) {
    const { data } = await sb
      .from("one_on_one_rooms")
      .select("id, label, status, teacher_name, created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    oneEl.innerHTML = (data || []).map(r => `
      <tr>
        <td>${escapeHtml(r.label || "1:1")}</td>
        <td>${escapeHtml(r.status)}</td>
        <td>${escapeHtml(r.teacher_name || "-")}</td>
        <td class="mini">${new Date(r.created_at).toLocaleString()}</td>
      </tr>
    `).join("") || `<tr><td colspan="4" class="mini">No 1-on-1 rooms yet.</td></tr>`;
  }

  if (annEl) {
    const { data } = await sb
      .from("announcements")
      .select("title, body, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    annEl.innerHTML = (data || []).map(a => `
      <tr>
        <td><b>${escapeHtml(a.title)}</b><div class="mini">${escapeHtml(a.body || "")}</div></td>
        <td>${a.is_active ? "Active" : "Off"}</td>
        <td class="mini">${new Date(a.created_at).toLocaleString()}</td>
      </tr>
    `).join("") || `<tr><td colspan="3" class="mini">No announcements.</td></tr>`;
  }
}

/* ---------------- helpers ---------------- */

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s){
  return escapeHtml(s).replaceAll("`", "");
}
