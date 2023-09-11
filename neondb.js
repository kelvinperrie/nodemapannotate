const { Pool } = require('pg');
require('dotenv').config();

const { DATABASE_URL } = process.env;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


function SetMapData(mapKey, data, completionCallback) {
    console.log("we're in neondb setmapdata")
    console.log("mapKey is "+mapKey)
    console.log("data is "+data)

    const client = pool.connect()
    .then((poolClient) => {
      const values = [mapKey, data];
      poolClient.query('update "MapAnnotations" set "Data"=$2 where "MapKey"=$1', values)
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
    poolClient.query('select * from "MapAnnotations" where "MapKey"=$1', values)
    .then((queryResult) => {
      console.log(queryResult)
      console.log(queryResult.rows[0])
      completionCallback(queryResult.rows[0])
    })  
    .catch((error) => {
      console.log("errorrrrrr running select query!")
      console.log(error);
    });
    

  })
  .catch((error) => {
    console.log("errorrrrrr connecting to neon!")
    console.log(error);
  });

}

module.exports = { GetMapData, SetMapData };