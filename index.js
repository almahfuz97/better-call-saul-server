// dependencies
const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
require('dotenv').config();

// middle ware
app.use(cors());
app.use(express.json());


const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    const servicesCollection = client.db('better-call-saul').collection('services');

    // return only 3 services
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

}
run().catch(console.dir)


app.listen(process.env.PORT, () => {
    console.log('Server running on', process.env.PORT)
})