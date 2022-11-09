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
        const reviewsCollection = database.collection('review');

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
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { uid: id }
            const result = await reviewsCollection.find(query).toArray()
            res.send(result)
            // console.log(id)
        })
        app.get('/review', async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await reviewsCollection.find(query).toArray()
            res.send(result)
        })
        app.post('/review', async (req, res) => {
            const review = req.body;
            console.log(review.uid)
            const result = await reviewsCollection.insertOne(review)
            res.send(result);
        })
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('delete id: ', id)
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.findOne(query)
            res.send(result)
        })
        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const review = req.body
            const option = { upsert: true }
            const updateReview = {
                $set: {
                    name: review.name,
                    description: review.description
                }

            }
            const result = await reviewsCollection.updateOne(filter, updateReview, option)
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