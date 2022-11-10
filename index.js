// dependencies
const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const { query } = require('express');
require('dotenv').config();

// middle ware
app.use(cors());
app.use(express.json());


const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const servicesCollection = client.db('better-call-saul').collection('services');

    // send only 3 services
    app.get('/home', async (req, res) => {
        // sort descendingly
        const option = {
            sort: {
                "createdAt": -1
            }
        }
        const cursor = servicesCollection.find({}, option);
        const services = await cursor.limit(3).toArray();
        console.log(services)
        res.send(services);
    })

    // send all services 
    app.get('/services', async (req, res) => {
        // sort descendingly
        const option = {
            sort: {
                "createdAt": -1
            }
        }
        const cursor = servicesCollection.find({}, option);
        const services = await cursor.toArray();
        console.log(services)
        res.send(services);
    })

    // send 1 service 
    const reviewCollection = client.db('better-call-saul').collection('reviews');

    app.get('/service/:id', async (req, res) => {
        const serviceId = req.params.id;
        console.log(serviceId);
        const query = { _id: ObjectId(serviceId) };
        const service = await servicesCollection.findOne(query);

        // find all reviews of that service
        const reviewQuery = { serviceId: serviceId }
        const option = {
            sort:
            {
                "createdAt": -1
            }
        }
        const cursor = reviewCollection.find(reviewQuery, option)
        const reviews = await cursor.toArray();
        const totalReviews = reviews.length;

        console.log(reviews)
        res.send({ service, reviews, totalReviews });
    })

    // post reviews
    app.post('/review/service/:id', async (req, res) => {
        const reviewData = req.body;
        console.log(reviewData);
        const result = await reviewCollection.insertOne(reviewData);

        // find all revie of that service to send again to client
        // service review
        const serviceId = req.params.id;
        const query = { serviceId }
        const option = {
            sort:
            {
                "createdAt": -1
            }
        }
        const cursor = reviewCollection.find(query, option)
        const reviews = await cursor.toArray();
        console.log('here rev', reviews, result)
        res.send({ result, reviews });
    })

    // my reviews
    app.get('/myreviews', async (req, res) => {
        const email = req.query.email;
        const query = { email }
        const option = {
            sort: {
                "createdAt": -1
            }
        }
        const cursor = reviewCollection.find(query, option);
        const myreviews = await cursor.toArray();
        res.send(myreviews);
    })

    // delete a review
    app.delete('/delete/:id', async (req, res) => {
        const reviewId = req.params.id;
        const query = { _id: ObjectId(reviewId) };
        // delete
        const result = await reviewCollection.deleteOne(query);

        // find all new reviews
        const option = {
            sort: {
                "createdAt": -1
            }
        }
        const email = req.query.email;
        const cursor = reviewCollection.find({ email }, option)
        const reviews = await cursor.toArray();

        res.send({ result, reviews });
    })

    // update a review
    app.patch('/update/:id', async (req, res) => {
        const reviewId = req.params.id;
        const filter = { _id: ObjectId(reviewId) };
        const body = req.body;
        console.log(body)
        const updatedDoc = {
            $set: {
                ...body,
            }
        }
        const result = await reviewCollection.updateOne(filter, updatedDoc);
        res.send({ result })
    })
}
run().catch(console.dir)


app.listen(process.env.PORT, () => {
    console.log('Server running on', process.env.PORT)
})