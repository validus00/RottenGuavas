/*
    Group: Group 11
    Members: April Castaneda, Kevin Wu
    Project: Rotten Guavas

    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require('express');
var session = require('express-session');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {                                         // helper functions for handlebars
        inc: function (number) {                       // function to increment number
            return number + 1;
        },
        toFixed: function (number) {                   // function to convert num to 1 decimal place
            return number.toFixed(1);
        },
        freshOrNot: function (number) {         // function to evaluate fresh or not, return field for page
            if (number >= 5) {
                return "<img src='https://image.flaticon.com/icons/svg/2045/2045020.svg' width=25>Fresh!";
            } else {
                return "Not!";
            }
        },
        formatDate: function (date) {                  // function to splice out time from date
            if (date) {
                return date.toString().split(" ").slice(0, 4).join(" ");    // 0-4 = date
            }
        },
        processOption: function (pref_console_ID, console_ID) { // for combobox option
            if (pref_console_ID && console_ID && pref_console_ID == console_ID) {
                return " selected";
            }
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use(session({
    secret: "ready player one",
    resave: true,
    saveUninitialized: true
}));

function getConsoles(res, mysql, context, complete) {
    mysql.pool.query("SELECT console_ID, console_name FROM Consoles ORDER BY console_ID", function (error, results) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.consoles = results;
        complete();
    });
}

function getGenres(res, mysql, context, complete) {
    mysql.pool.query("SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC", function (error, results) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genres = results;
        complete();
    });
}

function getGamesHelper(res, mysql, list, name, genresList, searchName, complete) {
    var sql = "SELECT Consoles.console_ID, console_name, Games.game_ID, game_name, AVG(rating) AS rating FROM Games"
        + " JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID"
        + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID"
        + " LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID";
    if (searchName) {
        var inserts = [name, searchName];
        mysql.pool.query(sql + " WHERE console_name = ? AND game_name = ? GROUP BY game_name ORDER BY rating DESC",
            inserts, helper);
    } else if (genresList.length > 0) {
        var inserts = [name];
        genreStr = "  JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID WHERE console_name = ? AND (genre_ID = ?";
        for (var j = 0; j < genresList.length; j++) {
            inserts.push(genresList[j]);
            if (j + 1 < genresList.length) {
                genreStr += " OR genre_ID = ?";
            }
        }
        mysql.pool.query(sql + genreStr + ") GROUP BY game_name ORDER BY rating DESC", inserts, helper);
    } else {
        mysql.pool.query(sql + " WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC", name, helper);
    }

    function helper(error, results) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        var object = [];
        object.games = results;
        object.name = name;
        list.push(object);
        complete();
    }
}

function getGames(res, mysql, context, complete, consolesList, genresList, searchName) {
    var callbackCount = 0;
    var inserts = [];
    genreStr = "";
    if (genresList.length > 0) {
        genreStr = " JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID"
            + " JOIN Games ON Consoles_Games.game_ID = Games.game_ID"
            + " JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID"
            + " WHERE (genre_ID = ?";
        for (var i = 0; i < genresList.length; i++) {
            inserts.push(genresList[i]);
            if (i + 1 < genresList.length) {
                genreStr += " OR genre_ID = ?";
            }
        }
        genreStr += ") GROUP BY console_name";
    }
    if (searchName) {
        mysql.pool.query("SELECT Consoles.console_ID, console_name FROM Consoles JOIN Consoles_Games ON Consoles.console_ID ="
            + " Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID WHERE game_name = ?",
            searchName, helper);
    } else {
        mysql.pool.query("SELECT Consoles.console_ID, console_name FROM Consoles" + genreStr + " ORDER BY console_ID", inserts, helper);
    }

    function helper(error, results) {
        var list = [];
        var resultsList = consolesList;
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        if (!searchName && genresList.length == 0) {
            context.consoles = results;
        }
        if (consolesList.length == 0) {
            resultsList = results;
        }
        if (resultsList.length == 0) {
            interComplete();
        }
        for (var i = 0; i < resultsList.length; i++) {
            if (consolesList.length == 0) {
                getGamesHelper(res, mysql, list, resultsList[i].console_name, genresList, searchName, interComplete);
            } else {
                getGamesHelper(res, mysql, list, resultsList[i], genresList, searchName, interComplete);
            }
        }

        function interComplete() {
            callbackCount++;
            if (callbackCount >= resultsList.length) {
                context.gamesList = list;
                complete();
            }
        }
    }
}

function sortConsoles(consolesList, resultsList) {
    for (var i = 0; i < resultsList.length; i++) {
        for (var j = 0; j < consolesList.length; j++) {
            if (resultsList[i].name == consolesList[j].console_name) {
                resultsList[i].id = consolesList[j].console_ID;
                break;
            }
        }
    }
    resultsList.sort(function (a, b) {
        return a.id - b.id;
    });
}

app.get("/", function (req, res) {
    var totalCallBack = 2;
    var callbackCount = 0;
    var context = {};
    if (req.session.loggedin) {
        context.loggedin = true;
    }
    getGames(res, mysql, context, complete, [], [], null);
    getGenres(res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if (callbackCount >= totalCallBack) {
            sortConsoles(context.consoles, context.gamesList);
            res.render("home", context);
        }
    }
});

function addConsole(name, res) {
    mysql.pool.query("SELECT * FROM Consoles WHERE console_name = ?", name, function (error, results) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        if (results.length == 0) {
            mysql.pool.query("INSERT INTO Consoles (console_name) VALUES (?)", name, function (error) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                res.redirect("/");
            });
        } else {
            res.redirect("/");
        }
    });
}

function addGenre(name, res) {
    mysql.pool.query("SELECT * FROM Genres WHERE genre_name = ?", name, function (error, results) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        if (results.length == 0) {
            mysql.pool.query("INSERT INTO Genres (genre_name) VALUES (?)", name, function (error) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                res.redirect("/");
            });
        } else {
            res.redirect("/");
        }
    });
}

app.post("/", function (req, res) {
    if (req.body.new_console) {
        addConsole(req.body.new_console, res);
    } else if (req.body.new_genre) {
        addGenre(req.body.new_genre, res);
    } else {
        var totalCallBack = 2;
        var callbackCount = 0;
        var context = {};
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        var searchName = null;
        if (req.body.search) {
            searchName = req.body.search;
        }
        var consolesList = [];
        var genresList = [];
        if (req.body.console_selection) {
            if (Array.isArray(req.body.console_selection)) {
                consolesList = req.body.console_selection;
            } else {
                consolesList.push(req.body.console_selection);
            }
        }
        if (req.body.genre_selection) {
            if (Array.isArray(req.body.genre_selection)) {
                genresList = req.body.genre_selection;
            } else {
                genresList.push(req.body.genre_selection);
            }
        }
        getGames(res, mysql, context, complete, consolesList, genresList, searchName);
        getGenres(res, mysql, context, complete);
        if (searchName || genresList.length > 0) {
            totalCallBack++;
            getConsoles(res, mysql, context, complete);
        }

        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                sortConsoles(context.consoles, context.gamesList);
                res.render("home", context);
            }
        }
    }
});

app.get("/login", function (req, res) {
    var context = {};
    context.jsscripts = ["login.js"];
    res.render("login", context);
});

app.post("/login", function (req, res) {
    var inserts = [req.body.username, req.body.password];
    mysql.pool.query("SELECT * FROM Users WHERE user_name = ? AND password = ?", inserts,
        function (error, results) {
            if (error) {
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else {
                if (results.length == 0) {
                    res.status(401).end();
                } else {
                    req.session.loggedin = true;
                    req.session.user_ID = results[0].user_ID;
                    res.status(200).end();
                }
            }
        });
});

app.get("/logout", function (req, res) {
    req.session.loggedin = false;
    req.session.user_ID = null;
    res.redirect("/");
});

function getGameConsoles(res, mysql, context, complete, game_ID, console_ID) {
    mysql.pool.query("SELECT Consoles.console_ID, console_name FROM Consoles"
        + " JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID"
        + " JOIN Games ON Consoles_Games.game_ID = Games.game_ID"
        + " WHERE Games.game_ID = ?", game_ID, function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            consolesList = "";
            for (var i = 0; i < results.length; i++) {
                if (results[i].console_ID != console_ID) {
                    consolesList = consolesList + "<a href='/games?console_ID=" + results[i].console_ID;
                    consolesList = consolesList + "&game_ID=" + game_ID + "'>" + results[i].console_name + "</a>";
                    if (i + 1 < results.length) {
                        consolesList += ", ";
                    }
                }
            }
            context.consolesList = consolesList;
            complete();
        });
}

function getGameReviews(res, mysql, context, complete, game_ID, console_ID) {
    var inserts = [game_ID, console_ID];
    mysql.pool.query("SELECT user_name, rating, review_date, title, content FROM Reviews"
        + " JOIN Users ON Reviews.user_ID = Users.user_ID WHERE game_ID = ? AND console_ID = ?",
        inserts, function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.reviews = results;
            complete();
        });
}

function getGameGenres(res, mysql, context, complete, game_ID) {
    mysql.pool.query("SELECT genre_name FROM Genres JOIN Genres_Games ON Genres.genre_ID = Genres_Games.genre_ID"
        + " JOIN Games ON Genres_Games.game_ID = Games.game_ID WHERE Games.game_ID = ?",
        game_ID, function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            genresList = "";
            for (var i = 0; i < results.length; i++) {
                genresList += results[i].genre_name;
                if (i + 1 < results.length) {
                    genresList += ", ";
                }
            }
            context.genresList = genresList;
            complete();
        });
}

function getGameInfo(res, mysql, context, complete, game_ID, console_ID) {
    var inserts = [game_ID, console_ID];
    mysql.pool.query("SELECT console_name, Games.game_ID, photo,"
        + " game_name, description, release_date, AVG(rating) AS rating FROM Games"
        + " JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID"
        + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID"
        + " LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID"
        + " WHERE Games.game_ID = ? AND Consoles.console_id = ?", inserts, function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.console_ID = console_ID;
            context.console_name = results[0].console_name;
            context.photo = results[0].photo;
            context.game_ID = results[0].game_ID;
            context.game_name = results[0].game_name;
            context.rating = results[0].rating;
            context.release_date = results[0].release_date;
            context.description = results[0].description;
            complete();
        });
}

app.get("/addReview", function (req, res) {
    if (req.session.loggedin) {
        var context = {};
        context.jsscripts = ["addReview.js"];
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        context.console_ID = req.query.console_ID;
        context.console_name = req.query.console_name;
        context.game_ID = req.query.game_ID;
        context.game_name = req.query.game_name;
        res.render("addReview", context);
    } else {
        res.redirect("/login");
    }
});

app.post("/addReview", function (req, res) {
    var inserts = [req.body.console_ID, req.body.game_ID, req.body.title, req.body.rating, req.body.content];
    var date = new Date();
    inserts.push(date);
    inserts.push(req.session.user_ID);
    mysql.pool.query("INSERT INTO Reviews (console_ID, game_ID, title, rating, content, review_date, user_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
        inserts, function (error) {
            if (error) {
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else {
                res.status(200).end();
            }
        });
});

app.get("/reviewCheck", function (req, res) {
    if (req.session.loggedin) {
        res.status(200).end();
    } else {
        res.status(401).end();
    }
});

app.get("/games", function (req, res) {
    var totalCallBack = 4;
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["reviewCheck.js"];
    if (req.session.loggedin) {
        context.loggedin = true;
    }
    getGameInfo(res, mysql, context, complete, req.query.game_ID, req.query.console_ID);
    getGameGenres(res, mysql, context, complete, req.query.game_ID);
    getGameConsoles(res, mysql, context, complete, req.query.game_ID, req.query.console_ID);
    getGameReviews(res, mysql, context, complete, req.query.game_ID, req.query.console_ID);
    function complete() {
        callbackCount++;
        if (callbackCount >= totalCallBack) {
            res.render("games", context);
        }
    }
});

app.get("/deleteGame", function (req, res) {
    var inserts = [req.query.console_ID, req.query.game_ID];
    mysql.pool.query("DELETE FROM Consoles_Games WHERE console_ID = ? AND game_ID = ?",
        inserts, function (error) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            res.redirect("/");
        });
});

function getUser(req, res, mysql, context, complete) {
    mysql.pool.query("SELECT * FROM Users WHERE user_ID = ?", req.session.user_ID,
        function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.user_name = results[0].user_name;
            context.password = results[0].password;
            context.email = results[0].email;
            context.photo = results[0].photo;
            context.pref_console_ID = results[0].pref_console_ID;
            complete();
        });
}

function getUserReviews(req, res, mysql, context, complete) {
    mysql.pool.query("SELECT review_ID, game_name, console_name, rating, review_date, title, content FROM Reviews"
        + " JOIN Games ON Reviews.game_ID = Games.game_ID JOIN Consoles ON Reviews.console_ID = Consoles.console_ID"
        + " WHERE user_ID = ?", req.session.user_ID, function (error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.reviews = results;
            complete();
        });
}

app.get("/deleteReview", function (req, res) {
    if (req.session.loggedin) {
        var inserts = [req.query.review_ID, req.session.user_ID];
        mysql.pool.query("DELETE FROM Reviews WHERE review_ID = ? AND user_ID = ?",
            inserts, function (error) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                res.redirect("/profile");
            });
    } else {
        res.redirect("/login");
    }
});

app.get("/profile", function (req, res) {
    if (req.session.loggedin) {
        var totalCallBack = 3;
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["profile.js"];
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        getUser(req, res, mysql, context, complete);
        getConsoles(res, mysql, context, complete);
        getUserReviews(req, res, mysql, context, complete);

        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                var options = [];
                var consoleOption = {};
                consoleOption.console_name = "None";
                options.push(consoleOption);
                for (var i = 0; i < context.consoles.length; i++) {
                    context.consoles[i].pref_console_ID = context.pref_console_ID;
                    options.push(context.consoles[i]);
                }
                context.options = options;
                res.render("profile", context);
            }
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/profile", function (req, res) {
    var inserts = [req.body.username, req.session.user_ID];
    mysql.pool.query("SELECT * FROM Users WHERE user_name = ? AND user_ID != ?", inserts, function (error, results) {
        if (error) {
            res.statusMessage = JSON.stringify(error);
            res.status(400).end();
        } else {
            if (results.length == 0) {
                if (req.body.console == "") {
                    req.body.console = null;
                }
                inserts = [req.body.username, req.body.password, req.body.email, req.body.console, req.body.photo, req.session.user_ID];
                mysql.pool.query("UPDATE Users SET user_name = ?, password = ?, email = ?, pref_console_ID = ?, photo = ? WHERE user_ID = ?",
                    inserts, function (error) {
                        if (error) {
                            res.statusMessage = JSON.stringify(error);
                            res.status(400).end();
                        } else {
                            res.status(200).end();
                        }
                    });
            } else {
                res.statusMessage = "username already in use";
                res.status(400).end();
            }
        }
    });
});

app.get("/register", function(req, res){
    var totalCallBack = 1;
    var callbackCount = 0;
    var context = {};
    context.jsscripts = ["register.js"];

    getConsoles(res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if (callbackCount >= totalCallBack) {
            var options = [];
            var consoleOption = {};
            consoleOption.console_name = "None";
            options.push(consoleOption);
            for (var i = 0; i < context.consoles.length; i++) {
                options.push(context.consoles[i]);
            }
            context.options = options;
            res.render("register", context);
        }
    }
});

app.post("/register", function(req, res){
    var inserts = [req.body.username];
    mysql.pool.query("SELECT * FROM Users WHERE user_name = ?", inserts, function (error, results) {
        if (error) {
            res.statusMessage = JSON.stringify(error);
            res.status(400).end();
        } else {
            if (results.length == 0) {
                if (req.body.console == "") {
                    req.body.console = null;
                }
                inserts = [req.body.username, req.body.password, req.body.email, req.body.console, req.body.photo];
                mysql.pool.query("INSERT INTO Users (user_name, password, email, pref_console_ID, photo) VALUES (?, ?, ?, ?, ?)",
                    inserts, function (error) {
                        if (error) {
                            res.statusMessage = JSON.stringify(error);
                            res.status(400).end();
                        } else {
                            res.status(200).end();
                        }
                    });
            } else {
                res.statusMessage = "username already in use";
                res.status(400).end();
            }
        }
    });
});

app.get("/addGame", function(req, res){
    var totalCallBack = 2;
    var callbackCount = 0;
    var context = {};

    context.jsscripts = ["addGame.js"];

    if (req.session.loggedin) {
        context.loggedin = true;
    }
    
    getConsoles(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);

    function complete() {
        callbackCount++;
        if (callbackCount >= totalCallBack) {
            res.render("addGame", context);
        }
    }
});

function getGameID(req, res, mysql, context, game_name, complete) {
    mysql.pool.query("SELECT game_ID FROM Games WHERE game_name = ?", game_name, function (error, results, fields) {
        if (error) {
            res.statusMessage = JSON.stringify(error);
            res.status(400).end();
        } else {
            context.game_ID = results[0].game_ID;
            complete(res, context, game_name);
        }
    });
}

// Checks if Consoles_Games relationship already exists. Inserts relationship if it doesn't already exist.
function addConsolesGames(res, mysql, context, totalConsoles, totalGenres, game_name, complete) {

    var inserts = [];

    // Go through each console to add
    for(var i = 0; i < totalConsoles; i++){
        inserts = [context.consolesList[i], context.game_ID];
        findRelationship(inserts);
    }

    // See if Consoles_Games relationship already exists
    function findRelationship(inserts){
        mysql.pool.query("SELECT console_name FROM Consoles_Games "
            + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID "
            + " WHERE Consoles_Games.console_ID = ? AND game_ID = ?", inserts, function(err, results, fields){

            if(err){
                res.status(400).end();
            }
            // Relationship doesn't exist so insert Consoles_Games relationship
            else if(results.length == 0){
                // Get console_name
                mysql.pool.query("SELECT console_name FROM Consoles where console_ID = ?", inserts[0], function(err, results, fields){
                    if (err) {
                        res.status(400).end();
                    } else {
                        res.statusMessage += "Game '" + game_name + "' for '" + results[0].console_name + "' added." + "\\n";
                        addRelationship(inserts);
                    }
                });
            }
            else{
                res.statusMessage += "Game '" + game_name + "' for '" + results[0].console_name + "' already exists." + "\\n";
                addRelationship([]);
            }
        });

    }

    // Add Consoles_Games relationship
    function addRelationship(inserts){
        if(inserts.length > 0){
            mysql.pool.query("INSERT INTO Consoles_Games(console_ID, game_ID) VALUES (?, ?)", inserts, function(error, results, fields){
                if (error) {
                    res.statusMessage = JSON.stringify(error);
                    res.status(400).end();
                } else {
                    complete(res, game_name);
                }
            });
        }
        else{
            complete(res, game_name);
        }
    }
}

// Checks if Genres_Games relationship already exists. Inserts relationship if it doesn't already exist.
function addGenresGames(res, mysql, context, totalGenres, game_name, complete){
   
    // If no Genres, go back to complete
    if(totalGenres <= 0){
        complete(res, game_name);
    }

    var inserts = [];

    // Go through each Genre to add
    for(var i = 0; i < totalGenres; i++){

        inserts = [context.genresList[i], context.game_ID];
        findRelationship(inserts);
    }

    // See if Consoles_Games relationship already exists
    function findRelationship(inserts){
        mysql.pool.query("SELECT genre_name FROM Genres_Games "
            + " JOIN Genres ON Genres_Games.genre_ID = Genres.genre_ID "
            + " WHERE Genres_Games.genre_ID = ? AND game_ID = ?", inserts, function(err, results, fields){

            if(err){
                res.status(400).end();
            }
            // Relationship doesn't exist so insert Genre_Games relationship
            else if(results.length == 0){
                // Get genre_name
                mysql.pool.query("SELECT genre_name FROM Genres where genre_ID = ?", inserts[0], function(err, results, fields){
                    if (err) {
                        res.status(400).end();
                    } else {
                        res.statusMessage += "Genre '" + results[0].genre_name + "' for '" + game_name + "' added." + "\\n";
                        addRelationship(inserts);
                    }
                });
            }
            else{
                res.statusMessage += "Genre '" + results[0].genre_name + "' for '" + game_name + "' already exists." + "\\n";
                addRelationship([]);
            }
        });

    }

    // Add Consoles_Games relationship
    function addRelationship(inserts){
        if(inserts.length > 0){
            mysql.pool.query("INSERT INTO Genres_Games(genre_ID, game_ID) VALUES (?, ?)", inserts, function(error, results, fields){
                if (error) {
                    res.statusMessage = JSON.stringify(error);
                    res.status(400).end();
                } else {
                    complete(res, game_name);
                }
            });
        }
        else{
            complete(res, game_name);
        }
    }
}

app.post("/addGame", function (req, res) {
    var totalFirstCB = 1;
    var firstCBCount = 0;
    var secondCBCount = 0;
    var thirdCBCount = 0;

    var totalConsoles = 0;
    var totalGenres = 0;

    var context = {};
    var consolesList = [];
    var genresList = [];

    res.statusMessage = "";
    
    // If no console(s) chosen, send error
    if(!req.body.console_selection) { 
        res.statusMessage += "Console choice(s) required.";
        res.status(400).end();
    } 

    // Consoles are chosen so we can continue adding a game
    else{

        // See if game_name already exists in the database
        var inserts = [req.body.game_name];

        // To get proper game_name stored in database
        mysql.pool.query("SELECT game_name FROM Games WHERE game_name = ?", inserts, function (error, results, fields) {
            
            if (error) {
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else {

                // Check how many consoles are chosen
                if (Array.isArray(req.body.console_selection)) {
                    consolesList = req.body.console_selection;
                    totalConsoles = consolesList.length;
                } else {
                    consolesList.push(req.body.console_selection);
                    totalConsoles = 1;
                }
                context.consolesList = consolesList;

                // Check how many genres chosen
                if (req.body.genre_selection) {                    // If genres chosen
                    if (Array.isArray(req.body.genre_selection)) { // If multiple genres chosen
                        genresList = req.body.genre_selection;
                        totalGenres = genresList.length;
                    } else {                                       // If only one genre chosen
                        genresList.push(req.body.genre_selection);
                        totalGenres = 1;
                    }
                } else {                                            // If no genres are chosen
                    totalGenres = 0;
                }
                context.genresList = genresList;

                // If game doesn't already exist
                if (results.length == 0) {

                    // Insert game into Games
                    inserts = [req.body.game_name, req.body.release_date, req.body.description, req.body.photo];
                    mysql.pool.query("INSERT INTO Games (game_name, release_date, description, photo) VALUES (?, ?, ?, ?)",
                        inserts, function (error, results, fields) {
                            if (error) {
                                res.statusMessage = JSON.stringify(error);
                                res.status(400).end();
                            } else {
                                // Use gameID to start process of adding Consoles_Games and Genres_Games
                                getGameID(req, res, mysql, context, req.body.game_name, complete);
                            }
                        }
                    );
                }

                // Game_name already exists so check Consoles_Games and Genres_Games relationships 
                else {
                    getGameID(req, res, mysql, context, results[0].game_name, complete);
                }
            }
        });
    }

    // Async used after getGameID() is finished
    function complete(res, context, game_name){
        firstCBCount++;
        if(firstCBCount >= totalFirstCB){
            addConsolesGames(res, mysql, context, totalConsoles, totalGenres, game_name, addCGComplete);
        }
    }

    // Async used after addConsolesGames() is finished
    function addCGComplete(res, game_name){
        secondCBCount++;
        if(secondCBCount >= totalConsoles){
            addGenresGames(res, mysql, context, totalGenres, game_name, addGGComplete);
        }
    }

    // Async used after addGenresGames() is finished
    function addGGComplete(res, game_name){
        thirdCBCount++;
        if(thirdCBCount >= totalGenres){
            res.status(200).end();
        }
    }
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
