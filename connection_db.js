import { MongoClient } from 'mongodb';
// import { join } from 'path';
// eslint-disable-next-line sort-imports
import dotenv from 'dotenv';
dotenv.config();
// const uri = 'mongodb+srv://Sigel:root123456@cluster0.jgccxok.mongodb.net//?retryWrites=true&w=majority';

// const client = new MongoClient(uri, process.env.DATABASE_URL);
const client = new MongoClient(process.env.DATABASE_URL);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri);
// const uri = '';

// Create MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(process.env.DATABASE_URL);


// if (!uri) {
//    console.error('La variable de entorno DATABASE_URL no está configurada.');
//    process.exit(1);}

// const client = new MongoClient(process.env.DATABASE_URL);

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