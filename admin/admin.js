const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const login = document.getElementById("login");
const dashboard = document.getElementById("dashboard");
const quotesDiv = document.getElementById("quotes");

const loadEventsButton = document.getElementById("loadEvents");
const eventForm = document.getElementById("eventForm");
const eventsList = document.getElementById("eventsList");

let activeQuoteId = null;

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/admin-login", {
    method: "POST",
    body: new FormData(loginForm),
  });

  const result = await response.json();

  if (!result.ok) {
    loginMessage.textContent = result.error || "Login failed.";
    return;
  }

  login.style.display = "none";
  dashboard.style.display = "grid";
  loadQuotes();
});

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

document.getElementById("loadQuotes")?.addEventListener("click", loadQuotes);
document.getElementById("refreshQuotes")?.addEventListener("click", loadQuotes);

if (loadEventsButton) {
  loadEventsButton.addEventListener("click", loadEvents);
}

if (eventForm) {
  eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const response = await fetch("/api/admin-events", {
      method: "POST",
      body: new FormData(eventForm),
    });

    const result = await response.json();

    if (!result.ok) {
      alert(result.error || "Could not add event.");
      return;
    }

    eventForm.reset();
    await loadEvents();
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

async function loadQuotes() {
  quotesDiv.innerHTML =
    '<div class="placeholder-panel">Loading quote requests...</div>';

  const response = await fetch("/api/admin-quotes");
  const result = await response.json();

  if (!result.ok) {
    quotesDiv.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load quotes."
    )}</div>`;
    return;
  }

  updateStats(result.quotes || []);

  if (!result.quotes || result.quotes.length === 0) {
    quotesDiv.innerHTML =
      '<div class="placeholder-panel">No quote requests yet.</div>';
    return;
  }

  quotesDiv.innerHTML = result.quotes
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
          <button class="btn small" onclick="openNotes(${q.id}, '${escapeHtml(
        q.name
      )}')">
            Notes
          </button>

          <button class="btn secondary small" onclick="updateStatus(${q.id}, 'New')">
            New
          </button>

          <button class="btn secondary small" onclick="updateStatus(${q.id}, 'Contacted')">
            Contacted
          </button>

          <button class="btn secondary small" onclick="updateStatus(${q.id}, 'Booked')">
            Booked
          </button>

          <button class="btn secondary small" onclick="updateStatus(${q.id}, 'Completed')">
            Completed
          </button>

          <button class="btn secondary small" onclick="updateStatus(${q.id}, 'Archived')">
            Archived
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

async function updateStatus(id, status) {
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

  loadQuotes();
}

async function openNotes(id, name) {
  activeQuoteId = id;

  document.getElementById("noteQuoteId").value = id;
  document.getElementById("notesTitle").textContent = `Notes for ${name}`;
  document.getElementById("notesModal").classList.remove("hidden");

  await loadNotes(id);
}

function closeNotes() {
  document.getElementById("notesModal").classList.add("hidden");
  activeQuoteId = null;
}

async function loadNotes(quoteId) {
  const notesList = document.getElementById("notesList");

  notesList.innerHTML =
    '<div class="placeholder-panel">Loading notes...</div>';

  const response = await fetch(`/api/admin-quote-notes?quote_id=${quoteId}`);
  const result = await response.json();

  if (!result.ok) {
    notesList.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load notes."
    )}</div>`;
    return;
  }

  if (!result.notes || result.notes.length === 0) {
    notesList.innerHTML =
      '<div class="placeholder-panel">No notes yet.</div>';
    return;
  }

  notesList.innerHTML = result.notes
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

document.getElementById("noteForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = event.target;

  const response = await fetch("/api/admin-quote-notes", {
    method: "POST",
    body: new FormData(form),
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not save note.");
    return;
  }

  form.reset();
  document.getElementById("noteQuoteId").value = activeQuoteId;
  await loadNotes(activeQuoteId);
});

let editingEventId = null;

async function loadEvents() {
  if (!eventsList) return;

  eventsList.innerHTML =
    '<div class="placeholder-panel">Loading events...</div>';

  const response = await fetch("/api/admin-events");
  const result = await response.json();

  if (!result.ok) {
    eventsList.innerHTML = `<div class="placeholder-panel">${escapeHtml(
      result.error || "Could not load events."
    )}</div>`;
    return;
  }

  if (!result.events || result.events.length === 0) {
    eventsList.innerHTML =
      '<div class="placeholder-panel">No events yet.</div>';
    return;
  }

  eventsList.innerHTML = result.events
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
          <button class="btn small" onclick="startEditEvent(${event.id}, '${escapeHtml(event.title)}', '${escapeHtml(event.event_date)}', '${escapeHtml(event.location)}', '${escapeHtml(event.description)}', ${event.is_active ? 1 : 0})">
            Edit
          </button>

          <button class="btn secondary small" onclick="toggleEvent(${event.id}, '${escapeHtml(event.title)}', '${escapeHtml(event.event_date)}', '${escapeHtml(event.location)}', '${escapeHtml(event.description)}', ${event.is_active ? 0 : 1})">
            ${event.is_active ? "Hide" : "Show"}
          </button>

          <button class="btn secondary small" onclick="deleteEvent(${event.id})">
            Delete
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function startEditEvent(id, title, eventDate, location, description, isActive) {
  editingEventId = id;

  eventForm.title.value = title || "";
  eventForm.event_date.value = eventDate || "";
  eventForm.location.value = location || "";
  eventForm.description.value = description || "";

  let activeInput = eventForm.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    eventForm.appendChild(activeInput);
  }

  activeInput.value = isActive ? "1" : "0";

  const button = eventForm.querySelector('button[type="submit"]');
  if (button) {
    button.textContent = "Update Event";
  }

  eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function toggleEvent(id, title, eventDate, location, description, isActive) {
  const formData = new FormData();

  formData.append("id", id);
  formData.append("title", title || "");
  formData.append("event_date", eventDate || "");
  formData.append("location", location || "");
  formData.append("description", description || "");
  formData.append("is_active", isActive ? "1" : "0");

  const response = await fetch("/api/admin-events", {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();

  if (!result.ok) {
    alert(result.error || "Could not update event.");
    return;
  }

  await loadEvents();
}

async function deleteEvent(id) {
  if (!confirm("Delete this event? This cannot be undone.")) {
    return;
  }

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

  await loadEvents();
}