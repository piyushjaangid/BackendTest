const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let database = {}; // In-memory key-value store

// Health Check
app.get('/', (req, res) => {
  res.send('Backend is running.');
});

// Update or Create Record
app.post('/update', (req, res) => {
  try {
    const { id, value } = req.body;

    if (!id || !value) {
      return res.status(400).json({
        status: "error",
        message: "Missing 'id' or 'value' in request body"
      });
    }

    const isNew = !database[id];
    database[id] = value;

    return res.json({
      status: "success",
      message: isNew ? "Record created" : "Record updated",
      data: { id, value }
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
});

// Check if Record Exists
app.get('/check/:id', (req, res) => {
  try {
    const id = req.params.id;

    if (database[id]) {
      return res.json({
        exists: true,
        value: database[id]
      });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error checking record",
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
