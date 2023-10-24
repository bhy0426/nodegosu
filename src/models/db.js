const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
    host: 'buckitlab.cafe24app.com',
    user: 'buckitlab',
    password: 'buck0329!!',
    database: 'buckitlab',
    port: '3306',
};

// 연결할 DB 정보입력
const db = mysql.createConnection(options);
const sessionStore = new MySQLStore(options);

app.use(
    session({
        key: "session_cookie_name",
        secret: "session_cookie_secret",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
    })
);

// 데이터베이스 연결
db.connect();

// SHOW 쿼리문 사용
// db.query('SHOW TABLES', (error, results) => {
//     if (error) throw error;
//     console.log(results);
// })

// 연결 종료
// db.end();

// 모듈로 내보내기
module.exports = db;