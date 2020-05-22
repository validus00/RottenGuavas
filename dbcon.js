var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_castanap',
  password        : '8Hp59Pd@$v',
  database        : 'cs340_castanap'
});
module.exports.pool = pool;
