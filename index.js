require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(express.json({ limit: 52428800 }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

let routes = require("./routes/conversion");
routes(app);

app.listen(process.env.PORT, () => {
  console.log("Backend is up and running.");
});
