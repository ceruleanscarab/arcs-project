const baseStorylines = [];

const storageKey = "panelpath-state-v1";
const comicVineSessionKey = "panelpath-comic-vine-key";
const komgaSessionKey = "panelpath-komga-settings";
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
    apiKey: ""
  },
  mylarMatches: {},
  covers: {},
  progress: {},
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
  mylarStatus: document.querySelector("#mylarStatus"),
  saveMylar: document.querySelector("#saveMylar"),
  testMylar: document.querySelector("#testMylar"),
  syncMylar: document.querySelector("#syncMylar"),
  importMylarList: document.querySelector("#importMylarList"),
  exportMylarList: document.querySelector("#exportMylarList"),
  vineArcSearch: document.querySelector("#vineArcSearch"),
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
  showArchived: document.querySelector("#showArchived")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
      state = { ...state, ...saved };
    }
    state.darkMode = true;
    state.comicVineKey = sessionStorage.getItem(comicVineSessionKey) || "";
    const sessionKomga = JSON.parse(sessionStorage.getItem(komgaSessionKey) || "null");
    if (sessionKomga) {
      state.komga = { ...state.komga, ...sessionKomga };
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
    card.classList.toggle("active", story.id === state.selectedId);
    card.querySelector(".story-card-title").textContent = story.title;
    card.querySelector(".story-card-meta").textContent = `${publisherLabel(story.publisher)} - ${story.years || "Custom"} - ${percent}% read`;
    card.querySelector(".mini-progress span").style.width = `${percent}%`;
    card.addEventListener("click", () => {
      state.selectedId = story.id;
      state.activePage = "reader";
      saveState();
      render();
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
    card.querySelector(".story-card-meta").textContent = `${publisherLabel(story.publisher)} - ${story.years || "Custom"} - ${percent}% read`;
    card.querySelector(".mini-progress span").style.width = `${percent}%`;
    
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
  elements.readingHint.textContent = `${story.issues.length} issues in this order - ${percent}% complete`;
  elements.progressFill.style.width = `${percent}%`;

  elements.issueList.innerHTML = "";
  story.issues.forEach((issue, index) => {
    const current = issueState(story.id, index);
    const cover = coverFor(story.id, index);
    const coverMarkup = cover?.image
      ? `<a class="cover-link" href="${escapeHtml(cover.url || "#")}" target="_blank" rel="noreferrer"><img src="${escapeHtml(cover.image)}" alt="${escapeHtml(issue)} cover" /></a>`
      : `<span class="cover-placeholder">${cover?.status === "missing" ? "No cover" : "Cover"}</span>`;
    const item = document.createElement("li");
    item.className = "issue-item";
    item.innerHTML = `
      ${coverMarkup}
      <span class="issue-number">${index + 1}</span>
      <span>
        <span class="issue-title">${escapeHtml(issue)}</span>
        <span class="issue-note">${cover?.name ? escapeHtml(cover.name) : current.skipped ? "Skipped for now" : current.read ? "Finished" : "Next in order"}</span>
      </span>
      <button class="state-button read ${current.read ? "active" : ""}" type="button">${current.read ? "Read" : "Unread"}</button>
      <button class="state-button owned ${current.owned ? "active" : ""}" type="button">Read</button>
      <button class="state-button skip ${current.skipped ? "active" : ""}" type="button">${current.skipped ? "Skipped" : "Skip"}</button>
    `;
    item.querySelector(".read").addEventListener("click", () => toggleIssue(story.id, index, "read"));
    item.querySelector(".owned").addEventListener("click", () => toggleIssue(story.id, index, "owned"));
    item.querySelector(".skip").addEventListener("click", () => toggleIssue(story.id, index, "skipped"));
    elements.issueList.append(item);
    
    // Cache the image if it's not already cached
    if (cover?.image && !state.imageCache[cover.image]) {
      cacheImage(cover.image);
    }
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
  saveState();
  renderStoryList();
  renderAllStorylines();
  renderSelectedStory();
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
  const match = issue.match(/^(.*?)\s+#?([\w.-]+)$/);
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
    headers: { "Content-Type": "application/json" },
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

    const imageUrl = match.image.small_url || match.image.medium_url || match.image.icon_url;
    
    // Check image cache
    if (state.imageCache[imageUrl]) {
      return {
        status: "loaded",
        name: [match.volume?.name, match.issue_number ? `#${match.issue_number}` : "", match.name].filter(Boolean).join(" "),
        image: state.imageCache[imageUrl],
        url: match.site_detail_url
      };
    }

    return {
      status: "loaded",
      name: [match.volume?.name, match.issue_number ? `#${match.issue_number}` : "", match.name].filter(Boolean).join(" "),
      image: imageUrl,
      url: match.site_detail_url
    };
  } catch (error) {
    return { status: "missing", error: error.message };
  }
}

async function findPriorityCover(issue) {
  if (state.comicVineKey.trim()) {
    const comicVineCover = await findComicVineCover(issue);
    if (comicVineCover?.status === "loaded" && comicVineCover.image) {
      return comicVineCover;
    }
  }

  if (state.dataSource === "gcd") {
    const gcdCover = await findGcdCover(issue);
    if (gcdCover?.status === "loaded" && gcdCover.image) {
      return gcdCover;
    }
  }

  if (state.dataSource === "marvel") {
    const marvelCover = await findMarvelCover(issue);
    if (marvelCover?.status === "loaded" && marvelCover.image) {
      return marvelCover;
    }
  }

  return { status: "missing" };
}

async function gcdRequest(path) {
  const url = `https://www.comics.org/api${path}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`GCD request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`GCD request failed: ${error.message}`);
  }
}

async function marvelRequest(path) {
  const url = `https://marvel.emreparker.com/v1${path}`;
  try {
    const response = await fetch(url);
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
    // Try to find series by name
    const seriesData = await gcdRequest(`/series/name/${encodeURIComponent(parsed.volume)}/`);
    if (!seriesData || !Array.isArray(seriesData.results) || seriesData.results.length === 0) {
      return { status: "missing" };
    }

    // Find the best matching series
    const series = seriesData.results[0];
    
    // Try to find the specific issue
    const issueData = await gcdRequest(`/series/name/${encodeURIComponent(parsed.volume)}/issue/${encodeURIComponent(parsed.issueNumber)}/`);
    if (!issueData || !Array.isArray(issueData.results) || issueData.results.length === 0) {
      return { status: "missing" };
    }

    const gcdIssue = issueData.results[0];
    if (!gcdIssue.image_url) {
      return { status: "missing" };
    }

    const imageUrl = gcdIssue.image_url;
    
    // Check image cache
    if (state.imageCache[imageUrl]) {
      return {
        status: "loaded",
        name: `${series.name} #${gcdIssue.number}`,
        image: state.imageCache[imageUrl],
        url: `https://www.comics.org/issue/${gcdIssue.id}/`
      };
    }

    return {
      status: "loaded",
      name: `${series.name} #${gcdIssue.number}`,
      image: imageUrl,
      url: `https://www.comics.org/issue/${gcdIssue.id}/`
    };
  } catch (error) {
    return { status: "missing" };
  }
}

async function findMarvelCover(issue) {
  const parsed = parseIssue(issue);
  try {
    // Search for issues by title
    const data = await marvelRequest(`/search/issues?q=${encodeURIComponent(parsed.query)}`);
    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return { status: "missing" };
    }

    // Find the best matching issue
    const normalizedVolume = parsed.volume.toLowerCase();
    const normalizedNumber = parsed.issueNumber.toLowerCase();
    const match = data.results.find((result) => {
      const seriesName = result.series?.name?.toLowerCase() || "";
      const resultNumber = String(result.number || "").toLowerCase();
      return seriesName.includes(normalizedVolume) && (!normalizedNumber || resultNumber === normalizedNumber);
    }) || data.results[0];

    if (!match) {
      return { status: "missing" };
    }

    const imageUrl = match.cover_url || "";
    
    // Check image cache
    if (imageUrl && state.imageCache[imageUrl]) {
      return {
        status: "loaded",
        name: `${match.series?.name || "Marvel"} #${match.number}`,
        image: state.imageCache[imageUrl],
        url: match.marvel_url || ""
      };
    }

    return {
      status: "loaded",
      name: `${match.series?.name || "Marvel"} #${match.number}`,
      image: imageUrl,
      url: match.marvel_url || ""
    };
  } catch (error) {
    return { status: "missing" };
  }
}

async function cacheImage(imageUrl) {
  if (!imageUrl) {
    return;
  }

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

    // Download and upload image to server
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve) => {
      reader.onloadend = async () => {
        const base64 = reader.result;
        
        // Upload to server
        try {
          const uploadResponse = await fetch(`${window.location.origin}/api/covers/upload`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${state.token || ""}`
            },
            body: JSON.stringify({ imageUrl, imageData: base64 })
          });
          const uploadData = await uploadResponse.json();
          
          if (uploadData.success) {
            state.imageCache[imageUrl] = `${window.location.origin}/api/covers/image/${uploadData.filename}`;
            saveState();
          }
        } catch (error) {
          // Upload failed, fall back to base64
          state.imageCache[imageUrl] = base64;
          saveState();
        }
        
        resolve();
      };
      reader.readAsDataURL(blob);
    });
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
    if (coverFor(story.id, index)?.image) continue;
    elements.apiStatus.innerHTML = `<span class="spinner"></span> Loading cover ${index + 1} of ${story.issues.length}...`;
    try {
      const cover = await findPriorityCover(story.issues[index]);
      setCover(story.id, index, cover);
      if (cover?.error) {
        elements.apiStatus.textContent = `Comic Vine cover lookup issue: ${cover.error}`;
      }
    } catch (error) {
      setCover(story.id, index, { status: "missing" });
    }
    saveState();
    renderSelectedStory();
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
  }

  elements.apiStatus.textContent = "Cover lookup finished.";
  elements.loadCovers.disabled = false;
  elements.loadCovers.classList.remove("loading");
  saveState();
  
  // Automatically save to server if logged in
  if (state.isAuthenticated && state.sessionEmail && elements.profilePassword.value) {
    try {
      const dataToSave = {
        progress: state.progress,
        customStorylines: state.customStorylines,
        covers: state.covers,
        komgaMatches: state.komgaMatches,
        mylarMatches: state.mylarMatches,
        selectedId: state.selectedId,
        darkMode: state.darkMode
      };
      
      await fetch(`${window.location.origin}/api/profile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: state.sessionEmail, 
          password: elements.profilePassword.value,
          data: dataToSave 
        })
      });
      elements.apiStatus.textContent = "Cover lookup finished and saved to server.";
    } catch (error) {
      elements.apiStatus.textContent = "Cover lookup finished. (Could not auto-save to server - click Save to Server)";
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
      headers: { "Content-Type": "application/json" },
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
    response = await fetch("http://localhost:4178/api/mylar-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl,
        apiKey: state.mylar.apiKey,
        path,
        method: options.method || "GET",
        body: requestBody
      })
    });
  } catch (error) {
    throw new Error("Browser could not reach the ARCS! Mylar3 proxy. Make sure the local server is running at http://localhost:4178");
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
    throw new Error(`Mylar3 request failed: ${response.status}${detail}. Response: ${errorText}`);
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
    await mylarRequest("/api/comics");
    elements.mylarStatus.textContent = "Mylar3 connection works.";
  } catch (error) {
    if (error.message.includes("401") || error.message.includes("403")) {
      elements.mylarStatus.textContent = "Mylar3 rejected the API key. Check that your API key is correct in Mylar3 settings.";
    } else if (error.message.includes("could not reach")) {
      elements.mylarStatus.textContent = "Could not reach the Mylar3 proxy. Make sure the ARCS! server is running.";
    } else {
      elements.mylarStatus.textContent = error.message;
    }
  } finally {
    elements.testMylar.classList.remove("loading");
    elements.testMylar.disabled = false;
  }
}

async function syncMylarForSelectedStory() {
  const story = state.storylines.find((s) => s.id === state.selectedId);
  if (!story) {
    elements.readingHint.textContent = "No storyline selected.";
    return;
  }

  elements.syncMylar.disabled = true;
  elements.syncMylar.classList.add("loading");
  elements.readingHint.textContent = "Syncing with Mylar3...";
  setKomgaSyncIndicator("syncing", "Syncing with Mylar3...");

  let matched = 0;
  let marked = 0;
  let missing = 0;

  try {
    for (let index = 0; index < story.issues.length; index += 1) {
      const issue = story.issues[index];
      let current = issueState(story.id, index);
      let match = state.mylarMatches?.[story.id]?.[index];
      let comic = null;

      // Try to find comic in Mylar3
      try {
        const data = await mylarRequest(`/api/comics?name=${encodeURIComponent(issue)}`);
        const comics = Array.isArray(data) ? data : (data?.data || []);
        if (comics.length > 0) {
          comic = comics[0];
          saveMylarMatch(story.id, index, comic);
          match = state.mylarMatches[story.id][index];
        }
      } catch (error) {
        // Comic not found in Mylar3
      }

      if (comic?.status === "Downloaded" || comic?.status === "Read") {
        storyProgress(story.id)[index] = { ...current, read: true, skipped: false };
        current = issueState(story.id, index);
      }

      if (!match?.id) {
        missing += 1;
        continue;
      }

      matched += 1;
      if (current.read || current.owned) {
        try {
          await mylarRequest(`/api/comic/${encodeURIComponent(match.id)}`, {
            method: "PUT",
            body: { status: "Read" }
          });
          marked += 1;
        } catch (error) {
          // Failed to update status
        }
      }
    }

    saveState();
    elements.readingHint.textContent = `Mylar3 sync done: ${matched} matched, ${marked} marked read, ${missing} not found.`;
    setKomgaSyncIndicator(
      missing ? "warning" : "success",
      `Mylar3 sync done: ${matched} matched, ${marked} marked read, ${missing} not found.`
    );
  } catch (error) {
    elements.readingHint.textContent = `Mylar3 sync failed: ${error.message}`;
    setKomgaSyncIndicator("failed", `Mylar3 sync failed: ${error.message}`);
  } finally {
    elements.syncMylar.disabled = false;
    elements.syncMylar.classList.remove("loading");
  }
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
      render();

      elements.syncStatus.textContent = `Imported CBL file with ${issues.length} issues as "${customStoryline.title}".`;
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
    elements.readingHint.textContent = `Komga sync done: ${matched} matched, ${marked} marked read, ${missing} not found.`;
    setKomgaSyncIndicator(
      missing ? "warning" : "success",
      `Komga sync done: ${matched} matched, ${marked} marked read, ${missing} not found.`
    );
  } catch (error) {
    elements.readingHint.textContent = `Komga sync failed: ${error.message}`;
    setKomgaSyncIndicator("failed", `Komga sync failed: ${error.message}`);
  } finally {
    elements.syncKomga.disabled = false;
    elements.syncKomga.classList.remove("loading");
  }
}

async function searchGcdSeries(query) {
  try {
    const data = await gcdRequest(`/series/name/${encodeURIComponent(query)}/`);
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    throw new Error(`GCD search failed: ${error.message}`);
  }
}

async function searchGcdSeriesIssues(seriesId) {
  try {
    const data = await gcdRequest(`/series/${seriesId}/`);
    if (!data) return [];
    return data.issues || [];
  } catch (error) {
    throw new Error(`GCD series fetch failed: ${error.message}`);
  }
}

async function searchMarvelSeries(query) {
  try {
    const data = await marvelRequest(`/search/issues?q=${encodeURIComponent(query)}`);
    if (!data || !Array.isArray(data.results)) return [];
    
    // Group by series
    const seriesMap = new Map();
    data.results.forEach(issue => {
      const seriesName = issue.series?.name || "Unknown";
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, {
          id: issue.series?.id || seriesName,
          name: seriesName,
          year_began: issue.year || "",
          publisher: { name: "Marvel" },
          image_url: issue.cover_url || "",
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
    if (!data || !Array.isArray(data.results)) return [];
    return data.results;
  } catch (error) {
    throw new Error(`Marvel series fetch failed: ${error.message}`);
  }
}

async function searchComicVineArcs() {
  const query = elements.vineArcSearch.value.trim();
  if (!query) {
    elements.vineLookupStatus.textContent = "Enter a storyline name to search.";
    return;
  }

  elements.searchVineArcs.disabled = true;
  elements.searchVineArcs.classList.add("loading");
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Searching Comic Vine for "${query}"...`;
  elements.vineArcResults.innerHTML = "";

  const allResults = [];
  const errors = [];

  // Search Comic Vine if API key is available (prioritize story arcs)
  if (state.comicVineKey.trim()) {
    try {
      const data = await comicVineJsonp("search/", {
        resources: "story_arc",
        query,
        limit: "5",
        field_list: "id,name,deck,description,image,publisher,site_detail_url"
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
        allResults.push({ ...result, source: "comicvine", sourceLabel: "Comic Vine", type: "Story Arc", priority: 1 });
      });
    } catch (error) {
      errors.push({ source: "Comic Vine", error: error.message });
    }
  }

  // Sort results by priority (story arcs first)
  allResults.sort((a, b) => (a.priority || 2) - (b.priority || 2));

  // Render combined results
  renderUnifiedResults(allResults);

  // Update status
  const totalResults = allResults.length;
  elements.vineLookupStatus.textContent = totalResults 
    ? `Found ${totalResults} Comic Vine result${totalResults === 1 ? "" : "s"}.`
    : "No Comic Vine results found.";

  if (errors.length > 0) {
    const errorMessages = errors.map(e => `${e.source}: ${e.error}`).join("; ");
    elements.vineLookupStatus.textContent += ` Comic Vine search failed: ${errorMessages}`;
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
  const importButton = document.querySelector(`[data-arc-id="${arc.id}"]`);
  if (importButton) {
    importButton.classList.add("loading");
    importButton.disabled = true;
  }
  elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Importing ${arc.name}...`;
  try {
    const data = await comicVineJsonp(`story_arc/4045-${arc.id}/`, {
      field_list: "id,name,deck,description,issues,publisher,image,site_detail_url"
    });
    const detail = data?.results || arc;
    const issues = Array.isArray(detail.issues) ? detail.issues : [];
    if (!issues.length) {
      elements.vineLookupStatus.textContent = "Comic Vine returned this arc, but no issues were available to import.";
      if (importButton) {
        importButton.classList.remove("loading");
        importButton.disabled = false;
      }
      return;
    }

    const importedIssues = issues.map(formatComicVineIssue).filter(Boolean);
    
    // Validate issues against multiple sources (optional - include all if validation fails)
    elements.vineLookupStatus.innerHTML = `<span class="spinner"></span> Validating ${importedIssues.length} issues against multiple sources...`;
    const validatedIssues = [];
    let confirmedCount = 0;
    
    for (const issue of importedIssues) {
      let confirmed = false;
      
      // Check against GCD
      try {
        const gcdCover = await findGcdCover(issue);
        if (gcdCover.status === "loaded") {
          confirmed = true;
        }
      } catch (error) {
        // GCD check failed, continue to next source
      }
      
      // Check against Marvel if not confirmed by GCD
      if (!confirmed) {
        try {
          const marvelCover = await findMarvelCover(issue);
          if (marvelCover.status === "loaded") {
            confirmed = true;
          }
        } catch (error) {
          // Marvel check failed
        }
      }
      
      // Include all issues, but track which ones are confirmed
      validatedIssues.push(issue);
      if (confirmed) {
        confirmedCount++;
      }
    }
    
    const importedStory = {
      id: `vine-${detail.id || arc.id}`,
      title: detail.name || arc.name || "Comic Vine Story Arc",
      publisher: publisherKey(detail.publisher?.name || arc.publisher?.name || "custom"),
      years: "Comic Vine",
      note: `Imported from Comic Vine. ${confirmedCount}/${importedIssues.length} issues confirmed by external sources.`,
      sourceUrl: detail.site_detail_url || arc.site_detail_url || "",
      issues: validatedIssues
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
    render();
    renderSelectedStory();
    elements.vineLookupStatus.textContent = `${importedStory.title} imported with ${validatedIssues.length} issues (${confirmedCount} confirmed by external sources).`;
  } catch (error) {
    elements.vineLookupStatus.textContent = "Could not import that Comic Vine story arc.";
  } finally {
    if (importButton) {
      importButton.classList.remove("loading");
      importButton.disabled = false;
    }
  }
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
      const issueNumber = issue.number ? `#${issue.number}` : "";
      return `${series.name}${issueNumber}`.trim();
    }).filter(Boolean);

    const years = series.year_began && series.year_ended 
      ? (series.year_began === series.year_ended ? series.year_began : `${series.year_began}-${series.year_ended}`)
      : series.year_began || "";

    const importedStory = {
      id: `gcd-${series.id}`,
      title: series.name || "GCD Series",
      publisher: publisherKey(series.publisher?.name || "custom"),
      years: years,
      note: "Imported from Grand Comics Database. Order follows GCD issue listing.",
      sourceUrl: `https://www.comics.org/series/${series.id}/`,
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
    render();
    renderSelectedStory();
    elements.vineLookupStatus.textContent = `${importedStory.title} imported with ${importedIssues.length} issues.`;
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
      const issueNumber = issue.number ? `#${issue.number}` : "";
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
    render();
    renderSelectedStory();
    elements.vineLookupStatus.textContent = `${importedStory.title} imported with ${importedIssues.length} issues.`;
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
  render();
  renderSelectedStory();
  elements.vineLookupStatus.textContent = `${importedStory.title} imported from internet search.`;
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
  console.log("Render called, isAuthenticated:", state.isAuthenticated);
  if (elements.loginScreen) {
    elements.loginScreen.classList.add("hidden");
    console.log("Login screen hidden:", elements.loginScreen.classList.contains("hidden"));
  }
  if (elements.appShell) {
    elements.appShell.classList.remove("hidden");
    console.log("App shell hidden:", elements.appShell.classList.contains("hidden"));
  }
  
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
    const avatar = state.profile?.avatar || "Doom-6.png";
    if (avatar.endsWith('.png') || avatar.endsWith('.jpg') || avatar.endsWith('.jpeg')) {
      elements.profileAvatar.innerHTML = `<img src="${avatar}" alt="Profile avatar" />`;
    } else {
      elements.profileAvatar.textContent = avatar;
    }
  }
  
  // Update avatar selection
  if (elements.avatarSelector) {
    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.avatar === (state.profile?.avatar || "Doom-6.png"));
    });
  }
  
  // Update authentication UI
  if (state.isAuthenticated) {
    elements.registerProfile.style.display = "none";
    elements.loginProfile.style.display = "none";
    elements.logoutProfile.style.display = "inline-block";
    elements.saveToServer.style.display = "inline-block";
    if (elements.logoutButton) {
      elements.logoutButton.style.display = "inline-block";
    }
  } else {
    elements.registerProfile.style.display = "inline-block";
    elements.loginProfile.style.display = "inline-block";
    elements.logoutProfile.style.display = "none";
    elements.saveToServer.style.display = "none";
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
    apiKey: elements.mylarApiKey.value.trim()
  };
  elements.mylarStatus.textContent = "Mylar3 settings saved.";
  saveState();
  render();
});

elements.testMylar.addEventListener("click", () => {
  state.mylar = {
    url: elements.mylarUrl.value.trim(),
    apiKey: elements.mylarApiKey.value.trim()
  };
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
      avatar: state.profile?.avatar || "📚"
    };
    // Automatically save current progress when profile is created/updated
    saveState();
    elements.syncStatus.textContent = "Profile and progress saved on this device.";
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
      body: JSON.stringify({ name, email, password, publisher, avatar: state.profile?.avatar || "📚" })
    });
    
    const data = await response.json();
    
    if (data.success) {
      state.profile = {
        name,
        email,
        publisher,
        syncName: data.syncName,
        avatar: state.profile?.avatar || "📚"
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
        state.komgaMatches = data.profile.data.komgaMatches || {};
        state.mylarMatches = data.profile.data.mylarMatches || {};
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
  if (state.isAuthenticated && state.sessionEmail && elements.profilePassword.value) {
    try {
      const dataToSave = {
        progress: state.progress,
        customStorylines: state.customStorylines,
        covers: state.covers,
        komgaMatches: state.komgaMatches,
        mylarMatches: state.mylarMatches,
        selectedId: state.selectedId,
        darkMode: state.darkMode,
        archivedStorylines: state.archivedStorylines,
        showArchived: state.showArchived
      };
      
      await fetch(`${window.location.origin}/api/profile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: state.sessionEmail, 
          password: elements.profilePassword.value,
          data: dataToSave 
        })
      });
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

// Save to server
elements.saveToServer.addEventListener("click", async () => {
  if (!state.isAuthenticated || !state.sessionEmail) {
    elements.syncStatus.textContent = "Please log in first.";
    return;
  }
  
  const password = elements.profilePassword.value;
  if (!password) {
    elements.syncStatus.textContent = "Password required to save to server.";
    return;
  }
  
  try {
    const dataToSave = {
      progress: state.progress,
      customStorylines: state.customStorylines,
      covers: state.covers,
      komgaMatches: state.komgaMatches,
      mylarMatches: state.mylarMatches,
      selectedId: state.selectedId,
      darkMode: state.darkMode,
      archivedStorylines: state.archivedStorylines,
      showArchived: state.showArchived
    };
    
    const response = await fetch(`${window.location.origin}/api/profile/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: state.sessionEmail, 
        password,
        data: dataToSave 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      elements.syncStatus.textContent = "Profile data saved to server successfully.";
    } else {
      elements.syncStatus.textContent = data.error || "Save failed.";
    }
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
  if (event.key === "Enter") {
    searchComicVineArcs();
  }
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
  render();
});

// Login screen tab switching
const loginTabs = document.querySelectorAll(".login-tab");
console.log("Found login tabs:", loginTabs.length);
loginTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetTab = tab.dataset.tab;
    console.log("Tab clicked:", targetTab);
    
    // Update tab styles
    document.querySelectorAll(".login-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === targetTab);
    });
    
    // Show/hide forms
    const allForms = document.querySelectorAll(".login-form");
    console.log("Found forms:", allForms.length);
    allForms.forEach((form) => {
      form.classList.remove("active");
      form.classList.add("hidden");
    });
    
    const targetForm = document.querySelector(`#${targetTab}Form`);
    console.log("Target form:", targetForm);
    if (targetForm) {
      targetForm.classList.remove("hidden");
      targetForm.classList.add("active");
      console.log("Form classes after showing:", targetForm.className);
    }
    
    // Clear status messages
    document.querySelectorAll(".status-message").forEach((msg) => {
      msg.textContent = "";
      msg.classList.remove("success", "error");
    });
  });
});

// Login screen avatar selection
document.querySelectorAll("#registerForm .avatar-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll("#registerForm .avatar-option").forEach((opt) => {
      opt.classList.remove("active");
    });
    option.classList.add("active");
  });
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
      const response = await fetch("http://localhost:4178/api/profile/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
      
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
          state.komgaMatches = data.profile.data.komgaMatches || {};
        }
        
        saveState();
        elements.loginStatus.textContent = "Login successful!";
        elements.loginStatus.classList.add("success");
        
        setTimeout(() => {
          render();
        }, 500);
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
      const response = await fetch("http://localhost:4178/api/profile/register", {
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
        saveState();
        elements.registerStatus.textContent = `Account created! Your sync name: ${data.syncName}`;
        elements.registerStatus.classList.add("success");
        
        setTimeout(() => {
          render();
        }, 500);
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
      const response = await fetch("http://localhost:4178/api/profile/reset-password", {
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
