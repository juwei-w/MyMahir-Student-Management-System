const mysql = require( 'mysql2/promise' );
require ('dotenv').config();

// Create Connection using environment variables
const database = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test Connection
( async () => {
  try {
    const connection = await database.getConnection();
    console.log( 'Connected to MySQL database!' );
    connection.release();
  } catch ( err ) {
    console.error( 'Database connection failed:', err.message );
  }
})();

module.exports = database;
