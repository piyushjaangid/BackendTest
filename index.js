const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let database = {}; // In-memory store (e.g., { "record1": "some data" })

app.post('/update', (req, res) => {
    const { id, value } = req.body;

    if (!id || !value) {
        return res.status(400).json({ message: "Missing id or value" });
    }

    const isNew = !database[id];
    database[id] = value;

    res.json({
        status: "success",
        message: isNew ? "Record created" : "Record updated",
        data: { id, value }
    });
});

app.get('/check/:id', (req, res) => {
    const id = req.params.id;

    if (database[id]) {
        res.json({ exists: true, value: database[id] });
    } else {
        res.json({ exists: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
