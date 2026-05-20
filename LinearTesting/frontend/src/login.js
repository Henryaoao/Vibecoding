import { loginUser, readForm, setLoading, setToken, showError } from "./auth-api.js";

const form = document.querySelector("[data-login-form]");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");

  const payload = readForm(form);
  if (!payload.email || !payload.password) {
    showError("Email and password are required.");
    return;
  }

  try {
    setLoading(true);
    const data = await loginUser(payload);
    setToken(data.token);
    window.location.assign("/dashboard.html");
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});
