const express = require("express");
const cors = require("cors");
const app = express();
const mysql = require("mysql2");
const port = 3000;
const multer = require("multer");

app.use(express.json()); // json -> object
app.use(express.urlencoded({ extended: true })); // html form -> object
app.use("/uploads", express.static("uploads")); // uploads 주소로 접속시 uploads 폴더에 접근 권한 부여

let corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const orinalExt = file.originalname.split(".")[1];
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1000);
    // cb(null, uniquePrefix + "-" + file.originalname);
    cb(null, uniquePrefix + "-" + file.fieldname + "." + orinalExt);
  },
});

const upload = multer({ storage: storage });

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
    "SELECT title, content, writer, image_path, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board WHERE id=?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 글쓰기
app.post("/write", upload.single("image"), (req, res) => {
  console.log(req.body);
  const { title, writer, content } = req.body;
  const imagePath = req.file ? req.file.path : null; //req.file.path는 업로드된 파일의 경로

  const sqlQuery = "INSERT INTO board (title,content,writer,image_path) VALUES (?,?,?,?);";
  db.query(sqlQuery, [title, content, writer, imagePath], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/update", upload.single("image"), (req, res) => {
  console.log(req.body);

  const { writer, title, content, id, remove_image } = req.body;
  const imagePath = req.file ? req.file.path : null; // 새 이미지 정보 할당
  const shouldRemoveImage = remove_image === "1";

  let sqlQuery;
  let params;

  // const sqlQuery = "UPDATE board SET writer=?, title=?, content=? WHERE id=?;";

  // 상황별 params 정의
  // 이미지 삭제 요청 O + 새 이미지 X -> 기존 이미지 제거, image_path 값 비우기
  if (shouldRemoveImage && !imagePath) {
    sqlQuery = "UPDATE board SET writer=?, title=?, content=?, image_path=NULL WHERE id=?;";
    params = [writer, title, content, id];
  }
  // 이미지 삭제 요청 X + 새 이미지 O -> 기존 이미지 유지, image_path에 새 이미지 업데이트
  else if (!shouldRemoveImage && imagePath) {
    sqlQuery = "UPDATE board SET writer=?, title=?, content=?, image_path=? WHERE id=?;";
    params = [writer, title, content, imagePath, id];
  }
  // 이미지 삭제 요청 X + 새 이미지 X -> 기존 이미지 유지, 글정보만 변경
  else if (!shouldRemoveImage && !imagePath) {
    sqlQuery = "UPDATE board SET writer=?, title=?, content=? WHERE id=?";
    params = [writer, title, content, id];
  }
  // 이미지 삭제 요청 O + 새 이미지 O -> 기존 이미지 제거, image_path에 새 이미지 업데이트
  else if (shouldRemoveImage && imagePath) {
    sqlQuery = "UPDATE board SET writer=?, title=?, content=?, image_path=? WHERE id=?";
    params = [writer, title, content, imagePath, id];
  }

  db.query(sqlQuery, params, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/delete", (req, res) => {
  console.log(req.body);
  const { id } = req.body;

  const sqlQuery = `DELETE FROM board WHERE id=${id};`;
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/deleteselect", (req, res) => {
  console.log(req.body);
  const { boardIdList } = req.body;

  const sqlQuery = `DELETE FROM board WHERE id in (${boardIdList});`;

  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
