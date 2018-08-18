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

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {userClass} = require('./utils/userClass');

var {mongoose} = require('./db/mongoose');
var {authenticate} = require('./middleware/authenticate');
var {User} = require('./models/user');
var people = new userClass();

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
// app.use(bodyParser.json()); 
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))

// app.use((req, res, next) => {
//     res.render('maintenance.hbs');
// });


// app.use((req, res, next) => {
//     var now = new Date().toString();
//     console.log(`${now} ${req.method} ${req.url}`);
//     next();
// });

app.route('/')
    .get((req, res) => {
        res.render('home.hbs', {
            pageTitle: 'test',
            welcomeMessage: 'Welcome to the ChatApp'
        });
    })
    .post(async (req, res) => {
        var body = _.pick(req.body, ['email', 'password']);
        try{
            if(!validator.isEmail(body.email) || body.password.length < 6){
                
                // pop up here
    
                throw new Error('not email or password too short');      
            }
            var user = await User.findByCredentials(body.email, body.password);
            var token = await user.generateAuthToken();
            console.log('login success!', token);
            // res.header('x-auth', token).redirect('/room.html');
            res.header('x-auth', token).redirect('/room');
        } catch(e){
            console.log(e.message || e);
            res.status(400).redirect('/');
        }
    })

app.route('/signup')
    .get((req, res) => {
        res.render('signup.hbs', {
           pageTitle: 'Sign-up Page',
            welcomeMessage: 'Welcome to my website'
        });
    })
    .post(async (req, res) => {
        var body = _.pick(req.body, ['email', 'username', 'password']);
        var user = new User(body);
        try{
            await user.save();
            var token = await user.generateAuthToken();
            // res.render('room.hbs', { body }, (err, html) => {
            //     res.header('x-auth', token).send(html);
            // });
            res.header('x-auth', token).redirect('/room');
        } catch(e) {
            console.log(e)
            res.status(400).send(e);
        }
    });


app.get('/room', authenticate, (req, res) => {
    var body = {
        username: "123456"
    }
    res.render('room.hbs', { body }, (err, html) => {
        res.send(html);
    });
});

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (params, callback) => {
        if(false){

        }
        socket.join(params.room);
        people.removeUser(socket.id);
        people.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', people.getUserList(params.room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    })

    socket.on('createMessage', (message, callback) => {
        var user = people.getUser(socket.id);
        var receiver = people.getUserID(message.receiver);
        // if (user && isRealString(message.text)) {
        if(user){
          if(!receiver) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
          } else {
            socket.to(receiver).emit('newPrivMessage', generateMessage(user.name, message.text));
        }
      }
        callback();
      });

      socket.on('createLocationMessage', (coords) => {
        var user = people.getUser(socket.id);
    
        if (user) {
          io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));  
        }
      });

    socket.on('disconnect', () => {
        console.log('User away')
        var user = people.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', people.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });
});

server.listen(port, () => {
    console.log(`Started up at port ${port} at ${moment()}`);
})

module.exports = {app};