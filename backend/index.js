//importing express
const express = require("express");
const app = express();
(bodyParser = require("body-parser")),
  //importing environmental configuration
  require("dotenv").config();

//No access error

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
//cors
const cors = require("cors");

const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200,
};

//importing JWT to check token
const jwt = require("jsonwebtoken");

//importing Routes
// const postRoute = require("./routes/postsRoute");
const userRoute = require("./routes/usersRoute");
const authRoute = require("./routes/authRoute");
const forgotPasswordRoute = require("./routes/forgotPasswordRoute");
const path = require("path");
//importing mongo
const mongo = require("./shared/mongo");

async function AppServer() {
  try {
    //connecting to mongo
    await mongo.connect();

    //cors
    app.options("*", cors());

    //Middelwares
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(
      bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
      })
    );
    app.use(express.json());

    //Routes

    app.use("/auth", authRoute);
    app.use("/forgotPassword", forgotPasswordRoute);

    //Checking token
    app.use((req, res, next) => {
      const header = req.headers["access-token"];
      console.log(header);
      try {
        if (typeof header !== "undefined") {
          console.log("123");
          const bearer = header.split(" ");
          const token = bearer[1];
          console.log(bearer);
          console.log("yes entered");
          const userid = jwt.verify(token, process.env.TOKEN_SECRET);
          console.log("verifoed");
          console.log(userid);
          return next();
        }
      } catch (error) {
        console.log(error);
        res.status(401).send("invalid token");
      }

      res.send("token is missing");
    });

    // app.use("/transactions", postRoute);
    app.use("/api/users", userRoute);

    //Starting App
    app.listen(process.env.PORT, () => {
      console.log("server app is running...");
    });
  } catch (err) {
    console.log(err);
    process.exit();
  }
}
AppServer();
