if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const flash = require('connect-flash');
const multer  = require('multer');
const { error } = require("console");
const upload = multer({ dest: 'uploads/' }) // storing using multer at storage of cloud  



// Session 
app.use(
    session({
      secret: "thissecret",
      resave: false,
      saveUninitialized: true,
      cookie: { 
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: false 
    }, 
    })
  );
  
app.use(flash());

 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
        res.locals.newUser = req.user;        // here we are storing the current user session //
        console.log(res.locals.newUser);
        next();
    });



// db

const Mongo_Url = "mongodb://127.0.0.1:27017/Kudosware";

main()
.then((res)=>{
    console.log(res);
    console.log("working db");
})
.catch((err)=>{
    console.log(err);
    console.log("db err");
});

async function main(){
    await mongoose.connect(Mongo_Url);
};



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));
//app.use('/uploads', express.static('uploads'));




app.get("/signup",(req,res)=>{
    res.render("signUp.ejs",{user:req.user});
})


app.post("/signup", upload.single('resume'), async (req, res, next) => {
    //res.send(req.file);
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(req.file);
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, resume: {filename} });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to the app!!");
            res.redirect("/new");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});




app.get("/login",(req,res)=>{
    res.render("login.ejs",{user:req.user});
})

app.post("/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome back!");
            // Handle redirect
            let redirectUrl = req.session.redirectUrl || "/new";
            delete req.session.redirectUrl; // Clean up the session variable
            res.redirect(redirectUrl);
        });
    })(req, res, next);
});



app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect("/");
    });
});


app.get("/",(req,res)=>{
    res.render("index.ejs");
})


app.get("/new",(req,res)=>{
    res.render("new.ejs");
})

app.all("*",(req,res,next)=>{
    res.status(404).send("some error");
});


app.use((err,req,res,next)=>{
    console.log(err.message);
    let {statusCode=500,message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{err});
})

app.listen(8080,()=>{
    console.log("app is listening to 8080");
});