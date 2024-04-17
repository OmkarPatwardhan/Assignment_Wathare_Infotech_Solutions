
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/testdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for MongoDB
const dataSchema = new mongoose.Schema({
  _id: String,
  ts: String,
  machine_status: Number,
  vibration: Number,
}, { collection: 'records' });

const Data = mongoose.model('Data', dataSchema);

// API endpoint to fetch all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await Data.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint for filtered data (hour to hour with specifying starting time)
app.get('/api/data/filter', async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const filteredData = await Data.find({
      ts: { $gte: startTime, $lt: endTime },
    });
    res.json(filteredData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Third-party API integration for location and temperature
app.get('/api/thirdparty/location', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    const locationData = response.data;
    res.json(locationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching location data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
