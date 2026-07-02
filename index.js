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

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/list", (req, res) => {
  const sqlQuery =
    "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board;";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/write", (req, res) => {
  console.log(req.body);
  const { title, name, content } = req.body;

  const sqlQuery = "insert into board(title,content,writer) values(?,?,?);";
  db.query(sqlQuery, [title, name, content], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
