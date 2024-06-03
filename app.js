const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const authRoutes = require("./Routes/routes");
const path = require("path");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const Task = require('./models/task');
const Uploads = require('./models/upload');
const methodOverride = require('method-override');
const multer = require('multer');
const { storage } = require("./cloudinary");
const upload = multer({ storage });
const dotenv = require("dotenv").config();


const app = express();

// Middleware
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

//File Upload Storage
// const storage = multer.diskStorage({
//   destination: function(req, file, cb){
//     return cb(null, './uploads');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });
// const upload = multer({ storage });

//flash message
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database connection
const URI =
  "mongodb+srv://patelsuhani:suhani@cluster1.ridiarm.mongodb.net/Node-auth?retryWrites=true&w=majority&appName=Cluster1";
mongoose
  .connect(URI)
  .then(() => {
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error(err);
  });

// Routes
app.get("/", (req, res) =>
  res.render("index", { loggedIn: req.session.loggedIn })
);
// app.get('/smoothies', (req, res) => res.render('smoothies', { loggedIn: req.session.loggedIn }));
app.get("/login", (req, res) =>
  res.render("login", { loggedIn: req.session.loggedIn })
);
app.get("/todoList", (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }
  res.render("todolist", { loggedIn: req.session.loggedIn });
});
app.get("/reset", (req, res) => res.render("reset"));

app.post("/upload", upload.single('profileImage'), (req, res) => {
  console.log(req.file);
  console.log('Image Uploaded Successfully!!');

  return res.redirect("/");
});

app.use(authRoutes);
