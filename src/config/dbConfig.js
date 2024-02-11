const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.PASSWORD,
  database: "file_upload",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL server: ", err);
  } else {
    // console.log("Connected to MySQL server");
  }
});

module.exports = connection;
