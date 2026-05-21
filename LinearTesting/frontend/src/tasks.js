import {
  AjaxError,
  claimTaskReward,
  clearToken,
  fetchCurrentUser,
  fetchTaskTemplates,
  logoutUser,
  setLoading,
  token,
} from "./auth-api.js";

const loading = document.querySelector("[data-task-loading]");
const error = document.querySelector("[data-task-error]");
const taskList = document.querySelector("[data-task-list]");
const logout = document.querySelector("[data-logout-button]");

loadTasks();

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

async function loadTasks() {
  if (!token()) {
    window.location.replace("/login.html");
    return;
  }

  try {
    await fetchCurrentUser();
    const data = await fetchTaskTemplates();
    renderTasks(data.task_templates || []);
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      window.location.replace("/login.html");
      return;
    }
    showError(err.message || "Could not load today's tasks.");
  } finally {
    loading.hidden = true;
  }
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  error.hidden = true;

  if (tasks.length === 0) {
    const empty = document.createElement("article");
    empty.className = "daily-task-card";
    empty.innerHTML = `
      <p class="eyebrow">No tasks</p>
      <h2>No active tasks today</h2>
      <p class="task-meta">Check back after your admin adds pilot tasks.</p>
    `;
    taskList.append(empty);
    return;
  }

  tasks.forEach((task) => taskList.append(taskCard(task)));
}

function taskCard(task) {
  const card = document.createElement("article");
  const status = document.createElement("span");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const meta = document.createElement("p");
  const action = document.createElement("button");

  card.className = "daily-task-card";
  status.className = "status-chip status-available";
  status.textContent = "Available";
  title.textContent = task.name;
  description.className = "task-meta";
  description.textContent = task.description;
  meta.className = "task-meta";
  meta.textContent = `${formatReward(task)} · Daily limit ${task.daily_limit}`;
  action.type = "button";
  action.textContent = "Claim reward";

  action.addEventListener("click", async () => {
    action.disabled = true;
    action.textContent = "Claiming...";

    try {
      await claimTaskReward(task.id);
      markClaimed(status, action, "Claimed today");
    } catch (err) {
      if (err instanceof AjaxError && err.code === "DUPLICATE_TASK_CLAIM") {
        markClaimed(status, action, "Already claimed");
        return;
      }
      action.disabled = false;
      action.textContent = "Claim reward";
      showError(err.message || "Could not claim task reward.");
    }
  });

  card.append(status, title, description, meta, action);
  return card;
}

function markClaimed(status, action, label) {
  status.className = "status-chip status-claimed";
  status.textContent = label;
  action.disabled = true;
  action.textContent = "Claimed";
}

function formatReward(task) {
  const type = String(task.reward_type || "energy")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return `+${task.reward_amount} ${type}`;
}

function showError(message) {
  error.hidden = false;
  error.textContent = message;
}
