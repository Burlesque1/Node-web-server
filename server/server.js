// for test purpose
require('./config/config')


const express = require('express');
const hbs = require('hbs')

const port = process.env.PORT;

var app = express();
console.log(__dirname)
hbs.registerPartials('C:\\Users\\Omelet\\Desktop\\Node\\R8\\views\\partials');
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});
app.set('view engine', 'hbs');


// views should be put in the same dir with node_modules
// app.use((req, res, next) => {
//     res.render('maintenance.hbs');
// });

// static serves static files and uses complete path
// public should include pages except index.html
app.use(express.static(__dirname + '/public'))

app.use((req, res, next) => {
    var now = new Date().toString();
    console.log(`${now} ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.render('home.hbs', {
      pageTitle: 'Home Page',
      welcomeMessage: 'Welcome to my website'
    });
});

app.post('/user', (req, res) => {
    console.log(req);
    res.render('loginpage.hbs');
})
app.listen(port, () => {
    console.log(`Started up at port ${port}`);
})

module.exports = {app};