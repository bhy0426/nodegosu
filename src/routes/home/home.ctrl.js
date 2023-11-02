"use strict";

const express = require("express");
const db = require("../../models/db");
const table = require("../../models/UserStorage");
let s_token = 0;

const GET = {
    // GET/root
    root: (req, res) => {
        res.render("index");
    },

    // GET/login
    login: (req, res) => {
        db.query('SELECT * FROM Login_TB', (err, rows) => {
            if (err) throw err;
            table.tb_login = JSON.parse(JSON.stringify(rows));
            console.log(table.tb_login);
            res.send(table.tb_login);
        });
    },

    // GET/signup
    // tb_login Login_TB 내용 저장
    // tb_member에 Member_TB 내용 저장
    // tb_manSeq에 행 수 저장
    signup: (req, res) => {
        res.send("여기는 회원가입입니다.");
        // tb_login Login_TB 내용 저장
        db.query('SELECT * FROM Login_TB', (err, rows) => {
            if (err) throw err;
            table.tb_login = JSON.parse(JSON.stringify(rows));
            console.log(table.tb_login);
        });
        // tb_member에 Member_TB 내용 저장
        db.query('SELECT * FROM Member_TB', (err, rows) => {
            if (err) throw err;
            table.tb_member = JSON.parse(JSON.stringify(rows));
            console.log(table.tb_member);
        });
        // tb_manSeq에 행 수 저장
        db.query('SELECT COUNT(*) AS count FROM Member_TB', (err, row) => {
            if (err) throw err;
            table.pk_memManSeq = JSON.parse(JSON.stringify(row))[0].count;
            console.log(table.pk_memManSeq);
        });
    },


};

const POST = {
    // POST/login
    login: (req, res) => {
        console.log(req.body);
        console.log(table.tb_login)
        // -1 : 요청 성공
        // 1 : ID를 찾을 수 없음
        // 2 : ID에 대응하는 PW를 찾을 수 없음
        // 3 : 토큰에 일치하는 사용자를 찾을 수 없음
        let detail_code = 0, token;
        const id_client = req.body.id,
            pw_client = req.body.pw;

        db.query("SELECT member_manageSeq FROM Member_TB Where id ='" + id_client + "'",
            (err, row) => {
                if (err) throw err;
                console.log(row[0].member_manageSeq);


                let sqlrun = "SELECT * FROM Login_TB WHERE id='" + id_client + "'";
                db.query(sqlrun, (err, result) => {
                    if (err) throw err;
                    var data = JSON.parse(JSON.stringify(result));
                    console.log(data[0]);
                    if (data[0] != null) {
                        if (data[0].id == id_client) {
                            if (data[0].pw == pw_client) {
                                console.log("로그인 성공");
                                detail_code = -1;
                                token = row[0].member_manageSeq;
                                s_token = token;
                            }
                            else {
                                console.log("비밀번호가 일치하지 않습니다.");
                                detail_code = 2;
                                token = null;
                            }
                        }
                        else {
                            console.log("아이디가 일치하지 않습니다.");
                            detail_code = 1;
                            token = null;
                        }
                    }
                    else {
                        console.log("DB에 존재하지 않는 아이디입니다.");
                        detail_code = 2;
                        token = null;
                    }
                    // 로그인 결과를 res.json으로 반환
                    res.json({
                        "detailCode": detail_code,
                        "data": {
                            "token": token
                        }
                    });
                });
            });

    },
    // POST/signup
    signup: (req, res) => {
        console.log(req.body);

        // -1 : 요청 성공
        // 11 : 이미 존재하는 ID
        // 12 : 이미 존재하는 닉네임
        var detail_code = 0;
        console.log(table.pk_memManSeq);
        const id_client = req.body.id,
            pw_client = req.body.pw,
            name_client = req.body.name,
            nickname_client = req.body.nickname,
            email_client = req.body.email;

        let sqlrun = "SELECT * FROM Member_TB WHERE id='" + id_client + "'";

        db.query(sqlrun, (err, row) => {
            if (err) throw err;
            // 이미 존재하는 아이디가 있으면
            if (row[0] != null) {
                detail_code = 11;
                console.log("이미 동일한 아이디가 존재합니다.");
            }
            else {
                db.query("SELECT * FROM Member_TB WHERE nickname='" + nickname_client + "'", (err, row) => {
                    if (err) throw err;
                    // 이미 존재하는 닉네임이 있으면
                    if (row[0] != null) {
                        console.log("이미 동일한 닉네임이 존재합니다.");
                        detail_code = 12;
                    }
                    else {
                        // 회원가입과 동시에 모든 테이블에 유저 데이터 작성
                        // Login_TB에 id, pw 저장
                        db.query('INSERT INTO Login_TB (id, pw) VALUES (?, ?)',
                            [id_client, pw_client],
                            (err) => {
                                if (err) throw err;
                                console.log("Login_TB 내용 작성 성공");
                            });
                        // Member_TB에 memManSeq, id, name, nickname, email 저장
                        db.query('INSERT INTO Member_TB (member_manageSeq, id, name, nickname, email) VALUES (?, ?, ?, ?, ?)',
                            [table.pk_memManSeq + 1, id_client, name_client, nickname_client, email_client],
                            (err) => {
                                if (err) throw err;
                                console.log("Member_TB 내용 작성 성공");
                            });
                        // Goal_TB에 goalManSeq, memManSeq, goal_time, deposit, goal_period 저장
                        db.query('INSERT INTO Goal_TB (goal_manageSeq, member_manageSeq, goal_time, deposit, goal_period) VALUES (?, ?, ?, ?, ?)',
                            [table.pk_memManSeq + 1, table.pk_memManSeq + 1, 0, 0, 0],
                            (err) => {
                                if (err) throw err;
                                console.log("Goal_TB 내용 작성 성공");
                            });
                        // Calendar_TB에 result, goalManSeq, memManSeq 저장
                        db.query('INSERT INTO Calendar_TB (success, fail, goal_manageSeq, member_manageSeq) VALUES (?, ?, ?, ?)',
                            [0, 0, table.pk_memManSeq + 1, table.pk_memManSeq + 1],
                            (err) => {
                                if (err) throw err;
                                console.log("Calendar_TB 내용 작성 성공");
                            });
                        // Ranking_TB에 memManSeq, time 저장
                        db.query('INSERT INTO Ranking_TB (member_manageSeq, time) VALUES (?, ?)',
                            [table.pk_memManSeq + 1, 0],
                            (err) => {
                                if (err) throw err;
                                console.log("Ranking_TB 내용 작성 성공");
                            });
                        // SubGoal_TB에 subGoal, goal_manageSeq, member_manageSeq 저장
                        db.query('INSERT INTO SubGoal_TB (subGoal, goal_manageSeq, member_manageSeq) VALUES (?, ?, ?)',
                            [null, table.pk_memManSeq + 1, table.pk_memManSeq + 1],
                            (err) => {
                                if (err) throw err;
                                console.log("SubGoal_TB 내용 작성 성공");
                            });
                        // Timer_TB에 member_manageSeq, time 저장
                        db.query('INSERT INTO Timer_TB (member_manageSeq, time) VALUES (?, ?)',
                            [table.pk_memManSeq + 1, 0],
                            (err) => {
                                if (err) throw err;
                                console.log("Timer_TB 내용 작성 성공");
                            });
                        // Todolist_TB에 todolist, member_manageSeq 저장
                        db.query('INSERT INTO Todolist_TB (todolist, member_manageSeq) VALUES (?, ?)',
                            [null, table.pk_memManSeq + 1],
                            (err) => {
                                if (err) throw err;
                                console.log("Todolist_TB 내용 작성 성공");
                                console.log("회원가입 성공");
                                detail_code = -1;
                            });
                    }
                });
            }
            res.json({
                "detailCode": detail_code,
                "data": null
            });
        });
    },

    // POST/user/emptytimer
    // Goal_TB에 
    emptytimer: (req, res) => {
        let detail_code,
            token = req.body.token;
        // tb_member에 Member_TB 내용 저장
        db.query('SELECT * FROM Member_TB', (err, rows) => {
            if (err) throw err;
            table.tb_member = JSON.parse(JSON.stringify(rows));
            console.log(table.tb_member);
        });

        // 클라이언트 토큰과 일치하는 관리 번호를 가진 Goal_TB의 레코드의 goal_time이 0이면
        if (token == s_token) {
            detail_code = -1;
            console.log("토큰 확인 성공");
            // Ranking_TB에서 총 타이머 시간을 불러옴
            db.query("SELECT time FROM Ranking_TB WHERE member_manageSeq='" + s_token + "'", (error, time) => {
                if (error) throw error;
                // Goal_TB에 목표가 존재하는지 확인
                db.query("SELECT goal_time FROM Goal_TB WHERE member_manageSeq='" + s_token + "'", (err, goalTime) => {
                    if (err) throw err;
                    // console.log(goalTime[0].goal_time);
                    let goal = false;
                    let name = table.tb_member[s_token - 1].name;
                    let timer = time[0].time;

                    // 목표가 존재하는지
                    goal = goalTime[0].goal_time != '0' ? true : false;
                    //console.log(goalTime[0].goal_time);

                    res.json({
                        "detailCode": detail_code,
                        "data": {
                            "goal": goal,
                            "me": [name, timer]
                        }
                    });
                });
            });
        }
        else {
            console.log("토큰이 올바르지 않습니다.");
            detail_code = 0;
            res.json({
                "detailCode": detail_code,
                "data": null
            });
        }
    },

    // POST/user/timer/goalsetting
    // Goal_TB에 설정한 목표 추가
    goalsetting: (req, res) => {
        let detail_code;
        let token = req.body.token,
            period = req.body.period,
            dayPeriod = req.body.dayPeriod,
            money = req.body.money;

        if (token == s_token) {
            console.log("토큰 확인 성공");
            db.query("UPDATE Goal_TB SET goal_period = '" + period + "', " + "goal_time = '" + dayPeriod + "', " + "deposit = '" + money + "'" + " WHERE goal_manageSeq = " + token,
                [token, token, dayPeriod, money, period],
                (err) => {
                    if (err) throw err;
                    console.log("Goal_TB 내용 작성 성공");
                    detail_code = -1;

                    res.json({
                        "detail_code": detail_code,
                        "data": null
                    });
                });
        }
        else {
            console.log("토큰이 일치하지 않습니다.");
            detail_code = 0;

            res.json({
                "detail_code": detail_code,
                "data": null
            });
        }
    },

    // POST/user/timer
    // Time_TB에서 오늘 타이머를 불러옴
    timer: (req, res) => {
        let detail_code,
            token = req.body.token;

        if (token == s_token) {
            console.log("토큰 확인 성공");
            db.query("SELECT time FROM Timer_TB WHERE member_manageSeq = '" + token + "'", (err, row) => {
                if (err) throw err;
                detail_code = -1;
                res.json({
                    "detail_code": detail_code,
                    "data": {
                        "timer": row[0].time
                    }
                });
            });
        }
        else {
            console.log("토큰이 일치하지 않습니다.");
            detail_code = 0;
            res.json({
                "detail_code": detail_code,
                "data": null
            });
        }
    },

    // POST/user/timer/stop
    // 현재까지의 타이머 데이터를 Timer_TB에 저장
    timer_stop: (req, res) => {
        let detail_code,
            token = req.body.token,
            timer = req.body.timer;

        if (token == s_token) {
            console.log("토큰 확인 성공");
            db.query("UPDATE Timer_TB SET time = '" + timer + "'" + " WHERE member_manageSeq = " + token, (err) => {
                if (err) throw err;
                console.log("Timer_TB 내용 작성 성공");
                detail_code = -1;
                res.json({
                    "detail_code": detail_code,
                    "data": null
                });
            });
        }
        else {
            console.log("토큰이 일치하지 않습니다.");
            detail_code = 0;
            res.json({
                "detail_code": detail_code,
                "data": null
            });
        }
    },

    // POST/user/calendar
    // 캘린더 페이지는 종료 혹은 24시간 이후 저장되기 때문에 프론트에서 메모리에 데이터를 계속 저장해두어야 함
    calendar: (req, res) => {
        let detail_code,
            token = req.body.token;

        if (token == s_token) {
            console.log("토큰 확인 성공");
            db.query("SELECT subGoal FROM SubGoal_TB WHERE member_manageSeq=" + token, (err, subGoal) => {
                if (err) throw err;
                db.query("SELECT todolist_value, todolist_bool FROM Todolist_TB WHERE member_manageSeq=" + token, (err, todolist) => {
                    if (err) throw err;
                    db.query("SELECT success, fail FROM Calendar_TB WHERE member_manageSeq=" + token, (err, result) => {
                        if (err) throw err;
                        detail_code = -1;
                        let todolist_list = [todolist[0].todolist_bool, todolist[0].todolist_value];
                        console.log(result[0]);
                        res.json({
                            "detail_code": detail_code,
                            "data": {
                                "myGoal": subGoal[0].subGoal,
                                "todolist": todolist_list,
                                "success": result[0].success,
                                "fail": result[0].fail
                            }
                        });
                    });
                });
            });
        }
        else {
            console.log("토큰이 일치하지 않습니다.");
            detail_code = 0;
            res.json({
                "detail_code": detail_code,
                "data": null
            });
        }
    },

    // POST/user/save
    // 24시 이후 혹은 어플 종료 시 데이터 저장 요청
    save: (req, res) => {
        let detail_code,
            token = req.body.token,
            // SubGoal_TB
            myGoal = req.body.myGoal,
            // Todolist_TB
            todolist = [req.body.todolist.bool, req.body.todolist.bool];
        // Ranking_TB
        timer = req.body.timer;

        if (token == s_token) {
            console.log("토큰 확인 성공");

        }
        else {
            console.log("토큰이 일치하지 않습니다.");
            detail_code = 0;
            res.json({
                "detail_code": detail_code,
                "data": null
            });
        }
    },

};

module.exports = {
    GET,
    POST,
};