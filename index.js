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

        const airbnbCollection = client.db("airbnbDB").collection("airbnbInfo");

        app.get('/categories', async (req, res) => {
            const cursor = airbnbCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/categories/:category', async (req, res) => {
            const category = req.params?.category;

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

        app.get('/categories/:continent', async (req, res) => {
            const continent = req.params?.continent;

            let query = {};

            if (continent === undefined) {
                return;
            }
            else {
                query = { continent: continent }
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
                    continent: 1
                }
            }


            const result = await airbnbCollection.find(query, options).toArray();
            res.send(result);
        })

        app.get('/filter', async (req, res) => {
            const { type, priceRange, bedrooms, beds, bathrooms, propertyType } = req.query;
            console.log(type, priceRange, bedrooms, beds, bathrooms, propertyType);
            let filter = {};

            if (type && type !== 'any') {
                filter.type = type;
            }

            if (priceRange) {
                const [minPrice, maxPrice] = priceRange.split('-');
                filter.price = {
                    $gte: parseInt(minPrice),
                    $lte: parseInt(maxPrice)
                };
            }

            if (bedrooms && bedrooms !== 'any') {
                filter.bedrooms = parseInt(bedrooms);
            }

            if (beds && beds !== 'any') {
                filter.beds = parseInt(beds);
            }

            if (bathrooms && bathrooms !== 'any') {
                filter.bathrooms = parseInt(bathrooms);
            }

            if (propertyType && propertyType !== 'any') {
                filter.propertyType = propertyType;
            }

            const result = await airbnbCollection.find(filter).toArray();
            const count = result.length;
            console.log("count", count);

            if (result.length === 0) {
                res.send({ count: 0, matchingData: result });
            }
            else {
                res.send({ count: result.length, matchingData: result });
            }

            console.log(result);
        })


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