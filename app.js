const baseStorylines = [];

const storageKey = "panelpath-state-v1";
const comicVineSessionKey = "panelpath-comic-vine-key";
const komgaSessionKey = "panelpath-komga-settings";
const mylarSessionKey = "panelpath-mylar-settings";
let state = {
  selectedId: "",
  filter: "all",
  search: "",
  darkMode: true,
  activePage: "myarcs",
  profile: {
    name: "",
    email: "",
    publisher: "Either",
    syncName: "",
    avatar: "📚"
  },
  isAuthenticated: false,
  sessionEmail: null,
  comicVineKey: "",
  dataSource: "comicvine", // "comicvine", "gcd", or "marvel"
  komga: {
    url: "",
    username: "",
    password: ""
  },
  komgaMatches: {},
  mylar: {
    url: "",
    apiKey: "",
    httpUser: "",
    httpPass: ""
  },
  mylarMatches: {},
  covers: {},
  progress: {},
  ratings: {},
  collection: {},
  collectionFilter: "all",
  customStorylines: [],
  archivedStorylines: [],
  showArchived: false,
  apiCache: {},
  imageCache: {}
};

const elements = {
  loginScreen: document.querySelector("#loginScreen"),
  appShell: document.querySelector("#appShell"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  loginButton: document.querySelector("#loginButton"),
  loginStatus: document.querySelector("#loginStatus"),
  registerName: document.querySelector("#registerName"),
  registerEmail: document.querySelector("#registerEmail"),
  registerPassword: document.querySelector("#registerPassword"),
  registerPublisher: document.querySelector("#registerPublisher"),
  registerButton: document.querySelector("#registerButton"),
  registerStatus: document.querySelector("#registerStatus"),
  resetEmail: document.querySelector("#resetEmail"),
  resetButton: document.querySelector("#resetButton"),
  resetStatus: document.querySelector("#resetStatus"),
  logoutButton: document.querySelector("#logoutButton"),
  brandLogo: document.querySelector("#brandLogo"),
  searchInput: document.querySelector("#searchInput"),
  clearSearch: document.querySelector("#clearSearch"),
  readerPage: document.querySelector("#readerPage"),
  lookupPage: document.querySelector("#lookupPage"),
  myArcsPage: document.querySelector("#myArcsPage"),
  customPage: document.querySelector("#customPage"),
  profilePage: document.querySelector("#profilePage"),
  storyList: document.querySelector("#storyList"),
  allStorylinesList: document.querySelector("#allStorylinesList"),
  storyTitle: document.querySelector("#storyTitle"),
  storyMeta: document.querySelector("#storyMeta"),
  readCount: document.querySelector("#readCount"),
  ownedCount: document.querySelector("#ownedCount"),
  leftCount: document.querySelector("#leftCount"),
  progressFill: document.querySelector("#progressFill"),
  progressPct: document.querySelector("#progressPct"),
  issueList: document.querySelector("#issueList"),
  readingHint: document.querySelector("#readingHint"),
  markAllRead: document.querySelector("#markAllRead"),
  clearStoryProgress: document.querySelector("#clearStoryProgress"),
  loadCovers: document.querySelector("#loadCovers"),
  syncKomga: document.querySelector("#syncKomga"),
  komgaSyncIndicator: document.querySelector("#komgaSyncIndicator"),
  resetProgress: document.querySelector("#resetProgress"),
  darkModeToggle: document.querySelector("#darkModeToggle"),
  comicVineKey: document.querySelector("#comicVineKey"),
  saveComicVineKey: document.querySelector("#saveComicVineKey"),
  apiStatus: document.querySelector("#apiStatus"),
  dataSource: document.querySelector("#dataSource"),
  komgaUrl: document.querySelector("#komgaUrl"),
  komgaUsername: document.querySelector("#komgaUsername"),
  komgaPassword: document.querySelector("#komgaPassword"),
  showKomgaPassword: document.querySelector("#showKomgaPassword"),
  saveKomga: document.querySelector("#saveKomga"),
  testKomga: document.querySelector("#testKomga"),
  komgaStatus: document.querySelector("#komgaStatus"),
  mylarUrl: document.querySelector("#mylarUrl"),
  mylarApiKey: document.querySelector("#mylarApiKey"),
  mylarHttpUser: document.querySelector("#mylarHttpUser"),
  mylarHttpPass: document.querySelector("#mylarHttpPass"),
  mylarStatus: document.querySelector("#mylarStatus"),
  saveMylar: document.querySelector("#saveMylar"),
  testMylar: document.querySelector("#testMylar"),
  syncMylar: document.querySelector("#syncMylar"),
  importMylarList: document.querySelector("#importMylarList"),
  exportMylarList: document.querySelector("#exportMylarList"),
  vineArcSearch: document.querySelector("#vineArcSearch"),
  creatorSearch: document.querySelector("#creatorSearch"),
  creatorRole: document.querySelector("#creatorRole"),
  searchVineArcs: document.querySelector("#searchVineArcs"),
  vineArcResults: document.querySelector("#vineArcResults"),
  vineLookupStatus: document.querySelector("#vineLookupStatus"),
  lookupTitle: document.querySelector("#lookupTitle"),
  lookupDescription: document.querySelector("#lookupDescription"),
  lookupSearchTitle: document.querySelector("#lookupSearchTitle"),
  profileName: document.querySelector("#profileName"),
  profileEmail: document.querySelector("#profileEmail"),
  profilePublisher: document.querySelector("#profilePublisher"),
  profileSyncName: document.querySelector("#profileSyncName"),
  profileAvatar: document.querySelector("#profileAvatar"),
  avatarSelector: document.querySelector(".avatar-selector"),
  profilePassword: document.querySelector("#profilePassword"),
  profilePasswordLabel: document.querySelector("#profilePasswordLabel"),
  saveProfileChanges: document.querySelector("#saveProfileChanges"),
  registerProfile: document.querySelector("#registerProfile"),
  loginProfile: document.querySelector("#loginProfile"),
  logoutProfile: document.querySelector("#logoutProfile"),
  saveToServer: document.querySelector("#saveToServer"),
  saveProfile: document.querySelector("#saveProfile"),
  exportProfile: document.querySelector("#exportProfile"),
  importProfile: document.querySelector("#importProfile"),
  syncPayload: document.querySelector("#syncPayload"),
  syncStatus: document.querySelector("#syncStatus"),
  showMyArcs: document.querySelector("#showMyArcs"),
  showCustomForm: document.querySelector("#showCustomForm"),
  closeCustomForm: document.querySelector("#closeCustomForm"),
  customPanel: document.querySelector("#customPanel"),
  customTitle: document.querySelector("#customTitle"),
  customPublisher: document.querySelector("#customPublisher"),
  customIssues: document.querySelector("#customIssues"),
  saveCustomOrder: document.querySelector("#saveCustomOrder"),
  exportCbl: document.querySelector("#exportCbl"),
  importCbl: document.querySelector("#importCbl"),
  cblFileInput: document.querySelector("#cblFileInput"),
  showArchived: document.querySelector("#showArchived"),
  collectionPage: document.querySelector("#collectionPage"),
  collectionList: document.querySelector("#collectionList"),
  collectionStats: document.querySelector("#collectionStats"),
  collectionAddInput: document.querySelector("#collectionAddInput"),
  collectionAddButton: document.querySelector("#collectionAddButton")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
      state = { ...state, ...saved };
    }
    state.darkMode = true;

    // Token is never persisted — always reset auth on page load.
    // The user must log in again each session.
    state.token = "";
    state.isAuthenticated = false;

    state.comicVineKey = sessionStorage.getItem(comicVineSessionKey) || "";
    const sessionKomga = JSON.parse(sessionStorage.getItem(komgaSessionKey) || "null");
    if (sessionKomga) {
      state.komga = { ...state.komga, ...sessionKomga };
    }
    const sessionMylar = JSON.parse(sessionStorage.getItem(mylarSessionKey) || "null");
    if (sessionMylar) {
      state.mylar = { ...state.mylar, ...sessionMylar };
    }
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function saveState() {
  // Remove sensitive data before saving to localStorage
  const safeState = {
    ...state,
    // Don't save passwords, API keys, or JWT tokens to localStorage
    mylar: {
      url: state.mylar?.url || "",
      apiKey: "" // Never save API key to localStorage
    },
    komga: {
      url: state.komga?.url || "",
      username: state.komga?.username || "",
      password: "" // Never save password to localStorage
    },
    comicVineKey: "", // Never save API key to localStorage
    token: "" // Never save JWT token to localStorage
  };
  localStorage.setItem(storageKey, JSON.stringify(safeState));
}

function allStorylines() {
  return [...baseStorylines, ...state.customStorylines];
}

function selectedStory() {
  return allStorylines().find((story) => story.id === state.selectedId) || allStorylines()[0];
}

function storyProgress(storyId) {
  state.progress[storyId] ||= {};
  return state.progress[storyId];
}

function issueState(storyId, index) {
  return storyProgress(storyId)[index] || { read: false, owned: false, skipped: false };
}

function progressCounts(story) {
  const progress = storyProgress(story.id);
  return story.issues.reduce(
    (counts, _issue, index) => {
      const item = progress[index] || {};
      if (item.read) counts.read += 1;
      if (item.owned) counts.owned += 1;
      if (!item.read && !item.skipped) counts.left += 1;
      return counts;
    },
    { read: 0, owned: 0, left: 0 }
  );
}

function maybePromptArchiveCompletedStory(storyId) {
  const story = allStorylines().find((item) => item.id === storyId);
  if (!story || state.archivedStorylines.includes(storyId)) return;
  const counts = progressCounts(story);
  if (story.issues.length && counts.read === story.issues.length) {
    if (confirm(`You've marked all issues in "${story.title}" as read. Archive this arc?`)) {
      archiveStoryline(storyId);
    }
  }
}

function renderStoryList() {
  const query = state.search.trim().toLowerCase();
  const stories = allStorylines().filter((story) => {
    const matchesFilter = state.filter === "all" || story.publisher === state.filter;
    const haystack = `${story.title} ${story.publisher} ${story.issues.join(" ")}`.toLowerCase();
    const isArchived = state.archivedStorylines.includes(story.id);
    return matchesFilter && haystack.includes(query) && !isArchived;
  });

  elements.storyList.innerHTML = "";
  if (!stories.length) {
    let message = "No matching storylines yet.";
    let hint = "";
    if (query) {
      hint = "Try adjusting your search terms or filter.";
    } else if (state.filter !== "all") {
      hint = "Try selecting 'All' to see all available storylines.";
    } else {
      hint = "Add a custom reading order to get started.";
    }
    elements.storyList.innerHTML = `<div class="empty-state"><h4>No storylines found</h4><p>${message}<br><br>${hint}</p></div>`;
    return;
  }

  stories.forEach((story) => {
    const card = document.querySelector("#storyCardTemplate").content.firstElementChild.cloneNode(true);
    const counts = progressCounts(story);
    const percent = story.issues.length ? Math.round((counts.read / story.issues.length) * 100) : 0;
    const arcRatingsS = (state.ratings[story.id] || []).filter(r => r > 0);
    const avgRatingS = arcRatingsS.length ? (arcRatingsS.reduce((a, b) => a + b, 0) / arcRatingsS.length).toFixed(1) : null;
    card.classList.toggle("active", story.id === state.selectedId);
    card.querySelector(".story-card-title").textContent = story.title;
    const metaElS = card.querySelector(".story-card-meta");
    metaElS.innerHTML = `${escapeHtml(publisherLabel(story.publisher))} - ${escapeHtml(story.years || "Custom")}${avgRatingS ? ` <span class="avg-rating">★ ${avgRatingS}</span>` : ""}`;
    const miniProgS = card.querySelector(".mini-progress");
    const progWrapS = document.createElement("span");
    progWrapS.className = "arc-card-progress";
    miniProgS.parentNode.insertBefore(progWrapS, miniProgS);
    progWrapS.appendChild(miniProgS);
    const pctLabelS = document.createElement("span");
    pctLabelS.className = "arc-pct";
    pctLabelS.textContent = `${percent}%`;
    progWrapS.appendChild(pctLabelS);
    miniProgS.querySelector("span").style.width = `${percent}%`;
    card.addEventListener("click", () => {
      state.selectedId = story.id;
      state.activePage = "reader";
      saveState();
      render();
      autoSyncKomgaReadProgress(story.id);
    });
    if (state.customStorylines.some((item) => item.id === story.id)) {
      const removeButton = document.createElement("button");
      removeButton.className = "archive-button";
      removeButton.textContent = "Remove";
      removeButton.type = "button";
      removeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        removeStoryline(story.id);
      });
      card.appendChild(removeButton);
    }
    elements.storyList.append(card);
  });
}

function renderAllStorylines() {
  const stories = state.showArchived 
    ? allStorylines().filter(story => state.archivedStorylines.includes(story.id))
    : allStorylines().filter(story => !state.archivedStorylines.includes(story.id));
  
  elements.allStorylinesList.innerHTML = "";
  if (!stories.length) {
    const message = state.showArchived 
      ? "No archived storylines yet.<br><br>Archive finished storylines to hide them from your active list."
      : "No storylines yet.<br><br>Use the Lookup page to find and import story arcs.";
    elements.allStorylinesList.innerHTML = `<div class="empty-state"><h4>No storylines found</h4><p>${message}</p></div>`;
    return;
  }

  stories.forEach((story) => {
    const card = document.querySelector("#storyCardTemplate").content.firstElementChild.cloneNode(true);
    const counts = progressCounts(story);
    const percent = story.issues.length ? Math.round((counts.read / story.issues.length) * 100) : 0;
    card.classList.toggle("active", story.id === state.selectedId);
    card.querySelector(".story-card-title").textContent = story.title;
    const arcRatingsA = (state.ratings[story.id] || []).filter(r => r > 0);
    const avgRatingA = arcRatingsA.length ? (arcRatingsA.reduce((a, b) => a + b, 0) / arcRatingsA.length).toFixed(1) : null;
    const metaElA = card.querySelector(".story-card-meta");
    metaElA.innerHTML = `${escapeHtml(publisherLabel(story.publisher))} - ${escapeHtml(story.years || "Custom")}${avgRatingA ? ` <span class="avg-rating">★ ${avgRatingA}</span>` : ""}`;
    const miniProgA = card.querySelector(".mini-progress");
    const progWrapA = document.createElement("span");
    progWrapA.className = "arc-card-progress";
    miniProgA.parentNode.insertBefore(progWrapA, miniProgA);
    progWrapA.appendChild(miniProgA);
    const pctLabelA = document.createElement("span");
    pctLabelA.className = "arc-pct";
    pctLabelA.textContent = `${percent}%`;
    progWrapA.appendChild(pctLabelA);
    miniProgA.querySelector("span").style.width = `${percent}%`;

    // Add archive/unarchive button
    const archiveButton = document.createElement("button");
    archiveButton.className = "archive-button";
    archiveButton.textContent = state.showArchived ? "Unarchive" : "Archive";
    archiveButton.type = "button";
    archiveButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.showArchived) {
        unarchiveStoryline(story.id);
      } else {
        archiveStoryline(story.id);
      }
    });
    card.appendChild(archiveButton);
    if (state.customStorylines.some((item) => item.id === story.id)) {
      const removeButton = document.createElement("button");
      removeButton.className = "archive-button remove-button";
      removeButton.textContent = "Remove";
      removeButton.type = "button";
      removeButton.addEventListener("click", (e) => {
        e.stopPropagation();
        removeStoryline(story.id);
      });
      card.appendChild(removeButton);
    }
    
    card.addEventListener("click", () => {
      state.selectedId = story.id;
      state.activePage = "reader";
      saveState();
      render();
      autoSyncKomgaReadProgress(story.id);
    });
    elements.allStorylinesList.append(card);
  });
  
  // Update show archived button text
  if (elements.showArchived) {
    elements.showArchived.textContent = state.showArchived ? "Show Active" : "Show Archived";
  }
}

function renderSelectedStory() {
  const story = selectedStory();
  if (!story || !story.issues || story.issues.length === 0) {
    elements.issueList.innerHTML = '<div class="empty-state"><h4>No issues found</h4><p>Select a storyline from the sidebar to view its issues.</p></div>';
    return;
  }
  
  const counts = progressCounts(story);
  const percent = story.issues.length ? Math.round((counts.read / story.issues.length) * 100) : 0;

  elements.storyTitle.textContent = story.title;
  elements.storyMeta.textContent = `${publisherLabel(story.publisher)} - ${story.years || "Custom"} - ${story.note}`;
  elements.readCount.textContent = counts.read;
  elements.ownedCount.textContent = counts.owned;
  elements.leftCount.textContent = counts.left;
  const arcRatings = (state.ratings[story.id] || []).filter(r => r > 0);
  const avgRating = arcRatings.length ? (arcRatings.reduce((a, b) => a + b, 0) / arcRatings.length).toFixed(1) : null;
  const ratingLabel = avgRating ? ` · ★ ${avgRating}` : "";
  elements.readingHint.textContent = `${story.issues.length} issues in this order - ${percent}% complete${ratingLabel}`;
  elements.progressFill.style.width = `${percent}%`;
  if (elements.progressPct) elements.progressPct.textContent = `${percent}%`;

  elements.issueList.innerHTML = "";
  story.issues.forEach((issue, index) => {
    const current = issueState(story.id, index);
    const cover = coverFor(story.id, index);
    const coverMarkup = cover?.image
      ? `<a class="cover-link" href="${escapeHtml(cover.url || "#")}" target="_blank" rel="noreferrer"><img src="${escapeHtml(cover.image)}" alt="${escapeHtml(issue)} cover" /></a>`
      : `<span class="cover-placeholder">${cover?.status === "missing" ? "No cover" : "Cover"}</span>`;
    const currentRating = (state.ratings[story.id] || [])[index] || 0;
    const starsHtml = [1,2,3,4,5].map(n =>
      `<button class="star" type="button" data-star="${n}" title="${n} star${n>1?"s":""}">${n <= currentRating ? "★" : "☆"}</button>`
    ).join("");
    const item = document.createElement("li");
    item.className = "issue-item";
    item.innerHTML = `
      ${coverMarkup}
      <span class="issue-number">${index + 1}</span>
      <span>
        <span class="issue-title issue-title-link">${escapeHtml(issue)}</span>
        <span class="issue-note">${cover?.name ? escapeHtml(cover.name) : current.skipped ? "Skipped for now" : current.read ? "Finished" : "Next in order"}</span>
        <span class="star-rating-wrap">
          <span class="star-rating">${starsHtml}</span>
          ${currentRating ? `<span class="star-rating-label">${currentRating}/5</span>` : `<span class="star-rating-label">Rate</span>`}
        </span>
      </span>
      <button class="state-button read ${current.read ? "active" : ""}" type="button">${current.read ? "Read" : "Unread"}</button>
      <button class="state-button owned ${current.owned ? "active" : ""}" type="button">Read</button>
      <button class="state-button skip ${current.skipped ? "active" : ""}" type="button">${current.skipped ? "Skipped" : "Skip"}</button>
    `;
    item.querySelector(".read").addEventListener("click", () => toggleIssue(story.id, index, "read"));
    item.querySelector(".owned").addEventListener("click", () => toggleIssue(story.id, index, "owned"));
    item.querySelector(".skip").addEventListener("click", () => toggleIssue(story.id, index, "skipped"));
    item.querySelector(".issue-title-link").addEventListener("click", () => openIssueDetail(issue, index, story.id));
    // Star rating click handlers
    item.querySelectorAll(".star").forEach(btn => {
      btn.addEventListener("click", () => {
        const stars = Number(btn.dataset.star);
        if (!state.ratings[story.id]) state.ratings[story.id] = [];
        // Toggle off if same star clicked twice
        state.ratings[story.id][index] = (state.ratings[story.id][index] === stars) ? 0 : stars;
        saveState();
        renderSelectedStory();
      });
      // Hover preview
      btn.addEventListener("mouseenter", () => {
        const hoverStar = Number(btn.dataset.star);
        item.querySelectorAll(".star").forEach(s => {
          s.textContent = Number(s.dataset.star) <= hoverStar ? "★" : "☆";
        });
      });
      btn.addEventListener("mouseleave", () => {
        const savedRating = (state.ratings[story.id] || [])[index] || 0;
        item.querySelectorAll(".star").forEach(s => {
          s.textContent = Number(s.dataset.star) <= savedRating ? "★" : "☆";
        });
      });
    });
    elements.issueList.append(item);
  });
}

function normalizeIssueKey(title) {
  return String(title || "").trim().toLowerCase();
}

function collectionEntry(issueTitle) {
  return state.collection[normalizeIssueKey(issueTitle)];
}

function setCollectionRead(issueTitle, read) {
  const key = normalizeIssueKey(issueTitle);
  if (!issueTitle.trim()) return;
  state.collection[key] = {
    ...state.collection[key],
    title: issueTitle.trim(),
    read,
    dateRead: read ? (state.collection[key]?.dateRead || new Date().toISOString()) : null
  };
}

function setCollectionRating(issueTitle, rating) {
  const key = normalizeIssueKey(issueTitle);
  if (!issueTitle.trim() || !state.collection[key]) return;
  state.collection[key].rating = rating;
}

function downloadCsv(filename, rows) {
  const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map(r => r.map(escape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCollectionCsv() {
  const entries = Object.values(state.collection);
  if (!entries.length) { alert("Your collection is empty."); return; }
  const rows = [["Title", "UPC", "Read", "Date Read", "Rating"]];
  entries.sort((a, b) => a.title.localeCompare(b.title)).forEach(e => {
    rows.push([
      e.title,
      e.upc || "",
      e.read ? "Yes" : "No",
      e.dateRead ? new Date(e.dateRead).toLocaleDateString() : "",
      e.rating || ""
    ]);
  });
  downloadCsv("arcs-collection.csv", rows);
}

function exportArcProgressCsv() {
  const stories = allStorylines();
  if (!stories.length) { alert("No arcs to export."); return; }
  const rows = [["Arc Title", "Publisher", "Years", "Issue #", "Issue Title", "Read", "Skipped", "Rating"]];
  stories.forEach(story => {
    story.issues.forEach((issue, index) => {
      const prog = issueState(story.id, index);
      const rating = (state.ratings[story.id] || [])[index] || "";
      rows.push([
        story.title,
        publisherLabel(story.publisher),
        story.years || "",
        index + 1,
        issue,
        prog.read ? "Yes" : "No",
        prog.skipped ? "Yes" : "No",
        rating
      ]);
    });
  });
  downloadCsv("arcs-progress.csv", rows);
}

function addToCollection(issueTitle, meta = {}) {
  const key = normalizeIssueKey(issueTitle);
  if (!issueTitle.trim()) return;
  if (state.collection[key]) {
    // Update UPC/cover if we now have better data
    if (meta.upc) state.collection[key].upc = meta.upc;
    if (meta.cover) state.collection[key].cover = meta.cover;
    return;
  }
  state.collection[key] = { title: issueTitle.trim(), read: false, dateRead: null, upc: meta.upc || "", cover: meta.cover || "" };
}

function syncArcProgressToCollection(storyId) {
  const story = allStorylines().find(s => s.id === storyId);
  if (!story) return;
  story.issues.forEach((issue, index) => {
    const cover = coverFor(storyId, index);
    const coverImg = cover?.image ? (state.imageCache[cover.image] || cover.image) : "";
    const meta = { cover: coverImg };
    const prog = issueState(storyId, index);
    if (prog.read) {
      setCollectionRead(issue, true);
      addToCollection(issue, meta);
    } else if (!collectionEntry(issue)) {
      addToCollection(issue, meta);
    } else if (cover?.image) {
      // Backfill cover into existing entry if missing
      const key = normalizeIssueKey(issue);
      if (state.collection[key] && !state.collection[key].cover) {
        state.collection[key].cover = cover.image;
      }
    }
  });
}

// Backfill cover images into collection entries for all storylines.
// Creates collection entries for any issue that has a loaded cover.
function backfillCollectionCovers() {
  allStorylines().forEach(story => {
    story.issues.forEach((issue, index) => {
      const cover = coverFor(story.id, index);
      if (!cover?.image) return;
      const cachedImage = state.imageCache[cover.image] || cover.image;
      const key = normalizeIssueKey(issue);
      if (state.collection[key]) {
        state.collection[key].cover = cachedImage;
      } else {
        // Auto-add to collection with cover when a cover is available
        const prog = issueState(story.id, index);
        state.collection[key] = {
          title: issue.trim(),
          read: prog.read || false,
          dateRead: prog.read ? new Date().toISOString() : null,
          upc: "",
          cover: cachedImage
        };
      }
    });
  });
}

function syncCollectionToArcProgress(issueTitle, read) {
  allStorylines().forEach(story => {
    story.issues.forEach((issue, index) => {
      if (normalizeIssueKey(issue) === normalizeIssueKey(issueTitle)) {
        const current = issueState(story.id, index);
        if (current.read !== read) {
          storyProgress(story.id)[index] = { ...current, read, skipped: read ? false : current.skipped };
        }
      }
    });
  });
}

// Find the best available cover image for an issue title by scanning all storylines
function coverImageForTitle(issueTitle) {
  const key = normalizeIssueKey(issueTitle);
  for (const story of allStorylines()) {
    for (let i = 0; i < story.issues.length; i++) {
      if (normalizeIssueKey(story.issues[i]) === key) {
        const cover = coverFor(story.id, i);
        if (cover?.image) return state.imageCache[cover.image] || cover.image;
      }
    }
  }
  return null;
}

function renderCollection() {
  if (!elements.collectionList) return;
const entries = Object.values(state.collection);
  const filter = state.collectionFilter || "all";
  const filtered = entries.filter(e =>
    filter === "all" ? true : filter === "read" ? e.read : !e.read
  );
  filtered.sort((a, b) => a.title.localeCompare(b.title));

  const total = entries.length;
  const readCount = entries.filter(e => e.read).length;
  if (elements.collectionStats) {
    elements.collectionStats.innerHTML = `
      <span class="stat"><strong>${total}</strong> tracked</span>
      <span class="stat"><strong>${readCount}</strong> read</span>
      <span class="stat"><strong>${total - readCount}</strong> unread</span>
    `;
  }

  if (!filtered.length) {
    elements.collectionList.innerHTML = `<li class="empty-state"><p>${total ? "No issues match this filter." : "No issues yet. Add one above or import from a story arc."}</p></li>`;
    return;
  }

  elements.collectionList.innerHTML = "";
  filtered.forEach(entry => {
    const key = normalizeIssueKey(entry.title);
    const li = document.createElement("li");
    li.className = "issue-item collection-item";
    const coverUrl = entry.cover || coverImageForTitle(entry.title) || "";
    const coverMarkup = coverUrl
      ? `<img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(entry.title)} cover" class="collection-cover" onerror="this.style.display='none'" />`
      : `<span class="cover-placeholder"></span>`;
    const entryRating = entry.rating || 0;
    const collStarsHtml = [1,2,3,4,5].map(n =>
      `<button class="star" type="button" data-star="${n}" title="${n} star${n>1?"s":""}">${n <= entryRating ? "★" : "☆"}</button>`
    ).join("");
    li.innerHTML = `
      ${coverMarkup}
      <span>
        <span class="issue-title issue-title-link">${escapeHtml(entry.title)}</span>
        <span class="issue-note">${entry.upc ? "UPC: " + escapeHtml(entry.upc) + " · " : ""}${entry.read && entry.dateRead ? "Read " + new Date(entry.dateRead).toLocaleDateString() : entry.read ? "Read" : "Unread"}</span>
        <span class="star-rating-wrap">
          <span class="star-rating">${collStarsHtml}</span>
          ${entryRating ? `<span class="star-rating-label">${entryRating}/5</span>` : `<span class="star-rating-label">Rate</span>`}
        </span>
      </span>
      <button class="state-button read ${entry.read ? "active" : ""}" type="button" data-key="${escapeHtml(key)}">${entry.read ? "Read" : "Unread"}</button>
      <button class="state-button skip" type="button" data-key="${escapeHtml(key)}" title="Remove from collection">Remove</button>
    `;
    li.querySelector(".issue-title-link").addEventListener("click", () => openIssueDetail(entry.title, null, null));
    li.querySelector(".read").addEventListener("click", () => {
      setCollectionRead(entry.title, !entry.read);
      syncCollectionToArcProgress(entry.title, !entry.read);
      saveState();
      saveToServer();
      renderCollection();
      renderStoryList();
      renderAllStorylines();
      renderSelectedStory();
    });
    li.querySelector(".skip").addEventListener("click", () => {
      delete state.collection[key];
      saveState();
      saveToServer();
      renderCollection();
    });
    // Collection star rating handlers
    li.querySelectorAll(".star").forEach(btn => {
      btn.addEventListener("click", () => {
        const stars = Number(btn.dataset.star);
        const current = state.collection[key]?.rating || 0;
        state.collection[key].rating = (current === stars) ? 0 : stars;
        saveState();
        saveToServer();
        renderCollection();
      });
      btn.addEventListener("mouseenter", () => {
        const hoverStar = Number(btn.dataset.star);
        li.querySelectorAll(".star").forEach(s => {
          s.textContent = Number(s.dataset.star) <= hoverStar ? "★" : "☆";
        });
      });
      btn.addEventListener("mouseleave", () => {
        const savedRating = state.collection[key]?.rating || 0;
        li.querySelectorAll(".star").forEach(s => {
          s.textContent = Number(s.dataset.star) <= savedRating ? "★" : "☆";
        });
      });
    });
    elements.collectionList.append(li);
  });
}

function toggleIssue(storyId, index, key) {
  const current = issueState(storyId, index);
  storyProgress(storyId)[index] = { ...current, [key]: !current[key] };
  if (key === "read" && !current.read) {
    storyProgress(storyId)[index].skipped = false;
  }
  if (key === "skipped" && !current.skipped) {
    storyProgress(storyId)[index].read = false;
  }
  // Sync read state to collection
  if (key === "read") {
    const story = allStorylines().find(s => s.id === storyId);
    if (story?.issues[index]) {
      const nowRead = !current.read;
      const cover = coverFor(storyId, index);
      const coverImg = cover?.image ? (state.imageCache[cover.image] || cover.image) : "";
      const meta = { cover: coverImg };
      setCollectionRead(story.issues[index], nowRead);
      addToCollection(story.issues[index], meta);
    }
  }
  saveState();
  renderStoryList();
  renderAllStorylines();
  renderSelectedStory();
  if (state.activePage === "collection") renderCollection();
  if (key === "read" && !current.read) {
    maybePromptArchiveCompletedStory(storyId);
  }
}

function coverFor(storyId, index) {
  return state.covers?.[storyId]?.[index];
}

function setCover(storyId, index, cover) {
  state.covers[storyId] ||= {};
  state.covers[storyId][index] = cover;
}

function archiveStoryline(storyId) {
  if (!state.archivedStorylines.includes(storyId)) {
    state.archivedStorylines.push(storyId);
    saveState();
    render();
  }
}

function removeStoryline(storyId) {
  const story = state.customStorylines.find((item) => item.id === storyId);
  if (!story) return;
  if (!confirm(`Remove "${story.title}" from your arcs?`)) return;

  state.customStorylines = state.customStorylines.filter((item) => item.id !== storyId);
  state.archivedStorylines = state.archivedStorylines.filter((id) => id !== storyId);
  delete state.progress[storyId];
  delete state.covers[storyId];

  if (state.selectedId === storyId) {
    state.selectedId = allStorylines()[0]?.id || "";
    state.activePage = "myarcs";
  }

  saveState();
  render();
}

function unarchiveStoryline(storyId) {
  const index = state.archivedStorylines.indexOf(storyId);
  if (index > -1) {
    state.archivedStorylines.splice(index, 1);
    saveState();
    render();
  }
}

function parseIssue(issue) {
  // Match "Title #N", "Title#N", or "Title N" (with or without space/hash before number)
  const match = issue.match(/^(.*?)\s+#?([\w.-]+)$/) || issue.match(/^(.*?)#([\w.-]+)$/);
  if (!match) {
    return { query: issue, volume: issue, issueNumber: "" };
  }
  return {
    query: `${match[1].trim()} ${match[2].trim()}`,
    volume: match[1].trim(),
    issueNumber: match[2].trim()
  };
}

async function comicVineJsonp(path, params) {
  const cacheKey = `${path}:${JSON.stringify(params)}`;

  if (state.apiCache[cacheKey]) {
    const cached = state.apiCache[cacheKey];
    if (Date.now() - cached.timestamp < 3600000) {
      return Promise.resolve(cached.data);
    }
    delete state.apiCache[cacheKey];
  }

  const response = await fetch(`${window.location.origin}/api/comicvine-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${state.token}`
    },
    body: JSON.stringify({
      apiKey: state.comicVineKey,
      path,
      params
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Comic Vine request failed: ${response.status}`);
  }

  state.apiCache[cacheKey] = {
    data,
    timestamp: Date.now()
  };
  saveState();
  return data;
}

async function findComicVineCover(issue) {
  const parsed = parseIssue(issue);
  if (!state.comicVineKey.trim()) {
    return { status: "missing" };
  }
  
  // Add timeout for Comic Vine request
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Comic Vine request timed out")), 8000);
  });
  
  try {
    const data = await Promise.race([
      comicVineJsonp("search/", {
        resources: "issue",
        field_list: "name,image,volume,issue_number,cover_date,site_detail_url",
        limit: "5",
        query: parsed.query
      }),
      timeoutPromise
    ]);
    if (data?.error || data?.status_code === 100 || data?.status_code === 101) {
      return { status: "missing", error: data?.error || "Comic Vine rejected the API request." };
    }
    
    const results = Array.isArray(data?.results) ? data.results : [];
    const normalizedVolume = parsed.volume.toLowerCase();
    const normalizedNumber = parsed.issueNumber.toLowerCase();
    const match = results.find((result) => {
      const volumeName = result.volume?.name?.toLowerCase() || "";
      const resultNumber = String(result.issue_number || "").toLowerCase();
      return volumeName.includes(normalizedVolume) && (!normalizedNumber || resultNumber === normalizedNumber);
    }) || results[0];

    if (!match?.image) {
      return { status: "missing" };
    }

    const imageUrl = (match.image.small_url || match.image.medium_url || match.image.icon_url || "").replace(/^http:\/\//, "https://");

    // Check image cache
    if (state.imageCache[imageUrl]) {
      return {
        status: "loaded",
        source: "comicvine",
        name: [match.volume?.name, match.issue_number ? `#${match.issue_number}` : "", match.name].filter(Boolean).join(" "),
        image: state.imageCache[imageUrl],
        url: match.site_detail_url
      };
    }

    return {
      status: "loaded",
      source: "comicvine",
      name: [match.volume?.name, match.issue_number ? `#${match.issue_number}` : "", match.name].filter(Boolean).join(" "),
      image: imageUrl,
      url: match.site_detail_url
    };
  } catch (error) {
    return { status: "missing", error: error.message };
  }
}

async function findWebCover(issue) {
  try {
    const response = await fetch(`${window.location.origin}/api/web-cover-search?q=${encodeURIComponent(issue)}`);
    if (!response.ok) return { status: "missing" };
    const data = await response.json();
    const first = Array.isArray(data?.results) ? data.results[0] : null;
    if (!first?.image) return { status: "missing" };
    return { status: "loaded", image: first.image, url: first.url || "", name: first.title || issue };
  } catch {
    return { status: "missing" };
  }
}

async function fetchIssueDetail(issueTitle) {
  const parsed = parseIssue(issueTitle);

  // Try Comic Vine first (richest data)
  if (state.comicVineKey.trim()) {
    try {
      const data = await comicVineJsonp("search/", {
        resources: "issue",
        query: parsed.query,
        limit: "5",
        field_list: "id,name,volume,issue_number,cover_date,image,site_detail_url,description,person_credits,character_credits"
      });
      const results = Array.isArray(data?.results) ? data.results : [];
      const match = results.find(r => {
        const vol = (r.volume?.name || "").toLowerCase();
        const num = String(r.issue_number || "").toLowerCase();
        return vol.includes(parsed.volume.toLowerCase()) && (!parsed.issueNumber || num === parsed.issueNumber.toLowerCase());
      }) || results[0];
      if (match) {
        const coverImage = (match.image?.medium_url || match.image?.small_url || "").replace(/^http:\/\//, "https://");
        return {
          title: [match.volume?.name, match.issue_number ? `#${match.issue_number}` : "", match.name].filter(Boolean).join(" ") || issueTitle,
          cover: coverImage,
          description: stripHtml(match.description || ""),
          publishDate: match.cover_date || "",
          creators: (match.person_credits || []).map(p => ({ name: p.name, role: p.role })),
          characters: (match.character_credits || []).map(c => c.name),
          url: match.site_detail_url || "",
          source: "Comic Vine"
        };
      }
    } catch {}
  }

  // Try Marvel API
  try {
    const searchData = await marvelRequest(`/search/issues?q=${encodeURIComponent(parsed.query)}`);
    const items = searchData?.items || [];
    const match = items.find(i => {
      const sn = (i.seriesName || "").toLowerCase();
      const num = String(i.issueNumber || "").toLowerCase();
      return sn.includes(parsed.volume.toLowerCase()) && (!parsed.issueNumber || num === parsed.issueNumber.toLowerCase());
    }) || items[0];
    if (match?.id) {
      const detail = await marvelRequest(`/issues/${match.id}`);
      if (detail) {
        const coverUrl = detail.cover ? `${detail.cover.path}.${detail.cover.extension}`.replace(/^http:\/\//, "https://") : "";
        return {
          title: detail.title || issueTitle,
          cover: coverUrl,
          description: detail.description || "",
          publishDate: detail.onSaleDate ? detail.onSaleDate.substring(0, 10) : "",
          creators: (detail.creators || []).map(c => ({ name: c.name, role: c.role })),
          characters: [],
          url: detail.detailUrl || "",
          source: "Marvel"
        };
      }
    }
  } catch {}

  // Fallback: use whatever cover data we already have stored
  const story = selectedStory();
  const index = story?.issues?.indexOf(issueTitle) ?? -1;
  const cover = index >= 0 ? coverFor(story.id, index) : null;
  return {
    title: issueTitle,
    cover: cover?.image || "",
    description: "",
    publishDate: "",
    creators: [],
    characters: [],
    url: cover?.url || "",
    source: null
  };
}

function openIssueDetail(issueTitle, index, storyId) {
  const overlay = document.querySelector("#issueDetailOverlay");
  const content = document.querySelector("#issueDetailContent");
  overlay.classList.remove("hidden");
  content.innerHTML = `<div class="issue-detail-loading"><span class="spinner"></span> Loading…</div>`;

  fetchIssueDetail(issueTitle).then(detail => {
    const creatorsHtml = detail.creators.length
      ? `<div class="issue-detail-creators"><strong>Creators</strong>${detail.creators.map(c => `<span>${escapeHtml(c.name)}${c.role ? ` <em>(${escapeHtml(c.role)})</em>` : ""}</span>`).join("")}</div>`
      : "";
    const charsHtml = detail.characters.length
      ? `<div class="issue-detail-creators"><strong>Characters</strong>${detail.characters.slice(0, 12).map(c => `<span>${escapeHtml(c)}</span>`).join("")}</div>`
      : "";
    content.innerHTML = `
      ${detail.cover ? `<img src="${escapeHtml(detail.cover)}" alt="${escapeHtml(detail.title)} cover" class="issue-detail-cover" />` : ""}
      <h2 class="issue-detail-title">${escapeHtml(detail.title)}</h2>
      <div class="issue-detail-meta">
        ${detail.publishDate ? `<span>Published: ${escapeHtml(detail.publishDate)}</span>` : ""}
        ${detail.url ? `<span><a href="${escapeHtml(detail.url)}" target="_blank" rel="noreferrer">View online ↗</a></span>` : ""}
      </div>
      ${detail.description ? `<p class="issue-detail-description">${escapeHtml(detail.description)}</p>` : "<p class='issue-detail-description muted'>No summary available.</p>"}
      ${creatorsHtml}
      ${charsHtml}
      ${detail.source ? `<p class="issue-detail-source">Data from ${escapeHtml(detail.source)}</p>` : ""}
    `;
  }).catch(() => {
    content.innerHTML = `<p class="muted">Could not load issue details.</p>`;
  });
}

async function findPriorityCover(issue) {
  // Comic Vine is always the primary source for covers
  if (state.comicVineKey.trim()) {
    const comicVineCover = await findComicVineCover(issue);
    if (comicVineCover?.status === "loaded" && comicVineCover.image) {
      return comicVineCover;
    }
  }

  // Fallback sources only used when Comic Vine doesn't find the issue
  const gcdCover = await findGcdCover(issue);
  if (gcdCover?.status === "loaded" && gcdCover.image) {
    return gcdCover;
  }

  const marvelCover = await findMarvelCover(issue);
  if (marvelCover?.status === "loaded" && marvelCover.image) {
    return marvelCover;
  }

  const webCover = await findWebCover(issue);
  if (webCover?.status === "loaded" && webCover.image) {
    return webCover;
  }

  return { status: "missing" };
}

async function gcdRequest(path) {
  try {
    const response = await fetch(`${window.location.origin}/api/gcd-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ path })
    });
    if (!response.ok) {
      throw new Error(`GCD request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`GCD request failed: ${error.message}`);
  }
}

async function marvelRequest(path) {
  try {
    const response = await fetch(`${window.location.origin}/api/marvel-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({ path })
    });
    if (!response.ok) {
      throw new Error(`Marvel API request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Marvel API request failed: ${error.message}`);
  }
}

async function findGcdCover(issue) {
  const parsed = parseIssue(issue);
  try {
    // Check if the selected story has cached GCD issue metadata from import
    const story = selectedStory();
    if (story?.gcdIssueMeta) {
      const meta = story.gcdIssueMeta[String(parsed.issueNumber)] || Object.values(story.gcdIssueMeta)[0];
      if (meta?.cover) {
        const issueId = gcdIdFromUrl(meta.apiUrl);
        const imageUrl = meta.cover;
        if (state.imageCache[imageUrl]) {
          return { status: "loaded", name: `${story.title} #${parsed.issueNumber}`, image: state.imageCache[imageUrl], url: issueId ? `https://www.comics.org/issue/${issueId}/` : "" };
        }
        return { status: "loaded", name: `${story.title} #${parsed.issueNumber}`, image: imageUrl, url: issueId ? `https://www.comics.org/issue/${issueId}/` : "" };
      }
    }

    // Fallback: search GCD API
    const seriesData = await gcdRequest(`/series/name/${encodeURIComponent(parsed.volume)}/`);
    if (!Array.isArray(seriesData?.results) || seriesData.results.length === 0) {
      return { status: "missing" };
    }

    const series = seriesData.results[0];
    const seriesId = gcdIdFromUrl(series.api_url);
    if (!seriesId) return { status: "missing" };

    const issues = await searchGcdSeriesIssues(seriesId);
    const gcdIssue = issues.find(i => String(i.number) === String(parsed.issueNumber)) || issues[0];
    const imageUrl = gcdIssue?.cover || gcdIssue?.image_url;
    if (!imageUrl) return { status: "missing" };

    const issueId = gcdIdFromUrl(gcdIssue.api_url);

    if (state.imageCache[imageUrl]) {
      return { status: "loaded", name: `${series.name} #${gcdIssue.number}`, image: state.imageCache[imageUrl], url: issueId ? `https://www.comics.org/issue/${issueId}/` : "" };
    }
    return { status: "loaded", name: `${series.name} #${gcdIssue.number}`, image: imageUrl, url: issueId ? `https://www.comics.org/issue/${issueId}/` : "" };
  } catch (error) {
    return { status: "missing" };
  }
}

async function findMarvelCover(issue) {
  const parsed = parseIssue(issue);
  try {
    const searchData = await marvelRequest(`/search/issues?q=${encodeURIComponent(parsed.query)}`);
    if (!Array.isArray(searchData?.items) || searchData.items.length === 0) {
      return { status: "missing" };
    }

    const normalizedVolume = parsed.volume.toLowerCase();
    const normalizedNumber = parsed.issueNumber.toLowerCase();
    const match = searchData.items.find((item) => {
      const seriesName = (item.seriesName || "").toLowerCase();
      const itemNumber = String(item.issueNumber || "").toLowerCase();
      return seriesName.includes(normalizedVolume) && (!normalizedNumber || itemNumber === normalizedNumber);
    }) || searchData.items[0];

    if (!match?.id) return { status: "missing" };

    // Fetch full issue details for cover image
    const issueData = await marvelRequest(`/issues/${match.id}`);
    if (!issueData?.cover?.path) return { status: "missing" };

    const imageUrl = `${issueData.cover.path}.${issueData.cover.extension}`.replace(/^http:/, "https:");

    if (state.imageCache[imageUrl]) {
      return {
        status: "loaded",
        name: issueData.title || match.title,
        image: state.imageCache[imageUrl],
        url: issueData.detailUrl || ""
      };
    }

    return {
      status: "loaded",
      name: issueData.title || match.title,
      image: imageUrl,
      url: issueData.detailUrl || ""
    };
  } catch (error) {
    return { status: "missing" };
  }
}

async function cacheImage(imageUrl) {
  if (!imageUrl) return;
  imageUrl = imageUrl.replace(/^http:\/\//, "https://");

  try {
    // Check if image already exists on server
    const checkResponse = await fetch(`${window.location.origin}/api/covers/check`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token || ""}`
      },
      body: JSON.stringify({ imageUrl })
    });
    const checkData = await checkResponse.json();
    
    if (checkData.exists) {
      // Image already cached on server
      state.imageCache[imageUrl] = `${window.location.origin}/api/covers/image/${checkData.filename}`;
      saveState();
      return;
    }

    // Have the server fetch and save the image (avoids CORS on direct browser fetch)
    const fetchResponse = await fetch(`${window.location.origin}/api/covers/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token || ""}`
      },
      body: JSON.stringify({ imageUrl })
    });
    const fetchData = await fetchResponse.json();

    if (fetchData.success) {
      state.imageCache[imageUrl] = `${window.location.origin}/api/covers/image/${fetchData.filename}`;
      saveState();
    }
  } catch (error) {
    // Failed to cache image, continue without it
  }
}

async function loadCoversForSelectedStory() {
  const story = selectedStory();
  if (!story) return;

  elements.loadCovers.disabled = true;
  elements.loadCovers.classList.add("loading");
  const dataSourceName = state.comicVineKey.trim() ? "Comic Vine, then fallback sources" : "configured sources";
  elements.apiStatus.innerHTML = `<span class="spinner"></span> Loading covers from ${dataSourceName} for ${story.title}...`;

  for (let index = 0; index < story.issues.length; index += 1) {
    // Skip only if we already have a Comic Vine cover — always re-fetch non-CV covers
    const existing = coverFor(story.id, index);
    if (existing?.image && existing?.source === "comicvine") continue;
    elements.apiStatus.innerHTML = `<span class="spinner"></span> Loading cover ${index + 1} of ${story.issues.length}...`;
    try {
      const cover = await findPriorityCover(story.issues[index]);
      if (cover?.status === "loaded" && cover.image) {
        // Cache the image server-side so it loads reliably
        await cacheImage(cover.image);
        // Use the locally cached URL if available, otherwise keep the original
        cover.image = state.imageCache[cover.image] || cover.image;
      }
      setCover(story.id, index, cover);
    } catch (error) {
      setCover(story.id, index, { status: "missing" });
    }
    saveState();
    renderSelectedStory();
    await new Promise((resolve) => window.setTimeout(resolve, 500));
  }

  elements.apiStatus.textContent = "Cover lookup finished.";
  elements.loadCovers.disabled = false;
  elements.loadCovers.classList.remove("loading");
  backfillCollectionCovers();
  saveState();
  
  // Automatically save to server if logged in
  if (state.isAuthenticated && state.token) {
    try {
      await saveToServer();
      elements.apiStatus.textContent = "Cover lookup finished and saved to server.";
    } catch (error) {
      elements.apiStatus.textContent = "Cover lookup finished. (Could not auto-save to server)";
    }
  } else {
    elements.apiStatus.textContent = "Cover lookup finished. Click Save to Server to persist covers.";
  }
  
  render();
}

function cleanKomgaUrl() {
  return (state.komga?.url || "").trim().replace(/\/+$/, "");
}

function setKomgaSyncIndicator(status, message) {
  elements.komgaSyncIndicator.className = `sync-indicator ${status}`;
  elements.komgaSyncIndicator.querySelector("p").textContent = message;
  // Remove any previous action buttons (e.g. "Add to Mylar3")
  elements.komgaSyncIndicator.querySelectorAll(".sync-indicator-action").forEach(el => el.remove());
}

function komgaHeaders() {
  const credentials = `${state.komga?.username || ""}:${state.komga?.password || ""}`;
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Basic ${btoa(unescape(encodeURIComponent(credentials)))}`
  };
}

function saveKomgaSession() {
  sessionStorage.setItem(komgaSessionKey, JSON.stringify({
    url: state.komga?.url || "",
    username: state.komga?.username || "",
    password: state.komga?.password || ""
  }));
}

function saveMylarSession() {
  sessionStorage.setItem(mylarSessionKey, JSON.stringify({
    url: state.mylar?.url || "",
    apiKey: state.mylar?.apiKey || "",
    httpUser: state.mylar?.httpUser || "",
    httpPass: state.mylar?.httpPass || ""
  }));
}

async function komgaRequest(path, options = {}) {
  const baseUrl = cleanKomgaUrl();
  if (!baseUrl || !state.komga?.username || !state.komga?.password) {
    throw new Error("Komga settings are incomplete.");
  }

  if (window.location.protocol === "file:") {
    throw new Error("Open ARCS! from the local server URL, not file mode, so Komga sync can use the proxy.");
  }

  let requestBody = undefined;
  if (options.body) {
    try {
      requestBody = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    } catch (error) {
      throw new Error(`Invalid JSON in request body: ${error.message}`);
    }
  }

  let response;
  try {
    response = await fetch(`${window.location.origin}/api/komga-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        baseUrl,
        username: state.komga.username,
        password: state.komga.password,
        path,
        method: options.method || "GET",
        body: requestBody
      })
    });
  } catch (error) {
    throw new Error(`Browser could not reach the ARCS! Komga proxy at ${window.location.origin}. Make sure the ARCS! server is running.`);
  }

  if (!response.ok) {
    let detail = "";
    let errorText = "";
    try {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        detail = data?.error ? `: ${data.error}` : "";
        errorText = text;
      } catch {
        errorText = text;
      }
    } catch {
      errorText = "Unable to read error response";
    }
    throw new Error(`Komga request failed: ${response.status}${detail}. Response: ${errorText}`);
  }

  if (response.status === 204) return null;
  const responseText = await response.text();
  if (!responseText) return null;
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

// ── Toast notifications ─────────────────────────────────────────────────────
function showToast(title, msg = "", type = "info", durationMs = 5000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icons = { success: "✅", warning: "⚠️", error: "❌", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || "ℹ️"}</span>
    <span class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${msg ? `<div class="toast-msg">${escapeHtml(msg)}</div>` : ""}
    </span>
  `;
  container.appendChild(toast);
  const dismiss = () => {
    toast.classList.add("toast-out");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  };
  const timer = setTimeout(dismiss, durationMs);
  toast.addEventListener("click", () => { clearTimeout(timer); dismiss(); });
}

// ── Mylar3 auto-sync on import ──────────────────────────────────────────────
function parseIssueTitleForMylar(title) {
  // "Amazing Spider-Man #300" → { series: "Amazing Spider-Man", number: "300" }
  const m = String(title).match(/^(.+?)\s*#(\d+[\w.]*)(.*)$/);
  if (m) return { series: m[1].trim(), number: m[2] };
  return { series: String(title).trim(), number: null };
}

// Returns 0-100 confidence that mylarName refers to the same series as searchName.
// Strips trailing year "(2020)" before comparing so "X-Men (2024)" still matches "X-Men".
// A score >= 70 is considered a reliable match.
function mylarMatchScore(mylarName, searchName) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const stripYear = s => s.replace(/\s*\(\d{4}\)\s*$/, "").trim();
  const a = norm(stripYear(mylarName));
  const b = norm(stripYear(searchName));
  if (!a || !b) return 0;
  if (a === b) return 100;
  const lenRatio = Math.min(a.length, b.length) / Math.max(a.length, b.length);
  if (a.startsWith(b) || b.startsWith(a)) return Math.round(80 * lenRatio);
  if (a.includes(b) || b.includes(a)) return Math.round(50 * lenRatio);
  return 0;
}

// Loose boolean used for library scan (getIndex) — controlled threshold.
function mylarSeriesMatch(mylarName, arcName) {
  return mylarMatchScore(mylarName, arcName) >= 70;
}

async function autoSyncMylarForStory(storyId) {
  // Only run if Mylar3 is configured
  if (!state.mylar?.url || !state.mylar?.apiKey) return;

  const story = allStorylines().find(s => s.id === storyId);
  if (!story || !story.issues?.length) return;

  try {
    // Fetch the full Mylar3 library index
    let indexData;
    try {
      indexData = await mylarRequest("/api?cmd=getIndex");
    } catch (e) {
      console.warn("[Mylar auto-sync] getIndex failed:", e.message);
      return;
    }

    const library = Array.isArray(indexData?.data)
      ? indexData.data
      : Array.isArray(indexData) ? indexData : [];

    if (!library.length) return;

    // Collect unique series names from the imported arc
    const seriesNeeded = new Map(); // normSeries → original series name
    story.issues.forEach(issue => {
      const { series } = parseIssueTitleForMylar(issue);
      const norm = series.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seriesNeeded.has(norm)) seriesNeeded.set(norm, series);
    });

    // Match Mylar3 library entries to the series we need
    const matchedSeries = new Map(); // normSeries → mylarSeriesEntry
    library.forEach(entry => {
      const mylarName = entry.ComicName || entry.name || "";
      seriesNeeded.forEach((arcSeries, norm) => {
        if (!matchedSeries.has(norm) && mylarSeriesMatch(mylarName, arcSeries)) {
          matchedSeries.set(norm, entry);
        }
      });
    });

    if (!matchedSeries.size) return; // Nothing in Mylar3 for this arc

    // Fetch issues for each matched series
    const mylarIssues = new Map(); // normSeries → [issues]
    await Promise.all([...matchedSeries.entries()].map(async ([norm, entry]) => {
      const seriesId = entry.ComicID || entry.id;
      if (!seriesId) return;
      try {
        const issueData = await mylarRequest(`/api?cmd=getIssues&id=${encodeURIComponent(seriesId)}`);
        const issues = Array.isArray(issueData?.data) ? issueData.data
          : Array.isArray(issueData) ? issueData : [];
        mylarIssues.set(norm, issues);
      } catch { /* series not fetchable */ }
    }));

    // Match each arc issue to a Mylar3 issue and update progress
    let matched = 0, owned = 0, read = 0;
    story.issues.forEach((issueTitle, index) => {
      const { series, number } = parseIssueTitleForMylar(issueTitle);
      const norm = series.toLowerCase().replace(/[^a-z0-9]/g, "");
      const issues = mylarIssues.get(norm);
      if (!issues?.length) return;

      const mylarIssue = number
        ? issues.find(i => String(i.Issue_Number || i.issue_number || i.number || "").replace(/^0+/, "") === String(number).replace(/^0+/, ""))
        : issues[0];

      if (!mylarIssue) return;
      matched++;

      const status = (mylarIssue.Status || mylarIssue.status || "").toLowerCase();
      const isDownloaded = status === "downloaded" || status === "read";
      const isWanted = status === "wanted";

      const current = issueState(story.id, index);
      if (isDownloaded && !current.owned) {
        storyProgress(story.id)[index] = { ...current, owned: true };
        owned++;
      }
      if (isDownloaded && !current.read) {
        storyProgress(story.id)[index] = { ...storyProgress(story.id)[index], read: true };
        read++;
        setCollectionRead(issueTitle, true);
      }
      // Save mylar match for later sync
      saveMylarMatch(story.id, index, mylarIssue);
    });

    if (matched === 0) return; // Nothing matched — don't bother the user

    saveState();
    renderSelectedStory();
    renderStoryList();
    renderAllStorylines();

    const type = read > 0 ? "success" : owned > 0 ? "info" : "info";
    const details = [
      `${matched}/${story.issues.length} issues found in Mylar3`,
      owned > 0 ? `${owned} marked owned` : null,
      read > 0 ? `${read} marked read` : null
    ].filter(Boolean).join(" · ");
    showToast("Mylar3 sync", details, type);

  } catch (e) {
    // Silent fail — auto-sync should never break the import flow
    console.warn("[Mylar auto-sync]", e.message);
  }
}

async function mylarRequest(path, options = {}) {
  const baseUrl = state.mylar.url;
  if (!baseUrl) {
    throw new Error("Mylar3 URL not configured. Please set it in Profile settings.");
  }

  let requestBody = null;
  if (options.body) {
    try {
      requestBody = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
    } catch (error) {
      throw new Error(`Invalid JSON in request body: ${error.message}`);
    }
  }

  let response;
  try {
    response = await fetch(`${window.location.origin}/api/mylar-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.token}`
      },
      body: JSON.stringify({
        baseUrl,
        apiKey: state.mylar.apiKey,
        httpUser: state.mylar.httpUser || "",
        httpPass: state.mylar.httpPass || "",
        path,
        method: options.method || "GET",
        body: requestBody
      })
    });
  } catch (error) {
    throw new Error("Browser could not reach the ARCS! Mylar3 proxy. Make sure the local server is running.");
  }

  if (!response.ok) {
    let errorText = "";
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unable to read error response";
    }
    if (response.status === 401) {
      throw new Error("Mylar3 rejected the API key (401). Re-enter your key in Profile → Mylar3 and click Save.");
    }
    let detail = "";
    try { detail = JSON.parse(errorText)?.error ? `: ${JSON.parse(errorText).error}` : ""; } catch { /* */ }
    throw new Error(`Mylar3 request failed: ${response.status}${detail}. Response: ${errorText.substring(0, 200)}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function komgaSearchBody(query) {
  return JSON.stringify({
    condition: { allOf: [] },
    fullTextSearch: query
  });
}

async function testKomgaConnection() {
  elements.komgaStatus.innerHTML = `<span class="spinner"></span> Testing Komga connection...`;
  elements.testKomga.classList.add("loading");
  elements.testKomga.disabled = true;
  try {
    let success = false;
    let lastError = null;
    
    // Try v2 API first
    try {
      await komgaRequest("/api/v2/users/me");
      success = true;
    } catch (error) {
      lastError = error;
      // If v2 fails, try v1 API
      try {
        await komgaRequest("/api/v1/books/list?page=0&size=1", {
          method: "POST",
          body: komgaSearchBody("")
        });
        success = true;
      } catch (v1Error) {
        lastError = v1Error;
      }
    }
    
    if (success) {
      elements.komgaStatus.textContent = "Komga connection works.";
    } else {
      throw lastError;
    }
  } catch (error) {
    if (error.message.includes("401")) {
      elements.komgaStatus.textContent = "Komga rejected the login. Check that your username and password are correct in Komga settings.";
    } else if (error.message.includes("could not reach")) {
      elements.komgaStatus.textContent = "Could not reach the Komga proxy. Make sure the ARCS! server is running.";
    } else {
      elements.komgaStatus.textContent = error.message;
    }
  } finally {
    elements.testKomga.classList.remove("loading");
    elements.testKomga.disabled = false;
  }
}

async function testMylarConnection() {
  elements.mylarStatus.innerHTML = `<span class="spinner"></span> Testing Mylar3 connection...`;
  elements.testMylar.classList.add("loading");
  elements.testMylar.disabled = true;
  try {
    const data = await mylarRequest("/api?cmd=getVersion");
    const version = data?.data?.installed_version || data?.version || "unknown";
    elements.mylarStatus.textContent = `Mylar3 connection works. Version: ${version}`;
  } catch (error) {
    if (error.message.includes("401") || error.message.includes("403")) {
      elements.mylarStatus.textContent = "Mylar3 rejected the API key. Check your key in Mylar3 → Settings → Web Interface.";
    } else if (error.message.includes("could not reach") || error.message.includes("proxy")) {
      elements.mylarStatus.textContent = "Could not reach Mylar3. Check the URL and that ALLOW_PRIVATE_PROXY=true is set in .env.";
    } else {
      elements.mylarStatus.textContent = `Connection failed: ${error.message}`;
    }
  } finally {
    elements.testMylar.classList.remove("loading");
    elements.testMylar.disabled = false;
  }
}

async function syncMylarForSelectedStory() {
  const story = allStorylines().find(s => s.id === state.selectedId);
  if (!story) {
    elements.readingHint.textContent = "No storyline selected.";
    return;
  }

  if (!state.mylar?.url || !state.mylar?.apiKey) {
    state.activePage = "profile";
    saveState();
    render();
    elements.mylarStatus.textContent = "Add your Mylar3 settings first.";
    return;
  }

  elements.syncMylar.disabled = true;
  elements.syncMylar.classList.add("loading");
  elements.readingHint.textContent = "Syncing with Mylar3...";
  setKomgaSyncIndicator("syncing", "Syncing with Mylar3...");

  let matched = 0, downloaded = 0, missing = 0;
  const missingIndices = [];

  try {
    // 1. Fetch Mylar3 library index using correct cmd API
    let indexData;
    try {
      indexData = await mylarRequest("/api?cmd=getIndex");
    } catch (e) {
      throw new Error(`Could not reach Mylar3: ${e.message}`);
    }
    // Normalise field names — Mylar3 uses inconsistent casing across commands
    const mf = (obj, ...keys) => { for (const k of keys) if (obj[k] != null) return obj[k]; return ""; };

    // getIndex can return { data: [...] } or a direct array
    const library = Array.isArray(indexData?.data) ? indexData.data
      : Array.isArray(indexData) ? indexData : [];
    console.log(`[Mylar getIndex] ${library.length} comics. Sample keys:`, Object.keys(library[0] || {}));

    if (!library.length) {
      const msg = "Mylar3 library appears empty. Add some comics to Mylar3 first.";
      elements.readingHint.textContent = msg;
      setKomgaSyncIndicator("warning", msg);
      return;
    }

    // 2. Find unique series in this arc and match against library
    const seriesNeeded = new Map();
    story.issues.forEach(issue => {
      const { series } = parseIssueTitleForMylar(issue);
      const norm = series.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seriesNeeded.has(norm)) seriesNeeded.set(norm, series);
    });
    console.log(`[Mylar sync] arc series needed:`, [...seriesNeeded.values()]);

    const matchedSeriesMap = new Map(); // norm → library entry
    library.forEach(entry => {
      const mylarName = mf(entry, "ComicName", "comicname", "name", "series");
      seriesNeeded.forEach((arcSeries, norm) => {
        if (!matchedSeriesMap.has(norm) && mylarSeriesMatch(mylarName, arcSeries)) {
          matchedSeriesMap.set(norm, entry);
          console.log(`[Mylar sync] matched "${arcSeries}" → "${mylarName}" (id: ${mf(entry,"ComicID","comicid","id")})`);
        }
      });
    });
    console.log(`[Mylar sync] ${matchedSeriesMap.size}/${seriesNeeded.size} series matched in library`);

    // 3. Fetch issue lists for matched series
    const mylarIssuesMap = new Map(); // norm → [mylar issues]
    await Promise.all([...matchedSeriesMap.entries()].map(async ([norm, entry]) => {
      const seriesId = mf(entry, "ComicID", "comicid", "id");
      if (!seriesId) { console.warn("[Mylar sync] no series ID for entry:", entry); return; }
      try {
        const issueData = await mylarRequest(`/api?cmd=getIssues&id=${encodeURIComponent(seriesId)}`);
        const issues = Array.isArray(issueData?.data) ? issueData.data
          : Array.isArray(issueData) ? issueData : [];
        console.log(`[Mylar getIssues ${seriesId}] ${issues.length} issues. Sample keys:`, Object.keys(issues[0] || {}));
        mylarIssuesMap.set(norm, issues);
      } catch (e) { console.warn("[Mylar sync] getIssues failed:", e.message); }
    }));

    // 4. Match each arc issue and update progress
    for (let index = 0; index < story.issues.length; index++) {
      const issueTitle = story.issues[index];
      const { series, number } = parseIssueTitleForMylar(issueTitle);
      const norm = series.toLowerCase().replace(/[^a-z0-9]/g, "");
      const issues = mylarIssuesMap.get(norm);

      if (!issues?.length) {
        missing++;
        missingIndices.push(index);
        continue;
      }

      const mylarIssue = number
        ? issues.find(i => {
            const n = String(mf(i, "Issue_Number", "issue_number", "IssueNumber", "number")).replace(/^0+/, "");
            return n === String(number).replace(/^0+/, "");
          })
        : issues[0];

      if (!mylarIssue) {
        missing++;
        missingIndices.push(index);
        continue;
      }

      matched++;
      saveMylarMatch(story.id, index, mylarIssue);

      const status = (mylarIssue.Status || mylarIssue.status || "").toLowerCase();
      if (status === "downloaded" || status === "read") {
        const current = issueState(story.id, index);
        storyProgress(story.id)[index] = { ...current, owned: true, read: true, skipped: false };
        setCollectionRead(issueTitle, true);
        downloaded++;
      }
    }

    saveState();
    renderSelectedStory();
    renderStoryList();
    renderAllStorylines();
    if (state.activePage === "collection") renderCollection();

    const statusType = missing > 0 ? "warning" : "success";
    const msg = `Mylar3 sync: ${matched} matched, ${downloaded} downloaded, ${missing} not in library.`;
    elements.readingHint.textContent = msg;
    setKomgaSyncIndicator(statusType, msg);

    // Offer to add missing series to Mylar3 watchlist
    if (missing > 0) {
      const uniqueMissingSeries = [...new Set(
        missingIndices.map(i => parseIssueTitleForMylar(story.issues[i]).series)
      )];
      const btn = document.createElement("button");
      btn.className = "sync-indicator-action secondary-action";
      btn.type = "button";
      btn.textContent = `Add ${uniqueMissingSeries.length} missing series to Mylar3`;
      btn.addEventListener("click", () => addMissingSeriesToMylar(story.id, missingIndices, btn));
      elements.komgaSyncIndicator.appendChild(btn);
      showToast("Mylar3 sync", `${missing} issues not in Mylar3 library.`, "warning");
    }

  } catch (error) {
    elements.readingHint.textContent = `Mylar3 sync failed: ${error.message}`;
    setKomgaSyncIndicator("failed", `Mylar3 sync failed: ${error.message}`);
    showToast("Mylar3 sync failed", error.message, "error");
  } finally {
    elements.syncMylar.disabled = false;
    elements.syncMylar.classList.remove("loading");
  }
}

async function addMissingSeriesToMylar(storyId, missingIndices, triggerBtn) {
  const story = allStorylines().find(s => s.id === storyId);
  if (!story) return;

  if (missingIndices.length > 15) {
    const confirmed = window.confirm(
      `This will add ${missingIndices.length} issues to Mylar3. Are you sure you want to continue?`
    );
    if (!confirmed) return;
  }

  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = "Adding to Mylar3 (may take up to a minute)…"; }

  // Build a map of which issue numbers are wanted per series
  const seriesWantedNumbers = new Map(); // normSeries → Set of issue numbers
  missingIndices.forEach(i => {
    const { series, number } = parseIssueTitleForMylar(story.issues[i]);
    const norm = series.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seriesWantedNumbers.has(norm)) seriesWantedNumbers.set(norm, { series, numbers: new Set() });
    if (number) seriesWantedNumbers.get(norm).numbers.add(String(number).replace(/^0+/, ""));
  });

  let added = 0, alreadyHave = 0, failed = 0, noMatch = 0, issuesMarked = 0;

  for (const [norm, { series: seriesName, numbers: wantedNumbers }] of seriesWantedNumbers) {
    try {
      // 1. Find the series in Comic Vine via Mylar3
      const searchData = await mylarRequest(`/api?cmd=findComic&name=${encodeURIComponent(seriesName)}`);
      let results = [];
      if (Array.isArray(searchData)) results = searchData;
      else if (Array.isArray(searchData?.data?.results)) results = searchData.data.results;
      else if (Array.isArray(searchData?.data)) results = searchData.data;
      else if (Array.isArray(searchData?.results)) results = searchData.results;

      if (!results.length) { failed++; continue; }

      const scored = results
        .map(r => ({ r, score: mylarMatchScore(r.name || r.comicname || r.ComicName || "", seriesName) }))
        .filter(x => x.score >= 70)
        .sort((a, b) => b.score - a.score);

      if (!scored.length) { noMatch++; continue; }

      const best = scored[0].r;
      const comicId = best.comicid || best.ComicID || best.id;
      if (!comicId) { failed++; continue; }

      // 2. Add the series to Mylar3
      const addResult = await mylarRequest(`/api?cmd=addComic&id=${encodeURIComponent(comicId)}`);
      const dataMsg = String(addResult?.data || "").toLowerCase();
      if (addResult?.success === false && dataMsg.includes("already")) {
        alreadyHave++;
      } else if (addResult?.success === false) {
        failed++;
        continue;
      } else {
        added++;
      }

      // 3. Get the full issue list for this series from Mylar3
      // Use the Mylar3 internal ComicID (may differ from CV id after addComic)
      let mylarComicId = comicId;
      try {
        const indexData = await mylarRequest("/api?cmd=getIndex");
        const library = Array.isArray(indexData?.data) ? indexData.data : Array.isArray(indexData) ? indexData : [];
        const entry = library.find(e => {
          const eid = String(e.ComicID || e.comicid || e.id || "");
          return eid === String(comicId) || mylarSeriesMatch(e.ComicName || e.name || "", seriesName);
        });
        if (entry) mylarComicId = entry.ComicID || entry.comicid || entry.id || comicId;
      } catch { /* use original comicId */ }

      // 4. Wait for Mylar3 to finish indexing the newly-added series, then fetch issues.
      // Mylar3 indexes asynchronously after addComic, so getIssues may return empty
      // immediately. Retry up to 6 times with a 3-second gap (18 seconds total).
      let allIssues = [];
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise(r => setTimeout(r, attempt === 0 ? 2000 : 3000));
        try {
          const issueData = await mylarRequest(`/api?cmd=getIssues&id=${encodeURIComponent(mylarComicId)}`);
          allIssues = Array.isArray(issueData?.data) ? issueData.data : Array.isArray(issueData) ? issueData : [];
        } catch { /* ignore, will retry */ }
        if (allIssues.length > 0) break;
        console.log(`[Mylar] getIssues attempt ${attempt + 1} returned 0 issues, retrying…`);
      }

      if (!allIssues.length) {
        console.warn(`[Mylar] Could not fetch issues for "${seriesName}" after retries — series was added but issues could not be filtered.`);
      }

      // 5. Mark arc issues as "wanted", skip everything else that isn't downloaded
      for (const issue of allIssues) {
        const issueId = issue.IssueID || issue.issueid || issue.id;
        if (!issueId) continue;
        const issueNum = String(issue.Issue_Number || issue.issue_number || issue.IssueNumber || "").replace(/^0+/, "");
        const status = (issue.Status || issue.status || "").toLowerCase();
        const isDownloaded = status === "downloaded" || status === "read";
        if (isDownloaded) continue; // never touch already-downloaded issues

        if (wantedNumbers.size === 0 || wantedNumbers.has(issueNum)) {
          // This issue is in the arc — mark as wanted
          await mylarRequest(`/api?cmd=markissues&action=wanted&issueid=${encodeURIComponent(issueId)}`);
          issuesMarked++;
        } else {
          // Not in the arc — skip it so Mylar3 doesn't download it
          await mylarRequest(`/api?cmd=markissues&action=skipped&issueid=${encodeURIComponent(issueId)}`);
        }
      }

    } catch (e) {
      console.error(`[Mylar] error for "${seriesName}":`, e.message);
      failed++;
    }
  }

  if (triggerBtn) triggerBtn.remove();

  const parts = [
    added > 0 ? `${added} series added` : null,
    alreadyHave > 0 ? `${alreadyHave} already in Mylar3` : null,
    issuesMarked > 0 ? `${issuesMarked} specific issues marked wanted` : null,
    noMatch > 0 ? `${noMatch} ambiguous (skipped)` : null,
    failed > 0 ? `${failed} failed` : null
  ].filter(Boolean).join(", ");

  const allBad = added === 0 && alreadyHave === 0;
  setKomgaSyncIndicator(allBad ? "warning" : "success", `Mylar3: ${parts}.`);
  showToast("Added to Mylar3", parts || "Nothing to add", added > 0 ? "success" : "warning");
}

function saveMylarMatch(storyId, index, comic) {
  if (!state.mylarMatches[storyId]) {
    state.mylarMatches[storyId] = {};
  }
  state.mylarMatches[storyId][index] = comic;
  saveState();
}

async function importMylarReadingList() {
  try {
    const data = await mylarRequest("/api/readlist");
    const readingLists = Array.isArray(data) ? data : (data?.data || []);
    
    if (readingLists.length === 0) {
      elements.syncStatus.textContent = "No reading lists found in Mylar3.";
      return;
    }

    // Import the first reading list (or add UI to select which one)
    const list = readingLists[0];
    const issues = list?.issues || [];
    
    // Create a custom storyline from the reading list
    const customStoryline = {
      id: `mylar-${Date.now()}`,
      name: list.name || "Mylar3 Import",
      publisher: "Custom",
      issues: issues.map((issue) => issue.comicName || issue.title || "Unknown"),
      description: `Imported from Mylar3 reading list: ${list.name || "Unknown"}`
    };
    
    state.customStorylines.push(customStoryline);
    saveState();
    saveToServer();
    render();
    elements.syncStatus.textContent = `Imported reading list "${list.name}" with ${issues.length} issues.`;
  } catch (error) {
    elements.syncStatus.textContent = `Failed to import reading list: ${error.message}`;
  }
}

async function exportMylarReadingList() {
  const story = state.storylines.find((s) => s.id === state.selectedId);
  if (!story) {
    elements.syncStatus.textContent = "No storyline selected to export.";
    return;
  }

  try {
    // Create a reading list in Mylar3
    const readingList = {
      name: story.name,
      description: `Exported from ARCS! Comic Reading Tracker`,
      issues: story.issues.map((issue, index) => ({
        comicName: issue,
        status: issueState(story.id, index).read ? "Read" : "Unread"
      }))
    };

    await mylarRequest("/api/readlist", {
      method: "POST",
      body: readingList
    });

    elements.syncStatus.textContent = `Exported "${story.name}" to Mylar3 as a reading list.`;
  } catch (error) {
    elements.syncStatus.textContent = `Failed to export reading list: ${error.message}`;
  }
}

function exportCbl() {
  const story = selectedStory();
  if (!story) {
    elements.syncStatus.textContent = "No storyline selected to export.";
    return;
  }

  try {
    // Create CBL XML format
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ReadingList xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n';
    xml += '  <Books>\n';

    story.issues.forEach((issue, index) => {
      const parsed = parseIssue(issue);
      const current = issueState(story.id, index);
      
      xml += '    <Book>\n';
      xml += `      <Series>${escapeHtml(parsed.volume || issue)}</Series>\n`;
      xml += `      <Number>${escapeHtml(parsed.issueNumber || '')}</Number>\n`;
      xml += `      <Read>${current.read ? 'true' : 'false'}</Read>\n`;
      xml += '    </Book>\n';
    });

    xml += '  </Books>\n';
    xml += '</ReadingList>';

    // Create and download the file
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.replace(/[^a-z0-9]/gi, '_')}.cbl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    elements.syncStatus.textContent = `Exported "${story.title}" as CBL file.`;
  } catch (error) {
    elements.syncStatus.textContent = `Failed to export CBL: ${error.message}`;
  }
}

function importCbl() {
  elements.cblFileInput.click();
}

elements.cblFileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const xmlContent = e.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      // Parse CBL format
      const books = xmlDoc.querySelectorAll("Book");
      if (books.length === 0) {
        elements.syncStatus.textContent = "No books found in CBL file.";
        return;
      }

      const issues = [];
      books.forEach((book) => {
        const series = book.querySelector("Series")?.textContent || "";
        const number = book.querySelector("Number")?.textContent || "";
        const volume = book.querySelector("Volume")?.textContent || "";
        
        if (series && number) {
          issues.push(`${series} #${number}`);
        } else if (series) {
          issues.push(series);
        } else if (volume) {
          issues.push(volume);
        }
      });

      if (issues.length === 0) {
        elements.syncStatus.textContent = "Could not parse any issues from CBL file.";
        return;
      }

      // Create custom storyline from CBL
      const customStoryline = {
        id: `cbl-${Date.now()}`,
        title: file.name.replace('.cbl', '').replace('.xml', ''),
        publisher: "Custom",
        years: "CBL Import",
        note: "Imported from CBL file.",
        issues: issues
      };

      state.customStorylines.push(customStoryline);
      state.selectedId = customStoryline.id;
      state.activePage = "reader";
      saveState();
      saveToServer();
      render();

      elements.syncStatus.textContent = `Imported CBL file with ${issues.length} issues as "${customStoryline.title}".`;
      autoSyncMylarForStory(customStoryline.id);
    } catch (error) {
      elements.syncStatus.textContent = `Failed to import CBL: ${error.message}`;
    }
  };

  reader.readAsText(file);
  event.target.value = ""; // Reset file input
});

async function findKomgaBook(issue) {
  const parsed = parseIssue(issue);
  const queries = [...new Set([issue, parsed.query, parsed.volume].filter(Boolean))];

  for (const query of queries) {
    let data;
    try {
      data = await komgaRequest("/api/v1/books/list?page=0&size=8", {
        method: "POST",
        body: komgaSearchBody(query)
      });
    } catch {
      data = await komgaRequest(`/api/v1/books?search=${encodeURIComponent(query)}&page=0&size=8`);
    }
    const books = Array.isArray(data?.content) ? data.content : [];
    const matched = bestKomgaBookMatch(books, parsed);
    if (matched) return matched;
  }

  return null;
}

function bestKomgaBookMatch(books, parsed) {
  const number = parsed.issueNumber.replace(/^0+/, "").toLowerCase();
  const volume = parsed.volume.toLowerCase();

  return books.find((book) => {
    const title = `${book.name || ""} ${book.metadata?.title || ""} ${book.seriesTitle || ""}`.toLowerCase();
    const bookNumber = String(book.metadata?.number || book.metadata?.numberSort || book.number || "").replace(/^0+/, "").toLowerCase();
    const hasVolume = !volume || title.includes(volume);
    const hasNumber = !number || bookNumber === number || title.includes(`#${number}`) || title.includes(` ${number} `);
    return hasVolume && hasNumber;
  }) || books[0] || null;
}

function saveKomgaMatch(storyId, index, book) {
  state.komgaMatches[storyId] ||= {};
  state.komgaMatches[storyId][index] = {
    id: book.id,
    name: book.name || book.metadata?.title || "Komga book"
  };
}

// Silently check read progress for already-matched Komga books.
// Only looks up issues that have a komgaMatch — no slow book searches.
async function autoSyncKomgaReadProgress(storyId) {
  if (!cleanKomgaUrl() || !state.komga?.username || !state.komga?.password) return;
  const matches = state.komgaMatches?.[storyId];
  if (!matches || !Object.keys(matches).length) return;

  let changed = false;
  await Promise.all(Object.entries(matches).map(async ([indexStr, match]) => {
    if (!match?.id) return;
    const index = Number(indexStr);
    try {
      const book = await komgaRequest(`/api/v1/books/${encodeURIComponent(match.id)}`);
      if (book?.readProgress?.completed) {
        const current = issueState(storyId, index);
        if (!current.read) {
          storyProgress(storyId)[index] = { ...current, read: true, skipped: false };
          const story = allStorylines().find(s => s.id === storyId);
          if (story?.issues[index]) setCollectionRead(story.issues[index], true);
          changed = true;
        }
      }
    } catch { /* ignore — book may have been removed from Komga */ }
  }));

  if (changed) {
    saveState();
    saveToServer();
    renderSelectedStory();
    renderStoryList();
    renderAllStorylines();
    if (state.activePage === "collection") renderCollection();
  }
}

async function syncKomgaForSelectedStory() {
  const story = selectedStory();
  if (!cleanKomgaUrl() || !state.komga?.username || !state.komga?.password) {
    state.activePage = "profile";
    saveState();
    render();
    elements.komgaStatus.textContent = "Add your Komga server settings first.";
    setKomgaSyncIndicator("failed", "Komga sync failed: settings are missing.");
    return;
  }

  elements.syncKomga.disabled = true;
  elements.syncKomga.classList.add("loading");
  elements.readingHint.textContent = `Syncing ${story.title} with Komga...`;
  setKomgaSyncIndicator("syncing", `Syncing ${story.title} with Komga...`);
  let matched = 0;
  let marked = 0;
  let missing = 0;
  const missingIndices = [];

  try {
    for (let index = 0; index < story.issues.length; index += 1) {
      const issue = story.issues[index];
      let current = issueState(story.id, index);
      let match = state.komgaMatches?.[story.id]?.[index];
      let book = null;

      book = await findKomgaBook(issue);
      if (book) {
        saveKomgaMatch(story.id, index, book);
        match = state.komgaMatches[story.id][index];
      }

      if (book?.readProgress?.completed) {
        storyProgress(story.id)[index] = { ...current, read: true, skipped: false };
        current = issueState(story.id, index);
      }

      if (!match?.id) {
        missing += 1;
        missingIndices.push(index);
        continue;
      }

      matched += 1;
      if (current.read || current.owned) {
        await komgaRequest(`/api/v1/books/${encodeURIComponent(match.id)}/read-progress`, {
          method: "PATCH",
          body: JSON.stringify({ completed: true, page: 0 })
        });
        marked += 1;
      }
    }

    saveState();
    const msg = `Komga sync: ${matched} matched, ${marked} marked read, ${missing} not found.`;
    elements.readingHint.textContent = msg;
    setKomgaSyncIndicator(missing ? "warning" : "success", msg);

    // Offer to add missing issues to Mylar3 if it is configured
    if (missing > 0 && state.mylar?.url && state.mylar?.apiKey) {
      const uniqueMissingSeries = [...new Set(
        missingIndices.map(i => parseIssueTitleForMylar(story.issues[i]).series)
      )];
      const btn = document.createElement("button");
      btn.className = "sync-indicator-action secondary-action";
      btn.type = "button";
      btn.textContent = `Add ${uniqueMissingSeries.length} missing series to Mylar3`;
      btn.addEventListener("click", () => addMissingSeriesToMylar(story.id, missingIndices, btn));
      elements.komgaSyncIndicator.appendChild(btn);
      showToast(
        "Not in Komga",
        `${missing} issues missing. Click the button to add them to Mylar3.`,
        "warning",
        8000
      );
    }
  } catch (error) {
    elements.readingHint.textContent = `Komga sync failed: ${error.message}`;
    setKomgaSyncIndicator("failed", `Komga sync failed: ${error.message}`);
  } finally {
    elements.syncKomga.disabled = false;
    elements.syncKomga.classList.remove("loading");
  }
}

function gcdIdFromUrl(apiUrl) {
  const match = String(apiUrl || "").match(/\/(\d+)\/?$/);
  return match ? match[1] : null;
}

async function searchGcdSeries(query) {
  try {
    const data = await gcdRequest(`/series/name/${encodeURIComponent(query)}/`);
    if (!Array.isArray(data?.results)) return [];
    return data.results.map(s => ({
      ...s,
      id: gcdIdFromUrl(s.api_url)
    })).filter(s => s.id);
  } catch (error) {
    throw new Error(`GCD search failed: ${error.message}`);
  }
}

async function searchGcdSeriesIssues(seriesId) {
  try {
    const data = await gcdRequest(`/series/${seriesId}/`);
    if (!data?.active_issues) return [];
    // active_issues is a space-separated list of issue API URLs
    const issueUrls = String(data.active_issues).trim().split(/\s+/).filter(Boolean);
    const issues = await Promise.all(
      issueUrls.map(async (url) => {
        const id = gcdIdFromUrl(url);
        if (!id) return null;
        try {
          return await gcdRequest(`/issue/${id}/`);
        } catch {
          return null;
        }
      })
    );
    return issues.filter(Boolean);
  } catch (error) {
    throw new Error(`GCD series fetch failed: ${error.message}`);
  }
}

async function searchMarvelSeries(query) {
  try {
    const data = await marvelRequest(`/search/issues?q=${encodeURIComponent(query)}`);
    if (!data || !Array.isArray(data.items)) return [];

    // Group by series
    const seriesMap = new Map();
    data.items.forEach(issue => {
      const seriesName = issue.seriesName || "Unknown";
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, {
          id: issue.seriesId || seriesName,
          name: seriesName,
          year_began: issue.yearPage || "",
          publisher: { name: "Marvel" },
          image_url: "",
          issues: []
        });
      }
      seriesMap.get(seriesName).issues.push(issue);
    });

    return Array.from(seriesMap.values());
  } catch (error) {
    throw new Error(`Marvel search failed: ${error.message}`);
  }
}

async function getMarvelSeriesIssues(seriesId) {
  try {
    const data = await marvelRequest(`/series/${seriesId}/issues`);
    if (!data || !Array.isArray(data.items)) return [];
    return data.items;
  } catch (error) {
    throw new Error(`Marvel series fetch failed: ${error.message}`);
  }
}

async function searchCreatorVolumes(creatorName, role) {
  if (!state.comicVineKey?.trim() || !creatorName) return null;
  const roleFilter = role ? role.toLowerCase() : "";

  const searchData = await comicVineJsonp("search/", {
    resources: "person",
    query: creatorName,
    limit: "3",
    field_list: "id,name,real_name"
  });
  const people = Array.isArray(searchData?.results) ? searchData.results : [];
  if (!people.length) return null;

  const personId = people[0].id;
  const personData = await comicVineJsonp(`person/4040-${personId}/`, {
    field_list: "id,name,volume_credits"
  });
  const credits = Array.isArray(personData?.results?.volume_credits) ? personData.results.volume_credits : [];

  const volumeIds = new Set();
  credits.forEach(v => {
    const roles = (v.roles || "").toLowerCase();
    if (!roleFilter || roles.includes(roleFilter)) volumeIds.add(v.id);
  });

  return { person: people[0], volumeIds, credits };
}

async function searchComicVineArcs() {
  const query = elements.vineArcSearch.value.trim();
  const creatorName = elements.creatorSearch?.value.trim() || "";
  const creatorRole = elements.creatorRole?.value || "";

  if (!query && !creatorName) {
    elements.vineLookupStatus.textContent = "Enter a title or creator name to search.";
    return;
  }

  elements.searchVineArcs.disabled = true;
  elements.searchVineArcs.classList.add("loading");
  elements.vineArcResults.innerHTML = "";

  // Creator-only search: show volumes by that creator
  if (!query && creatorName) {
    elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Searching for creator "${creatorName}"…`;
    try {
      const creatorInfo = await searchCreatorVolumes(creatorName, creatorRole);
      if (!creatorInfo || !creatorInfo.credits.length) {
        elements.vineLookupStatus.textContent = `No results found for creator "${creatorName}".`;
        elements.searchVineArcs.disabled = false;
        elements.searchVineArcs.classList.remove("loading");
        return;
      }
      const { person, credits } = creatorInfo;
      const roleFilter = creatorRole.toLowerCase();
      const filtered = roleFilter ? credits.filter(v => (v.roles || "").toLowerCase().includes(roleFilter)) : credits;
      const roleLabel = creatorRole ? ` (${creatorRole})` : "";
      elements.vineLookupStatus.textContent = `Found ${filtered.length} volume${filtered.length === 1 ? "" : "s"} by ${person.name}${roleLabel}.`;

      const allResults = [];
      for (const vol of filtered.slice(0, 20)) {
        try {
          const volData = await comicVineJsonp(`volume/4050-${vol.id}/`, {
            field_list: "id,name,deck,description,image,publisher,site_detail_url,count_of_issues,start_year"
          });
          if (volData?.results) {
            allResults.push({
              ...volData.results,
              source: "comicvine",
              sourceLabel: "Comic Vine",
              type: "Series",
              priority: 1,
              _creatorCredit: `${person.name}${vol.roles ? ` — ${vol.roles}` : ""}`
            });
          }
        } catch { }
      }
      renderUnifiedResults(allResults);
    } catch (err) {
      elements.vineLookupStatus.textContent = `Error searching for creator: ${err.message}`;
    }
    elements.searchVineArcs.disabled = false;
    elements.searchVineArcs.classList.remove("loading");
    return;
  }

  // Empty query — show trending/popular
  if (!query) {
    elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Loading popular story arcs…`;
    try {
      const url = new URL(`${window.location.origin}/api/trending`);
      url.searchParams.set("type", "arcs");
      if (state.comicVineKey) url.searchParams.set("apiKey", state.comicVineKey);
      const res = await fetch(url);
      const data = await res.json();
      const results = (data.results || []).map(r => ({ ...r, source: r.source || "curated", sourceLabel: r.sourceLabel || "Popular" }));
      renderUnifiedResults(results);
      elements.vineLookupStatus.textContent = `Showing ${results.length} popular story arcs. Type a name to search.`;
    } catch {
      elements.vineLookupStatus.textContent = "Could not load popular arcs. Type a name to search.";
    }
    elements.searchVineArcs.disabled = false;
    elements.searchVineArcs.classList.remove("loading");
    return;
  }

  const statusMsg = creatorName ? `Searching for "${query}" by ${creatorName}…` : `Searching for "${query}"…`;
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> ${statusMsg}`;

  const allResults = [];
  const errors = [];

  // Resolve creator volumes upfront if creator filter is specified
  let creatorVolumeIds = null;
  let resolvedCreator = null;
  if (creatorName && state.comicVineKey?.trim()) {
    try {
      const creatorInfo = await searchCreatorVolumes(creatorName, creatorRole);
      if (creatorInfo) {
        creatorVolumeIds = creatorInfo.volumeIds;
        resolvedCreator = creatorInfo.person;
      }
    } catch { }
  }

  // Search Comic Vine if API key is available
  if (state.comicVineKey.trim()) {
    try {
      const data = await comicVineJsonp("search/", {
        resources: "story_arc,volume",
        query,
        limit: "10",
        field_list: "id,name,deck,description,image,publisher,site_detail_url,resource_type"
      });
      let results = Array.isArray(data?.results) ? data.results : [];

      if (!results.length) {
        const fallback = await comicVineJsonp("story_arcs/", {
          filter: `name:${query}`,
          limit: "5",
          field_list: "id,name,deck,description,image,publisher,site_detail_url"
        });
        results = Array.isArray(fallback?.results) ? fallback.results : [];
      }

      results.forEach(result => {
        const isVolume = result.resource_type === "volume";
        if (creatorVolumeIds && isVolume && !creatorVolumeIds.has(result.id)) return;
        const roleLabel = creatorRole ? ` (${creatorRole})` : "";
        const credit = resolvedCreator ? `${resolvedCreator.name}${roleLabel}` : null;
        allResults.push({
          ...result,
          source: "comicvine",
          sourceLabel: "Comic Vine",
          type: isVolume ? "Series" : "Story Arc",
          priority: 1,
          ...(credit ? { _creatorCredit: credit } : {})
        });
      });
    } catch (error) {
      errors.push({ source: "Comic Vine", error: error.message });
    }
  }

  // GCD and Marvel don't support creator filtering — skip them when a creator is specified
  if (!creatorName) {
    try {
      const gcdResults = await searchGcdSeries(query);
      gcdResults.forEach(series => {
        allResults.push({ ...series, source: "gcd", sourceLabel: "Grand Comics Database", type: "Series", priority: 2 });
      });
    } catch (error) {
      errors.push({ source: "GCD", error: error.message });
    }

    try {
      const marvelResults = await searchMarvelSeries(query);
      marvelResults.forEach(series => {
        allResults.push({ ...series, source: "marvel", sourceLabel: "Marvel", type: "Series", priority: 2 });
      });
    } catch (error) {
      errors.push({ source: "Marvel", error: error.message });
    }
  }

  // Search internet as last resort
  if (!allResults.length) {
    try {
      const webResponse = await fetch(`${window.location.origin}/api/unified-search?q=${encodeURIComponent(query)}`);
      if (webResponse.ok) {
        const webData = await webResponse.json();
        (webData.results || []).forEach(item => {
          allResults.push({ ...item, source: item.source || "web", sourceLabel: item.sourceLabel || "Web", type: item.type || "Series", priority: 3 });
        });
      }
    } catch (error) {
      errors.push({ source: "Web", error: error.message });
    }
  }

  // Sort results by priority
  allResults.sort((a, b) => (a.priority || 3) - (b.priority || 3));

  renderUnifiedResults(allResults);

  const totalResults = allResults.length;
  const creatorSuffix = resolvedCreator ? ` by ${resolvedCreator.name}${creatorRole ? ` (${creatorRole})` : ""}` : "";
  if (totalResults) {
    elements.vineLookupStatus.textContent = `Found ${totalResults} result${totalResults === 1 ? "" : "s"}${creatorSuffix}.`;
  } else if (creatorName && !resolvedCreator) {
    elements.vineLookupStatus.textContent = `Creator "${creatorName}" not found on Comic Vine. Try searching by title only.`;
  } else if (errors.length) {
    elements.vineLookupStatus.textContent = `No results found. Errors: ${errors.map(e => `${e.source}: ${e.error}`).join("; ")}`;
  } else {
    elements.vineLookupStatus.textContent = "No results found. Try different search terms.";
  }

  elements.searchVineArcs.disabled = false;
  elements.searchVineArcs.classList.remove("loading");
}

function renderVineArcResults(results) {
  elements.vineArcResults.innerHTML = "";
  if (!results.length) {
    elements.vineArcResults.innerHTML = '<div class="empty-state"><h4>No arcs found</h4><p>No story arcs found from Comic Vine.<br><br>Try different search terms or check your API key in Profile settings.</p></div>';
    return;
  }

  results.forEach((arc) => {
    const card = document.createElement("article");
    card.className = "vine-result";
    const image = arc.image?.small_url || arc.image?.icon_url || "";
    card.innerHTML = `
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(arc.name || "Story arc")} cover" />` : '<span class="cover-placeholder">Arc</span>'}
      <div>
        <h4>${escapeHtml(arc.name || "Untitled arc")}</h4>
        <p>${escapeHtml(stripHtml(arc.deck || arc.description || "Comic Vine story arc"))}</p>
      </div>
      <button type="button" data-arc-id="${arc.id}">Import</button>
    `;
    card.querySelector("button").addEventListener("click", () => importComicVineArc(arc));
    elements.vineArcResults.append(card);
  });
}

function renderUnifiedResults(results) {
  elements.vineArcResults.innerHTML = "";
  if (!results.length) {
    elements.vineArcResults.innerHTML = '<div class="empty-state"><h4>No results found</h4><p>No results found from any data source.<br><br>Try different search terms.</p></div>';
    return;
  }

  results.forEach((item) => {
    const card = document.createElement("article");
    card.className = "vine-result";
    const image = item.image?.small_url || item.image?.icon_url || item.image_url || "";
    const name = item.name || item.title || "Untitled";
    const description = item.deck || item.description || "";
    const sourceLabel = item.sourceLabel || "Unknown";
    const type = item.type || "Unknown";
    
    // Extract publication date based on source
    let pubDate = "";
    if (item.source === "comicvine") {
      pubDate = item.cover_date || item.date_added || "";
    } else if (item.source === "gcd") {
      pubDate = item.year_began && item.year_ended 
        ? (item.year_began === item.year_ended ? item.year_began : `${item.year_began}-${item.year_ended}`)
        : item.year_began || "";
    } else if (item.source === "marvel") {
      pubDate = item.year || "";
    }
    
    card.innerHTML = `
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(name)} cover" />` : '<span class="cover-placeholder">Series</span>'}
      <div>
        <h4>${escapeHtml(name)}</h4>
        <p class="source-badge">${escapeHtml(sourceLabel)} · ${escapeHtml(type)}</p>
        ${pubDate ? `<p class="pub-date">Published: ${escapeHtml(pubDate)}</p>` : ""}
        ${item._creatorCredit ? `<p class="creator-credit">✏️ ${escapeHtml(item._creatorCredit)}</p>` : ""}
        <p>${escapeHtml(stripHtml(description || "Comic series"))}</p>
      </div>
      <button type="button" data-source="${item.source}" data-id="${item.id}">Import</button>
    `;
    
    const button = card.querySelector("button");
    button.addEventListener("click", () => {
      if (item.source === "comicvine") {
        importComicVineArc(item);
      } else if (item.source === "gcd") {
        importGcdSeries(item);
      } else if (item.source === "marvel") {
        importMarvelSeries(item);
      } else if (item.source === "web") {
        importWebResult(item);
      }
    });
    
    elements.vineArcResults.append(card);
  });
}

function renderGcdSeriesResults(results) {
  elements.vineArcResults.innerHTML = "";
  if (!results.length) {
    elements.vineArcResults.innerHTML = '<div class="empty-state"><h4>No series found</h4><p>No series found from Grand Comics Database.<br><br>Try different search terms.</p></div>';
    return;
  }

  results.forEach((series) => {
    const card = document.createElement("article");
    card.className = "vine-result";
    const image = series.image_url || "";
    const years = series.year_began && series.year_ended 
      ? (series.year_began === series.year_ended ? series.year_began : `${series.year_began}-${series.year_ended}`)
      : series.year_began || "";
    card.innerHTML = `
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(series.name || "Series")} cover" />` : '<span class="cover-placeholder">Series</span>'}
      <div>
        <h4>${escapeHtml(series.name || "Untitled series")}</h4>
        <p>${escapeHtml(series.publisher?.name || "Unknown publisher")} - ${years}</p>
      </div>
      <button type="button" data-series-id="${series.id}">Import</button>
    `;
    card.querySelector("button").addEventListener("click", () => importGcdSeries(series));
    elements.vineArcResults.append(card);
  });
}

function renderMarvelSeriesResults(results) {
  elements.vineArcResults.innerHTML = "";
  if (!results.length) {
    elements.vineArcResults.innerHTML = '<div class="empty-state"><h4>No series found</h4><p>No series found from Marvel API.<br><br>Try different search terms.</p></div>';
    return;
  }

  results.forEach((series) => {
    const card = document.createElement("article");
    card.className = "vine-result";
    const image = series.image_url || "";
    card.innerHTML = `
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(series.name || "Series")} cover" />` : '<span class="cover-placeholder">Series</span>'}
      <div>
        <h4>${escapeHtml(series.name || "Untitled series")}</h4>
        <p>${escapeHtml(series.publisher?.name || "Marvel")} - ${series.year_began || ""}</p>
      </div>
      <button type="button" data-series-id="${series.id}">Import</button>
    `;
    card.querySelector("button").addEventListener("click", () => importMarvelSeries(series));
    elements.vineArcResults.append(card);
  });
}

async function importComicVineArc(arc) {
  const importButton = document.querySelector(`[data-arc-id="${arc.id}"]`) ||
    document.querySelector(`[data-source="comicvine"][data-id="${arc.id}"]`);
  if (importButton) { importButton.classList.add("loading"); importButton.disabled = true; }
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Fetching ${arc.name || arc.title}…`;
  try {
    // Step 1: fetch arc detail → issue stubs
    const data = await comicVineJsonp(`story_arc/4045-${arc.id}/`, {
      field_list: "id,name,deck,description,issues,publisher,image,site_detail_url"
    });
    const detail = data?.results || arc;
    const issueStubs = Array.isArray(detail.issues) ? detail.issues : [];
    if (!issueStubs.length) {
      elements.vineLookupStatus.textContent = "Comic Vine returned this arc, but no issues were available.";
      if (importButton) { importButton.classList.remove("loading"); importButton.disabled = false; }
      return;
    }

    // Step 2: batch-fetch full issue details
    elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Fetching issue details (${issueStubs.length} issues)…`;
    const issueIds = issueStubs.map(i => i.id).filter(Boolean);
    const fullIssues = [];
    const batchSize = 50;
    for (let i = 0; i < issueIds.length; i += batchSize) {
      const batch = issueIds.slice(i, i + batchSize);
      try {
        const batchData = await comicVineJsonp("issues/", {
          filter: `id:${batch.join("|")}`,
          field_list: "id,name,issue_number,volume,image,cover_date,site_detail_url",
          limit: String(batchSize),
          offset: "0"
        });
        fullIssues.push(...(Array.isArray(batchData?.results) ? batchData.results : []));
      } catch {
        fullIssues.push(...issueStubs.slice(i, i + batchSize));
      }
    }

    // Preserve CV arc order (filter results come back unordered)
    const issueById = new Map(fullIssues.map(i => [i.id, i]));
    const orderedIssues = issueStubs.map(stub => issueById.get(stub.id) || stub);

    // Build issue titles + covers
    const storyId = `vine-${detail.id || arc.id}`;
    const importedIssues = [];
    const coversToCache = {};
    orderedIssues.forEach((issue, index) => {
      const volumeName = issue.volume?.name || detail.name || arc.name || "Issue";
      const issueNumber = issue.issue_number ? ` #${issue.issue_number}` : "";
      const title = `${volumeName}${issueNumber}`.trim();
      if (!title) return;
      importedIssues.push(title);
      const rawImg = issue.image?.small_url || issue.image?.medium_url || issue.image?.icon_url || "";
      const imgUrl = rawImg.replace(/^http:\/\//, "https://");
      if (imgUrl) coversToCache[index] = { status: "loaded", name: title, image: imgUrl, url: issue.site_detail_url || "", source: "comicvine" };
    });

    if (!importedIssues.length) {
      elements.vineLookupStatus.textContent = "Could not parse issue details from Comic Vine.";
      return;
    }

    // Check if cover dates are already in the expected (ascending) order
    const dates = orderedIssues.map(i => i.cover_date || "").filter(Boolean);
    const sorted = [...dates].sort();
    const outOfOrder = dates.length > 1 && JSON.stringify(dates) !== JSON.stringify(sorted);

    // Show preview for user to confirm
    showArcImportPreview({
      storyId,
      arcName: detail.name || arc.name || "Comic Vine Story Arc",
      publisher: detail.publisher?.name || arc.publisher?.name || "",
      sourceUrl: detail.site_detail_url || arc.site_detail_url || "",
      orderedIssues,
      importedIssues,
      coversToCache,
      outOfOrder
    });

    elements.vineLookupStatus.textContent = `Preview ready — check the reading order below, then confirm.`;
  } catch {
    elements.vineLookupStatus.textContent = "Could not import that Comic Vine story arc.";
  } finally {
    if (importButton) { importButton.classList.remove("loading"); importButton.disabled = false; }
  }
}

function showArcImportPreview({ storyId, arcName, publisher, sourceUrl, orderedIssues, importedIssues, coversToCache, outOfOrder }) {
  const overlay = document.querySelector("#arcPreviewOverlay");
  const content = document.querySelector("#arcPreviewContent");

  const orderNote = outOfOrder
    ? `⚠️ Cover dates suggest some issues may be out of publication order. Review the list below before confirming.`
    : `✓ Issue order matches publication dates from Comic Vine.`;

  const listHtml = importedIssues.map((title, i) => {
    const issue = orderedIssues[i] || {};
    const imgUrl = coversToCache[i]?.image || "";
    const date = issue.cover_date ? `<span class="issue-date">${escapeHtml(issue.cover_date)}</span>` : "";
    return `
      <li class="arc-preview-issue">
        <span class="issue-num">${i + 1}</span>
        ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="" />` : `<span style="width:40px;height:56px;background:var(--line);border-radius:3px;display:block"></span>`}
        <span>${escapeHtml(title)}</span>
        ${date}
      </li>`;
  }).join("");

  content.innerHTML = `
    <h2 style="margin:0 0 4px">${escapeHtml(arcName)}</h2>
    ${publisher ? `<p class="muted" style="margin:0 0 8px">${escapeHtml(publisher)}</p>` : ""}
    <p class="arc-preview-order-note">${orderNote}</p>
    <p style="margin:16px 0 0;font-size:0.85rem;opacity:0.7">${importedIssues.length} issues — scroll to review the full order</p>
    <ul class="arc-preview-issue-list">${listHtml}</ul>
  `;

  overlay.classList.remove("hidden");

  const confirm = document.querySelector("#arcPreviewConfirm");
  const cancel = document.querySelector("#arcPreviewCancel");
  const close = document.querySelector("#arcPreviewClose");

  const doClose = () => overlay.classList.add("hidden");

  // Replace buttons to clear old listeners
  const newConfirm = confirm.cloneNode(true);
  const newCancel = cancel.cloneNode(true);
  confirm.replaceWith(newConfirm);
  cancel.replaceWith(newCancel);

  newCancel.addEventListener("click", doClose);
  close.onclick = doClose;
  overlay.addEventListener("click", e => { if (e.target === overlay) doClose(); }, { once: true });

  newConfirm.addEventListener("click", () => {
    doClose();
    finalizeArcImport({ storyId, arcName, publisher, sourceUrl, importedIssues, coversToCache });
  });
}

function finalizeArcImport({ storyId, arcName, publisher, sourceUrl, importedIssues, coversToCache }) {
  const importedStory = {
    id: storyId,
    title: arcName,
    publisher: publisherKey(publisher || "custom"),
    years: "Comic Vine",
    note: `Imported from Comic Vine. ${importedIssues.length} issues.`,
    sourceUrl,
    issues: importedIssues
  };

  const existingIndex = state.customStorylines.findIndex(s => s.id === storyId);
  if (existingIndex >= 0) state.customStorylines[existingIndex] = importedStory;
  else state.customStorylines.push(importedStory);

  if (!state.covers[storyId]) state.covers[storyId] = {};
  Object.assign(state.covers[storyId], coversToCache);
  backfillCollectionCovers();

  state.selectedId = storyId;
  state.activePage = "reader";
  saveState();
  saveToServer();
  render();
  renderSelectedStory();
  const coverCount = Object.keys(coversToCache).length;
  elements.vineLookupStatus.textContent = `${arcName} imported with ${importedIssues.length} issues (${coverCount} covers loaded).`;
  autoSyncMylarForStory(storyId);
}

async function importGcdSeries(series) {
  const importButton = document.querySelector(`[data-series-id="${series.id}"]`);
  if (importButton) {
    importButton.classList.add("loading");
    importButton.disabled = true;
  }
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Importing ${series.name}...`;
  try {
    const issues = await searchGcdSeriesIssues(series.id);
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      elements.vineLookupStatus.textContent = "GCD returned this series, but no issues were available to import.";
      if (importButton) {
        importButton.classList.remove("loading");
        importButton.disabled = false;
      }
      return;
    }

    const importedIssues = issues.map(issue => {
      const issueNumber = issue.number ? ` #${issue.number}` : "";
      return `${series.name}${issueNumber}`.trim();
    }).filter(Boolean);

    const years = series.year_began && series.year_ended 
      ? (series.year_began === series.year_ended ? series.year_began : `${series.year_began}-${series.year_ended}`)
      : series.year_began || "";

    // Cache issue metadata (cover URLs, numbers) so cover lookups don't re-hit the API
    const issueMeta = {};
    issues.forEach(issue => {
      const num = String(issue.number || "");
      if (num) issueMeta[num] = { cover: issue.cover || issue.image_url || "", apiUrl: issue.api_url || "" };
    });

    const importedStory = {
      id: `gcd-${series.id}`,
      title: series.name || "GCD Series",
      publisher: publisherKey(series.publisher?.name || "custom"),
      years: years,
      note: "Imported from Grand Comics Database. Order follows GCD issue listing.",
      sourceUrl: `https://www.comics.org/series/${series.id}/`,
      issues: importedIssues,
      gcdIssueMeta: issueMeta
    };

    const existingIndex = state.customStorylines.findIndex((story) => story.id === importedStory.id);
    if (existingIndex >= 0) {
      state.customStorylines[existingIndex] = importedStory;
    } else {
      state.customStorylines.push(importedStory);
    }
    state.selectedId = importedStory.id;
    state.activePage = "reader";
    saveState();
    saveToServer();
    render();
    renderSelectedStory();
    elements.vineLookupStatus.textContent = `${importedStory.title} imported with ${importedIssues.length} issues.`;
    autoSyncMylarForStory(importedStory.id);
  } catch (error) {
    elements.vineLookupStatus.textContent = "Could not import that GCD series.";
  } finally {
    if (importButton) {
      importButton.classList.remove("loading");
      importButton.disabled = false;
    }
  }
}

async function importMarvelSeries(series) {
  const importButton = document.querySelector(`[data-series-id="${series.id}"]`);
  if (importButton) {
    importButton.classList.add("loading");
    importButton.disabled = true;
  }
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Importing ${series.name}...`;
  try {
    const issues = series.issues || [];
    if (!issues || !Array.isArray(issues) || issues.length === 0) {
      elements.vineLookupStatus.textContent = "Marvel API returned this series, but no issues were available to import.";
      if (importButton) {
        importButton.classList.remove("loading");
        importButton.disabled = false;
      }
      return;
    }

    const importedIssues = issues.map(issue => {
      const issueNumber = issue.issueNumber ? `#${issue.issueNumber}` : "";
      return `${series.name}${issueNumber}`.trim();
    }).filter(Boolean);

    const importedStory = {
      id: `marvel-${series.id}`,
      title: series.name || "Marvel Series",
      publisher: "marvel",
      years: series.year_began || "",
      note: "Imported from Marvel API. Order follows Marvel issue listing.",
      sourceUrl: `https://marvel.emreparker.com/series/${series.id}`,
      issues: importedIssues
    };

    const existingIndex = state.customStorylines.findIndex((story) => story.id === importedStory.id);
    if (existingIndex >= 0) {
      state.customStorylines[existingIndex] = importedStory;
    } else {
      state.customStorylines.push(importedStory);
    }
    state.selectedId = importedStory.id;
    state.activePage = "reader";
    saveState();
    saveToServer();
    render();
    renderSelectedStory();
    elements.vineLookupStatus.textContent = `${importedStory.title} imported with ${importedIssues.length} issues.`;
    autoSyncMylarForStory(importedStory.id);
  } catch (error) {
    elements.vineLookupStatus.textContent = "Could not import that Marvel series.";
  } finally {
    if (importButton) {
      importButton.classList.remove("loading");
      importButton.disabled = false;
    }
  }
}

function importWebResult(item) {
  const title = item.name || item.title || "Imported Web Result";
  const importedStory = {
    id: `web-${String(item.id || title).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    title,
    publisher: "custom",
    years: "Internet Search",
    note: "Imported from internet search. Add or edit issues as needed.",
    sourceUrl: item.url || "",
    issues: Array.isArray(item.issues) && item.issues.length ? item.issues : [title]
  };

  const existingIndex = state.customStorylines.findIndex((story) => story.id === importedStory.id);
  if (existingIndex >= 0) {
    state.customStorylines[existingIndex] = importedStory;
  } else {
    state.customStorylines.push(importedStory);
  }

  state.selectedId = importedStory.id;
  if (item.image_url || item.image) {
    setCover(importedStory.id, 0, {
      status: "loaded",
      name: title,
      image: item.image_url || item.image,
      url: item.url || ""
    });
  }
  state.activePage = "reader";
  saveState();
  saveToServer();
  render();
  renderSelectedStory();
  elements.vineLookupStatus.textContent = `${importedStory.title} imported from internet search.`;
  autoSyncMylarForStory(importedStory.id);
}

function formatComicVineIssue(issue) {
  if (!issue) return "";
  const volumeName = issue.volume?.name || issue.name || "Issue";
  const issueNumber = issue.issue_number ? ` #${issue.issue_number}` : "";
  return `${volumeName}${issueNumber}`.trim();
}

function publisherKey(name) {
  const normalized = String(name).toLowerCase();
  if (normalized.includes("marvel")) return "marvel";
  if (normalized.includes("dc")) return "dc";
  return "custom";
}

function stripHtml(value) {
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent || div.innerText || "";
}

function publisherLabel(value) {
  if (value === "marvel") return "Marvel";
  if (value === "dc") return "DC";
  return "Custom";
}

function escapeHtml(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function sanitizeHtml(value) {
  if (typeof value !== 'string') return '';
  // Remove script tags and event handlers
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function setValidationState(input, isValid, message = "") {
  input.classList.toggle("valid", isValid);
  input.classList.toggle("invalid", !isValid);
  
  let messageEl = input.parentElement.querySelector(".validation-message");
  if (!messageEl && message) {
    messageEl = document.createElement("div");
    messageEl.className = "validation-message";
    input.parentElement.appendChild(messageEl);
  }
  
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.classList.toggle("visible", !isValid && message);
  }
}

function setupFormValidation() {
  // Email validation
  elements.profileEmail.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      setValidationState(e.target, true);
    } else if (!validateEmail(value)) {
      setValidationState(e.target, false, "Please enter a valid email address");
    } else {
      setValidationState(e.target, true);
    }
  });

  // URL validation for Komga
  elements.komgaUrl.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      setValidationState(e.target, true);
    } else if (!validateUrl(value)) {
      setValidationState(e.target, false, "Please enter a valid URL (e.g., https://your-server.com)");
    } else {
      setValidationState(e.target, true);
    }
  });

  // Required field validation for custom order
  elements.customTitle.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      setValidationState(e.target, false, "Storyline title is required");
    } else {
      setValidationState(e.target, true);
    }
  });

  elements.customIssues.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      setValidationState(e.target, false, "Please add at least one issue");
    } else if (value.split("\n").filter(line => line.trim()).length === 0) {
      setValidationState(e.target, false, "Please add at least one issue");
    } else {
      setValidationState(e.target, true);
    }
  });

  // Comic Vine API key validation
  elements.comicVineKey.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    if (value === "") {
      setValidationState(e.target, true);
    } else if (value.length < 10) {
      setValidationState(e.target, false, "API key should be at least 10 characters");
    } else {
      setValidationState(e.target, true);
    }
  });
}

function render() {
  // Gate the entire app behind authentication
  if (!state.isAuthenticated || !state.token) {
    if (elements.loginScreen) elements.loginScreen.classList.remove("hidden");
    if (elements.appShell)    elements.appShell.classList.add("hidden");
    return;
  }

  if (elements.loginScreen) elements.loginScreen.classList.add("hidden");
  if (elements.appShell)    elements.appShell.classList.remove("hidden");
  
  state.darkMode = true;
  document.body.classList.add("dark-mode");
  if (elements.darkModeToggle) {
    elements.darkModeToggle.checked = true;
  }
  elements.readerPage.classList.toggle("hidden", state.activePage !== "reader");
  elements.lookupPage.classList.toggle("hidden", state.activePage !== "lookup");
  elements.myArcsPage.classList.toggle("hidden", state.activePage !== "myarcs");
  elements.customPage.classList.toggle("hidden", state.activePage !== "custom");
  elements.profilePage.classList.toggle("hidden", state.activePage !== "profile");
  if (elements.collectionPage) elements.collectionPage.classList.toggle("hidden", state.activePage !== "collection");
  if (state.activePage === "collection") renderCollection();
  elements.comicVineKey.value = state.comicVineKey;
  elements.dataSource.value = state.dataSource || "comicvine";
  
  if (state.dataSource === "gcd") {
    elements.apiStatus.textContent = "Using Grand Comics Database (no API key required).";
  } else if (state.dataSource === "marvel") {
    elements.apiStatus.textContent = "Using Marvel API (no API key required, Marvel only).";
  } else {
    elements.apiStatus.textContent = state.comicVineKey ? "API key saved. Covers can be loaded per storyline." : "Covers load after you save a key.";
  }
  
  if (elements.profileName) {
    elements.profileName.value = state.profile?.name || "";
  }
  if (elements.profileEmail) {
    elements.profileEmail.value = state.profile?.email || "";
  }
  if (elements.profilePublisher) {
    elements.profilePublisher.value = state.profile?.publisher || "Either";
  }
  if (elements.profileSyncName) {
    elements.profileSyncName.value = state.profile?.syncName || "";
  }
  if (elements.profileAvatar) {
    let avatar = state.profile?.avatar || "avatars/Doom-6.png";
    // Migrate old paths that lack the avatars/ prefix
    if ((avatar.endsWith('.png') || avatar.endsWith('.jpg')) && !avatar.includes('/')) {
      avatar = `avatars/${avatar}`;
    }
    if (avatar.includes('/') || avatar.endsWith('.png') || avatar.endsWith('.jpg')) {
      elements.profileAvatar.innerHTML = `<img src="${avatar}" alt="Profile avatar" />`;
    } else {
      elements.profileAvatar.textContent = avatar;
    }
  }
  
  // Update avatar selection
  if (elements.avatarSelector) {
    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.avatar === (state.profile?.avatar || "avatars/Doom-6.png"));
    });
  }
  
  // Update authentication UI
  if (state.isAuthenticated) {
    elements.registerProfile.style.display = "none";
    elements.loginProfile.style.display = "none";
    elements.saveProfileChanges.style.display = "inline-block";
    elements.logoutProfile.style.display = "inline-block";
    elements.saveToServer.style.display = "inline-block";
    if (elements.profilePasswordLabel) elements.profilePasswordLabel.style.display = "none";
    if (elements.logoutButton) {
      elements.logoutButton.style.display = "inline-block";
    }
  } else {
    elements.registerProfile.style.display = "inline-block";
    elements.loginProfile.style.display = "inline-block";
    elements.saveProfileChanges.style.display = "none";
    elements.logoutProfile.style.display = "none";
    elements.saveToServer.style.display = "none";
    if (elements.profilePasswordLabel) elements.profilePasswordLabel.style.display = "";
    if (elements.logoutButton) {
      elements.logoutButton.style.display = "none";
    }
  }
  elements.komgaUrl.value = state.komga?.url || "";
  elements.komgaUsername.value = state.komga?.username || "";
  elements.komgaPassword.value = state.komga?.password || "";
  elements.komgaStatus.textContent = cleanKomgaUrl() ? "Komga settings saved. Use Sync Komga on the Reader page." : "Connect your Komga server to sync read progress.";
  elements.mylarUrl.value = state.mylar?.url || "";
  elements.mylarApiKey.value = state.mylar?.apiKey || "";
  if (elements.mylarHttpUser) elements.mylarHttpUser.value = state.mylar?.httpUser || "";
  if (elements.mylarHttpPass) elements.mylarHttpPass.value = state.mylar?.httpPass || "";
  elements.mylarStatus.textContent = state.mylar?.url ? "Mylar3 settings saved. Use Sync Mylar3 on the Reader page." : "Connect your Mylar3 server to sync read progress.";
  if (!cleanKomgaUrl()) {
    setKomgaSyncIndicator("idle", "Komga not connected yet.");
  }
  document.querySelectorAll(".page-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.page === state.activePage);
  });
  renderStoryList();
  renderAllStorylines();
  renderSelectedStory();
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === state.filter);
  });
  elements.searchInput.value = state.search;
}

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    state.filter = chip.dataset.filter;
    saveState();
    render();
  });
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  saveState();
  renderStoryList();
});

elements.clearSearch.addEventListener("click", () => {
  state.search = "";
  render();
  saveState();
});

elements.markAllRead.addEventListener("click", () => {
  const story = selectedStory();
  story.issues.forEach((_issue, index) => {
    storyProgress(story.id)[index] = { ...issueState(story.id, index), read: true, skipped: false };
  });
  saveState();
  render();
  maybePromptArchiveCompletedStory(story.id);
});

elements.clearStoryProgress.addEventListener("click", () => {
  delete state.progress[selectedStory().id];
  saveState();
  render();
});

elements.resetProgress.addEventListener("click", () => {
  if (!confirm("Reset all saved progress and custom reading orders?")) return;
  localStorage.removeItem(storageKey);
  state = {
    selectedId: "",
    filter: "all",
    search: "",
    darkMode: true,
    activePage: "myarcs",
    profile: {
      name: "",
      email: "",
      publisher: "Either",
      syncName: ""
    },
    comicVineKey: "",
    komga: {
      url: "",
      username: "",
      password: ""
    },
    komgaMatches: {},
    covers: {},
    progress: {},
    customStorylines: []
  };
  render();
});

document.querySelectorAll(".page-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.activePage = tab.dataset.page;
    saveState();
    render();
  });
});

// Collection: add single issue
// Bulk-add all issues in the current arc to the collection
document.querySelector("#addArcToCollection").addEventListener("click", () => {
  const story = selectedStory();
  if (!story) return;
  story.issues.forEach(issue => addToCollection(issue));
  syncArcProgressToCollection(story.id);
  saveState();
  const btn = document.querySelector("#addArcToCollection");
  btn.textContent = "Added!";
  setTimeout(() => { btn.textContent = "Add to Collection"; }, 2000);
});

// Collection: issue search autocomplete
let collectionSearchTimer = null;

function hideCollectionSearchResults() {
  const box = document.querySelector("#collectionSearchResults");
  if (box) { box.innerHTML = ""; box.classList.add("hidden"); }
}

function renderCollectionSearchResults(results) {
  const box = document.querySelector("#collectionSearchResults");
  if (!box) return;
  box.innerHTML = "";
  if (!results.length) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  results.forEach(item => {
    const row = document.createElement("div");
    row.className = "collection-search-item";
    row.innerHTML = `
      ${item.cover ? `<img src="${escapeHtml(item.cover)}" alt="" />` : '<span class="cover-placeholder-sm"></span>'}
      <div>
        <span class="item-title">${escapeHtml(item.title)}</span>
        <span class="item-meta">${escapeHtml(item.sourceLabel)}${item.year ? " · " + escapeHtml(item.year) : ""}${item.upc ? " · UPC: " + escapeHtml(item.upc) : ""}</span>
      </div>
    `;
    row.addEventListener("mousedown", (e) => {
      e.preventDefault();
      hideCollectionSearchResults();
      addToCollection(item.title, { upc: item.upc, cover: item.cover });
      saveState();
      elements.collectionAddInput.value = "";
      renderCollection();
    });
    box.append(row);
  });
}

async function loadTrendingIssues() {
  try {
    const url = new URL(`${window.location.origin}/api/trending`);
    url.searchParams.set("type", "issues");
    const res = await fetch(url);
    const data = await res.json();
    renderCollectionSearchResults(data.results || []);
  } catch { hideCollectionSearchResults(); }
}

elements.collectionAddInput.addEventListener("focus", () => {
  if (!elements.collectionAddInput.value.trim()) {
    loadTrendingIssues();
  }
});

elements.collectionAddInput.addEventListener("input", () => {
  clearTimeout(collectionSearchTimer);
  const q = elements.collectionAddInput.value.trim();
  if (!q) { loadTrendingIssues(); return; }
  if (q.length < 2) { hideCollectionSearchResults(); return; }
  collectionSearchTimer = setTimeout(async () => {
    try {
      const url = new URL(`${window.location.origin}/api/issue-search`);
      url.searchParams.set("q", q);
      if (state.comicVineKey) url.searchParams.set("apiKey", state.comicVineKey);
      const res = await fetch(url);
      const data = await res.json();
      renderCollectionSearchResults(data.results || []);
    } catch { hideCollectionSearchResults(); }
  }, 350);
});

elements.collectionAddInput.addEventListener("blur", () => {
  setTimeout(hideCollectionSearchResults, 150);
});

elements.collectionAddInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { hideCollectionSearchResults(); return; }
  if (e.key === "Enter") {
    hideCollectionSearchResults();
    elements.collectionAddButton.click();
  }
});

elements.collectionAddButton.addEventListener("click", () => {
  const title = elements.collectionAddInput.value.trim();
  if (!title) return;
  addToCollection(title);
  saveState();
  elements.collectionAddInput.value = "";
  renderCollection();
});

// Collection: filter buttons
document.querySelectorAll("[data-collection-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    state.collectionFilter = btn.dataset.collectionFilter;
    document.querySelectorAll("[data-collection-filter]").forEach(b => b.classList.toggle("active", b === btn));
    renderCollection();
  });
});

// Issue detail panel close
document.querySelector("#issueDetailClose").addEventListener("click", () => {
  document.querySelector("#issueDetailOverlay").classList.add("hidden");
});
document.querySelector("#issueDetailOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add("hidden");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.querySelector("#issueDetailOverlay")?.classList.add("hidden");
});

elements.saveComicVineKey.addEventListener("click", () => {
  state.comicVineKey = elements.comicVineKey.value.trim();
  sessionStorage.setItem(comicVineSessionKey, state.comicVineKey);
  saveState();
  render();
});

elements.dataSource.addEventListener("change", (event) => {
  state.dataSource = event.target.value;
  saveState();
  render();
});

elements.saveKomga.addEventListener("click", () => {
  state.komga = {
    url: elements.komgaUrl.value.trim(),
    username: elements.komgaUsername.value.trim(),
    password: elements.komgaPassword.value
  };
  elements.komgaStatus.textContent = "Komga settings saved.";
  saveKomgaSession();
  saveState();
  render();
});

elements.testKomga.addEventListener("click", () => {
  state.komga = {
    url: elements.komgaUrl.value.trim(),
    username: elements.komgaUsername.value.trim(),
    password: elements.komgaPassword.value
  };
  saveKomgaSession();
  saveState();
  testKomgaConnection();
});

elements.showKomgaPassword.addEventListener("change", (event) => {
  elements.komgaPassword.type = event.target.checked ? "text" : "password";
});

elements.saveMylar.addEventListener("click", () => {
  state.mylar = {
    url: elements.mylarUrl.value.trim(),
    apiKey: elements.mylarApiKey.value.trim(),
    httpUser: elements.mylarHttpUser?.value.trim() || "",
    httpPass: elements.mylarHttpPass?.value.trim() || ""
  };
  elements.mylarStatus.textContent = "Mylar3 settings saved.";
  saveMylarSession();
  saveState();
  render();
});

elements.testMylar.addEventListener("click", () => {
  state.mylar = {
    url: elements.mylarUrl.value.trim(),
    apiKey: elements.mylarApiKey.value.trim(),
    httpUser: elements.mylarHttpUser?.value.trim() || "",
    httpPass: elements.mylarHttpPass?.value.trim() || ""
  };
  saveMylarSession();
  saveState();
  testMylarConnection();
});

if (elements.saveProfile) {
  elements.saveProfile.addEventListener("click", () => {
    state.profile = {
      name: elements.profileName.value.trim(),
      email: elements.profileEmail.value.trim(),
      publisher: elements.profilePublisher.value,
      syncName: elements.profileSyncName.value.trim(),
      avatar: state.profile?.avatar || "avatars/Doom-6.png"
    };
    // Automatically save current progress when profile is created/updated
    saveState();
    elements.syncStatus.textContent = "Profile and progress saved on this device.";
    render();
  });
}

// Save profile changes without password (JWT auth)
if (elements.saveProfileChanges) {
  elements.saveProfileChanges.addEventListener("click", async () => {
    state.profile = {
      ...state.profile,
      name: elements.profileName.value.trim(),
      email: elements.profileEmail.value.trim(),
      publisher: elements.profilePublisher.value,
      syncName: elements.profileSyncName.value.trim(),
      avatar: state.profile?.avatar || "avatars/Doom-6.png"
    };
    saveState();
    await saveToServer();
    elements.syncStatus.textContent = "Profile changes saved.";
    render();
  });
}

// Avatar selection event listeners
document.querySelectorAll(".avatar-option").forEach((option) => {
  option.addEventListener("click", () => {
    state.profile = state.profile || {};
    state.profile.avatar = option.dataset.avatar;
    saveState();
    render();
  });
});

// Profile registration
elements.registerProfile.addEventListener("click", async () => {
  const name = elements.profileName.value.trim();
  const email = elements.profileEmail.value.trim();
  const password = elements.profilePassword.value;
  const publisher = elements.profilePublisher.value;
  
  if (!name || !email || !password) {
    elements.syncStatus.textContent = "Name, email, and password are required.";
    return;
  }
  
  try {
    const response = await fetch(`${window.location.origin}/api/profile/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, publisher, avatar: state.profile?.avatar || "avatars/Doom-6.png" })
    });
    
    const data = await response.json();
    
    if (data.success) {
      state.profile = {
        name,
        email,
        publisher,
        syncName: data.syncName,
        avatar: state.profile?.avatar || "avatars/Doom-6.png"
      };
      state.isAuthenticated = true;
      state.sessionEmail = email;
      saveState();
      elements.syncStatus.textContent = `Registered successfully! Your sync name: ${data.syncName}`;
      render();
    } else {
      elements.syncStatus.textContent = data.error || "Registration failed.";
    }
  } catch (error) {
    elements.syncStatus.textContent = `Registration failed: ${error.message}`;
  }
});

// Profile login
elements.loginProfile.addEventListener("click", async () => {
  const email = elements.profileEmail.value.trim();
  const password = elements.profilePassword.value;
  
  if (!email || !password) {
    elements.syncStatus.textContent = "Email and password are required.";
    return;
  }
  
  try {
    const response = await fetch(`${window.location.origin}/api/profile/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      state.profile = {
        name: data.profile.name,
        email: data.profile.email,
        publisher: data.profile.publisher,
        syncName: data.profile.syncName,
        avatar: data.profile.avatar
      };
      state.isAuthenticated = true;
      state.sessionEmail = email;
      
      // Load saved data from server
      if (data.profile.data) {
        state.progress = data.profile.data.progress || {};
        state.customStorylines = data.profile.data.customStorylines || [];
        state.covers = data.profile.data.covers || {};
        if (data.profile.data.collection) state.collection = data.profile.data.collection;
        state.komgaMatches = data.profile.data.komgaMatches || {};
        state.mylarMatches = data.profile.data.mylarMatches || {};
        backfillCollectionCovers();
        // Restore API settings from server
        if (data.profile.data.settings) {
          const s = data.profile.data.settings;
          if (s.komgaUrl) state.komga = { ...state.komga, url: s.komgaUrl };
          if (s.komgaUsername) state.komga = { ...state.komga, username: s.komgaUsername };
          if (s.komgaPassword) { state.komga = { ...state.komga, password: s.komgaPassword }; sessionStorage.setItem(komgaSessionKey, JSON.stringify({ password: s.komgaPassword })); }
          if (s.mylarUrl) state.mylar = { ...state.mylar, url: s.mylarUrl };
          if (s.mylarApiKey) { state.mylar = { ...state.mylar, apiKey: s.mylarApiKey }; sessionStorage.setItem(mylarSessionKey, JSON.stringify({ apiKey: s.mylarApiKey })); }
          if (s.comicVineKey) { state.comicVineKey = s.comicVineKey; sessionStorage.setItem(comicVineSessionKey, s.comicVineKey); }
        }
      }
      
      // Store JWT token in memory only (not localStorage)
      if (data.token) {
        state.token = data.token;
      }
      
      saveState();
      elements.syncStatus.textContent = `Welcome back, ${data.profile.name}!`;
      render();
    } else {
      elements.syncStatus.textContent = data.error || "Login failed.";
    }
  } catch (error) {
    elements.syncStatus.textContent = `Login failed: ${error.message}`;
  }
});

// Profile logout
elements.logoutProfile.addEventListener("click", async () => {
  // Auto-save to server before logout if logged in
  if (state.isAuthenticated && state.token) {
    try {
      await saveToServer();
    } catch (error) {
      console.error("Failed to auto-save before logout:", error);
    }
  }
  
  state.isAuthenticated = false;
  state.sessionEmail = null;
  saveState();
  elements.syncStatus.textContent = "Logged out successfully.";
  render();
});

function buildServerPayload() {
  return {
    progress: state.progress,
    customStorylines: state.customStorylines,
    covers: state.covers,
    collection: state.collection,
    komgaMatches: state.komgaMatches,
    mylarMatches: state.mylarMatches,
    selectedId: state.selectedId,
    darkMode: state.darkMode,
    archivedStorylines: state.archivedStorylines,
    showArchived: state.showArchived,
    settings: {
      komgaUrl: state.komga?.url || "",
      komgaUsername: state.komga?.username || "",
      komgaPassword: state.komga?.password || "",
      mylarUrl: state.mylar?.url || "",
      mylarApiKey: state.mylar?.apiKey || "",
      comicVineKey: state.comicVineKey || ""
    }
  };
}

async function saveToServer() {
  if (!state.isAuthenticated || !state.token) return false;
  const response = await fetch(`${window.location.origin}/api/profile/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.token}` },
    body: JSON.stringify({ data: buildServerPayload() })
  });
  return response.ok;
}

// Save to server
elements.saveToServer.addEventListener("click", async () => {
  if (!state.isAuthenticated || !state.token) {
    elements.syncStatus.textContent = "Please log in first.";
    return;
  }
  try {
    const ok = await saveToServer();
    elements.syncStatus.textContent = ok ? "Profile data saved to server successfully." : "Save failed.";
  } catch (error) {
    elements.syncStatus.textContent = `Save failed: ${error.message}`;
  }
});

elements.exportProfile.addEventListener("click", () => {
  const payload = {
    app: "ARCS!",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    selectedId: state.selectedId,
    darkMode: state.darkMode,
    progress: state.progress,
    customStorylines: state.customStorylines,
    covers: state.covers,
    komga: state.komga,
    komgaMatches: state.komgaMatches,
    mylar: state.mylar,
    mylarMatches: state.mylarMatches
  };
  elements.syncPayload.value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  elements.syncStatus.textContent = "Sync profile exported. Use this code on another device.";
});

elements.importProfile.addEventListener("click", () => {
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(elements.syncPayload.value.trim()))));
    if (payload.app !== "ARCS!" || !payload.profile) {
      throw new Error("Not an ARCS! sync profile.");
    }
    state.profile = payload.profile;
    state.selectedId = payload.selectedId || state.selectedId;
    state.darkMode = Boolean(payload.darkMode);
    state.progress = payload.progress || {};
    state.customStorylines = payload.customStorylines || [];
    state.covers = payload.covers || {};
    state.komga = payload.komga || state.komga;
    state.komgaMatches = payload.komgaMatches || {};
    state.mylar = payload.mylar || state.mylar;
    state.mylarMatches = payload.mylarMatches || {};
    elements.syncStatus.textContent = "Sync profile imported on this device.";
    saveState();
    render();
  } catch (error) {
    elements.syncStatus.textContent = "That sync profile could not be imported.";
  }
});

// Logout button
if (elements.logoutButton) {
  elements.logoutButton.addEventListener("click", () => {
    state.isAuthenticated = false;
    state.sessionEmail = null;
    state.profile = null;
    saveState();
    render();
  });
}

elements.loadCovers.addEventListener("click", () => {
  loadCoversForSelectedStory();
});

elements.syncKomga.addEventListener("click", () => {
  syncKomgaForSelectedStory();
});

elements.syncMylar.addEventListener("click", () => {
  syncMylarForSelectedStory();
});

elements.importMylarList.addEventListener("click", () => {
  importMylarReadingList();
});

elements.exportMylarList.addEventListener("click", () => {
  exportMylarReadingList();
});

elements.exportCbl.addEventListener("click", () => {
  exportCbl();
});

document.querySelector("#exportCollectionCsv")?.addEventListener("click", () => {
  exportCollectionCsv();
});

document.querySelector("#exportArcsCsv")?.addEventListener("click", () => {
  exportArcProgressCsv();
});

elements.importCbl.addEventListener("click", () => {
  importCbl();
});

elements.showArchived.addEventListener("click", () => {
  state.showArchived = !state.showArchived;
  saveState();
  renderAllStorylines();
});

elements.searchVineArcs.addEventListener("click", () => {
  searchComicVineArcs();
});

elements.vineArcSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchComicVineArcs();
});

elements.creatorSearch?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") searchComicVineArcs();
});

if (elements.brandLogo) {
  elements.brandLogo.addEventListener("click", () => {
    state.activePage = "myarcs";
    saveState();
    render();
  });
}

if (elements.showMyArcs) {
  elements.showMyArcs.addEventListener("click", () => {
    state.activePage = "myarcs";
    saveState();
    render();
  });
}

if (elements.showCustomForm) {
  elements.showCustomForm.addEventListener("click", () => {
    state.activePage = "custom";
    saveState();
    render();
    elements.customTitle.focus();
  });
}

elements.closeCustomForm.addEventListener("click", () => {
  state.activePage = "reader";
  saveState();
  render();
});

elements.saveCustomOrder.addEventListener("click", () => {
  const title = elements.customTitle.value.trim();
  const issues = elements.customIssues.value
    .split("\n")
    .map((issue) => issue.trim())
    .filter(Boolean);
  if (!title || !issues.length) {
    alert("Add a title and at least one issue.");
    return;
  }

  const story = {
    id: `custom-${Date.now()}`,
    title,
    publisher: elements.customPublisher.value,
    years: "Custom",
    note: "Your saved reading order.",
    issues
  };
  state.customStorylines.push(story);
  state.selectedId = story.id;
  state.activePage = "reader";
  elements.customTitle.value = "";
  elements.customIssues.value = "";
  
  // Clear validation states
  setValidationState(elements.customTitle, true);
  setValidationState(elements.customIssues, true);

  saveState();
  saveToServer();
  render();
  autoSyncMylarForStory(story.id);
});


// Login screen avatar selection
document.querySelectorAll("#registerForm .avatar-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll("#registerForm .avatar-option").forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");
  });
});

// Login screen panel switching
function showLoginPanel(id) {
  document.querySelectorAll(".login-panel").forEach(p => p.classList.add("hidden"));
  const panel = document.getElementById(id);
  if (panel) panel.classList.remove("hidden");
}
document.getElementById("showRegister")?.addEventListener("click", () => showLoginPanel("registerForm"));
document.getElementById("showReset")?.addEventListener("click", () => showLoginPanel("resetForm"));
document.getElementById("showLogin")?.addEventListener("click", () => showLoginPanel("loginForm"));
document.getElementById("showLoginFromReset")?.addEventListener("click", () => showLoginPanel("loginForm"));

// Allow Enter key to submit login
elements.loginPassword?.addEventListener("keydown", e => {
  if (e.key === "Enter") elements.loginButton?.click();
});
elements.loginEmail?.addEventListener("keydown", e => {
  if (e.key === "Enter") elements.loginButton?.click();
});

// Login button
if (elements.loginButton) {
  elements.loginButton.addEventListener("click", async () => {
    console.log("Login button clicked");
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    console.log("Email:", email, "Password:", password ? "***" : "empty");
    
    if (!email || !password) {
      elements.loginStatus.textContent = "Email and password are required.";
      elements.loginStatus.classList.add("error");
      return;
    }
    
    elements.loginButton.disabled = true;
    elements.loginStatus.textContent = "Logging in...";
    elements.loginStatus.classList.remove("success", "error");
    
    try {
      console.log("Sending login request to server");
      const response = await fetch(`${window.location.origin}/api/profile/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        state.profile = {
          name: data.profile.name,
          email: data.profile.email,
          publisher: data.profile.publisher,
          syncName: data.profile.syncName,
          avatar: data.profile.avatar
        };
        state.isAuthenticated = true;
        state.sessionEmail = email;

        // Store JWT token in memory only (not localStorage)
        if (data.token) {
          state.token = data.token;
        }

        // Load saved data from server
        if (data.profile.data) {
          state.progress = data.profile.data.progress || {};
          state.customStorylines = data.profile.data.customStorylines || [];
          state.covers = data.profile.data.covers || {};
          state.komgaMatches = data.profile.data.komgaMatches || {};
          state.mylarMatches = data.profile.data.mylarMatches || {};
        }

        saveState();
        elements.loginStatus.textContent = `Welcome back, ${data.profile.name}!`;
        elements.loginStatus.classList.add("success");
        render();
        // Silently sync Komga read progress for all previously-matched stories
        Object.keys(state.komgaMatches).forEach(sid => autoSyncKomgaReadProgress(sid));
      } else {
        elements.loginStatus.textContent = data.error || "Login failed.";
        elements.loginStatus.classList.add("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      elements.loginStatus.textContent = `Login failed: ${error.message}`;
      elements.loginStatus.classList.add("error");
    } finally {
      elements.loginButton.disabled = false;
    }
  });
} else {
  console.error("Login button not found");
}

// Register button
if (elements.registerButton) {
  elements.registerButton.addEventListener("click", async () => {
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const publisher = elements.registerPublisher.value;
    const activeAvatar = document.querySelector("#registerForm .avatar-option.active");
    const avatar = activeAvatar ? activeAvatar.dataset.avatar : "Doom-6.png";
    
    if (!name || !email || !password) {
      elements.registerStatus.textContent = "Name, email, and password are required.";
      elements.registerStatus.classList.add("error");
      return;
    }
    
    elements.registerButton.disabled = true;
    elements.registerStatus.textContent = "Creating account...";
    elements.registerStatus.classList.remove("success", "error");
    
    try {
      const response = await fetch(`${window.location.origin}/api/profile/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, publisher, avatar })
      });

      const data = await response.json();

      if (data.success) {
        state.profile = {
          name,
          email,
          publisher,
          syncName: data.syncName,
          avatar
        };
        state.isAuthenticated = true;
        state.sessionEmail = email;
        if (data.token) {
          state.token = data.token;
        }
        saveState();
        elements.registerStatus.textContent = `Account created! Welcome, ${name}!`;
        elements.registerStatus.classList.add("success");
        render();
      } else {
        elements.registerStatus.textContent = data.error || "Registration failed.";
        elements.registerStatus.classList.add("error");
      }
    } catch (error) {
      elements.registerStatus.textContent = `Registration failed: ${error.message}`;
      elements.registerStatus.classList.add("error");
    } finally {
      elements.registerButton.disabled = false;
    }
  });
} else {
  console.error("Register button not found");
}

// Reset password button
if (elements.resetButton) {
  elements.resetButton.addEventListener("click", async () => {
    const email = elements.resetEmail.value.trim();
    
    if (!email) {
      elements.resetStatus.textContent = "Email is required.";
      elements.resetStatus.classList.add("error");
      return;
    }
    
    elements.resetButton.disabled = true;
    elements.resetStatus.textContent = "Sending reset link...";
    elements.resetStatus.classList.remove("success", "error");
    
    try {
      const response = await fetch(`${window.location.origin}/api/profile/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        elements.resetStatus.textContent = "Password reset link sent to your email.";
        elements.resetStatus.classList.add("success");
      } else {
        elements.resetStatus.textContent = data.error || "Password reset failed.";
        elements.resetStatus.classList.add("error");
      }
    } catch (error) {
      elements.resetStatus.textContent = `Password reset failed: ${error.message}`;
      elements.resetStatus.classList.add("error");
    } finally {
      elements.resetButton.disabled = false;
    }
  });
} else {
  console.error("Reset button not found");
}

loadState();
render();
setupFormValidation();
