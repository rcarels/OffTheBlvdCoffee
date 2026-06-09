const loginFormEl = document.getElementById("loginForm");
const loginMessageEl = document.getElementById("loginMessage");
const loginEl = document.getElementById("login");
const dashboardEl = document.getElementById("dashboard");

const adminSectionEyebrowEl = document.getElementById("adminSectionEyebrow");
const adminSectionTitleEl = document.getElementById("adminSectionTitle");

const quotesDivEl = document.getElementById("quotes");
const loadQuotesButtonEl = document.getElementById("loadQuotes");
const refreshQuotesButtonEl = document.getElementById("refreshQuotes");
const adminLogoutButtonEl = document.getElementById("adminLogout");

const loadEventsButtonEl = document.getElementById("loadEvents");
const eventFormEl = document.getElementById("eventForm");
const eventsListEl = document.getElementById("eventsList");

const loadMenuButtonEl = document.getElementById("loadMenu");
const menuFormEl = document.getElementById("menuForm");
const menuListEl = document.getElementById("menuList");

const loadGalleryButtonEl = document.getElementById("loadGallery");
const galleryFormEl = document.getElementById("galleryForm");
const galleryListEl = document.getElementById("galleryList");

const loadReviewsButtonEl = document.getElementById("loadReviews");
const reviewFormEl = document.getElementById("reviewForm");
const reviewsListEl = document.getElementById("reviewsList");

const loadAboutButtonEl = document.getElementById("loadAbout");
const aboutFormEl = document.getElementById("aboutForm");
const aboutStatusEl = document.getElementById("aboutStatus");

const noteFormEl = document.getElementById("noteForm");
const notesListEl = document.getElementById("notesList");

let editingReviewId = null;
let currentReviews = [];
let activeQuoteId = null;
let editingEventId = null;
let editingMenuItemId = null;
let editingGalleryImageId = null;
let currentEvents = [];
let currentMenuItems = [];
let currentGalleryImages = [];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function adminShowLogin(message = "") {
  if (dashboardEl) dashboardEl.style.display = "none";
  if (loginEl) loginEl.style.display = "flex";
  if (loginMessageEl) loginMessageEl.textContent = message;
}

function adminShowDashboard() {
  if (loginEl) loginEl.style.display = "none";
  if (dashboardEl) dashboardEl.style.display = "grid";
}

async function adminCheckSession() {
  try {
    const response = await fetch("/api/admin-session", {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (result.ok && result.authenticated) {
      adminShowDashboard();
      await adminLoadQuotes();
      return;
    }
  } catch (err) {
    console.warn("Could not check admin session", err);
  }

  adminShowLogin();
}

async function adminLogout() {
  try {
    await fetch("/api/admin-logout", { method: "POST" });
  } catch (err) {
    console.warn("Could not sign out cleanly", err);
  }

  adminShowLogin("Signed out.");
}

/* Login */

if (loginFormEl) {
  loginFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await fetch("/api/admin-login", {
      method: "POST",
      body: new FormData(loginFormEl),
    });

    const result = await response.json();

    if (!result.ok) {
      loginMessageEl.textContent = result.error || "Login failed.";
      return;
    }

    adminShowDashboard();

    adminLoadQuotes();
  });
}

if (adminLogoutButtonEl) {
  adminLogoutButtonEl.addEventListener("click", adminLogout);
}

adminCheckSession();

/* Navigation */

document.querySelectorAll(".nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav button").forEach((b) => {
      b.classList.remove("active");
    });

    button.classList.add("active");

    const selected = button.dataset.section;

    const sectionTitles = {
  "dashboard-home": "Dashboard",
  quotes: "Manage Quote Requests",
  events: "Manage Events",
  menu: "Manage Menu",
  gallery: "Manage Gallery Photos",
  reviews: "Manage Customer Reviews",
  about: "Manage About Page",
};

    if (adminSectionEyebrowEl) {
      adminSectionEyebrowEl.textContent = "Website Manager";
    }

    if (adminSectionTitleEl) {
      adminSectionTitleEl.textContent =
        sectionTitles[selected] || "Website Manager";
    }

    ["dashboard-home", "quotes", "events", "menu", "gallery", "reviews", "about"].forEach((name) => {
      const section = document.getElementById(`section-${name}`);

      if (section) {
        section.classList.toggle("hidden", name !== selected);
      }
    });
  });
});

/* Quotes */

if (loadQuotesButtonEl) {
  loadQuotesButtonEl.addEventListener("click", adminLoadQuotes);
}

if (refreshQuotesButtonEl) {
  refreshQuotesButtonEl.addEventListener("click", adminLoadQuotes);
}

function updateStats(quotes) {
  const count = (status) =>
    quotes.filter((q) => (q.status || "New") === status).length;

  document.getElementById("statNew").textContent = count("New");
  document.getElementById("statContacted").textContent = count("Contacted");
  document.getElementById("statBooked").textContent = count("Booked");
  document.getElementById("statArchived").textContent = count("Archived");
}

async function adminLoadQuotes() {
  if (!quotesDivEl) return;

  quotesDivEl.innerHTML =
    '<div class="placeholder-panel">Loading quote requests...</div>';

  const response = await fetch("/api/admin-quotes");
  const result = await response.json();

  if (!result.ok) {
    quotesDivEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load quotes."
    )}</div>`;
    return;
  }

  updateStats(result.quotes || []);

  if (!result.quotes || result.quotes.length === 0) {
    quotesDivEl.innerHTML =
      '<div class="placeholder-panel">No quote requests yet.</div>';
    return;
  }

  quotesDivEl.innerHTML = result.quotes
    .map(
      (q) => `
      <article class="quote-card">
        <div class="quote-card-top">
          <div>
            <h3>${escapeHtml(q.name)}</h3>
            <p class="muted">Submitted ${escapeHtml(q.created_at)}</p>
          </div>

          <span class="badge">${escapeHtml(q.status || "New")}</span>
        </div>

        <div class="quote-details">
          <p><strong>Email:</strong> ${escapeHtml(q.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(q.phone)}</p>
          <p><strong>Date:</strong> ${escapeHtml(q.event_date)}</p>
          <p><strong>Event Type:</strong> ${escapeHtml(q.event_type)}</p>
          <p><strong>Guests:</strong> ${escapeHtml(q.guests)}</p>
          <p><strong>Location:</strong> ${escapeHtml(q.location)}</p>

          <p class="full">
            <strong>Details:</strong><br>
            ${escapeHtml(q.details)}
          </p>
        </div>

        <div class="actions">
          <button class="btn small" onclick="adminOpenNotes(${q.id}, '${escapeHtml(q.name)}')">
            Notes
          </button>

          <button class="btn secondary small" onclick="adminUpdateStatus(${q.id}, 'New')">
            New
          </button>

          <button class="btn secondary small" onclick="adminUpdateStatus(${q.id}, 'Contacted')">
            Contacted
          </button>

          <button class="btn secondary small" onclick="adminUpdateStatus(${q.id}, 'Booked')">
            Booked
          </button>

          <button class="btn secondary small" onclick="adminUpdateStatus(${q.id}, 'Completed')">
            Completed
          </button>

          <button class="btn secondary small" onclick="adminUpdateStatus(${q.id}, 'Archived')">
            Archived
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

async function adminLoadDashboard() {
  const openQuotesEl = document.getElementById("dashboardOpenQuotes");
  const eventCountEl = document.getElementById("dashboardEventCount");
  const reviewCountEl = document.getElementById("dashboardReviewCount");
  const galleryCountEl = document.getElementById("dashboardGalleryCount");
  const activityEl = document.getElementById("dashboardRecentActivity");

  if (activityEl) {
    activityEl.innerHTML =
      '<div class="placeholder-panel">Loading dashboard overview...</div>';
  }

  try {
    const [quotesResponse, eventsResponse, reviewsResponse, galleryResponse] =
      await Promise.all([
        fetch("/api/admin-quotes"),
        fetch("/api/admin-events"),
        fetch("/api/admin-reviews"),
        fetch("/api/admin-gallery"),
      ]);

    const [quotesResult, eventsResult, reviewsResult, galleryResult] =
      await Promise.all([
        quotesResponse.json(),
        eventsResponse.json(),
        reviewsResponse.json(),
        galleryResponse.json(),
      ]);

    const quotes = quotesResult.quotes || [];
    const events = eventsResult.events || [];
    const reviews = reviewsResult.reviews || [];
    const images = galleryResult.images || [];

    const openQuotes = quotes.filter((quote) => {
      const status = quote.status || "New";
      return status !== "Archived" && status !== "Completed";
    });

    if (openQuotesEl) openQuotesEl.textContent = String(openQuotes.length);
    if (eventCountEl) eventCountEl.textContent = String(events.length);
    if (reviewCountEl) reviewCountEl.textContent = String(reviews.length);
    if (galleryCountEl) galleryCountEl.textContent = String(images.length);

    updateStats(quotes);

    if (!activityEl) return;

    if (quotes.length === 0) {
      activityEl.innerHTML =
        '<div class="placeholder-panel">No recent quote requests yet.</div>';
      return;
    }

    activityEl.innerHTML = quotes
      .slice(0, 4)
      .map(
        (quote) => `
          <article class="quote-card">
            <div class="quote-card-top">
              <div>
                <h3>${escapeHtml(quote.name)}</h3>
                <p class="muted">Submitted ${escapeHtml(quote.created_at)}</p>
              </div>
              <span class="badge">${escapeHtml(quote.status || "New")}</span>
            </div>

            <div class="quote-details">
              <p><strong>Email:</strong> ${escapeHtml(quote.email)}</p>
              <p><strong>Event Type:</strong> ${escapeHtml(quote.event_type)}</p>
              <p><strong>Date:</strong> ${escapeHtml(quote.event_date)}</p>
            </div>
          </article>
        `
      )
      .join("");
  } catch (err) {
    if (activityEl) {
      activityEl.innerHTML =
        '<div class="placeholder-panel">Could not load dashboard overview.</div>';
    }
  }
}

async function adminUpdateStatus(id, status) {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("status", status);

  const response = await fetch("/api/admin-update-quote", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Failed to update status");
    return;
  }

  adminLoadDashboard();
}

/* Notes */

async function adminOpenNotes(id, name) {
  activeQuoteId = id;

  document.getElementById("noteQuoteId").value = id;
  document.getElementById("notesTitle").textContent = `Notes for ${name}`;
  document.getElementById("notesModal").classList.remove("hidden");

  await adminLoadNotes(id);
}

function closeNotes() {
  document.getElementById("notesModal").classList.add("hidden");
  activeQuoteId = null;
}

async function adminLoadNotes(quoteId) {
  if (!notesListEl) return;

  notesListEl.innerHTML =
    '<div class="placeholder-panel">Loading notes...</div>';

  const response = await fetch(`/api/admin-quote-notes?quote_id=${quoteId}`);
  const result = await response.json();

  if (!result.ok) {
    notesListEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load notes."
    )}</div>`;
    return;
  }

  if (!result.notes || result.notes.length === 0) {
    notesListEl.innerHTML =
      '<div class="placeholder-panel">No notes yet.</div>';
    return;
  }

  notesListEl.innerHTML = result.notes
    .map(
      (note) => `
      <div class="note-card">
        <p>${escapeHtml(note.note)}</p>
        <p class="muted">${escapeHtml(note.created_at)}</p>
      </div>
    `
    )
    .join("");
}

if (noteFormEl) {
  noteFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await fetch("/api/admin-quote-notes", {
      method: "POST",
      body: new FormData(noteFormEl),
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not save note.");
      return;
    }

    noteFormEl.reset();
    document.getElementById("noteQuoteId").value = activeQuoteId;
    await adminLoadNotes(activeQuoteId);
  });
}

/* Events */

if (loadEventsButtonEl) {
  loadEventsButtonEl.addEventListener("click", adminLoadEvents);
}

if (eventFormEl) {
  eventFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(eventFormEl);
    let method = "POST";

    if (editingEventId) {
      method = "PUT";
      formData.append("id", editingEventId);

      if (!formData.get("is_active")) {
        formData.append("is_active", "1");
      }
    }

    const response = await fetch("/api/admin-events", {
      method,
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not save event.");
      return;
    }

    editingEventId = null;
    eventFormEl.reset();

    const activeInput = eventFormEl.querySelector('[name="is_active"]');
    if (activeInput) activeInput.remove();

    const submitButton = eventFormEl.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Add Event";

    await adminLoadEvents();
  });
}

async function adminLoadEvents() {
  if (!eventsListEl) return;

  eventsListEl.innerHTML =
    '<div class="placeholder-panel">Loading events...</div>';

  const response = await fetch("/api/admin-events");
  const result = await response.json();

  if (!result.ok) {
    eventsListEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load events."
    )}</div>`;
    return;
  }

  currentEvents = result.events || [];

  if (currentEvents.length === 0) {
    eventsListEl.innerHTML =
      '<div class="placeholder-panel">No events yet.</div>';
    return;
  }

  eventsListEl.innerHTML = currentEvents
    .map(
      (event) => `
      <article class="quote-card">
        <div class="quote-card-top">
          <div>
            <h3>${escapeHtml(event.title)}</h3>
            <p class="muted">${escapeHtml(event.event_date || "No date listed")}</p>
          </div>

          <span class="badge">${event.is_active ? "Active" : "Hidden"}</span>
        </div>

        <div class="quote-details">
          <p><strong>Location:</strong> ${escapeHtml(event.location)}</p>
          <p><strong>Created:</strong> ${escapeHtml(event.created_at)}</p>

          <p class="full">
            <strong>Description:</strong><br>
            ${escapeHtml(event.description)}
          </p>
        </div>

        <div class="actions">
          <button class="btn small" onclick="adminStartEditEvent(${event.id})">
            Edit
          </button>

          <button class="btn secondary small" onclick="adminToggleEvent(${event.id})">
            ${event.is_active ? "Hide" : "Show"}
          </button>

          <button class="btn secondary small" onclick="adminDeleteEvent(${event.id})">
            Delete
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function adminGetEventById(id) {
  return currentEvents.find((event) => Number(event.id) === Number(id));
}

function adminStartEditEvent(id) {
  const event = adminGetEventById(id);
  if (!event || !eventFormEl) return;

  editingEventId = event.id;

  eventFormEl.title.value = event.title || "";
  eventFormEl.event_date.value = event.event_date || "";
  eventFormEl.location.value = event.location || "";
  eventFormEl.description.value = event.description || "";

  let activeInput = eventFormEl.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    eventFormEl.appendChild(activeInput);
  }

  activeInput.value = event.is_active ? "1" : "0";

  const submitButton = eventFormEl.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Update Event";

  eventFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function adminToggleEvent(id) {
  const event = adminGetEventById(id);
  if (!event) return;

  const formData = new FormData();
  formData.append("id", event.id);
  formData.append("title", event.title || "");
  formData.append("event_date", event.event_date || "");
  formData.append("location", event.location || "");
  formData.append("description", event.description || "");
  formData.append("is_active", event.is_active ? "0" : "1");

  const response = await fetch("/api/admin-events", {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not update event.");
    return;
  }

  await adminLoadEvents();
}

async function adminDeleteEvent(id) {
  if (!confirm("Delete this event? This cannot be undone.")) return;

  const formData = new FormData();
  formData.append("id", id);

  const response = await fetch("/api/admin-events", {
    method: "DELETE",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not delete event.");
    return;
  }

  await adminLoadEvents();
}

/* Menu */

if (loadMenuButtonEl) {
  loadMenuButtonEl.addEventListener("click", adminLoadMenu);
}

if (menuFormEl) {
  menuFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(menuFormEl);
    let method = "POST";

    if (editingMenuItemId) {
      method = "PUT";
      formData.append("id", editingMenuItemId);

      if (!formData.get("is_active")) {
        formData.append("is_active", "1");
      }
    }

    const response = await fetch("/api/admin-menu", {
      method,
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not save menu item.");
      return;
    }

    editingMenuItemId = null;
    menuFormEl.reset();

    const activeInput = menuFormEl.querySelector('[name="is_active"]');
    if (activeInput) activeInput.remove();

    const submitButton = menuFormEl.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Add Menu Item";

    await adminLoadMenu();
  });
}

async function adminLoadMenu() {
  if (!menuListEl) return;

  menuListEl.innerHTML =
    '<div class="placeholder-panel">Loading menu items...</div>';

  const response = await fetch("/api/admin-menu");
  const result = await response.json();

  if (!result.ok) {
    menuListEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load menu."
    )}</div>`;
    return;
  }

  currentMenuItems = result.menu_items || [];

  if (currentMenuItems.length === 0) {
    menuListEl.innerHTML =
      '<div class="placeholder-panel">No menu items yet.</div>';
    return;
  }

  menuListEl.innerHTML = currentMenuItems
    .map(
      (item) => `
      <article class="quote-card">
        <div class="quote-card-top">
          <div>
            <h3>${escapeHtml(item.item_name)}</h3>
            <p class="muted">
              ${escapeHtml(item.category)}
              ${item.price ? "• " + escapeHtml(item.price) : ""}
            </p>
          </div>

          <span class="badge">${item.is_active ? "Active" : "Hidden"}</span>
        </div>

        <div class="quote-details">
          <p><strong>Category:</strong> ${escapeHtml(item.category)}</p>
          <p><strong>Price:</strong> ${escapeHtml(item.price)}</p>
          <p><strong>Display Position:</strong> ${escapeHtml(item.sort_order)}</p>
          <p><strong>Created:</strong> ${escapeHtml(item.created_at)}</p>

          <p class="full">
            <strong>Description:</strong><br>
            ${escapeHtml(item.description)}
          </p>
        </div>

        <div class="actions">
          <button class="btn small" onclick="adminStartEditMenuItem(${item.id})">
            Edit
          </button>

          <button class="btn secondary small" onclick="adminToggleMenuItem(${item.id})">
            ${item.is_active ? "Hide" : "Show"}
          </button>

          <button class="btn secondary small" onclick="adminDeleteMenuItem(${item.id})">
            Delete
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function adminGetMenuItemById(id) {
  return currentMenuItems.find((item) => Number(item.id) === Number(id));
}

function adminStartEditMenuItem(id) {
  const item = adminGetMenuItemById(id);
  if (!item || !menuFormEl) return;

  editingMenuItemId = item.id;

  menuFormEl.category.value = item.category || "";
  menuFormEl.item_name.value = item.item_name || "";
  menuFormEl.description.value = item.description || "";
  menuFormEl.price.value = item.price || "";
  menuFormEl.sort_order.value = item.sort_order || 0;

  let activeInput = menuFormEl.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    menuFormEl.appendChild(activeInput);
  }

  activeInput.value = item.is_active ? "1" : "0";

  const submitButton = menuFormEl.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Update Menu Item";

  menuFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function adminToggleMenuItem(id) {
  const item = adminGetMenuItemById(id);
  if (!item) return;

  const formData = new FormData();
  formData.append("id", item.id);
  formData.append("category", item.category || "");
  formData.append("item_name", item.item_name || "");
  formData.append("description", item.description || "");
  formData.append("price", item.price || "");
  formData.append("sort_order", item.sort_order || 0);
  formData.append("is_active", item.is_active ? "0" : "1");

  const response = await fetch("/api/admin-menu", {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not update menu item.");
    return;
  }

  await adminLoadMenu();
}

async function adminDeleteMenuItem(id) {
  if (!confirm("Delete this menu item? This cannot be undone.")) return;

  const formData = new FormData();
  formData.append("id", id);

  const response = await fetch("/api/admin-menu", {
    method: "DELETE",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not delete menu item.");
    return;
  }

  await adminLoadMenu();
}

/* Gallery */

if (loadGalleryButtonEl) {
  loadGalleryButtonEl.addEventListener("click", adminLoadGallery);
}

if (galleryFormEl) {
  galleryFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(galleryFormEl);
const photoFile = formData.get("photo_file");
let method = "POST";

if (photoFile && photoFile.size > 0) {
  const uploadData = new FormData();
  uploadData.append("file", photoFile);

  const uploadResponse = await fetch("/api/upload-media", {
    method: "POST",
    body: uploadData,
  });

  const uploadResult = await uploadResponse.json();

  if (!uploadResult.ok) {
    alert(uploadResult.error || "Could not upload photo.");
    return;
  }

  formData.set("image_url", uploadResult.image_url);
}

formData.delete("photo_file");

    if (editingGalleryImageId) {
      method = "PUT";
      formData.append("id", editingGalleryImageId);

      if (!formData.get("is_active")) {
        formData.append("is_active", "1");
      }
    }

    if (!formData.get("is_featured")) {
      formData.append("is_featured", "0");
    }

    const response = await fetch("/api/admin-gallery", {
      method,
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not save gallery image.");
      return;
    }

    editingGalleryImageId = null;
    galleryFormEl.reset();

    const activeInput = galleryFormEl.querySelector('[name="is_active"]');
    if (activeInput) activeInput.remove();

    const submitButton = galleryFormEl.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Add Photo";

    await adminLoadGallery();
  });
}

async function adminLoadGallery() {
  if (!galleryListEl) return;

  galleryListEl.innerHTML =
    '<div class="placeholder-panel">Loading gallery images...</div>';

  const response = await fetch("/api/admin-gallery");
  const result = await response.json();

  if (!result.ok) {
    galleryListEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load gallery."
    )}</div>`;
    return;
  }

  currentGalleryImages = result.images || [];

  if (currentGalleryImages.length === 0) {
    galleryListEl.innerHTML =
      '<div class="placeholder-panel">No gallery images yet.</div>';
    return;
  }

  galleryListEl.innerHTML = currentGalleryImages
    .map(
      (image) => `
      <article class="quote-card">
        <div class="quote-card-top">
          <div>
            <h3>${escapeHtml(image.caption || "Gallery Photo")}</h3>
            <p class="muted">${escapeHtml(image.alt_text || "No alt text")}</p>
          </div>

          <span class="badge">${image.is_active ? "Active" : "Hidden"}</span>
        </div>

        <div class="quote-details">
          <p><strong>Photo Address:</strong> ${escapeHtml(image.image_url)}</p>
          <p><strong>Display Position:</strong> ${escapeHtml(image.sort_order)}</p>
          <p><strong>Highlighted:</strong> ${image.is_featured ? "Yes" : "No"}</p>
          <p><strong>Created:</strong> ${escapeHtml(image.created_at)}</p>
        </div>

        <div class="gallery-preview">
          <img
            src="${escapeHtml(image.image_url)}"
            alt="${escapeHtml(image.alt_text)}"
            
          >
        </div>

        <div class="actions">
          <button class="btn small" onclick="adminStartEditGalleryImage(${image.id})">
            Edit
          </button>

          <button class="btn secondary small" onclick="adminToggleGalleryImage(${image.id})">
            ${image.is_active ? "Hide" : "Show"}
          </button>

          <button class="btn secondary small" onclick="adminDeleteGalleryImage(${image.id})">
            Delete
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function adminGetGalleryImageById(id) {
  return currentGalleryImages.find((image) => Number(image.id) === Number(id));
}

function adminStartEditGalleryImage(id) {
  const image = adminGetGalleryImageById(id);
  if (!image || !galleryFormEl) return;

  editingGalleryImageId = image.id;

  galleryFormEl.image_url.value = image.image_url || "";
  galleryFormEl.alt_text.value = image.alt_text || "";
  galleryFormEl.caption.value = image.caption || "";
  galleryFormEl.sort_order.value = image.sort_order || 0;

  const featuredInput = galleryFormEl.querySelector('[name="is_featured"]');
  if (featuredInput) {
    featuredInput.checked = !!image.is_featured;
  }

  let activeInput = galleryFormEl.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    galleryFormEl.appendChild(activeInput);
  }

  activeInput.value = image.is_active ? "1" : "0";

  const submitButton = galleryFormEl.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Update Photo";

  galleryFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function adminToggleGalleryImage(id) {
  const image = adminGetGalleryImageById(id);
  if (!image) return;

  const formData = new FormData();
  formData.append("id", image.id);
  formData.append("image_url", image.image_url || "");
  formData.append("alt_text", image.alt_text || "");
  formData.append("caption", image.caption || "");
  formData.append("sort_order", image.sort_order || 0);
  formData.append("is_featured", image.is_featured ? "1" : "0");
  formData.append("is_active", image.is_active ? "0" : "1");

  const response = await fetch("/api/admin-gallery", {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not update gallery image.");
    return;
  }

  await adminLoadGallery();
}

async function adminDeleteGalleryImage(id) {
  if (!confirm("Delete this gallery image? This cannot be undone.")) return;

  const formData = new FormData();
  formData.append("id", id);

  const response = await fetch("/api/admin-gallery", {
    method: "DELETE",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not delete gallery image.");
    return;
  }

  await adminLoadGallery();
}

/* Reviews */

if (loadReviewsButtonEl) {
  loadReviewsButtonEl.addEventListener("click", adminLoadReviews);
}

if (reviewFormEl) {
  reviewFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(reviewFormEl);
    let method = "POST";

    if (editingReviewId) {
      method = "PUT";
      formData.append("id", editingReviewId);

      if (!formData.get("is_active")) {
        formData.append("is_active", "1");
      }
    }

    if (!formData.get("is_featured")) {
      formData.append("is_featured", "0");
    }

    const response = await fetch("/api/admin-reviews", {
      method,
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not save review.");
      return;
    }

    editingReviewId = null;
    reviewFormEl.reset();

    const activeInput = reviewFormEl.querySelector('[name="is_active"]');
    if (activeInput) activeInput.remove();

    const submitButton = reviewFormEl.querySelector('button[type="submit"]');
    if (submitButton) submitButton.textContent = "Add Review";

    await adminLoadReviews();
  });
}

async function adminLoadReviews() {
  if (!reviewsListEl) return;

  reviewsListEl.innerHTML =
    '<div class="placeholder-panel">Loading reviews...</div>';

  const response = await fetch("/api/admin-reviews");
  const result = await response.json();

  if (!result.ok) {
    reviewsListEl.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load reviews."
    )}</div>`;
    return;
  }

  currentReviews = result.reviews || [];

  if (currentReviews.length === 0) {
    reviewsListEl.innerHTML =
      '<div class="placeholder-panel">No reviews yet.</div>';
    return;
  }

  reviewsListEl.innerHTML = currentReviews
    .map(
      (review) => `
      <article class="quote-card">
        <div class="quote-card-top">
          <div>
            <h3>${escapeHtml(review.customer_name)}</h3>
            <p class="muted">
              ${escapeHtml(review.event_type || "Review")}
              ${review.rating ? " • " + "★".repeat(Number(review.rating)) : ""}
            </p>
          </div>

          <span class="badge">${review.is_active ? "Active" : "Hidden"}</span>
        </div>

        <div class="quote-details">
          <p><strong>Rating:</strong> ${escapeHtml(review.rating)}</p>
          <p><strong>Event Type:</strong> ${escapeHtml(review.event_type)}</p>
          <p><strong>Display Position:</strong> ${escapeHtml(review.sort_order)}</p>
          <p><strong>Highlighted:</strong> ${review.is_featured ? "Yes" : "No"}</p>

          <p class="full">
            <strong>Review:</strong><br>
            ${escapeHtml(review.review_text)}
          </p>
        </div>

        <div class="actions">
          <button class="btn small" onclick="adminStartEditReview(${review.id})">
            Edit
          </button>

          <button class="btn secondary small" onclick="adminToggleReview(${review.id})">
            ${review.is_active ? "Hide" : "Show"}
          </button>

          <button class="btn secondary small" onclick="adminDeleteReview(${review.id})">
            Delete
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function adminGetReviewById(id) {
  return currentReviews.find((review) => Number(review.id) === Number(id));
}

function adminStartEditReview(id) {
  const review = adminGetReviewById(id);
  if (!review || !reviewFormEl) return;

  editingReviewId = review.id;

  reviewFormEl.customer_name.value = review.customer_name || "";
  reviewFormEl.review_text.value = review.review_text || "";
  reviewFormEl.rating.value = review.rating || 5;
  reviewFormEl.event_type.value = review.event_type || "";
  reviewFormEl.sort_order.value = review.sort_order || 0;

  const featuredInput = reviewFormEl.querySelector('[name="is_featured"]');
  if (featuredInput) {
    featuredInput.checked = !!review.is_featured;
  }

  let activeInput = reviewFormEl.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    reviewFormEl.appendChild(activeInput);
  }

  activeInput.value = review.is_active ? "1" : "0";

  const submitButton = reviewFormEl.querySelector('button[type="submit"]');
  if (submitButton) submitButton.textContent = "Update Review";

  reviewFormEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function adminToggleReview(id) {
  const review = adminGetReviewById(id);
  if (!review) return;

  const formData = new FormData();
  formData.append("id", review.id);
  formData.append("customer_name", review.customer_name || "");
  formData.append("review_text", review.review_text || "");
  formData.append("rating", review.rating || 5);
  formData.append("event_type", review.event_type || "");
  formData.append("sort_order", review.sort_order || 0);
  formData.append("is_featured", review.is_featured ? "1" : "0");
  formData.append("is_active", review.is_active ? "0" : "1");

  const response = await fetch("/api/admin-reviews", {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not update review.");
    return;
  }

  await adminLoadReviews();
}

async function adminDeleteReview(id) {
  if (!confirm("Delete this review? This cannot be undone.")) return;

  const formData = new FormData();
  formData.append("id", id);

  const response = await fetch("/api/admin-reviews", {
    method: "DELETE",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not delete review.");
    return;
  }

  await adminLoadReviews();
}

/* About */

if (loadAboutButtonEl) {
  loadAboutButtonEl.addEventListener("click", adminLoadAbout);
}

if (aboutFormEl) {
  aboutFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await fetch("/api/admin-about", {
      method: "POST",
      body: new FormData(aboutFormEl),
    });

    const result = await response.json();

    if (!result.ok) {
      aboutStatusEl.textContent =
        result.error || "Could not save About content.";
      return;
    }

    aboutStatusEl.textContent = "About content saved successfully.";
  });
}

async function adminLoadAbout() {
  if (!aboutFormEl || !aboutStatusEl) return;

  aboutStatusEl.textContent = "Loading About content...";

  const response = await fetch("/api/admin-about");
  const result = await response.json();

  if (!result.ok) {
    aboutStatusEl.textContent =
      result.error || "Could not load About content.";
    return;
  }

  if (!result.about) {
    aboutStatusEl.textContent = "No About content found.";
    return;
  }

  aboutFormEl.heading.value = result.about.heading || "";
  aboutFormEl.main_paragraph.value = result.about.main_paragraph || "";
  aboutFormEl.story_paragraph.value = result.about.story_paragraph || "";
  aboutFormEl.service_area_text.value =
    result.about.service_area_text || "";

  aboutStatusEl.textContent = "About content loaded.";
}