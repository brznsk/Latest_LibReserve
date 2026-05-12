async function createFirstAdmin() {
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const email = document.getElementById("email").value.trim();
    const pw = document.getElementById("pw").value;
    const btn = document.getElementById("init-btn");

    btn.disabled = true;
    btn.textContent = "Creating System...";

    try {
        const response = await fetch(`${API_BASE}/admin-setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fname, lname, email, password: pw, type: 'admin' })
        });

        if (response.ok) {
            showInitMsg("success", "Admin created. Redirecting...");
            setTimeout(() => { window.location.href = "LogIn.html"; }, 1500);
        } else {
            const err = await response.json();
            throw new Error(err.message);
        }
    } catch (e) {
        btn.disabled = false;
        btn.textContent = "Create Administrator";
        showInitMsg("error", e.message);
    }
}