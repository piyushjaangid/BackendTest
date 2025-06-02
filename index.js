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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// Schema and Model
const recordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

const Record = mongoose.model('Record', recordSchema);

// Routes

// Health Check
app.get('/', (req, res) => {
  return res.json({
    status: "success",
    message: "Backend is running and healthy."
  });
});

// Create or Update Record
app.post('/update', async (req, res) => {
  const { id, value } = req.body;

  if (!id || !value) {
    return res.status(400).json({
      status: "error",
      message: "Missing 'id' or 'value' in request body."
    });
  }

  try {
    const existing = await Record.findOne({ id });

    const record = await Record.findOneAndUpdate(
      { id },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      status: "success",
      message: existing ? "Record updated successfully." : "New record created.",
      data: record
    });
  } catch (err) {
    console.error('❌ Error in /update:', err.message);
    return res.status(500).json({
      status: "error",
      message: "Database error while updating record.",
      error: err.message
    });
  }
});

// Get All Records
app.get('/records', async (req, res) => {
  try {
    const allRecords = await Record.find({});
    const formatted = allRecords.reduce((acc, r) => {
      acc[r.id] = r.value;
      return acc;
    }, {});

    return res.json({
      status: "success",
      message: "All records retrieved successfully.",
      count: allRecords.length,
      records: formatted
    });
  } catch (err) {
    console.error('❌ Error in /records:', err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch records.",
      error: err.message
    });
  }
});

// Get a Record by ID
app.get('/record/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Missing record ID in URL."
    });
  }

  try {
    const record = await Record.findOne({ id });
    if (!record) {
      return res.status(404).json({
        status: "not_found",
        message: `No record found for ID: ${id}`
      });
    }

    return res.json({
      status: "success",
      message: "Record found.",
      data: record
    });
  } catch (err) {
    console.error('❌ Error in /record/:id:', err.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch record.",
      error: err.message
    });
  }
});

// Check if Record Exists
app.get('/check/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      status: "error",
      message: "Missing record ID in URL."
    });
  }

  try {
    const record = await Record.findOne({ id });
    if (record) {
      return res.json({
        status: "success",
        exists: true,
        value: record.value
      });
    } else {
      return res.json({
        status: "success",
        exists: false
      });
    }
  } catch (err) {
    console.error('❌ Error in /check/:id:', err.message);
    return res.status(500).json({
      status: "error",
      message: "Error checking record existence.",
      error: err.message
    });
  }
});

// 404 for unmatched routes
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
