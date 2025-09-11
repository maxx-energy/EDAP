import mysql from 'mysql2';
import 'dotenv/config';

let db;

const createDirectConnection = async () => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        };

        const pool = mysql.createPool(dbConfig);
        db = pool.promise();

        console.log('✅ Direct MySQL connection pool created successfully');
        return db;
    } catch (error) {
        console.error('❌ Direct MySQL connection failed:', error.message || error);
        throw new Error('Database connection error: ' + (error.message || error));
    }
};

const getDb = async () => {
    if (!db) {
        console.log('Creating new database connection...');
        await createDirectConnection();
    }
    return db;
};

export default getDb;
