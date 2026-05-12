const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:3000/api"
    : "https://your-railway-app-name.up.railway.app/api";

/**
 * @returns {Promise<Array>}
 */
async function getUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        return Array.isArray(users) ? users : [];
    } catch (e) {
        console.error("Failed to fetch users from database:", e);
        return [];
    }
}

/**
 * @returns {Promise<boolean>}
 */
async function hasActiveAdmin() {
    try {
        const users = await getUsers();
        return users.some(u => u.type === 'admin');
    } catch (e) {
        return false;
    }
}

function getActiveSession() {
    try {
        return JSON.parse(sessionStorage.getItem("xu_session") || "null");
    } catch (e) {
        return null;
    }
}