const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jx4ehei.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const airbnbCollection = client.db("airbnb").collection("airbnbInfo");

        app.get('/categories', async (req, res) => {
            const cursor = airbnbCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/categories/:category', async (req, res) => {
            const category = req.params.category;

            let query = {};

            if (category !== "room") {
                query = { category: category }
            }

            const options = {
                projection: {
                    category: 1,
                    hostName: 1,
                    img: 1,
                    destination: 1,
                    price: {
                        $toDouble: "$price"
                    },
                    time: 1,
                    rating: 1,
                }
            }


            const result = await airbnbCollection.find(query, options).toArray();
            res.send(result);
        })



        // Send a ping to confirm a successful connection

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally { }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Airbnb server is running')
})

app.listen(port, () => {
    console.log(`Airbnb server Server is running on port ${port}`);
})