const { MongoClient } = require('mongodb');

const url = "mongodb://admin:Ka3b0134679@dam2.colexio-karbo.com:57017/hfranz?authSource=admin";

let dbInstance = null;

const dbName = "hfranz";

async function mongoDB() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const client = new MongoClient(url);
        await client.connect();
        console.log('Conectado a MongoDB');
        dbInstance = client.db(dbName);
        return dbInstance;
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

module.exports = { mongoDB };

/*const { MongoClient } = require('mongodb');

const url = "mongodb://localhost:27017";

let dbInstance = null;

const dbName = "hfranz";

async function mongoDB() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        const client = new MongoClient(url);
        await client.connect();
        console.log('Conectado a MongoDB local');
        dbInstance = client.db(dbName);
        return dbInstance;
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

module.exports = { mongoDB };*/