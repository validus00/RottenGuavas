/*
    Uses express, dbcon for database connection, body parser to parse form data
    handlebars for HTML templates
*/

var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        inc: function (number) {
            return number + 1;
        },
        toFixed: function (number) {
            return number.toFixed(1);
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);
app.set('mysql', mysql);
app.use('/people_certs', require('./people_certs.js'));
app.use('/people', require('./people.js'));
app.use('/planets', require('./planets.js'));

function getConsoles(res, mysql, context, complete) {
    mysql.pool.query("SELECT console_ID, console_name FROM Consoles", function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.consoles = results;
        complete();
    });
}

function getGenres(res, mysql, context, complete) {
    mysql.pool.query("SELECT genre_ID, genre_name FROM Genres ORDER BY genre_name ASC", function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.genres = results;
        complete();
    });
}

function getGamesHelper(res, mysql, list, id, name, complete) {
    mysql.pool.query("SELECT Games.game_id, game_name, AVG(rating) AS rating FROM Reviews JOIN Games ON "
        + "Reviews.game_ID = Games.game_ID WHERE console_ID = " + id + " GROUP BY game_name ORDER BY rating DESC",
        function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            var object = [];
            object.name = name;

            for (i = 0; i < results.length; i++) {
                var str1 = "/?console_ID=1&game_ID=1";
                results[i].str1 = str1;
            }
            object.games = results;
            list.push(object);
            complete();
        });
}

function getGames(res, mysql, context, complete) {
    var callbackCount = 0;
    mysql.pool.query("SELECT console_ID, console_name FROM Consoles", function (error, results, fields) {
        if (error) {
            res.write(JSON.stringify(error));
            res.end();
        }
        context.consoles = results;

        var list = [];

        for (i = 0; i < results.length; i++) {
            getGamesHelper(res, mysql, list, results[i].console_ID, results[i].console_name, interComplete);
        }

        function interComplete() {
            callbackCount++;
            if (callbackCount >= results.length) {
                context.gamesList = list;
                complete();
            }
        }
    });
}

app.put('/login', function (req, res) {

    console.log("running script");

    var sql = "SELECT * FROM Users WHERE user_name = ? and password = ?";
    var inserts = [req.body.username, req.body.password];
    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
        if (error) {
            console.log(error)
            res.write(JSON.stringify(error));
            res.status(400);
            res.end();
        } else {
            if (results.length == 0) {
                console.log("failure");
                res.status(401).end();
            } else {
                console.log("success");
                res.status(202).end();
            }
        }
    })
});

app.get('/login', function (req, res) {
    var context = {};
    context.jsscripts = ["login.js"];
    res.render('login', context);
});

app.get('/', function (req, res) {
    var callbackCount = 0;
    var context = {};

    getGames(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);

    consoles_list = context.consoles;
    console.log(consoles_list);
    console.log("console:", req.params.console_ID, "game:", req.params.game_ID);

    var str1 = "/?console_ID=1&game_ID=1"
    context.str1 = str1;

    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            console.log(context.gamesList);
            res.render('home', context);
        }
    }
});

app.post('/', function (req, res) {
    var callbackCount = 0;
    var context = {};
    console.log("search was", req.body.search);
    if (req.body.new_console) {
        console.log(req.body.new_console);
    } else {
        console.log("nope");
    }
    if (req.body.console_selection) {
        console.log(req.body.console_selection);
        console.log(req.body.console_selection.length);
        if (req.body.console_selection.length > 1) {
            console.log("longer than 1");
            console.log("first element:", req.body.console_selection[1]);
        } else {
            console.log("no longer than 1");
        }
    } else {
        console.log("no click");
    }
    getGames(res, mysql, context, complete);
    getGenres(res, mysql, context, complete);
    function complete() {
        callbackCount++;
        if (callbackCount >= 2) {
            res.render('home', context);
        }
    }
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
