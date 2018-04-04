// for test purpose
require('./config/config')

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const moment = require('moment');
const _ = require('lodash');
const validator = require('validator');
const path = require('path');
const favicon = require('serve-favicon');

var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var {User} = require('./models/user');

const port = process.env.PORT;
const publicPath = path.join(__dirname, '../public');

var app = express();
var server = require ('http').Server(app);
var io =  require('socket.io')(server);

app.set('views', publicPath + '/views');
app.set('view engine', 'hbs');
hbs.registerPartials(publicPath + '/views/partials'); // need full path here
hbs.registerHelper('getCurrentYear', () => {
    return new Date().getFullYear();
});
hbs.registerHelper('screamIt', (text) => {
    return text.toUpperCase();
});

// static serves static files and uses complete path
// public uses index.html prior to get '/'
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))

// app.use((req, res, next) => {
//     res.render('maintenance.hbs');
// });


// app.use((req, res, next) => {
//     var now = new Date().toString();
//     console.log(`${now} ${req.method} ${req.url}`);
//     next();
// });


app.get('/', (req, res) => {
    res.render('home.hbs', {
      pageTitle: 'Home Page',
      welcomeMessage: 'Welcome to my website'
    });
});

app.get('/signup', (req, res) => {
    res.render('signup.hbs', {
      pageTitle: 'Sign-up Page',
      welcomeMessage: 'Welcome to my website'
    });
});

app.post('/signup', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    // console.log(req.body)
    try{
        await user.save();
        var token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
        // res.render('room.hbs');
    } catch(e) {
        console.log(e)
        res.status(400).send(e);
    }
});

app.post('/login', async (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    try{
        if(!validator.isEmail(body.email) || body.password.length < 6){
            
            // pop up here

            throw new Error('not email or password too short');      
        }
        var user = await User.findByCredentials(body.email, body.password);
        var token = await user.generateAuthToken();
        // res.header('x-auth', token).send(user); // ??????????????
        res.render('room.hbs');
    } catch(e){
        console.log(e.message || e);
        res.status(400).redirect('/');
    }
})




io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if(false){

        }

        socket.join(params.room);
        // users.removeUser(socket.id);
        // users.addUser(socket.id, params.name, params.room);

        // io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        // socket.broadcast.to(prams.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    })
});



server.listen(port, () => {
    console.log(`Started up at port ${port} at ${moment()}`);
})

module.exports = {app};