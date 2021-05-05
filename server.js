"use strict";

// Application Dependencies
require("dotenv").config();
const express = require("express");
const superagent = require("superagent");
const pg = require("pg");
const methodOverride = require("method-override");

// Application Setups
const PORT = process.env.PORT || 3030;
const server = express();
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false },
});
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");
server.use(express.static("./public"));
server.use(methodOverride("_method"));
// Constructors
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
  this.isbn =
    gData.volumeInfo?.industryIdentifiers !== undefined
      ? gData.volumeInfo?.industryIdentifiers[0]?.identifier
      : "No data";
}
Book.prototype.addSInHttp = function (link) {
  if (/https/.test(link)) {
    // console.log("pass");
  } else {
    let newLink = /http/.test(link) ? link.replace("http", "https") : undefined;
    return newLink;
  }
};

// Routes
/////////////////////////////////////////////////////////
//localhost:3001/searches 🧠🧠🧠
server.post("/searches", (req, res) => {
  let keyword = req.body.keyword;
  let radio = req.body.choice;
  let gAPI = `https://www.googleapis.com/books/v1/volumes?q=+in${radio}:${keyword}`;
  superagent
    .get(gAPI)
    .then((gData) => {
      let items = gData.body.items;
      // To check if I am getting data from the API
      if (items === undefined) {
        res.render("./pages/searches/show", {
          error: "No data for this query",
          booksArr: undefined,
        });
      } else {
        const gObj = items.map(function (element, i) {
          return new Book(element);
        });
        res.render("./pages/searches/show", {
          booksArr: gObj,
          error: undefined,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.render("./pages/error", { error: error });
    });
});
/////////////////////////////////////////////////////////
//localhost:3001/searches/new 🧠🧠🧠
server.get("/searches/new", (req, res) => {
  res.render("./pages/searches/new");
});
/////////////////////////////////////////////////////////
//localhost:3001/books 🧠🧠🧠

server.post("/books", (req, res) => {
  let { title, author, image, description, isbn } = req.body;
  let SQL = `INSERT INTO books (title,author,image,description,isbn) VALUES ($1,$2,$3,$4,$5) RETURNING *;`;
  let safeValue = [title, author, image, description, isbn];
  client
    .query(SQL, safeValue)
    .then((result) => {
      res.redirect(`/books/${result.rows[0].id}`);
    })
    .catch((err) => {
      res.render("./pages/error", { error: err });
    });
});
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
server.put("/books/:id", (req, res) => {
  console.log(req.body);
  let { title, description, author, isbn, image } = req.body;
  let SQL = `UPDATE books SET title=$1,description=$2,author=$3,isbn=$4,image=$5 WHERE id=$6;`;
  let safeValues = [title, description, author, isbn, image, req.params.id];
  client.query(SQL, safeValues).then(() => {
    res.redirect(`/books/${req.params.id}`);
  });
});
server.delete("/books/:id", (req, res) => {
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let value = [req.params.id];
  client.query(SQL, value).then(res.redirect("/"));
});
/////////////////////////////////////////////////////////
//localhost:3001 🧠🧠🧠
server.get("/", (req, res) => {
  let SQL = "SELECT * FROM books;";
  client
    .query(SQL)
    .then((results) => {
      res.render("./pages/index", { allBooks: results.rows });
    })
    .catch((err) => {
      res.render("./pages/error", { error: err });
    });
});
server.get("*", (req, res) => {
  res.render("./pages/404page");
});
client.connect().then(() => {
  server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
});
