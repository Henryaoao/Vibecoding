import {
  clearToken,
  createPet,
  feedPet,
  fetchCurrentPet,
  fetchCurrentUser,
  fetchPetEvents,
  fetchTeamSummary,
  fetchWallet,
  logoutUser,
  setLoading,
  token,
} from "./auth-api.js";

const username = document.querySelector("[data-username-title]");
const email = document.querySelector("[data-user-email]");
const role = document.querySelector("[data-user-role]");
const logout = document.querySelector("[data-logout-button]");
const loading = document.querySelector("[data-loading]");
const dashboard = document.querySelector("[data-dashboard]");
const petStage = document.querySelector("[data-pet-stage]");
const petEmpty = document.querySelector("[data-pet-empty]");
const petError = document.querySelector("[data-pet-error]");
const petErrorMessage = document.querySelector("[data-pet-error-message]");
const createPetButton = document.querySelector("[data-create-pet-button]");
const petTitle = document.querySelector("[data-pet-title]");
const petSkin = document.querySelector("[data-pet-skin]");
const petLevel = document.querySelector("[data-pet-level]");
const petGrowth = document.querySelector("[data-pet-growth]");
const petMood = document.querySelector("[data-pet-mood]");
const petProgressLabel = document.querySelector("[data-pet-progress-label]");
const petProgressFill = document.querySelector("[data-pet-progress-fill]");
const feedPetButton = document.querySelector("[data-feed-pet-button]");
const feedError = document.querySelector("[data-feed-error]");
const walletFeed = document.querySelector("[data-wallet-feed]");
const walletSummary = document.querySelector("[data-wallet-summary]");
const activityList = document.querySelector("[data-activity-list]");
const upgradeCelebration = document.querySelector("[data-upgrade-celebration]");
const upgradeMessage = document.querySelector("[data-upgrade-message]");
const teamGrowth = document.querySelector("[data-team-growth]");
const teamFeeds = document.querySelector("[data-team-feeds]");
const teamTasks = document.querySelector("[data-team-tasks]");
const teamParticipants = document.querySelector("[data-team-participants]");

let currentFeedBalance = 0;

loadCurrentUser();

createPetButton.addEventListener("click", async () => {
  try {
    setLoading(true);
    const data = await createPet({
      name: "Sprout",
      template: "mint-bean",
    });
    renderPet(data.pet);
    await loadActivity();
  } catch (err) {
    showPetError(err.message);
  } finally {
    setLoading(false);
  }
});

feedPetButton.addEventListener("click", async () => {
  feedError.hidden = true;
  feedError.textContent = "";

  try {
    setLoading(true);
    feedPetButton.textContent = "Feeding...";
    const data = await feedPet(1);
    renderWallet(data.wallet);
    await loadPet();
    await loadTeamSummary();
    await loadActivity();
  } catch (err) {
    feedError.hidden = false;
    feedError.textContent = err.message || "Could not feed Mint Bean yet.";
  } finally {
    setLoading(false);
    feedPetButton.disabled = currentFeedBalance <= 0;
    feedPetButton.textContent = currentFeedBalance > 0 ? "Feed Mint Bean" : "Earn feed first";
  }
});

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
    username.textContent = `${data.user.username}'s pet dashboard`;
    email.textContent = data.user.email;
    role.textContent = data.user.role;
    await loadWallet();
    await loadPet();
    await loadTeamSummary();
    await loadActivity();
    loading.hidden = true;
    dashboard.hidden = false;
  } catch {
    clearToken();
    window.location.replace("/login.html");
  }
}

async function loadWallet() {
  try {
    const data = await fetchWallet();
    renderWallet(data.wallet);
  } catch {
    renderWallet(null);
  }
}

async function loadPet() {
  try {
    const data = await fetchCurrentPet();
    renderPet(data.pet);
  } catch (err) {
    if (err.status === 404 || err.code === "PET_NOT_FOUND") {
      showPetEmpty();
      return;
    }
    showPetError(err.message);
  }
}

async function loadTeamSummary() {
  try {
    const data = await fetchTeamSummary();
    renderTeamSummary(data.team_summary);
  } catch {
    renderTeamSummary(null);
  }
}

async function loadActivity() {
  try {
    const data = await fetchPetEvents();
    renderActivity(data.activity || []);
  } catch {
    renderActivity([]);
  }
}

function renderWallet(wallet) {
  const safeWallet = wallet || {};
  const feed = Number(safeWallet.feed_balance || 0);
  const energy = Number(safeWallet.energy_balance || 0);

  currentFeedBalance = feed;
  walletFeed.textContent = String(feed);
  walletSummary.textContent = `${feed} feed · ${energy} energy`;
  feedPetButton.disabled = feed <= 0;
  feedPetButton.textContent = feed > 0 ? "Feed Mint Bean" : "Earn feed first";
}

function renderTeamSummary(summary) {
  const safeSummary = summary || {};

  teamGrowth.textContent = String(safeSummary.total_growth_contributed || 0);
  teamFeeds.textContent = String(safeSummary.feed_event_count || 0);
  teamTasks.textContent = String(safeSummary.task_completion_count || 0);
  teamParticipants.textContent = String(safeSummary.participant_count || 0);
}

function renderPet(pet) {
  const growth = Number(pet.growth_value || 0);
  const progress = Math.min(100, Math.round((growth / 500) * 100));

  petTitle.textContent = `${pet.name} feels ${formatMood(pet.mood)}`;
  petSkin.textContent = `Skin: ${formatLabel(pet.current_skin)}`;
  petLevel.textContent = String(pet.level).padStart(2, "0");
  petGrowth.textContent = String(growth);
  petMood.textContent = formatLabel(pet.mood);
  petProgressLabel.textContent = `${progress}%`;
  petProgressFill.style.width = `${progress}%`;

  petStage.hidden = false;
  petEmpty.hidden = true;
  petError.hidden = true;
}

function renderActivity(events) {
  activityList.innerHTML = "";
  renderUpgradeCelebration(events);
  if (events.length === 0) {
    const item = document.createElement("li");
    item.className = "activity-empty";
    item.textContent = "No team activity yet.";
    activityList.append(item);
    return;
  }

  events.slice(0, 6).forEach((event) => {
    const item = document.createElement("li");
    const message = document.createElement("span");
    const time = document.createElement("time");

    message.textContent = event.message || formatLabel(event.event_type);
    time.dateTime = event.created_at || "";
    time.textContent = formatActivityTime(event.created_at);

    item.append(message, time);
    activityList.append(item);
  });
}

function renderUpgradeCelebration(events) {
  const upgrade = events.find((event) => event.event_type === "pet_upgraded");
  if (!upgrade) {
    upgradeCelebration.hidden = true;
    upgradeMessage.textContent = "Mint Bean is growing with the team.";
    return;
  }

  upgradeMessage.textContent = upgrade.message || "Mint Bean is growing with the team.";
  upgradeCelebration.hidden = false;
}

function showPetEmpty() {
  petStage.hidden = true;
  petEmpty.hidden = false;
  petError.hidden = true;
}

function showPetError(message) {
  petStage.hidden = true;
  petEmpty.hidden = true;
  petError.hidden = false;
  petErrorMessage.textContent = message || "Please try again after the API is available.";
}

function formatActivityTime(value) {
  if (!value) {
    return "Just now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMood(value) {
  const moods = {
    excited: "sparkly",
    happy: "cozy",
    hungry: "ready for a snack",
    tired: "sleepy after a big team day",
  };
  return moods[value] || formatLabel(value);
}
