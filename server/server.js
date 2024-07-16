const express = require('express');
const app = express();
const data = require('./data.json');
const cors = require('cors');

app.use(cors());

app.get('/api/data', (req, res) => {
    res.json(data);
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
