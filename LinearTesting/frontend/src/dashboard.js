import { clearToken, fetchCurrentUser, logoutUser, setLoading, token } from "./auth-api.js";

const username = document.querySelector("[data-username-title]");
const email = document.querySelector("[data-user-email]");
const role = document.querySelector("[data-user-role]");
const logout = document.querySelector("[data-logout-button]");
const loading = document.querySelector("[data-loading]");
const dashboard = document.querySelector("[data-dashboard]");

loadCurrentUser();

logout.addEventListener("click", async () => {
  try {
    setLoading(true);
    await logoutUser();
  } catch {
    // Local logout should still clear a stale or expired token.
  } finally {
    clearToken();
    setLoading(false);
    window.location.assign("/login.html");
  }
});

async function loadCurrentUser() {
  if (!token()) {
    window.location.replace("/login.html");
    return;
  }

  try {
    const data = await fetchCurrentUser();
    username.textContent = `Welcome, ${data.user.username}`;
    email.textContent = data.user.email;
    role.textContent = data.user.role;
    loading.hidden = true;
    dashboard.hidden = false;
  } catch {
    clearToken();
    window.location.replace("/login.html");
  }
}
