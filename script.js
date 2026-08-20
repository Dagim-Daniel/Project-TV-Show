// Stores fetched episodes in browser memory (fetched only once)
let allEpisodes = [];

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML =
    "<p class='message message-loading'>Loading episodes, please wait...</p>";

  try {
    // 1. Fetch data ONCE on initialization
    const response = await fetch("https://api.tvmaze.com/shows/82/episodes");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    allEpisodes = await response.json();

    // 2. Clear loading message
    rootElem.innerHTML = "";

    // 3. Populate dropdown & render initial cards
    populateDropdown(allEpisodes);
    renderEpisodes(allEpisodes);

    // 4. Attach Event Listeners
    document
      .getElementById("search-input")
      .addEventListener("input", handleSearch);
    document
      .getElementById("episode-select")
      .addEventListener("change", handleSelect);
  } catch (error) {
    rootElem.innerHTML = `
      <div class="message message-error">
        <p>⚠️ Failed to load episodes. Please check your internet connection or try again later.</p>
        <p><small>Error details: ${error.message}</small></p>
      </div>
    `;
  }
}

// Helper: Formats season and episode numbers to standard S01E01 format
function formatEpisodeCode(season, number) {
  const seasonNumber = String(season).padStart(2, "0");
  const episodeNumber = String(number).padStart(2, "0");
  return `S${seasonNumber}E${episodeNumber}`;
}

// Populates the <select> element options dynamically
function populateDropdown(episodes) {
  const selectElem = document.getElementById("episode-select");

  episodes.forEach((episode) => {
    const episodeCode = formatEpisodeCode(episode.season, episode.number);
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeCode} - ${episode.name}`;
    selectElem.appendChild(option);
  });
}

// Handles filtering when typing in the search box
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();

  // Reset selector dropdown to default when searching
  document.getElementById("episode-select").value = "ALL";

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const nameMatch = episode.name.toLowerCase().includes(searchTerm);
    const summaryMatch =
      episode.summary?.toLowerCase().includes(searchTerm) || false;
    return nameMatch || summaryMatch;
  });

  renderEpisodes(filteredEpisodes);
}

// Handles filtering when choosing from the dropdown
function handleSelect(event) {
  const selectedId = event.target.value;

  // Clear search input when selecting from dropdown
  document.getElementById("search-input").value = "";

  if (selectedId === "ALL") {
    renderEpisodes(allEpisodes);
  } else {
    const selectedEpisode = allEpisodes.filter(
      (ep) => String(ep.id) === selectedId,
    );
    renderEpisodes(selectedEpisode);
  }
}

// Renders the list of episode cards to the DOM and updates count
function renderEpisodes(episodesToRender) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const episodeCards = episodesToRender.map(makeEpisodeCard);
  rootElem.append(...episodeCards);

  const countElem = document.getElementById("episode-count");
  if (countElem) {
    countElem.textContent = `Displaying ${episodesToRender.length} / ${allEpisodes.length} episodes`;
  }
}

// Creates an individual episode card DOM Node from the template
function makeEpisodeCard(episode) {
  const episodeCard = document
    .getElementById("episode-template")
    .content.cloneNode(true);

  const episodeCode = formatEpisodeCode(episode.season, episode.number);

  const titleElem = episodeCard.querySelector(".episode-title");
  if (titleElem) {
    titleElem.textContent = `${episode.name} - ${episodeCode}`;
  }

  const imageElem = episodeCard.querySelector(".episode-image");
  if (imageElem) {
    imageElem.src =
      episode.image?.medium ||
      "https://via.placeholder.com/210x295?text=No+Image";
    imageElem.alt = `Poster for ${episode.name}`;
  }

  const summaryElem = episodeCard.querySelector(".episode-summary");
  if (summaryElem) {
    summaryElem.innerHTML = episode.summary || "<p>No summary available.</p>";
  }

  return episodeCard;
}

window.onload = setup;
