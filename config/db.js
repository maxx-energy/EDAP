import fs from 'fs';
import mysql from 'mysql2';
import 'dotenv/config';
import { createTunnel } from 'tunnel-ssh';

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Running in ${isProduction ? 'production' : 'development'} mode`);

// Connection pool variable
let db;

// Function to create a MySQL connection pool over SSH tunnel using async/await for development
const createTunnelConnection = async () => {
    try {
        console.log('Private Key Path:', process.env.SSH_PRIVATE_KEY_PATH); // Check if the path is correct
        const sshPrivateKey = fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH); // Load the private key

        const tunnelOptions = {
            autoClose: true,
        };

        const serverOptions = {
            port: 3307, // Local port for MySQL connection through tunnel
        };

        const sshOptions = {
            host: process.env.SSH_HOST,
            port: 22,
            username: process.env.SSH_USER,
            privateKey: sshPrivateKey,
        };

        const forwardOptions = {
            srcAddr: '127.0.0.1', // Local address for MySQL connection
            srcPort: 3307, // Local port
            dstAddr: '127.0.0.1', // Remote address for MySQL
            dstPort: 3306, // Remote MySQL port
        };

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

        console.log('MySQL pool created successfully through SSH tunnel');
        return db;
    } catch (error) {
        console.error('SSH Tunnel creation failed:', error.message || error);
        throw new Error('SSH connection error: ' + (error.message || error));
    }
};

// Function to create a direct MySQL connection for production
const createDirectConnection = async () => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || '127.0.0.1', // Usually localhost in production
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

        console.log('Direct MySQL connection pool created successfully');
        return db;
    } catch (error) {
        console.error('Direct MySQL connection failed:', error.message || error);
        throw new Error('Database connection error: ' + (error.message || error));
    }
};

// Function to get the database connection (will create it if it doesn't exist)
const getDb = async () => {
    if (!db) {
        console.log('Creating new database connection...');
        if (isProduction) {
            // In production, use direct connection
            await createDirectConnection(); // Add await here
        } else {
            // In development, use SSH tunnel
            await createTunnelConnection();
        }
    }
    return db;
};

// Export the connection getter function
export default getDb;
