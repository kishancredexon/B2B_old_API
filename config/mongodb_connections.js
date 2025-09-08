const mongoose = require('mongoose');

const connections = {}; // To store dynamic connections

const connectToDatabase = async (dbName, uri) => {
    if (!connections[dbName]) {
        const connection = mongoose.createConnection(uri, {
            user: process.env.mongousr, pass: process.env.mongopass,
            dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        connections[dbName] = new Promise((resolve, reject) => {
            connection.on('connected', () => {
                console.log(`Connected to database: ${dbName}`);
                resolve(connection);
            });

            connection.on('error', (err) => {
                console.error(`Connection error on database ${dbName}:`, err);
                reject(err);
            });
        });
    }

    return connections[dbName];
};

let getObjectID = function (ID) {
    return mongoose.Types.ObjectId(ID);
}

const connectWithMasterDb = async () => {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = 'credexon_master';

    try {
        return await connectToDatabase(dbName, `${uri}`);
    } catch (err) {
        console.error('Failed to connect to the master database:', err);
    }
};

const connectWithGeneralDb = async () => {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = 'credexon_general';

    try {
        return await connectToDatabase(dbName, `${uri}`);
    } catch (err) {
        console.error('Failed to connect to the general database:', err);
    }
};

const connectWithCricketDb = async () => {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = 'credexon_cricket';

    try {
        return await connectToDatabase(dbName, `${uri}`);
    } catch (err) {
        console.error('Failed to connect to the cricket database:', err);
    }
};

const connectWithFootballDb = async () => {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = 'credexon_football';

    try {
        return await connectToDatabase(dbName, `${uri}`);
    } catch (err) {
        console.error('Failed to connect to the football database:', err);
    }
};

const connectWithVendorDb = async (dbKey) => {
    const uri = process.env.MONGODB_CONNECTION_STRING;
    const dbName = `credexon_vendor_${dbKey}`;

    try {
        return await connectToDatabase(dbName, `${uri}`);
    } catch (err) {
        console.error('Failed to connect to the vendor database:', err);
    }
};

module.exports = {
    connectToDatabase,
    connectWithMasterDb,
    connectWithGeneralDb,
    connectWithCricketDb,
    connectWithFootballDb,
    connectWithVendorDb,
    getObjectID
};
