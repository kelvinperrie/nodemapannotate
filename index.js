require('dotenv').config({path: __dirname + '/.env.local'})

// work out what data layer we're using
let db = require("./dbneon")
if(process.env.DBTYPE=='mssql') {
    db = require("./dbmssql")
}

var express = require('express');
var app = express();

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// serve our static map page
app.use(express.static('public'));
app.get('/map.html', function (req, res) {
    //res.sendFile('map.html', {root: path.join(__dirname, 'public')});
    res.sendFile( __dirname + "/public/map.html" );
})
app.get('/styles/site.css', function (req, res) {
    //res.sendFile('map.html', {root: path.join(__dirname, 'public')});
    res.sendFile( __dirname + "/public/styles/site.css" );
})

// provides a route for getting map data
app.get('/getMapData', function (req, res) {
    let mapKey = req.query.key;
    var completionCallback = function(data, error) {
        if(error) {
            res.status(500).json({success: false, error : error});
        } else {
            res.send(data);
        }
    }
    db.GetMapData(mapKey, completionCallback);
})

// provides a route for setting map data
app.post('/setMapData', function (req, res) {
    let mapKey = req.body.key;
    let mapConfig = JSON.stringify(req.body.config);
    let mapData = JSON.stringify(req.body.data);

    var completionCallback = function(data, error) {
        if(error) {
            res.status(500).json({success: false, error : error});
        } else {
            res.send(data);
        }
    }
    db.SetMapData(mapKey, mapData, mapConfig, completionCallback);
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
})

module.exports = app