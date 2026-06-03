const loginFormEl = document.getElementById("loginForm");
const loginMessageEl = document.getElementById("loginMessage");
const loginEl = document.getElementById("login");
const dashboardEl = document.getElementById("dashboard");
const quotesDivEl = document.getElementById("quotes");

const loadQuotesButtonEl = document.getElementById("loadQuotes");
const refreshQuotesButtonEl = document.getElementById("refreshQuotes");

const loadEventsButtonEl = document.getElementById("loadEvents");
const eventFormEl = document.getElementById("eventForm");
const eventsListEl = document.getElementById("eventsList");

const noteFormEl = document.getElementById("noteForm");
const notesListEl = document.getElementById("notesList");

let activeQuoteId = null;
let editingEventId = null;
let currentEvents = [];

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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

    loginEl.style.display = "none";
    dashboardEl.style.display = "grid";

    adminLoadQuotes();
  });
}

document.querySelectorAll(".nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav button").forEach((b) => {
      b.classList.remove("active");
    });

    button.classList.add("active");

    const selected = button.dataset.section;

    ["quotes", "events", "menu", "gallery", "about"].forEach((name) => {
      const section = document.getElementById(`section-${name}`);
      if (section) {
        section.classList.toggle("hidden", name !== selected);
      }
    });
  });
});

if (loadQuotesButtonEl) {
  loadQuotesButtonEl.addEventListener("click", adminLoadQuotes);
}

if (refreshQuotesButtonEl) {
  refreshQuotesButtonEl.addEventListener("click", adminLoadQuotes);
}

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
    if (activeInput) {
      activeInput.remove();
    }

    const submitButton = eventFormEl.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.textContent = "Add Event";
    }

    await adminLoadEvents();
  });
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
          <button class="btn small" onclick="adminOpenNotes(${q.id}, '${escapeHtml(
        q.name
      )}')">
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

  adminLoadQuotes();
}

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
  if (submitButton) {
    submitButton.textContent = "Update Event";
  }

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