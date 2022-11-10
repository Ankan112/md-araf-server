const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config()


const port = process.env.PORT || 5000;

//midelware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rjdqp.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}
async function run() {
    try {
        const database = client.db("Md_araf");
        const servicesCollection = database.collection("services");
        const reviewsCollection = database.collection('review');
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20d' })
            // const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { exiresIn: '20d' })
            res.send({ token })
            // console.log(user)
        })
        // get only three services for home page
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query).limit(3)
            const result = await cursor.toArray()
            res.send(result)
        })
        // get services for services page
        app.get('/allservices', async (req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        // get single service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })
        // post method create for service
        app.post('/service', async (req, res) => {
            const service = req.body;
            console.log(service)
            const result = await servicesCollection.insertOne(service)
            res.send(result)
        })
        // get method create for single review
        app.get('/review/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { uid: id }
            const result = await reviewsCollection.find(query).toArray()
            res.send(result)
            // console.log(id)
        })
        // get review with query parameters
        app.get('/review', verifyJWT, async (req, res) => {
            // console.log(req.headers.authorization)
            const decoded = req.decoded;
            console.log('inside', decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'Unauthorized access' })
            }
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await reviewsCollection.find(query).toArray()
            res.send(result)
        })
        // post method for review
        app.post('/review', async (req, res) => {
            const review = req.body;
            console.log(review.uid)
            const result = await reviewsCollection.insertOne(review)
            res.send(result);
        })
        // delete method implement for review delete
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('delete id: ', id)
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })
        // get method create for single review
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.findOne(query)
            res.send(result)
        })
        // update review put method
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