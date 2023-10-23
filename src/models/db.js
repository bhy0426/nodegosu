const mysql = require('mysql');

// 연결할 DB 정보입력
const db = mysql.createConnection({
    host: 'buckitlab.cafe24app.com',
    user: 'buckitlab',
    password: 'buck0329!!',
    database: 'buckitlab',
    port: '3306',
});

// 데이터베이스 연결
db.connect();

// SHOW 쿼리문 사용
db.query('SHOW TABLES', (error, results) => {
    if (error) throw error;
    console.log(results);
})

// 연결 종료
// db.end();

// 모듈로 내보내기
module.exports = db;