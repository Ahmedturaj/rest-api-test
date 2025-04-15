const express = require("express");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
// middleware
app.use(express.json());
// ________________________***________________________

// Mongodb's code

// basic starting
app.get("/", (req, res) => {
  res.send("In Sha Allah I will be a good BACKEND DEVELOPER.");
});
app.listen(port, () => {
  console.log(`the post number is ${port}`);
});
