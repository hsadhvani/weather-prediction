/**
 *
 * Main server file
 */
// dependencies
var express = require('express');
var db = require('./server/db_access.js');
var bodyParser = require('body-parser')

var app = express();
var jsonParser = bodyParser.json()
var listenPort = process.env.PORT || 3000;
// start server on port 3000
app.listen(listenPort, function () {
    console.log("Server listening on port " + listenPort);
});

// allow access to static content in public folder
app.use(express.static(__dirname + '/public'));


// responses with unique stations
app.get('/stations', function (req, res) {
    db.access_db('SELECT distinct STATION_NAME from weather_table where LATITUDE!="unknown" OR LONGITUDE!="unknown"', function (output) {
        var actualOutput = [];
        if (output !== undefined) {
            for (var i = 0; i < output.length; i++) {
                actualOutput.push(output[i]['STATION_NAME']);
            }
        }
        // json response
        res.json(actualOutput)

    });
});


// load data for particular month
app.post('/station/:month/', jsonParser, function (req, res) {
// do some averaging here
    // perform query to find avg of attribute for that month
    db.access_db('SELECT avg(' + req.body.attribute + ') as AVG, STATION_NAME, MONTH, LATITUDE, LONGITUDE from weather_table where  MONTH="' + req.params.month + '" and (LATITUDE!="unknown" OR LONGITUDE!="unknown") group by STATION_NAME;', function (output) {
        res.json(output);
    });
});

// load data for particular month and station

app.post('/station/:month/:station_name/', jsonParser, function (req, res) {
    // perform query to find avg of attribute for that month and station

    db.access_db('SELECT avg(' + req.body.attribute + ') as AVG, STATION_NAME, MONTH, LATITUDE, LONGITUDE  from weather_table where  STATION_NAME="' + req.params.station_name +
        '" and MONTH="' + req.params.month + '" group by STATION_NAME;'
        , function (output) {
            res.json(output);

        });
});
// load data for classification
app.post('/classify/:month/:station_name', jsonParser,function (req, res) {
    // get latitude, longitude and elevation from table
    db.access_db('SELECT distinct STATION_NAME, LATITUDE, LONGITUDE, ELEVATION  from weather_table where  STATION_NAME="' + req.params.station_name +
        '" and MONTH="' + req.params.month + '" group by STATION_NAME;'
        , function (output) {
            if (output.length > 0) {
                var elevation = output[0]['ELEVATION'];
                var lat = output[0]['LATITUDE'];
                var long= output[0]['LONGITUDE'];
                var month=req.params.month;

                var sys = require('sys');
                var exec = require('child_process').exec;
                // compile and execute java code
                exec("javac -classpath .:weka.jar ClassifyWeather.java", function (error, stdout, stderr) {
                 var execCommand=   "java -classpath .:weka.jar ClassifyWeather "+req.body.attribute+" "+elevation+" "+ lat+" "+long + " "+ month;
                    exec(execCommand, function (error1, stdout1, stderr1) {
                        res.json({output: stdout1});
                        // return output to user
                        if (error !== null) {
                            console.log('exec error: ' + error);

                        }
                    });

                });


            }

        });


});
