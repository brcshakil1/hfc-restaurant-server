// import
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// parsers
app.use(express());
app.use(cors());

// mongoDB
// mongo v-5.5
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ufgx0zu.mongodb.net/?retryWrites=true&w=majority`;
// mongo v-2.2
// const uri = `mongodb://<username>:<password>@ac-scj1kyz-shard-00-00.ufgx0zu.mongodb.net:27017,ac-scj1kyz-shard-00-01.ufgx0zu.mongodb.net:27017,ac-scj1kyz-shard-00-02.ufgx0zu.mongodb.net:27017/?ssl=true&replicaSet=atlas-ts3tkk-shard-0&authSource=admin&retryWrites=true&w=majority`
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allDishedCollection = client
      .db("hfcRestaurantDB")
      .collection("allDishes");

    // get all dishes
    // filtering by category
    // api: /api/v1/all-dishes?category=burgers

    //sorting by price
    // api: /api/v1/all-dishes?sortField=price&sortOrder=asc

    app.get("/api/v1/all-dishes", async (req, res) => {
      // filter
      let queryObj = {};
      const category = req.query.category;
      if (category) {
        queryObj.category = category;
      }

      // sorting
      let sortObj = {};
      const sortField = req.query.sortField;
      const sortOrder = req.query.sortOrder;
      if (sortField && sortOrder) {
        sortObj = { sortField, sortOrder };
      }

      console.log(sortField, sortOrder);

      const cursor = allDishedCollection.find(queryObj).sort(sortField);
      const result = await cursor.toArray();

      // count dishes
      const totalDished = await allDishedCollection.estimatedDocumentCount();
      res.send({ totalDished, result });
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("HFC Restaurant' server is running...");
});

app.listen(port, () => {
  console.log(`HFC Restaurant' server is listening on port: ${port}`);
});
