
"use strict";

/*
 * PokeTalks — app.js
 *
 * Public website:
 * - Published Pokémon from Supabase
 * - Published videos from Supabase
 * - Supabase Storage image previews
 * - PokéQuiz: 10 random questions
 * - Social links
 * - Responsive navigation
 *
 * Admin content is managed separately by admin.js.
 */

(() => {
  // ==========================================
  // 1. CONFIGURATION
  // ==========================================

  const SUPABASE_URL =
    "https://ouzqtzkodenqmqdswpov.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_o466hZ-jpLQZs5jwEq-bxA_lOzsk24X";

  const STORAGE_BUCKET = "poketalks-media";

  const SIGNED_URL_LIFETIME = 3600;

  const DEFAULT_SOCIALS = {
    youtube: "https://youtube.com/@poketalks_yt",
    instagram: "https://instagram.com/poketalks3/",
    telegram: "https://t.me/PokeTalks_Official"
  };

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  // ==========================================
  // 2. SUPABASE CLIENT
  // ==========================================

  let db = null;

  if (window.supabase?.createClient) {
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
  } else {
    console.error(
      "Supabase SDK is missing. Check the Supabase CDN script in index.html."
    );
  }

  // ==========================================
  // 3. POKEQUIZ QUESTIONS
  // ==========================================

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
      q: "Which Pokémon carries a bone?",
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
      q: "Which Pokémon evolves from Magikarp?",
      a: ["Gyarados", "Dragonite", "Lapras", "Seaking"],
      correct: "Gyarados"
    }
  ];

  // ==========================================
  // 4. GENERAL HELPERS
  // ==========================================

  function showMessage(container, message, className = "muted") {
    if (!container) return;

    const paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = message;

    container.replaceChildren(paragraph);
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

  function safeVideoURL(value) {
    const url = safeExternalURL(value);

    if (!url) return "";

    try {
      const parsed = new URL(url);

      if (
        parsed.protocol === "https:" &&
        parsed.hostname.toLowerCase() === "linkvertise.com"
      ) {
        return parsed.href;
      }

      if (
        parsed.protocol === "https:" &&
        parsed.hostname.toLowerCase().endsWith(".linkvertise.com")
      ) {
        return parsed.href;
      }

      return "";
    } catch {
      return "";
    }
  }

  function makeElement(tag, text, className) {
    const element = document.createElement(tag);

    if (text !== undefined && text !== null) {
      element.textContent = String(text);
    }

    if (className) {
      element.className = className;
    }

    return element;
  }

  // ==========================================
  // 5. SUPABASE STORAGE IMAGE URL
  // ==========================================

  async function getImageURL(path) {
    if (!path || !db) return "";

    const value = String(path).trim();

    if (!value) return "";

    // Support a full HTTP(S) URL if an older record uses one.
    if (/^https?:\/\//i.test(value)) {
      return safeExternalURL(value);
    }

    const { data, error } = await db.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(value, SIGNED_URL_LIFETIME);

    if (error) {
      console.error("Storage image URL error:", error, value);
      return "";
    }

    return data?.signedUrl || "";
  }

  function attachImageFallback(image, message) {
    image.addEventListener("error", () => {
      image.hidden = true;

      const fallback = makeElement(
        "p",
        message || "Image unavailable",
        "muted"
      );

      image.insertAdjacentElement("afterend", fallback);
    }, { once: true });
  }

  // ==========================================
  // 6. LOAD PUBLISHED POKÉMON
  // ==========================================

  async function renderPokemon() {
    const grid = $("#pokemonGrid");

    if (!grid) return;

    if (!db) {
      showMessage(
        grid,
        "Supabase load nahi hua. Page ko refresh karke dekho."
      );
      return;
    }

    showMessage(grid, "Loading Pokémon...");

    const { data, error } = await db
      .from("pokemon")
      .select(
        "id, name, pokemon_type, description, image_url"
      )
      .eq("is_published", true)
      .order("id", { ascending: false });

    if (error) {
      console.error("Pokémon database error:", error);

      showMessage(
        grid,
        "Pokémon load nahi ho paye. Database access aur RLS policies check karo."
      );

      return;
    }

    if (!data || data.length === 0) {
      showMessage(
        grid,
        "Abhi koi published Pokémon nahi hai."
      );
      return;
    }

    grid.replaceChildren();

    for (const pokemon of data) {
      const card = makeElement("article", null, "content-card");
      const imageURL = await getImageURL(pokemon.image_url);

      if (imageURL) {
        const image = makeElement("img");
        image.src = imageURL;
        image.alt = pokemon.name || "Pokémon";
        image.loading = "lazy";
        image.decoding = "async";

        attachImageFallback(image, "Pokémon image unavailable");
        card.appendChild(image);
      }

      const copy = makeElement("div", null, "card-copy");

      copy.appendChild(
        makeElement("h3", pokemon.name || "Pokémon")
      );

      if (pokemon.pokemon_type) {
        copy.appendChild(
          makeElement("p", pokemon.pokemon_type)
        );
      }

      if (pokemon.description) {
        copy.appendChild(
          makeElement("p", pokemon.description)
        );
      }

      card.appendChild(copy);
      grid.appendChild(card);
    }
  }

  // ==========================================
  // 7. LOAD PUBLISHED VIDEOS
  // ==========================================

  async function renderVideos() {
    const grid = $("#videoGrid");

    if (!grid) return;

    if (!db) {
      showMessage(
        grid,
        "Supabase load nahi hua. Page ko refresh karke dekho."
      );
      return;
    }

    showMessage(grid, "Loading videos...");

    const { data, error } = await db
      .from("poketalks_videos")
      .select(
        "id, title, description, thumbnail_url, linkvertise_url"
      )
      .eq("is_published", true)
      .order("id", { ascending: false });

    if (error) {
      console.error("Video database error:", error);

      showMessage(
        grid,
        "Videos load nahi ho paye. Database access aur RLS policies check karo."
      );

      return;
    }

    if (!data || data.length === 0) {
      showMessage(
        grid,
        "Abhi koi published video nahi hai."
      );
      return;
    }

    grid.replaceChildren();

    for (const video of data) {
      const card = makeElement("article", null, "content-card");
      const imageURL = await getImageURL(video.thumbnail_url);

      if (imageURL) {
        const image = makeElement("img");
        image.src = imageURL;
        image.alt = `${video.title || "Video"} thumbnail`;
        image.loading = "lazy";
        image.decoding = "async";

        attachImageFallback(image, "Video thumbnail unavailable");
        card.appendChild(image);
      }

      const copy = makeElement("div", null, "card-copy");

      copy.appendChild(
        makeElement("h3", video.title || "Video")
      );

      if (video.description) {
        copy.appendChild(
          makeElement("p", video.description)
        );
      }

      const watchURL = safeVideoURL(video.linkvertise_url);

      if (watchURL) {
        const link = makeElement("a", "Watch video →", "button");
        link.href = watchURL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        copy.appendChild(link);
      } else if (video.linkvertise_url) {
        copy.appendChild(
          makeElement("p", "Video link unavailable.")
        );
      } else {
        copy.appendChild(
          makeElement("p", "Video link coming soon.")
        );
      }

      card.appendChild(copy);
      grid.appendChild(card);
    }
  }

  // ==========================================
  // 8. SOCIAL LINKS
  // ==========================================

  function renderSocials() {
    for (const platform of [
      "youtube",
      "instagram",
      "telegram"
    ]) {
      const link = document.getElementById(`${platform}Link`);

      if (!link) continue;

      const url = safeExternalURL(DEFAULT_SOCIALS[platform]);

      link.href = url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute(
        "aria-label",
        `Open PokeTalks on ${platform}`
      );
    }
  }

  // ==========================================
  // 9. POKEQUIZ
  // ==========================================

  let quizRound = [];
  let quizCurrent = 0;
  let quizScore = 0;
  let quizLocked = false;

  function shuffle(list) {
    const result = [...list];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [result[i], result[j]] = [
        result[j],
        result[i]
      ];
    }

    return result;
  }

  function showQuizQuestion() {
    const question = $("#quizQuestion");
    const answers = $("#quizAnswers");
    const progress = $("#quizProgress");
    const feedback = $("#quizFeedback");
    const next = $("#quizNext");

    if (!question || !answers || !next) return;

    const item = quizRound[quizCurrent];

    if (!item) return;

    quizLocked = false;

    question.textContent = item.q;

    if (progress) {
      progress.textContent =
        `Question ${quizCurrent + 1} of 10 · Score: ${quizScore}`;
    }

    if (feedback) feedback.textContent = "";

    answers.replaceChildren();

    for (const answer of shuffle(item.a)) {
      const button = makeElement("button", answer, "answer");

      button.type = "button";
      button.dataset.answer = answer;

      answers.appendChild(button);
    }

    next.textContent = "Next question";
    next.disabled = true;
  }

  function startQuiz() {
    if (
      !$("#quizQuestion") ||
      !$("#quizAnswers") ||
      !$("#quizNext")
    ) {
      return;
    }

    quizRound = shuffle(questions).slice(0, 10);
    quizCurrent = 0;
    quizScore = 0;
    quizLocked = false;

    showQuizQuestion();
  }

  const quizAnswers = $("#quizAnswers");

  if (quizAnswers) {
    quizAnswers.addEventListener("click", event => {
      const button = event.target.closest("[data-answer]");

      if (!button || quizLocked || !quizRound.length) return;

      quizLocked = true;

      const correct = quizRound[quizCurrent].correct;

      quizAnswers.querySelectorAll("[data-answer]").forEach(option => {
        option.disabled = true;

        if (option.dataset.answer === correct) {
          option.classList.add("correct");
        }
      });

      if (button.dataset.answer === correct) {
        quizScore++;

        if ($("#quizFeedback")) {
          $("#quizFeedback").textContent = "Correct! ⚡";
        }
      } else {
        button.classList.add("wrong");

        if ($("#quizFeedback")) {
          $("#quizFeedback").textContent =
            `The answer was ${correct}.`;
        }
      }

      if ($("#quizProgress")) {
        $("#quizProgress").textContent =
          `Question ${quizCurrent + 1} of 10 · Score: ${quizScore}`;
      }

      if ($("#quizNext")) {
        $("#quizNext").disabled = false;
      }
    });
  }

  const quizNext = $("#quizNext");

  if (quizNext) {
    quizNext.addEventListener("click", () => {
      if (
        !quizRound.length ||
        quizNext.textContent === "Start quiz" ||
        quizNext.textContent === "Play again"
      ) {
        startQuiz();
        return;
      }

      quizCurrent++;

      if (quizCurrent >= quizRound.length) {
        if ($("#quizQuestion")) {
          $("#quizQuestion").textContent =
            `Quiz complete! You scored ${quizScore}/10.`;
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
        quizRound = [];

        return;
      }

      showQuizQuestion();
    });
  }

  // ==========================================
  // 10. MOBILE NAVIGATION
  // ==========================================

  const menuToggle = $("#menuToggle");
  const nav = $("#nav");

  if (menuToggle && nav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });

    nav.addEventListener("click", event => {
      if (!event.target.closest("a")) return;

      nav.classList.remove("open");

      menuToggle.setAttribute("aria-expanded", "false");
    });
  }

  // ==========================================
  // 11. FOOTER YEAR
  // ==========================================

  const year = $("#year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // ==========================================
  // 12. INITIAL LOAD
  // ==========================================

  renderSocials();

  renderPokemon().catch(error => {
    console.error("Unexpected Pokémon loading error:", error);
  });

  renderVideos().catch(error => {
    console.error("Unexpected video loading error:", error);
  });

})();
