const API = "https://pinapaka-family-api.onrender.com";
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location = "../index.html";
}

// ------------------
// Upcoming Events
// ------------------
async function loadUpcoming() {

  try {

    const res = await fetch(API + "/upcoming-events");
    const events = await res.json();

    const container = document.getElementById("events");
    container.innerHTML = "";

    if (!events || events.length === 0) {
      container.innerHTML = "<p>No upcoming events in next 3 months</p>";
      return;
    }

    events.forEach(e => {
      const div = document.createElement("div");
      div.innerHTML =
        `<strong>${e.type}</strong>: ${e.name} - 
         ${new Date(e.date).toDateString()}`;
      container.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading events:", err);
  }
}

loadUpcoming();

// ------------------
// Navigation Buttons
// ------------------

function openProfile() {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Login first");
    window.location = "../index.html";
    return;
  }

  window.location = "../profile.html?id=" + user.id;
}

function openTree() {
  window.location = "../tree.html";
}

function logout() {
  localStorage.removeItem("user");
  window.location = "../index.html";
}