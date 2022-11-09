const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config()

const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rjdqp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const database = client.db("Md_araf");
        const servicesCollection = database.collection("services");

        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query).limit(3)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })
        app.post('/service', async (req, res) => {
            const service = req.body;
            console.log(service)
            const result = await servicesCollection.insertOne(service)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log('Listening port on the', port)
})