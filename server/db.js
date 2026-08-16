const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "K@vi14@mbi99",
  database: "charge_mentale",
});

module.exports = pool;