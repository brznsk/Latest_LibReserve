# LibReserve — Confab Reservation System

Static front-end app for library Confab rooms 1–6 at Xavier University – Ateneo de Cagayan. Students submit reservation requests; library staff approve or reject them; an administrator manages accounts. There is no server or database: everything persists in the browser through `localStorage` (and the current session in `sessionStorage`).

Use a local HTTP URL (for example VS Code Live Server) so testers share one origin and one copy of the data.

---

## Demo sign-in (built-in)

If no demo admin exists in storage, the app adds one when users are loaded (`js/auth-store.js`).

> **Email:** `admin@xu.edu.ph`  
> **Password:** `LibraryAdmin!24`

From the admin dashboard you can add real staff accounts (**+ Add staff account**). Staff may use `@xu.edu.ph` or `@my.xu.edu.ph` (for example student assistants). The very first administrator created via `AdminInit.html` must still use `@xu.edu.ph` only.

---

## Overview

- Single-page style flow: login, then student, staff, or admin dashboards.
- Storage keys: `xu_users` (accounts), `xu_reservations` (bookings).
- Roles: student, staff, administrator (plus optional student “desk access” for the staff portal).

---

## Roles and main files

### Student

`StudentDashBoard.html`, `js/student-dashboard.js` — room cards, booking modal, My reservations, Track status, weekly schedule modal.

### Staff

`StaffDashBoard.html`, `js/staff-dashboard.js` — queue, statistics, search, sort by submission time, approve/reject, reservation detail modal.

### Admin

`AdminDashBoard.html`, `js/admin-dashboard.js` — create staff, reset staff password, activate/deactivate users, grant or revoke student desk access.

### Auth and registration

`LogIn.html`, `Register.html`, `js/login.js`, `js/register.js`, `js/auth-store.js`.

### Other pages

`AdminInit.html` — creates the first admin when none exists.  
`RegisterStaff.html` — explains that staff accounts are created by an admin (no self-service staff registration).

---

## Rooms and business rules

Room metadata (capacity, floor, equipment, network) lives in `js/student-dashboard.js`.

Library hours are enforced in `js/reservation-rules.js` for both booking and approval:

- Monday–Friday: 8:00–20:00  
- Saturday: 8:00–17:00  
- Sunday: closed  

**Conflicts:** only an existing approved booking blocks a new student request; pending requests do not block. When staff approve a request, any overlapping pending requests for the same room and time are automatically rejected, with a `rejectReason` shown to students on Track and My reservations.

---

## Student experience

- **Booking:** date, time, purpose, and group members (numbered lines, hints, and safe line handling).
- **My reservations:** status, staff rejection messages when applicable, and **Cancel** for pending or approved bookings only if cancellation is at least two hours before the scheduled start. Cancelled rows use `status: "cancelled"`, plus `cancelledAt` and `cancelledBy: "student"`.
- **Track:** look up a reservation by tracking code; cancelled bookings show cancellation time when available.
- **Weekly schedule:** shows approved occupancy only. For privacy, blocks show the time range and the label “Occupied”, not names, purposes, or other identifying details.

---

## Staff experience

- Filter requests: All, Pending, Approved, Rejected, Cancelled.
- Sort by submission: oldest first or newest first.
- Refresh the list; statistics include student-cancelled counts.
- Approval checks library hours, that the slot is not in the past, and conflicts with other approved bookings; then pending overlaps are auto-rejected as described above.
- The UI notes that data is tied to this browser and URL—students and staff should use the same site address during a demo.

---

## Accounts and admin notes

The demo admin is kept in sync through `ensureBuiltinDemoAdminPresent` in `js/auth-store.js` when `getUsers()` runs.

New staff need a name, email (`@xu.edu.ph` or `@my.xu.edu.ph`), employee ID, and a password that satisfies `js/register-validation.js`. Admins can set a new password for an existing staff row. Staff emails are trimmed on create; login messages distinguish wrong role, wrong password, and missing local account.

Each email may belong to only one user record. If someone already registered as a student on `@my.xu.edu.ph`, you cannot add a second staff row with the same email; use Grant desk on the student record or a different email for a separate staff login.

---

## Branding and styles

XU logo and favicon assets live under `images/`. Shared styling uses `css/variables.css` and `css/dashboard-common.css`; each dashboard has its own CSS module (for example `student-dashboard.css`, `staff-dashboard.css`).

---

## Code map

| Area | Primary files |
| ---- | ------------- |
| Hours, overlaps, auto-reject, student cancel window | `js/reservation-rules.js` |
| Student UI, schedule, booking, lists | `js/student-dashboard.js`, `StudentDashBoard.html`, `css/student-dashboard.css` |
| Staff desk | `js/staff-dashboard.js`, `StaffDashBoard.html`, `css/staff-dashboard.css` |
| Users and demo admin | `js/auth-store.js` |
| Admin UI | `js/admin-dashboard.js`, `AdminDashBoard.html` |
| Validation rules | `js/register-validation.js` |
| First-admin bootstrap | `js/admin-init.js`, `AdminInit.html` |
| Shared layout and badges | `css/dashboard-common.css` |

---

## Run locally

1. Serve the project root over HTTP (recommended: Live Server). Avoid relying on `file://` for demos if you need shared data.
2. Open `LogIn.html`.
3. Sign in as the demo admin, add staff if needed, and register or log in as students on the same origin.

---

## Troubleshooting

- **Staff dashboard shows no student requests:** another browser profile, port, or protocol means a different `localStorage` bucket. Align the URL with how students open the app.
- **Login always fails:** confirm the correct role tile (Administrator, Library Staff, or Student), password, and that the account is active. Staff passwords can be reset from the admin dashboard.
- **Data disappeared after clearing site data:** local accounts and reservations are gone; the built-in demo admin may reappear on next load per `auth-store.js`, but you must recreate custom staff and bookings.

---

## License and use

Suitable for coursework and demonstrations. Replace demo credentials and tighten policies before any real deployment.


# Log-in / Reservation System

This project implements a role-based login and registration system for a university library reservation system, including student dashboards and library staff desks.  

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Usage](#usage)
- [Database](#database)
- [Behavior](#behavior)
- [Deploy on Netlify](#deploy-on-netlify)
- [License](#license)

---

## Overview
This system provides:

- Role-specific login and registration flows.
- Student dashboards and library staff reservation desks.
- Session management for auto-login and role-based redirects.
- Responsive, touch-friendly UI for various devices.

---

## Features

### API / Server (`js/server.js`)
- **Login**:
  - Returns user JSON (password excluded) with `loginRole`.
  - **Students tile**: student account, or `@my.xu.edu.ph` staff row → `session.type: "student"` (loginRole may be `"staff"` for staff path).
  - **Library Staff tile**: normal `staff` users; also `student` + `staffPortalAccess` → `session.type: "staff"` for desk only.
- **Register**:
  - Returns a session object for auto-login to the student dashboard.

### Login (`LogIn.html`, `js/login.js`, `css/login.css`)
- Landing page with per-role forms; no archive link.
- Redirect rules:
  - Admin → admin dashboard
  - `type: "staff"` → desk
  - Students tile → student dashboard
- Copy and UI:
  - Library Staff card: *“Library staff sign-in for the reservation desk.”*
  - Students card: *“Sign in with your registered student account.”*
  - Footer links for Students use delegation to work after HTML swaps.
- Responsive and safe-area friendly with touch-friendly role cards.

### Registration (`Register.html`, `js/register-student.js`, `js/register-validation.js`, `css/register.css`)
- Input validation on registration
- On success → `xu_session` created + redirects to `StudentDashBoard.html`

### Student Portal (`StudentDashBoard.html`, `js/student-dashboard.js`, `css/student-dashboard.css`)
- Fixed `rooms-grid` (`id="rooms-grid"`)
- `session.type === "staff"` redirects to desk if allowed, else logout
- Staff with `@my.xu.edu.ph` on Students tile still allowed; shows hint banner
- `.portal-hint` styles for hints

### Staff Desk (`js/staff-dashboard.js`)
- Students-only session for real `@my` staff → no desk access
- Desk accessible for staff/admin or student + desk privilege (`session.type === "staff"`)
- Session keeps `type: "staff"` for assistants; ASSISTANT badge and student-portal link shown when relevant

### Layout (`css/dashboard-common.css`)
- Shared `.main-content` padding and safe areas

---

## Database
- No schema migration
- Fields include `staffPortalAccess`, `type`, etc.

---

## Behavior Takeaways
- Student sign-in → student UI only
- Library Staff sign-in → reservation desk (staff + privileged assistants)

---

## Usage
1. Clone the repo:
   ```bash
   git clone https://github.com/dagearon/Log-in.git
   cd Log-in
   git checkout bea
