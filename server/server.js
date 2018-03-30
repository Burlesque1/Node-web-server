// for test purpose
require('./config/config')


const express = require('express');




var app = express();

const port = process.env.PORT;

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
})

module.exports = {app};