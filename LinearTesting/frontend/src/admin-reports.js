import {
  clearToken,
  fetchAdminReportSummary,
  fetchCurrentUser,
  logoutUser,
  setLoading,
  token,
} from "./auth-api.js";

const loading = document.querySelector("[data-report-loading]");
const error = document.querySelector("[data-report-error]");
const content = document.querySelector("[data-report-content]");
const activeUsers = document.querySelector("[data-report-active-users]");
const taskCount = document.querySelector("[data-report-task-count]");
const feedCount = document.querySelector("[data-report-feed-count]");
const participation = document.querySelector("[data-report-participation]");
const growth = document.querySelector("[data-report-growth]");
const progress = document.querySelector("[data-report-progress]");
const logout = document.querySelector("[data-logout-button]");

loadReport();

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

async function loadReport() {
  if (!token()) {
    window.location.replace("/login.html");
    return;
  }

  try {
    const current = await fetchCurrentUser();
    if (current.user.role !== "admin") {
      showError("Admin access required.");
      return;
    }

    const data = await fetchAdminReportSummary();
    renderReport(data.report || {});
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      window.location.replace("/login.html");
      return;
    }
    showError(err.message || "Could not load admin report.");
  } finally {
    loading.hidden = true;
  }
}

function renderReport(report) {
  error.hidden = true;
  content.hidden = false;

  activeUsers.textContent = String(report.daily_active_users || 0);
  taskCount.textContent = String(report.task_completion_count || 0);
  feedCount.textContent = String(report.feed_event_count || 0);
  participation.textContent = `${report.participation_rate || 0}%`;
  growth.textContent = String(report.total_growth_contributed || 0);

  const petProgress = report.pet_growth_progress || {};
  progress.textContent = `${petProgress.progress_percent || 0}%`;
}

function showError(message) {
  content.hidden = true;
  error.hidden = false;
  error.textContent = message;
}
