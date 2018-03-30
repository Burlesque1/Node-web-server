// for test purpose
require('./config/config')


const express = require('express');
const hbs = require('hbs')




var app = express();

const port = process.env.PORT;

app.use((req, res, next) => {
    var now = new Date().toString();
    console.log(`${now} ${req.method} ${req.url}`);
    next();
})

app.use((req, res, next) => {
    res.render('maintenance.hbs')})

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => {
    console.log(`Started up at port ${port}`);
})

module.exports = {app};