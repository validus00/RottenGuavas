module.exports = function () {
    var express = require("express");
    var router = express.Router();

    function getConsoles(res, mysql, context, complete, datetime) {
        var sql = "SELECT console_ID, console_name FROM Consoles ORDER BY console_ID";
        console.log(datetime, "/addGame", sql);
        mysql.pool.query(sql, function (error, results) {
            if (error) {
                console.error(datetime, "/addGame", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.consoles = results;
            complete();
        });
    }

    function getGenres(res, mysql, context, complete, datetime) {
        var sql = "SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC";
        console.log(datetime, "/addGame", sql);
        mysql.pool.query(sql, function (error, results) {
            if (error) {
                console.error(datetime, "/addGame", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.genres = results;
            complete();
        });
    }

    router.get("/", function (req, res) {
        var totalCallBack = 2;
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get("mysql");
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

        context.jsscripts = ["addGame.js"];

        if (req.session.loggedin) {
            context.loggedin = true;
        }

        getConsoles(res, mysql, context, complete, datetime);
        getGenres(res, mysql, context, complete, datetime);

        function complete() {
            callbackCount++;
            if (callbackCount >= totalCallBack) {
                res.render("addGame", context);
            }
        }
    });

    // Function to get game_ID based on game_name
    function getGameID(req, res, mysql, context, game_name, complete, datetime) {
        var sql = "SELECT game_ID FROM Games WHERE game_name = ?";
        console.log(datetime, "/addGame", sql, game_name);
        mysql.pool.query(sql, game_name, function (error, results, fields) {
            if (error) {
                console.error(datetime, "/addGame", JSON.stringify(error));
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else if (results.length == 0) {
                console.error(datetime, "/addGame results is empty");
                res.status(400).end();
            } else {
                context.game_ID = results[0].game_ID;
                complete(res, context, game_name);
            }
        });
    }

    // Checks if Consoles_Games relationship already exists. Inserts relationship if it doesn't already exist.
    function addConsolesGames(res, mysql, context, totalConsoles, totalGenres, game_name, complete, datetime) {

        // If no Consoles, go back to complete
        if (totalConsoles <= 0) {
            complete(res, game_name);
        }

        var inserts = [];

        // Go through each console to add
        for (var i = 0; i < totalConsoles; i++) {
            inserts = [context.consolesList[i], context.game_ID];
            findRelationship(inserts);
        }

        // See if Consoles_Games relationship already exists
        function findRelationship(inserts) {
            var sql = "SELECT console_name FROM Consoles_Games "
                + " JOIN Consoles ON Consoles_Games.console_ID = Consoles.console_ID "
                + " WHERE Consoles_Games.console_ID = ? AND game_ID = ?";
            console.log(datetime, "/addGame", sql, inserts);
            mysql.pool.query(sql, inserts, function (err, results, fields) {

                    if (err) {
                        console.error(datetime, "/addGame", JSON.stringify(error));
                        res.status(400).end();
                    }
                    // Relationship doesn't exist so insert Consoles_Games relationship
                    else if (results.length == 0) {
                        // Get console_name
                        sql = "SELECT console_name FROM Consoles where console_ID = ?";
                        console.log(datetime, "/addGame", sql, inserts[0]);
                        mysql.pool.query(sql, inserts[0], function (err, results, fields) {
                            if (err) {
                                console.error(datetime, "/addGame", JSON.stringify(error));
                                res.status(400).end();
                            } else if (results.length == 0) {
                                console.error(datetime, "/addGame results is empty");
                                res.status(400).end();
                            } else {
                                res.statusMessage += "Console '" + results[0].console_name + "' for '" + game_name + "' added." + "\\n";
                                addRelationship(inserts);
                            }
                        });
                    }
                    else {
                        res.statusMessage += "Console '" + results[0].console_name + "' for '" + game_name + "' already exists." + "\\n";
                        addRelationship([]);
                    }
                });

        }

        // Add Consoles_Games relationship
        function addRelationship(inserts) {
            if (inserts.length > 0) {
                sql = "INSERT INTO Consoles_Games(console_ID, game_ID) VALUES (?, ?)";
                console.log(datetime, "/addGame", sql, inserts);
                mysql.pool.query(sql, inserts, function (error, results, fields) {
                    if (error) {
                        console.error(datetime, "/addGame", JSON.stringify(error));
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        complete(res, game_name);
                    }
                });
            }
            else {
                complete(res, game_name);
            }
        }
    }

    // Checks if Genres_Games relationship already exists. Inserts relationship if it doesn't already exist.
    function addGenresGames(res, mysql, context, totalGenres, game_name, complete, datetime) {

        // If no Genres, go back to complete
        if (totalGenres <= 0) {
            complete(res, game_name);
        }

        var inserts = [];

        // Go through each Genre to add
        for (var i = 0; i < totalGenres; i++) {
            inserts = [context.genresList[i], context.game_ID];
            findRelationship(inserts);
        }

        // See if Consoles_Games relationship already exists
        function findRelationship(inserts) {
            var sql = "SELECT genre_name FROM Genres_Games "
                + " JOIN Genres ON Genres_Games.genre_ID = Genres.genre_ID "
                + " WHERE Genres_Games.genre_ID = ? AND game_ID = ?";
            console.log(datetime, "/addGame", sql, inserts);
            mysql.pool.query(sql, inserts, function (err, results, fields) {

                    if (err) {
                        console.error(datetime, "/addGame", JSON.stringify(error));
                        res.status(400).end();
                    }
                    // Relationship doesn't exist so insert Genre_Games relationship
                    else if (results.length == 0) {
                        // Get genre_name
                        sql = "SELECT genre_name FROM Genres where genre_ID = ?";
                        console.log(datetime, "/addGame", sql, inserts[0]);
                        mysql.pool.query(sql, inserts[0], function (err, results, fields) {
                            if (err) {
                                console.error(datetime, "/addGame", JSON.stringify(error));
                                res.status(400).end();
                            } else if (results.length == 0) {
                                console.error(datetime, "/addGame results is empty");
                                res.status(400).end();
                            } else {
                                res.statusMessage += "Genre '" + results[0].genre_name + "' for '" + game_name + "' added." + "\\n";
                                addRelationship(inserts);
                            }
                        });
                    }
                    else {
                        res.statusMessage += "Genre '" + results[0].genre_name + "' for '" + game_name + "' already exists." + "\\n";
                        addRelationship([]);
                    }
                });

        }

        // Add Consoles_Games relationship
        function addRelationship(inserts) {
            if (inserts.length > 0) {
                sql = "INSERT INTO Genres_Games(genre_ID, game_ID) VALUES (?, ?)";
                console.log(datetime, "/addGame", sql, inserts);
                mysql.pool.query(sql, inserts, function (error, results, fields) {
                    if (error) {
                        console.error(datetime, "/addGame", JSON.stringify(error));
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        complete(res, game_name);
                    }
                });
            }
            else {
                complete(res, game_name);
            }
        }
    }

    // Post route to add a game or add new consoles_games and/or genres_games relationships
    router.post("/", function (req, res) {
        if (!req.body.game_name || !req.body.release_date) {
            res.status(400).end();
        } else {
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

            // // If no console(s) chosen, send error
            // if (!req.body.console_selection) {
            //     res.statusMessage += "Console choice(s) required.";
            //     res.status(400).end();
            // }

            // Consoles are chosen so we can continue adding a game
            // else {
            var mysql = req.app.get("mysql");
            var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

            // See if game_name already exists in the database
            var inserts = [req.body.game_name];

            // To get proper game_name stored in database
            var sql = "SELECT game_name FROM Games WHERE game_name = ?";
            console.log(datetime, "/addGame", sql, inserts);
            mysql.pool.query(sql, inserts, function (error, results, fields) {

                if (error) {
                    console.error(datetime, "/addGame", JSON.stringify(error));
                    res.statusMessage = JSON.stringify(error);
                    res.status(400).end();
                }
                else {

                    // Check how many consoles are chosen
                    if (req.body.console_selection) {
                        if (Array.isArray(req.body.console_selection)) {
                            consolesList = req.body.console_selection;
                            totalConsoles = consolesList.length;
                        }
                        else {
                            consolesList.push(req.body.console_selection);
                            totalConsoles = 1;
                        }
                    }
                    else {
                        totalConsoles = 0;
                    }
                    context.consolesList = consolesList;

                    // Check how many genres chosen
                    if (req.body.genre_selection) {                    // If genres chosen
                        if (Array.isArray(req.body.genre_selection)) { // If multiple genres chosen
                            genresList = req.body.genre_selection;
                            totalGenres = genresList.length;
                        }
                        else {                                       // If only one genre chosen
                            genresList.push(req.body.genre_selection);
                            totalGenres = 1;
                        }
                    }
                    else {                                            // If no genres are chosen
                        totalGenres = 0;
                    }
                    context.genresList = genresList;

                    // If game doesn't already exist
                    if (results.length == 0) {

                        // Insert game into Games
                        inserts = [req.body.game_name, req.body.release_date, req.body.description, req.body.photo];
                        sql = "INSERT INTO Games (game_name, release_date, description, photo) VALUES (?, ?, ?, ?)";
                        console.log(datetime, "/addGame", sql, inserts);
                        mysql.pool.query(sql, inserts, function (error, results, fields) {

                            if (error) {
                                console.error(datetime, "/addGame", JSON.stringify(error));
                                res.statusMessage = JSON.stringify(error);
                                res.status(400).end();
                            }
                            else {
                                res.statusMessage += "Game '" + req.body.game_name + "' added.\\n";
                                // Use gameID to start process of adding Consoles_Games and Genres_Games
                                getGameID(req, res, mysql, context, req.body.game_name, complete);
                            }
                        }
                        );
                    }

                    // Game_name already exists so check Consoles_Games and Genres_Games relationships 
                    else {
                        res.statusMessage += "Game '" + results[0].game_name + "' already exists.\\n";
                        getGameID(req, res, mysql, context, results[0].game_name, complete, datetime);
                    }
                }
            });
            // }

            // Async used after getGameID() is finished
            function complete(res, context, game_name) {
                firstCBCount++;
                if (firstCBCount >= totalFirstCB) {
                    addConsolesGames(res, mysql, context, totalConsoles, totalGenres, game_name, addCGComplete, datetime);
                }
            }

            // Async used after addConsolesGames() is finished
            function addCGComplete(res, game_name) {
                secondCBCount++;
                if (secondCBCount >= totalConsoles) {
                    addGenresGames(res, mysql, context, totalGenres, game_name, addGGComplete, datetime);
                }
            }

            // Async used after addGenresGames() is finished
            function addGGComplete(res, game_name) {
                thirdCBCount++;
                if (thirdCBCount >= totalGenres) {
                    res.status(200).end();
                }
            }
        }
    });

    return router;
}();