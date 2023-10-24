'use strict';

const db = require("./db");

// 테이블 객체
let tb_login;
let tb_member;
// 회원 관리 번호(Member_TB 기본키)
let tb_memManSeq;
// 목표 관리 번호(Goal_TB 기본키)
let tb_goalManSeq;
module.exports = {
    tb_login,
    tb_member,
    tb_memManSeq,
    tb_goalManSeq
};