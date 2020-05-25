module.exports = function () {
    var express = require("express");
    var router = express.Router();

    function getConsoles(res, mysql, context, complete, datetime) {
        console.log(datetime, "/", "SELECT console_ID, console_name FROM Consoles ORDER BY console_ID");
        mysql.pool.query("SELECT console_ID, console_name FROM Consoles ORDER BY console_ID", function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.consoles = results;
            complete();
        });
    }

    function getGenres(res, mysql, context, complete, datetime) {
        console.log(datetime, "/", "SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC");
        mysql.pool.query("SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC", function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results;
            complete();
        });
    }

    function getGamesHelper(res, mysql, list, name, genresList, searchName, complete, datetime) {
        var sql = "SELECT Consoles.console_ID, console_name, Games.game_ID, game_name, AVG(rating) AS rating FROM Games"
            + " JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID"
            + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID"
            + " LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID";
        if (searchName) {
            var inserts = [name, searchName];
            console.log(datetime, "/", sql + " WHERE console_name = ? AND game_name = ? GROUP BY game_name ORDER BY rating DESC",
                inserts);
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
            console.log(datetime, "/", sql + genreStr + ") GROUP BY game_name ORDER BY rating DESC", inserts);
            mysql.pool.query(sql + genreStr + ") GROUP BY game_name ORDER BY rating DESC", inserts, helper);
        } else {
            console.log(datetime, "/", sql + " WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC", name);
            mysql.pool.query(sql + " WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC", name, helper);
        }

        function helper(error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
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

    function getGames(res, mysql, context, complete, consolesList, genresList, searchName, datetime) {
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
            console.log(datetime, "/", "SELECT Consoles.console_ID, console_name FROM Consoles JOIN Consoles_Games ON Consoles.console_ID ="
                + " Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID WHERE game_name = ?",
                searchName);
            mysql.pool.query("SELECT Consoles.console_ID, console_name FROM Consoles JOIN Consoles_Games ON Consoles.console_ID ="
                + " Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID WHERE game_name = ?",
                searchName, helper);
        } else {
            console.log(datetime, "/", "SELECT Consoles.console_ID, console_name FROM Consoles" + genreStr + " ORDER BY console_ID", inserts);
            mysql.pool.query("SELECT Consoles.console_ID, console_name FROM Consoles" + genreStr + " ORDER BY console_ID", inserts, helper);
        }

        function helper(error, results) {
            var list = [];
            var resultsList = consolesList;
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
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
                    getGamesHelper(res, mysql, list, resultsList[i].console_name, genresList, searchName, interComplete, datetime);
                } else {
                    getGamesHelper(res, mysql, list, resultsList[i], genresList, searchName, interComplete, datetime);
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

    router.get("/", function (req, res) {
        var totalCallBack = 2;
        var callbackCount = 0;
        var context = {};
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        var mysql = req.app.get("mysql");
        getGames(res, mysql, context, complete, [], [], null, datetime);
        getGenres(res, mysql, context, complete, datetime);

        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                sortConsoles(context.consoles, context.gamesList);
                res.render("home", context);
            }
        }
    });

    function addConsole(name, res, mysql, datetime) {
        console.log(datetime, "/", "SELECT * FROM Consoles WHERE console_name = ?", name);
        mysql.pool.query("SELECT * FROM Consoles WHERE console_name = ?", name, function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            if (results.length == 0) {
                console.log(datetime, "/", "INSERT INTO Consoles (console_name) VALUES (?)", name);
                mysql.pool.query("INSERT INTO Consoles (console_name) VALUES (?)", name, function (error) {
                    if (error) {
                        console.error(datetime, "/", JSON.stringify(error));
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

    function addGenre(name, res, mysql, datetime) {
        console.log(datetime, "/", "SELECT * FROM Genres WHERE genre_name = ?", name);
        mysql.pool.query("SELECT * FROM Genres WHERE genre_name = ?", name, function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            if (results.length == 0) {
                console.log(datetime, "/", "INSERT INTO Genres (genre_name) VALUES (?)", name);
                mysql.pool.query("INSERT INTO Genres (genre_name) VALUES (?)", name, function (error) {
                    if (error) {
                        console.error(datetime, "/", JSON.stringify(error));
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

    router.post("/", function (req, res) {
        var mysql = req.app.get("mysql");
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        if (req.body.new_console) {
            addConsole(req.body.new_console, res, mysql, datetime);
        } else if (req.body.new_genre) {
            addGenre(req.body.new_genre, res, mysql, datetime);
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
            getGames(res, mysql, context, complete, consolesList, genresList, searchName, datetime);
            getGenres(res, mysql, context, complete, datetime);
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

    return router;
}();