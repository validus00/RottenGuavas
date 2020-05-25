module.exports = function () {
    var express = require("express");
    var router = express.Router();

    router.get("/", function (req, res) {
        var datetime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
        console.log(datetime, "/logout");
        req.session.loggedin = false;
        req.session.user_ID = null;
        res.redirect("/");
    });

    return router;
}();