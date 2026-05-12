async function doRegister() {
    const fname = document.getElementById("fname").value.trim();
    const lname = document.getElementById("lname").value.trim();
    const sid = document.getElementById("sid").value.trim();
    const email = document.getElementById("email").value.trim();
    const pw = document.getElementById("pw").value;
    const cpw = document.getElementById("cpw").value;
    const btn = document.getElementById("reg-btn");

    if (pw !== cpw) return showAlert("error", "Passwords do not match.");

    btn.disabled = true;
    btn.textContent = "Saving to Database...";

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fname, lname, sid, email, password: pw, type: 'student' })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message);

        showAlert("success", "Account created! Redirecting...");
        setTimeout(() => { window.location.href = "LogIn.html"; }, 1500);

    } catch (err) {
        btn.disabled = false;
        btn.textContent = "Create Account";
        showAlert("error", err.message);
    }
}