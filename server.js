const cors = require("cors");
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
require("dotenv").config();
require("./src/config/dbConfig");

global.__basedir = __dirname;

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(fileUpload())

const initRoutes = require("./src/routes");

app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let port = 8080;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
