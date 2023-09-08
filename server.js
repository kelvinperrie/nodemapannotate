require('dotenv').config({path: __dirname + '/.env.local'})
const db = require("./db")

var express = require('express');
var app = express();

// Parse URL-encoded bodies (as sent by HTML forms)
//app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// serve our static map page
app.use(express.static('public'));
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.htm" );
})

// app.get('/process_get', function (req, res) {
//    // Prepare output in JSON format
//    response = {
//       first_name:req.query.first_name,
//       last_name:req.query.last_name
//    };
//    console.log(response);
//    res.end(JSON.stringify(response));
// })

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


 app.post('/setMapData', function (req, res) {
    console.log("in setMapData")

    let mapKey = req.body.key;
    let mapData = JSON.stringify(req.body.data);
    //console.log("mapKey is " + mapKey)
    //console.log("mapData is " + mapData)

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