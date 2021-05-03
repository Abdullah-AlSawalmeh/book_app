"use strict";

// Application Dependencies
require("dotenv").config();
const express = require("express");
const superagent = require("superagent");

// Application Setups
const PORT = process.env.PORT || 3030;
const server = express();
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static("./public"));

//localhost:3000/
server.get("/hello", (req, res) => {
  // res.send('home route');
  res.render("./pages/index");
});

server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
