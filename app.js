/*
    Group: Group 11
    Members: April Castaneda, Kevin Wu
    Project: Rotten Guavas

    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
    Original starter code: https://github.com/knightsamar/cs340_sample_nodejs_app
*/

var express = require("express");
var session = require("express-session");
var mysql = require("./dbcon.js");
var bodyParser = require("body-parser");

var app = express();
var handlebars = require("express-handlebars").create({
    defaultLayout: "main",
    helpers: {                                  // helper functions for handlebars
        inc: function (number) {                // function to increment number
            return number + 1;
        },
        toFixed: function (number) {            // function to convert num to 1 decimal place
            return number.toFixed(1);
        },
        freshOrNot: function (number) {         // function to evaluate fresh or not, return field for page
            if (number >= 6) {
                return "<img src='https://image.flaticon.com/icons/svg/2045/2045020.svg' width=25> Fresh!";
            } else {
                return "<img src='https://webstockreview.net/images/tomatoes-clipart-svg-11.png' width=25> Not!";
            }
        },
        formatDate: function (date) {           // function to splice out time from date
            if (date) {
                return date.toString().split(" ").slice(0, 4).join(" "); // 0-4 = date
            }
        },
        processOption: function (pref_console_ID, console_ID) { // for drop-down box options
            if (pref_console_ID && console_ID && pref_console_ID == console_ID) {
                return " selected";
            }
        },
        ratingColor: function (number) {
            if (number >= 7.5) {
                return "bg-success";
            } else if (number >= 5) {
                return "bg-warning";
            } else {
                return "bg-danger";
            }
        }
    }
});

app.engine("handlebars", handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static", express.static("public"));
app.set("view engine", "handlebars");
app.set("port", process.argv[2] || process.env.PORT);
app.set("mysql", mysql);
app.use(session({
    secret: "ready player one",
    resave: true,
    saveUninitialized: true
}));
app.use("/", require("./routes/home.js"));
app.use("/login", require("./routes/login.js"));
app.use("/logout", require("./routes/logout.js"));
app.use("/addReview", require("./routes/addReview.js"));
app.use("/games", require("./routes/games.js"));
app.use("/profile", require("./routes/profile.js"));
app.use("/register", require("./routes/register.js"));
app.use("/addGame", require("./routes/addGame.js"));

app.use(function (req, res) {
    res.status(404);
    res.render("404");
});

app.use(function (err, req, res) {
    console.error(err.stack);
    res.status(500);
    res.render("500");
});

app.listen(app.get("port"), function () {
    console.log("Express started on http://localhost:" + app.get("port") + "; press Ctrl-C to terminate.");
});
