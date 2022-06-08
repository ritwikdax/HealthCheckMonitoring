//Selecting Elements
const ctx = document.getElementById("myChart").getContext("2d");
const lastChecked = document.getElementById("last-checked");
const totalServer = document.getElementById("total-servers");
const critical = document.getElementById("critical-alerts");
const warning = document.getElementById("warning");
const alertContent = document.getElementById("all-alerts");
const serverDetail = document.getElementById("server-detail");

const base = window.location.origin;

//Hide All Elements
$(document).ready($("#main-content").hide());

//Rendering Chart
const chartData = {
  labels: ["Critical", "Warning", "Communication Error", "Health OK"],
  datasets: [
    {
      label: "My First Dataset",
      data: [],
      backgroundColor: ["#f00039", "#ed7245", "#F4A45A", "#27D0BA"],
      hoverOffset: 4,
    },
  ],
};

const config = {
  type: "doughnut",
  data: chartData,
};

const myChart = new Chart(ctx, config);

//Rendering Data
//Loading Status Report
$(document).ready(
  $.get(`${base}/status-report`, function (data) {
    console.log(data.totalServer);
    totalServer.innerHTML = data.totalServer;
    critical.innerHTML = data.criticalAlert;
    warning.innerHTML = data.warningAlert;
    lastChecked.innerHTML = `Report Date: ` + data.lastChecked;
    chartData.datasets[0].data.push(data.criticalAlert);
    chartData.datasets[0].data.push(data.warningAlert);
    chartData.datasets[0].data.push(data.commError);
    chartData.datasets[0].data.push(
      data.totalServer -
        (data.warningAlert + data.commError + data.criticalAlert)
    );
    myChart.update();
  })
);

//$("#refresh").click((window.location.href = `${base}/reload`));
$(document).ready(function () {
  $("#fetch-new").click(function () {
    console.log("Button Clicked");
    window.location.href = `${base}/reload`;
  });
});

$(document).ready(function () {
  $.get(`${base}/alerts`, function (data) {
    let temp = `
    <h3>Alerts Details</h3>
    <table>
              <tr>
                <th>No.</th>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>Message</th>
                <th>Status</th>
                <th>Role & Owner</th>
              </tr>
    `;
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let srNo = 1;
      temp += `<tr onClick="fetchServerDetails('${item.hostname}')">
      <td>${srNo}</td>
      <td>${item.hostname}</td>
      <td>${item.ip}</td>
      <td>${item.message}</td>
      <td><span class="${item.status}">${item.status}</span></td>
      <td>Role: ${item.role} & Owner: ${item.owner}</td>
      </tr>`;
    }

    temp += `</table>`;
    alertContent.innerHTML = temp;
  });
});

//All AJAX Call finished executing
$(document).ajaxStop(function () {
  $(".loading").hide();
  $("#main-content").fadeIn();
  // place code to be executed on completion of last outstanding ajax call here
});

//Fetch Server Details
function fetchServerDetails(hostname) {
  console.log(hostname);
  $.get(`${base}/server/?hostname=${hostname}`, function (data) {
    renderServerDetails(data);
  });
}

function renderServerDetails(data) {
  let process = "";
  for (let x in data.topProcesses) {
    process += `${x.Name}, `;
  }
  let temp = "";
  /*
  <tr>
              <th>Name:</th>
              <td>Bill Gates</td>
            </tr>
  */
  temp += `<tr><th>Hostname: </th><td>${data.hostname}</td></tr>`;
  temp += `<tr><th>Ip Address: </th><td>${data.ip}</td></tr>`;
  temp += `<tr><th>Domain: </th><td>${data.domain}</td></tr>`;
  temp += `<tr><th>OS: </th><td>${data.os}</td></tr>`;
  temp += `<tr><th>Role: </th><td>${data.role}</td></tr>`;
  temp += `<tr><th>Owner: </th><td>${data.owner}</td></tr>`;
  temp += `<tr><th>CPU Core: </th><td>${data.core} (${data.cpuUtil} % Utilized)</td></tr>`;
  temp += `<tr><th>RAM: </th><td>${data.ramSize / (1024 * 1024)}</td></tr>`;
  temp += `<tr><th>Up Time: </th><td>${data.upTime.Days} Day(s)-${data.upTime.Hours} Hour(s)</td></tr>`;
  temp += `<tr><th>Top Process: </th><td>${process}</td></tr>`;

  serverDetail.innerHTML = temp;
}
