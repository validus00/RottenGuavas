module.exports = function () {
    var express = require("express");
    var router = express.Router();

    router.get("/", function (req, res) {
        req.session.loggedin = false;
        req.session.user_ID = null;
        res.redirect("/");
    });

    return router;
}();