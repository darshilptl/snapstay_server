require("dotenv").config();
// console.log(process.env) // remove this after you've confirmed it is working

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Environment variables for Database
const dbUrl = process.env.ATLASDB_URL; 
// const dbUrl = process.env.MONGODB_URL; 

// Importing routes
const listingRouter = require("./routes/listings.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true })); // middleware to parse
app.use(methodOverride("_method")); // middleware to override
app.engine("ejs", ejsmate);

main()
  .then(() => {
    console.log("conncection successful with Local MongoDB Database");
  })
  .catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Connection successful with Atlas Database");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
}

let port = 2034;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// root
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Route to render the contact page
app.get('/contact', (req, res) => {
  res.render('pages/contact', { currUser: req.user });
});

// session options
const Sessionoptions = {
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// session middleware
app.use(session(Sessionoptions));

// flash middleware
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// passport local strategy
passport.use(new LocalStrategy(User.authenticate()));

// passport serialize and deserialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// show flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});


// show all listings
app.use("/listings", listingRouter);
// show all users
app.use("/", userRouter);

// 404 error handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 505, message = "Something went wrong!!" } = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});
