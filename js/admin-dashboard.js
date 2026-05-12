let session = null;

(function init() {
  try {
    session = JSON.parse(sessionStorage.getItem("xu_session") || "null");
  } catch (e) {
    session = null;
  }
  if (!session || session.type !== "admin") {
    window.location.href = "LogIn.html";
    return;
  }
  const users = getUsers();
  const live = users.find((u) => u.email.toLowerCase() === session.email.toLowerCase());
  if (!live || live.accountStatus !== "active" || live.type !== "admin") {
    sessionStorage.removeItem("xu_session");
    window.location.href = "LogIn.html";
    return;
  }
  const initials = ((session.fname || "A")[0] + (session.lname || "D")[0]).toUpperCase();
  document.getElementById("user-avatar").textContent = initials;
  document.getElementById("user-name").textContent =
    (session.fname || "") + " " + (session.lname || "");
  document.getElementById("search-users").addEventListener("input", renderUserTable);
  document.getElementById("users-tbody").addEventListener("click", onTableClick);
  renderUserTable();
})();

function onTableClick(e) {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const email = decodeURIComponent(btn.getAttribute("data-email"));
  if (btn.getAttribute("data-act") === "assist") toggleAssistant(email);
  if (btn.getAttribute("data-act") === "active") toggleUserActive(email);
  if (btn.getAttribute("data-act") === "staffpw") openStaffPwModal(email);
}

function renderUserTable() {
  const q = document.getElementById("search-users").value.trim().toLowerCase();
  const users = getUsers();
  const filtered = users.filter((u) => {
    if (!q) return true;
    const hay = (u.email + u.fname + u.lname + (u.sid || "") + u.type).toLowerCase();
    return hay.includes(q);
  });
  const tbody = document.getElementById("users-tbody");
  if (!filtered.length) {
    tbody.innerHTML =
      '<tr><td colspan="6"><div class="empty-state" style="padding:2rem"><p>No users match.</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = filtered
    .map((u) => {
      const inactive = u.accountStatus === "inactive";
      const isSelf = u.email.toLowerCase() === session.email.toLowerCase();
      const activeAdmins = countActiveAdmins(getUsers());
      const lastAdmin =
        u.type === "admin" && u.accountStatus === "active" && activeAdmins <= 1;

      let assistantCell = "—";
      let assistantBtn = "";
      if (u.type === "student") {
        assistantCell = u.staffPortalAccess
          ? '<span class="status-badge status-approved">Desk access</span>'
          : '<span style="color:var(--text-faint)">No</span>';
        if (!isSelf) {
          assistantBtn = `<button type="button" class="btn-small" data-act="assist" data-email="${encodeURIComponent(
            u.email
          )}">${u.staffPortalAccess ? "Revoke desk" : "Grant desk"}</button>`;
        }
      }

      const deactivateLabel = inactive ? "Activate" : "Deactivate";
      let statusBtn = "";
      if (u.type === "admin") {
        if (isSelf || lastAdmin) {
          statusBtn = `<button type="button" class="btn-small" disabled title="Cannot deactivate the last active administrator.">${deactivateLabel}</button>`;
        } else {
          statusBtn = `<button type="button" class="btn-small ${
            inactive ? "" : "danger"
          }" data-act="active" data-email="${encodeURIComponent(u.email)}">${deactivateLabel}</button>`;
        }
      } else {
        statusBtn = `<button type="button" class="btn-small ${
          inactive ? "" : "danger"
        }" data-act="active" data-email="${encodeURIComponent(u.email)}">${deactivateLabel}</button>`;
      }

      let accountBtns = statusBtn;
      if (u.type === "staff") {
        accountBtns = `<button type="button" class="btn-small" data-act="staffpw" data-email="${encodeURIComponent(
          u.email
        )}">New password</button>${statusBtn}`;
      }

      const typeClass =
        u.type === "admin" ? "type-admin" : u.type === "staff" ? "type-staff" : "type-student";

      return `<tr class="${inactive ? "inactive" : ""}">
        <td><b>${escapeHtml(u.email)}</b></td>
        <td>${escapeHtml(u.fname)} ${escapeHtml(u.lname)}</td>
        <td><span class="type-pill ${typeClass}">${escapeHtml(u.type)}</span></td>
        <td>${escapeHtml(u.sid || "—")}</td>
        <td>${assistantCell}<div class="toggle-row" style="margin-top:6px">${assistantBtn}</div></td>
        <td><div class="toggle-row" style="gap:6px;flex-wrap:wrap">${accountBtns}</div></td>
      </tr>`;
    })
    .join("");
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function toggleUserActive(email) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return;
  const u = users[idx];
  const next = u.accountStatus === "active" ? "inactive" : "active";
  if (u.type === "admin" && next === "inactive") {
    const others = users.filter(
      (x) =>
        x.type === "admin" &&
        x.accountStatus === "active" &&
        x.email.toLowerCase() !== email.toLowerCase()
    );
    if (others.length === 0) {
      alert("You cannot deactivate the last active administrator.");
      return;
    }
  }
  users[idx] = { ...u, accountStatus: next };
  saveUsers(users);
  renderUserTable();
}

function toggleAssistant(email) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return;
  const u = users[idx];
  if (u.type !== "student") return;
  users[idx] = { ...u, staffPortalAccess: !u.staffPortalAccess };
  saveUsers(users);
  renderUserTable();
}

function openStaffModal() {
  document.getElementById("staff-modal").classList.add("open");
  document.getElementById("nfname").value = "";
  document.getElementById("nlname").value = "";
  document.getElementById("nemail").value = "";
  document.getElementById("nsid").value = "";
  document.getElementById("npw").value = "";
  document.getElementById("ncpw").value = "";
  document.getElementById("staff-form-err").style.display = "none";
}

function closeStaffModal() {
  document.getElementById("staff-modal").classList.remove("open");
}

function submitNewStaff() {
  const errEl = document.getElementById("staff-form-err");
  errEl.style.display = "none";
  const fname = document.getElementById("nfname").value.trim();
  const lname = document.getElementById("nlname").value.trim();
  const emailRaw = document.getElementById("nemail").value.trim();
  const sidRaw = document.getElementById("nsid").value;
  const pw = document.getElementById("npw").value.trim();
  const cpw = document.getElementById("ncpw").value.trim();

  if (!fname || !lname) {
    errEl.textContent = "Enter the staff member's full name.";
    errEl.style.display = "block";
    return;
  }
  const emailCheck = validateStaffEmail(emailRaw);
  if (emailCheck.error) {
    errEl.textContent = emailCheck.error;
    errEl.style.display = "block";
    return;
  }
  const sidCheck = validateStaffEmployeeId(sidRaw);
  if (sidCheck.error) {
    errEl.textContent = sidCheck.error;
    errEl.style.display = "block";
    return;
  }
  const pwErr = validatePasswordPolicy(pw);
  if (pwErr) {
    errEl.textContent = pwErr;
    errEl.style.display = "block";
    return;
  }
  if (pw !== cpw) {
    errEl.textContent = "Passwords do not match.";
    errEl.style.display = "block";
    return;
  }

  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === emailCheck.normalized)) {
    errEl.textContent = "An account with this email already exists.";
    errEl.style.display = "block";
    return;
  }
  if (users.some((u) => u.type === "staff" && u.sid === sidCheck.normalized)) {
    errEl.textContent = "This employee ID is already in use.";
    errEl.style.display = "block";
    return;
  }

  users.push({
    fname,
    lname,
    email: emailCheck.normalized,
    password: pw,
    type: "staff",
    sid: sidCheck.normalized,
    accountStatus: "active",
    staffPortalAccess: false,
    createdAt: new Date().toISOString(),
    createdBy: session.email,
  });
  saveUsers(users);
  closeStaffModal();
  renderUserTable();
}

function openStaffPwModal(email) {
  document.getElementById("pw-reset-email").value = email;
  document.getElementById("pw-reset-for-email").textContent = "Account: " + email;
  document.getElementById("rpw").value = "";
  document.getElementById("rcpw").value = "";
  document.getElementById("pw-reset-err").style.display = "none";
  document.getElementById("reset-staff-pw-modal").classList.add("open");
}

function closeStaffPwModal() {
  document.getElementById("reset-staff-pw-modal").classList.remove("open");
}

function submitStaffPwReset() {
  const errEl = document.getElementById("pw-reset-err");
  errEl.style.display = "none";
  const email = document.getElementById("pw-reset-email").value;
  const pw = document.getElementById("rpw").value.trim();
  const cpw = document.getElementById("rcpw").value.trim();
  const pwErr = validatePasswordPolicy(pw);
  if (pwErr) {
    errEl.textContent = pwErr;
    errEl.style.display = "block";
    return;
  }
  if (pw !== cpw) {
    errEl.textContent = "Passwords do not match.";
    errEl.style.display = "block";
    return;
  }
  const users = getUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) {
    errEl.textContent = "User not found.";
    errEl.style.display = "block";
    return;
  }
  if (users[idx].type !== "staff") {
    errEl.textContent = "Only staff accounts can use this.";
    errEl.style.display = "block";
    return;
  }
  users[idx] = { ...users[idx], password: pw };
  saveUsers(users);
  closeStaffPwModal();
  renderUserTable();
  alert("Password saved. Staff can sign in with Library Staff using this new password.");
}

function logout() {
  sessionStorage.removeItem("xu_session");
  window.location.href = "LogIn.html";
}
