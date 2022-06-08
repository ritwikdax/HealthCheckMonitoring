const express = require("express");
var apiData = require("./util/formatData");
const app = express();
const port = process.env.PORT || 5000;
const path = require("path");

const myLogger = function (req, res, next) {
  console.log("LOGGED");
  //console.log(req);
  next();
};

app.use(myLogger);
app.use(express.static("public"));

/*-------Roting-------------------*/
//index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

//api
app.get("/status-report", (req, res) => {
  res.json(apiData.statusReport);
});
app.get("/alerts", (req, res) => {
  res.json(apiData.alertsData);
});
app.get("/report", (req, res) => {
  res.json();
});
app.get("/service-status", (req, res) => {
  res.json(apiData.data);
});
app.get("/stakeholders", (req, res) => {
  res.json(apiData.stakeholders);
});
app.get("/server", (req, res) => {
  let hostname = req.query.hostname;
  res.json(apiData.mapData.get(hostname));
});

app.get("/all-servers", (req, res) => {
  res.json(apiData.allServers);
});

const reloadModule = (req, res, next) => {
  delete require.cache[require.resolve("./util/formatData")];
  apiData = require("./util/formatData");
  next();
};

app.get("/reload", reloadModule, (req, res) => {
  res.redirect("/");
});

//app.get("/get-data", getDataRouter);

//Middleware

app.listen(port, () => {
  console.log("Server Started");
});
