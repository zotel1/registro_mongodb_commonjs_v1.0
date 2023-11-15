import { MongoClient } from 'mongodb';

import dotenv from 'dotenv';
dotenv.config();
const client = new MongoClient(process.env.DATABASE_URL);


async function connect() {
    let connection = null;
    console.log('Conectando...');

    try {
        connection = await client.connect();
        console.log('🔌 Conectado');
    } catch (error) {
        console.log(error.message);
    }

    return connection;
}

export async function desconnect() {
    try {
        await client.close();
        console.log('🔌 Desconectado');
    } catch (error) {
        console.log(error.message);
    }
}

export async function connectToCollection(collectionName) {
    const connection = await connect();
    const db = connection.db(process.env.DATABASE_NAME);
    const collection = db.collection(collectionName);

    return collection;
}

export async function generateCodigo(collection) {
    const documentMaxCodigo = await collection.find().sort({ codigo: -1 }).limit(1).toArray();
    const maxCodigo = documentMaxCodigo[0]?.codigo ?? 0;

    return maxCodigo + 1;
}
