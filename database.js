const mongoose = require("mongoose");

function DbConnect() {
  const DB_URL = process.env.DB_URL;

  // DB connection
  mongoose
    .connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .then(() => console.log("db connected.."))
    .catch((err) => console.log("db connection error : ", err));
}

module.exports = DbConnect;
