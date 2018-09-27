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

app.listen(port, () => console.log(`Listening on port ${port}`));

// connection.connect();

// connection.query('SELECT * from test', function(err, rows, fields) {
//   if(!err)
//     console.log('The solution is: ', rows);
//   else
//     console.log('Error while performing Query.', err);
// });

// connection.end();