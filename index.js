const express = require('express');
const app = express();
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 7000;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('service'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y5kfv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("service");
  const reviewCollection = client.db("creativeAgency").collection("review");
  const orderCollection = client.db("creativeAgency").collection("order");
  const adminCollection = client.db("creativeAgency").collection("admin");

  // Add Review
  app.post('/addReview', (req, res) => {
    const review = req.body;
    // console.log(review);
    reviewCollection.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  // Review List
  app.get('/reviewList', (req, res) => {
    reviewCollection.find({})
      .toArray((error, document) => {
        res.send(document);
      })
  })

  // Add Order
  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const projectTitle = req.body.projectTitle;
    const projectDetails = req.body.projectDetails;
    const price = req.body.price;
    const status = req.body.status;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    console.log(file, name, email, projectTitle, projectDetails, price, status);

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    orderCollection.insertOne({ name, email, projectTitle, projectDetails, price, status, image})
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })

  // Order Card
  app.post('/orderCard', (req, res) => {
    const email = req.body.email;
    orderCollection.find({email: email})
      .toArray((error, document) => {
        res.send(document);
      })
  })
  
  // Order List For Admin
  app.get('/fullOrderList', (req, res) => {
    orderCollection.find({})
      .toArray((error, document) => {
        res.send(document);
      })
  })

  // Add Service by admin
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const details = req.body.details;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    // console.log(file, title, details);
    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    serviceCollection.insertOne({ title, details, image})
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })

  // Service List
  app.get('/service', (req, res) => {
    serviceCollection.find({})
      .toArray((error, document) => {
        res.send(document);
      })
  })

  // Add Admin
  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    // console.log(review);
    adminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // Admin List
  app.get('/admin', (req, res) => {
    adminCollection.find({})
      .toArray((error, document) => {
        res.send(document);
      })
  })
  // Check Admin
  app.post('/isAdmin', (req, res)=>{
    const email = req.body.email;
    adminCollection.find({email: email})
    .toArray((error, admin)=>{
      res.send(admin.length > 0)
    })
  })

});

app.get('/', (req, res) => {
  res.send('Welcome to Creative Agency Back End')
})

app.listen(PORT);