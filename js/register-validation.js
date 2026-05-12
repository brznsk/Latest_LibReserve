/**
 * Shared rules for student/staff registration.
 */
function validatePasswordPolicy(pw) {
  if (!pw || pw.length < 12) {
    return "Password must be at least 12 characters.";
  }
  if (!/[a-z]/.test(pw)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(pw)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[^A-Za-z0-9]/.test(pw)) {
    return "Password must include at least one special character (e.g. !@#$%).";
  }
  return null;
}

function validateStudentSchoolId(raw) {
  const s = String(raw).trim();
  if (/[A-Za-z]/.test(s)) {
    return {
      error: "School ID cannot contain letters. Enter exactly 11 digits.",
      normalized: null,
    };
  }
  const id = s.replace(/\D/g, "");
  if (id.length !== 11) {
    return {
      error: "School ID must be exactly 11 digits.",
      normalized: null,
    };
  }
  return { error: null, normalized: id };
}

function validateStudentEmail(raw) {
  const email = String(raw).trim();
  if (!email) {
    return { error: "Please enter your email address.", normalized: null };
  }
  const lower = email.toLowerCase();
  if (!/^[^\s@]+@my\.xu\.edu\.ph$/i.test(email)) {
    return {
      error: "Student email must be your official @my.xu.edu.ph address.",
      normalized: null,
    };
  }
  const local = lower.slice(0, lower.indexOf("@"));
  if (!local || local.length > 64) {
    return { error: "Please enter a valid email address.", normalized: null };
  }
  return { error: null, normalized: lower };
}

/** Library staff / student assistant accounts (from admin panel). */
function validateStaffEmail(raw) {
  const email = String(raw).trim();
  if (!email) {
    return { error: "Please enter your email address.", normalized: null };
  }
  const lower = email.toLowerCase();
  if (!/^[^\s@]+@(?:xu\.edu\.ph|my\.xu\.edu\.ph)$/i.test(lower)) {
    return {
      error:
        "Use an official @xu.edu.ph or @my.xu.edu.ph address (e.g. library staff or student assistant).",
      normalized: null,
    };
  }
  return { error: null, normalized: lower };
}

/** First administrator setup only — not student domain. */
function validateAdminInitEmail(raw) {
  const email = String(raw).trim();
  if (!email) {
    return { error: "Please enter your email address.", normalized: null };
  }
  const lower = email.toLowerCase();
  if (!/^[^\s@]+@xu\.edu\.ph$/i.test(lower)) {
    return {
      error: "Administrator email must be your official @xu.edu.ph address.",
      normalized: null,
    };
  }
  return { error: null, normalized: lower };
}

/** Staff / employee ID: letters, digits, hyphen; no spaces. */
function validateStaffEmployeeId(raw) {
  const id = String(raw).trim();
  if (!id) {
    return { error: "Please enter your Staff/Employee ID.", normalized: null };
  }
  if (!/^[A-Za-z0-9-]{3,24}$/.test(id)) {
    return {
      error: "Staff/Employee ID must be 3–24 characters (letters, numbers, or hyphen only).",
      normalized: null,
    };
  }
  return { error: null, normalized: id };
}
