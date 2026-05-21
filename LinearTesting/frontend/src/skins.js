import {
  clearToken,
  fetchCurrentUser,
  fetchPetSkins,
  logoutUser,
  setLoading,
  token,
} from "./auth-api.js";

const loading = document.querySelector("[data-skins-loading]");
const error = document.querySelector("[data-skins-error]");
const unlockedList = document.querySelector("[data-unlocked-skins]");
const lockedList = document.querySelector("[data-locked-skins]");
const currentTitle = document.querySelector("[data-current-skin-title]");
const currentRarity = document.querySelector("[data-current-skin-rarity]");
const currentDescription = document.querySelector("[data-current-skin-description]");
const logout = document.querySelector("[data-logout-button]");

loadSkins();

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

async function loadSkins() {
  if (!token()) {
    window.location.replace("/login.html");
    return;
  }

  try {
    await fetchCurrentUser();
    const data = await fetchPetSkins();
    renderSkins(data.skins || []);
  } catch (err) {
    if (err.status === 401) {
      clearToken();
      window.location.replace("/login.html");
      return;
    }
    if (err.status === 404 || err.code === "PET_NOT_FOUND") {
      renderNoPetState();
      return;
    }
    showError(err.message || "Could not load pet skins.");
  } finally {
    loading.hidden = true;
  }
}

function renderNoPetState() {
  error.hidden = true;
  unlockedList.innerHTML = "";
  lockedList.innerHTML = "";
  renderCurrentSkin(null);
  unlockedList.append(emptyCard("Invite Mint Bean first", "The skin center unlocks after the team mascot exists."));
  lockedList.append(emptyCard("No locked looks yet", "Skin goals will appear once Mint Bean joins the pilot."));
}

function renderSkins(skins) {
  error.hidden = true;
  unlockedList.innerHTML = "";
  lockedList.innerHTML = "";

  if (skins.length === 0) {
    unlockedList.append(emptyCard("No skins yet", "Ask an admin to seed the pilot mascot looks."));
    renderCurrentSkin(null);
    return;
  }

  renderCurrentSkin(skins.find((skin) => skin.current));

  const unlocked = skins.filter((skin) => skin.unlocked);
  const locked = skins.filter((skin) => !skin.unlocked);
  renderSkinGroup(unlockedList, unlocked, "No unlocked skins yet", "Complete team tasks to grow Mint Bean.");
  renderSkinGroup(lockedList, locked, "No locked skins", "Every seeded look is already unlocked.");
}

function renderSkinGroup(container, skins, emptyTitle, emptyText) {
  if (skins.length === 0) {
    container.append(emptyCard(emptyTitle, emptyText));
    return;
  }

  skins.forEach((skin) => container.append(skinCard(skin)));
}

function renderCurrentSkin(skin) {
  if (!skin) {
    currentTitle.textContent = "No current skin";
    currentRarity.textContent = "Current";
    currentDescription.textContent = "Create Mint Bean first, then the active skin will appear here.";
    return;
  }

  currentTitle.textContent = skin.name;
  currentRarity.textContent = formatLabel(skin.rarity);
  currentDescription.textContent = skin.description || "This skin is currently equipped.";
}

function skinCard(skin) {
  const card = document.createElement("article");
  const preview = document.createElement("div");
  const status = document.createElement("span");
  const title = document.createElement("h2");
  const meta = document.createElement("p");
  const description = document.createElement("p");

  card.className = `skin-card ${skin.unlocked ? "skin-card-unlocked" : "skin-card-locked"}`;
  preview.className = "skin-preview";
  preview.textContent = skin.unlocked ? "Ready look" : "Next look";
  status.className = `status-chip ${skin.unlocked ? "status-available" : "status-pending"}`;
  status.textContent = skin.current ? "Current" : skin.unlocked ? "Unlocked" : "Locked";
  title.textContent = skin.name;
  meta.className = "task-meta";
  meta.textContent = `${formatLabel(skin.rarity)} · ${skin.asset_path}`;
  description.className = "task-meta";
  description.textContent = skin.unlocked
    ? skin.description
    : skin.unlock_condition || "Keep growing Mint Bean to unlock this look.";

  card.append(preview, status, title, meta, description);
  return card;
}

function emptyCard(title, text) {
  const card = document.createElement("article");
  card.className = "skin-card";
  card.innerHTML = `
    <span class="status-chip status-pending">Empty</span>
    <h2>${title}</h2>
    <p class="task-meta">${text}</p>
  `;
  return card;
}

function showError(message) {
  error.hidden = false;
  error.textContent = message;
}

function formatLabel(value) {
  return String(value || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
