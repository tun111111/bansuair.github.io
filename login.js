var keysheet =
  "AKfycbzepEIBzynk_iP3mRftWHa7lzKfPLDA-55Kq0Y2bh2YsV6MqoUC3jyocF4woRmX1hVJ";
document.addEventListener(
  "contextmenu",
  function (e) {
    e.preventDefault();
  },
  false
);

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.keyCode == 123) {
    e.stopPropagation();
    e.preventDefault();
  }
});

function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var warningMessage = document.getElementById("warning-message");
  if (!username || !password) {
    warningMessage.textContent = "คุณไม่ได้กรอก Username หรือ Password";
    return;
  }
  warningMessage.textContent = "";
  var url = "https://script.google.com/macros/s/" + keysheet + "/exec";
  var data = JSON.stringify({
    command: "login",
    sheet_name: "Login",
    username: encodeURIComponent(username),
    password: encodeURIComponent(password),
  });
  fetch(url, {
    method: "POST",
    body: data,
  })
    .then((res) => res.text())
    .then((result) => {
      console.log("Fetch Response:", result);
      if (result.trim().toLowerCase() === "login success") {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
      } else {
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        warningMessage.textContent =
          "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องโปรดลองอีกครั้ง";
      }
    })
    .catch((error) => console.log("Error:", error));
}
