////////////////////////////
// My SQL request
////////////////////////////

function mySQLtest() {
  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host    : '13.58.121.166',
    user    : process.env.MYSQL_USER,
    password: process.env.MYSQL_PSSWD,
    database: 'pedro_bot'  
  });

  connection.connect();

  connection.query('INSERT INTO prueba_01 VALUES ("Yo soy el bot escribiendo, mua ja ja");'
                   , function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
  });

  connection.end();
}



////////////////////////////
// Export functions and variables
////////////////////////////

exports.mySQLtest  = () => mySQLtest(); 
