var SS = SpreadsheetApp.openById(
  "14rEh9RDQq0D4dkZ6XZXRtnpJ70X_aHxSbsMItNWffXI"
);
var sheet_workend = SS.getSheetByName("Workend");
var sheet_login = SS.getSheetByName("Login");

function doGet(e) {
  var action = e.parameter.action;
  var sheetname = e.parameter.sheetname;
  var sheet_name = e.parameter.sheet;
  var workend = e.parameter.workend;
  var device = e.parameter.device;

  if (action === "createSheet") {
    return handleCreateSheet(sheetname);
  } else if (action === "deleteSheet") {
    return handleDeleteSheet(sheetname);
  } else if (action === "getSheetList") {
    return handleGetSheetList();
  } else if (action === "getDataFromSheet") {
    return ContentService.createTextOutput(
      getDataFromSheet(sheet_name)
    ).setMimeType(ContentService.MimeType.JSON);
  } else if (workend !== undefined) {
    var workendData = sheet_workend.getRange("A1:A20").getValues();
    var json = {
      WORKEND: workendData,
    };
    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (device !== undefined) {
    var sheet_device = SS.getSheetByName(device);
    var timeON = sheet_device.getRange("A2").getValue();
    var timeOFF = sheet_device.getRange("A3").getValue();
    var reboot = sheet_device.getRange("B2").getValue();
    var week = sheet_device.getRange("C2:C8").getValues();
    var mode = sheet_device.getRange("D2").getValue();
    var status = sheet_device.getRange("E2").getValue();
    var statusReboot = sheet_device.getRange("G2").getValue();
    var delay = sheet_device.getRange("I2").getValue();
    var json = {
      ON: timeON,
      OFF: timeOFF,
      REBOOT: reboot,
      STATUS: status,
      WEEK: week,
      MODE: mode,
      SREBOOT: statusReboot,
      DELAY: delay,
    };
    return ContentService.createTextOutput(JSON.stringify(json)).setMimeType(
      ContentService.MimeType.JSON
    );
  } else if (e.parameter && "date" in e.parameter) {
    var newRow = sheet_workend.getLastRow() + 1;
    var rowData = [];
    var date = e.parameter["date"];
    var dateObject = JSON.parse(date);
    rowData[0] = dateObject;
    var newRange = sheet_workend.getRange(newRow, 1, 1, rowData.length);
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
    var lastRow = sheet_workend.getLastRow();
    if (lastRow > 1) {
      sheet_workend.getDataRange().clearContent();
      var jsonResponse = {
        status: "success",
        message: "All data deleted successfully",
      };
    } else {
      var jsonResponse = {
        status: "success",
        message: "No data in sheet",
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
  var parsedData;
  try {
    parsedData = JSON.parse(e.postData.contents);
  } catch (f) {
    return ContentService.createTextOutput(
      "Error in parsing request body: " + f.message
    );
  }
  if (parsedData !== undefined) {
    var flag = parsedData.format;
    if (flag === undefined) {
      flag = 0;
    }

    switch (parsedData.command) {
      case "config":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        tmp.getRange("A2").setValue(parsedData.values.open_time);
        tmp.getRange("A3").setValue(parsedData.values.close_time);
        tmp.getRange("B2").setValue(parsedData.values.restart_time);
        tmp.getRange("D2").setValue(parsedData.values.operation);
        tmp.getRange("E2").setValue(parsedData.values.status);
        tmp.getRange("I2").setValue(parsedData.values.timedelay);
        var days = parsedData.values.day.split(",");
        for (var i = 0; i < days.length && i < 7; i++) {
          tmp.getRange("C" + (2 + i)).setValue(days[i]);
        }
        str = "Success config.";
        SpreadsheetApp.flush();
        break;
      case "status":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        tmp.getRange("E2").setValue(parsedData.values);
        str = "Success update status.";
        SpreadsheetApp.flush();
        break;
      case "start":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        var date = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd HH:mm");
        tmp.getRange("F2").setValue(date);
        str = "Success update start.";
        SpreadsheetApp.flush();
        break;
      case "reboot":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        var date = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd HH:mm");
        tmp.getRange("G2").setValue(date);
        str = "Success update reboot.";
        SpreadsheetApp.flush();
        break;
      case "online":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        var date = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd HH:mm");
        tmp.getRange("H2").setValue(date);
        str = "Success update online.";
        SpreadsheetApp.flush();
        break;
      case "login":
        var tmp = SS.getSheetByName(parsedData.sheet_name);
        var checkUser = checkCredentials(
          tmp,
          parsedData.username,
          parsedData.password
        );
        if (checkUser) {
          str = "Login Success";
        } else {
          str = "Login Failed";
        }
        SpreadsheetApp.flush();
        break;
    }
    return ContentService.createTextOutput(str);
  } // endif (parsedData !== undefined)
  else {
    return ContentService.createTextOutput(
      "Error! Request body empty or in incorrect format."
    );
  }
}

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

function getDataFromSheet(sheet_name) {
  var sheet_device = SS.getSheetByName(sheet_name);
  var data = {
    operation: sheet_device.getRange("D2").getValue(),
    status: sheet_device.getRange("E2").getValue(),
    openTime: sheet_device.getRange("A2").getValue(),
    closeTime: sheet_device.getRange("A3").getValue(),
    restartTime: sheet_device.getRange("B2").getValue(),
    online: sheet_device.getRange("H2").getValue(),
    setdelay: sheet_device.getRange("I2").getValue(),
    days: [],
  };
  for (var i = 0; i < 7; i++) {
    var dayValue = sheet_device
      .getRange("C" + (2 + i))
      .getValue()
      .toString();
    data.days.push(dayValue);
  }
  return JSON.stringify(data);
}

function getData() {
  var workend = sheet_workend.getRange("A1:A20").getValues();
  return workend;
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

function handleGetSheetList() {
  var allSheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheetNames = allSheets.map(function (sheet) {
    if (sheet.getName() !== "Login" && sheet.getName() !== "Workend") {
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

function checkCredentials(sheet, username, password) {
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
  var existingSheet = activeSpreadsheet.getSheetByName(sheetname);
  if (existingSheet) {
    return false;
  }
  if (sheetname) {
    var newSheet = activeSpreadsheet.insertSheet(sheetname);
    var sheetId = newSheet.getSheetId();
    var headers = [
      "TIME ON-OFF",
      "TIME REBOOT",
      "WEEK",
      "MODE",
      "STATUS",
      "START",
      "REBOOT",
      "ONLINE",
      "TIME DELAY (S)",
    ];
    newSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return true;
  } else {
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
    return false;
  }
}

function doDelete(e) {
  if (e.parameter && "rowToDelete" in e.parameter) {
    var rowToDelete = parseInt(e.parameter["rowToDelete"]);
    if (!isNaN(rowToDelete) && rowToDelete > 0) {
      sheet_workend.deleteRow(rowToDelete);
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
