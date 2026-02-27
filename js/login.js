async function login() {

  const firstname = document.getElementById("firstname").value;
  const surname = document.getElementById("surname").value;
  const privateKey = document.getElementById("privateKey").value;

  const res = await fetch(API_BASE + "/login", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      firstname,
      surname,
      privateKey
    })

  });

  const data = await res.json();

  if(res.ok){

    localStorage.setItem("user", JSON.stringify(data));

    window.location = "../dashboard.html";

  } else {

    document.getElementById("error").innerText = data.error;

  }
}