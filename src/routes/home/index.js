"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

// GET
router.get("/", ctrl.GET.root);
router.get("/login", ctrl.GET.login);
router.get("/signup", ctrl.GET.signup);
// POST
router.post("/login", ctrl.POST.login);
router.post("/signup", ctrl.POST.signup);
router.post("/user/timer", ctrl.POST.timer);


module.exports = router;