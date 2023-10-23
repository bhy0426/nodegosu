"use strict";

const express = require("express");
const router = express.Router();

const ctrl = require("./home.ctrl");

router.get("/", ctrl.GET.root);
router.get("/login", ctrl.GET.login);
router.post("/login", ctrl.POST.login);


module.exports = router;