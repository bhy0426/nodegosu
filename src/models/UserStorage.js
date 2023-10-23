'use strict';

const db = require("./db");

// 테이블 객체
let tb_login;
let tb_member;
// 회원 관리 번호(Member_TB 기본키)
let tb_manSeq;

module.exports = {
    tb_login,
    tb_member,
    tb_manSeq
};