const express = require('express');
const { connectToCollection, desconnect, generateCodigo } = require('../connection_db.js');

const server = express();

const messageNotFound = JSON.stringify({ message: 'El código no corresponde a un mueble registrado' });
const messageMissingData = JSON.stringify({ message: 'Faltan datos relevantes' });
const messageErrorServer = JSON.stringify({ message: 'Se generado un error en el server' });

// Middlewares
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Obtener todos registros de los muebles disponibles (metodo GET): Ruta GET http://127.0.0.1:3005/api/v1/muebles
server.get('/api/v1/muebles', async (req, res) => {
    const { categoria, precio_gte, precio_lte } = req.query;
    let muebles = [];

    try {
        const collection = await connectToCollection('muebles');

        if (categoria) muebles = await collection.find({ categoria }).sort({ nombre: 1}).toArray();
        else if (precio_gte) muebles = await collection.find({ precio: { $gte: Number(precio_gte) } }).sort({ precio: 1 }).toArray();
        else if (precio_lte) muebles = await collection.find({ precio: { $lte: Number(precio_lte) } }).sort({ precio: -1 }).toArray();

        else muebles = await collection.find().toArray();

        res.status(200).send(JSON.stringify({ payload: muebles }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});


// Obtener un registro de un mueble en específico (metodo GET): Ruta GET http://127.0.0.1:3005/api/v1/muebles/1
server.get('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });

        if (!mueble) return res.status(400).send(messageNotFound);

        res.status(200).send(JSON.stringify({ payload: mueble }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

// Crea un nuevo registro de mueble (metodo POST): Ruta POST http://127.0.0.1:3005/api/v1/muebles
server.post('/api/v1/muebles', async (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (!nombre && !precio && !categoria) return res.status(400).send(messageMissingData);

    try {
        const collection = await connectToCollection('muebles');
        const mueble = { codigo: await generateCodigo(collection), nombre, precio, categoria };

        await collection.insertOne(mueble);
        res.status(201).send(JSON.stringify({ message: 'Registro creado', payload: mueble }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

// Actualizar el registro de un mueble en específico (METODO put): Ruta PUT http://127.0.0.1:3005/api/v1/muebles/1
server.put('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { nombre, precio, categoria } = req.body;

    if (!nombre || !precio || !categoria) return res.status(400).send(messageMissingData);

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });

        if (!mueble) return res.status(400).send(messageNotFound);
        mueble = { nombre, precio, categoria };

        await collection.updateOne({ codigo: Number(codigo) }, { $set: mueble });
        return res.status(200).send(JSON.stringify({ message: 'Registro actualizado', payload: { codigo, ...mueble } }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

// Eliminar el registro de un mueble en específico (metodo DELETE): Ruta DELETE http://127.0.0.1:3005/api/v1/muebles/1
server.delete('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;


    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: { $eq: Number(codigo) } });


        if (!mueble) return res.status(400).send(messageNotFound);

        await collection.deleteOne({ codigo: { $eq: Number(codigo) } });
        res.status(200).send(JSON.stringify({ message: 'Registro eliminado', payload: { codigo, ...mueble } }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send(messageErrorServer);
    } finally {
        await desconnect();
    }
});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de solicitudes
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/api/v1/muebles`);
});