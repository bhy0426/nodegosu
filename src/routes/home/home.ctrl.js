"use strict";

const { json } = require("express");
const db = require("../../models/db");
const table = require("../../models/UserStorage");

const GET = {
    root: (req, res) => {
        res.render("index");
    },

    login: (req, res) => {
        res.send("여기는 로그인입니다.");
        db.query('SELECT * FROM Login_TB', (error, rows) => {
            if (error) throw error;

            table.tb_login = JSON.parse(JSON.stringify(rows));
            console.log(table.tb_login);
        });
    },
};

const POST = {
    login: (req, res) => {
        console.log(req.body);

        // -1 : 요청 성공
        // 1 : ID를 찾을 수 없음
        // 2 : ID에 대응하는 PW를 찾을 수 없음
        // 3 : 토큰에 일치하는 사용자를 찾을 수 없음
        var detail_code = 0, token;
        const id_client = req.body.id,
            pw_client = req.body.pw;

        let sqlrun = "SELECT * FROM Login_TB WHERE id='" + id_client + "'";
        db.query(sqlrun, (error, result) => {
            if (error) throw error;
            var data = JSON.parse(JSON.stringify(result));
            console.log(data);
            if (data != null) {
                //console.log("row.id : " + result[0].id);
                if (data.id == id_client) {
                    //console.log("아이디 찾기 성공");
                    if (data.pw == pw_client) {
                        console.log("로그인 성공");
                        detail_code = -1;
                        token = "success";
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
    },
};

module.exports = {
    GET,
    POST,
};