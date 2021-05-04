"use strict";

// Application Dependencies
require("dotenv").config();
const express = require("express");
const superagent = require("superagent");
const pg = require("pg");

// Application Setups
const PORT = process.env.PORT || 3030;
const server = express();
const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static("./public"));

// Constructors🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠
function Book(gData) {
  this.image =
    this.addSInHttp(gData.volumeInfo?.imageLinks?.thumbnail) ||
    "https://i.imgur.com/J5LVHEL.jpg";
  this.title = gData.volumeInfo?.title || "No data";
  this.author =
    gData.volumeInfo?.authors !== undefined
      ? gData.volumeInfo?.authors[0]
      : "No data";
  this.description = gData.volumeInfo?.description || "No data";
}
Book.prototype.addSInHttp = function (link) {
  if (/https/.test(link)) {
    // console.log("pass");
  } else {
    let newLink = /http/.test(link) ? link.replace("http", "https") : undefined;
    return newLink;
  }
};

// Routes 🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠🧠
/////////////////////////////////////////////////////////
//localhost:3001/searches 🧠🧠🧠
server.post("/searches", (req, res) => {
  let keyword = req.body.keyword;
  let radio = req.body.choice;
  let gAPI =
    radio === "title"
      ? `https://www.googleapis.com/books/v1/volumes?q=+intitle:${keyword}`
      : `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${keyword}`;
  superagent
    .get(gAPI)
    .then((gData) => {
      let items = gData.body.items;
      // console.log(items);
      if (items === undefined) {
        // console.log("Error no data");
        res.render("./pages/searches/show", {
          error: "No data for this query",
          booksArr: undefined,
        });
      } else {
        const gObj = items.map(function (element, i) {
          return new Book(element);
        });
        // console.log(gObj);
        res.render("./pages/searches/show", {
          booksArr: gObj,
          error: undefined,
        });
        //   res.send(items);
      }
    })
    .catch((error) => {
      console.log(error);
      // res.render("./pages/searches/show", { error: error });
      res.send(error);
    });
  ///////
});

/////////////////////////////////////////////////////////
//localhost:3001/searches/new 🧠🧠🧠
server.get("/searches/new", (req, res) => {
  res.render("./pages/searches/new");
});
/////////////////////////////////////////////////////////
//localhost:3001/books/:id 🧠🧠🧠
server.get("/books/:id", (req, res) => {
  let SQL = "SELECT * FROM books WHERE id=$1;";
  let safeValue = [req.params.id];
  client
    .query(SQL, safeValue)
    .then((results) => {
      res.render("./pages/books/show", { oneBook: results.rows[0] });
    })
    .catch((err) => {
      res.render("./pages/error", { error: err });
    });
});
//localhost:3001/books 🧠🧠🧠
server.post("/books", (req, res) => {
  console.log(req.body);
  let { title, author, image_url, description } = req.body;
  let SQL = `INSERT INTO books (title,author,image_url,description) VALUES ($1,$2,$3,$4) RETURNING *;`;
  let safeValue = [title, author, image_url, description];
  client
    .query(SQL, safeValue)
    .then((result) => {
      // console.log(result.rows[0]);
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch((err) => {
      res.render("./pages/error", { error: err });
    });
});
/////////////////////////////////////////////////////////
//localhost:3001 🧠🧠🧠
server.get("/", (req, res) => {
  let SQL = "SELECT * FROM books;";
  client
    .query(SQL)
    .then((results) => {
      // console.log(results.rows);
      res.render("./pages/index", { allBooks: results.rows });
    })
    .catch((err) => {
      res.render("./pages/error", { error: err });
    });
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
client.connect().then(() => {
  server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
});
