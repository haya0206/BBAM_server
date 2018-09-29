// 서버 코드
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.post("/asdf", (req, res) => {
  console.log(req.body); //undefined
  res.status(200).json("success");  
});

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'cosmos0',
  port     : 3306,
  database : 'BBAM'
});

connection.query('SELECT * FROM USR_INFO', function(err, rows, fields) {
  if(!err) {
      console.log("<<문제 정보>>");
      console.log(rows);
  }
  else {
      console.log('Error while performing Query. - 사용자 신상 정보', err);
  }
});

connection.end();

connection.connect();

app.listen(port, () => console.log(`Listening on port ${port}`));

// connection.connect();

// connection.query('SELECT * from test', function(err, rows, fields) {
//   if(!err)
//     console.log('The solution is: ', rows);
//   else
//     console.log('Error while performing Query.', err);
// });

// connection.end();