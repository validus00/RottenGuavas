module.exports = function () {
    var express = require("express");
    var router = express.Router();

    router.get("/", function (req, res) {
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

    router.post("/", function (req, res) {
        var inserts = [req.body.console_ID, req.body.game_ID, req.body.title, req.body.rating, req.body.content];
        var date = new Date();
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        var mysql = req.app.get("mysql");
        inserts.push(date);
        inserts.push(req.session.user_ID);
        console.log(datetime, "/addReview", "INSERT INTO Reviews (console_ID, game_ID, title, rating, content, review_date, user_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
            inserts);
        mysql.pool.query("INSERT INTO Reviews (console_ID, game_ID, title, rating, content, review_date, user_ID) VALUES (?, ?, ?, ?, ?, ?, ?)",
            inserts, function (error) {
                if (error) {
                    console.error(datetime, "/addReview", JSON.stringify(error));
                    res.statusMessage = JSON.stringify(error);
                    res.status(400).end();
                } else {
                    res.status(200).end();
                }
            });
    });

    return router;
}();