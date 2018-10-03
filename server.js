// 서버 코드
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.post("/asdf", (req, res) => {
  console.log(req.body); //undefined

  let code = req.body.code.split("\n");
  let parsingCode = [
    {
      ID: 0,
      UPPER_ID: 0,
      TYPE: "",
      VALUE: ""
    }
  ];
  let parentId = [0];
  let preDepth = 0;
  const codeLength = code.length;
  for (let i = 0; i < codeLength - 1; i++) {
    let parsing = {};
    // id 설정
    parsing.ID = i + 1;
    // depth 계산
    let depth = 0;
    const codeLineLength = code[i].length;
    for (let j = 0; j < codeLineLength; j++) {
      if (code[i][j] === " " && code[i][j + 1] === " ") {
        depth++;
        j++;
      }
    }
    if (depth > preDepth) {
      parentId.push(i);
    } else if (depth < preDepth) {
      parentId.pop();
    }
    preDepth = depth;
    parsing.UPPER_ID = parentId[parentId.length - 1];
    // type 찾기
    while (code[i][0] === " ") {
      code[i] = code[i].slice(2);
    }
    const codeSplit = code[i].split(" ");
    if (codeSplit[0] === "if") {
      parsing.TYPE = "IF";
      parsing.VALUE = code[i].slice(3, -1);
    } else if (codeSplit[0] === "while") {
      parsing.TYPE = "WHILE";
      parsing.VALUE = code[i].slice(6, -1);
    } else if (codeSplit[0] === "for") {
      parsing.TYPE = "FOR";
      parsing.VALUE = code[i].slice(4, -1);
    } else if (code[i].slice(0, 5) === "print") {
      parsing.TYPE = "PRINT";
      parsing.VALUE = code[i].slice(6, -1);
    } else if (codeSplit[1] === "=") {
      parsing.TYPE = "DEFINE";
      parsing.VALUE = codeSplit[2];
    }
    parsingCode.push(parsing);
  }
  console.log(parsingCode);
  
  res.status(200).json("success");  
});

// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'cosmos0',
//   port     : 3306,
//   database : 'BBAM'
// });

// connection.query('SELECT * FROM USR_INFO', function(err, rows, fields) {
//   if(!err) {
//       console.log("<<문제 정보>>");
//       console.log(rows);
//   }
//   else {
//       console.log('Error while performing Query. - 사용자 신상 정보', err);
//   }
// });

// connection.end();

// connection.connect();

app.listen(port, () => console.log(`Listening on port ${port}`));

// connection.connect();

// connection.query('SELECT * from test', function(err, rows, fields) {
//   if(!err)
//     console.log('The solution is: ', rows);
//   else
//     console.log('Error while performing Query.', err);
// });

// connection.end();