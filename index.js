const express = require('express')
const app = express()
var cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;


const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
app.use(express.json())

const uri = "mongodb+srv://<username>:<password>@cluster0.mahb0di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const productCollection = client.db('prodSnapDB').collection('products');

    app.get("/count", async (req, res) => {
        const count = await productCollection.estimatedDocumentCount();
        res.send({ amount: count });
      });

    app.get("/getCount", async (req, res) => {
        const category = req.query.category;
        const brand = req.query.brand;
        const search = req.query.search || "";
        let priceRange = req.query.priceRange;
        if (priceRange) {
          priceRange = priceRange.split(",").map(Number);
        }
        let query = {
          productName: { $regex: search, $options: "i" },
        };
        if (category) query.category = category;
        if (brand) query.brandName = brand;
        if (priceRange && priceRange.length === 2) {
          query.price = { $gte: priceRange[0], $lte: priceRange[1] };
        }
        const count = await productCollection.countDocuments(query);
        res.send({ count });
    });

    app.get("/products", async (req, res) => {
        const page = parseFloat(req.query.page);
        const size = parseFloat(req.query.size);
        const category = req.query.category;
        const brand = req.query.brand;
        const sortByPrice = req.query.sortByPrice;
        const sortByDate = req.query.sortByDate;
        const search = req.query.search || "";
    
        let priceRange = req.query.priceRange;
        if (priceRange) {
          priceRange = priceRange.split(",").map(Number);
        }
    
        let query = {
          productName: { $regex: search, $options: "i" },
        };
    
        if (category) query.category = category;
        if (brand) query.brandName = brand;
    
        if (priceRange && priceRange.length === 2) {
          query.price = { $gte: priceRange[0], $lte: priceRange[1] };
        }
    
        let options = {};
        if (sortByPrice)
          options = {
            ...options.sort,
            sort: { price: sortByPrice === "L2H" ? 1 : -1 },
          };
        if (sortByDate)
          options = {
            ...options.sort,
            sort: {
              creationDate: sortByDate === "new" ? -1 : 1,
            },
          };
        const result = await productCollection
          .find(query, options)
          .skip(page * size)
          .limit(size)
          .toArray();
        res.send(result);
    });



    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('ProdSnap live')
  })
  
  app.listen(port, () => {
    console.log(`ProdSnap live on port ${port}`)
  })
