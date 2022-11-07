// dependencies
const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();

// middle ware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server running')
})
app.listen(process.env.PORT, () => {
    console.log('Server running on', process.env.PORT)
})