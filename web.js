"use strict";

const express = require("express");
const app = express();
const home = require("./src/routes/home");
const PORT = 8001;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')
app.use(express.static(`${__dirname}/src/public`));
app.use(express.json());
app.use("/", home);

app.get('/', (req, res) => {
    res.render('index')
  })
  
app.listen(PORT, () => {
    console.log("서버 가동");
});

module.exports = app;