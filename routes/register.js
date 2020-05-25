module.exports = function () {
    var express = require("express");
    var router = express.Router();

    function getConsoles(res, mysql, context, complete, datetime) {
        console.log(datetime, "/register", "SELECT console_ID, console_name FROM Consoles ORDER BY console_ID");
        mysql.pool.query("SELECT console_ID, console_name FROM Consoles ORDER BY console_ID", function (error, results) {
            if (error) {
                console.error(datetime, "/register", JSON.stringify(error));
                res.write(JSON.stringify(error));
                res.end();
            }
            context.consoles = results;
            complete();
        });
    }

    router.get("/", function (req, res) {
        var totalCallBack = 1;
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get("mysql");
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        context.jsscripts = ["register.js"];

        getConsoles(res, mysql, context, complete, datetime);

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

    router.post("/", function (req, res) {
        var mysql = req.app.get("mysql");
        var inserts = [req.body.username];
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        console.log(datetime, "/register", "SELECT * FROM Users WHERE user_name = ?", inserts);
        mysql.pool.query("SELECT * FROM Users WHERE user_name = ?", inserts, function (error, results) {
            if (error) {
                console.error(datetime, "/register", JSON.stringify(error));
                res.statusMessage = JSON.stringify(error);
                res.status(400).end();
            } else {
                if (results.length == 0) {
                    if (req.body.console == "") {
                        req.body.console = null;
                    }
                    inserts = [req.body.username, req.body.password, req.body.email, req.body.console, req.body.photo];
                    console.log(datetime, "/register", "INSERT INTO Users (user_name, password, email, pref_console_ID, photo) VALUES (?, ?, ?, ?, ?)",
                        inserts);
                    mysql.pool.query("INSERT INTO Users (user_name, password, email, pref_console_ID, photo) VALUES (?, ?, ?, ?, ?)",
                        inserts, function (error) {
                            if (error) {
                                console.error(datetime, "/register", JSON.stringify(error));
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