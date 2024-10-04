const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const app = express();

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Configurar la URL de MongoDB (IP privada de la VM de la base de datos)
const mongoURL = 'mongodb://172.31.43.70:27017';

// Clase MongoAPI para manejar las operaciones CRUD
class MongoAPI {
    constructor(data) {
        this.client = new MongoClient(mongoURL, { useUnifiedTopology: true });
        this.database = data.database;
        this.collection = data.collection;
        this.data = data;
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db(this.database);
        this.col = this.db.collection(this.collection);
    }

    async read() {
        console.log('Reading All Data');
        const documents = await this.col.find({}).toArray();
        return documents.map(({ _id, ...rest }) => rest); // Omitir el campo _id
    }

    async write(data) {
        console.log('Writing Data');
        const newDocument = data.Document;
        const response = await this.col.insertOne(newDocument);
        return {
            Status: 'Successfully Inserted',
            Document_ID: response.insertedId.toString()
        };
    }

    async update() {
        console.log('Updating Data');
        const filter = this.data.Filter;
        const updatedData = { $set: this.data.DataToBeUpdated };
        const response = await this.col.updateOne(filter, updatedData);
        return {
            Status: response.modifiedCount > 0 ? 'Successfully Updated' : 'Nothing was updated.'
        };
    }

    async delete(data) {
        console.log('Deleting Data');
        const filter = data.Filter;
        const response = await this.col.deleteOne(filter);
        return {
            Status: response.deletedCount > 0 ? 'Successfully Deleted' : 'Document not found.'
        };
    }

    async close() {
        await this.client.close();
    }
}

// Ruta base
app.get('/', (req, res) => {
    res.json({ Status: 'UP' });
});

// Leer documentos (GET)
app.get('/reservas', async (req, res) => {
    const data = req.body;
    if (!data || !data.database || !data.collection) {
        return res.status(400).json({ Error: 'Please provide connection information' });
    }

    const mongoAPI = new MongoAPI(data);
    try {
        await mongoAPI.connect();
        const response = await mongoAPI.read();
        res.status(200).json(response);
    } finally {
        await mongoAPI.close();
    }
});

// Insertar un documento (POST)
app.post('/reservas', async (req, res) => {
    const data = req.body;
    if (!data || !data.Document || !data.database || !data.collection) {
        return res.status(400).json({ Error: 'Please provide valid document and connection information' });
    }

    const mongoAPI = new MongoAPI(data);
    try {
        await mongoAPI.connect();
        const response = await mongoAPI.write(data);
        res.status(200).json(response);
    } finally {
        await mongoAPI.close();
    }
});

// Actualizar un documento (PUT)
app.put('/reservas', async (req, res) => {
    const data = req.body;
    if (!data || !data.Filter || !data.DataToBeUpdated || !data.database || !data.collection) {
        return res.status(400).json({ Error: 'Please provide filter and data to be updated' });
    }

    const mongoAPI = new MongoAPI(data);
    try {
        await mongoAPI.connect();
        const response = await mongoAPI.update();
        res.status(200).json(response);
    } finally {
        await mongoAPI.close();
    }
});

// Eliminar un documento (DELETE)
app.delete('/reservas', async (req, res) => {
    const data = req.body;
    if (!data || !data.Filter || !data.database || !data.collection) {
        return res.status(400).json({ Error: 'Please provide filter for deletion' });
    }

    const mongoAPI = new MongoAPI(data);
    try {
        await mongoAPI.connect();
        const response = await mongoAPI.delete(data);
        res.status(200).json(response);
    } finally {
        await mongoAPI.close();
    }
});

// Iniciar servidor
const PORT = 8911;
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
