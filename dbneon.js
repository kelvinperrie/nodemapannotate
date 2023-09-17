const { Pool } = require('pg');
require('dotenv').config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


function SetMapData(mapKey, data, config, completionCallback) {
    console.log("we're in neondb setmapdata")
    const client = pool.connect()
      .then((poolClient) => {
        const values = [mapKey, data, config];
        poolClient.query('update "MapAnnotations" set "Data"=$2, "Config"=$3 where "MapKey"=$1', values)
        .then((queryResult) => {
          console.log(queryResult)
        })  
        .catch((error) => {
          console.log("errorrrrrr running update query!")
          console.log(error);
        });
      })
      .catch((error) => {
        console.log("errorrrrrr connecting to neon!")
        console.log(error);
      });
}

function GetMapData(mapKey, completionCallback) {
  console.log("we're in neondb.js GetMapData")
  const client = pool.connect()
    .then((poolClient) => {
      const values = [mapKey];
      poolClient
        .query('select * from "MapAnnotationsDDDD" where "MapKey"=$1', values)
        .then((queryResult) => {
          console.log(queryResult)
          console.log(queryResult.rows[0])
          completionCallback(queryResult.rows[0])
        })  
        .catch((error) => {
          let errorMessage = "Error running GetMapData select query. " + error;
          console.log(errorMessage)
          console.log(error);
          completionCallback(null, errorMessage);
        });
  })
  .catch((error) => {
    let errorMessage = "Error connecting to neon. " + error;
    console.log(error);
    completionCallback(null, errorMessage);
  });

}

module.exports = { GetMapData, SetMapData };