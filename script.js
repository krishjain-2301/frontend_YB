console.log("JS LOADED");
let songNextPageToken = null;
let isLoadingSongs = false;

const startBtn = document.getElementById("startBtn");
const landing = document.getElementById("landing");
const choiceScreen = document.getElementById("choiceScreen");

const songChoice = document.getElementById("songChoice");
const movieChoice = document.getElementById("movieChoice");

const songSection = document.getElementById("songSection");
const movieSection = document.getElementById("movieSection");

const songBackBtn = document.getElementById("songBackBtn");
const movieBackBtn = document.getElementById("movieBackBtn");

const emotionGrid = document.getElementById("emotionGrid");
const songGrid = document.getElementById("songGrid");
const songLoadMoreBtn = document.getElementById("songLoadMoreBtn");

const genreGrid = document.getElementById("genreGrid");
const movieGrid = document.getElementById("movieGrid");

let currentEmotion = null;
let currentGenre = null;
let moviePage = 1;
let isLoadingMovies = false;

/* ---------- START ---------- */
startBtn.onclick = () => {
  landing.classList.add("hidden");
  choiceScreen.classList.remove("hidden");
};

songBackBtn.onclick = () => {
  songSection.classList.add("hidden");
  choiceScreen.classList.remove("hidden");

  // reset song state
  songGrid.innerHTML = "";
  songNextPageToken = null;
  currentEmotion = null;
};

movieBackBtn.onclick = () => {
  movieSection.classList.add("hidden");
  choiceScreen.classList.remove("hidden");

  // reset movie state
  movieGrid.innerHTML = "";
  currentGenre = null;
  moviePage = 1;
};

/* ---------- CHOICE ---------- */
songChoice.onclick = () => {
  choiceScreen.classList.add("hidden");
  songSection.classList.remove("hidden");
  renderEmotionGrid();
};

movieChoice.onclick = () => {
  choiceScreen.classList.add("hidden");
  movieSection.classList.remove("hidden");
  fetchGenres();
};

/* ---------- SONG MODE ---------- */
const emotions = ["sadness","joy","anger","fear","surprise","neutral"];

function renderEmotionGrid() {
  emotionGrid.innerHTML = "";

  emotions.forEach(emotion => {
    const card = document.createElement("div");
    card.className =
      "p-6 bg-white/5 border border-white/10 rounded-xl text-center cursor-pointer hover:bg-white/10 transition";

    card.textContent =
      emotion.charAt(0).toUpperCase() + emotion.slice(1);

    card.onclick = () => {
      currentEmotion = emotion;
      songGrid.innerHTML = "";
      songNextPageToken = null;
      fetchSongs();
    };

    emotionGrid.appendChild(card);
  });
}

async function fetchSongs() {
  if (!currentEmotion || isLoadingSongs) return;

  isLoadingSongs = true;

  let url = `http://127.0.0.1:5000/songs?emotion=${currentEmotion}`;

  if (songNextPageToken) {
    url += `&pageToken=${songNextPageToken}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const songs = data.songs || [];
  songNextPageToken = data.nextPageToken;

  songs.forEach(song => {
    const card = document.createElement("div");
    card.className =
      "bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition";

    card.innerHTML = `
      <img src="https://img.youtube.com/vi/${extractVideoId(song.url)}/hqdefault.jpg"
           class="w-full h-64 object-cover">
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-medium">${song.title}</h3>
        <a href="${song.url}"
           target="_blank"
           class="inline-block mt-2 text-sm underline">
           ▶ Listen on YouTube
        </a>
      </div>
    `;

    songGrid.appendChild(card);
  });

  isLoadingSongs = false;
}


function extractVideoId(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : "";
}

/* ---------- MOVIE MODE ---------- */
async function fetchGenres() {
  const res = await fetch("http://127.0.0.1:5000/genres");
  const genres = await res.json();

  genreGrid.innerHTML = "";

  genres.forEach(genre => {
    const card = document.createElement("div");
    card.className =
      "p-6 bg-white/5 border border-white/10 rounded-xl text-center cursor-pointer hover:bg-white/10 transition";

    card.textContent = genre.name;

    card.onclick = () => {
      currentGenre = genre.id;
      moviePage = 1;
      movieGrid.innerHTML = "";
      fetchMovies();
    };

    genreGrid.appendChild(card);
  });
}

async function fetchMovies() {
  if (!currentGenre || isLoadingMovies) return;

  isLoadingMovies = true;

  const res = await fetch(
    `http://127.0.0.1:5000/movies?genre_id=${currentGenre}&page=${moviePage}`
  );

  const movies = await res.json();

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className =
      "bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition";

    card.innerHTML = `
      ${movie.poster ? `<img src="${movie.poster}" class="w-full h-64 object-cover">` : ""}
      <div class="p-4 space-y-2">
        <h3 class="text-lg font-medium">${movie.title}</h3>
        <p class="text-xs text-zinc-400 line-clamp-3">${movie.overview}</p>
      </div>
    `;

    movieGrid.appendChild(card);
  });

  moviePage++;
  isLoadingMovies = false;
}

movieSection.addEventListener("scroll", () => {
  const scrollTop = movieSection.scrollTop;
  const scrollHeight = movieSection.scrollHeight;
  const clientHeight = movieSection.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight - 200) {
    fetchMovies();
  }
});

songSection.addEventListener("scroll", () => {
  const scrollTop = songSection.scrollTop;
  const scrollHeight = songSection.scrollHeight;
  const clientHeight = songSection.clientHeight;

  if (
    scrollTop + clientHeight >= scrollHeight - 200 &&
    songNextPageToken
  ) {
    fetchSongs();
  }
});
