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
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

// provides a route for getting map data
app.get('/getMapData', function (req, res) {
    let mapKey = req.query.key;

    var completionCallback = function(data) {
        //console.log("in completionCallback")
        //console.log(data)
        // send records as a response
        res.send(data);
    }
    db.GetMapData(mapKey, completionCallback);
})

// provides a route for setting map data
app.post('/setMapData', function (req, res) {
    console.log("in server.js setMapData")

    let mapKey = req.body.key;
    let mapData = JSON.stringify(req.body.data);

    var completionCallback = function(data) {
        //console.log("in completionCallback")
        //console.log(data)
        // send records as a response
        res.send(data);
    }

    db.SetMapData(mapKey, mapData, completionCallback);
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
})