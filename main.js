const express = require("express");
const exphbs = require("express-handlebars");

require('dotenv').config();

// Routes
const weaponsRoute = require("./routes/weapons");
const skillsRoute = require("./routes/skills");

const app = express();
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
});

app.use((req, res, next) => {
  const auth = { login: process.env.AUTH_LOGIN, password: process.env.AUTH_PASS };

  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Required Auth"');
  res.status(401).send("Authentication required.");
});

app.enable("view cache");
app.use(express.static("public"));

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// Define Routes
app.use("/weapons", weaponsRoute.router);
app.use("/skills", skillsRoute.router);

app.get("/", (req, res) => {
  res.send("Hi");
});

const server = app.listen(9102, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("Listening at %s:%s", host, port);
});
