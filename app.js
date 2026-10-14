
const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "poketalks-demo-v1";

// Demo data. Add more questions to this list when needed.
const questions = [
  { q: "Which Pokémon is known for its red cheeks?", a: ["Pikachu", "Squirtle", "Onix", "Psyduck"], correct: "Pikachu" },
  { q: "Which Pokémon is a Water type?", a: ["Bulbasaur", "Squirtle", "Vulpix", "Geodude"], correct: "Squirtle" },
  { q: "Which Pokémon evolves into Charizard?", a: ["Charmander", "Pidgey", "Eevee", "Machop"], correct: "Charmander" },
  { q: "Which Pokémon is known as the Genetic Pokémon?", a: ["Mewtwo", "Snorlax", "Gengar", "Lapras"], correct: "Mewtwo" },
  { q: "Which Pokémon is a Grass/Poison type?", a: ["Bulbasaur", "Ponyta", "Magikarp", "Abra"], correct: "Bulbasaur" },
  { q: "Which Pokémon is famous for sleeping?", a: ["Snorlax", "Jolteon", "Zubat", "Ditto"], correct: "Snorlax" },
  { q: "Which Pokémon can evolve into Vaporeon?", a: ["Eevee", "Pichu", "Togepi", "Meowth"], correct: "Eevee" },
  { q: "Which Pokémon is a Ghost type?", a: ["Gengar", "Pidgeot", "Rapidash", "Dragonite"], correct: "Gengar" },
  { q: "Which Pokémon is known as the Mouse Pokémon?", a: ["Pikachu", "Lapras", "Onix", "Mewtwo"], correct: "Pikachu" },
  { q: "Which Pokémon is associated with seeds on its back?", a: ["Bulbasaur", "Psyduck", "Arcanine", "Ditto"], correct: "Bulbasaur" },
  { q: "Which Pokémon is a Fire/Flying type?", a: ["Charizard", "Blastoise", "Venusaur", "Golem"], correct: "Charizard" },
  { q: "Which Pokémon can transform into other Pokémon?", a: ["Ditto", "Snorlax", "Cubone", "Eevee"], correct: "Ditto" }
];

let state;
try {
  state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch {
  state = {};
}

state.pokemon ||= [];
state.videos ||= [];
state.socials ||= {};

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

// Image files are converted to data URLs for this local demo.
// For production, upload them to online object storage instead.
function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Please use an image smaller than 2 MB for this demo."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderPokemon() {
  $("#pokemonGrid").innerHTML = state.pokemon.map((p, i) => `
    <article class="content-card">
      <img src="${p.image}" alt="${escapeHTML(p.name)}">
      <div class="card-copy">
        <h3>${escapeHTML(p.name)}</h3>
        <p>${escapeHTML(p.type)}</p>
        <p>${escapeHTML(p.description)}</p>
      </div>
    </article>
  `).join("") || '<p class="muted">No Pokémon added yet.</p>';

  $("#managePokemon").innerHTML = state.pokemon.map((p, i) => `
    <div class="manage-row">
      <span>${escapeHTML(p.name)} — ${escapeHTML(p.type)}</span>
      <button type="button" data-delete-pokemon="${i}">Delete</button>
    </div>
  `).join("") || '<p class="muted">Nothing to manage yet.</p>';
}

function renderVideos() {
  $("#videoGrid").innerHTML = state.videos.map(v => `
    <article class="content-card">
      <img src="${v.image}" alt="${escapeHTML(v.title)} thumbnail">
      <div class="card-copy">
        <h3>${escapeHTML(v.title)}</h3>
        ${v.url
          ? `<a class="button" href="${escapeHTML(v.url)}" target="_blank" rel="noopener noreferrer">Watch video →</a>`
          : '<p>Video link coming soon.</p>'}
      </div>
    </article>
  `).join("") || '<p class="muted">Video showcase is waiting for your first upload.</p>';

  $("#manageVideos").innerHTML = state.videos.map((v, i) => `
    <div class="manage-row">
      <span>${escapeHTML(v.title)}</span>
      <button type="button" data-delete-video="${i}">Delete</button>
    </div>
  `).join("") || '<p class="muted">Nothing to manage yet.</p>';
}

function renderSocials() {
  for (const key of ["youtube", "instagram", "telegram"]) {
    const link = $(`#${key}Link`);
    const url = state.socials[key] || "";
    // Only allow http(s) destinations.
    try {
      const parsed = new URL(url);
      link.href = ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "#";
    } catch {
      link.href = "#";
    }
  }
}

$("#pokemonForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);

  try {
    const image = await readImage(data.get("image"));
    state.pokemon.push({
      name: data.get("name").trim(),
      type: data.get("type").trim(),
      description: data.get("description").trim(),
      image
    });
    save();
    renderPokemon();
    form.reset();
    alert("Pokémon added to this browser's demo storage.");
  } catch (error) {
    alert(error.message || "Unable to load image.");
  }
});

$("#videoForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const url = String(data.get("url") || "").trim();

  if (url) {
    try {
      if (new URL(url).protocol !== "https:") {
        alert("Use a secure https:// link.");
        return;
      }
    } catch {
      alert("Please enter a valid Linkvertise URL or leave it blank.");
      return;
    }
  }

  try {
    const image = await readImage(data.get("image"));
    state.videos.push({
      title: data.get("title").trim(),
      image,
      url
    });
    save();
    renderVideos();
    form.reset();
    alert("Video thumbnail added to demo storage.");
  } catch (error) {
    alert(error.message || "Unable to load thumbnail.");
  }
});

$("#socialForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);

  state.socials = {
    youtube: String(data.get("youtube") || "").trim(),
    instagram: String(data.get("instagram") || "").trim(),
    telegram: String(data.get("telegram") || "").trim()
  };

  save();
  renderSocials();
  alert("Social links saved in this browser.");
});

$("#managePokemon").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-pokemon]");
  if (!button) return;
  const index = Number(button.dataset.deletePokemon);
  if (!confirm("Delete this Pokémon?")) return;
  state.pokemon.splice(index, 1);
  save();
  renderPokemon();
});

$("#manageVideos").addEventListener("click", event => {
  const button = event.target.closest("[data-delete-video]");
  if (!button) return;
  const index = Number(button.dataset.deleteVideo);
  if (!confirm("Delete this video?")) return;
  state.videos.splice(index, 1);
  save();
  renderVideos();
});

// Quiz: each round picks 10 questions without repeats within that round.
let round = [];
let current = 0;
let score = 0;
let locked = false;

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function startQuiz() {
  if (questions.length < 10) {
    $("#quizQuestion").textContent = "Add at least 10 questions to start.";
    return;
  }
  round = shuffle(questions).slice(0, 10);
  current = 0;
  score = 0;
  showQuestion();
}

function showQuestion() {
  locked = false;
  const item = round[current];
  $("#quizProgress").textContent = `Question ${current + 1} of 10 · Score: ${score}`;
  $("#quizQuestion").textContent = item.q;
  $("#quizFeedback").textContent = "";
  $("#quizAnswers").innerHTML = shuffle(item.a).map(answer =>
    `<button class="answer" data-answer="${escapeHTML(answer)}">${escapeHTML(answer)}</button>`
  ).join("");
  $("#quizNext").textContent = "Next question";
  $("#quizNext").disabled = true;
}

$("#quizAnswers").addEventListener("click", event => {
  const button = event.target.closest("[data-answer]");
  if (!button || locked || !round.length) return;
  locked = true;

  const correct = round[current].correct;
  $("#quizAnswers").querySelectorAll("button").forEach(option => {
    if (option.dataset.answer === correct) option.classList.add("correct");
  });

  if (button.dataset.answer === correct) {
    score++;
    $("#quizFeedback").textContent = "Correct! ⚡";
  } else {
    button.classList.add("wrong");
    $("#quizFeedback").textContent = `The answer was ${correct}.`;
  }

  $("#quizProgress").textContent = `Question ${current + 1} of 10 · Score: ${score}`;
  $("#quizNext").disabled = false;
});

$("#quizNext").addEventListener("click", () => {
  if (!round.length || $("#quizNext").textContent === "Start quiz" ||
      $("#quizNext").textContent === "Play again") {
    startQuiz();
    return;
  }

  current++;
  if (current >= round.length) {
    $("#quizQuestion").textContent = `Quiz complete! You scored ${score}/10.`;
    $("#quizProgress").textContent = "PokéQuiz results";
    $("#quizAnswers").innerHTML = "";
    $("#quizFeedback").textContent = "Ready for another challenge?";
    $("#quizNext").textContent = "Play again";
    round = [];
    return;
  }

  showQuestion();
});

$("#menuToggle").addEventListener("click", () => {
  $("#nav").classList.toggle("open");
});

$("#nav").addEventListener("click", event => {
  if (event.target.closest("a")) $("#nav").classList.remove("open");
});

$("#resetDemo").addEventListener("click", () => {
  if (!confirm("Remove all demo Pokémon, videos and social links?")) return;
  state = { pokemon: [], videos: [], socials: {} };
  save();
  renderPokemon();
  renderVideos();
  renderSocials();
});

$("#year").textContent = new Date().getFullYear();

renderPokemon();
renderVideos();

const DEFAULT_SOCIALS = {
  youtube: "https://youtube.com/@poketalks_yt?si=emFFmVNVH7K7Em3p",
  instagram: "https://instagram.com/poketalks3?exln=M2JibHM3YjNtdTN0",
  telegram: "https://t.me/PokeTalks_Official"
};

function renderSocials() {
  for (const key of ["youtube", "instagram", "telegram"]) {
    const link = document.getElementById(`${key}Link`);
    if (!link) continue;

    const url = state.socials[key] || DEFAULT_SOCIALS[key];
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
}