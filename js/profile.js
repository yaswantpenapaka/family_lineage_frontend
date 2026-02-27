const API = "https://pinapaka-family-api.onrender.com";

const params = new URLSearchParams(window.location.search);
let id = params.get("id");

const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location = "index.html";

if (!id) id = user.id;

let person = null;

/* ---------------- LOAD PROFILE ---------------- */

async function loadProfile() {

  const res = await fetch(API + "/persons/" + id);
  person = await res.json();

  document.getElementById("name").innerText =
    person.firstname + " " + person.surname;

  document.getElementById("dob").innerText =
    formatDate(person.dob);

  document.getElementById("gender").innerText =
    person.gender || "";

  document.getElementById("married_status").innerText =
    person.married == 1 ? "Yes" : "No";

  document.getElementById("instagram").innerText =
    person.instagram || "";

  document.getElementById("anniversary").innerText =
    formatDate(person.anniversary);

  document.getElementById("profile_pic").src =
    person.profile_pic ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // Show relation buttons based on permission
  if (user.role === "ADMIN" || user.id === person.id) {

    document.getElementById("relationButtons").style.display = "block";
  }
}

/* ---------------- ENABLE EDIT ---------------- */

function enableEdit() {

  document.getElementById("editForm").style.display = "block";

  edit_firstname.value = person.firstname;
  edit_surname.value = person.surname;
  edit_dob.value = formatDate(person.dob);
  edit_gender.value = person.gender || "Male";
  edit_married.value = person.married || 0;
  edit_instagram.value = person.instagram || "";
  edit_anniversary.value = formatDate(person.anniversary);
}

/* ---------------- SAVE PROFILE ---------------- */

async function saveProfile() {

  const formData = new FormData();

  formData.append("firstname", edit_firstname.value);
  formData.append("surname", edit_surname.value);
  formData.append("dob", edit_dob.value);
  formData.append("gender", edit_gender.value);
  formData.append("married", edit_married.value);
  formData.append("instagram", edit_instagram.value);
  formData.append("anniversary", edit_anniversary.value);

  if (photo.files[0])
    formData.append("photo", photo.files[0]);

  const res = await fetch(API + "/persons/" + id, {
    method: "PUT",
    headers: {
      "userid": user.id
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Profile updated");
  loadProfile();
}

/* ---------------- ADD FATHER ---------------- */

async function addFather() {

  const firstname = prompt("Father Firstname:");
  const surname = prompt("Father Surname:");
  const dob = prompt("Father DOB (YYYY-MM-DD):");

  if (!firstname || !surname || !dob) return;

  await fetch(API + "/add-father/" + id, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ firstname, surname, dob })
  });

  alert("Father added");
  loadProfile();
}

/* ---------------- ADD SIBLING ---------------- */

async function addSibling(){

  const firstname = prompt("Sibling Firstname:");
  const surname = prompt("Sibling Surname:");
  const dob = prompt("DOB (YYYY-MM-DD):");
  const gender = prompt("Gender (Male/Female):");

  if(!firstname || !surname || !dob || !gender) return;

  const res = await fetch(API + "/add-sibling/" + id,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ firstname, surname, dob, gender })
  });

  const data = await res.json();

  if(!res.ok){
    alert(data.error);
    return;
  }

  alert("Sibling added");
  loadProfile();
}
/* ---------------- ADD SPOUSE ---------------- */

async function addMarriedPartner() {

  if (person.married == 1) {
    alert("Already married. Divorce not allowed.");
    return;
  }

  const firstname = prompt("Partner Firstname:");
  const surname = prompt("Partner Surname:");
  const dob = prompt("Partner DOB (YYYY-MM-DD):");

  let gender;

  if (person.gender === "Male")
    gender = "Female";
  else
    gender = "Male";

  if (!firstname || !surname || !dob)
    return;

  const res = await fetch(API + "/add-spouse/" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstname, surname, dob, gender })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  alert("Married Partner added");
  loadProfile();
}

/* ---------------- ADD CHILD ---------------- */

async function addChild() {

  if (person.married != 1) {
    alert("Must be married to add child.");
    return;
  }

  const firstname = prompt("Child Firstname:");
  const surname = prompt("Child Surname:");
  const dob = prompt("Child DOB (YYYY-MM-DD):");
  const gender = prompt("Gender (Male/Female):");

  if (!firstname || !surname || !dob || !gender) return;

  await fetch(API + "/add-child/" + id, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstname, surname, dob, gender })
  });

  alert("Child added");
  loadProfile();
}

/* ---------------- DATE FORMAT ---------------- */

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

loadProfile();