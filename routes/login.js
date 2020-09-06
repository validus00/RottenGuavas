module.exports = function () {
    var express = require("express");
    var router = express.Router();

    router.get("/", function (req, res) {
        var context = {};
        context.jsscripts = ["login.js"];
        res.render("login", context);
    });

    router.post("/", function (req, res) {
        if (!req.body.username || !req.body.password) {
            res.status(400).end();
        } else {
            var mysql = req.app.get("mysql");
            var inserts = [req.body.username, req.body.password];
            var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
            var sql = "SELECT * FROM Users WHERE user_name = ? AND password = ?";
            console.log(datetime, "/login", sql, inserts);
            mysql.pool.query(sql, inserts,
                function (error, results) {
                    if (error) {
                        console.error(datetime, "/login", JSON.stringify(error));
                        res.statusMessage = JSON.stringify(error);
                        res.status(400).end();
                    } else {
                        if (results.length == 0) {
                            console.error(datetime, "/login unauthorized");
                            res.status(401).end();
                        } else {
                            console.log(datetime, "/login success");
                            req.session.loggedin = true;
                            req.session.user_ID = results[0].user_ID;
                            res.status(200).end();
                        }
                    }
                });
        }
    });

    return router;
}();