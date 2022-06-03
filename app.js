const express = require("express");
const app = express();
const port = 3000;
const path = require("path");

const myLogger = function (req, res, next) {
  console.log("LOGGED");
  //console.log(req);
  next();
};

app.use(myLogger);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

//Middleware

app.listen(port, () => {
  console.log("Server Started");
});
