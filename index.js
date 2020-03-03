require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let routes = require("./routes/conversion");
routes(app);

app.get("/", (req, res) => {
  res.json({ message: `This is a node test app ${req.cookies}` });
});

app.get("/cookies", (req, res) => {
  res.send(req.cookies);
});

app.listen(process.env.PORT, () => {
  console.log("Backend is up and running.");
});
