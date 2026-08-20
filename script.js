let state = {
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "ALL",
};

async function setup() {
  // Attach Event Listeners
  document
    .getElementById("search-input")
    .addEventListener("input", handleSearchInput);
  document
    .getElementById("episode-select")
    .addEventListener("change", handleSelectChange);

  const loadingElem = document.getElementById("loading-indicator");
  const errorElem = document.getElementById("error-message");

  try {
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

    if (!response.ok) {
      throw new Error(`Server returned HTTP status ${response.status}`);
    }

    const episodes = await response.json();
    state.allEpisodes = episodes;

    // Hide loading screen
    loadingElem.hidden = true;

    // Populate dropdown and render page once data is ready
    populateSelectDropdown(state.allEpisodes);
    render();
  } catch (error) {
    // Hide loading indicator and reveal user-facing error message
    loadingElem.hidden = true;
    errorElem.textContent = `Failed to load episodes: ${error.message}. Please try refreshing the page.`;
    errorElem.hidden = false;
  }
}

function handleSearchInput(event) {
  state.searchTerm = event.target.value.toLowerCase();
  render();
}

function handleSelectChange(event) {
  state.selectedEpisodeId = event.target.value;
  render();
}

function getFilteredEpisodes() {
  return state.allEpisodes.filter((episode) => {
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

  // Render cards to grid
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  const cards = filteredEpisodes.map(createEpisodeCard);
  rootElem.append(...cards);

  // Update counter display
  const matchCountElem = document.getElementById("match-count");
  matchCountElem.textContent = `Displaying ${filteredEpisodes.length}/${state.allEpisodes.length} episode(s)`;
}

function populateSelectDropdown(episodes) {
  const selectElem = document.getElementById("episode-select");

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${getEpisodeCode(episode)} - ${episode.name}`;
    selectElem.appendChild(option);
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

window.onload = setup;
