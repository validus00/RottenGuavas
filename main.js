/*
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
    helpers: {
        inc: function (number) {
            return number + 1;
        },
        toFixed: function (number) {
            return number.toFixed(1);
        },
        freshOrNot: function (number) {
            if (number >= 5) {
                return "<img src='https://image.flaticon.com/icons/svg/2045/2045020.svg' width=25>Fresh!";
            } else {
                return "Not!";
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
app.use('/people_certs', require('./people_certs.js'));
app.use('/people', require('./people.js'));
app.use('/planets', require('./planets.js'));

function getConsoles(res, mysql, context, complete) {
    mysql.pool.query("SELECT console_name FROM Consoles", function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.consoles = results;
        complete();
    });
}

function getGenres(res, mysql, context, complete) {
    mysql.pool.query("SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC", function (error, results, fields) {
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
        mysql.pool.query(sql + " WHERE console_name = '" + name + "' AND game_name = ? GROUP BY game_name ORDER BY rating DESC",
            searchName, helper);
    } else if (genresList.length > 0) {
        genreStr = "' AND (genre_ID = ";
        for (j = 0; j < genresList.length; j++) {
            genreStr += genresList[j];
            if (j + 1 < genresList.length) {
                genreStr += " OR genre_ID = ";
            }
        }
        mysql.pool.query(sql + " JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID WHERE console_name = '" + name
            + genreStr + ") GROUP BY game_name ORDER BY rating DESC", helper);
    } else {
        mysql.pool.query(sql + " WHERE console_name = '" + name + "' GROUP BY game_name ORDER BY rating DESC", helper);
    }

    function helper(error, results, fields) {
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

function getGames(res, mysql, context, complete, gamesList, genresList, searchName) {
    var callbackCount = 0;
    genreStr = "";
    if (genresList.length > 0) {
        genreStr = " JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID"
            + " JOIN Games ON Consoles_Games.game_ID = Games.game_ID"
            + " JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID"
            + " WHERE (genre_ID = ";
        for (i = 0; i < genresList.length; i++) {
            genreStr += genresList[i];
            if (i + 1 < genresList.length) {
                genreStr += " OR genre_ID = ";
            }
        }
        genreStr += ") GROUP BY console_name";
    }
    if (searchName) {
        mysql.pool.query("SELECT console_name FROM Consoles JOIN Consoles_Games ON Consoles.console_ID ="
            + " Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID WHERE game_name = ?",
            searchName, helper);
    } else {
        mysql.pool.query("SELECT console_name FROM Consoles" + genreStr, helper);
    }

    function helper(error, results, fields) {
        var list = [];
        var resultsList = gamesList;
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        if (!searchName && genresList.length == 0) {
            context.consoles = results;
        }
        if (gamesList.length == 0) {
            resultsList = results;
        }
        if (resultsList.length == 0) {
            interComplete();
        }
        for (i = 0; i < resultsList.length; i++) {
            if (gamesList.length == 0) {
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

app.get("/", function (req, res) {
    var totalCallBack = 2;
    var callbackCount = 0;
    var context = {};
    if (req.session.loggedin) {
        context.loggedin = true;
    }
    getGames(res, mysql, context, complete, [], [], null);
    getGenres(res, mysql, context, complete);
    consoles_list = context.consoles;
    function complete() {
        callbackCount++;
        if (callbackCount >= totalCallBack) {
            res.render("home", context);
        }
    }
});

function addConsole(name, res) {
    var inserts = [name];
    mysql.pool.query("INSERT INTO Consoles (console_name) VALUES (?)", inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        res.redirect("/");
    });
}

function addGenre(name, res) {
    var inserts = [name];
    mysql.pool.query("INSERT INTO Genres (genre_name) VALUES (?)", inserts, function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        res.redirect("/");
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
        var gamesList = [];
        var genresList = [];
        if (req.body.console_selection) {
            if (Array.isArray(req.body.console_selection)) {
                gamesList = req.body.console_selection;
            } else {
                gamesList.push(req.body.console_selection);
            }
        }
        if (req.body.genre_selection) {
            if (Array.isArray(req.body.genre_selection)) {
                genresList = req.body.genre_selection;
            } else {
                genresList.push(req.body.genre_selection);
            }
        }
        getGames(res, mysql, context, complete, gamesList, genresList, searchName);
        getGenres(res, mysql, context, complete);
        if (searchName || genresList.length > 0) {
            totalCallBack++;
            getConsoles(res, mysql, context, complete);
        }
        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                res.render("home", context);
            }
        }
    }
});

app.put("/loginProcess", function (req, res) {
    var inserts = [req.body.username, req.body.password];
    mysql.pool.query("SELECT * FROM Users WHERE user_name = ? AND password = ?", inserts,
        function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
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
        })
});

app.get("/login", function (req, res) {
    var context = {};
    context.jsscripts = ["login.js"];
    res.render("login", context);
});

app.post("/login", function (req, res) {
    res.redirect("/");
})

app.get("/logout", function (req, res) {
    req.session.loggedin = false;
    req.session.user_ID = null;
    res.redirect("/");
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
