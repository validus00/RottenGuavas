module.exports = function () {
    var express = require("express");
    var router = express.Router();

    function getGamesHelper(res, mysql, context, gamesList, console_name, genresList, searchName, complete, datetime, showAll) {
        var sql = "SELECT Consoles.console_ID, console_name, Games.game_ID, game_name, AVG(rating) AS rating FROM Games"
            + " JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID"
            + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID"
            + " LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID";
        if (searchName) {
            var inserts = [console_name, "%" + searchName + "%"];
            sql += " WHERE console_name = ? AND game_name LIKE ? GROUP BY game_name ORDER BY rating DESC";
            console.log(datetime, "/", sql, inserts);
            mysql.pool.query(sql, inserts, helper);
        } else if (genresList.length > 0) {
            var inserts = [console_name];
            genreStr = "  JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID WHERE console_name = ? AND (genre_ID = ?";
            for (var j = 0; j < genresList.length; j++) {
                inserts.push(genresList[j]);
                if (j + 1 < genresList.length) {
                    genreStr += " OR genre_ID = ?";
                }
            }
            sql = sql + genreStr + ") GROUP BY game_name ORDER BY rating DESC";
            console.log(datetime, "/", sql, inserts);
            mysql.pool.query(sql, inserts, helper);
        } else if (showAll) {
            sql += " WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC";
            console.log(datetime, "/", sql, console_name);
            mysql.pool.query(sql, console_name, helper);
        } else {
            sql = "SELECT Consoles.console_ID, console_name, Games.game_ID, game_name, AVG(rating) AS rating FROM Reviews"
                + " JOIN Games ON Reviews.game_ID = Games.game_ID JOIN Consoles ON Reviews.console_ID = Consoles.console_ID"
                + " WHERE console_name = ? GROUP BY game_name ORDER BY rating DESC";
            console.log(datetime, "/", sql, console_name);
            mysql.pool.query(sql, console_name, helper);
        }

        function helper(error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            var consoleList = [];
            consoleList.games = results;
            consoleList.console_name = console_name;
            for (var k = 0; k < context.consoles.length; k++) {
                if (context.consoles[k].console_name == console_name) {
                    consoleList.console_ID = context.consoles[k].console_ID;
                    break;
                }
            }
            gamesList.push(consoleList);
            complete();
        }
    }

    function getGames(res, mysql, context, complete, consolesList, genresList, searchName, datetime, showAll) {
        var sql = "SELECT console_ID, console_name FROM Consoles ORDER BY console_ID";
        console.log(datetime, "/", sql);
        mysql.pool.query(sql, function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.consoles = results;
            sql = "SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC";
            console.log(datetime, "/", sql);
            mysql.pool.query(sql, function (error, results) {
                if (error) {
                    console.error(datetime, "/", JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.genres = results;
                if (searchName) {
                    sql = "SELECT console_name FROM Consoles JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID"
                        + " JOIN Games ON Consoles_Games.game_ID = Games.game_ID WHERE game_name LIKE ? GROUP BY console_name";
                    console.log(datetime, "/", sql, "%" + searchName + "%");
                    mysql.pool.query(sql, "%" + searchName + "%", helper);
                } else if (genresList.length > 0) {
                    var inserts = [];
                    var genreStr = "SELECT console_name FROM Consoles JOIN Consoles_Games"
                        + " ON Consoles.console_ID = Consoles_Games.console_ID JOIN Games ON Consoles_Games.game_ID = Games.game_ID"
                        + " JOIN Genres_Games ON Games.game_ID = Genres_Games.game_ID"
                        + " WHERE (genre_ID = ?";
                    for (var i = 0; i < genresList.length; i++) {
                        for (var j = 0; j < context.genres.length; j++) {
                            if (genresList[i] == context.genres[j].genre_ID) {
                                context.genres[j].checked = "checked";
                                break;
                            }
                        }
                        inserts.push(genresList[i]);
                        if (i + 1 < genresList.length) {
                            genreStr += " OR genre_ID = ?";
                        }
                    }
                    genreStr += ") GROUP BY console_name";
                    console.log(datetime, "/", genreStr, inserts);
                    mysql.pool.query(genreStr, inserts, helper);
                } else if (showAll) {
                    helper(null, context.consoles);
                } else {
                    sql = "SELECT console_name FROM Consoles JOIN Reviews"
                        + " ON Consoles.console_ID = Reviews.console_ID GROUP BY console_name";
                    console.log(datetime, "/", sql);
                    mysql.pool.query(sql, helper);
                }

                function helper(error, results) {
                    var callbackCount = 0;
                    var gamesList = [];
                    var resultsList = consolesList;
                    if (error) {
                        console.error(datetime, "/", JSON.stringify(error));
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    if (consolesList.length == 0) {
                        resultsList = results;
                    }
                    if (resultsList.length == 0) {
                        complete();
                    } else {
                        for (var i = 0; i < resultsList.length; i++) {
                            if (consolesList.length == 0) {
                                getGamesHelper(res, mysql, context, gamesList, resultsList[i].console_name, genresList, searchName,
                                    interComplete, datetime, showAll);
                            } else {
                                for (var j = 0; j < context.consoles.length; j++) {
                                    if (resultsList[i] == context.consoles[j].console_name) {
                                        context.consoles[j].checked = "checked";
                                        break;
                                    }
                                }
                                getGamesHelper(res, mysql, context, gamesList, resultsList[i], genresList, searchName,
                                    interComplete, datetime, showAll);
                            }
                        }
                    }

                    function interComplete() {
                        callbackCount++;
                        if (callbackCount >= resultsList.length) {
                            gamesList.sort(function (a, b) {
                                return a.console_ID - b.console_ID;
                            });
                            context.gamesList = gamesList;
                            complete();
                        }
                    }
                }
            });
        });
    }

    function addConsole(name, res, mysql, datetime) {
        var sql = "SELECT * FROM Consoles WHERE console_name = ?";
        console.log(datetime, "/", sql, name);
        mysql.pool.query(sql, name, function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else if (results.length == 0) {
                sql = "INSERT INTO Consoles (console_name) VALUES (?)";
                console.log(datetime, "/", sql, name);
                mysql.pool.query(sql, name, function (error) {
                    if (error) {
                        console.error(datetime, "/", JSON.stringify(error));
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        res.statusMessage = "'" + name + "' added";
                        res.status(200).end();
                    }
                });
            } else {
                res.statusMessage = "'" + results[0].console_name + "' already exists";
                res.status(400).end();
            }
        });
    }

    function addGenre(name, res, mysql, datetime) {
        var sql = "SELECT * FROM Genres WHERE genre_name = ?";
        console.log(datetime, "/", sql, name);
        mysql.pool.query(sql, name, function (error, results) {
            if (error) {
                console.error(datetime, "/", JSON.stringify(error));
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else if (results.length == 0) {
                sql = "INSERT INTO Genres (genre_name) VALUES (?)";
                console.log(datetime, "/", sql, name);
                mysql.pool.query(sql, name, function (error) {
                    if (error) {
                        console.error(datetime, "/", JSON.stringify(error));
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        res.statusMessage = "'" + name + "' added";
                        res.status(200).end();
                    }
                });
            } else {
                res.statusMessage = "'" + results[0].genre_name + "' already exists";
                res.status(400).end();
            }
        });
    }

    router.get("/", function (req, res) {
        var totalCallBack = 1;
        var callbackCount = 0;
        var context = {};
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        context.jsscripts = ["home.js"];
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        var mysql = req.app.get("mysql");
        if (req.query.showAll == "True") {
            getGames(res, mysql, context, complete, [], [], null, datetime, true);
            context.showAll = true;
        } else {
            getGames(res, mysql, context, complete, [], [], null, datetime, false);
            context.showTop = true;
        }

        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                res.render("home", context);
            }
        }
    });

    router.post("/", function (req, res) {
        var mysql = req.app.get("mysql");
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        if (req.body.new_console) {
            addConsole(req.body.new_console, res, mysql, datetime);
        } else if (req.body.new_genre) {
            addGenre(req.body.new_genre, res, mysql, datetime);
        } else {
            var totalCallBack = 1;
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["home.js"];
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
            getGames(res, mysql, context, complete, consolesList, genresList, searchName, datetime, true);

            function complete() {
                callbackCount++;
                if (callbackCount >= totalCallBack) {
                    res.render("home", context);
                }
            }
        }
    });

    return router;
}();