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

// commit test