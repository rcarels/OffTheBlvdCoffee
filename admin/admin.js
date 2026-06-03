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

    const formData = new FormData(eventForm);

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
    eventForm.reset();

    const button = eventForm.querySelector('button[type="submit"]');
    if (button) {
      button.textContent = "Add Event";
    }

    await loadEvents();
  });
}