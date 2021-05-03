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

// Constructors
function Book(gData) {
  this.image =
    this.addSInHttp(gData.volumeInfo.imageLinks?.thumbnail) ||
    "https://i.imgur.com/J5LVHEL.jpg";
  this.title = gData.volumeInfo.title || "No data";
  this.author =
    gData.volumeInfo?.authors !== undefined
      ? gData.volumeInfo?.authors[0]
      : "No data";
  this.description = gData.volumeInfo.description || "No data";
}
Book.prototype.addSInHttp = function (link) {
  if (/https/.test(link)) {
    console.log("pass");
  } else {
    let newLink = /http/.test(link) ? link.replace("http", "https") : undefined;
    return newLink;
  }
};

//localhost:3001/searches/new
server.get("/searches/new", (req, res) => {
  // res.send('home route');
  res.render("./pages/searches/new");
});
//localhost:3001/searches
server.post("/searches", (req, res) => {
  // res.send('home route');
  let keyword = req.body.keyword;
  let radio = req.body.choice;
  // console.log(keyword, radio);

  /////
  //fetch the data that inside locaion.json file
  // let allBooks = [];
  let gAPI =
    radio === "title"
      ? `https://www.googleapis.com/books/v1/volumes?q=+intitle:${keyword}`
      : `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${keyword}`;
  superagent
    .get(gAPI) //send a request locatioIQ API
    .then((gData) => {
      let items = gData.body.items;
      const gObj = items.map(function (element, i) {
        return new Book(element);
      });
      res.render("./pages/searches/show", { booksArr: gObj });
      //   res.render("./pages/searches/show", gObj);
      //   res.send(items);
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
  ///////
});
server.get("/searches/show", (req, res) => {
  // res.send('home route');
  res.render("./pages/index");
});
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//localhost:3001/hello
server.get("/hello", (req, res) => {
  // res.send('home route');
  res.render("./pages/index");
});
server.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
