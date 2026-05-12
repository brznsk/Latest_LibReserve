const API_BASE = "/.netlify/functions"; 
let currentType = "staff";

function setRole(type) {
    currentType = type;
    
    // Update UI active states
    document.querySelectorAll('.role-tile').forEach(tile => {
        tile.classList.remove('active');
    });
    
    const activeTile = document.querySelector(`[onclick="setRole('${type}')"]`);
    if (activeTile) activeTile.classList.add('active');
}

function togglePw(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (input.type === "password") {
        input.type = "text";
        if (icon) icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        input.type = "password";
        if (icon) icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

async function handleLogin() {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const btn = document.getElementById("login-btn");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) return showMsg("error", "Please enter both email and password.");

    btn.disabled = true;
    btn.textContent = "Verifying...";

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email.toLowerCase(), 
                password: password, 
                type: currentType 
            })
        });

        const result = await response.json();

        if (!response.ok) {
            btn.disabled = false;
            btn.textContent = "Sign In";
            return showMsg("error", result.message || "Login failed.");
        }

        sessionStorage.setItem("xu_session", JSON.stringify(result));
        
        showMsg("success", "Access granted. Redirecting...");
        
        setTimeout(() => {
            if (result.type === 'admin') {
                window.location.href = "AdminDashBoard.html";
            } else if (result.type === 'staff') {
                window.location.href = "StaffDashBoard.html";
            } else {
                if (result.staffPortalAccess) {
                    window.location.href = "StaffDashBoard.html";
                } else {
                    window.location.href = "StudentDashBoard.html";
                }
            }
        }, 1000);

    } catch (err) {
        console.error("Login Error:", err);
        btn.disabled = false;
        btn.textContent = "Sign In";
        showMsg("error", "Could not connect to the database.");
    }
}

function showMsg(type, text) {
    const errEl = document.getElementById("error-msg");
    const okEl = document.getElementById("success-msg");
    
    if (errEl) errEl.style.display = "none";
    if (okEl) okEl.style.display = "none";
    
    const target = (type === "error") ? errEl : okEl;
    if (target) {
        target.textContent = text;
        target.style.display = "block";
    }
}