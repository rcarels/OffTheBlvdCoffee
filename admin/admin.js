let currentEvents = [];

async function loadEvents() {
  if (!eventsList) return;

  eventsList.innerHTML =
    '<div class="placeholder-panel">Loading events...</div>';

  const response = await fetch("/api/admin-events");
  const result = await response.json();

  if (!result.ok) {
    eventsList.innerHTML = `<div class="placeholder-panel">${escapeHtml(result.error || "Could not load events.")}</div>`;
    return;
  }

  currentEvents = result.events || [];

  if (currentEvents.length === 0) {
    eventsList.innerHTML =
      '<div class="placeholder-panel">No events yet.</div>';
    return;
  }

  eventsList.innerHTML = currentEvents.map(event => `
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
        <p class="full"><strong>Description:</strong><br>${escapeHtml(event.description)}</p>
      </div>

      <div class="actions">
        <button class="btn small" onclick="startEditEvent(${event.id})">Edit</button>
        <button class="btn secondary small" onclick="toggleEvent(${event.id})">
          ${event.is_active ? "Hide" : "Show"}
        </button>
        <button class="btn secondary small" onclick="deleteEvent(${event.id})">Delete</button>
      </div>
    </article>
  `).join("");
}

function getEventById(id) {
  return currentEvents.find(event => Number(event.id) === Number(id));
}

function startEditEvent(id) {
  const event = getEventById(id);
  if (!event) return;

  editingEventId = event.id;

  eventForm.title.value = event.title || "";
  eventForm.event_date.value = event.event_date || "";
  eventForm.location.value = event.location || "";
  eventForm.description.value = event.description || "";

  let activeInput = eventForm.querySelector('[name="is_active"]');

  if (!activeInput) {
    activeInput = document.createElement("input");
    activeInput.type = "hidden";
    activeInput.name = "is_active";
    eventForm.appendChild(activeInput);
  }

  activeInput.value = event.is_active ? "1" : "0";

  const button = eventForm.querySelector('button[type="submit"]');
  if (button) button.textContent = "Update Event";

  eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function toggleEvent(id) {
  const event = getEventById(id);
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

  await loadEvents();
}

async function deleteEvent(id) {
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

  await loadEvents();
}