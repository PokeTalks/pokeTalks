
"use strict";

/*
 * PokeTalks — app.js
 * Public website functionality:
 * - Responsive navigation
 * - PokéQuiz (10 random questions per round)
 * - Pokémon gallery
 * - Video showcase
 * - Social links
 *
 * IMPORTANT:
 * This is a demo-content version.
 * localStorage is NOT shared between devices.
 * Secure admin/database integration is a separate step.
 */

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);

  const STORAGE_KEY = "poketalks-demo-v2";

  const DEFAULT_SOCIALS = {
    youtube: "https://youtube.com/@poketalks_yt?si=emFFmVNVH7K7Em3p",
    telegram: "https://t.me/PokeTalks_Official",
    instagram: "https://instagram.com/poketalks3/"
  };

  const questions = [
    {
      q: "Which Pokémon is known for its red cheeks?",
      a: ["Pikachu", "Squirtle", "Onix", "Psyduck"],
      correct: "Pikachu"
    },
    {
      q: "Which Pokémon is a Water type?",
      a: ["Bulbasaur", "Squirtle", "Vulpix", "Geodude"],
      correct: "Squirtle"
    },
    {
      q: "Which Pokémon evolves into Charizard?",
      a: ["Charmander", "Pidgey", "Eevee", "Machop"],
      correct: "Charmander"
    },
    {
      q: "Which Pokémon is known as the Genetic Pokémon?",
      a: ["Mewtwo", "Snorlax", "Gengar", "Lapras"],
      correct: "Mewtwo"
    },
    {
      q: "Which Pokémon is a Grass/Poison type?",
      a: ["Bulbasaur", "Ponyta", "Magikarp", "Abra"],
      correct: "Bulbasaur"
    },
    {
      q: "Which Pokémon is famous for sleeping?",
      a: ["Snorlax", "Jolteon", "Zubat", "Ditto"],
      correct: "Snorlax"
    },
    {
      q: "Which Pokémon can evolve into Vaporeon?",
      a: ["Eevee", "Pichu", "Togepi", "Meowth"],
      correct: "Eevee"
    },
    {
      q: "Which Pokémon is a Ghost type?",
      a: ["Gengar", "Pidgeot", "Rapidash", "Dragonite"],
      correct: "Gengar"
    },
    {
      q: "Which Pokémon is known as the Mouse Pokémon?",
      a: ["Pikachu", "Lapras", "Onix", "Mewtwo"],
      correct: "Pikachu"
    },
    {
      q: "Which Pokémon has a seed on its back?",
      a: ["Bulbasaur", "Psyduck", "Arcanine", "Ditto"],
      correct: "Bulbasaur"
    },
    {
      q: "Which Pokémon is a Fire/Flying type?",
      a: ["Charizard", "Blastoise", "Venusaur", "Golem"],
      correct: "Charizard"
    },
    {
      q: "Which Pokémon can transform into other Pokémon?",
      a: ["Ditto", "Snorlax", "Cubone", "Eevee"],
      correct: "Ditto"
    },
    {
      q: "Which Pokémon is known for its long tongue?",
      a: ["Lickitung", "Pidgey", "Growlithe", "Abra"],
      correct: "Lickitung"
    },
    {
      q: "Which Pokémon is the final evolution of Squirtle?",
      a: ["Blastoise", "Wartortle", "Lapras", "Gyarados"],
      correct: "Blastoise"
    },
    {
      q: "Which Pokémon is an Electric/Flying type?",
      a: ["Zapdos", "Moltres", "Articuno", "Onix"],
      correct: "Zapdos"
    },
    {
      q: "Which Pokémon is famous for carrying a bone?",
      a: ["Cubone", "Ditto", "Psyduck", "Eevee"],
      correct: "Cubone"
    },
    {
      q: "Which Pokémon is a Rock/Ground type?",
      a: ["Onix", "Pikachu", "Oddish", "Vulpix"],
      correct: "Onix"
    },
    {
      q: "Which Pokémon can evolve using a Thunder Stone?",
      a: ["Pikachu", "Bulbasaur", "Squirtle", "Snorlax"],
      correct: "Pikachu"
    },
    {
      q: "Which Pokémon is known as the Balloon Pokémon?",
      a: ["Jigglypuff", "Geodude", "Scyther", "Ponyta"],
      correct: "Jigglypuff"
    },
    {
      q: "Which Pokémon is the evolved form of Magikarp?",
      a: ["Gyarados", "Dragonite", "Lapras", "Seaking"],
      correct: "Gyarados"
    }
  ];

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

      return {
        pokemon: Array.isArray(saved.pokemon) ? saved.pokemon : [],
        videos: Array.isArray(saved.videos) ? saved.videos : [],
        socials: saved.socials && typeof saved.socials === "object"
          ? saved.socials
          : {}
      };
    } catch (error) {
      console.warn("PokeTalks demo storage could not be loaded.", error);

      return {
        pokemon: [],
        videos: [],
        socials: {}
      };
    }
  }

  let state = loadState();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Could not save demo content.", error);
      alert(
        "Browser storage is full or unavailable. " +
        "Use the connected Supabase storage system for persistent media."
      );
      return false;
    }
  }

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function safeExternalURL(value) {
    try {
      const url = new URL(String(value || ""));

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return "";
      }

      return url.href;
    } catch {
      return "";
    }
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith("image/")) {
        reject(new Error("Please select an image file."));
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        reject(new Error("Please choose an image smaller than 2 MB."));
        return;
      }

      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read the image."));

      reader.readAsDataURL(file);
    });
  }

  function renderPokemon() {
    const grid = $("#pokemonGrid");

    if (grid) {
      grid.innerHTML = state.pokemon.map(pokemon => `
        <article class="content-card">
          <img
            src="${escapeHTML(pokemon.image)}"
            alt="${escapeHTML(pokemon.name)}"
            loading="lazy"
          >
          <div class="card-copy">
            <h3>${escapeHTML(pokemon.name)}</h3>
            <p>${escapeHTML(pokemon.type)}</p>
            <p>${escapeHTML(pokemon.description)}</p>
          </div>
        </article>
      `).join("") || '<p class="muted">No Pokémon added yet.</p>';
    }

    const manage = $("#managePokemon");

    if (manage) {
      manage.innerHTML = state.pokemon.map((pokemon, index) => `
        <div class="manage-row">
          <span>${escapeHTML(pokemon.name)} — ${escapeHTML(pokemon.type)}</span>
          <button type="button" data-delete-pokemon="${index}">
            Delete
          </button>
        </div>
      `).join("") || '<p class="muted">Nothing to manage yet.</p>';
    }
  }

  function renderVideos() {
    const grid = $("#videoGrid");

    if (grid) {
      grid.innerHTML = state.videos.map(video => {
        const link = safeExternalURL(video.url);

        return `
          <article class="content-card">
            <img
              src="${escapeHTML(video.image)}"
              alt="${escapeHTML(video.title)} thumbnail"
              loading="lazy"
            >
            <div class="card-copy">
              <h3>${escapeHTML(video.title)}</h3>
              ${
                link
                  ? `<a class="button"
                       href="${escapeHTML(link)}"
                       target="_blank"
                       rel="noopener noreferrer">Watch video →</a>`
                  : '<p>Video link coming soon.</p>'
              }
            </div>
          </article>
        `;
      }).join("") || '<p class="muted">Videos coming soon.</p>';
    }

    const manage = $("#manageVideos");

    if (manage) {
      manage.innerHTML = state.videos.map((video, index) => `
        <div class="manage-row">
          <span>${escapeHTML(video.title)}</span>
          <button type="button" data-delete-video="${index}">
            Delete
          </button>
        </div>
      `).join("") || '<p class="muted">Nothing to manage yet.</p>';
    }
  }

  function renderSocials() {
    for (const platform of ["youtube", "instagram", "telegram"]) {
      const link = document.getElementById(`${platform}Link`);

      if (!link) continue;

      const url = safeExternalURL(
        state.socials[platform] || DEFAULT_SOCIALS[platform]
      );

      link.href = url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Open PokeTalks on ${platform}`);
    }
  }

  // Optional demo forms. They are not a secure admin system.
  const pokemonForm = $("#pokemonForm");

  if (pokemonForm) {
    pokemonForm.addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const data = new FormData(form);

      try {
        const image = await readImage(data.get("image"));

        const pokemon = {
          name: String(data.get("name") || "").trim(),
          type: String(data.get("type") || "").trim(),
          description: String(data.get("description") || "").trim(),
          image
        };

        if (!pokemon.name || !pokemon.description) {
          throw new Error("Enter a Pokémon name and description.");
        }

        state.pokemon.push(pokemon);

        if (!saveState()) {
          state.pokemon.pop();
          return;
        }

        renderPokemon();
        form.reset();

        alert("Demo Pokémon added in this browser.");
      } catch (error) {
        alert(error.message || "Could not add Pokémon.");
      }
    });
  }

  const videoForm = $("#videoForm");

  if (videoForm) {
    videoForm.addEventListener("submit", async event => {
      event.preventDefault();

      const form = event.currentTarget;
      const data = new FormData(form);
      const url = String(data.get("url") || "").trim();

      if (url) {
        const parsedURL = safeExternalURL(url);

        if (!parsedURL || !parsedURL.startsWith("https://")) {
          alert("Enter a valid HTTPS video URL or leave it blank.");
          return;
        }

        if (!/^https:\/\/(www\.)?linkvertise\.com\//i.test(parsedURL)) {
          alert("Enter a valid Linkvertise URL or leave it blank.");
          return;
        }
      }

      try {
        const image = await readImage(data.get("image"));

        const video = {
          title: String(data.get("title") || "").trim(),
          image,
          url
        };

        if (!video.title) {
          throw new Error("Please enter a video title.");
        }

        state.videos.push(video);

        if (!saveState()) {
          state.videos.pop();
          return;
        }

        renderVideos();
        form.reset();

        alert("Demo video added in this browser.");
      } catch (error) {
        alert(error.message || "Could not add video.");
      }
    });
  }

  const socialForm = $("#socialForm");

  if (socialForm) {
    socialForm.addEventListener("submit", event => {
      event.preventDefault();

      const data = new FormData(event.currentTarget);
      const socials = {};

      for (const platform of ["youtube", "instagram", "telegram"]) {
        const value = String(data.get(platform) || "").trim();

        if (value && !safeExternalURL(value)) {
          alert(`Please enter a valid ${platform} URL.`);
          return;
        }

        socials[platform] = value;
      }

      const previous = state.socials;
      state.socials = socials;

      if (!saveState()) {
        state.socials = previous;
        return;
      }

      renderSocials();
      alert("Demo social links saved in this browser.");
    });
  }

  const managePokemon = $("#managePokemon");

  if (managePokemon) {
    managePokemon.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-pokemon]");

      if (!button) return;

      const index = Number(button.dataset.deletePokemon);

      if (!Number.isInteger(index) || !state.pokemon[index]) return;
      if (!confirm(`Delete ${state.pokemon[index].name}?`)) return;

      const deleted = state.pokemon.splice(index, 1)[0];

      if (!saveState()) {
        state.pokemon.splice(index, 0, deleted);
        return;
      }

      renderPokemon();
    });
  }

  const manageVideos = $("#manageVideos");

  if (manageVideos) {
    manageVideos.addEventListener("click", event => {
      const button = event.target.closest("[data-delete-video]");

      if (!button) return;

      const index = Number(button.dataset.deleteVideo);

      if (!Number.isInteger(index) || !state.videos[index]) return;
      if (!confirm(`Delete ${state.videos[index].title}?`)) return;

      const deleted = state.videos.splice(index, 1)[0];

      if (!saveState()) {
        state.videos.splice(index, 0, deleted);
        return;
      }

      renderVideos();
    });
  }

  const resetButton = $("#resetDemo");

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (!confirm("Delete all demo Pokémon, videos and social settings?")) {
        return;
      }

      const previous = state;

      state = {
        pokemon: [],
        videos: [],
        socials: {}
      };

      if (!saveState()) {
        state = previous;
        return;
      }

      renderPokemon();
      renderVideos();
      renderSocials();
    });
  }

  // PokéQuiz: 10 random questions per round.
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
    if (!$("#quizQuestion") || !$("#quizAnswers") || !$("#quizNext")) {
      return;
    }

    round = shuffle(questions).slice(0, 10);
    current = 0;
    score = 0;

    showQuestion();
  }

  function showQuestion() {
    const item = round[current];

    if (!item) return;

    locked = false;

    const progress = $("#quizProgress");
    const question = $("#quizQuestion");
    const answers = $("#quizAnswers");
    const feedback = $("#quizFeedback");
    const next = $("#quizNext");

    if (progress) {
      progress.textContent = `Question ${current + 1} of 10 · Score: ${score}`;
    }

    question.textContent = item.q;

    if (feedback) feedback.textContent = "";

    answers.innerHTML = shuffle(item.a).map(answer => `
      <button class="answer" type="button" data-answer="${escapeHTML(answer)}">
        ${escapeHTML(answer)}
      </button>
    `).join("");

    next.textContent = "Next question";
    next.disabled = true;
  }

  const quizAnswers = $("#quizAnswers");

  if (quizAnswers) {
    quizAnswers.addEventListener("click", event => {
      const button = event.target.closest("[data-answer]");

      if (!button || locked || !round.length) return;

      locked = true;

      const correct = round[current].correct;

      quizAnswers.querySelectorAll("[data-answer]").forEach(option => {
        option.disabled = true;

        if (option.dataset.answer === correct) {
          option.classList.add("correct");
        }
      });

      if (button.dataset.answer === correct) {
        score++;

        if ($("#quizFeedback")) {
          $("#quizFeedback").textContent = "Correct! ⚡";
        }
      } else {
        button.classList.add("wrong");

        if ($("#quizFeedback")) {
          $("#quizFeedback").textContent = `The answer was ${correct}.`;
        }
      }

      if ($("#quizProgress")) {
        $("#quizProgress").textContent =
          `Question ${current + 1} of 10 · Score: ${score}`;
      }

      if ($("#quizNext")) $("#quizNext").disabled = false;
    });
  }

  const quizNext = $("#quizNext");

  if (quizNext) {
    quizNext.addEventListener("click", () => {
      if (
        !round.length ||
        quizNext.textContent === "Start quiz" ||
        quizNext.textContent === "Play again"
      ) {
        startQuiz();
        return;
      }

      current++;

      if (current >= round.length) {
        if ($("#quizQuestion")) {
          $("#quizQuestion").textContent =
            `Quiz complete! You scored ${score}/10.`;
        }

        if ($("#quizProgress")) {
          $("#quizProgress").textContent = "PokéQuiz results";
        }

        if ($("#quizAnswers")) {
          $("#quizAnswers").replaceChildren();
        }

        if ($("#quizFeedback")) {
          $("#quizFeedback").textContent =
            "Ready for another challenge?";
        }

        quizNext.textContent = "Play again";
        quizNext.disabled = false;
        round = [];

        return;
      }

      showQuestion();
    });
  }

  // Mobile navigation.
  const menuToggle = $("#menuToggle");
  const nav = $("#nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", event => {
      if (!event.target.closest("a")) return;

      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  }

  const year = $("#year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Initial rendering.
  renderPokemon();
  renderVideos();
  renderSocials();
})();
