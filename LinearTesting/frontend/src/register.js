import { readForm, registerUser, setLoading, setToken, showError } from "./auth-api.js";

const form = document.querySelector("[data-register-form]");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const payload = readForm(form);
  if (!payload.email || !payload.username || !payload.password) {
    showError("Email, username, and password are required.");
    return;
  }

  try {
    setLoading(true);
    const data = await registerUser(payload);
    setToken(data.token);
    window.location.assign("/dashboard.html");
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});
