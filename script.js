function setup() {
  const allEpisodes = getAllEpisodes();

  const card = allEpisodes.map(makePageForEpisodes);
  const rootElem = document.getElementById("root");
  rootElem.append(...card);
  //makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episode) {
  const filmCard = document

    .getElementById("episode-template")

    .content.cloneNode(true);

  const seasonNumber = episode.season.toString().padStart(2, "0");

  const episodeNumber = episode.number.toString().padStart(2, "0");

  const episodeCode = `S${seasonNumber}E${episodeNumber}`;

  filmCard.querySelector(".episode-title").textContent =
    `${episode.name}: ${episodeCode}`;

  filmCard.querySelector(".episode-image").src = episode.image.medium;

  filmCard.querySelector(".episode-image").alt = episode.name;

  filmCard.querySelector(".episode-summary").innerHTML = episode.summary;

  return filmCard;
}
window.onload = setup;
