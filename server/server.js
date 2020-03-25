const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./que");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// api routes
app.get("/search", db.getData);
app.post("/send", db.createRecord);

// start server
const PORT =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
