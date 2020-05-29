module.exports = function () {
    var express = require("express");
    var router = express.Router();

    function getGameConsoles(res, mysql, context, complete, game_ID, console_ID, datetime) {
        var sql = "SELECT Consoles.console_ID, console_name FROM Consoles"
            + " JOIN Consoles_Games ON Consoles.console_ID = Consoles_Games.console_ID"
            + " JOIN Games ON Consoles_Games.game_ID = Games.game_ID"
            + " WHERE Games.game_ID = ?";
        console.log(datetime, "/games", sql, game_ID);
        mysql.pool.query(sql, game_ID, function (error, results) {
                if (error) {
                    console.error(datetime, "/games", JSON.stringify(error));
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

    function getGameReviews(res, mysql, context, complete, game_ID, console_ID, datetime) {
        var inserts = [game_ID, console_ID];
        var sql = "SELECT user_name, rating, review_date, title, content FROM Reviews"
            + " JOIN Users ON Reviews.user_ID = Users.user_ID WHERE game_ID = ? AND console_ID = ?";
        console.log(datetime, "/games", sql, inserts);
        mysql.pool.query(sql, inserts, function (error, results) {
                if (error) {
                    console.error(datetime, "/games", JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.reviews = results;
                complete();
            });
    }

    function getGameGenres(res, mysql, context, complete, game_ID, datetime) {
        var sql = "SELECT genre_name FROM Genres JOIN Genres_Games ON Genres.genre_ID = Genres_Games.genre_ID"
            + " JOIN Games ON Genres_Games.game_ID = Games.game_ID WHERE Games.game_ID = ?";
        console.log(datetime, "/games", sql, game_ID);
        mysql.pool.query(sql, game_ID, function (error, results) {
                if (error) {
                    console.error(datetime, "/games", JSON.stringify(error));
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

    function getGameInfo(res, mysql, context, complete, game_ID, console_ID, datetime) {
        var inserts = [game_ID, console_ID];
        var sql = "SELECT console_name, Games.game_ID, photo,"
            + " game_name, description, release_date, AVG(rating) AS rating FROM Games"
            + " JOIN Consoles_Games ON Games.game_ID = Consoles_Games.game_ID"
            + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID"
            + " LEFT JOIN Reviews ON Consoles.console_ID = Reviews.console_ID AND Games.game_ID = Reviews.game_ID"
            + " WHERE Games.game_ID = ? AND Consoles.console_id = ?";
        console.log(datetime, "/games", sql, inserts);
        mysql.pool.query(sql, inserts, function (error, results) {
                if (error) {
                    console.error(datetime, "/games", JSON.stringify(error));
                    res.write(JSON.stringify(error));
                    res.end();
                }
                if (results.length == 0) {
                    console.error(datetime, "/games results is empty");
                    res.redirect("/");
                } else {
                    context.console_ID = console_ID;
                    context.console_name = results[0].console_name;
                    context.photo = results[0].photo;
                    context.game_ID = results[0].game_ID;
                    context.game_name = results[0].game_name;
                    context.rating = results[0].rating;
                    context.release_date = results[0].release_date;
                    context.description = results[0].description;
                    complete();
                }
            });
    }

    router.get("/reviewCheck", function (req, res) {
        if (req.session.loggedin) {
            res.status(200).end();
        } else {
            res.status(401).end();
        }
    });

    router.get("/", function (req, res) {
        var totalCallBack = 4;
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["games.js"];
        if (req.session.loggedin) {
            context.loggedin = true;
        }
        var mysql = req.app.get("mysql");
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        getGameInfo(res, mysql, context, complete, req.query.game_ID, req.query.console_ID, datetime);
        getGameGenres(res, mysql, context, complete, req.query.game_ID, datetime);
        getGameConsoles(res, mysql, context, complete, req.query.game_ID, req.query.console_ID, datetime);
        getGameReviews(res, mysql, context, complete, req.query.game_ID, req.query.console_ID, datetime);
        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                res.render("games", context);
            }
        }
    });

    router.delete("/deleteGame", function (req, res) {
        var mysql = req.app.get("mysql");
        var inserts = [req.query.console_ID, req.query.game_ID];
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        var sql = "DELETE FROM Consoles_Games WHERE console_ID = ? AND game_ID = ?";
        console.log(datetime, "/games", sql, inserts);
        mysql.pool.query(sql, inserts, function (error) {
                if (error) {
                    console.error(datetime, "/games", JSON.stringify(error));
                    res.statusMessage = JSON.stringify(error);
                    res.status(400).end();
                } else {
                    res.status(200).end();
                }
            });
    });

    return router;
}();