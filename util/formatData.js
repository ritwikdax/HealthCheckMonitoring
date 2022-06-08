const fs = require("fs");
const path = require("path");

//Constants
const UP_TIME_WAR = 30;
const UP_TIME_CRIT = 45;
const MAX_RAM_WAR = 80;
const MAX_RAM_CRIT = 90;
const MAX_CPU_WAR = 70;
const MAX_CPU_CRIT = 80;
const DISK_SPACE_WAR = 15;
const DISK_SPACE_CRIT = 5;

//Raw Report
let rawdata = fs.readFileSync(path.join(__dirname, "../raw/raw-report.json"));
let rawstatusReport = JSON.parse(rawdata);

//Service Status
let rawdata1 = fs.readFileSync(
  path.join(__dirname, "../raw/service-report.json")
);
let data = JSON.parse(rawdata1);

//Stakeholders
let rawdata2 = fs.readFileSync(
  path.join(__dirname, "../raw/stakeholders.json")
);
let stakeholders = JSON.parse(rawdata2);

//Pre Process Raw Data
let mapData = new Map();
rawstatusReport.forEach((item) => {
  mapData.set(item.hostname.toUpperCase(), item);
});

//create alert
function getAlertData(rawstatusReport) {
  let alerts = [];
  let alert = {};
  for (let i = 0; i < rawstatusReport.length; i++) {
    var item = rawstatusReport[i];
    //console.log(item);
    if (item.status == "error") {
      alert.hostname = item.hostname;
      (alert.ip = item.ip),
        (alert.status = "error"),
        (alert.message = `Communication Error for - ${item.hostname}`);
      alert.role = item.role;
      alert.owner = item.owner;
      alerts.push(alert);
      alert = {};
      continue;
    }

    if (item.upTime.Days >= UP_TIME_WAR) {
      alert.hostname = item.hostname;
      (alert.ip = item.ip),
        (alert.status =
          item.upTime.Days >= UP_TIME_CRIT ? "critical" : "warning");
      alert.message = `Server is Up for ${item.upTime.Days} and ${item.upTime.Hours} Hrs.`;
      alert.role = item.role;
      alert.owner = item.owner;
      alerts.push(alert);
      alert = {};
    }

    if (item.ramUtil >= MAX_RAM_WAR) {
      alert.hostname = item.hostname;
      (alert.ip = item.ip),
        (alert.status = item.ramUtil >= MAX_RAM_CRIT ? "critical" : "warning");
      alert.message = `Ram Utilization is high : ${item.ramUtil} %`;
      alert.role = item.role;
      alert.owner = item.owner;
      alerts.push(alert);
      alert = {};
    }

    if (item.cpuUtil >= MAX_CPU_WAR) {
      alert.hostname = item.hostname;
      (alert.ip = item.ip),
        (alert.status = item.ramUtil >= MAX_CPU_CRIT ? "critical" : "warning");
      alert.message = `CPU Utilization is high : ${item.cpuUtil} %`;
      alert.role = item.role;
      alert.owner = item.owner;
      alerts.push(alert);
      alert = {};
    }
    var arr = item.disksData;
    //console.log(arr[0].Caption);

    for (let j = 0; j < arr.length; j++) {
      let disk = arr[j];
      let percent = (disk.FreeSpace / disk.Size) * 100;
      //console.log(percent);
      if (percent <= DISK_SPACE_WAR) {
        percent = Math.round(percent);
        alert.hostname = item.hostname;
        (alert.ip = item.ip),
          (alert.status = percent <= DISK_SPACE_CRIT ? "critical" : "warning");
        alert.message = `<b>${disk.Caption} ${disk.VolumeName}</b> - Drive is running out of space - Free Space - ${percent} %`;
        alert.role = item.role;
        alert.owner = item.owner;
        alerts.push(alert);
        alert = {};
      }
    }
  }
  return alerts;
}

//Final Value Consolidation
let alertsData = getAlertData(rawstatusReport);

let statusReport = {
  totalServer: rawstatusReport.length,
  criticalAlert: 0,
  warningAlert: 0,
  lastChecked: rawstatusReport[0].checkedOn,
  commError: 0,
};

//Update Status Report Value
for (let k = 0; k < alertsData.length; k++) {
  let item = alertsData[k];
  //console.log(item);
  if (item.status == "critical") {
    statusReport.criticalAlert++;
  } else if (item.status == "warning") {
    statusReport.warningAlert++;
  } else if (item.status == "error") {
    statusReport.commError++;
  }
}

//getAllServersDetails
let allServers = [];
function getAllServers() {
  let item = {};
  var server;
  for (let i = 0; i < rawstatusReport.length; i++) {
    server = rawstatusReport[i];
    //console.log(server);
    item.hostname = server.hostname;
    item.ip = server.ip;
    item.role = server.role;
    item.owner = server.owner;
    allServers.push(item);
    item = {};
  }
}
getAllServers();

console.log("Data Processed");

module.exports = {
  statusReport,
  alertsData,
  mapData,
  stakeholders,
  allServers,
};
