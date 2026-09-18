const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    port: process.env.Db_port,
    database: process.env.Db_name,
    user: process.env.Db_user,
    password: process.env.Db_password,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


module.exports = { db };