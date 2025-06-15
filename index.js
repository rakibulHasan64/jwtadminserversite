const express = require('express');
const cors = require('cors');

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.KEY_USER}:${process.env.KEY_PASS}@cluster0.y3jqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db("Cars");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("Booking");

  
    app.post("/car", async (req, res) => {
         
      const cars= req.body;
    
      
      const result = await carsCollection.insertOne(cars);
      res.send(result)
      
   });


   // Express.js backend route
app.get("/available-cars", async (req, res) => {
  try {
    const { sortBy, order } = req.query;

    const query = { availability: "Available" };
    let sortQuery = {};

    if (sortBy === "price") {
      sortQuery.price = order === "asc" ? 1 : -1;
    } else if (sortBy === "date") {
      sortQuery.addedDate = order === "asc" ? 1 : -1;
    } else {
      sortQuery.addedDate = -1;
    }

    const cars = await carsCollection.find(query).sort(sortQuery).toArray();
    res.send(cars);
  } catch (error) {
    console.error("Failed to fetch cars:", error);
    res.status(500).send({ error: "Failed to fetch available cars" });
  }
});

  
  
    

   app.get('/caruser/email', async (req, res) => {
    const email = req.query.email;
    const query = { addedBy: email };
    const result = await carsCollection.find(query).toArray();
    res.send(result);
   });
 

   app.get('/cardetlis/:id', async (req, res) => {
     const id = req.params.id;
     const query = { _id: new ObjectId(id) };
      const result = await carsCollection.findOne(query);
     res.send(result);
   });
    
   app.delete('/deletecar/:id', async (req, res) => {
    const id = req.params.id;
    const result = await carsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
   });
 
    
   app.put('/updatecar/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCar = req.body;
  
    delete updatedCar._id; 
  
    const result = await carsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedCar }
    );
    res.send(result);
   });
    
    
    
   app.post("/bookings", async (req, res) => {
    const booking = req.body;
    const result = await bookingsCollection.insertOne(booking);
    res.send(result);
   });
    
   app.get("/mybookinge", async (req, res) => {
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ error: "Email query parameter required" });
    }
    const bookings = await bookingsCollection
      .find({ userEmail: email })
      .toArray();
    res.send(bookings);
  });

  // Cancel booking by ID
  app.put("/bookings/cancel/:id", async (req, res) => {
    const id = req.params.id;
    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Canceled" } }
    );
    res.send(result);
  });

  // Modify booking dates by ID
  app.put("/bookings/modify/:id", async (req, res) => {
    const id = req.params.id;
    const { startDate, endDate, totalCost } = req.body;
    const result = await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { startDate, endDate, totalCost } }
    );
    res.send(result);
  });
  
   app.put("/cars/increment-booking/:id", async (req, res) => {
    const carId = req.params.id;
    const result = await carsCollection.updateOne(
      { _id: new ObjectId(carId) },
      { $inc: { bookingCount: 1 } }
    );
    res.send(result);
   });



  
 


  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}

run();

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
