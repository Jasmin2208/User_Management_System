require('dotenv').config({ path: "../.env" })
const express = require("express");
require("./dbConnection/dbConnection")
const hbs = require("hbs")
const path = require("path")
const app = express();
const cookieParser = require('cookie-parser')
const BASE_URL = process.env.BASE_URL
const PORT = process.env.PORT
const userRouter = require("../routers/userRouter")
const bodyParser = require("body-parser").json()
const session = require('express-session');
const flash = require('connect-flash');
app.use(express.json());



const staticPath = path.join(__dirname, "../public")
const templatesPath = path.join(__dirname, "../templates/views")
const partialPath = path.join(__dirname, "../templates/partial")


app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(staticPath))
app.get('/public', express.static(staticPath));
app.set("view engine", "hbs")
app.set("views", templatesPath)
hbs.registerPartials(partialPath)
hbs.registerHelper('equal', function (value1, value2) {
  return value1 === value2;
});
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());


// console.log(process.env.SECRET_KEY);


app.use("/", userRouter);






app.listen(PORT, () => {
  console.log(`app is live in port at ${BASE_URL}`);
})