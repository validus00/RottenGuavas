module.exports = function () {
    var express = require("express");
    var router = express.Router();

    router.get("/", function (req, res) {
        var context = {};
        context.jsscripts = ["login.js"];
        res.render("login", context);
    });

    router.post("/", function (req, res) {
        var mysql = req.app.get("mysql");
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

    return router;
}();