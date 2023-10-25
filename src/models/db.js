const app = require("../../web");
const mysql = require('mysql');

const options = {
    host: 'buckitlab.cafe24app.com',
    user: 'buckitlab',
    password: 'buck0329!!',
    database: 'buckitlab',
    port: '3306',
};

// 연결할 DB 정보입력
const db = mysql.createConnection(options);

// 데이터베이스 연결
db.connect();

module.exports = db;