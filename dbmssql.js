const config = {
    user: process.env['DB_USER'],
    password: process.env['DB_PASS'],
    server: process.env['DB_HOST'],
    database: process.env['DB_DATABASE'],
    port: 1433,
    options: {
        trustedconnection: true,
        trustServerCertificate: true
    },
}
function SetMapData(mapKey, data, config, completionCallback) {
    console.log("we're in setmapdata")
    console.log("mapKey is "+mapKey)
    console.log("data is "+data)
    var sql = require("mssql");

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        var request = new sql.Request();
           

        request.input('data', sql.VarChar, data)
        request.input('mapKey', sql.VarChar, mapKey)
        request.input('config', sql.VarChar, config)
        // use params in the query to avoid sql injection attacks
        request.query("update MapAnnotations set Data=@data, Config=@config where mapKey=@mapKey")
        .then((data) => {
            console.log("i just updated the MapAnnotations for " + mapKey)
            //console.log(data);
            completionCallback(null);
          })
          .catch((error) => {
            let errorMessage = "Error running SetMapData update query. " + error;
            completionCallback(null, errorMessage);
          })

    });
}

function GetMapData(mapKey, completionCallback) {
    var sql = require("mssql");

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        request.input('mapKey', sql.VarChar, mapKey)

        request.query('select top 1 * from MapAnnotations where mapKey=@mapKey')
          .then((data) => {
            // only return the first record, otherwise it goes back as an array with a single item in it
            completionCallback(data.recordset[0])
          })
          .catch((error) => {
            let errorMessage = "Error running GetMapData select query. " + error;
            completionCallback(null, errorMessage);
          })
    });

}

module.exports = { GetMapData, SetMapData };