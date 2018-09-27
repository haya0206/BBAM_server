// const express = require("express");
// var router = express.Router();

// var mysql = require('mysql');

// var connection = mysql.createConnection({
//   user      : "root",
//   password  : "cosmos0",
//   database  : "test",
//   port      : 5000
// });

// router.get('/', function(req, res, next) {
//   connectionquery("SELECT * from test;"), function(err, result, fields) {
//     if(err) {
//       console.log("쿼리문에 오류가 있습니다.");
//     }
//     else {
//       console.log(result);
//       //res.json(result);
//     }
//   }
// });
// module.exprots = router;

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'cosmos0',
  port     : 3306,
  database : 'BBAM'
});

connection.connect();

connection.query('SELECT * from PRB_INFO', function(err, rows, fields) {
  if (!err)
    console.log('The solution is: ', rows);
  else
    console.log('Error while performing Query.', err);
});

connection.end();