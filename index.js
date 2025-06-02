// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Schema and Model
const recordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

const Record = mongoose.model('Record', recordSchema);

// Routes

// Health check
app.get('/', (req, res) => {
  res.send('Backend is running with MongoDB.');
});

// Create or update record
app.post('/update', async (req, res) => {
  const { id, value } = req.body;

  if (!id || !value) {
    return res.status(400).json({
      status: "error",
      message: "Missing 'id' or 'value'"
    });
  }

  try {
    const updated = await Record.findOneAndUpdate(
      { id },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      status: "success",
      message: "Record created or updated",
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message
    });
  }
});

// Check record
app.get('/check/:id', async (req, res) => {
  try {
    const record = await Record.findOne({ id: req.params.id });
    if (record) {
      res.json({ exists: true, value: record.value });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error checking record",
      error: error.message
    });
  }
});

// Get all records
app.get('/records', async (req, res) => {
  try {
    const records = await Record.find({});
    const formatted = {};
    records.forEach(r => formatted[r.id] = r.value);
    res.json({ status: "success", records: formatted });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch records",
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
