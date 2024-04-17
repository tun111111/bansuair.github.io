function formatTime(rawTime) {
  var date = new Date(rawTime);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var formattedTime = [
    (hours < 10 ? "0" : "") + hours,
    (minutes < 10 ? "0" : "") + minutes,
  ].join(":");
  return formattedTime;
}

function getDataFromSheet() {
  var spreadsheetName = "Device1";
  var sheetId = "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI";
  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(spreadsheetName);

  var data = {
    operation: sheet.getRange("A2").getValue(),
    status: sheet.getRange("B2").getValue(),
    openTime: formatTime(sheet.getRange("C2").getValue()),
    closeTime: formatTime(sheet.getRange("D2").getValue()),
    restartTime: formatTime(sheet.getRange("E2").getValue()),
    days: [],
  };

  for (var i = 0; i < 7; i++) {
    var dayValue = sheet.getRange("F" + (2 + i)).getValue();
    if (dayValue) {
      data.days.push(dayValue);
    }
  }
  return JSON.stringify(data);
}

function getData() {
  var ss = SpreadsheetApp.openById(
    "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI"
  ).getSheetByName("date");
  var values = ss.getDataRange().getDisplayValues();
  var result = values.map(([a, b]) => {
    return { Detail: a, Status: b };
  });
  return result;
}

function handleCreateSheet(sheetname) {
  if (sheetname) {
    if (createSheet(sheetname)) {
      return ContentService.createTextOutput(
        "เพิ่มหน้า Sheet แล้ว"
      ).setMimeType(ContentService.MimeType.TEXT);
    } else {
      return ContentService.createTextOutput(
        "!สร้างName Sheet ซ้ำกรุณาเปลี่ยนชื่อ Sheet!"
      ).setMimeType(ContentService.MimeType.TEXT);
    }
  } else {
    return ContentService.createTextOutput(
      "Invalid parameters for creating sheet."
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleLogin(username, password) {
  if (username && password) {
    if (checkCredentials(username, password)) {
      return ContentService.createTextOutput(
        "กรอก username or password ถูกต้อง"
      ).setMimeType(ContentService.MimeType.TEXT);
    } else {
      return ContentService.createTextOutput(
        "Invalid username or password"
      ).setMimeType(ContentService.MimeType.TEXT);
    }
  } else {
    return ContentService.createTextOutput(
      "Invalid parameters for login."
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleGetSheetList() {
  var allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheetNames = allSheets.map(function (sheet) {
    if (sheet.getName() !== "UserCredentials" && sheet.getName() !== "date") {
      return sheet.getName();
    }
  });
  var filtered = sheetNames.filter(function (el) {
    return el;
  });
  var response = filtered.join(",");
  return ContentService.createTextOutput(response).setMimeType(
    ContentService.MimeType.TEXT
  );
}

function checkCredentials(username, password) {
  var sheet = SpreadsheetApp.openById(
    "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI"
  ).getSheetByName("UserCredentials");
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password) {
      return true;
    }
  }

  return false;
}

function createSheet(sheetname) {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Check if the sheetname already exists
  var existingSheet = activeSpreadsheet.getSheetByName(sheetname);
  if (existingSheet) {
    Logger.log('Sheet with the name "' + sheetname + '" already exists.');
    return false;
  }

  // If the sheetname does not exist, proceed to create the sheet
  if (sheetname) {
    var newSheet = activeSpreadsheet.insertSheet(sheetname);
    var sheetId = newSheet.getSheetId();

    // Add headers in the new sheet
    var headers = [
      "TIME",
      "WEEK",
      "MODE",
      "STATUS",
      "START",
      "REBOOT",
      "ONLINE",
    ];
    newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    var spreadsheetUrl = activeSpreadsheet.getUrl();
    var sheetUrl = spreadsheetUrl + "#gid=" + sheetId;
    Logger.log("เพิ่มหน้า Sheet แล้ว " + sheetUrl);
    return true;
  } else {
    Logger.log("Invalid parameters for creating sheet.");
    return false;
  }
}

function handleDeleteSheet(sheetname) {
  if (sheetname) {
    if (deleteSheet(sheetname)) {
      return ContentService.createTextOutput("ลบ Sheet แล้ว").setMimeType(
        ContentService.MimeType.TEXT
      );
    } else {
      return ContentService.createTextOutput(
        "Failed to delete sheet."
      ).setMimeType(ContentService.MimeType.TEXT);
    }
  } else {
    return ContentService.createTextOutput(
      "Invalid parameters for deleting sheet."
    ).setMimeType(ContentService.MimeType.TEXT);
  }
}

function deleteSheet(sheetname) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetname);
  if (sheet) {
    spreadsheet.deleteSheet(sheet);
    return true;
  } else {
    Logger.log("Sheet not found.");
    return false;
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var sheetname = e.parameter.sheetname;
  var username = e.parameter.username;
  var password = e.parameter.password;
  if (action === "createSheet") {
    return handleCreateSheet(sheetname);
  } else if (action === "login") {
    return handleLogin(username, password);
  } else if (action === "deleteSheet") {
    return handleDeleteSheet(sheetname);
  } else if (action === "getSheetList") {
    return handleGetSheetList();
  } else if (action === "getDataFromSheet") {
    return ContentService.createTextOutput(getDataFromSheet()).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (e.parameter && "date" in e.parameter) {
    var sheet_id = "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI";
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName("date");
    var newRow = sheet.getLastRow() + 1;
    var rowData = [];
    var date = e.parameter["date"];
    var dateObject = JSON.parse(date);
    rowData[1] = dateObject;
    var newRange = sheet.getRange(newRow, 1, 1, rowData.length);
    newRange.setValues([rowData]);
    var additionalData = getData();
    var jsonResponse = {
      status: "success",
      message: "Data added successfully",
      data: rowData,
      additionalData: additionalData,
    };
    return ContentService.createTextOutput(
      JSON.stringify(jsonResponse)
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (e.parameter && "rowToDelete" in e.parameter) {
    return doDelete(e);
  } else if (e.parameter && "deleteAll" in e.parameter) {
    var sheet_id = "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI";
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName("date");
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var range = sheet.getRange(2, 2, lastRow - 1, 1);
      range.clearContent();

      var jsonResponse = {
        status: "success",
        message: "All data in column B deleted successfully",
      };
    } else {
      var jsonResponse = {
        status: "success",
        message: "No data in column B to delete",
      };
    }
    return ContentService.createTextOutput(
      JSON.stringify(jsonResponse)
    ).setMimeType(ContentService.MimeType.JSON);
  } else {
    var allData = getData();
    var jsonResponse = {
      status: "success",
      message: "All data retrieved successfully",
      data: allData,
    };
    return ContentService.createTextOutput(
      JSON.stringify(jsonResponse)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
function doPost(e) {
  var operation = e.parameter.operation;
  var status = e.parameter.status;
  var openTime = e.parameter.open_time;
  var closeTime = e.parameter.close_time;
  var restartTime = e.parameter.restart_time;
  var days = e.parameter.day.split(",");

  var spreadsheetName = "Device1";
  var sheetId = "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI";

  var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(spreadsheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }

  sheet.getRange("A2").setValue(operation);
  sheet.getRange("B2").setValue(status);
  sheet.getRange("C2").setValue(openTime);
  sheet.getRange("D2").setValue(closeTime);
  sheet.getRange("E2").setValue(restartTime);

  for (var i = 0; i < days.length && i < 7; i++) {
    sheet.getRange("F" + (2 + i)).setValue(days[i]);
  }

  return ContentService.createTextOutput("Success").setMimeType(
    ContentService.MimeType.TEXT
  );
}
function doDelete(e) {
  if (e.parameter && "rowToDelete" in e.parameter) {
    var sheet_id = "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI"; // Spreadsheet ID
    var sheet = SpreadsheetApp.openById(sheet_id).getSheetByName("date");
    var rowToDelete = parseInt(e.parameter["rowToDelete"]);
    if (!isNaN(rowToDelete) && rowToDelete > 0) {
      sheet.deleteRow(rowToDelete);

      var jsonResponse = {
        status: "success",
        message: "Row deleted successfully",
        deletedRow: rowToDelete,
      };

      return ContentService.createTextOutput(
        JSON.stringify(jsonResponse)
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      var jsonResponse = {
        status: "error",
        message: "Invalid rowToDelete parameter",
      };

      return ContentService.createTextOutput(
        JSON.stringify(jsonResponse)
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    var jsonResponse = {
      status: "error",
      message: "Missing rowToDelete parameter",
    };

    return ContentService.createTextOutput(
      JSON.stringify(jsonResponse)
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
