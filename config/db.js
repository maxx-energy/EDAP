import mysql from 'mysql2';
import 'dotenv/config';
import { createTunnel } from 'tunnel-ssh';


// Configuration constants for better readability and maintainability
const tunnelOptions = {
    autoClose: true,
};


const serverOptions = {
    port: 3307, // Local port for MySQL connection through tunnel
};


const sshOptions = {
    host: process.env.SSH_HOST,
    port: 22, // Default SSH port
    username: process.env.SSH_USER,
    password: process.env.SSH_PASSWORD,
};


const forwardOptions = {
    srcAddr: '127.0.0.1', // Local address for MySQL connection
    srcPort: 3307, // Local port
    dstAddr: '127.0.0.1', // Remote address for MySQL
    dstPort: 3306, // Remote MySQL port
};


// Connection pool variable
let db;


// Function to create a MySQL connection pool over SSH tunnel using async/await
const createConnection = async () => {
    try {
        // Create SSH tunnel
        const [server, client] = await createTunnel(
            tunnelOptions,
            serverOptions,
            sshOptions,
            forwardOptions
        );
        console.log('SSH Tunnel established successfully');


        // MySQL connection configuration
        const dbConfig = {
            host: '127.0.0.1', // Local end of the tunnel
            port: 3307, // Local port used by the tunnel
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        };


        // Create MySQL connection pool
        const pool = mysql.createPool(dbConfig);
        db = pool.promise();


        console.log('MySQL pool created successfully');
        return db;
    } catch (error) {
        console.error('SSH Tunnel creation failed:', error.message || error);
        throw new Error('SSH connection error: ' + (error.message || error));
    }
};


// Function to get the database connection (will create it if it doesn't exist)
const getDb = async () => {
    if (!db) {
        console.log('Creating new database connection...');
        await createConnection();
    }
    return db;
};


// Export the connection getter function
export default getDb;