const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //json->object

let corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlqns",
  // db 이름 (테이블 이름 X)
  database: "bbs",
});

db.connect();

// 기본
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 목록
app.get("/list", (req, res) => {
  const sqlQuery =
    "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board;";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 상세
app.get("/view", (req, res) => {
  console.log(req.query.id);
  const id = req.query.id;

  // const sqlQuery = `SELECT * FROM board WHERE id=${req.query.id};`;
  const sqlQuery =
    "SELECT title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board WHERE id=?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 글쓰기
app.post("/write", (req, res) => {
  console.log(req.body);
  const { title, name, content } = req.body;

  const sqlQuery = "insert into board (title,content,writer) values (?,?,?);";
  db.query(sqlQuery, [title, content, name], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
