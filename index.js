var idsheet =
  "AKfycbzepEIBzynk_iP3mRftWHa7lzKfPLDA-55Kq0Y2bh2YsV6MqoUC3jyocF4woRmX1hVJ";
function showLoading() {
  const loadingOverlay = document.createElement("div");
  loadingOverlay.classList.add("loading-overlay");
  const loadingSpinner = document.createElement("div");
  loadingSpinner.classList.add("loading-spinner");
  loadingOverlay.appendChild(loadingSpinner);
  document.body.appendChild(loadingOverlay);
}

function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    document.body.removeChild(loadingOverlay);
  }
}
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
function logout() {
  var confirmLogout = confirm("คุณต้องการออกจากระบบหรือไม่?");
  if (confirmLogout) {
    sessionStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  } else {
    // ไม่ต้องทำอะไร
  }
}

function refreshPage() {
  location.reload(true);
}

function createNewSheet() {
  var sheetname = prompt("กรุณาใส่ชื่อ sheet ที่ต้องการ :");
  if (sheetname == "") {
    alert("กรุณากรอกชื่ออุปกรณ์");
    return;
  }
  var url =
    "https://script.google.com/macros/s/" +
    idsheet +
    "/exec?action=createSheet&sheetname=" +
    encodeURIComponent(sheetname);
  fetch(url)
    .then((response) => response.text())
    .then((result) => {
      console.log("Fetch Response:", result);
      loadSheetButtons();
      alert(result);
      if (result.trim().toLowerCase() === "successful") {
        console.log("Redirecting to index.html");
        window.location.href = "index.html";
      }
    })
    .catch((error) => console.error("Error:", error));
}

function deleteRow(index) {
  var deleteUrl =
    "https://script.google.com/macros/s/" +
    idsheet +
    "/exec?rowToDelete=" +
    index;
  var deleteXhr = new XMLHttpRequest();
  deleteXhr.open("GET", deleteUrl, true);
  deleteXhr.onreadystatechange = function () {
    if (deleteXhr.readyState == 4 && deleteXhr.status == 200) {
      loadTableData();
    }
  };

  deleteXhr.send();
}

function confirmDeleteAll() {
  var isConfirmed = window.confirm(
    "ต้องการที่จะลบวันเดือนปีทั้งหมดในตารางหรือไม่?"
  );
  if (isConfirmed) {
    deleteAllData();
  }
}

function deleteAllData() {
  var deleteAllUrl =
    "https://script.google.com/macros/s/" + idsheet + "/exec?deleteAll";
  var deleteAllXhr = new XMLHttpRequest();
  deleteAllXhr.open("GET", deleteAllUrl, true);
  deleteAllXhr.onreadystatechange = function () {
    if (deleteAllXhr.readyState == 4 && deleteAllXhr.status == 200) {
      var responseData = JSON.parse(deleteAllXhr.responseText);
      alert(responseData.message);
      loadTableData();
    }
  };
  deleteAllXhr.send();
}

function loadTableData() {
  var xhr = new XMLHttpRequest();
  var url = "https://script.google.com/macros/s/" + idsheet + "/exec";
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var responseData = JSON.parse(xhr.responseText);
      var statusTableBody = document.getElementById("status-table-body");
      if (statusTableBody) {
        while (statusTableBody.firstChild) {
          statusTableBody.removeChild(statusTableBody.firstChild);
        }
        responseData.data.slice(0).forEach(function (item, index) {
          if (item[0] != "") {
            // เช็คว่าข้อมูลในคอลัมน์แรกไม่ว่าง
            var row = statusTableBody.insertRow();
            var cellStatus = row.insertCell(0);
            var dateValue = item[0].toString(); // แปลงเป็น string ก่อนใช้ replace
            var formattedDate = dateValue.replace(
              /(\d{4})(\d{2})(\d{2})/,
              "$3/$2/$1"
            );
            cellStatus.textContent = formattedDate;

            var cellAction = row.insertCell(1);
            var deleteLink = document.createElement("a");
            deleteLink.href = "javascript:void(0);";
            deleteLink.textContent = "Delete";
            deleteLink.onclick = function () {
              deleteRow(index + 1);
            };
            cellAction.appendChild(deleteLink);
          }
        });
      }
    }
  };
  xhr.send();
}

function submitData() {
  var dateInput = document.getElementById("dateInput").value;
  var formattedDate = dateInput.split("-").join("");
  var submitUrl =
    "https://script.google.com/macros/s/" +
    idsheet +
    "/exec?date=" +
    formattedDate;
  var submitXhr = new XMLHttpRequest();
  submitXhr.open("GET", submitUrl, true);
  submitXhr.onreadystatechange = function () {
    if (submitXhr.readyState == 4 && submitXhr.status == 200) {
      loadTableData();
    }
  };
  submitXhr.send();
}
window.onload = loadTableData;

function showConfigCalendar() {
  document.getElementById("content-section").innerHTML = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="CSS File/showConfigCalendar.css" />
          <title>เพิ่มวันหยุดบริษัท</title>
          </head>
          <body>
          <div id="wrapper">
              <header>
                  <h1>Smart Air Conditioner Controller</h1>
              </header>
              <main>
                  <div class="input-section">
                      <h2 for="dateInput">กรุณาเลือกวันที่:</h2>
                      <input type="date" id="dateInput" name="dateInput" lang="th" pattern="\d{4}-\d{2}-\d{2}"
                          title="กรุณาใส่วันที่ในรูปแบบ วว/ดด/ปปปป">
                      <button onclick="submitData()">Submit</button>
                  </div>
              <h2>ตารางวันหยุดบริษัท</h2>
                  <div class="table-section">
                      <center>
                          <table>
                              <thead>
                                  <tr>
                                      <th><center>วันเดือนปี</center></th>
                                      <th></th>
                                  </tr>
                              </thead>
                              <tbody id="status-table-body"></tbody>
                          </table>
                          <button onclick="confirmDeleteAll()">ลบวันเดือนปีทั้งหมดในตาราง</button>
                  </div>
              </main>
              </center>
              </body>
              </html>`;
  loadTableData();
}

function toggleSidebar() {
  var sidebar = document.querySelector("aside");
  sidebar.style.left =
    sidebar.style.left === "0px" || sidebar.style.left === ""
      ? "-270px"
      : "0px";
}

function deleteSheet(sheet) {
  var confirmDelete = confirm("คุณต้องการลบ Sheet: " + sheet + " ใช่หรือไม่?");
  if (confirmDelete) {
    fetch(
      "https://script.google.com/macros/s/" +
        idsheet +
        "/exec?action=deleteSheet&sheetname=" +
        sheet
    )
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Network response was not ok.");
      })
      .then((data) => {
        loadSheetButtons();
        createNewSheet();
      })
      .catch((error) => {
        console.error("Error during sheet deletion:", error);
      });
  }
}

function toggleSidebar() {
  var sidebar = document.querySelector("aside");
  sidebar.style.left =
    sidebar.style.left === "0px" || sidebar.style.left === ""
      ? "-270px"
      : "0px";
}

function deleteSheet(sheet) {
  var confirmDelete = confirm("คุณต้องการลบ Sheet: " + sheet + " ใช่หรือไม่?");
  if (confirmDelete) {
    fetch(
      "https://script.google.com/macros/s/" +
        idsheet +
        "/exec?action=deleteSheet&sheetname=" +
        sheet
    )
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw new Error("Network response was not ok.");
      })
      .then((data) => {
        loadSheetButtons();
      })
      .catch((error) => {
        console.error("Error during sheet deletion:", error);
      });
  }
}

function showSheetName(sheetName) {
  document.getElementById("selectedSheet").textContent =
    "คุณเลือก Sheet Name : " + sheetName;
}

function highlightSheetButton(sheetName) {
  var allButtons = document.getElementsByTagName("button");
  for (var i = 0; i < allButtons.length; i++) {
    if (allButtons[i].textContent.trim() === sheetName.trim()) {
      allButtons[i].style.backgroundColor = "green";
    } else {
      allButtons[i].style.backgroundColor = "";
    }
  }
}

function loadSheetButtons(sheetName) {
  fetch(
    "https://script.google.com/macros/s/" +
      idsheet +
      "/exec?action=getSheetList"
  )
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw new Error(
        "มีข้อผิดพลาดlocation.reload(true);ในการโหลดรายการ Sheet"
      );
    })
    .then((sheetData) => {
      var sheetList = sheetData.split(",");
      var sidebarListElement = document.getElementById("sidebarList");
      sidebarListElement.innerHTML = "";
      sheetList.forEach((sheet) => {
        var listItem = document.createElement("li");
        var sheetButton = document.createElement("button");
        sheetButton.textContent = sheet;
        sheetButton.addEventListener("click", function () {
          showConfigsetting(sheet);
        });
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "ลบ";
        deleteButton.className = "deleteButton";
        deleteButton.addEventListener("click", function () {
          deleteSheet(sheet);
        });

        listItem.appendChild(sheetButton);
        listItem.appendChild(deleteButton);

        sidebarListElement.appendChild(listItem);

        // เช็ค sheetName ที่ส่งเข้ามา แล้วเรียกใช้ highlightSheetButton เพื่อเปลี่ยนสีปุ่ม
        if (sheet === sheetName) {
          highlightSheetButton(sheetName);
        }
      });
    })
    .catch((error) => {
      console.error("มีข้อผิดพลาดในการโหลดข้อมูล:", error);
    });
}
document.addEventListener("DOMContentLoaded", function () {
  loadSheetButtons();
});
function showConfigsetting(sheetName = "Device1") {
  fetchSheetDataAndDisplay(sheetName);
  loadSheetButtons(sheetName);
  document.getElementById("content-section").innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" href="CSS File/showConfigsetting.css" />
              <title>Smart Air Conditioner Controller</title>
          </head>
          <body>
              <ul id="sidebarList">
            <!-- Sheet buttons will be appended here -->
              </ul>
              <main>
                  <form id="airConditionerForm">
                      <center><h2>Smart Air Conditioner Controller</h2><h2 id="namesheet"></h2></center>
                      <center><h5 id="online"></h5></center>
                      <h6 id="timedisplay"></h6>
                      <input type="radio" id="auto" name="operationMode" value="0" />
                      <label for="auto">Auto</label>
                      <input type="radio" id="manual" name="operationMode" value="1" />
                      <label for="manual">Manual</label><br />
                      <div id="statusWrapper" style="display: block;">
                        <p>Switch ON-OFF <p>
                          <label id="status" class="switch switch-left-right">
                              <input
                                  type="checkbox"
                                  name="save_data_dowry"
                                  value="1"
                                  checked=""
                                  class="switch-input"
                              />
                              <span data-on="ON" data-off="OFF" class="switch-label"></span>
                              <span class="switch-handle"></span>
                          </label>
                      </div>
                      <table>
                      <tr>
                        <th><h4 id="setdelayLabel">Set delay(S.)</h4></th>
                        <th><input type="number" id="setdelay" min="0" max="300"></th>
                        <th><h6 id="textred" style="color: red;"><strong>**ตั้งวินาทีการดึงข้อมูลจาก Google Sheet ไปยัง ESP8266</strong></h6></th>
                      </tr>
                      </table>
                      <h4 id="timeInputs"></h4>
                      <div id="dayInputs">
                          <input type="checkbox" id="Monday" name="day[]" value="Monday" />
                          <label for="Monday">Monday</label><br />
                          <input type="checkbox" id="Tuesday" name="day[]" value="Tuesday" />
                          <label for="Tuesday">Tuesday</label><br />
                          <input type="checkbox" id="Wednesday" name="day[]" value="Wednesday" />
                          <label for="Wednesday">Wednesday</label><br />
                          <input type="checkbox" id="Thursday" name="day[]" value="Thursday" />
                          <label for="Thursday">Thursday</label><br />
                          <input type="checkbox" id="Friday" name="day[]" value="Friday" />
                          <label for="Friday">Friday</label><br />
                          <input type="checkbox" id="Saturday" name="day[]" value="Saturday" />
                          <label for="Saturday">Saturday</label><br />
                          <input type="checkbox" id="Sunday" name="day[]" value="Sunday" />
                          <label for="Sunday">Sunday</label><br />
                      </div>
                    <center><button id="submitForm">Submit</button></center>
                  </form>
                  <div id="msg"></div>
              </main>
          </body>
      </html>
    `;
  document.getElementById("namesheet").innerHTML = "At : " + sheetName;
  document
    .getElementById("submitForm")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent form submission
      var operationMode = document.querySelector(
        'input[name="operationMode"]:checked'
      ).value;
      var isChecked = document.querySelector(
        '#status input[type="checkbox"]'
      ).checked;
      var status = isChecked ? "ON" : "OFF";
      var openTime = document.getElementById("openTime").value;
      var closeTime = document.getElementById("closeTime").value;
      var restartTime = document.getElementById("restartTime").value;
      var setdelay = document.getElementById("setdelay").value;
      var days = [];
      document
        .querySelectorAll('input[name="day[]"]')
        .forEach(function (checkbox) {
          days.push(checkbox.checked ? "1" : "0");
        });

      if (status.trim() === "") {
        alert("Please enter status.");
        return;
      }
      var userPreference;
      if (confirm("ต้องการที่จะบันทึกข้อมูลหรือไม่ ?")) {
        userPreference = "บันทึกข้อมูลทั้งหมดแล้ว";
      } else {
        userPreference = "ยกเลิกการส่งข้อมูลแล้ว !";
        return;
      }
      var data = JSON.stringify({
        command: "config",
        sheet_name: sheetName,
        values: {
          operation: operationMode,
          status: status,
          open_time: openTime,
          close_time: closeTime,
          restart_time: restartTime,
          timedelay: setdelay,
          day: days.join(","),
        },
      });
      fetch("https://script.google.com/macros/s/" + idsheet + "/exec", {
        method: "POST",
        body: data,
      })
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("msg").innerHTML = userPreference;
          fetchSheetDataAndDisplay(sheetName);
          console.log("ส่งข้อมูลแล้ว");
        })
        .catch((error) => {
          console.error("Error sending data:", error);
          document.getElementById("msg").innerHTML =
            "An error occurred while saving data.";
        });
    });
}

function formatDateTime(dateTimeStr) {
  const year = dateTimeStr.slice(0, 4);
  const month = dateTimeStr.slice(4, 6);
  const day = dateTimeStr.slice(6, 8);
  const hour = dateTimeStr.slice(9, 11);
  const minute = dateTimeStr.slice(12, 14);
  return `${day}/${month}/${year} Time: ${hour}:${minute}`;
}

function fetchSheetDataAndDisplay(sheetName) {
  fetch(
    "https://script.google.com/macros/s/" +
      idsheet +
      "/exec?action=getDataFromSheet&sheet=" +
      sheetName,
    {
      method: "GET",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.days) {
        if (data.operation === "0") {
          document.getElementById("auto").checked = true;
          document.getElementById("manual").checked = false;
          document.getElementById("timeInputs").style.display = "block";
          document.getElementById("online").innerText =
            "Online Status: " + formatDateTime(data.online);
          document.getElementById("dayInputs").style.display = "block";
          document.getElementById("setdelay").style.display = "block";
          document.getElementById("textred").style.display = "block";
          document.getElementById("setdelayLabel").style.display = "block";
          document.getElementById("statusWrapper").style.display = "none";
          document.getElementById("setdelayLabel").innerText =
            "Set Delay (" + data.setdelay + "S.):";
        } else if (data.operation === "1") {
          document.getElementById("auto").checked = false;
          document.getElementById("manual").checked = true;
          document.getElementById("timeInputs").style.display = "none";
          document.getElementById("dayInputs").style.display = "none";
          document.getElementById("setdelay").style.display = "none";
          document.getElementById("textred").style.display = "none";
          document.getElementById("setdelayLabel").style.display = "none";
          document.getElementById("statusWrapper").style.display = "block";
        }
        document.getElementById("timeInputs").innerHTML = "";
        if (data.openTime) {
          createDateTimeInput("openTime", data.openTime);
          document.getElementById("setdelay").value = data.setdelay;
        }
        if (data.closeTime) {
          createDateTimeInput("closeTime", data.closeTime);
        }
        if (data.restartTime) {
          createDateTimeInput("restartTime", data.restartTime);
        }
        var days = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        var Days = data.days;
        days.forEach(function (day, index) {
          var checkbox = document.querySelector(
            'input[name="day[]"][value="' + day + '"]'
          );
          if (checkbox) {
            // เพิ่มการตรวจสอบว่า checkbox ไม่เป็น null ก่อนที่จะใช้งาน
            checkbox.checked = Days[index] === "1";
          }
        });
        var status = data.status;
        var checkbox = document.querySelector('#status input[type="checkbox"]');
        checkbox.checked = status === "ON";
      }
    })
    .catch((error) => console.error("Error fetching data:", error));
}

function createDateTimeInput(id, time) {
  const input = document.createElement("input");
  input.type = "time";
  input.value = time;
  input.id = id;
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = id + ": ";
  const container = document.getElementById("timeInputs");
  container.appendChild(label);
  container.appendChild(input);
}
