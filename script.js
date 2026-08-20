let state = {
  shows: [],
  episodes: [],
  episodesCache: {}, // In-memory cache: { showId: [episodes] } to avoid re-fetching URLs
  selectedShowId: "",
  selectedEpisodeId: "ALL",
  searchTerm: "",
};

async function setup() {
  // Attach event listeners
  document
    .getElementById("show-select")
    .addEventListener("change", handleShowSelectChange);
  document
    .getElementById("episode-select")
    .addEventListener("change", handleEpisodeSelectChange);
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearchInput);

  try {
    showLoading(true);

    // Fetch all shows on page load
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Failed to fetch shows (HTTP Status ${response.status})`);
    }

    const rawShows = await response.json();

    // Sort shows alphabetically, case-insensitive
    state.shows = rawShows.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );

    populateShowDropdown(state.shows);

    // Default to the first show in the sorted list
    if (state.shows.length > 0) {
      state.selectedShowId = state.shows[0].id.toString();
      document.getElementById("show-select").value = state.selectedShowId;
      await loadEpisodesForShow(state.selectedShowId);
    }
  } catch (error) {
    showError(`Error loading shows: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function loadEpisodesForShow(showId) {
  showLoading(true);
  hideError();

  try {
    // Requirement 6: Check cache first before making a fetch request
    if (state.episodesCache[showId]) {
      state.episodes = state.episodesCache[showId];
    } else {
      const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/episodes`,
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch episodes (HTTP Status ${response.status})`,
        );
      }
      const fetchedEpisodes = await response.json();
      state.episodesCache[showId] = fetchedEpisodes;
      state.episodes = fetchedEpisodes;
    }

    // Reset controls state for new show
    state.selectedEpisodeId = "ALL";
    state.searchTerm = "";
    document.getElementById("search-input").value = "";

    populateEpisodeDropdown(state.episodes);
    render();
  } catch (error) {
    showError(`Error loading episodes: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

async function handleShowSelectChange(event) {
  state.selectedShowId = event.target.value;
  await loadEpisodesForShow(state.selectedShowId);
}

function handleEpisodeSelectChange(event) {
  state.selectedEpisodeId = event.target.value;
  render();
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();
  render();
}

function getFilteredEpisodes() {
  return state.episodes.filter((episode) => {
    // Dropdown Filter
    const matchesSelect =
      state.selectedEpisodeId === "ALL" ||
      episode.id.toString() === state.selectedEpisodeId;

    // Search Input Filter
    const titleMatch = episode.name
      ? episode.name.toLowerCase().includes(state.searchTerm)
      : false;
    const summaryMatch = episode.summary
      ? episode.summary.toLowerCase().includes(state.searchTerm)
      : false;
    const matchesSearch = titleMatch || summaryMatch;

    return matchesSelect && matchesSearch;
  });
}

function render() {
  const filteredEpisodes = getFilteredEpisodes();

  // Render episode cards
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const cards = filteredEpisodes.map(createEpisodeCard);
  rootElem.append(...cards);

  // Update match count indicator
  const matchCountElem = document.getElementById("match-count");
  matchCountElem.textContent = `Displaying ${filteredEpisodes.length}/${state.episodes.length} episode(s)`;
}

function populateShowDropdown(shows) {
  const showSelectElem = document.getElementById("show-select");
  showSelectElem.innerHTML = "";

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelectElem.appendChild(option);
  });
}

function populateEpisodeDropdown(episodes) {
  const episodeSelectElem = document.getElementById("episode-select");
  episodeSelectElem.innerHTML = `<option value="ALL">All Episodes</option>`;

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    episodeSelectElem.appendChild(option);
  });
}

function getEpisodeCode(episode) {
  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  return `S${season}E${number}`;
}

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-template");
  const cardNode = template.content.cloneNode(true);

  const episodeCode = getEpisodeCode(episode);

  cardNode.querySelector(".episode-title").textContent =
    `${episode.name} - ${episodeCode}`;
  cardNode.querySelector(".episode-image").src = episode.image?.medium || "";
  cardNode.querySelector(".episode-image").alt =
    episode.name || "Episode image";
  cardNode.querySelector(".episode-summary").innerHTML = episode.summary || "";

  return cardNode;
}

function showLoading(isLoading) {
  const loadingElem = document.getElementById("loading-indicator");
  loadingElem.hidden = !isLoading;
}

function showError(message) {
  const errorElem = document.getElementById("error-message");
  errorElem.textContent = message;
  errorElem.hidden = false;
}

function hideError() {
  const errorElem = document.getElementById("error-message");
  errorElem.hidden = true;
}

window.onload = setup;
