const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionSuccessStatus: 200,
};

// middleware
app.use(cors(corsOptions));
app.use(express.json());
// ________________________***________________________

// Mongodb's code

// const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzlapl6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    //collections

    const productsList = client.db("rest-api").collection("productsList");

    // Send a ping to confirm a successful connection

    //products get
    // app.get("/productsList", async (req, res) => {
    //   const List = await productsList.find().toArray();
    //   res.send(List);
    // });

    app.get("/productsList", async (req, res) => {
      const { place, sortByPrice, quality } = req.query;

      const pipeline = [];

      // Step 1: Match (filter)
      const matchStage = {};
      if (place) {
        matchStage.deliveryPlace = place;
      }
      if (quality) {
        matchStage.quality = quality;
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Step 2: Sort (if needed)
      if (sortByPrice === "asc") {
        pipeline.push({ $sort: { productPrice: 1 } });
      } else if (sortByPrice === "desc") {
        pipeline.push({ $sort: { productPrice: -1 } });
      }

      try {
        const List = await productsList.aggregate(pipeline).toArray();
        res.send(List);
      } catch (err) {
        console.error("Aggregation error:", err);
        res
          .status(500)
          .send({ error: "Failed to fetch sorted/filtered products" });
      }
    });

    // post

    app.post("/productsList", async (req, res) => {
      const products = req.body;
      console.log("Received Product:", products);
      // DB te insert logic ekhane
      const result = await productsList.insertOne(products);
      res.send(result);
    });
    //____________________________________________________________
    // app.post("/productsList", async (req, res) => {
    //   const productsList = req.body;
    //   const existName = await productsList.findOne({
    //     productName: productsList.productName,
    //   });
    //   if (existName) {
    //     return res.send({ insertedId: null });
    //   }
    //   const result = await productsList.insertOne(productsList);
    //   res.send(result);
    // });
    // g
    //______________________________

    //patch method

    // PATCH: Update specific fields of a product
    app.patch("/productsList/:id", async (req, res) => {
      const { id } = req.params;
      const updateFields = req.body;

      try {
        const result = await productsList.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        if (result.modifiedCount > 0) {
          res.send({ message: "Product updated successfully" });
        } else {
          res
            .status(404)
            .send({ message: "Product not found or nothing changed" });
        }
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // put }{update}

    app.put("/productsList/:id", async (req, res) => {
      const { id } = req.params;
      const updatedProduct = req.body;

      try {
        const result = await productsList.replaceOne(
          { _id: new ObjectId(id) },
          updatedProduct
        );

        if (result.modifiedCount > 0) {
          res.send({ message: "Product fully replaced successfully" });
        } else {
          res.status(404).send({ message: "Product not found or no changes" });
        }
      } catch (error) {
        console.error("PUT update error:", error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // delete

    app.delete("/productsList/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsList.deleteOne(query);
      res.send(result);
    });

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

// basic starting
app.get("/", (req, res) => {
  res.send("In Sha Allah I will be a good BACKEND DEVELOPER.");
});
app.listen(port, () => {
  console.log(`the post number is ${port}`);
});
