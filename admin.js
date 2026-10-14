
const SUPABASE_URL = "https://ouzqtzkodenqmqdswpov.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_o466hZ-jpLQZs5jwEq-bxA_lOzsk24X";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);
const BUCKET = "poketalks-media";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

let currentUser = null;

function status(message) {
  const element =
    document.getElementById("adminStatus") ||
    document.getElementById("message");

  if (element) element.textContent = message;
}

function safeText(value) {
  return String(value ?? "");
}

function addText(parent, value) {
  const element = document.createElement("p");
  element.textContent = safeText(value);
  parent.appendChild(element);
}

function addButton(parent, label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", action);
  parent.appendChild(button);
}


async function requireAdmin() {
  const { data, error } = await db.auth.getUser();

  if (error || !data.user) {
    currentUser = null;
    $("loginPanel").hidden = false;
    $("dashboard").hidden = true;
    return false;
  }

  // Verify through the existing secure database function.
  const { data: allowed, error: adminError } = await db.rpc(
    "is_poketalks_admin"
  );

  if (adminError || allowed !== true) {
    await db.auth.signOut();
    currentUser = null;
    $("loginPanel").hidden = false;
    $("dashboard").hidden = true;
    status(
      adminError
        ? "Admin verification failed: " + adminError.message
        : "This account is not an authorized admin."
    );
    return false;
  }

  currentUser = data.user;
  $("loginPanel").hidden = true;
  $("dashboard").hidden = false;
  status("Logged in as " + currentUser.email);

  return true;
}

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const { error } = await db.auth.signInWithPassword({
    email: $("email").value.trim(),
    password: $("password").value
  });

  if (error) {
    status("Login failed: " + error.message);
    return;
  }

  if (await requireAdmin()) {
    await loadPokemon();
    await loadVideos();
  }
});

$("logoutButton").addEventListener("click", async () => {
  await db.auth.signOut();
  currentUser = null;
  $("dashboard").hidden = true;
  $("loginPanel").hidden = false;
  status("Logged out.");
});

async function uploadImage(file) {
  if (!file) return null;

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const path = currentUser.id + "/" +
    crypto.randomUUID() + "-" +
    file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;
  return path;
}

async function imagePreview(path, parent) {
  if (!path) return;

  const { data, error } = await db.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  if (error) {
    addText(parent, "Image uploaded; preview unavailable.");
    return;
  }

  const img = document.createElement("img");
  img.src = data.signedUrl;
  img.alt = "Uploaded media preview";
  img.loading = "lazy";
  img.style.maxWidth = "180px";
  img.style.borderRadius = "10px";
  parent.appendChild(img);
}

async function loadPokemon() {
  const root = $("pokemonList");
  root.replaceChildren();

  const { data, error } = await db
    .from("pokemon")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    status("Could not load Pokémon: " + error.message);
    return;
  }

  for (const item of data) {
    const card = document.createElement("article");
    addText(card, item.name + (item.is_published ? " — Published" : " — Draft"));
    addText(card, item.pokemon_type);
    addText(card, item.description);
    await imagePreview(item.image_url, card);

    addButton(card, "Delete", async () => {
      if (!confirm("Delete " + item.name + "?")) return;

      const { error } = await db.from("pokemon")
        .delete().eq("id", item.id);

      if (error) status("Delete failed: " + error.message);
      else {
        status("Pokémon deleted.");
        await loadPokemon();
      }
    });

    root.appendChild(card);
  }
}

$("pokemonForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  try {
    const file = $("pokemonImage").files[0];
    const imagePath = await uploadImage(file);

    const row = {
      name: $("pokemonName").value.trim(),
      pokemon_type: $("pokemonType").value.trim() || null,
      description: $("pokemonDescription").value.trim(),
      image_url: imagePath,
      is_published: $("pokemonPublished").checked
    };

    const { error } = await db.from("pokemon").insert(row);
    if (error) throw error;

    event.target.reset();
    status("Pokémon saved.");
    await loadPokemon();
  } catch (error) {
    status("Save failed: " + error.message);
  }
});

async function loadVideos() {
  const root = $("videoList");
  root.replaceChildren();

  const { data, error } = await db
    .from("poketalks_videos")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    status("Could not load videos: " + error.message);
    return;
  }

  for (const item of data) {
    const card = document.createElement("article");
    addText(card, item.title + (item.is_published ? " — Published" : " — Draft"));
    addText(card, item.description);
    addText(card, item.linkvertise_url || "Linkvertise link not added yet.");
    await imagePreview(item.thumbnail_url, card);

    addButton(card, "Delete", async () => {
      if (!confirm("Delete this video?")) return;

      const { error } = await db.from("poketalks_videos")
        .delete().eq("id", item.id);

      if (error) status("Delete failed: " + error.message);
      else {
        status("Video deleted.");
        await loadVideos();
      }
    });

    root.appendChild(card);
  }
}

$("videoForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;

  try {
    const file = $("videoImage").files[0];
    const thumbnailPath = await uploadImage(file);
    const link = $("videoLink").value.trim();

    if (link && !/^https:\/\/(www\.)?linkvertise\.com\//i.test(link)) {
      throw new Error("Enter a valid HTTPS Linkvertise URL.");
    }

    const row = {
      title: $("videoTitle").value.trim(),
      description: $("videoDescription").value.trim(),
      thumbnail_url: thumbnailPath,
      linkvertise_url: link || null,
      is_published: $("videoPublished").checked
    };

    const { error } = await db.from("poketalks_videos").insert(row);
    if (error) throw error;

    event.target.reset();
    status("Video saved.");
    await loadVideos();
  } catch (error) {
    status("Save failed: " + error.message);
  }
});

(async function init() {
  const { data } = await db.auth.getSession();
  if (data.session && await requireAdmin()) {
    await loadPokemon();
    await loadVideos();
  }
})();
