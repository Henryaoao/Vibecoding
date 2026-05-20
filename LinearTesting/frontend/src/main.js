import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const TOKEN_KEY = "auth_token";

const state = {
  user: null,
  loading: false,
  error: "",
};

const root = document.getElementById("root");

function token() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function setToken(value) {
  window.localStorage.setItem(TOKEN_KEY, value);
}

function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function ajax(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token()) {
    headers.Authorization = `Bearer ${token()}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const body = await response.json();

  if (!response.ok || body.success === false) {
    const message = body.error?.message || "Request failed";
    const details = body.error?.details || [];
    throw new Error(details.length > 0 ? `${message}: ${details.join(", ")}` : message);
  }

  return body.data;
}

function registerUser(payload) {
  return ajax("/api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function loginUser(payload) {
  return ajax("/api/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function fetchCurrentUser() {
  return ajax("/api/users/me");
}

function logoutUser() {
  return ajax("/api/sessions/current", {
    method: "DELETE",
  });
}

function navigate(path) {
  window.history.pushState({}, "", path);
  renderRoute();
}

function setLoading(value) {
  state.loading = value;
  updateButtons();
}

function setError(message) {
  state.error = message;
  renderError();
}

function updateButtons() {
  document.querySelectorAll("[data-loading-button]").forEach((button) => {
    button.disabled = state.loading;
  });
}

function renderError() {
  const error = document.querySelector("[data-error]");
  if (!error) {
    return;
  }

  error.hidden = state.error === "";
  error.textContent = state.error;
}

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderLogin() {
  root.innerHTML = `
    <main class="auth-shell">
      <section class="auth-panel" aria-labelledby="login-title">
        <p class="eyebrow">User MVP</p>
        <h1 id="login-title">Log in</h1>
        <form class="form-stack" data-login-form>
          <label>
            Email
            <input name="email" type="email" autocomplete="email" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autocomplete="current-password" required />
          </label>
          <p class="error-message" data-error role="alert" hidden></p>
          <button type="submit" data-loading-button>Log in</button>
        </form>
        <p class="helper-text">
          Need an account? <a href="/register" data-link>Register</a>
        </p>
      </section>
    </main>
  `;

  root.querySelector("[data-login-form]").addEventListener("submit", handleLogin);
  attachLinks();
  renderError();
}

function renderRegister() {
  root.innerHTML = `
    <main class="auth-shell">
      <section class="auth-panel" aria-labelledby="register-title">
        <p class="eyebrow">User MVP</p>
        <h1 id="register-title">Create account</h1>
        <form class="form-stack" data-register-form>
          <label>
            Email
            <input name="email" type="email" autocomplete="email" required />
          </label>
          <label>
            Username
            <input name="username" type="text" autocomplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autocomplete="new-password" required />
          </label>
          <p class="error-message" data-error role="alert" hidden></p>
          <button type="submit" data-loading-button>Create account</button>
        </form>
        <p class="helper-text">
          Already registered? <a href="/login" data-link>Log in</a>
        </p>
      </section>
    </main>
  `;

  root.querySelector("[data-register-form]").addEventListener("submit", handleRegister);
  attachLinks();
  renderError();
}

function renderDashboard() {
  if (!state.user) {
    root.innerHTML = `<main class="page-shell">Loading account...</main>`;
    loadCurrentUser();
    return;
  }

  root.innerHTML = `
    <main class="page-shell">
      <section class="dashboard-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1 data-username-title></h1>
        </div>
        <button type="button" data-logout-button data-loading-button>Log out</button>
      </section>
      <section class="summary-panel" aria-label="Current user">
        <dl>
          <div>
            <dt>Email</dt>
            <dd data-user-email></dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd data-user-role></dd>
          </div>
        </dl>
      </section>
    </main>
  `;

  root.querySelector("[data-username-title]").textContent = `Welcome, ${state.user.username}`;
  root.querySelector("[data-user-email]").textContent = state.user.email;
  root.querySelector("[data-user-role]").textContent = state.user.role;
  root.querySelector("[data-logout-button]").addEventListener("click", handleLogout);
}

async function handleLogin(event) {
  event.preventDefault();
  setError("");

  const form = event.currentTarget;
  const payload = readForm(form);
  if (!payload.email || !payload.password) {
    setError("Email and password are required.");
    return;
  }

  try {
    setLoading(true);
    const data = await loginUser(payload);
    state.user = data.user;
    setToken(data.token);
    navigate("/dashboard");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  setError("");

  const form = event.currentTarget;
  const payload = readForm(form);
  if (!payload.email || !payload.username || !payload.password) {
    setError("Email, username, and password are required.");
    return;
  }

  try {
    setLoading(true);
    const data = await registerUser(payload);
    state.user = data.user;
    setToken(data.token);
    navigate("/dashboard");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

async function handleLogout() {
  setError("");

  try {
    setLoading(true);
    await logoutUser();
  } catch {
    // Local logout should still clear a stale or expired token.
  } finally {
    clearToken();
    state.user = null;
    setLoading(false);
    navigate("/login");
  }
}

async function loadCurrentUser() {
  if (!token()) {
    navigate("/login");
    return;
  }

  try {
    const data = await fetchCurrentUser();
    state.user = data.user;
    renderDashboard();
  } catch {
    clearToken();
    state.user = null;
    navigate("/login");
  }
}

function attachLinks() {
  root.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.getAttribute("href"));
    });
  });
}

function renderRoute() {
  state.error = "";

  switch (window.location.pathname) {
    case "/register":
      renderRegister();
      return;
    case "/login":
      renderLogin();
      return;
    case "/":
    case "/dashboard":
      renderDashboard();
      return;
    default:
      navigate("/dashboard");
  }
}

window.addEventListener("popstate", renderRoute);
renderRoute();

export {
  ajax,
  clearToken,
  loginUser,
  logoutUser,
  readForm,
  registerUser,
  setToken,
};
