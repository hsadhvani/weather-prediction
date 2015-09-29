/**
 * File allowing database access
 */
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'db4free.net',
    user     : 'cleaning',
    password : 'abc123',
    database : 'weather'
});

// functions exported

module.exports = {

    // queries database
    access_db : function(query,callback){
        console.log("Query called : " + query);



        connection.connect(function(err) {
            if (err) {
                return;
            }

        });

        connection.query(query, function(err, rows) {
            // result sent in callback function
            callback(rows);
        });

    }

};