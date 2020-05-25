module.exports = function () {
    var express = require("express");
    var router = express.Router();

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

    function getUser(req, res, mysql, context, complete) {
        mysql.pool.query("SELECT * FROM Users WHERE user_ID = ?", req.session.user_ID,
            function (error, results) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                if (results.length == 0) {
                    res.redirect("/");
                } else {
                    context.user_name = results[0].user_name;
                    context.password = results[0].password;
                    context.email = results[0].email;
                    context.photo = results[0].photo;
                    context.pref_console_ID = results[0].pref_console_ID;
                    complete();
                }
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

    router.delete("/deleteReview", function (req, res) {
        if (req.session.loggedin) {
            var mysql = req.app.get("mysql");
            var inserts = [req.query.review_ID, req.session.user_ID];
            mysql.pool.query("DELETE FROM Reviews WHERE review_ID = ? AND user_ID = ?",
                inserts, function (error) {
                    if (error) {
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        res.status(200).end();
                    }
                });
        } else {
            res.status(401).end();
        }
    });

    router.get("/", function (req, res) {
        if (req.session.loggedin) {
            var totalCallBack = 3;
            var callbackCount = 0;
            var context = {};
            var mysql = req.app.get("mysql");
            context.jsscripts = ["profile.js"];
            context.loggedin = true;
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

    router.post("/", function (req, res) {
        var mysql = req.app.get("mysql");
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

    return router;
}();