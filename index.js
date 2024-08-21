const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 8000;


const corsOptions = {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
app.use(express.json());

// const uri =  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mahb0di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mahb0di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    await client.connect();
    console.log("Connected to MongoDB");
    const productCollection = client.db('prodSnap').collection('products');

    app.get("/count", async (req, res) => {
        const count = await productCollection.estimatedDocumentCount();
        res.send({ amount: count });
      });

    // app.get("/getCount", async (req, res) => {
    //     const category = req.query.category;
    //     const brand = req.query.brand;
    //     const search = req.query.search || "";
    //     let priceRange = req.query.priceRange;
    //     if (priceRange) {
    //       priceRange = priceRange.split(",").map(Number);
    //     }
    //     let query = {
    //       productName: { $regex: search, $options: "i" },
    //     };
    //     if (category) query.category = category;
    //     if (brand) query.brandName = brand;
    //     if (priceRange && priceRange.length === 2) {
    //       query.price = { $gte: priceRange[0], $lte: priceRange[1] };
    //     }
    //     const count = await productCollection.countDocuments(query);
    //     res.send({ count });
    // });

    app.get("/getCount", async (req, res) => {
      const category = req.query.category;
      const brand = req.query.brand;
      const search = req.query.search || "";
      let priceRange = req.query.priceRange;
    
      // Handle price range filtering
      if (priceRange && typeof priceRange === 'string') {
        const rangeArray = priceRange.split(',').map(Number);
        
        // Check if the split resulted in two valid numbers
        if (rangeArray.length === 2 && !isNaN(rangeArray[0]) && !isNaN(rangeArray[1])) {
          priceRange = rangeArray;
        } else {
          // If priceRange is not valid, set it to null to avoid filtering by price
          priceRange = null;
        }
      } else {
        priceRange = null;
      }
    
      // Build the query object
      let query = {
        productName: { $regex: search, $options: "i" },
      };
    
      if (category) query.category = category;
      if (brand) query.brandName = brand;
      if (priceRange) {
        query.price = { $gte: priceRange[0], $lte: priceRange[1] };
      }
    
      try {
        const count = await productCollection.countDocuments(query);
        res.send({ count });
      } catch (error) {
        res.status(500).send({ error: "Failed to count documents" });
      }
    });
    

    app.get("/products", async (req, res) => {
      const page = parseFloat(req.query.page) || 0;  // Default to 0 if not provided
      const size = parseFloat(req.query.size) || 10; // Default to 10 if not provided
      const category = req.query.category;
      const brand = req.query.brand;
      const sortByPrice = req.query.sortByPrice;
      const sortByDate = req.query.sortByDate;
      const search = req.query.search || "";
      let priceRange = req.query.priceRange;
    
      // Handle price range filtering
      if (priceRange && typeof priceRange === 'string') {
        const rangeArray = priceRange.split(',').map(Number);
        
        // Check if the split resulted in two valid numbers
        if (rangeArray.length === 2 && !isNaN(rangeArray[0]) && !isNaN(rangeArray[1])) {
          priceRange = rangeArray;
        } else {
          // Handle the case where priceRange is not valid
          priceRange = null;
        }
      } else {
        priceRange = null;
      }
    
      // Build the query object
      let query = {
        productName: { $regex: search, $options: "i" },
      };
    
      if (category) query.category = category;
      if (brand) query.brandName = brand;
      if (priceRange) {
        query.price = { $gte: priceRange[0], $lte: priceRange[1] };
      }
    
      // Build the sort options
      let sortOptions = {};
      if (sortByPrice) {
        sortOptions.price = sortByPrice === "L2H" ? 1 : -1;
      }
      if (sortByDate) {
        sortOptions.creationDate = sortByDate === "new" ? -1 : 1;
      }
    
      try {
        const result = await productCollection
          .find(query)
          .sort(sortOptions)  // Apply sorting options
          .skip(page * size)   // Skip for pagination
          .limit(size)         // Limit for pagination
          .toArray();
    
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to fetch products' });
      }
    });
    

    // app.get("/products", async (req, res) => {
    //     const page = parseFloat(req.query.page);
    //     const size = parseFloat(req.query.size);
    //     const category = req.query.category;
    //     const brand = req.query.brand;
    //     const sortByPrice = req.query.sortByPrice;
    //     const sortByDate = req.query.sortByDate;
    //     const search = req.query.search || "";
    //     let priceRange = req.query.priceRange;

    //     if (priceRange && typeof priceRange === 'string') {
    //       const rangeArray = priceRange.split(',').map(Number);
        
    //       // Check if the split resulted in two valid numbers
    //       if (rangeArray.length === 2 && !isNaN(rangeArray[0]) && !isNaN(rangeArray[1])) {
    //         priceRange = rangeArray;
    //       } else {
    //         // Handle the case where priceRange is not valid
    //         priceRange = null; // or set to a default value like [0, Infinity]
    //       }
    //     } else {
    //       priceRange = null; // or handle when priceRange is not provided
    //     }
    
    //     let query = {
    //       productName: { $regex: search, $options: "i" },
    //     };
    
    //     if (category) query.category = category;
    //     if (brand) query.brandName = brand;
    
    //     if (priceRange && priceRange.length === 2) {
    //       query.price = { $gte: priceRange[0], $lte: priceRange[1] };
    //     }
    
    //     let options = {};
    //     if (sortByPrice) {
    //         options.price = sortByPrice === "L2H" ? 1 : -1;
    //     }
    //     if (sortByDate) {
    //         options.creationDate = sortByDate === "new" ? -1 : 1;
    //     }
    //     const result = await productCollection
    //       .find(query, options)
    //       .skip(page * size)
    //       .limit(size)
    //       .toArray();
    //     res.send(result);
    // });



    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
